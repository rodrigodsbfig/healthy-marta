import { query, mutation } from '../_generated/server'
import { v } from 'convex/values'

export const getByWeek = query({
  args: { weekStart: v.string() },
  handler: async (ctx, { weekStart }) => {
    return await ctx.db
      .query('prepSessions')
      .withIndex('by_week', q => q.eq('weekStart', weekStart))
      .first()
  },
})

export const generateFromPlan = mutation({
  args: { weekStart: v.string() },
  handler: async (ctx, { weekStart }) => {
    // Get the meal plan for this week
    const plan = await ctx.db
      .query('mealPlans')
      .withIndex('by_user_week', q => q.eq('userId', undefined).eq('weekStart', weekStart))
      .first()

    const slots = plan?.slots ?? []

    // Aggregate unique recipes, summing servings
    const recipeMap = new Map<string, number>()
    for (const slot of slots) {
      const key = slot.recipeId
      recipeMap.set(key, (recipeMap.get(key) ?? 0) + slot.servings)
    }

    const items = Array.from(recipeMap.entries()).map(([recipeId, servings]) => ({
      recipeId: recipeId as typeof slots[0]['recipeId'],
      servings,
      completed: false,
    }))

    // Upsert the prep session
    const existing = await ctx.db
      .query('prepSessions')
      .withIndex('by_week', q => q.eq('weekStart', weekStart))
      .first()

    if (existing) {
      // Preserve completed status for items that already exist
      const updatedItems = items.map(item => {
        const prev = existing.items.find(e => e.recipeId === item.recipeId)
        return { ...item, completed: prev?.completed ?? false }
      })
      await ctx.db.patch(existing._id, { items: updatedItems })
    } else {
      await ctx.db.insert('prepSessions', { weekStart, items })
    }
  },
})

export const toggleItem = mutation({
  args: {
    weekStart: v.string(),
    index: v.number(),
  },
  handler: async (ctx, { weekStart, index }) => {
    const session = await ctx.db
      .query('prepSessions')
      .withIndex('by_week', q => q.eq('weekStart', weekStart))
      .first()
    if (!session) return
    const items = session.items.map((item, i) =>
      i === index ? { ...item, completed: !item.completed } : item
    )
    await ctx.db.patch(session._id, { items })
  },
})
