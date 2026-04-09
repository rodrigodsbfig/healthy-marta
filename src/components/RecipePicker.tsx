import { useState } from 'react'
import { useQuery } from 'convex/react'
import { X, Search, ChefHat, Check } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/language'
import { MEAL_LABELS } from '@/lib/translations'

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

interface RecipePickerProps {
  open: boolean
  dayLabel: string
  onClose: () => void
  onPick: (recipeId: Id<'recipes'>, meal: MealType, servings: number) => void
}

export function RecipePicker({ open, dayLabel, onClose, onPick }: RecipePickerProps) {
  const { t, lang } = useLanguage()
  const recipes = useQuery(api.functions.recipes.list)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<Id<'recipes'> | null>(null)
  const [meal, setMeal] = useState<MealType>('lunch')
  const [servings, setServings] = useState('1')

  const MEAL_TYPES: { value: MealType; label: string }[] = [
    { value: 'breakfast', label: MEAL_LABELS[lang].breakfast },
    { value: 'lunch',     label: MEAL_LABELS[lang].lunch },
    { value: 'dinner',    label: MEAL_LABELS[lang].dinner },
    { value: 'snack',     label: MEAL_LABELS[lang].snack },
  ]

  const filtered = (recipes ?? []).filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase())
  )

  function handleConfirm() {
    if (!selectedId) return
    onPick(selectedId, meal, Number(servings) || 1)
    setSelectedId(null)
    setSearch('')
    setMeal('lunch')
    setServings('1')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-[#2D1F3D]/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8D9C8]">
          <div>
            <h2 className="font-display font-bold text-base text-[#2D1F3D]">
              {lang === 'pt' ? `Adicionar a ${dayLabel}` : `Add to ${dayLabel}`}
            </h2>
            <p className="text-[12px] text-[#7A6775]">{t('pick_from_library')}</p>
          </div>
          <button onClick={onClose} className="text-[#7A6775] hover:text-[#2D1F3D] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Meal type */}
        <div className="px-5 pt-4 flex gap-2">
          {MEAL_TYPES.map(m => (
            <button
              key={m.value}
              onClick={() => setMeal(m.value)}
              className={cn(
                'flex-1 text-[12px] font-semibold py-1.5 rounded-full border transition-colors',
                meal === m.value
                  ? 'bg-[#7B5EA7] text-white border-[#7B5EA7]'
                  : 'text-[#7A6775] border-[#E8D9C8] hover:border-[#7B5EA7]',
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-5 pt-3 relative">
          <Search size={15} className="absolute left-8 top-1/2 translate-y-0.5 text-[#7A6775]" />
          <input
            type="text"
            placeholder={t('search_recipes_picker')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#FDF8F2] border border-[#E8D9C8] rounded-full pl-9 pr-4 py-2 text-sm text-[#2D1F3D] placeholder:text-[#7A6775] outline-none focus:border-[#7B5EA7] transition-colors"
          />
        </div>

        {/* Recipe list */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {recipes === undefined && (
            <p className="text-center text-[#7A6775] text-sm py-8">{t('loading')}</p>
          )}
          {recipes !== undefined && filtered.length === 0 && (
            <div className="text-center py-8">
              <ChefHat size={28} className="text-[#E8D9C8] mx-auto mb-2" />
              <p className="text-[#7A6775] text-sm">
                {search ? t('no_match') : t('no_recipes_add')}
              </p>
            </div>
          )}
          {filtered.map(r => (
            <button
              key={r._id}
              onClick={() => setSelectedId(r._id)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors border',
                selectedId === r._id
                  ? 'bg-[#EEE0FF] border-[#7B5EA7]'
                  : 'bg-[#FDF8F2] border-transparent hover:bg-[#F5EDE0]',
              )}
            >
              <div className="w-9 h-9 bg-[#EEE0FF] rounded-lg flex items-center justify-center shrink-0">
                <ChefHat size={18} className="text-[#7B5EA7] opacity-50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#2D1F3D] truncate">{r.title}</p>
                <p className="text-[11px] text-[#7A6775]">
                  {r.prepTime + r.cookTime} {t('min')} · {r.servings} {lang === 'pt' ? 'porções' : 'servings'}
                  {r.nutrition ? ` · ${r.nutrition.calories} kcal` : ''}
                </p>
              </div>
              {selectedId === r._id && (
                <Check size={16} className="text-[#7B5EA7] shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Servings + confirm */}
        {selectedId && (
          <div className="px-5 py-4 border-t border-[#E8D9C8] flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-[12px] font-semibold text-[#7A6775]">{t('servings')}</label>
              <input
                type="number"
                min="1"
                value={servings}
                onChange={e => setServings(e.target.value)}
                className="w-16 bg-[#FDF8F2] border border-[#E8D9C8] rounded-xl px-3 py-2 text-sm text-[#2D1F3D] outline-none focus:border-[#7B5EA7] transition-colors text-center"
              />
            </div>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-[#7B5EA7] text-white font-semibold py-2.5 rounded-full hover:bg-[#6a4e94] transition-colors text-sm"
            >
              {t('add_to_plan')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
