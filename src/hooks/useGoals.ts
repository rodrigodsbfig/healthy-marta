import { useState } from 'react'

export type Goals = {
  calories: number
  protein: number
  carbs: number
  fat: number
}

const DEFAULTS: Goals = { calories: 2000, protein: 150, carbs: 200, fat: 65 }
const KEY = 'nutrition_goals'

export function useGoals() {
  const [goals, setGoalsState] = useState<Goals>(() => {
    try {
      const stored = localStorage.getItem(KEY)
      return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS
    } catch {
      return DEFAULTS
    }
  })

  function setGoals(g: Goals) {
    setGoalsState(g)
    localStorage.setItem(KEY, JSON.stringify(g))
  }

  return { goals, setGoals }
}
