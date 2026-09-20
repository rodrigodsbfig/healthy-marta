import { mutation, query } from '../_generated/server'
import { v } from 'convex/values'
import { RECIPE_LIBRARY, buildRecipe, planComponentsOf } from '../lib/recipeLibrary'

/**
 * Default weekly staples — the things bought regardless of what is planned.
 * Appended to every generated shopping list so they are never forgotten.
 */
const DEFAULT_STAPLES = [
  { name: 'azeite', category: 'Mercearia' },
  { name: 'café', category: 'Mercearia' },
  { name: 'ovos', category: 'Frescos' },
  { name: 'iogurte magro 0%', category: 'Frescos' },
  { name: 'fruta da época', category: 'Frutas e Legumes' },
  { name: 'legumes para sopa', category: 'Frutas e Legumes' },
  { name: 'salada', category: 'Frutas e Legumes' },
  { name: 'pão escuro', category: 'Padaria' },
  { name: 'limão', category: 'Frutas e Legumes' },
  { name: 'alho', category: 'Frutas e Legumes' },
]

/**
 * Insert the starter recipe library. Idempotent: a recipe whose title already
 * exists is skipped, so this is safe to re-run after adding new recipes.
 */
export const seedLibrary = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('recipes').collect()
    const byTitle = new Map(existing.map((r) => [r.title, r]))

    let inserted = 0
    let updated = 0
    for (const seed of RECIPE_LIBRARY) {
      // Build at the recipe's primary moment; the other moments resolve their
      // own portions at serve time via equivalentOption.
      const built = buildRecipe(seed, seed.moments[0])
      const doc = {
        title: seed.title,
        description: seed.description,
        servings: 1,
        prepTime: seed.prepTime,
        cookTime: seed.cookTime,
        ingredients: built.ingredients,
        steps: seed.steps,
        tags: seed.tags,
        nutrition: built.nutrition,
        mealMoments: seed.moments,
        planComponents: planComponentsOf(seed),
        comSopa: seed.comSopa ?? false,
      }
      // Upsert by title so re-running refreshes recipes in place, keeping the
      // ids that meal plans already point at.
      const found = byTitle.get(seed.title)
      if (found) { await ctx.db.patch(found._id, doc); updated++ }
      else { await ctx.db.insert('recipes', doc); inserted++ }
    }
    return { inserted, updated }
  },
})

/** Insert the default staples, skipping any already present by name. */
export const seedStaples = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('staples').collect()
    const names = new Set(existing.map((s) => s.name))

    let inserted = 0
    for (const s of DEFAULT_STAPLES) {
      if (names.has(s.name)) continue
      await ctx.db.insert('staples', { name: s.name, category: s.category, active: true })
      inserted++
    }
    return { inserted }
  },
})

export const listStaples = query({
  args: {},
  handler: async (ctx) => await ctx.db.query('staples').collect(),
})

export const setStapleActive = mutation({
  args: { id: v.id('staples'), active: v.boolean() },
  handler: async (ctx, { id, active }) => {
    await ctx.db.patch(id, { active })
  },
})

export const addStaple = mutation({
  args: { name: v.string(), category: v.optional(v.string()) },
  handler: async (ctx, { name, category }) => {
    await ctx.db.insert('staples', { name, category, active: true })
  },
})

export const removeStaple = mutation({
  args: { id: v.id('staples') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})
