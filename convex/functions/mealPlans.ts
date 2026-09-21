import { query, mutation } from '../_generated/server'
import { v } from 'convex/values'
import type { Id } from '../_generated/dataModel'
import { generateWeek } from '../lib/generateWeek'
import { OPTIONS_BY_ID, PLAN_RULES } from '../lib/plan'

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
      ingredientNames: r.ingredients.map((i) => i.name),
    }))

    const prefs = await ctx.db.query('preferences').first()
    const result = generateWeek(candidates, {
      mode, seed, skipMeioDaManha,
      dislikes: prefs?.dislikes ?? [],
    })
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

/**
 * Replace one meal with a different compliant dish, leaving the rest of the
 * week alone.
 *
 * Regenerating the whole week to change one dinner throws away every other
 * choice she was happy with. Candidates are filtered the same way the weekly
 * generator filters: right moment, not disliked, and not already eaten that
 * day.
 */
export const swapSlot = mutation({
  args: {
    weekStart: v.string(),
    day: v.number(),
    meal: mealType,
  },
  handler: async (ctx, { weekStart, day, meal }) => {
    const plan = await ctx.db
      .query('mealPlans')
      .filter((q) => q.eq(q.field('weekStart'), weekStart))
      .first()
    if (!plan) return { swapped: false, reason: 'no-plan' as const }

    const current = plan.slots.find((s) => s.day === day && s.meal === meal)
    if (!current) return { swapped: false, reason: 'no-slot' as const }

    const prefs = await ctx.db.query('preferences').first()
    const dislikes = (prefs?.dislikes ?? []).map((d) => d.toLowerCase())
    const eatenToday = new Set(
      plan.slots.filter((s) => s.day === day).map((s) => s.recipeId as string)
    )

    const recipes = await ctx.db.query('recipes').collect()
    const byId = new Map(recipes.map((r) => [r._id as string, r]))
    const tagsOf = (r: typeof recipes[number]) =>
      (r.planComponents ?? []).flatMap((c) => OPTIONS_BY_ID[c.optionId]?.tags ?? [])

    // A swap must obey the same plan limits as a full generation. Without
    // this, swapping repeatedly is a way to walk straight past the weekly
    // red-meat cap one dinner at a time.
    const redMeatElsewhere = plan.slots.filter((s) => {
      if (s.day === day && s.meal === meal) return false
      const r = byId.get(s.recipeId as string)
      return r ? tagsOf(r).includes('carneVermelha') : false
    }).length
    const redMeatLeft = PLAN_RULES.carneVermelhaMaxPorSemana - redMeatElsewhere

    const eggToday = plan.slots.some((s) => {
      if (s.day !== day || s.meal === meal) return false
      const r = byId.get(s.recipeId as string)
      return r ? tagsOf(r).includes('ovo') : false
    })

    const candidates = recipes.filter((r) => {
      if (!(r.mealMoments ?? []).includes(meal)) return false
      if ((r._id as string) === (current.recipeId as string)) return false
      if (eatenToday.has(r._id as string)) return false
      const tags = tagsOf(r)
      if (tags.includes('carneVermelha') && redMeatLeft <= 0) return false
      if (tags.includes('ovo') && eggToday) return false
      const haystack = [r.title, ...r.ingredients.map((i) => i.name)].join(' ').toLowerCase()
      if (dislikes.some((d) => d && haystack.includes(d))) return false
      return true
    })

    if (candidates.length === 0) return { swapped: false, reason: 'no-alternative' as const }

    const pick = candidates[Math.floor(Math.random() * candidates.length)]
    const slots = plan.slots.map((s) =>
      s.day === day && s.meal === meal ? { ...s, recipeId: pick._id } : s
    )
    await ctx.db.patch(plan._id, { slots })
    return { swapped: true, title: pick.title }
  },
})
