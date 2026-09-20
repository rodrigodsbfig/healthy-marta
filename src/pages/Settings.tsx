import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { Plus, X, Ban, Target, Info } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { useLanguage } from '@/lib/language'

const COPY = {
  pt: {
    title: 'Definições',
    subtitle: 'As tuas metas e o que não queres comer.',
    goalsTitle: 'Metas diárias',
    goalsHint: 'Preenche com os valores que a tua nutricionista indicou. Ficam em branco até os definires — a app não inventa metas.',
    calories: 'Calorias', protein: 'Proteína', carbs: 'Hidratos', fat: 'Gordura',
    save: 'Guardar metas', saved: 'Metas guardadas',
    clear: 'Limpar',
    dislikesTitle: 'O que não como',
    dislikesHint: 'Escreve um alimento e nunca mais aparece nas semanas geradas. Ex.: tofu, atum, abacate.',
    add: 'Adicionar', placeholder: 'ex. tofu',
    noneYet: 'Ainda não excluíste nada.',
    excludedTitle: 'Receitas excluídas',
    excludedNone: 'Nenhuma receita é afetada.',
    because: 'por causa de',
  },
  en: {
    title: 'Settings',
    subtitle: 'Your targets and the foods you will not eat.',
    goalsTitle: 'Daily targets',
    goalsHint: 'Enter the numbers your nutritionist gave you. They stay blank until you set them — the app does not invent targets.',
    calories: 'Calories', protein: 'Protein', carbs: 'Carbs', fat: 'Fat',
    save: 'Save targets', saved: 'Targets saved',
    clear: 'Clear',
    dislikesTitle: 'Foods I will not eat',
    dislikesHint: 'Add a food and it never appears in a generated week. E.g. tofu, tuna, avocado.',
    add: 'Add', placeholder: 'e.g. tofu',
    noneYet: 'Nothing excluded yet.',
    excludedTitle: 'Excluded recipes',
    excludedNone: 'No recipes are affected.',
    because: 'because of',
  },
}

const FIELDS = ['calories', 'protein', 'carbs', 'fat'] as const
type Field = typeof FIELDS[number]
const UNITS: Record<Field, string> = { calories: 'kcal', protein: 'g', carbs: 'g', fat: 'g' }

export function Settings() {
  const { lang } = useLanguage()
  const c = COPY[lang]

  const prefs = useQuery(api.functions.preferences.get)
  const excluded = useQuery(api.functions.preferences.excludedRecipes)
  const setGoals = useMutation(api.functions.preferences.setGoals)
  const clearGoals = useMutation(api.functions.preferences.clearGoals)
  const addDislike = useMutation(api.functions.preferences.addDislike)
  const removeDislike = useMutation(api.functions.preferences.removeDislike)

  const [draft, setDraft] = useState<Record<Field, string> | null>(null)
  const [justSaved, setJustSaved] = useState(false)
  const [term, setTerm] = useState('')

  // Populated from the stored goals, then held locally while she types.
  const values: Record<Field, string> =
    draft ?? {
      calories: prefs?.goals?.calories?.toString() ?? '',
      protein: prefs?.goals?.protein?.toString() ?? '',
      carbs: prefs?.goals?.carbs?.toString() ?? '',
      fat: prefs?.goals?.fat?.toString() ?? '',
    }

  const complete = FIELDS.every(f => values[f].trim() !== '' && !Number.isNaN(Number(values[f])))

  async function saveGoals(e: React.FormEvent) {
    e.preventDefault()
    if (!complete) return
    await setGoals({
      calories: Number(values.calories), protein: Number(values.protein),
      carbs: Number(values.carbs), fat: Number(values.fat),
    })
    setDraft(null)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2500)
  }

  async function submitDislike(e: React.FormEvent) {
    e.preventDefault()
    const t = term.trim()
    if (!t) return
    setTerm('')
    await addDislike({ name: t })
  }

  const dislikes = prefs?.dislikes ?? []

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-[#2D1F3D]">{c.title}</h1>
        <p className="text-sm text-[#7A6775] mt-0.5">{c.subtitle}</p>
      </div>

      {/* Macro targets */}
      <form onSubmit={saveGoals} className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_0_#7B5EA714]">
        <div className="flex items-center gap-2 mb-1">
          <Target size={17} className="text-[#7B5EA7]" />
          <h2 className="font-display font-bold text-lg text-[#2D1F3D]">{c.goalsTitle}</h2>
        </div>
        <p className="text-[12px] text-[#7A6775] mb-4">{c.goalsHint}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {FIELDS.map(f => (
            <label key={f} className="block">
              <span className="block text-[11px] font-semibold text-[#7A6775] uppercase tracking-wide mb-1">
                {c[f]}
              </span>
              <div className="flex items-center gap-1.5 bg-[#FDF8F2] border border-[#E8D9C8] rounded-xl px-3 py-2 focus-within:border-[#7B5EA7] transition-colors">
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={values[f]}
                  onChange={e => setDraft({ ...values, [f]: e.target.value })}
                  placeholder="—"
                  className="w-full min-w-0 bg-transparent text-sm text-[#2D1F3D] outline-none"
                />
                <span className="text-[11px] text-[#7A6775] shrink-0">{UNITS[f]}</span>
              </div>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="submit"
            disabled={!complete}
            className="bg-[#7B5EA7] text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-[#6a4e94] transition-colors disabled:opacity-40"
          >
            {c.save}
          </button>
          {prefs?.goals && (
            <button
              type="button"
              onClick={async () => { await clearGoals({}); setDraft(null) }}
              className="text-[12px] font-semibold text-[#7A6775] hover:text-[#2D1F3D] transition-colors"
            >
              {c.clear}
            </button>
          )}
          {justSaved && <span className="text-[12px] font-semibold text-[#2D9B5C]">{c.saved}</span>}
        </div>
      </form>

      {/* Dislikes */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_0_#7B5EA714]">
        <div className="flex items-center gap-2 mb-1">
          <Ban size={17} className="text-[#E89B6C]" />
          <h2 className="font-display font-bold text-lg text-[#2D1F3D]">{c.dislikesTitle}</h2>
        </div>
        <p className="text-[12px] text-[#7A6775] mb-4">{c.dislikesHint}</p>

        <form onSubmit={submitDislike} className="flex gap-2 mb-4">
          <input
            type="text"
            value={term}
            onChange={e => setTerm(e.target.value)}
            placeholder={c.placeholder}
            className="flex-1 min-w-0 bg-[#FDF8F2] border border-[#E8D9C8] rounded-full px-4 py-2 text-sm text-[#2D1F3D] placeholder:text-[#7A6775] outline-none focus:border-[#7B5EA7] transition-colors"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-[#7B5EA7] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#6a4e94] transition-colors shrink-0"
          >
            <Plus size={15} />{c.add}
          </button>
        </form>

        {dislikes.length === 0 ? (
          <p className="text-sm text-[#7A6775]">{c.noneYet}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {dislikes.map(d => (
              <span key={d} className="flex items-center gap-1.5 bg-[#FFF3E8] border border-[#E89B6C]/40 text-[#2D1F3D] text-[13px] font-semibold px-3 py-1.5 rounded-full">
                {d}
                <button
                  onClick={() => removeDislike({ name: d })}
                  aria-label={`${c.add} ${d}`}
                  className="text-[#E89B6C] hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* What the dislikes actually rule out — so an over-broad term is visible */}
        {dislikes.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[#E8D9C8]">
            <div className="flex items-center gap-1.5 mb-2">
              <Info size={13} className="text-[#7A6775]" />
              <h3 className="text-[12px] font-semibold text-[#7A6775] uppercase tracking-wide">
                {c.excludedTitle}
              </h3>
            </div>
            {(excluded ?? []).length === 0 ? (
              <p className="text-[12px] text-[#7A6775]">{c.excludedNone}</p>
            ) : (
              <ul className="space-y-1">
                {(excluded ?? []).map(r => (
                  <li key={r.title} className="text-[12px] text-[#7A6775]">
                    <span className="text-[#2D1F3D]">{r.title}</span> — {c.because} <em>{r.because}</em>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
