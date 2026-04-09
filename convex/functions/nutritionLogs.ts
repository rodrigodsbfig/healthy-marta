import { query, mutation } from '../_generated/server'
import { v } from 'convex/values'

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    return await ctx.db
      .query('nutritionLogs')
      .withIndex('by_date', q => q.eq('date', date))
      .first()
  },
})

export const logMeal = mutation({
  args: {
    date: v.string(),
    entry: v.object({
      recipeId: v.optional(v.id('recipes')),
      label: v.string(),
      servings: v.number(),
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fat: v.number(),
    }),
  },
  handler: async (ctx, { date, entry }) => {
    const existing = await ctx.db
      .query('nutritionLogs')
      .withIndex('by_date', q => q.eq('date', date))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        entries: [...existing.entries, entry],
      })
    } else {
      await ctx.db.insert('nutritionLogs', {
        date,
        entries: [entry],
      })
    }
  },
})

export const removeEntry = mutation({
  args: {
    date: v.string(),
    index: v.number(),
  },
  handler: async (ctx, { date, index }) => {
    const existing = await ctx.db
      .query('nutritionLogs')
      .withIndex('by_date', q => q.eq('date', date))
      .first()
    if (!existing) return
    const entries = existing.entries.filter((_, i) => i !== index)
    await ctx.db.patch(existing._id, { entries })
  },
})
