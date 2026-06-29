'use client'

import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useT } from '@/i18n/useT'
import { TableOfContents } from './TableOfContents'
import type { Heading } from './types'

// ============================================
// STICKY SIDEBAR RAIL (desktop only)
// A position-aware table of contents + a process card that shows our actual
// 3-step model (transparency is the brand). Two paths out: enquiry + services.
// The whole rail follows the reader down (sticky within a stretched grid cell).
// ============================================

export function SidebarRail({ headings }: { headings: Heading[] }) {
  const t = useT()

  const STEPS = [
    { title: t('article.sidebar.step1Title'), desc: t('article.sidebar.step1Desc') },
    { title: t('article.sidebar.step2Title'), desc: t('article.sidebar.step2Desc') },
    { title: t('article.sidebar.step3Title'), desc: t('article.sidebar.step3Desc') },
  ]

  return (
    <aside className="hidden lg:block">
      {/* Bounded-height flex column: TOC shrinks/scrolls, the card never does,
          so the CTA stays in view even on short screens. */}
      <div className="sticky top-24 flex flex-col gap-7 max-h-[calc(100dvh-7rem)]">
        {headings.length > 0 && (
          <div className="min-h-0 shrink overflow-y-auto toc-scroll -mr-2 pr-2">
            <TableOfContents headings={headings} />
          </div>
        )}

        {/* Process card — our real model, two paths out */}
        <div className="shrink-0 rounded-xl border border-gray-200 bg-white shadow-[0_4px_20px_rgba(15,45,94,0.08)] p-5">
          <p className="text-sm font-semibold text-[#0F2D5E]">{t('article.sidebar.processHeading')}</p>
          <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{t('article.sidebar.processDescription')}</p>

          <ol className="mt-4">
            {STEPS.map((step, i) => {
              const isLast = i === STEPS.length - 1
              return (
                <li key={step.title} className="relative flex gap-3 pb-4 last:pb-0">
                  {!isLast && (
                    <span aria-hidden="true" className="absolute left-[13px] top-7 bottom-0 w-px bg-gray-200" />
                  )}
                  <span
                    className={`relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      isLast ? 'bg-[#F59E0B] text-[#0F2D5E]' : 'bg-[#0F2D5E] text-white'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="pt-0.5">
                    <p className="text-sm font-semibold text-[#0F2D5E] leading-snug">{step.title}</p>
                    <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </li>
              )
            })}
          </ol>

          <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
            <Link
              href="/enquiry"
              className="flex items-center justify-center gap-2 w-full bg-[#0F2D5E] text-white text-sm font-semibold px-4 py-3 rounded-md hover:bg-[#F59E0B] hover:text-[#0F2D5E] transition-colors duration-200"
            >
              {t('article.sidebar.buttonPrimary')}
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <Link
              href="/services"
              className="group flex items-center justify-center gap-1.5 text-[0.8rem] font-medium text-gray-500 hover:text-[#0F2D5E] transition-colors duration-200"
            >
              {t('article.sidebar.buttonSecondary')}
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
