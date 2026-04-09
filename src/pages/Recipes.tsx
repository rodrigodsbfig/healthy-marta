import { useState } from 'react'
import { useQuery } from 'convex/react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Clock, ChefHat, ChevronDown } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/language'
import { translateTag } from '@/lib/translations'
import { RecipeForm } from '@/components/RecipeForm'
import { RecipeImport } from '@/components/RecipeImport'

type SortKey = 'default' | 'protein' | 'calories' | 'time'

type RecipePrefill = {
  title: string
  description?: string
  servings: number
  prepTime: number
  cookTime: number
  ingredients: { name: string; quantity: number; unit: string }[]
  steps: string[]
  tags: string[]
  nutrition?: { calories: number; protein: number; carbs: number; fat: number }
}

const CARD_PALETTES = [
  { bg: 'bg-[#EEE0FF]', icon: 'text-[#7B5EA7]' },
  { bg: 'bg-[#E8F5EE]', icon: 'text-[#2D9B5C]' },
  { bg: 'bg-[#FFF3E8]', icon: 'text-[#E89B6C]' },
  { bg: 'bg-[#F5EDE0]', icon: 'text-[#9B7060]' },
]

function cardPalette(title: string) {
  let hash = 0
  for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) >>> 0
  return CARD_PALETTES[hash % CARD_PALETTES.length]
}

export function Recipes() {
  const { t, lang } = useLanguage()
  const recipes  = useQuery(api.functions.recipes.list)
  const navigate = useNavigate()

  const [search,     setSearch]     = useState('')
  const [activeTag,  setActiveTag]  = useState<string | null>(null)
  const [sortBy,     setSortBy]     = useState<SortKey>('default')
  const [sortOpen,   setSortOpen]   = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [formOpen,   setFormOpen]   = useState(false)
  const [prefill,    setPrefill]    = useState<RecipePrefill | undefined>(undefined)

  // Collect all unique tags
  const allTags = [...new Set((recipes ?? []).flatMap(r => r.tags))].sort()

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'default',  label: t('sort_default')  },
    { key: 'protein',  label: t('sort_protein')  },
    { key: 'calories', label: t('sort_calories') },
    { key: 'time',     label: t('sort_time')     },
  ]

  const filtered = (recipes ?? [])
    .filter(r =>
      (r.title.toLowerCase().includes(search.toLowerCase()) ||
       r.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))) &&
      (activeTag === null || r.tags.includes(activeTag))
    )
    .sort((a, b) => {
      if (sortBy === 'protein')  return (b.nutrition?.protein  ?? 0)   - (a.nutrition?.protein  ?? 0)
      if (sortBy === 'calories') return (a.nutrition?.calories ?? 9999) - (b.nutrition?.calories ?? 9999)
      if (sortBy === 'time')     return (a.prepTime + a.cookTime)       - (b.prepTime + b.cookTime)
      return 0
    })

  function handleImported(data: RecipePrefill) {
    setPrefill(data); setImportOpen(false); setFormOpen(true)
  }

  function handleFormClose() {
    setFormOpen(false); setPrefill(undefined)
  }

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-[#2D1F3D]">{t('recipes')}</h1>
            <p className="text-sm text-[#7A6775] mt-0.5">
              {recipes === undefined
                ? t('loading')
                : lang === 'pt'
                  ? `${recipes.length} receita${recipes.length !== 1 ? 's' : ''} guardada${recipes.length !== 1 ? 's' : ''}`
                  : `${recipes.length} recipe${recipes.length !== 1 ? 's' : ''} saved`}
            </p>
          </div>
          <button
            onClick={() => setImportOpen(true)}
            className="bg-[#7B5EA7] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#6a4e94] transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> {t('add_recipe')}
          </button>
        </div>

        {/* Search + Sort row */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A6775]" />
            <input
              type="text"
              placeholder={t('search_recipes')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-[#E8D9C8] rounded-full pl-10 pr-4 py-2.5 text-sm text-[#2D1F3D] placeholder:text-[#7A6775] outline-none focus:border-[#7B5EA7] transition-colors shadow-[0_4px_20px_0_#7B5EA714]"
            />
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(o => !o)}
              className={cn(
                'flex items-center gap-1.5 border text-sm font-semibold px-4 py-2.5 rounded-full transition-colors whitespace-nowrap',
                sortBy !== 'default'
                  ? 'bg-[#EEE0FF] border-[#7B5EA7] text-[#7B5EA7]'
                  : 'border-[#E8D9C8] text-[#7A6775] bg-white hover:bg-[#F5EDE0]'
              )}
            >
              {SORT_OPTIONS.find(o => o.key === sortBy)?.label}
              <ChevronDown size={14} className={cn('transition-transform', sortOpen && 'rotate-180')} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-[#E8D9C8] overflow-hidden z-10 min-w-[140px]">
                {SORT_OPTIONS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => { setSortBy(key); setSortOpen(false) }}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-sm transition-colors',
                      sortBy === key
                        ? 'bg-[#EEE0FF] text-[#7B5EA7] font-semibold'
                        : 'text-[#7A6775] hover:bg-[#F5EDE0]'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tag filter chips */}
        {allTags.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
            <button
              onClick={() => setActiveTag(null)}
              className={cn(
                'shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors',
                activeTag === null
                  ? 'bg-[#7B5EA7] text-white border-[#7B5EA7]'
                  : 'text-[#7A6775] border-[#E8D9C8] hover:bg-[#F5EDE0]'
              )}
            >
              {t('all_tags')}
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={cn(
                  'shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors',
                  activeTag === tag
                    ? 'bg-[#7B5EA7] text-white border-[#7B5EA7]'
                    : 'text-[#7A6775] border-[#E8D9C8] hover:bg-[#F5EDE0]'
                )}
              >
                {translateTag(tag, lang)}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {recipes !== undefined && filtered.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-[#EEE0FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ChefHat size={28} className="text-[#7B5EA7]" />
            </div>
            <h3 className="font-display font-bold text-base text-[#2D1F3D] mb-1">
              {search || activeTag ? t('no_recipes_found') : t('no_recipes_yet')}
            </h3>
            <p className="text-sm text-[#7A6775] mb-5">
              {search || activeTag ? t('try_diff_search') : t('add_first_recipe')}
            </p>
            {!search && !activeTag && (
              <button
                onClick={() => setImportOpen(true)}
                className="bg-[#7B5EA7] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#6a4e94] transition-colors"
              >
                {t('add_recipe')}
              </button>
            )}
          </div>
        )}

        {/* Recipe grid */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map(r => {
              const palette = cardPalette(r.title)
              return (
                <div
                  key={r._id}
                  onClick={() => navigate(`/recipes/${r._id}`)}
                  className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_24px_0_#7B5EA71A] cursor-pointer hover:shadow-[0_4px_32px_0_#7B5EA730] hover:-translate-y-0.5 transition-all"
                >
                  <div className={`h-36 ${palette.bg} flex items-center justify-center`}>
                    <ChefHat size={40} className={`${palette.icon} opacity-30`} />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-display font-bold text-sm text-[#2D1F3D] leading-snug">{r.title}</h3>
                    {r.tags.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
                        {r.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            onClick={e => { e.stopPropagation(); setActiveTag(tag) }}
                            className={cn(
                              'text-[10px] font-medium px-2 py-0.5 rounded-full cursor-pointer transition-colors',
                              activeTag === tag
                                ? 'bg-[#7B5EA7] text-white'
                                : 'bg-[#F5EDE0] text-[#7A6775] hover:bg-[#EEE0FF]'
                            )}
                          >
                            {translateTag(tag, lang)}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between text-[12px] text-[#7A6775] pt-1 border-t border-[#E8D9C8]">
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {r.prepTime + r.cookTime} {t('min')}
                      </span>
                      <span>
                        {r.nutrition ? `${r.nutrition.calories} kcal` : `${r.servings} ${lang === 'pt' ? 'porções' : 'servings'}`}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Close sort dropdown on outside click */}
      {sortOpen && (
        <div className="fixed inset-0 z-[5]" onClick={() => setSortOpen(false)} />
      )}

      <RecipeImport open={importOpen} onClose={() => setImportOpen(false)} onImported={handleImported} />
      <RecipeForm   open={formOpen}   onClose={handleFormClose} prefill={prefill} />
    </>
  )
}
