import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export type Goals = {
  calories: number
  protein: number
  carbs: number
  fat: number
}

/**
 * Marta's daily targets, as she entered them.
 *
 * There are deliberately no default numbers. The old 2000 kcal / 150g default
 * was this app's guess, shown as if it were her nutritionist's prescription
 * while a generated day came to roughly 1400. Until she sets them, `goals` is
 * null and the UI shows intake without a target rather than against a made-up
 * one. They live in Convex, not localStorage, so they follow her between
 * phone and laptop.
 */
export function useGoals(): { goals: Goals | null; loading: boolean } {
  const prefs = useQuery(api.functions.preferences.get)
  return { goals: prefs?.goals ?? null, loading: prefs === undefined }
}
