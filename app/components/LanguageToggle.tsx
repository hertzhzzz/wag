'use client'
import { useLang } from '@/i18n/useT'

export default function LanguageToggle() {
  const { lang, setLang } = useLang()
  return (
    <div className="flex items-center text-[13px] font-medium" role="group" aria-label="Language">
      <button type="button" onClick={() => setLang('en')} aria-pressed={lang === 'en'}
        className={lang === 'en' ? 'text-navy' : 'text-navy/40 hover:text-navy/70'}>EN</button>
      <span className="mx-1 text-navy/20">|</span>
      <button type="button" onClick={() => setLang('zh')} aria-pressed={lang === 'zh'}
        className={lang === 'zh' ? 'text-navy' : 'text-navy/40 hover:text-navy/70'}>中</button>
    </div>
  )
}
