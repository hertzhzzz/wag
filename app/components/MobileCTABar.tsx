'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useT } from '@/i18n/useT'
import { trackCTAClick } from '@/lib/analytics'

// Mobile-only sticky Enquire bar. Hidden on desktop (md+) and on the enquiry
// funnel itself (form is already the primary action). Used on home, CSA root,
// articles, and other commercial landings where organic mobile conversion lags.

const HIDDEN_PREFIXES = ['/enquiry']

export default function MobileCTABar({
  location = 'mobile-sticky-bar',
}: {
  location?: string
}) {
  const t = useT()
  const pathname = usePathname() || '/'
  const hidden = HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )

  if (hidden) return null

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F2D5E] border-t border-white/10 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-2px_12px_rgba(0,0,0,0.15)]"
      role="region"
      aria-label="Enquiry call to action"
    >
      <Link
        href="/enquiry"
        className="flex items-center justify-center gap-2 bg-[#F59E0B] text-[#0F2D5E] font-semibold text-sm px-6 py-3 min-h-11 rounded-md w-full"
        onClick={() => trackCTAClick(t('article.mobile_cta.button'), location)}
        aria-label={t('article.mobile_cta.button')}
      >
        {t('article.mobile_cta.button')}
      </Link>
    </div>
  )
}
