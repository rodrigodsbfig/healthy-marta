import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { CheckSquare, Square, UtensilsCrossed, RefreshCw } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/language'
import { getWeekStart, formatShort, weekDays } from '@/lib/dates'

export function PrepSession() {
  const { t, lang } = useLanguage()
  const weekStart = getWeekStart()
  const days = weekDays(weekStart)
  const weekLabel = `${formatShort(days[0])} – ${formatShort(days[6])}`

  const session = useQuery(api.functions.prepSessions.getByWeek, { weekStart })
  const allRecipes = useQuery(api.functions.recipes.list)
  const generateFromPlan = useMutation(api.functions.prepSessions.generateFromPlan)
  const toggleItem = useMutation(api.functions.prepSessions.toggleItem)

  const [generating, setGenerating] = useState(false)

  const recipeMap = new Map(allRecipes?.map(r => [r._id, r]) ?? [])
  const items = session?.items ?? []
  const done = items.filter(i => i.completed).length

  // Aggregate ingredients from non-completed items
  const ingredientMap = new Map<string, { name: string; quantity: number; unit: string }>()
  for (const item of items) {
    if (item.completed) continue
    const recipe = recipeMap.get(item.recipeId)
    if (!recipe) continue
    const scale = item.servings / (recipe.servings || 1)
    for (const ing of recipe.ingredients) {
      const key = `${ing.name.toLowerCase()}||${ing.unit}`
      const existing = ingredientMap.get(key)
      if (existing) {
        ingredientMap.set(key, { ...existing, quantity: existing.quantity + ing.quantity * scale })
      } else {
        ingredientMap.set(key, { name: ing.name, quantity: ing.quantity * scale, unit: ing.unit })
      }
    }
  }
  const aggregatedIngredients = Array.from(ingredientMap.values())

  async function handleGenerate() {
    setGenerating(true)
    try { await generateFromPlan({ weekStart }) }
    finally { setGenerating(false) }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#2D1F3D]">{t('prep_session')}</h1>
          <p className="text-sm text-[#7A6775] mt-0.5">{weekLabel}</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 border border-[#E8D9C8] text-[#7A6775] text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#F5EDE0] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
          {generating ? t('generating') : t('gen_prep')}
        </button>
      </div>

      {/* Progress bar */}
      {items.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-[#7B5EA7]">{done}</span>
            <span className="text-[#7A6775]">{t('of_items')} {items.length} {t('recipes_prepped')}</span>
          </div>
          <div className="w-full h-2 bg-[#EEE0FF] rounded-full">
            <div
              className="h-2 bg-[#7B5EA7] rounded-full transition-all"
              style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Empty state */}
      {session !== undefined && items.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-16 h-16 bg-[#EEE0FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed size={28} className="text-[#7B5EA7]" />
          </div>
          <h3 className="font-display font-bold text-base text-[#2D1F3D] mb-1">{t('no_prep_yet')}</h3>
          <p className="text-sm text-[#7A6775] mb-5">{t('prep_hint')}</p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-[#7B5EA7] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#6a4e94] transition-colors disabled:opacity-50"
          >
            {generating ? t('generating') : t('gen_prep')}
          </button>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-6">
          {/* Recipe checklist */}
          <div className="space-y-3">
            <h2 className="font-display font-bold text-base text-[#2D1F3D]">{t('recipes')}</h2>
            {items.map((item, i) => {
              const recipe = recipeMap.get(item.recipeId)
              return (
                <button
                  key={i}
                  onClick={() => toggleItem({ weekStart, index: i })}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-2xl shadow-[0_4px_20px_0_#7B5EA714] text-left transition-all',
                    item.completed ? 'bg-[#F5EDE0] opacity-60' : 'bg-white hover:shadow-[0_4px_24px_0_#7B5EA730]'
                  )}
                >
                  {item.completed
                    ? <CheckSquare size={20} className="text-[#7B5EA7] shrink-0" />
                    : <Square size={20} className="text-[#E8D9C8] shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-semibold truncate', item.completed ? 'line-through text-[#7A6775]' : 'text-[#2D1F3D]')}>
                      {recipe?.title ?? t('loading')}
                    </p>
                    <p className="text-[11px] text-[#7A6775]">
                      {item.servings} {lang === 'pt' ? (item.servings === 1 ? 'porção' : 'porções') : (item.servings === 1 ? 'serving' : 'servings')}
                      {recipe ? ` · ${recipe.prepTime + recipe.cookTime} ${t('min')}` : ''}
                    </p>
                  </div>
                  {item.completed && (
                    <span className="text-[11px] font-semibold text-[#7B5EA7] shrink-0">{t('prepped')}</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Combined ingredients */}
          <div className="space-y-3">
            <h2 className="font-display font-bold text-base text-[#2D1F3D]">{t('all_ingredients')}</h2>
            {aggregatedIngredients.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_0_#7B5EA714] text-center">
                <p className="text-sm text-[#7A6775]">
                  {done === items.length && items.length > 0
                    ? (lang === 'pt' ? 'Tudo preparado!' : 'All done!')
                    : t('loading')}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_0_#7B5EA714]">
                <ul className="space-y-2.5">
                  {aggregatedIngredients.map((ing, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span className="text-[#2D1F3D]">{ing.name}</span>
                      <span className="text-[#7A6775] shrink-0 ml-4">
                        {ing.quantity % 1 === 0 ? ing.quantity : ing.quantity.toFixed(1)} {ing.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
