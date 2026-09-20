import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { ChevronLeft, ChevronRight, Flame, Dumbbell } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/language'
import { DAY_SHORT } from '@/lib/translations'
import { currentStreak, monthGrid, isoDate } from '@/lib/streak'

const MONTHS = {
  pt: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  en: ['January', 'February', 'March', 'April', 'May', 'June',
       'July', 'August', 'September', 'October', 'November', 'December'],
}

const COPY = {
  pt: {
    title: 'Treinos', streak: 'semanas seguidas', streakDays: 'dias seguidos',
    thisMonth: 'treinos este mês', tapHint: 'Toca num dia para marcar que treinaste.',
    noneYet: 'Ainda sem treinos este mês.',
  },
  en: {
    title: 'Workouts', streak: 'weeks in a row', streakDays: 'days in a row',
    thisMonth: 'workouts this month', tapHint: 'Tap a day to mark that you trained.',
    noneYet: 'No workouts yet this month.',
  },
}

export function Workouts() {
  const { lang } = useLanguage()
  const c = COPY[lang]
  const today = new Date()
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() })

  const all = useQuery(api.functions.workouts.listAll)
  const toggleDay = useMutation(api.functions.workouts.toggleDay)

  const trained = new Set((all ?? []).map(w => w.date))
  const cells = monthGrid(cursor.year, cursor.month)
  const todayIso = isoDate(today)
  const streak = currentStreak(trained, today)

  const monthCount = cells.filter(d => d && trained.has(d)).length

  function shiftMonth(delta: number) {
    setCursor(({ year, month }) => {
      const m = month + delta
      if (m < 0) return { year: year - 1, month: 11 }
      if (m > 11) return { year: year + 1, month: 0 }
      return { year, month: m }
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#2D1F3D]">{c.title}</h1>
          <p className="text-sm text-[#7A6775] mt-0.5">{c.tapHint}</p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 bg-[#FFF3E8] border border-[#E89B6C]/40 rounded-full px-3.5 py-1.5">
            <Flame size={15} className="text-[#E89B6C]" />
            <span className="text-sm font-semibold text-[#2D1F3D]">
              {streak} <span className="font-normal text-[#7A6775]">{c.streakDays}</span>
            </span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_0_#7B5EA714]">
        {/* Month header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-lg text-[#2D1F3D]">
            {MONTHS[lang][cursor.month]} {cursor.year}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => shiftMonth(-1)}
              aria-label={lang === 'pt' ? 'Mês anterior' : 'Previous month'}
              className="w-8 h-8 rounded-full border border-[#E8D9C8] flex items-center justify-center text-[#7A6775] hover:border-[#7B5EA7] hover:text-[#7B5EA7] transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => shiftMonth(1)}
              aria-label={lang === 'pt' ? 'Mês seguinte' : 'Next month'}
              className="w-8 h-8 rounded-full border border-[#E8D9C8] flex items-center justify-center text-[#7A6775] hover:border-[#7B5EA7] hover:text-[#7B5EA7] transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Weekday headings */}
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {DAY_SHORT[lang].map(d => (
            <div key={d} className="text-center text-[11px] font-semibold text-[#7A6775]">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((date, i) => {
            if (!date) return <div key={`blank-${i}`} />
            const isTrained = trained.has(date)
            const isToday = date === todayIso
            const isFuture = date > todayIso
            return (
              <button
                key={date}
                onClick={() => !isFuture && toggleDay({ date })}
                disabled={isFuture}
                aria-pressed={isTrained}
                aria-label={`${date}${isTrained ? ' — treinou' : ''}`}
                className={cn(
                  'aspect-square rounded-xl text-sm font-semibold flex items-center justify-center transition-colors border',
                  isTrained
                    ? 'bg-[#7B5EA7] text-white border-[#7B5EA7] hover:bg-[#6a4e94]'
                    : isFuture
                    ? 'bg-[#FDF8F2] text-[#C9B8D9] border-transparent cursor-default'
                    : 'bg-[#FDF8F2] text-[#2D1F3D] border-transparent hover:border-[#7B5EA7]',
                  isToday && !isTrained && 'border-[#7B5EA7] border-2',
                )}
              >
                {Number(date.slice(-2))}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-[#E8D9C8]">
          <Dumbbell size={15} className="text-[#7B5EA7]" />
          <p className="text-[13px] text-[#7A6775]">
            {monthCount > 0
              ? <><span className="font-semibold text-[#2D1F3D]">{monthCount}</span> {c.thisMonth}</>
              : c.noneYet}
          </p>
        </div>
      </div>
    </div>
  )
}
