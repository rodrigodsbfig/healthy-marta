import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { Trash2 } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/language'
import { MEAL_LABELS, DAY_SHORT } from '@/lib/translations'
import { useGoals } from '@/hooks/useGoals'
import { getWeekStart } from '@/lib/dates'
import { LogMealModal } from '@/components/LogMealModal'

const MACRO_CONFIG = [
  { key: 'calories' as const, labelKey: 'cal_label'     as const, unit: 'kcal', color: 'bg-[#7B5EA7]',  light: 'bg-[#EEE0FF]',  text: 'text-[#7B5EA7]' },
  { key: 'protein'  as const, labelKey: 'protein_label' as const, unit: 'g',    color: 'bg-[#2D9B5C]',  light: 'bg-[#E8F5EE]',  text: 'text-[#2D9B5C]' },
  { key: 'carbs'    as const, labelKey: 'carbs_label'   as const, unit: 'g',    color: 'bg-[#E89B6C]',  light: 'bg-[#FFF3E8]',  text: 'text-[#E89B6C]' },
  { key: 'fat'      as const, labelKey: 'fat_label'     as const, unit: 'g',    color: 'bg-[#7A6775]',  light: 'bg-[#F5EDE0]',  text: 'text-[#7A6775]' },
]

const MEAL_DOT: Record<string, string> = {
  breakfast: 'bg-[#7B5EA7]',
  lunch:     'bg-[#2D9B5C]',
  dinner:    'bg-[#E89B6C]',
  snack:     'bg-[#7A6775]',
}

// Today's date as YYYY-MM-DD
function todayStr() {
  return new Date().toISOString().split('T')[0]
}

// Day index Mon=0 … Sun=6
function todayDayIndex() {
  return (new Date().getDay() + 6) % 7
}

export function Today() {
  const { t, lang } = useLanguage()
  const { goals } = useGoals()
  const [logOpen, setLogOpen] = useState(false)
  const [prefillId, setPrefillId] = useState<Id<'recipes'> | undefined>()

  const today = todayStr()
  const weekStart = getWeekStart()
  const dayIdx = todayDayIndex()

  const plan = useQuery(api.functions.mealPlans.getByWeek, { weekStart })
  const allRecipes = useQuery(api.functions.recipes.list)
  const log = useQuery(api.functions.nutritionLogs.getByDate, { date: today })
  const removeEntry = useMutation(api.functions.nutritionLogs.removeEntry)

  const recipeMap = new Map(allRecipes?.map(r => [r._id, r]) ?? [])

  // Today's planned slots
  const todaySlots = (plan?.slots ?? []).filter(s => s.day === dayIdx)

  // Nutrition totals from log
  const entries = log?.entries ?? []
  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein:  acc.protein  + e.protein,
      carbs:    acc.carbs    + e.carbs,
      fat:      acc.fat      + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const dateLabel = new Date().toLocaleDateString(t('date_locale'), {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  function openLog(recipeId?: Id<'recipes'>) {
    setPrefillId(recipeId)
    setLogOpen(true)
  }

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-[#2D1F3D]">
              {t('good_morning')}, Marta
            </h1>
            <p className="text-sm text-[#7A6775] mt-0.5">{dateLabel}</p>
          </div>
          <button
            onClick={() => openLog()}
            className="bg-[#7B5EA7] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#6a4e94] transition-colors"
          >
            {t('log_a_meal')}
          </button>
        </div>

        {/* Macro progress */}
        <div className="grid grid-cols-4 gap-4">
          {MACRO_CONFIG.map(({ key, labelKey, unit, color, light, text }) => {
            const logged = Math.round(totals[key])
            const goal = goals[key]
            const pct = Math.min((logged / goal) * 100, 100)
            const remaining = Math.max(goal - logged, 0)
            return (
              <div key={key} className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_0_#7B5EA714]">
                <p className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${text}`}>{t(labelKey)}</p>
                <p className="text-2xl font-display font-bold text-[#2D1F3D]">
                  {logged}
                  <span className="text-xs font-normal text-[#7A6775] ml-1">{unit}</span>
                </p>
                <div className={`w-full h-1.5 ${light} rounded-full mt-2 mb-1`}>
                  <div className={`h-1.5 ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[10px] text-[#7A6775]">
                  {remaining}{unit} {t('remaining')} · {t('goal')} {goal}{unit}
                </p>
              </div>
            )
          })}
        </div>

        <div className="flex gap-6">
          {/* Today's plan */}
          <div className="flex-1 space-y-3">
            <h2 className="font-display font-bold text-[16px] text-[#2D1F3D]">{t('todays_plan')}</h2>

            {todaySlots.length === 0 && plan !== undefined && (
              <div className="bg-white rounded-2xl p-6 text-center shadow-[0_4px_20px_0_#7B5EA714]">
                <p className="text-sm text-[#7A6775]">{t('no_planned_meals')}</p>
              </div>
            )}

            {todaySlots.map((slot, i) => {
              const recipe = recipeMap.get(slot.recipeId)
              const dot = MEAL_DOT[slot.meal] ?? 'bg-[#7A6775]'
              const cal = recipe?.nutrition
                ? Math.round(recipe.nutrition.calories * slot.servings / (recipe.servings || 1))
                : null
              return (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_0_#7B5EA714] flex items-center gap-4">
                  <div className={cn('w-1 self-stretch rounded-full shrink-0', dot)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[#7A6775] mb-0.5">
                      {MEAL_LABELS[lang][slot.meal]}
                    </p>
                    <p className="text-sm font-semibold text-[#2D1F3D] truncate">
                      {recipe?.title ?? t('loading')}
                    </p>
                    {cal !== null && (
                      <p className="text-[11px] text-[#7A6775]">{cal} kcal</p>
                    )}
                  </div>
                  <button
                    onClick={() => openLog(slot.recipeId)}
                    className="text-[12px] font-semibold text-[#7B5EA7] border border-[#7B5EA7] px-3 py-1.5 rounded-full hover:bg-[#EEE0FF] transition-colors shrink-0"
                  >
                    {t('log')}
                  </button>
                </div>
              )
            })}

            {/* Logged meals */}
            {entries.length > 0 && (
              <>
                <h2 className="font-display font-bold text-[16px] text-[#2D1F3D] pt-2">{t('logged_meals')}</h2>
                {entries.map((entry, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_0_#7B5EA714] flex items-center gap-4 group">
                    <div className="w-1 self-stretch rounded-full bg-[#7B5EA7] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#2D1F3D] truncate">{entry.label}</p>
                      <p className="text-[11px] text-[#7A6775]">
                        {entry.calories} kcal · {entry.protein}g P · {entry.carbs}g C · {entry.fat}g F
                      </p>
                    </div>
                    <button
                      onClick={() => removeEntry({ date: today, index: i })}
                      className="opacity-0 group-hover:opacity-100 text-[#E8D9C8] hover:text-red-400 transition-all shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* This week panel */}
          <div className="w-64 shrink-0 bg-white rounded-2xl p-6 shadow-[0_4px_20px_0_#7B5EA714] h-fit">
            <h2 className="font-display font-bold text-[16px] text-[#2D1F3D] mb-1">{t('this_week')}</h2>
            <p className="text-[12px] text-[#7A6775] mb-5">
              {(plan?.slots ?? []).length} {lang === 'pt' ? 'refeições planeadas' : 'meals planned'}
            </p>

            <div className="space-y-2 text-sm">
              {DAY_SHORT[lang].map((day, i) => {
                const count = (plan?.slots ?? []).filter(s => s.day === i).length
                return (
                  <div key={day} className="flex items-center justify-between">
                    <span className={cn('w-8 text-[12px]', i === dayIdx ? 'font-bold text-[#7B5EA7]' : 'text-[#7A6775]')}>{day}</span>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map(j => (
                        <div
                          key={j}
                          className={cn(
                            'w-4 h-4 rounded-md',
                            j < count ? 'bg-[#7B5EA7]' : 'bg-[#EEE0FF]'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <LogMealModal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        date={today}
        prefillRecipeId={prefillId}
      />
    </>
  )
}
