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

const MACRO_SECONDARY = [
  { key: 'protein' as const, labelKey: 'protein_label' as const, unit: 'g', color: 'bg-[#2D9B5C]', light: 'bg-[#E8F5EE]', text: 'text-[#2D9B5C]' },
  { key: 'carbs'   as const, labelKey: 'carbs_label'   as const, unit: 'g', color: 'bg-[#E89B6C]', light: 'bg-[#FFF3E8]', text: 'text-[#E89B6C]' },
  { key: 'fat'     as const, labelKey: 'fat_label'     as const, unit: 'g', color: 'bg-[#7A6775]', light: 'bg-[#F5EDE0]', text: 'text-[#7A6775]' },
]

const MEAL_DOT: Record<string, string> = {
  breakfast: 'bg-[#7B5EA7]',
  lunch:     'bg-[#2D9B5C]',
  dinner:    'bg-[#E89B6C]',
  snack:     'bg-[#7A6775]',
}

const MEAL_BG: Record<string, string> = {
  breakfast: 'bg-[#EEE0FF]',
  lunch:     'bg-[#E8F5EE]',
  dinner:    'bg-[#FFF3E8]',
  snack:     'bg-[#F5EDE0]',
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function todayDayIndex() {
  return (new Date().getDay() + 6) % 7
}

function CalRing({ pct }: { pct: number }) {
  const r = 30
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(pct, 100) / 100)
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" className="shrink-0">
      <circle cx="38" cy="38" r={r} fill="none" stroke="#EEE0FF" strokeWidth="8" />
      <circle
        cx="38" cy="38" r={r} fill="none"
        stroke="#7B5EA7" strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 38 38)"
        style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  )
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
  const todaySlots = (plan?.slots ?? []).filter(s => s.day === dayIdx)

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

  const calLogged    = Math.round(totals.calories)
  const calGoal      = goals.calories
  const calPct       = Math.min((calLogged / calGoal) * 100, 100)
  const calRemaining = Math.max(calGoal - calLogged, 0)

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
        <div className="space-y-3">
          {/* Calories — featured card */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_0_#7B5EA714] flex items-center gap-5">
            <div className="relative shrink-0">
              <CalRing pct={calPct} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] font-bold text-[#7B5EA7]">{Math.round(calPct)}%</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7B5EA7] mb-1">{t('cal_label')}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-display font-bold text-[#2D1F3D]">{calLogged}</span>
                <span className="text-sm text-[#7A6775]">/ {calGoal} kcal</span>
              </div>
              <div className="w-full h-2.5 bg-[#EEE0FF] rounded-full mt-2.5">
                <div
                  className="h-2.5 bg-[#7B5EA7] rounded-full transition-all"
                  style={{ width: `${calPct}%` }}
                />
              </div>
              <p className="text-[11px] text-[#7A6775] mt-1.5">
                {calRemaining} kcal {t('remaining')}
              </p>
            </div>
          </div>

          {/* Protein / Carbs / Fat */}
          <div className="grid grid-cols-3 gap-3">
            {MACRO_SECONDARY.map(({ key, labelKey, unit, color, light, text }) => {
              const logged    = Math.round(totals[key])
              const goal      = goals[key]
              const pct       = Math.min((logged / goal) * 100, 100)
              const remaining = Math.max(goal - logged, 0)
              return (
                <div key={key} className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_0_#7B5EA714]">
                  <p className={`text-[11px] font-semibold uppercase tracking-wide mb-1.5 ${text}`}>{t(labelKey)}</p>
                  <p className="text-xl font-display font-bold text-[#2D1F3D]">
                    {logged}<span className="text-xs font-normal text-[#7A6775] ml-1">{unit}</span>
                  </p>
                  <div className={`w-full h-2 ${light} rounded-full mt-2`}>
                    <div className={`h-2 ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-[#7A6775] mt-1">{remaining}{unit} {t('remaining')}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Today's plan + logged meals */}
          <div className="flex-1 space-y-3">
            <h2 className="font-display font-bold text-[16px] text-[#2D1F3D]">{t('todays_plan')}</h2>

            {todaySlots.length === 0 && plan !== undefined && (
              <div className="bg-white rounded-2xl p-6 text-center shadow-[0_4px_20px_0_#7B5EA714]">
                <p className="text-sm text-[#7A6775]">{t('no_planned_meals')}</p>
              </div>
            )}

            {todaySlots.map((slot, i) => {
              const recipe = recipeMap.get(slot.recipeId)
              const dot    = MEAL_DOT[slot.meal] ?? 'bg-[#7A6775]'
              const bg     = MEAL_BG[slot.meal]  ?? 'bg-[#F5EDE0]'
              const cal    = recipe?.nutrition
                ? Math.round(recipe.nutrition.calories * slot.servings / (recipe.servings || 1))
                : null
              return (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_0_#7B5EA714] flex items-center gap-4">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', bg)}>
                    <div className={cn('w-2.5 h-2.5 rounded-full', dot)} />
                  </div>
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
          <div className="w-56 shrink-0 bg-white rounded-2xl p-5 shadow-[0_4px_20px_0_#7B5EA714] h-fit">
            <h2 className="font-display font-bold text-[15px] text-[#2D1F3D] mb-1">{t('this_week')}</h2>
            <p className="text-[11px] text-[#7A6775] mb-4">
              {(plan?.slots ?? []).length} {lang === 'pt' ? 'refeições' : 'meals planned'}
            </p>

            <div className="space-y-2">
              {DAY_SHORT[lang].map((day, i) => {
                const count = (plan?.slots ?? []).filter(s => s.day === i).length
                const isToday = i === dayIdx
                return (
                  <div key={day} className="flex items-center gap-2">
                    <span className={cn(
                      'w-7 text-[11px] shrink-0',
                      isToday ? 'font-bold text-[#7B5EA7]' : 'text-[#7A6775]'
                    )}>
                      {day}
                    </span>
                    <div className="flex gap-1 flex-1">
                      {[0, 1, 2, 3].map(j => (
                        <div
                          key={j}
                          className={cn(
                            'flex-1 h-3.5 rounded',
                            j < count
                              ? isToday ? 'bg-[#7B5EA7]' : 'bg-[#C4B0E0]'
                              : 'bg-[#EEE0FF]'
                          )}
                        />
                      ))}
                    </div>
                    {count > 0 && (
                      <span className={cn('text-[10px] w-3 text-right', isToday ? 'text-[#7B5EA7] font-bold' : 'text-[#7A6775]')}>
                        {count}
                      </span>
                    )}
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
