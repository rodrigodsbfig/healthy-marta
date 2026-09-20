import { equivalentOption, amountFor, type MealMoment } from '../../convex/lib/plan'

export interface StoredIngredient {
  name: string
  quantity: number
  unit: string
  optionId?: string
}

/**
 * Re-resolve a recipe's ingredient quantities for the moment it is served at.
 *
 * A recipe stores its quantities at its primary moment, but the plan
 * prescribes different portions per moment — 90g arroz at almoço, 60g at
 * jantar. Without this the recipe page shows lunch portions for a dinner,
 * disagreeing with the shopping list and, worse, with what she should cook.
 *
 * Ingredients with no optionId (seasonings, aromatics) pass through unchanged.
 */
export function resolveIngredients(
  ingredients: readonly StoredIngredient[],
  moment: MealMoment | undefined,
  comSopa: boolean,
): StoredIngredient[] {
  if (!moment) return [...ingredients]
  return ingredients.map((ing) => {
    if (!ing.optionId) return ing
    const option = equivalentOption(ing.optionId, moment)
    if (!option) return ing
    const amt = amountFor(option, { comSopa })
    if (amt.grams !== undefined) return { ...ing, quantity: amt.grams }
    if (amt.ml !== undefined) return { ...ing, quantity: amt.ml }
    return ing
  })
}
