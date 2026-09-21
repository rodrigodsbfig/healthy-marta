import { mutation } from '../_generated/server'
import { RECIPE_LIBRARY, buildRecipe, planComponentsOf } from '../lib/recipeLibrary'

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
