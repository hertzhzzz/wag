import { cookies } from 'next/headers'
import { LanguageProvider, type Lang } from '@/i18n/LanguageProvider'

// 仅营销页这一层读 cookie 决定首屏语言；根 layout 不读，故 /factory、/client 不受影响。
// 引入 cookies() 使 (public) 路由组按请求渲染 —— Spec 第 7 节已接受的取舍。
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const lang: Lang = cookieStore.get('wag_lang')?.value === 'zh' ? 'zh' : 'en'
  return <LanguageProvider initialLang={lang}>{children}</LanguageProvider>
}
