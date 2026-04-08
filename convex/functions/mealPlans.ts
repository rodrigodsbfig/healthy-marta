import { query, mutation } from '../_generated/server'
import { v } from 'convex/values'

const mealType = v.union(
  v.literal('breakfast'),
  v.literal('lunch'),
  v.literal('dinner'),
  v.literal('snack'),
)

export const getByWeek = query({
  args: { weekStart: v.string() },
  handler: async (ctx, { weekStart }) => {
    return await ctx.db
      .query('mealPlans')
      .filter(q => q.eq(q.field('weekStart'), weekStart))
      .first()
  },
})

export const addSlot = mutation({
  args: {
    weekStart: v.string(),
    day: v.number(),
    meal: mealType,
    recipeId: v.id('recipes'),
    servings: v.number(),
  },
  handler: async (ctx, { weekStart, day, meal, recipeId, servings }) => {
    const plan = await ctx.db
      .query('mealPlans')
      .filter(q => q.eq(q.field('weekStart'), weekStart))
      .first()

    if (plan) {
      // Replace any existing slot for the same day + meal type
      const slots = plan.slots.filter(s => !(s.day === day && s.meal === meal))
      slots.push({ day, meal, recipeId, servings })
      await ctx.db.patch(plan._id, { slots })
    } else {
      await ctx.db.insert('mealPlans', {
        weekStart,
        slots: [{ day, meal, recipeId, servings }],
      })
    }
  },
})

export const removeSlot = mutation({
  args: {
    weekStart: v.string(),
    day: v.number(),
    meal: mealType,
  },
  handler: async (ctx, { weekStart, day, meal }) => {
    const plan = await ctx.db
      .query('mealPlans')
      .filter(q => q.eq(q.field('weekStart'), weekStart))
      .first()
    if (!plan) return
    const slots = plan.slots.filter(s => !(s.day === day && s.meal === meal))
    await ctx.db.patch(plan._id, { slots })
  },
})
