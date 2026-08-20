// app/components/ServicesMegaMenu.tsx
'use client'

import Link from 'next/link'
import { servicesMenu } from '@/data/nav-links'
import { ArrowRight } from 'lucide-react'
import { useT } from '@/i18n/useT'
import type { TKey } from '@/i18n/useT'
import { trackCTAClick } from '@/lib/analytics'

export default function ServicesMegaMenu({ onNavigate }: { onNavigate?: () => void }) {
  const t = useT()
  return (
    <div className="absolute left-0 right-0 top-full bg-white border-t border-navy/10 shadow-[0_20px_56px_-12px_rgba(15,45,94,0.22)]">
      <div className="max-w-[1400px] mx-auto w-full px-8 py-10 flex gap-0">
        {/* Column groups */}
        <div className="flex-1 grid grid-cols-3 gap-0">
          {servicesMenu.map((col, idx) => {
            const live = col.links.filter((l) => l.live)
            if (live.length === 0) return null
            return (
              <div
                key={col.heading}
                className={`px-8 ${idx > 0 ? 'border-l border-navy/10' : 'pl-0'}`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-navy/40 mb-4">
                  {t(col.heading as TKey)}
                </p>
                <ul className="flex flex-col list-none">
                  {live.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        onClick={onNavigate}
                        className="group flex items-center gap-3 py-1.5 text-[14px] text-navy/75 hover:text-navy transition-colors"
                      >
                        <span className="w-0.5 h-0 rounded-full bg-amber transition-all duration-200 group-hover:w-1.5 group-hover:h-4" aria-hidden="true" />
                        <span className="leading-snug">{t(l.label as TKey)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* CTA divider */}
        <div className="w-px bg-navy/10 ml-8" aria-hidden="true" />

        {/* CTA block */}
        <div className="w-[240px] flex-shrink-0 pl-8 flex flex-col justify-center">
          <p className="font-serif font-bold text-navy text-[15px] leading-snug mb-1">
            {t('nav.menu.ctaHeading')}
          </p>
          <p className="text-[12px] text-navy/60 leading-relaxed mb-4">
            {t('nav.menu.ctaBody')}
          </p>
          <Link
            href="/enquiry"
            onClick={() => { onNavigate?.(); trackCTAClick('Book Consult', 'services-mega-menu') }}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-[18px] py-[10px] bg-navy text-white hover:bg-navy/90 transition-colors self-start"
          >
            {t('nav.bookConsult')} <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
