'use client'

import Link from 'next/link'
import { useT } from '@/i18n/useT'
import { trackInternalLink } from '@/lib/analytics'

export default function HomeAgentLink() {
  const t = useT()
  return (
    <section className="bg-[#f8f9fb] border-y border-navy/5 py-8 px-8 md:px-20">
      <div className="max-w-[1120px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-navy/80 text-base md:text-lg leading-relaxed max-w-[640px]">
          {t('home.agentLink.label')}
        </p>
        <Link
          href="/china-sourcing-agent"
          className="inline-flex items-center justify-center bg-navy text-white py-3 px-6 text-sm font-semibold hover:bg-navy/90 transition-colors min-h-11 whitespace-nowrap"
          aria-label={t('home.agentLink.cta')}
          onClick={() =>
            trackInternalLink(
              typeof window !== 'undefined' ? window.location.pathname : '/',
              '/china-sourcing-agent',
              t('home.agentLink.cta'),
            )
          }
        >
          {t('home.agentLink.cta')}
        </Link>
      </div>
    </section>
  )
}
