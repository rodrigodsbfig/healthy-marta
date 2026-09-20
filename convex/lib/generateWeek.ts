/**
 * The weekly meal generator.
 *
 * Fills all eight moments across seven days by picking from recipes that are
 * already tagged to the plan. Because every candidate recipe was built from
 * plan.ts portions, a generated week cannot contain a non-compliant portion —
 * the only judgement here is WHICH compliant recipe goes where, and how the
 * plan's weekly limits are spread across the seven days.
 *
 * Deliberately deterministic given a seed, so "generate" can be re-run and
 * reviewed rather than being a black box.
 */

import { MEAL_MOMENTS, PLAN_RULES, OPTIONS_BY_ID, type MealMoment } from './plan'

export type GenerationMode = 'variada' | 'pratica'

export interface CandidateRecipe {
  _id: string
  title: string
  mealMoments?: string[]
  planComponents?: Array<{ kind: string; optionId: string }>
  /** Ingredient names, so dislikes can be matched against real foods. */
  ingredientNames?: string[]
}

export interface GeneratedSlot {
  day: number // 0=Mon … 6=Sun
  meal: MealMoment
  recipeId: string
  servings: number
}

export interface GenerationResult {
  slots: GeneratedSlot[]
  refeicaoLivreDay: number
  /** Human-readable notes about choices made, shown after generating. */
  notes: string[]
  /** Rules that could not be satisfied — surfaced rather than hidden. */
  warnings: string[]
}

/** Small deterministic PRNG so a given seed always produces the same week. */
function makeRandom(seed: number): () => number {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13; s >>>= 0
    s ^= s >> 17
    s ^= s << 5; s >>>= 0
    return s / 0xffffffff
  }
}

function shuffle<T>(items: T[], rand: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Does this recipe contain a food carrying the given plan tag? */
function hasTag(recipe: CandidateRecipe, tag: string): boolean {
  return (recipe.planComponents ?? []).some((c) =>
    OPTIONS_BY_ID[c.optionId]?.tags?.includes(tag as never)
  )
}

/**
 * How many days each distinct dish covers. "Prática" means batch-cooking:
 * cook once, eat the same lunch two or three days running. "Variada" means a
 * different dish every day.
 */
const RUN_LENGTH: Record<GenerationMode, number> = { variada: 1, pratica: 3 }

/** Moments worth batch-cooking. Snacks and drinks repeat freely either way. */
const BATCHABLE: MealMoment[] = ['almoco', 'jantar']

/** Does this recipe mention a food Marta will not eat? */
export function isDisliked(recipe: CandidateRecipe, dislikes: string[]): boolean {
  if (dislikes.length === 0) return false
  const haystack = [recipe.title, ...(recipe.ingredientNames ?? [])].join(' ').toLowerCase()
  return dislikes.some((d) => d && haystack.includes(d))
}

export function generateWeek(
  recipes: CandidateRecipe[],
  opts: {
    mode: GenerationMode
    seed?: number
    skipMeioDaManha?: boolean
    /** Lowercase terms; recipes mentioning one are never picked. */
    dislikes?: string[]
  }
): GenerationResult {
  const rand = makeRandom(opts.seed ?? Date.now())
  const slots: GeneratedSlot[] = []
  const notes: string[] = []
  const warnings: string[] = []

  const dislikes = (opts.dislikes ?? []).map((d) => d.trim().toLowerCase()).filter(Boolean)
  const allowed = recipes.filter((r) => !isDisliked(r, dislikes))
  const excludedCount = recipes.length - allowed.length

  const byMoment = (m: MealMoment) =>
    allowed.filter((r) => (r.mealMoments ?? []).includes(m))
  const byId = new Map(recipes.map((r) => [r._id, r]))

  // The plan allows one free meal per week during the weight-loss phase.
  // Reserve a dinner at the weekend for it.
  const refeicaoLivreDay = 5 + Math.floor(rand() * 2) // Saturday or Sunday

  // Red meat is capped per week, so it is allocated before anything else and
  // the remaining cooked slots draw from non-red-meat dishes only.
  let redMeatBudget = PLAN_RULES.carneVermelhaMaxPorSemana

  for (const moment of MEAL_MOMENTS) {
    if (moment === 'meioDaManha' && opts.skipMeioDaManha) {
      notes.push('Meio da manhã ignorado — o plano dispensa-o nos dias em que come fruta ao pequeno-almoço em casa.')
      continue
    }

    const pool = byMoment(moment)
    if (pool.length === 0) {
      // Distinguish "nothing written yet" from "everything ruled out", so a
      // dislike that empties a moment is obvious rather than looking like a bug.
      const existed = recipes.some((r) => (r.mealMoments ?? []).includes(moment))
      warnings.push(
        existed
          ? `Todas as receitas de ${moment} foram excluídas pelo que não comes — esse momento ficou vazio.`
          : `Sem receitas para ${moment} — esse momento ficou por preencher.`
      )
      continue
    }

    const runLength = BATCHABLE.includes(moment) ? RUN_LENGTH[opts.mode] : 1
    let order = shuffle(pool, rand)
    let cursor = 0
    let current: CandidateRecipe | null = null
    let used = 0

    for (let day = 0; day < 7; day++) {
      if (moment === 'jantar' && day === refeicaoLivreDay) continue // free meal

      // "Pode consumir 1 ovo por dia" — enforced as at most one egg-based meal
      // per day. The plan also offers "2 ovos" as a main-meal protein, so the
      // daily guidance is read as one egg MEAL rather than one literal egg;
      // without this, an omelette lunch could stack on an egg breakfast.
      const dayHasEgg = slots.some(
        (s) => s.day === day && hasTag(byId.get(s.recipeId)!, 'ovo')
      )
      // Batch-cooking repeats a dish across DAYS, never within one. Eating the
      // same thing for lunch and dinner on the same day is not what "cook once,
      // eat three times" is supposed to mean.
      const eatenToday = new Set(
        slots.filter((s) => s.day === day).map((s) => s.recipeId)
      )

      const admissible = (r: CandidateRecipe) => {
        if (hasTag(r, 'carneVermelha') && redMeatBudget <= 0) return false
        if (hasTag(r, 'ovo') && dayHasEgg) return false
        if (BATCHABLE.includes(moment) && eatenToday.has(r._id)) return false
        return true
      }

      // Keep the current dish while batching, unless it is inadmissible today.
      const needNew = current === null || used >= runLength || !admissible(current)
      if (needNew) {
        // Walk the shuffled pool for the next admissible dish. Reshuffle when
        // exhausted so a short pool still fills the week rather than gapping.
        let picked: CandidateRecipe | null = null
        for (let tries = 0; tries < order.length; tries++) {
          const candidate = order[(cursor + tries) % order.length]
          if (!admissible(candidate)) continue
          picked = candidate
          cursor = (cursor + tries + 1) % order.length
          break
        }
        if (!picked) {
          const relaxed = pool.filter(admissible)
          if (relaxed.length === 0) {
            // Nothing admissible at all — keep the week complete and say so,
            // rather than silently leaving the day empty.
            warnings.push(
              `Sem opção compatível para ${moment} no dia ${day + 1}; repetida uma receita.`
            )
            picked = current ?? pool[0]
          } else {
            order = shuffle(relaxed, rand)
            picked = order[0]
            cursor = 1
          }
        }
        current = picked
        used = 0
      }

      slots.push({ day, meal: moment, recipeId: current!._id, servings: 1 })
      // Spend the red-meat budget per MEAL EATEN, not per dish chosen. In
      // prática mode one beef dish is served three days running, which is
      // three red-meat meals against a plan that allows at most two.
      if (hasTag(current!, 'carneVermelha')) redMeatBudget--
      used++
    }
  }

  const redUsed = PLAN_RULES.carneVermelhaMaxPorSemana - redMeatBudget
  notes.push(`Carne vermelha ${redUsed}× esta semana (o plano permite até ${PLAN_RULES.carneVermelhaMaxPorSemana}).`)
  notes.push(
    opts.mode === 'pratica'
      ? `Modo prática: cada prato principal repete-se ${RUN_LENGTH.pratica} dias, para cozinhares menos vezes.`
      : 'Modo variada: um prato diferente por dia.'
  )
  notes.push('Um jantar ficou livre para a refeição livre da semana.')
  if (excludedCount > 0) {
    notes.push(`${excludedCount} receita(s) ignoradas por conterem algo que não comes.`)
  }

  return { slots, refeicaoLivreDay, notes, warnings }
}
