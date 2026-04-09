import { useState, useRef } from 'react'
import { useAction } from 'convex/react'
import { X, Camera, Link, MessageSquare, Upload, Loader2, AlertCircle } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/language'

type Tab = 'photo' | 'url' | 'describe'

type RecipeData = {
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

interface RecipeImportProps {
  open: boolean
  onClose: () => void
  onImported: (data: RecipeData) => void
}

async function resizeImage(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 1024
      let { width, height } = img
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX }
        else { width = Math.round(width * MAX / height); height = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1]
      URL.revokeObjectURL(url)
      resolve({ base64, mimeType: 'image/jpeg' })
    }
    img.onerror = reject
    img.src = url
  })
}

export function RecipeImport({ open, onClose, onImported }: RecipeImportProps) {
  const { t, lang } = useLanguage()
  const [tab, setTab] = useState<Tab>('photo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const importFromPhoto    = useAction(api.functions.importRecipe.fromPhoto)
  const importFromUrl      = useAction(api.functions.importRecipe.fromUrl)
  const importFromDescribe = useAction(api.functions.importRecipe.fromDescription)

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'photo',    label: t('tab_photo'),    icon: <Camera size={16} /> },
    { id: 'url',      label: t('tab_url'),      icon: <Link size={16} /> },
    { id: 'describe', label: t('tab_describe'), icon: <MessageSquare size={16} /> },
  ]

  function reset() {
    setLoading(false); setError(null); setPreview(null)
    setUrl(''); setDescription(''); setTab('photo')
  }

  function handleClose() { reset(); onClose() }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setError(null)
    setLoading(true)
    try {
      const { base64, mimeType } = await resizeImage(file)
      const data = await importFromPhoto({ base64, mimeType, language: lang })
      reset()
      onImported(data)
    } catch (err) {
      setError((err as Error).message ?? t('reading_recipe'))
    } finally {
      setLoading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleUrl() {
    if (!url.trim()) return
    setError(null); setLoading(true)
    try {
      const data = await importFromUrl({ url: url.trim(), language: lang })
      reset()
      onImported(data)
    } catch (err) {
      setError((err as Error).message ?? t('importing'))
    } finally {
      setLoading(false)
    }
  }

  async function handleDescribe() {
    if (!description.trim()) return
    setError(null); setLoading(true)
    try {
      const data = await importFromDescribe({ description: description.trim(), language: lang })
      reset()
      onImported(data)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-[#2D1F3D]/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8D9C8]">
          <div>
            <h2 className="font-display font-bold text-lg text-[#2D1F3D]">{t('import_title')}</h2>
            <p className="text-[12px] text-[#7A6775]">{t('import_subtitle')}</p>
          </div>
          <button onClick={handleClose} className="text-[#7A6775] hover:text-[#2D1F3D] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setError(null) }}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-[13px] font-semibold border transition-colors',
                tab === t.id
                  ? 'bg-[#7B5EA7] text-white border-[#7B5EA7]'
                  : 'text-[#7A6775] border-[#E8D9C8] hover:bg-[#F5EDE0]',
              )}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">

          {/* Photo tab */}
          {tab === 'photo' && (
            <div className="space-y-4">
              <p className="text-sm text-[#7A6775]">{t('photo_hint')}</p>
              {preview && (
                <div className="w-full h-48 rounded-xl overflow-hidden border border-[#E8D9C8]">
                  <img src={preview} alt="Recipe" className="w-full h-full object-cover" />
                </div>
              )}
              {loading ? (
                <div className="flex flex-col items-center gap-3 py-6 text-[#7A6775]">
                  <Loader2 size={28} className="animate-spin text-[#7B5EA7]" />
                  <p className="text-sm">{t('reading_recipe')}</p>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (fileRef.current) {
                        fileRef.current.accept = 'image/*'
                        fileRef.current.capture = 'environment'
                        fileRef.current.click()
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-[#E8D9C8] text-[#7A6775] text-sm font-semibold py-4 rounded-xl hover:border-[#7B5EA7] hover:text-[#7B5EA7] transition-colors"
                  >
                    <Camera size={18} /> {t('take_photo')}
                  </button>
                  <button
                    onClick={() => {
                      if (fileRef.current) {
                        fileRef.current.accept = 'image/*'
                        fileRef.current.removeAttribute('capture')
                        fileRef.current.click()
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-[#E8D9C8] text-[#7A6775] text-sm font-semibold py-4 rounded-xl hover:border-[#7B5EA7] hover:text-[#7B5EA7] transition-colors"
                  >
                    <Upload size={18} /> {t('upload_image')}
                  </button>
                </div>
              )}
              <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} />
            </div>
          )}

          {/* URL tab */}
          {tab === 'url' && (
            <div className="space-y-4">
              <p className="text-sm text-[#7A6775]">{t('url_hint')}</p>
              <input
                type="url"
                placeholder="https://www.bbcgoodfood.com/recipes/…"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUrl()}
                className="w-full bg-[#FDF8F2] border border-[#E8D9C8] rounded-xl px-4 py-3 text-sm text-[#2D1F3D] placeholder:text-[#7A6775] outline-none focus:border-[#7B5EA7] transition-colors"
              />
              <button
                onClick={handleUrl}
                disabled={!url.trim() || loading}
                className="w-full bg-[#7B5EA7] text-white font-semibold py-3 rounded-full hover:bg-[#6a4e94] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> {t('importing')}</> : t('import_recipe')}
              </button>
            </div>
          )}

          {/* Describe tab */}
          {tab === 'describe' && (
            <div className="space-y-4">
              <p className="text-sm text-[#7A6775]">{t('describe_hint')}</p>
              <textarea
                placeholder={t('describe_ph')}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-[#FDF8F2] border border-[#E8D9C8] rounded-xl px-4 py-3 text-sm text-[#2D1F3D] placeholder:text-[#7A6775] outline-none focus:border-[#7B5EA7] transition-colors resize-none h-28"
              />
              <button
                onClick={handleDescribe}
                disabled={!description.trim() || loading}
                className="w-full bg-[#7B5EA7] text-white font-semibold py-3 rounded-full hover:bg-[#6a4e94] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> {t('generating')}</> : t('generate_recipe')}
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="px-6 pb-5">
          <p className="text-[11px] text-[#7A6775] text-center">{t('ai_disclaimer')}</p>
        </div>
      </div>
    </div>
  )
}
