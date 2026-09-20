import { useState } from 'react'
import { useMutation } from 'convex/react'
import { Sparkles, X, Check, AlertTriangle, Loader2 } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/language'

type Mode = 'variada' | 'pratica'

interface GenerateWeekButtonProps {
  weekStart: string
  /** True when the week already has meals — generating will replace them. */
  hasExistingPlan: boolean
}

const COPY = {
  pt: {
    generate: 'Gerar semana',
    title: 'Gerar refeições da semana',
    subtitle: 'As refeições são escolhidas do teu plano alimentar — porções incluídas.',
    variada: 'Variada',
    variadaHint: 'Um prato diferente por dia',
    pratica: 'Prática',
    praticaHint: 'Cozinhar 2 a 3 vezes para a semana toda',
    replaceWarning: 'Esta semana já tem refeições. Gerar vai substituí-las.',
    go: 'Gerar refeições',
    working: 'A gerar…',
    done: 'refeições planeadas',
    close: 'Fechar',
    skipLabel: 'Saltar o meio da manhã',
    skipHint: 'Para semanas em casa — o plano dispensa-o nos dias em que comes fruta ao pequeno-almoço.',
  },
  en: {
    generate: 'Generate week',
    title: 'Generate this week’s meals',
    subtitle: 'Meals are picked from your nutrition plan — portions included.',
    variada: 'Varied',
    variadaHint: 'A different dish every day',
    pratica: 'Practical',
    praticaHint: 'Cook 2–3 times for the whole week',
    replaceWarning: 'This week already has meals. Generating will replace them.',
    go: 'Generate meals',
    working: 'Generating…',
    done: 'meals planned',
    close: 'Close',
    skipLabel: 'Skip mid-morning',
    skipHint: 'For weeks at home — the plan drops it on days you have fruit at breakfast.',
  },
}

export function GenerateWeekButton({ weekStart, hasExistingPlan }: GenerateWeekButtonProps) {
  const { lang } = useLanguage()
  const c = COPY[lang]
  const generate = useMutation(api.functions.mealPlans.generate)

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('pratica')
  const [skipMeioDaManha, setSkipMeioDaManha] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{
    notes: string[]
    warnings: string[]
    mealsPlanned: number
  } | null>(null)

  async function run() {
    setBusy(true)
    try {
      setResult(await generate({ weekStart, mode, skipMeioDaManha }))
    } finally {
      setBusy(false)
    }
  }

  function close() {
    setOpen(false)
    setResult(null)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-[#7B5EA7] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#6a4e94] transition-colors"
      >
        <Sparkles size={15} />
        {c.generate}
      </button>

      {open && (
        <div className="fixed inset-0 bg-[#2D1F3D]/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-start justify-between px-5 py-4 border-b border-[#E8D9C8]">
              <div>
                <h2 className="font-display font-bold text-base text-[#2D1F3D]">{c.title}</h2>
                <p className="text-[12px] text-[#7A6775] mt-0.5">{c.subtitle}</p>
              </div>
              <button onClick={close} className="text-[#7A6775] hover:text-[#2D1F3D] transition-colors">
                <X size={20} />
              </button>
            </div>

            {result === null ? (
              <div className="px-5 py-4 space-y-3">
                {(['pratica', 'variada'] as Mode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-xl border transition-colors',
                      mode === m
                        ? 'bg-[#EEE0FF] border-[#7B5EA7]'
                        : 'bg-[#FDF8F2] border-[#E8D9C8] hover:border-[#7B5EA7]',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-4 h-4 rounded-full border-2 shrink-0',
                        mode === m ? 'border-[#7B5EA7] bg-[#7B5EA7]' : 'border-[#C9B8D9]',
                      )} />
                      <span className="text-sm font-semibold text-[#2D1F3D]">
                        {m === 'pratica' ? c.pratica : c.variada}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#7A6775] mt-1 ml-6">
                      {m === 'pratica' ? c.praticaHint : c.variadaHint}
                    </p>
                  </button>
                ))}

                <label className="flex items-start gap-2.5 px-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipMeioDaManha}
                    onChange={e => setSkipMeioDaManha(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#7B5EA7] shrink-0"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-[#2D1F3D]">{c.skipLabel}</span>
                    <span className="block text-[12px] text-[#7A6775]">{c.skipHint}</span>
                  </span>
                </label>

                {hasExistingPlan && (
                  <div className="flex items-start gap-2 bg-[#FFF3E8] border border-[#E89B6C]/40 rounded-xl px-3 py-2">
                    <AlertTriangle size={15} className="text-[#E89B6C] shrink-0 mt-0.5" />
                    <p className="text-[12px] text-[#7A6775]">{c.replaceWarning}</p>
                  </div>
                )}

                <button
                  onClick={run}
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-2 bg-[#7B5EA7] text-white font-semibold py-2.5 rounded-full hover:bg-[#6a4e94] transition-colors text-sm disabled:opacity-60"
                >
                  {busy ? <><Loader2 size={15} className="animate-spin" />{c.working}</> : <><Sparkles size={15} />{c.go}</>}
                </button>
              </div>
            ) : (
              <div className="px-5 py-4 space-y-3">
                <div className="flex items-center gap-2 text-[#2D9B5C]">
                  <Check size={18} />
                  <span className="text-sm font-semibold">
                    {result.mealsPlanned} {c.done}
                  </span>
                </div>

                <ul className="space-y-1.5">
                  {result.notes.map((n, i) => (
                    <li key={i} className="text-[12px] text-[#7A6775] flex gap-2">
                      <span className="text-[#7B5EA7]">·</span>{n}
                    </li>
                  ))}
                </ul>

                {result.warnings.length > 0 && (
                  <div className="bg-[#FFF3E8] border border-[#E89B6C]/40 rounded-xl px-3 py-2 space-y-1">
                    {result.warnings.map((w, i) => (
                      <p key={i} className="text-[12px] text-[#7A6775] flex gap-2">
                        <AlertTriangle size={13} className="text-[#E89B6C] shrink-0 mt-0.5" />{w}
                      </p>
                    ))}
                  </div>
                )}

                <button
                  onClick={close}
                  className="w-full bg-[#7B5EA7] text-white font-semibold py-2.5 rounded-full hover:bg-[#6a4e94] transition-colors text-sm"
                >
                  {c.close}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
