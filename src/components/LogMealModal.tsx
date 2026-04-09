import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { X, Search, ChefHat, Check } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/language'

type Tab = 'recipe' | 'manual'

interface LogMealModalProps {
  open: boolean
  onClose: () => void
  date: string
  prefillRecipeId?: Id<'recipes'>
}

export function LogMealModal({ open, onClose, date, prefillRecipeId }: LogMealModalProps) {
  const { t } = useLanguage()
  const recipes = useQuery(api.functions.recipes.list)
  const logMeal = useMutation(api.functions.nutritionLogs.logMeal)

  const [tab, setTab] = useState<Tab>(prefillRecipeId ? 'recipe' : 'recipe')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<Id<'recipes'> | null>(prefillRecipeId ?? null)
  const [servings, setServings] = useState('1')
  const [saving, setSaving] = useState(false)

  // Manual entry
  const [manualLabel, setManualLabel] = useState('')
  const [manualCal, setManualCal] = useState('')
  const [manualProtein, setManualProtein] = useState('')
  const [manualCarbs, setManualCarbs] = useState('')
  const [manualFat, setManualFat] = useState('')

  const filtered = (recipes ?? []).filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase())
  )

  const selectedRecipe = recipes?.find(r => r._id === selectedId)
  const numServings = Number(servings) || 1
  const scaleFactor = selectedRecipe ? numServings / selectedRecipe.servings : 1

  function reset() {
    setSearch('')
    setSelectedId(prefillRecipeId ?? null)
    setServings('1')
    setManualLabel(''); setManualCal(''); setManualProtein(''); setManualCarbs(''); setManualFat('')
    setTab('recipe')
  }

  function handleClose() { reset(); onClose() }

  async function handleLogRecipe() {
    if (!selectedRecipe) return
    setSaving(true)
    try {
      const n = selectedRecipe.nutrition
      await logMeal({
        date,
        entry: {
          recipeId: selectedRecipe._id,
          label: selectedRecipe.title,
          servings: numServings,
          calories: n ? Math.round(n.calories * scaleFactor) : 0,
          protein:  n ? Math.round(n.protein  * scaleFactor) : 0,
          carbs:    n ? Math.round(n.carbs    * scaleFactor) : 0,
          fat:      n ? Math.round(n.fat      * scaleFactor) : 0,
        },
      })
      handleClose()
    } finally {
      setSaving(false)
    }
  }

  async function handleLogManual() {
    if (!manualLabel.trim()) return
    setSaving(true)
    try {
      await logMeal({
        date,
        entry: {
          label: manualLabel.trim(),
          servings: 1,
          calories: Number(manualCal) || 0,
          protein:  Number(manualProtein) || 0,
          carbs:    Number(manualCarbs) || 0,
          fat:      Number(manualFat) || 0,
        },
      })
      handleClose()
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  const inputCls = 'w-full bg-[#FDF8F2] border border-[#E8D9C8] rounded-xl px-3 py-2.5 text-sm text-[#2D1F3D] placeholder:text-[#7A6775] outline-none focus:border-[#7B5EA7] transition-colors'

  return (
    <div className="fixed inset-0 bg-[#2D1F3D]/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8D9C8]">
          <h2 className="font-display font-bold text-lg text-[#2D1F3D]">{t('log_meal_title')}</h2>
          <button onClick={handleClose} className="text-[#7A6775] hover:text-[#2D1F3D] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4">
          {(['recipe', 'manual'] as Tab[]).map(id => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'flex-1 py-2 rounded-full text-[13px] font-semibold border transition-colors',
                tab === id
                  ? 'bg-[#7B5EA7] text-white border-[#7B5EA7]'
                  : 'text-[#7A6775] border-[#E8D9C8] hover:bg-[#F5EDE0]',
              )}
            >
              {id === 'recipe' ? t('from_recipe') : t('manual_entry')}
            </button>
          ))}
        </div>

        {/* From recipe */}
        {tab === 'recipe' && (
          <>
            <div className="px-6 pt-4 relative">
              <Search size={15} className="absolute left-9 top-1/2 translate-y-0.5 text-[#7A6775]" />
              <input
                type="text"
                placeholder={t('search_recipes_picker')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#FDF8F2] border border-[#E8D9C8] rounded-full pl-9 pr-4 py-2 text-sm text-[#2D1F3D] placeholder:text-[#7A6775] outline-none focus:border-[#7B5EA7] transition-colors"
              />
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
              {recipes === undefined && (
                <p className="text-center text-[#7A6775] text-sm py-6">{t('loading')}</p>
              )}
              {filtered.map(r => (
                <button
                  key={r._id}
                  onClick={() => { setSelectedId(r._id); setServings('1') }}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors border',
                    selectedId === r._id
                      ? 'bg-[#EEE0FF] border-[#7B5EA7]'
                      : 'bg-[#FDF8F2] border-transparent hover:bg-[#F5EDE0]',
                  )}
                >
                  <div className="w-9 h-9 bg-[#EEE0FF] rounded-lg flex items-center justify-center shrink-0">
                    <ChefHat size={16} className="text-[#7B5EA7] opacity-50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#2D1F3D] truncate">{r.title}</p>
                    <p className="text-[11px] text-[#7A6775]">
                      {r.nutrition ? `${r.nutrition.calories} kcal · ${r.servings} servings` : t('no_nutrition')}
                    </p>
                  </div>
                  {selectedId === r._id && <Check size={16} className="text-[#7B5EA7] shrink-0" />}
                </button>
              ))}
            </div>

            {selectedRecipe && (
              <div className="px-6 py-4 border-t border-[#E8D9C8] space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-[12px] font-semibold text-[#7A6775] shrink-0">{t('servings')}</label>
                  <input
                    type="number" min="0.5" step="0.5"
                    value={servings}
                    onChange={e => setServings(e.target.value)}
                    className="w-20 bg-[#FDF8F2] border border-[#E8D9C8] rounded-xl px-3 py-2 text-sm text-[#2D1F3D] outline-none focus:border-[#7B5EA7] transition-colors text-center"
                  />
                  {selectedRecipe.nutrition && (
                    <div className="flex gap-3 text-[11px] text-[#7A6775] flex-1 justify-end">
                      <span className="font-semibold text-[#7B5EA7]">{Math.round(selectedRecipe.nutrition.calories * scaleFactor)} kcal</span>
                      <span>{Math.round(selectedRecipe.nutrition.protein * scaleFactor)}g P</span>
                      <span>{Math.round(selectedRecipe.nutrition.carbs * scaleFactor)}g C</span>
                      <span>{Math.round(selectedRecipe.nutrition.fat * scaleFactor)}g F</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLogRecipe}
                  disabled={saving}
                  className="w-full bg-[#7B5EA7] text-white font-semibold py-2.5 rounded-full hover:bg-[#6a4e94] transition-colors text-sm disabled:opacity-50"
                >
                  {saving ? t('saving') : t('log_confirm')}
                </button>
              </div>
            )}
          </>
        )}

        {/* Manual entry */}
        {tab === 'manual' && (
          <div className="px-6 py-4 space-y-3 flex-1">
            <input
              className={inputCls}
              placeholder="e.g. Greek yoghurt with granola"
              value={manualLabel}
              onChange={e => setManualLabel(e.target.value)}
            />
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'kcal', value: manualCal, set: setManualCal },
                { label: 'P (g)', value: manualProtein, set: setManualProtein },
                { label: 'C (g)', value: manualCarbs, set: setManualCarbs },
                { label: 'F (g)', value: manualFat, set: setManualFat },
              ].map(({ label, value, set }) => (
                <div key={label}>
                  <p className="text-[11px] text-[#7A6775] mb-1">{label}</p>
                  <input
                    type="number" min="0"
                    className={inputCls}
                    placeholder="0"
                    value={value}
                    onChange={e => set(e.target.value)}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleLogManual}
              disabled={!manualLabel.trim() || saving}
              className="w-full bg-[#7B5EA7] text-white font-semibold py-2.5 rounded-full hover:bg-[#6a4e94] transition-colors text-sm disabled:opacity-50"
            >
              {saving ? t('saving') : t('log_confirm')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
