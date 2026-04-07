import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const stats = [
  { label: 'Calories',  value: '1,240', unit: 'kcal' },
  { label: 'Protein',   value: '68',    unit: 'g' },
  { label: 'Carbs',     value: '124',   unit: 'g' },
  { label: 'Fat',       value: '42',    unit: 'g' },
]

const meals = [
  {
    type: 'Breakfast',
    name: 'Overnight Oats & Berries',
    time: '8:00 AM',
    calories: 283,
    color: 'bg-[#EEE0FF]',
    dot: 'bg-[#7B5EA7]',
    logged: true,
  },
  {
    type: 'Lunch',
    name: 'Grilled Chicken Bowl',
    time: '12:30 PM',
    calories: 587,
    color: 'bg-[#E8F5EE]',
    dot: 'bg-[#2D9B5C]',
    logged: true,
  },
  {
    type: 'Dinner',
    name: 'Salmon & Quinoa',
    time: '7:00 PM',
    calories: 451,
    color: 'bg-[#F5EDE0]',
    dot: 'bg-[#E89B6C]',
    logged: false,
  },
]

function StatCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_0_#7B5EA714] flex-1">
      <p className="text-[12px] text-[#7A6775] mb-1">{label}</p>
      <p className="text-2xl font-display font-bold text-[#2D1F3D]">
        {value}
        <span className="text-sm font-normal text-[#7A6775] ml-1">{unit}</span>
      </p>
    </div>
  )
}

function MealCard({ meal }: { meal: typeof meals[number] }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_0_#7B5EA714] flex items-center gap-4">
      <div className={cn('w-1 self-stretch rounded-full', meal.dot)} />
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', meal.color)}>
        <div className={cn('w-2.5 h-2.5 rounded-full', meal.dot)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-[#7A6775] mb-0.5">{meal.type} · {meal.time}</p>
        <p className="text-sm font-semibold text-[#2D1F3D] truncate">{meal.name}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-[#2D1F3D]">{meal.calories}</p>
        <p className="text-[11px] text-[#7A6775]">kcal</p>
      </div>
      {meal.logged && (
        <CheckCircle2 size={18} className="text-[#2D9B5C] shrink-0" />
      )}
    </div>
  )
}

export function Today() {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#2D1F3D]">
            Good morning, Marta
          </h1>
          <p className="text-sm text-[#7A6775] mt-0.5">{today}</p>
        </div>
        <button className="bg-[#7B5EA7] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#6a4e94] transition-colors">
          Log a meal
        </button>
      </div>

      {/* Macro stats */}
      <div className="flex gap-4">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Main content */}
      <div className="flex gap-6">
        {/* Today's meals */}
        <div className="flex-1 space-y-3">
          <h2 className="font-display font-bold text-[16px] text-[#2D1F3D]">Today's Menu</h2>
          {meals.map(m => <MealCard key={m.name} meal={m} />)}
        </div>

        {/* This week panel */}
        <div className="w-72 shrink-0 bg-white rounded-2xl p-6 shadow-[0_4px_20px_0_#7B5EA714] h-fit">
          <h2 className="font-display font-bold text-[16px] text-[#2D1F3D] mb-1">This Week</h2>
          <p className="text-[12px] text-[#7A6775] mb-5">3 logged · 18 planned</p>

          {/* Progress bar */}
          <div className="w-full h-2 bg-[#EEE0FF] rounded-full mb-5">
            <div className="h-2 bg-[#7B5EA7] rounded-full" style={{ width: '14%' }} />
          </div>

          <div className="space-y-2 text-sm">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <div key={day} className="flex items-center justify-between">
                <span className="text-[#7A6775] w-8">{day}</span>
                <div className="flex gap-1">
                  {[0, 1, 2].map(j => (
                    <div
                      key={j}
                      className={cn(
                        'w-5 h-5 rounded-md',
                        i === 0 && j < 3 ? 'bg-[#7B5EA7]' :
                        i < 3 ? 'bg-[#EEE0FF]' : 'bg-[#F5EDE0]'
                      )}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button className="mt-6 w-full text-[#7B5EA7] text-sm font-semibold border border-[#E8D9C8] rounded-full py-2 hover:bg-[#EEE0FF] transition-colors">
            View meal plan
          </button>
        </div>
      </div>
    </div>
  )
}
