import { useState } from 'react'
import { useQuery } from 'convex/react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Clock, ChefHat } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { useLanguage } from '@/lib/language'
import { translateTag } from '@/lib/translations'
import { RecipeForm } from '@/components/RecipeForm'
import { RecipeImport } from '@/components/RecipeImport'

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

export function Recipes() {
  const { t, lang } = useLanguage()
  const recipes = useQuery(api.functions.recipes.list)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [importOpen, setImportOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [prefill, setPrefill] = useState<RecipePrefill | undefined>(undefined)

  const filtered = (recipes ?? []).filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  function handleImported(data: RecipePrefill) {
    setPrefill(data)
    setImportOpen(false)
    setFormOpen(true)
  }

  function handleFormClose() {
    setFormOpen(false)
    setPrefill(undefined)
  }

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-6">
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
            <Plus size={16} />
            {t('add_recipe')}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A6775]" />
          <input
            type="text"
            placeholder={t('search_recipes')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-[#E8D9C8] rounded-full pl-10 pr-4 py-2.5 text-sm text-[#2D1F3D] placeholder:text-[#7A6775] outline-none focus:border-[#7B5EA7] transition-colors shadow-[0_4px_20px_0_#7B5EA714]"
          />
        </div>

        {/* Empty state */}
        {recipes !== undefined && filtered.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-[#EEE0FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ChefHat size={28} className="text-[#7B5EA7]" />
            </div>
            <h3 className="font-display font-bold text-base text-[#2D1F3D] mb-1">
              {search ? t('no_recipes_found') : t('no_recipes_yet')}
            </h3>
            <p className="text-sm text-[#7A6775] mb-5">
              {search ? t('try_diff_search') : t('add_first_recipe')}
            </p>
            {!search && (
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
            {filtered.map(r => (
              <div
                key={r._id}
                onClick={() => navigate(`/recipes/${r._id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_24px_0_#7B5EA71A] cursor-pointer hover:shadow-[0_4px_32px_0_#7B5EA730] hover:-translate-y-0.5 transition-all"
              >
                <div className="h-36 bg-[#EEE0FF] flex items-center justify-center">
                  <ChefHat size={40} className="text-[#7B5EA7] opacity-40" />
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-display font-bold text-sm text-[#2D1F3D] leading-snug">{r.title}</h3>
                  {r.tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {r.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] font-medium bg-[#F5EDE0] text-[#7A6775] px-2 py-0.5 rounded-full">
                          {translateTag(tag, lang)}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between text-[12px] text-[#7A6775] pt-1 border-t border-[#E8D9C8]">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {r.prepTime + r.cookTime} {t('min')}
                    </span>
                    <span>
                      {r.nutrition ? `${r.nutrition.calories} kcal` : `${r.servings} ${lang === 'pt' ? 'porções' : 'servings'}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <RecipeImport
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={handleImported}
      />

      <RecipeForm
        open={formOpen}
        onClose={handleFormClose}
        prefill={prefill}
      />
    </>
  )
}
