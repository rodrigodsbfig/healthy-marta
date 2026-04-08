import { query, mutation } from '../_generated/server'
import { v } from 'convex/values'

// Simple keyword-based categorisation
function categorise(name: string): string {
  const n = name.toLowerCase()
  if (/chicken|beef|salmon|tuna|shrimp|pork|lamb|turkey|egg/.test(n)) return 'Protein'
  if (/milk|cheese|yogurt|butter|cream|feta|mozzarella/.test(n)) return 'Dairy & Eggs'
  if (/tomato|lettuce|spinach|kale|pepper|onion|garlic|broccoli|asparagus|carrot|cucumber|zucchini|mushroom|avocado|lemon|lime|berry|berries|apple|banana|mango|fruit|vegetable/.test(n)) return 'Produce'
  if (/rice|pasta|quinoa|oat|bread|flour|lentil|bean|chickpea|noodle/.test(n)) return 'Grains & Legumes'
  if (/oil|salt|pepper|spice|herb|sauce|vinegar|sugar|honey|soy|mustard|mayo|ketchup/.test(n)) return 'Pantry'
  return 'Other'
}

export const getByWeek = query({
  args: { weekStart: v.string() },
  handler: async (ctx, { weekStart }) => {
    return await ctx.db
      .query('shoppingLists')
      .filter(q => q.eq(q.field('weekStart'), weekStart))
      .first()
  },
})

export const generateFromPlan = mutation({
  args: { weekStart: v.string() },
  handler: async (ctx, { weekStart }) => {
    // Get the meal plan for this week
    const plan = await ctx.db
      .query('mealPlans')
      .filter(q => q.eq(q.field('weekStart'), weekStart))
      .first()

    // Accumulate ingredients: key = "name||unit"
    const merged: Record<string, { name: string; quantity: number; unit: string }> = {}

    if (plan) {
      for (const slot of plan.slots) {
        const recipe = await ctx.db.get(slot.recipeId)
        if (!recipe) continue
        const scale = slot.servings / recipe.servings
        for (const ing of recipe.ingredients) {
          const key = `${ing.name.toLowerCase()}||${ing.unit}`
          if (merged[key]) {
            merged[key].quantity += ing.quantity * scale
          } else {
            merged[key] = { name: ing.name, quantity: ing.quantity * scale, unit: ing.unit }
          }
        }
      }
    }

    const items = Object.values(merged).map(i => ({
      name: i.name,
      quantity: Math.round(i.quantity * 10) / 10,
      unit: i.unit,
      category: categorise(i.name),
      checked: false,
      manual: false,
    }))

    // Upsert the shopping list
    const existing = await ctx.db
      .query('shoppingLists')
      .filter(q => q.eq(q.field('weekStart'), weekStart))
      .first()

    if (existing) {
      // Keep manual items, replace generated ones
      const manualItems = existing.items.filter(i => i.manual)
      await ctx.db.patch(existing._id, { items: [...items, ...manualItems] })
      return existing._id
    } else {
      return await ctx.db.insert('shoppingLists', { weekStart, items })
    }
  },
})

export const toggleItem = mutation({
  args: {
    weekStart: v.string(),
    index: v.number(),
  },
  handler: async (ctx, { weekStart, index }) => {
    const list = await ctx.db
      .query('shoppingLists')
      .filter(q => q.eq(q.field('weekStart'), weekStart))
      .first()
    if (!list) return
    const items = [...list.items]
    items[index] = { ...items[index], checked: !items[index].checked }
    await ctx.db.patch(list._id, { items })
  },
})

export const addManualItem = mutation({
  args: {
    weekStart: v.string(),
    name: v.string(),
    quantity: v.number(),
    unit: v.string(),
  },
  handler: async (ctx, { weekStart, name, quantity, unit }) => {
    const item = {
      name,
      quantity,
      unit,
      category: categorise(name),
      checked: false,
      manual: true,
    }

    const existing = await ctx.db
      .query('shoppingLists')
      .filter(q => q.eq(q.field('weekStart'), weekStart))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, { items: [...existing.items, item] })
    } else {
      await ctx.db.insert('shoppingLists', { weekStart, items: [item] })
    }
  },
})

export const removeItem = mutation({
  args: {
    weekStart: v.string(),
    index: v.number(),
  },
  handler: async (ctx, { weekStart, index }) => {
    const list = await ctx.db
      .query('shoppingLists')
      .filter(q => q.eq(q.field('weekStart'), weekStart))
      .first()
    if (!list) return
    const items = list.items.filter((_, i) => i !== index)
    await ctx.db.patch(list._id, { items })
  },
})
