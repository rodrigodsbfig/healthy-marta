import { query, mutation } from '../_generated/server'
import { v } from 'convex/values'

/**
 * Marta's own settings. Goals used to live in localStorage, which meant they
 * did not follow her between her phone and her laptop; they live here now.
 *
 * Deliberately no default macro numbers: the targets are her nutritionist's
 * to set, not this app's to guess. Until she enters them the Today rings show
 * intake without a target.
 */

async function getDoc(ctx: { db: { query: (t: 'preferences') => { first: () => Promise<unknown> } } }) {
  return await ctx.db.query('preferences').first()
}

export const get = query({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db.query('preferences').first()
    return doc ?? null
  },
})

export const setGoals = mutation({
  args: {
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
  },
  handler: async (ctx, goals) => {
    const existing = await ctx.db.query('preferences').first()
    if (existing) await ctx.db.patch(existing._id, { goals })
    else await ctx.db.insert('preferences', { goals, dislikes: [] })
  },
})

export const clearGoals = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('preferences').first()
    if (existing) await ctx.db.patch(existing._id, { goals: undefined })
  },
})

export const addDislike = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const term = name.trim().toLowerCase()
    if (!term) return
    const existing = await ctx.db.query('preferences').first()
    if (!existing) {
      await ctx.db.insert('preferences', { dislikes: [term] })
      return
    }
    const dislikes = existing.dislikes ?? []
    if (dislikes.includes(term)) return
    await ctx.db.patch(existing._id, { dislikes: [...dislikes, term] })
  },
})

export const removeDislike = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const existing = await ctx.db.query('preferences').first()
    if (!existing) return
    const dislikes = (existing.dislikes ?? []).filter((d) => d !== name.trim().toLowerCase())
    await ctx.db.patch(existing._id, { dislikes })
  },
})

/**
 * Recipes Marta will not eat, with the term that ruled each one out — shown
 * on the settings screen so a term that silently empties the library is
 * visible rather than mysterious.
 */
export const excludedRecipes = query({
  args: {},
  handler: async (ctx) => {
    const prefs = await ctx.db.query('preferences').first()
    const dislikes = prefs?.dislikes ?? []
    if (dislikes.length === 0) return []

    const recipes = await ctx.db.query('recipes').collect()
    const out: Array<{ title: string; because: string }> = []
    for (const r of recipes) {
      const haystack = [r.title, ...r.ingredients.map((i) => i.name)].join(' ').toLowerCase()
      const hit = dislikes.find((d) => haystack.includes(d))
      if (hit) out.push({ title: r.title, because: hit })
    }
    return out
  },
})

export { getDoc }
