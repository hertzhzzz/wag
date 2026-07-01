'use client'

import Link from 'next/link'
import { useT } from '@/i18n/useT'
import { trackCTAClick } from '@/lib/analytics'

// ============================================
// MOBILE PERSISTENT CTA BAR
// Desktop readers get a sticky sidebar CTA (SidebarRail.tsx) that stays
// visible while scrolling — mobile readers currently get nothing
// equivalent. Real GA4 data (2026-07-01) showed a 40x engagement-time gap
// between desktop and mobile on this exact site, traced to this gap.
// This is the mobile-only counterpart: a thin, always-visible action bar
// pinned to the bottom of the viewport. Hidden on desktop (lg:hidden) —
// SidebarRail already covers that breakpoint.
// ============================================

export default function MobileCTABar() {
  const t = useT()

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F2D5E] border-t border-white/10 px-4 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.15)]">
      <Link
        href="/enquiry"
        className="flex items-center justify-center gap-2 bg-[#F59E0B] text-[#0F2D5E] font-semibold text-sm px-6 py-3 rounded-md w-full"
        onClick={() => trackCTAClick(t('article.mobile_cta.button'), 'article-mobile-bar')}
      >
        {t('article.mobile_cta.button')}
      </Link>
    </div>
  )
}
