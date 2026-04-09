import { query, mutation } from '../_generated/server'
import { v } from 'convex/values'

function categorise(name: string): string {
  const n = name.toLowerCase()
  if (/chicken|beef|salmon|tuna|shrimp|pork|lamb|turkey|egg/.test(n)) return 'Protein'
  if (/milk|cheese|yogurt|butter|cream|feta|mozzarella/.test(n)) return 'Dairy'
  if (/tomato|lettuce|spinach|kale|pepper|onion|garlic|broccoli|asparagus|carrot|cucumber|zucchini|mushroom|avocado|lemon|lime|berry|apple|banana/.test(n)) return 'Produce'
  if (/rice|pasta|quinoa|oat|bread|flour|lentil|bean|chickpea|noodle/.test(n)) return 'Grains'
  if (/oil|salt|pepper|spice|herb|sauce|vinegar|sugar|honey|soy|mustard/.test(n)) return 'Pantry'
  return 'Other'
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('pantryItems').order('asc').take(200)
  },
})

export const addItem = mutation({
  args: {
    name: v.string(),
    quantity: v.number(),
    unit: v.string(),
  },
  handler: async (ctx, { name, quantity, unit }) => {
    await ctx.db.insert('pantryItems', {
      name,
      quantity,
      unit,
      category: categorise(name),
    })
  },
})

export const removeItem = mutation({
  args: { id: v.id('pantryItems') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})
