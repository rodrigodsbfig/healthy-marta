import { useRef, useState } from 'react'
import { useAction, useMutation } from 'convex/react'
import { Mic, MicOff, Loader2, Check, X } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/language'

type Phase = 'idle' | 'listening' | 'processing' | 'preview'

interface ParsedItem {
  name: string
  quantity: number
  unit: string
  selected: boolean
}

interface Props {
  onAdded?: () => void
}

export function VoicePantryInput({ onAdded }: Props) {
  const { t, lang } = useLanguage()
  const parseTranscript = useAction(api.functions.aiAssist.parseTranscript)
  const addItem = useMutation(api.functions.pantry.addItem)

  const [phase, setPhase] = useState<Phase>('idle')
  const [items, setItems] = useState<ParsedItem[]>([])
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const transcriptRef   = useRef('')
  const isListeningRef  = useRef(false)

  function startListening() {
    const SpeechRecognition =
      (window as Window & { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ??
      (window as Window & { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setErrorMsg(t('voice_error'))
      return
    }

    setErrorMsg('')
    transcriptRef.current = ''
    setPhase('listening')
    isListeningRef.current = true

    const rec = new SpeechRecognition()
    rec.lang = lang === 'pt' ? 'pt-PT' : 'en-GB'
    rec.continuous      = true
    rec.interimResults  = true
    recognitionRef.current = rec

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let full = ''
      for (let i = 0; i < e.results.length; i++) {
        full += e.results[i][0].transcript + ' '
      }
      transcriptRef.current = full.trim()
    }

    rec.onend = () => {
      // Auto-restart if we're still meant to be listening
      if (isListeningRef.current) {
        try { rec.start() } catch { /* already started */ }
      }
    }

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === 'not-allowed') {
        setErrorMsg(t('voice_error'))
        isListeningRef.current = false
        setPhase('idle')
      }
    }

    rec.start()
  }

  async function stopAndProcess() {
    isListeningRef.current = false
    recognitionRef.current?.stop()
    recognitionRef.current = null

    const transcript = transcriptRef.current.trim()
    if (!transcript) {
      setPhase('idle')
      return
    }

    setPhase('processing')
    try {
      const parsed = await parseTranscript({ transcript, language: lang })
      if (parsed.length === 0) {
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
      await Promise.all(toAdd.map(i => addItem({ name: i.name, quantity: i.quantity, unit: i.unit })))
      onAdded?.()
      cancel()
    } finally {
      setSaving(false)
    }
  }

  function cancel() {
    isListeningRef.current = false
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setPhase('idle')
    setItems([])
    setErrorMsg('')
    transcriptRef.current = ''
  }

  // ── Idle: mic button ──────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={startListening}
          className="flex items-center gap-2 bg-[#F5EDE0] text-[#7B5EA7] font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#EEE0FF] transition-colors"
        >
          <Mic size={15} /> {lang === 'pt' ? 'Gravar voz' : 'Voice input'}
        </button>
        {errorMsg && <p className="text-[12px] text-red-400">{errorMsg}</p>}
      </div>
    )
  }

  // ── Listening ─────────────────────────────────────────────────────────────
  if (phase === 'listening') {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_0_#7B5EA714] space-y-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="relative flex w-3 h-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
          <span className="text-sm font-semibold text-[#2D1F3D]">{t('voice_listening')}</span>
        </div>
        <p className="text-[12px] text-[#7A6775]">
          {lang === 'pt'
            ? 'Diz os ingredientes em voz alta, ex: "200g de frango, 1 litro de leite..."'
            : 'Say your items out loud, e.g. "200g chicken, 1 litre milk..."'}
        </p>
        <button
          onClick={stopAndProcess}
          className="flex items-center gap-2 mx-auto bg-[#7B5EA7] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#6a4e94] transition-colors"
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
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          {t('voice_add_items').replace('{n}', String(items.filter(i => i.selected).length))}
        </button>
      </div>
    </div>
  )
}
