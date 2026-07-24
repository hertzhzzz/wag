import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  PRIORITY_INDUSTRY_LINKS,
  SITE_PRIMARY_PATH_LABEL,
  SITE_SECONDARY_PATH_LABEL,
} from '@/lib/priority-industry-links'

type SecondaryPathSupportNavProps = {
  /** Current support page slug for analytics/context only */
  currentPath: string
  className?: string
}

/**
 * Secondary-path support nav for verification / audit / inspection pages.
 * Keeps those URLs live while routing commercial intent to home, services,
 * and the three priority industry landings.
 * Server component — no client JS required for crawl/indexability.
 */
export default function SecondaryPathSupportNav({
  currentPath,
  className = '',
}: SecondaryPathSupportNavProps) {
  return (
    <section
      data-secondary-path-support={currentPath}
      className={`bg-white border-y border-navy/10 ${className}`.trim()}
      aria-labelledby="secondary-path-support-heading"
    >
      <div className="max-w-[1100px] mx-auto px-6 py-12 md:py-14">
        <p className="text-xs text-amber font-semibold tracking-[0.16em] uppercase mb-3">
          Secondary path in China sourcing
        </p>
        <h2
          id="secondary-path-support-heading"
          className="font-serif font-bold text-navy text-[clamp(1.4rem,2.6vw,1.9rem)] leading-tight mb-3 max-w-[720px]"
        >
          This page supports visit or verify — not the primary commercial offer
        </h2>
        <p className="text-navy/70 text-base leading-relaxed max-w-[760px] mb-3">
          Primary path for Australian businesses is finding and vetting new suppliers in China.
          Use this page when you already have a factory contact to assess. For end-to-end agent
          support (shortlist through shipment), use the China sourcing agent service. For multi-service
          comparison, start on services or a priority industry page.
        </p>
        <p className="text-sm text-navy/55 mb-8">
          <span className="font-semibold text-navy">{SITE_PRIMARY_PATH_LABEL}</span>
          {' · '}
          <span>{SITE_SECONDARY_PATH_LABEL}</span>
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Link
            href="/china-sourcing-agent"
            className="group flex flex-col border border-navy/15 bg-navy/[0.02] p-5 no-underline transition-colors hover:border-amber/50 hover:bg-white"
          >
            <span className="font-semibold text-navy text-[15px] mb-2">China sourcing agent</span>
            <span className="text-navy/65 text-sm leading-relaxed flex-1 mb-3">
              Full-service commercial path: factory shortlisting, on-ground verification, quality
              control, and shipment coordination for Australian importers.
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy">
              View agent service
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
          <Link
            href="/"
            className="group flex flex-col border border-navy/15 bg-navy/[0.02] p-5 no-underline transition-colors hover:border-amber/50 hover:bg-white"
          >
            <span className="font-semibold text-navy text-[15px] mb-2">China sourcing homepage</span>
            <span className="text-navy/65 text-sm leading-relaxed flex-1 mb-3">
              Dual-path overview for Australian businesses: find and vet first, visit or verify second.
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy">
              Go to homepage
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
          <Link
            href="/services"
            className="group flex flex-col border border-navy/15 bg-navy/[0.02] p-5 no-underline transition-colors hover:border-amber/50 hover:bg-white"
          >
            <span className="font-semibold text-navy text-[15px] mb-2">China sourcing services</span>
            <span className="text-navy/65 text-sm leading-relaxed flex-1 mb-3">
              Service tiers for finding and vetting suppliers, with visit/verify as a secondary path.
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy">
              View services
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>

        <p className="text-xs font-semibold tracking-[0.14em] uppercase text-navy/45 mb-3">
          Priority industry landings
        </p>
        <ul className="grid sm:grid-cols-3 gap-3 list-none p-0 m-0">
          {PRIORITY_INDUSTRY_LINKS.map((item) => (
            <li key={item.slug}>
              <Link
                href={item.href}
                className="group flex h-full flex-col border border-navy/12 p-4 no-underline transition-colors hover:border-amber/40"
              >
                <span className="font-semibold text-navy text-[14px] mb-1.5">{item.label}</span>
                <span className="text-navy/60 text-[13px] leading-relaxed flex-1 mb-3">{item.blurb}</span>
                <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-navy">
                  Open industry page
                  <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
