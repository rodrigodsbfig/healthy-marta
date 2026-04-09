import { useLanguage } from '@/lib/language'
import type { Lang } from '@/lib/translations'

const LANGUAGES: { value: Lang; label: string; native: string }[] = [
  { value: 'en', label: 'English',    native: 'English' },
  { value: 'pt', label: 'Portuguese', native: 'Português' },
]

export function Profile() {
  const { t, lang, setLang } = useLanguage()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="font-display font-bold text-2xl text-[#2D1F3D]">{t('profile')}</h1>

      {/* User card */}
      <div className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_0_#7B5EA714] text-center">
        <div className="w-16 h-16 rounded-full bg-[#EEE0FF] flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-[#7B5EA7]">M</span>
        </div>
        <h2 className="font-display font-bold text-lg text-[#2D1F3D]">Marta</h2>
        <p className="text-sm text-[#7A6775] mt-1">marta@email.com</p>
        <p className="text-sm text-[#7A6775] mt-6">{t('auth_coming')}</p>
      </div>

      {/* Language selector */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_0_#7B5EA714]">
        <h2 className="font-display font-bold text-base text-[#2D1F3D] mb-4">{t('language_label')}</h2>
        <div className="flex gap-3">
          {LANGUAGES.map(l => (
            <button
              key={l.value}
              onClick={() => setLang(l.value)}
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
                lang === l.value
                  ? 'bg-[#7B5EA7] text-white border-[#7B5EA7]'
                  : 'bg-[#FDF8F2] text-[#7A6775] border-[#E8D9C8] hover:border-[#7B5EA7]'
              }`}
            >
              <span className="block text-base mb-0.5">{l.value === 'en' ? '🇬🇧' : '🇵🇹'}</span>
              {l.native}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
