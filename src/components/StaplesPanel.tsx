import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { Plus, X, Check } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/language'

const COPY = {
  pt: {
    title: 'O que compro sempre',
    hint: 'Estes itens entram em todas as listas geradas. Desliga os que não precisares esta semana.',
    add: 'Adicionar',
    placeholder: 'ex. azeite',
    empty: 'Ainda sem itens fixos.',
    remove: 'Remover',
  },
  en: {
    title: 'What I always buy',
    hint: 'These are added to every generated list. Switch off anything you do not need this week.',
    add: 'Add',
    placeholder: 'e.g. olive oil',
    empty: 'No regular items yet.',
    remove: 'Remove',
  },
}

export function StaplesPanel() {
  const { lang } = useLanguage()
  const c = COPY[lang]
  const staples = useQuery(api.functions.library.listStaples)
  const setActive = useMutation(api.functions.library.setStapleActive)
  const addStaple = useMutation(api.functions.library.addStaple)
  const removeStaple = useMutation(api.functions.library.removeStaple)
  const [name, setName] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setName('')
    await addStaple({ name: trimmed })
  }

  const items = staples ?? []

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_0_#7B5EA714]">
      <h2 className="font-display font-bold text-lg text-[#2D1F3D]">{c.title}</h2>
      <p className="text-[12px] text-[#7A6775] mt-0.5 mb-4">{c.hint}</p>

      <form onSubmit={submit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
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

      {items.length === 0 ? (
        <p className="text-sm text-[#7A6775] py-2">{c.empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map(s => (
            <li key={s._id} className="flex items-center gap-3 group">
              <button
                onClick={() => setActive({ id: s._id, active: !s.active })}
                aria-pressed={s.active}
                aria-label={s.name}
                className={cn(
                  'w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors',
                  s.active
                    ? 'bg-[#7B5EA7] border-[#7B5EA7] text-white'
                    : 'border-[#E8D9C8] text-transparent hover:border-[#7B5EA7]',
                )}
              >
                <Check size={13} strokeWidth={3} />
              </button>
              <span className={cn(
                'flex-1 min-w-0 text-sm truncate transition-colors',
                s.active ? 'text-[#2D1F3D]' : 'text-[#7A6775]',
              )}>
                {s.name}
              </span>
              {s.category && (
                <span className="text-[10px] text-[#7A6775] bg-[#F5EDE0] px-2 py-0.5 rounded-full shrink-0">
                  {s.category}
                </span>
              )}
              <button
                onClick={() => removeStaple({ id: s._id })}
                aria-label={`${c.remove} ${s.name}`}
                className="text-[#E8D9C8] hover:text-red-400 transition-colors shrink-0 md:opacity-0 md:group-hover:opacity-100"
              >
                <X size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
