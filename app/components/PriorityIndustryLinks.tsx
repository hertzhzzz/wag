import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  PRIORITY_INDUSTRY_LINKS,
  SITE_PRIMARY_PATH_LABEL,
  SITE_SECONDARY_PATH_LABEL,
} from '@/lib/priority-industry-links'

type PriorityIndustryLinksProps = {
  heading?: string
  intro?: string
  className?: string
  source?: string
}

/**
 * Stable SSR internal links into the three C4 priority industry pages.
 * Server component — no client JS required for crawl/indexability.
 */
export default function PriorityIndustryLinks({
  heading = 'Priority industries for Australian buyers',
  intro = 'Start with the dual-path China sourcing pages for our highest-intent sectors. Primary path: find and vet new suppliers. Secondary path: visit or verify an existing one.',
  className = '',
  source = 'site',
}: PriorityIndustryLinksProps) {
  return (
    <section
      id="priority-industries"
      data-source={source}
      className={`bg-white border-y border-navy/10 ${className}`.trim()}
      aria-labelledby="priority-industries-heading"
    >
      <div className="max-w-[1120px] mx-auto px-4 md:px-8 py-14 md:py-16">
        <p className="text-xs text-amber font-semibold tracking-[0.16em] uppercase mb-3">
          China sourcing for Australian businesses
        </p>
        <h2
          id="priority-industries-heading"
          className="font-serif font-bold text-navy text-[clamp(1.6rem,3vw,2.2rem)] leading-tight mb-3 max-w-[720px]"
        >
          {heading}
        </h2>
        <p className="text-navy/70 text-base md:text-lg leading-relaxed max-w-[760px] mb-4">
          {intro}
        </p>
        <p className="text-sm text-navy/55 mb-8">
          <span className="font-semibold text-navy">{SITE_PRIMARY_PATH_LABEL}</span>
          {' · '}
          <span>{SITE_SECONDARY_PATH_LABEL}</span>
        </p>
        <ul className="grid md:grid-cols-3 gap-4 list-none p-0 m-0">
          {PRIORITY_INDUSTRY_LINKS.map((item) => (
            <li key={item.slug}>
              <Link
                href={item.href}
                className="group flex h-full flex-col border border-navy/15 bg-navy/[0.02] p-5 no-underline transition-colors hover:border-amber/50 hover:bg-white"
              >
                <span className="font-semibold text-navy text-[15px] mb-2 group-hover:text-navy">
                  {item.label}
                </span>
                <span className="text-navy/65 text-sm leading-relaxed flex-1 mb-4">
                  {item.blurb}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy">
                  View industry page
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
