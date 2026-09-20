/**
 * Approximate macronutrient reference values for the foods in Marta's plan.
 *
 * These are standard food-composition figures used to estimate a recipe's
 * nutrition from its plan portions, so every recipe is costed the same way
 * instead of carrying hand-written numbers. They are guidance for the daily
 * rings on the Today page — not a clinical calculation, and not a substitute
 * for what the nutritionist prescribes. The plan itself is portion-based:
 * hitting the portions is what matters, the macros are informational.
 *
 * IMPORTANT: grain and potato portions in the plan are COOKED weights. The
 * plan's own household-measure table gives "100g arroz, massa, quinoa,
 * couscous (cozinhados) = 3 colheres de sopa", so the values below are for
 * cooked food.
 */

export interface Macros {
  calories: number
  protein: number
  carbs: number
  fat: number
}

/** Per 100g / 100ml, unless the food is listed in PER_UNIT below. */
export const PER_100: Record<string, Macros> = {
  // Protein — fish & seafood
  'salmão':          { calories: 208, protein: 20,   carbs: 0,   fat: 13 },
  'pescada':         { calories: 88,  protein: 17,   carbs: 0,   fat: 2 },
  'dourada':         { calories: 96,  protein: 20,   carbs: 0,   fat: 1.8 },
  'atum':            { calories: 116, protein: 26,   carbs: 0,   fat: 1 },
  // Protein — meat
  'frango':          { calories: 165, protein: 31,   carbs: 0,   fat: 3.6 },
  'peru':            { calories: 135, protein: 29,   carbs: 0,   fat: 1.7 },
  'vaca':            { calories: 180, protein: 26,   carbs: 0,   fat: 8 },
  // Protein — other
  'tofu':            { calories: 144, protein: 15,   carbs: 3,   fat: 9 },
  'ovo':             { calories: 143, protein: 13,   carbs: 1,   fat: 10 },
  'claras':          { calories: 52,  protein: 11,   carbs: 0.7, fat: 0.2 },
  'tremoços':        { calories: 120, protein: 16,   carbs: 7,   fat: 3 },
  // Dairy
  'queijo fresco':   { calories: 95,  protein: 13,   carbs: 3,   fat: 3.5 },
  'philadelphia':    { calories: 150, protein: 6,    carbs: 5,   fat: 12 },
  'queijo magro':    { calories: 250, protein: 25,   carbs: 1,   fat: 16 },
  'bebida vegetal':  { calories: 30,  protein: 0.5,  carbs: 3,   fat: 1.5 },
  // Carbohydrate (cooked weights)
  'arroz basmati':   { calories: 130, protein: 2.7,  carbs: 28,  fat: 0.3 },
  'massa':           { calories: 131, protein: 5,    carbs: 25,  fat: 1 },
  'quinoa':          { calories: 120, protein: 4.4,  carbs: 21,  fat: 1.9 },
  'bulgur':          { calories: 83,  protein: 3,    carbs: 19,  fat: 0.2 },
  'trigo sarraceno': { calories: 92,  protein: 3.4,  carbs: 20,  fat: 0.6 },
  'amaranto':        { calories: 102, protein: 3.8,  carbs: 19,  fat: 1.6 },
  'inhame':          { calories: 114, protein: 1.5,  carbs: 27,  fat: 0.1 },
  'batata doce':     { calories: 86,  protein: 1.6,  carbs: 20,  fat: 0.1 },
  'batata':          { calories: 87,  protein: 2,    carbs: 20,  fat: 0.1 },
  // Breakfast carbohydrate (dry weights — these are weighed uncooked)
  'pão':             { calories: 265, protein: 9,    carbs: 49,  fat: 3.2 },
  'aveia':           { calories: 380, protein: 13,   carbs: 60,  fat: 7 },
  'granola':         { calories: 400, protein: 10,   carbs: 60,  fat: 12 },
  'tapioca':         { calories: 358, protein: 0,    carbs: 89,  fat: 0 },
  // Vegetables & fruit
  'legumes':         { calories: 45,  protein: 2.5,  carbs: 7,   fat: 0.4 },
  'salada':          { calories: 20,  protein: 1.5,  carbs: 3,   fat: 0.2 },
  'sopa':            { calories: 20,  protein: 1,    carbs: 3,   fat: 0.5 },
  'fruta':           { calories: 60,  protein: 0.7,  carbs: 14,  fat: 0.2 },
  // Fats
  'abacate':         { calories: 160, protein: 2,    carbs: 9,   fat: 15 },
  'frutos secos':    { calories: 600, protein: 20,   carbs: 20,  fat: 50 },
  'sementes':        { calories: 550, protein: 20,   carbs: 20,  fat: 45 },
  'chocolate 70%':   { calories: 550, protein: 8,    carbs: 30,  fat: 40 },
  'azeite':          { calories: 900, protein: 0,    carbs: 0,   fat: 100 },
}

/** Foods the plan counts in units rather than grams. Values are per unit. */
export const PER_UNIT: Record<string, Macros> = {
  'ovo':                 { calories: 72,  protein: 6.5, carbs: 0.5, fat: 5 },
  'iogurte magro':       { calories: 55,  protein: 5,   carbs: 7,   fat: 0.1 },
  'iogurte proteico':    { calories: 90,  protein: 15,  carbs: 5,   fat: 0.5 },
  'babybel light':       { calories: 42,  protein: 5,   carbs: 0.5, fat: 2.5 },
  'vaca que ri light':   { calories: 30,  protein: 2,   carbs: 1.5, fat: 1.8 },
  'pudim proteico':      { calories: 60,  protein: 10,  carbs: 4,   fat: 1 },
  'marinheira':          { calories: 30,  protein: 0.8, carbs: 6,   fat: 0.4 },
  'tosta extrafina':     { calories: 20,  protein: 0.6, carbs: 4,   fat: 0.2 },
  'tortilha':            { calories: 38,  protein: 1,   carbs: 8,   fat: 0.3 },
  'tortita':             { calories: 28,  protein: 0.7, carbs: 6,   fat: 0.2 },
  'fatia de queijo':     { calories: 60,  protein: 6,   carbs: 0.5, fat: 4 },
  'gelado de fruta':     { calories: 70,  protein: 0.5, carbs: 17,  fat: 0.1 },
  'quadrado de chocolate': { calories: 30, protein: 0.4, carbs: 2,  fat: 2 },
  'chá':                 { calories: 0,   protein: 0,   carbs: 0,   fat: 0 },
  'café':                { calories: 2,   protein: 0,   carbs: 0,   fat: 0 },
  'água':                { calories: 0,   protein: 0,   carbs: 0,   fat: 0 },
}

export const ZERO: Macros = { calories: 0, protein: 0, carbs: 0, fat: 0 }

export function addMacros(a: Macros, b: Macros): Macros {
  return {
    calories: a.calories + b.calories,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
  }
}

export function roundMacros(m: Macros): Macros {
  return {
    calories: Math.round(m.calories),
    protein: Math.round(m.protein),
    carbs: Math.round(m.carbs),
    fat: Math.round(m.fat),
  }
}

/**
 * Estimate macros for `grams` of a food, or for `units` of a unit-counted one.
 * Unknown foods contribute nothing rather than throwing — a missing reference
 * value should not stop a recipe being saved.
 */
export function macrosFor(food: string, opts: { grams?: number; units?: number }): Macros {
  if (opts.units !== undefined) {
    const per = PER_UNIT[food]
    if (!per) return ZERO
    return {
      calories: per.calories * opts.units,
      protein: per.protein * opts.units,
      carbs: per.carbs * opts.units,
      fat: per.fat * opts.units,
    }
  }
  const per = PER_100[food]
  if (!per || opts.grams === undefined) return ZERO
  const f = opts.grams / 100
  return {
    calories: per.calories * f,
    protein: per.protein * f,
    carbs: per.carbs * f,
    fat: per.fat * f,
  }
}
