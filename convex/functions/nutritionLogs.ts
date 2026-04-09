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

export const getLastNDays = query({
  args: { days: v.number() },
  handler: async (ctx, { days }) => {
    const today = new Date()
    const result: { date: string; calories: number; protein: number; carbs: number; fat: number }[] = []
    for (let i = 0; i < days; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const date = d.toISOString().split('T')[0]
      const log = await ctx.db
        .query('nutritionLogs')
        .withIndex('by_date', q => q.eq('date', date))
        .first()
      const entries = log?.entries ?? []
      result.push({
        date,
        calories: entries.reduce((s, e) => s + e.calories, 0),
        protein:  entries.reduce((s, e) => s + e.protein,  0),
        carbs:    entries.reduce((s, e) => s + e.carbs,    0),
        fat:      entries.reduce((s, e) => s + e.fat,      0),
      })
    }
    return result // index 0 = today, index days-1 = oldest
  },
})

export const getRecentEntries = query({
  args: { days: v.number() },
  handler: async (ctx, { days }) => {
    const today = new Date()
    const seen = new Set<string>()
    const recent: Array<{
      label: string; calories: number; protein: number; carbs: number; fat: number; servings: number
    }> = []

    for (let i = 0; i < days; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const date = d.toISOString().split('T')[0]
      const log = await ctx.db
        .query('nutritionLogs')
        .withIndex('by_date', q => q.eq('date', date))
        .first()
      for (const entry of (log?.entries ?? [])) {
        if (!seen.has(entry.label)) {
          seen.add(entry.label)
          recent.push({
            label:    entry.label,
            calories: entry.calories,
            protein:  entry.protein,
            carbs:    entry.carbs,
            fat:      entry.fat,
            servings: entry.servings,
          })
        }
        if (recent.length >= 8) return recent
      }
    }
    return recent
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
