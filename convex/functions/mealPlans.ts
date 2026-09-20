import { query, mutation } from '../_generated/server'
import { v } from 'convex/values'
import type { Id } from '../_generated/dataModel'
import { generateWeek } from '../lib/generateWeek'

/** Kept in sync with MEAL_MOMENTS in convex/lib/plan.ts. */
const mealType = v.union(
  v.literal('acordar'),
  v.literal('pequenoAlmoco'),
  v.literal('meioDaManha'),
  v.literal('almoco'),
  v.literal('lanche1'),
  v.literal('lanche2'),
  v.literal('jantar'),
  v.literal('ceia'),
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

/**
 * Fill a whole week from the recipe library, respecting the nutrition plan.
 *
 * Replaces any existing plan for that week. Returns the generator's notes and
 * warnings so the UI can show what it did and what it could not satisfy.
 */
export const generate = mutation({
  args: {
    weekStart: v.string(),
    mode: v.union(v.literal('variada'), v.literal('pratica')),
    seed: v.optional(v.number()),
    skipMeioDaManha: v.optional(v.boolean()),
  },
  handler: async (ctx, { weekStart, mode, seed, skipMeioDaManha }) => {
    const recipes = await ctx.db.query('recipes').collect()
    const candidates = recipes.map((r) => ({
      _id: r._id as string,
      title: r.title,
      mealMoments: r.mealMoments,
      planComponents: r.planComponents,
    }))

    const result = generateWeek(candidates, { mode, seed, skipMeioDaManha })
    const slots = result.slots.map((s) => ({
      day: s.day,
      meal: s.meal,
      recipeId: s.recipeId as Id<'recipes'>,
      servings: s.servings,
    }))

    const existing = await ctx.db
      .query('mealPlans')
      .filter((q) => q.eq(q.field('weekStart'), weekStart))
      .first()

    const doc = {
      weekStart,
      slots,
      generatedAt: Date.now(),
      generationMode: mode,
      refeicaoLivreDay: result.refeicaoLivreDay,
    }
    if (existing) await ctx.db.patch(existing._id, doc)
    else await ctx.db.insert('mealPlans', doc)

    return { notes: result.notes, warnings: result.warnings, mealsPlanned: slots.length }
  },
})
