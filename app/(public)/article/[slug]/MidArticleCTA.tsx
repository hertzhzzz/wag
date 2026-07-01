'use client'

import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useT } from '@/i18n/useT'
import { trackCTAClick } from '@/lib/analytics'

// ============================================
// MID-ARTICLE CTA
// Injected near the article midpoint — the highest-converting placement
// (readers act once they understand the problem). Filled navy so it reads
// as a deliberate break from the prose, not another callout box.
// ============================================

export function MidArticleCTA() {
  const t = useT()

  return (
    <aside className="my-12 bg-[#0F2D5E] text-white rounded-xl px-6 py-7 sm:px-8 sm:py-8 overflow-hidden relative">
      <div className="absolute -right-8 -top-10 w-40 h-40 rounded-full bg-[#F59E0B]/10 pointer-events-none" aria-hidden="true" />
      <div className="relative max-w-xl">
        <h2 className="font-serif text-xl sm:text-2xl font-bold leading-snug mb-2 text-white">
          {t('article.cta.heading')}
        </h2>
        <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-5">
          {t('article.cta.body')}
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <Link
            href="/enquiry"
            className="inline-flex items-center justify-center gap-2 bg-[#F59E0B] text-[#0F2D5E] font-semibold text-sm px-6 py-3 rounded-md hover:bg-white transition-colors duration-200"
            onClick={() => trackCTAClick('Article Mid CTA', 'article-mid-content')}
          >
            {t('article.cta.buttonPrimary')}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link
            href="/services"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors duration-200"
          >
            {t('article.cta.buttonSecondary')}
            <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" aria-hidden="true" />
          </Link>
        </div>
        <p className="text-xs text-white/55 mt-4">
          {t('article.cta.disclaimer')}
        </p>
      </div>
    </aside>
  )
}
