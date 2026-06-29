'use client'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { en } from './dictionaries/en'
import { zh } from './dictionaries/zh'

export type Lang = 'en' | 'zh'
export type TKey = keyof typeof en

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: 'en',
  setLang: () => {},
})

export function LanguageProvider({ initialLang, children }: { initialLang: Lang; children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  // 同步 <html lang>（含初始）；SSR 时根 layout 固定 en-AU，hydrate 后纠正
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en-AU'
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    document.cookie = `wag_lang=${l}; path=/; max-age=31536000; samesite=lax`
  }, [])

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export function useLang() {
  return useContext(LangContext)
}

export function useT() {
  const { lang } = useContext(LangContext)
  return (key: TKey): string => (lang === 'zh' ? (zh[key] ?? en[key]) : en[key])
}
