import { cookies } from 'next/headers'
import { en } from './dictionaries/en'
import { zh } from './dictionaries/zh'
import type { Lang, TKey } from './LanguageProvider'

/** Server-side dictionary lookup for RSC pages (cookie `wag_lang`, default en). */
export async function getServerT(): Promise<(key: TKey) => string> {
  const cookieStore = await cookies()
  const lang: Lang = cookieStore.get('wag_lang')?.value === 'zh' ? 'zh' : 'en'
  return (key: TKey): string => (lang === 'zh' ? (zh[key] ?? en[key]) : en[key])
}
