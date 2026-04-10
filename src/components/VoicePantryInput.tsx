import { useCallback, useRef, useState } from 'react'
import { useAction, useMutation } from 'convex/react'
import { Mic, MicOff, Loader2, Check, X } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/language'

type Phase = 'idle' | 'listening' | 'processing' | 'preview'

interface SpeechRecognitionInstance {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null
}
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance

interface ParsedItem {
  name: string
  quantity: number
  unit: string
  selected: boolean
}

export function VoicePantryInput() {
  const { t, lang } = useLanguage()
  const parseTranscript = useAction(api.functions.aiAssist.parseTranscript)
  const addItem = useMutation(api.functions.pantry.addItem)

  const [phase, setPhase]     = useState<Phase>('idle')
  const [interim, setInterim] = useState('')   // live preview of what's being heard
  const [items, setItems]     = useState<ParsedItem[]>([])
  const [saving, setSaving]   = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const isListeningRef  = useRef(false)
  const accumulatedRef  = useRef('')   // full transcript across all recognition sessions
  const recRef          = useRef<SpeechRecognitionInstance | null>(null)

  const getSpeechAPI = useCallback((): SpeechRecognitionCtor | null => {
    const w = window as Window & { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor }
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
  }, [])

  function createAndStart() {
    const API = getSpeechAPI()
    if (!API) return

    const rec = new API()
    rec.lang = lang === 'pt' ? 'pt-PT' : 'en-US'
    rec.continuous     = false   // more reliable; we restart manually on end
    rec.interimResults = true
    recRef.current = rec

    let sessionFinal = ''

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let finalPart = ''
      let interimPart = ''
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalPart += e.results[i][0].transcript + ' '
        } else {
          interimPart += e.results[i][0].transcript
        }
      }
      sessionFinal = finalPart
      // Show live preview: everything accumulated so far + current session + interim
      setInterim((accumulatedRef.current + finalPart + interimPart).trim())
    }

    rec.onend = () => {
      // Commit this session's final text into accumulator
      accumulatedRef.current = (accumulatedRef.current + sessionFinal).trim()
      if (accumulatedRef.current) {
        setInterim(accumulatedRef.current)
      }
      // Restart with a fresh instance while still listening
      if (isListeningRef.current) {
        setTimeout(() => {
          if (isListeningRef.current) createAndStart()
        }, 100)
      }
    }

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        isListeningRef.current = false
        setPhase('idle')
        setErrorMsg(t('voice_error'))
      }
      // 'no-speech' and 'aborted' are fine — onend will restart
    }

    try {
      rec.start()
    } catch {
      // ignore start errors; onend will retry
    }
  }

  function startListening() {
    if (!getSpeechAPI()) {
      setErrorMsg(t('voice_error'))
      return
    }
    setErrorMsg('')
    accumulatedRef.current = ''
    setInterim('')
    isListeningRef.current = true
    setPhase('listening')
    createAndStart()
  }

  async function stopAndProcess() {
    isListeningRef.current = false
    recRef.current?.abort()
    recRef.current = null

    // Give onend a moment to commit its last session transcript
    await new Promise(r => setTimeout(r, 150))

    const transcript = accumulatedRef.current.trim()
    if (!transcript) {
      setPhase('idle')
      setErrorMsg(lang === 'pt' ? 'Não captei nada. Tenta outra vez.' : 'Nothing captured. Please try again.')
      return
    }

    setPhase('processing')
    try {
      const parsed = await parseTranscript({ transcript, language: lang })
      if (!parsed || parsed.length === 0) {
        setPhase('idle')
        setErrorMsg(t('voice_try_again'))
        return
      }
      setItems(parsed.map(i => ({ ...i, selected: true })))
      setPhase('preview')
    } catch {
      setPhase('idle')
      setErrorMsg(t('voice_error'))
    }
  }

  function toggleItem(idx: number) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, selected: !it.selected } : it))
  }

  async function confirmAdd() {
    const toAdd = items.filter(i => i.selected)
    if (toAdd.length === 0) { cancel(); return }
    setSaving(true)
    try {
      for (const i of toAdd) {
        await addItem({ name: i.name, quantity: i.quantity, unit: i.unit })
      }
      cancel()
    } finally {
      setSaving(false)
    }
  }

  function cancel() {
    isListeningRef.current = false
    recRef.current?.abort()
    recRef.current = null
    accumulatedRef.current = ''
    setPhase('idle')
    setItems([])
    setInterim('')
    setErrorMsg('')
  }

  // ── Idle ──────────────────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <div className="space-y-1">
        <button
          onClick={startListening}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-[#C4B0E0] text-[#7B5EA7] hover:bg-[#EEE0FF] transition-colors group"
        >
          <div className="w-8 h-8 bg-[#EEE0FF] rounded-lg flex items-center justify-center shrink-0 group-hover:bg-[#D8C8F0] transition-colors">
            <Mic size={15} className="text-[#7B5EA7]" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-[#2D1F3D]">
              {lang === 'pt' ? 'Gravar voz' : 'Add by voice'}
            </p>
            <p className="text-[11px] text-[#7A6775]">
              {lang === 'pt' ? 'Diz o que tens e o Claude extrai os itens' : 'Say what you have and Claude extracts the items'}
            </p>
          </div>
        </button>
        {errorMsg && <p className="text-[12px] text-red-400 px-1">{errorMsg}</p>}
      </div>
    )
  }

  // ── Listening ─────────────────────────────────────────────────────────────
  if (phase === 'listening') {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_0_#7B5EA714] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex w-3 h-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <span className="text-sm font-semibold text-[#2D1F3D]">{t('voice_listening')}</span>
          </div>
          <button onClick={cancel} className="text-[#7A6775] hover:text-[#2D1F3D]"><X size={16} /></button>
        </div>

        <p className="text-[12px] text-[#7A6775]">
          {lang === 'pt'
            ? 'Ex: "200g de frango, 1 litro de leite, 3 ovos"'
            : 'E.g. "200g chicken, 1 litre milk, 3 eggs"'}
        </p>

        {/* Live transcript preview */}
        {interim && (
          <div className="bg-[#FDF8F2] border border-[#E8D9C8] rounded-xl px-3 py-2.5 text-sm text-[#2D1F3D] min-h-[40px]">
            {interim}
          </div>
        )}

        <button
          onClick={stopAndProcess}
          className="w-full flex items-center justify-center gap-2 bg-[#7B5EA7] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#6a4e94] transition-colors"
        >
          <MicOff size={15} /> {t('voice_done')}
        </button>
      </div>
    )
  }

  // ── Processing ────────────────────────────────────────────────────────────
  if (phase === 'processing') {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_0_#7B5EA714] flex items-center gap-3">
        <Loader2 size={18} className="text-[#7B5EA7] animate-spin shrink-0" />
        <span className="text-sm text-[#7A6775]">{t('voice_processing')}</span>
      </div>
    )
  }

  // ── Preview ───────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_0_#7B5EA714] space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#2D1F3D]">
          {t('voice_found').replace('{n}', String(items.length))}
        </p>
        <button onClick={cancel} className="text-[#7A6775] hover:text-[#2D1F3D] transition-colors">
          <X size={16} />
        </button>
      </div>

      <ul className="space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            onClick={() => toggleItem(i)}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-colors',
              item.selected
                ? 'bg-[#EEE0FF] border-[#7B5EA7]/30'
                : 'bg-[#FDF8F2] border-transparent opacity-50',
            )}
          >
            <div className={cn(
              'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors',
              item.selected ? 'bg-[#7B5EA7] border-[#7B5EA7]' : 'border-[#E8D9C8]',
            )}>
              {item.selected && <Check size={12} stroke="white" />}
            </div>
            <span className="flex-1 text-sm text-[#2D1F3D] font-medium">{item.name}</span>
            <span className="text-[12px] text-[#7A6775] shrink-0">{item.quantity} {item.unit}</span>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <button
          onClick={cancel}
          className="flex-1 border border-[#E8D9C8] text-[#7A6775] text-sm font-semibold py-2 rounded-full hover:bg-[#FDF8F2] transition-colors"
        >
          {lang === 'pt' ? 'Cancelar' : 'Cancel'}
        </button>
        <button
          onClick={confirmAdd}
          disabled={saving || items.every(i => !i.selected)}
          className="flex-1 bg-[#7B5EA7] text-white text-sm font-semibold py-2 rounded-full hover:bg-[#6a4e94] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {t('voice_add_items').replace('{n}', String(items.filter(i => i.selected).length))}
        </button>
      </div>
    </div>
  )
}
