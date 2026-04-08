import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { cn } from '@/lib/utils'
import { getWeekStart, addWeeks, formatShort, weekDays } from '@/lib/dates'
import { RecipePicker } from '@/components/RecipePicker'

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']
const MEAL_COLORS: Record<MealType, { dot: string; bg: string }> = {
  breakfast: { dot: 'bg-[#7B5EA7]', bg: 'bg-[#EEE0FF]' },
  lunch:     { dot: 'bg-[#2D9B5C]', bg: 'bg-[#E8F5EE]' },
  dinner:    { dot: 'bg-[#E89B6C]', bg: 'bg-[#FFF3E8]' },
  snack:     { dot: 'bg-[#7A6775]', bg: 'bg-[#F5EDE0]' },
}

export function MealPlan() {
  const [weekStart, setWeekStart] = useState(getWeekStart())
  const [selectedDay, setSelectedDay] = useState(0)
  const [pickerOpen, setPickerOpen] = useState(false)

  const plan = useQuery(api.functions.mealPlans.getByWeek, { weekStart })
  const addSlot = useMutation(api.functions.mealPlans.addSlot)
  const removeSlot = useMutation(api.functions.mealPlans.removeSlot)

  // Fetch all recipes so we can show names
  const allRecipes = useQuery(api.functions.recipes.list)
  const recipeMap = new Map(allRecipes?.map(r => [r._id, r]) ?? [])

  const days = weekDays(weekStart)
  const slotsForDay = (plan?.slots ?? []).filter(s => s.day === selectedDay)

  // Count meals per day for the grid dots
  function mealsOnDay(dayIdx: number) {
    return (plan?.slots ?? []).filter(s => s.day === dayIdx).length
  }

  async function handlePick(recipeId: Id<'recipes'>, meal: MealType, servings: number) {
    await addSlot({ weekStart, day: selectedDay, meal, recipeId, servings })
    setPickerOpen(false)
  }

  async function handleRemove(meal: MealType) {
    await removeSlot({ weekStart, day: selectedDay, meal })
  }

  const weekLabel = `${formatShort(days[0])} – ${formatShort(days[6])}, ${new Date(days[0] + 'T00:00:00').getFullYear()}`

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-[#2D1F3D]">Meal Plan</h1>
            <p className="text-sm text-[#7A6775] mt-0.5">{weekLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekStart(w => addWeeks(w, -1))}
              className="w-9 h-9 rounded-full border border-[#E8D9C8] flex items-center justify-center text-[#7A6775] hover:bg-[#F5EDE0] transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setWeekStart(getWeekStart())}
              className="text-[12px] font-semibold text-[#7B5EA7] px-3 py-1 rounded-full border border-[#E8D9C8] hover:bg-[#EEE0FF] transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setWeekStart(w => addWeeks(w, 1))}
              className="w-9 h-9 rounded-full border border-[#E8D9C8] flex items-center justify-center text-[#7A6775] hover:bg-[#F5EDE0] transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Week grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((dateStr, i) => {
            const isSelected = i === selectedDay
            const isWeekend = i >= 5
            const isToday = dateStr === getWeekStart(new Date()).split('T')[0] &&
              dateStr === new Date().toISOString().split('T')[0]
            const count = mealsOnDay(i)
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDay(i)}
                className={cn(
                  'rounded-2xl py-4 flex flex-col items-center gap-1 transition-colors border',
                  isSelected
                    ? 'bg-[#7B5EA7] text-white border-transparent shadow-[0_4px_20px_0_#7B5EA740]'
                    : isWeekend
                    ? 'bg-[#F5EDE0] text-[#7A6775] border-[#E8D9C8] hover:bg-[#EEE0FF]'
                    : 'bg-[#EEE0FF] text-[#2D1F3D] border-transparent hover:bg-[#e0d0f7]',
                )}
              >
                <span className={cn('text-[11px] font-medium', isSelected ? 'text-white/70' : 'text-[#7A6775]')}>
                  {DAY_SHORT[i]}
                </span>
                <span className="text-xl font-display font-bold">
                  {new Date(dateStr + 'T00:00:00').getDate()}
                </span>
                <div className="flex gap-0.5">
                  {count > 0
                    ? Array.from({ length: Math.min(count, 4) }).map((_, j) => (
                        <div key={j} className={cn('w-1.5 h-1.5 rounded-full', isSelected ? 'bg-white/60' : 'bg-[#7B5EA7]')} />
                      ))
                    : <div className="w-1.5 h-1.5" />
                  }
                </div>
                {isToday && !isSelected && (
                  <span className="text-[9px] font-bold text-[#7B5EA7] uppercase tracking-wide">Today</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Day detail panel */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_0_#7B5EA714]">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-lg text-[#2D1F3D]">
                {DAY_NAMES[selectedDay]}, {formatShort(days[selectedDay])}
              </h2>
              <p className="text-[12px] text-[#7A6775] mt-0.5">
                {slotsForDay.length === 0
                  ? 'No meals planned'
                  : `${slotsForDay.length} meal${slotsForDay.length > 1 ? 's' : ''} planned`}
              </p>
            </div>
            <button
              onClick={() => setPickerOpen(true)}
              className="flex items-center gap-1.5 bg-[#7B5EA7] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#6a4e94] transition-colors"
            >
              <Plus size={15} /> Add meal
            </button>
          </div>

          {slotsForDay.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-[#7A6775] text-sm">Nothing planned yet for this day.</p>
              <button
                onClick={() => setPickerOpen(true)}
                className="mt-3 bg-[#EEE0FF] text-[#7B5EA7] text-sm font-semibold px-5 py-2 rounded-full hover:bg-[#e0d0f7] transition-colors"
              >
                Add a recipe
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {MEAL_ORDER.filter(m => slotsForDay.some(s => s.meal === m)).map(mealType => {
                const slot = slotsForDay.find(s => s.meal === mealType)!
                const recipe = recipeMap.get(slot.recipeId)
                const colors = MEAL_COLORS[mealType]
                return (
                  <div key={mealType} className="flex items-center gap-4 p-4 rounded-xl bg-[#FDF8F2] group">
                    <div className={cn('w-2 self-stretch rounded-full shrink-0', colors.dot)} />
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', colors.bg)}>
                      <div className={cn('w-2.5 h-2.5 rounded-full', colors.dot)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-[#7A6775] capitalize mb-0.5">{mealType}</p>
                      <p className="text-sm font-semibold text-[#2D1F3D] truncate">
                        {recipe?.title ?? 'Loading…'}
                      </p>
                      {recipe && (
                        <p className="text-[11px] text-[#7A6775]">
                          {slot.servings} serving{slot.servings !== 1 ? 's' : ''}
                          {recipe.nutrition ? ` · ${Math.round(recipe.nutrition.calories * slot.servings / recipe.servings)} kcal` : ''}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(mealType)}
                      className="opacity-0 group-hover:opacity-100 text-[#E8D9C8] hover:text-red-400 transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <RecipePicker
        open={pickerOpen}
        dayLabel={`${DAY_NAMES[selectedDay]}`}
        onClose={() => setPickerOpen(false)}
        onPick={handlePick}
      />
    </>
  )
}
