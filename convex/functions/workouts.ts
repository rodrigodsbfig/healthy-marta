import { query, mutation } from '../_generated/server'
import { v } from 'convex/values'

export const listAll = query({
  args: {},
  handler: async (ctx) => await ctx.db.query('workouts').collect(),
})

/**
 * Mark or unmark a day as trained. Presence of a document is the record, so
 * tapping a marked day removes it — one tap either way.
 */
export const toggleDay = mutation({
  args: { date: v.string(), type: v.optional(v.string()) },
  handler: async (ctx, { date, type }) => {
    const existing = await ctx.db
      .query('workouts')
      .withIndex('by_date', (q) => q.eq('date', date))
      .first()

    if (existing) {
      await ctx.db.delete(existing._id)
      return { trained: false }
    }
    await ctx.db.insert('workouts', { date, type })
    return { trained: true }
  },
})
