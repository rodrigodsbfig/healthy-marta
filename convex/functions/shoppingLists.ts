import { query, mutation } from '../_generated/server'
import { v } from 'convex/values'
import { categorise } from '../lib/aisles'
import { equivalentOption, amountFor, type MealMoment } from '../lib/plan'

/**
 * Seasonings measured to taste carry no useful quantity. Summing them across
 * a week produces nonsense like "7 q.b. sal e pimenta", so they are listed
 * once without a number.
 */
const UNQUANTIFIABLE_UNITS = new Set(['q.b.', 'pitada', 'pitadas'])

/** Things the plan counts as food but nobody puts in a shopping basket. */
const NOT_SHOPPING = /^(água|agua|water)$/i

/**
 * Singular/plural units describe the same thing. Recipes naturally write
 * "1 dente" and "2 dentes" of garlic, which would otherwise split one
 * ingredient into two lines on the list.
 */
function normaliseUnit(unit: string): string {
  const u = unit.trim().toLowerCase()
  if (u === 'g' || u === 'ml' || u === 'kg' || u === 'l') return u
  return u.replace(/s$/, '')
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
    const plan = await ctx.db
      .query('mealPlans')
      .filter(q => q.eq(q.field('weekStart'), weekStart))
      .first()

    // Accumulate ingredients: key = "name||unit"
    const merged: Record<string, { name: string; quantity: number; unit: string; toTaste: boolean }> = {}

    function add(name: string, quantity: number, unit: string) {
      if (NOT_SHOPPING.test(name.trim())) return
      const toTaste = UNQUANTIFIABLE_UNITS.has(unit)
      const key = `${name.toLowerCase()}||${normaliseUnit(unit)}`
      if (merged[key]) {
        if (!toTaste) merged[key].quantity += quantity
      } else {
        merged[key] = { name, quantity, unit, toTaste }
      }
    }

    if (plan) {
      for (const slot of plan.slots) {
        const recipe = await ctx.db.get(slot.recipeId)
        if (!recipe) continue
        const scale = slot.servings / recipe.servings

        for (const ing of recipe.ingredients) {
          // A dish stores its quantities at its primary moment. Served at
          // another moment the plan prescribes a different portion (90g arroz
          // at almoço, 60g at jantar), so re-resolve from the plan whenever the
          // ingredient is linked to a plan option.
          let quantity = ing.quantity
          if (ing.optionId) {
            const option = equivalentOption(ing.optionId, slot.meal as MealMoment)
            if (option) {
              const amt = amountFor(option, { comSopa: recipe.comSopa ?? false })
              if (amt.grams !== undefined) quantity = amt.grams
              else if (amt.ml !== undefined) quantity = amt.ml
            }
          }
          add(ing.name, quantity * scale, ing.unit)
        }
      }
    }

    // Weekly staples — bought regardless of what is planned. Skip any the
    // recipes already cover: a staple carries no unit, so "pão escuro" from
    // the staples list would not merge with "230g pão escuro" from the week
    // and she would see the same item twice.
    const alreadyListed = new Set(Object.values(merged).map(i => i.name.toLowerCase()))
    const kept = await ctx.db.query('pantryItems').collect()
    for (const s of kept) {
      if (!s.alwaysBuy) continue
      if (alreadyListed.has(s.name.toLowerCase())) continue
      add(s.name, s.quantity ?? 1, s.unit ?? '')
    }

    const items = Object.values(merged).map(i => ({
      name: i.name,
      // To-taste seasonings get 0 so the UI can show the name alone.
      quantity: i.toTaste ? 0 : Math.round(i.quantity * 10) / 10,
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
