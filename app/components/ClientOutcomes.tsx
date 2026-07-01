'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Search, Factory, Star, ArrowRight } from 'lucide-react'
import { useT } from '@/i18n/useT'
import { trackCTAClick } from '@/lib/analytics'

export default function ClientOutcomes() {
  const t = useT()
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const fade = (delay: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(12px)',
    transition: `opacity 0.5s ${delay}s, transform 0.5s ${delay}s`,
  })

  return (
    <div ref={ref}>
      {/* ===== TIMELINE ===== */}

      <div className="mt-8" style={fade(0.25)}>
        {/* Section break */}
        <div className="flex items-center gap-2 mb-5">
          <span className="h-px flex-1 bg-navy/10" aria-hidden="true" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-navy/30">{t('home.outcomes.sectionLabel')}</span>
          <span className="h-px flex-1 bg-navy/10" aria-hidden="true" />
        </div>

        {/* Timeline — compact vertical flow */}
        <div className="space-y-5">
          {[
            {
              icon: Search,
              iconBg: 'bg-navy/10',
              iconColor: 'text-navy',
              title: t('home.outcomes.step1Title'),
              body: t('home.outcomes.step1Body'),
            },
            {
              icon: Factory,
              iconBg: 'bg-amber/10',
              iconColor: 'text-amber',
              title: t('home.outcomes.step2Title'),
              body: t('home.outcomes.step2Body'),
            },
            {
              icon: Star,
              iconBg: 'bg-navy',
              iconColor: 'text-white',
              title: t('home.outcomes.step3Title'),
              body: t('home.outcomes.step3Body'),
            },
          ].map((step, i) => (
            <div key={i} className="flex gap-3" style={fade(0.3 + i * 0.08)}>
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full ${step.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <step.icon size={15} className={step.iconColor} />
                </div>
                {i < 2 && <div className="w-px flex-1 bg-navy/10 mt-1.5" aria-hidden="true" />}
              </div>
              {/* Content */}
              <div className="pb-1">
                <h3 className="font-semibold text-navy text-[14px] mb-1">{step.title}</h3>
                <p className="text-[13px] text-navy/70 leading-relaxed max-w-[600px]">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== CTA BAND ===== */}
      <div className="mt-8 bg-navy text-white px-6 py-6 md:py-8" style={fade(0.5)}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif font-bold text-[clamp(1rem,2vw,1.3rem)] leading-tight mb-1">
              {t('home.outcomes.ctaHeading')}
            </h3>
            <p className="text-white/70 text-[13px] max-w-[480px]">
              {t('home.outcomes.ctaDescription')}
            </p>
          </div>
          <Link
            href="/enquiry"
            className="inline-flex items-center gap-2 bg-navy text-white font-semibold px-5 py-2.5 text-[13px] hover:bg-navy/90 transition-colors flex-shrink-0 ring-1 ring-white/20"
            onClick={() => trackCTAClick('Client Outcomes CTA', 'homepage-client-outcomes')}
          >
            {t('home.outcomes.ctaButton')} <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ===== DISCLAIMER ===== */}
      <p className="text-[11px] text-navy/60 italic mt-4" style={fade(0.55)}>
        {t('home.outcomes.disclaimer')}
      </p>
    </div>
  )
}
