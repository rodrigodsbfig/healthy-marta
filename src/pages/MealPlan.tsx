import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const days = [
  { short: 'Mon', date: 7 },
  { short: 'Tue', date: 8 },
  { short: 'Wed', date: 9 },
  { short: 'Thu', date: 10 },
  { short: 'Fri', date: 11 },
  { short: 'Sat', date: 12 },
  { short: 'Sun', date: 13 },
]

const planData: Record<number, { type: string; name: string; calories: number; dot: string }[]> = {
  0: [
    { type: 'Breakfast', name: 'Overnight Oats & Berries', calories: 283, dot: 'bg-[#7B5EA7]' },
    { type: 'Lunch',     name: 'Grilled Chicken Bowl',    calories: 587, dot: 'bg-[#2D9B5C]' },
    { type: 'Dinner',    name: 'Salmon & Quinoa',         calories: 451, dot: 'bg-[#E89B6C]' },
  ],
  1: [
    { type: 'Breakfast', name: 'Greek Yogurt & Granola',  calories: 320, dot: 'bg-[#7B5EA7]' },
    { type: 'Dinner',    name: 'Chicken Stir Fry',        calories: 510, dot: 'bg-[#E89B6C]' },
  ],
  2: [
    { type: 'Lunch',     name: 'Lentil Soup',             calories: 380, dot: 'bg-[#2D9B5C]' },
  ],
}

export function MealPlan() {
  const [selectedDay, setSelectedDay] = useState(0)
  const dayMeals = planData[selectedDay] ?? []
  const selectedDayData = days[selectedDay]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#2D1F3D]">This Week</h1>
          <p className="text-sm text-[#7A6775] mt-0.5">Apr 7 – 13, 2025</p>
        </div>
        <button className="bg-[#7B5EA7] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#6a4e94] transition-colors flex items-center gap-2">
          <Plus size={16} />
          Plan meals
        </button>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2.5">
        {days.map((day, i) => {
          const isActive = i === selectedDay
          const isWeekend = i >= 5
          return (
            <button
              key={day.short}
              onClick={() => setSelectedDay(i)}
              className={cn(
                'rounded-2xl py-4 flex flex-col items-center gap-1 transition-colors border',
                isActive
                  ? 'bg-[#7B5EA7] text-white border-transparent shadow-[0_4px_20px_0_#7B5EA740]'
                  : isWeekend
                  ? 'bg-[#F5EDE0] text-[#7A6775] border-[#E8D9C8] hover:bg-[#EEE0FF]'
                  : 'bg-[#EEE0FF] text-[#2D1F3D] border-transparent hover:bg-[#e0d0f7]',
              )}
            >
              <span className="text-[11px] font-medium opacity-70">{day.short}</span>
              <span className="text-xl font-display font-bold">{day.date}</span>
              {(planData[i]?.length ?? 0) > 0 && (
                <div className={cn('w-1.5 h-1.5 rounded-full', isActive ? 'bg-white/60' : 'bg-[#7B5EA7]')} />
              )}
            </button>
          )
        })}
      </div>

      {/* Day detail */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_0_#7B5EA714]">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-display font-bold text-lg text-[#2D1F3D]">
              {selectedDayData.short === 'Mon' ? 'Monday' :
               selectedDayData.short === 'Tue' ? 'Tuesday' :
               selectedDayData.short === 'Wed' ? 'Wednesday' :
               selectedDayData.short === 'Thu' ? 'Thursday' :
               selectedDayData.short === 'Fri' ? 'Friday' :
               selectedDayData.short === 'Sat' ? 'Saturday' : 'Sunday'}, April {selectedDayData.date}
            </h2>
            <p className="text-[12px] text-[#7A6775] mt-0.5">
              {dayMeals.length === 0 ? 'No meals planned' : `${dayMeals.length} recipe${dayMeals.length > 1 ? 's' : ''} planned`}
            </p>
          </div>
          <button className="flex items-center gap-1.5 text-[#7B5EA7] text-sm font-semibold hover:opacity-80 transition-opacity">
            <Plus size={16} />
            Add meal
          </button>
        </div>

        {dayMeals.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-[#7A6775] text-sm">No meals planned for this day.</p>
            <button className="mt-3 bg-[#EEE0FF] text-[#7B5EA7] text-sm font-semibold px-5 py-2 rounded-full hover:bg-[#e0d0f7] transition-colors">
              Add a recipe
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {dayMeals.map((meal) => (
              <div key={meal.name} className="flex items-center gap-4 p-4 rounded-xl bg-[#FDF8F2]">
                <div className={cn('w-1 self-stretch rounded-full', meal.dot)} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[#7A6775] mb-0.5">{meal.type}</p>
                  <p className="text-sm font-semibold text-[#2D1F3D] truncate">{meal.name}</p>
                </div>
                <span className="text-sm text-[#7A6775] shrink-0">{meal.calories} kcal</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
