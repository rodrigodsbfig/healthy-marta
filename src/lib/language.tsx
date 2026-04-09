import { createContext, useContext, useState } from 'react'
import { translations, type Lang } from './translations'

type LanguageCtx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: keyof typeof translations.en) => string
}

const LanguageContext = createContext<LanguageCtx>(null!)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('app_lang') as Lang) ?? 'en'
  })

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('app_lang', l)
  }

  function t(key: keyof typeof translations.en): string {
    return translations[lang][key] ?? translations.en[key]
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
