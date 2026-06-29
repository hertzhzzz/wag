'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ClipboardList, ShieldCheck, CalendarCheck, Plane, Building2 } from 'lucide-react'
import { useT } from '@/i18n/useT'

const steps = [
  {
    num: '1',
    icon: ClipboardList,
    titleKey: 'home.how.step1Title',
    descKey: 'home.how.step1Desc',
  },
  {
    num: '2',
    icon: ShieldCheck,
    titleKey: 'home.how.step2Title',
    descKey: 'home.how.step2Desc',
  },
  {
    num: '3',
    icon: CalendarCheck,
    titleKey: 'home.how.step3Title',
    descKey: 'home.how.step3Desc',
  },
  {
    num: '4',
    icon: Plane,
    titleKey: 'home.how.step4Title',
    descKey: 'home.how.step4Desc',
  },
  {
    num: '5',
    icon: Building2,
    titleKey: 'home.how.step5Title',
    descKey: 'home.how.step5Desc',
  },
] as const

export default function HowItWorks() {
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const t = useT()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
        }
      },
      { threshold: 0.15 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="howitworks" className="bg-[#f8f9fb] py-14 md:py-18 px-8 md:px-20 scroll-mt-20">
      <div className="max-w-[1120px] mx-auto">
        {/* Section header - more professional */}
        <div className="max-w-[1120px] mx-auto mb-12">
          <p className="font-serif text-sm tracking-[0.08em] text-amber mb-4 italic">
            {t('home.how.sectionLabel')}
          </p>
          <h2 id="factory-visit" className="font-serif text-[clamp(32px,5vw,48px)] font-semibold text-navy leading-tight tracking-tight scroll-mt-20">
            {t('home.how.mainTitle')}
          </h2>
          <p className="text-lg text-navy/60 mt-4 leading-relaxed">
            {t('home.how.mainDesc')}
          </p>
        </div>

        {/* Steps - enhanced with connecting lines */}
        <div ref={sectionRef} className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4 mb-12 relative">
          {/* Connecting line - desktop only */}
          <div className="hidden md:block absolute top-16 left-[12%] right-[12%] h-px bg-gradient-to-r from-amber/50 via-amber/20 to-amber/50 z-0" />

          {steps.map((step, idx) => {
            const isFirst = idx === 0
            const isLast = idx === steps.length - 1
            return (
              <div
                key={idx}
                className={`relative z-10 transition-all duration-700 ${
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${idx * 150}ms` }}
              >
                <div className={`bg-white rounded-2xl p-6 h-full border transition-shadow duration-300 ${
                  isLast
                    ? 'border-amber/30 shadow-[0_8px_32px_rgba(245,158,11,0.15)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.2)]'
                    : 'border-navy/5 shadow-[0_4px_24px_rgba(15,45,94,0.06)] hover:shadow-[0_8px_32px_rgba(15,45,94,0.1)]'
                }`}>
                  {/* Step number badge */}
                  <div className={`rounded-full font-semibold text-sm flex items-center justify-center mb-4 ${
                    isFirst
                      ? 'w-10 h-10 bg-navy/10 text-navy'
                      : isLast
                      ? 'w-12 h-12 bg-amber text-white shadow-[0_4px_12px_rgba(245,158,11,0.3)]'
                      : 'w-10 h-10 bg-navy text-white'
                  }`}>
                    {step.num}
                  </div>

                  {/* Icon */}
                  <div className={`rounded-xl flex items-center justify-center mb-4 ${
                    isFirst
                      ? 'w-10 h-10 bg-navy/5'
                      : isLast
                      ? 'w-12 h-12 bg-amber/20'
                      : 'w-12 h-12 bg-amber/10'
                  }`}>
                    <step.icon size={isFirst ? 20 : 24} className={isLast ? 'text-amber' : 'text-amber'} />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-navy mb-2 leading-tight">
                    {t(step.titleKey)}
                  </h3>
                  <p className="text-sm text-navy/60 leading-relaxed">
                    {t(step.descKey)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-8 border-t border-navy/10">
          <Link
            href="/services"
            className="inline-flex items-center gap-3 bg-navy text-white px-8 py-4 text-sm font-semibold hover:bg-navy/90 transition-all duration-300 no-underline min-h-11 hover:gap-4"
          >
            {t('home.how.ctaPrimary')}
            <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <a
            href="#industries"
            className="inline-flex items-center gap-2 text-navy/60 hover:text-navy transition-colors no-underline group min-h-11"
          >
            <span className="text-sm font-medium">{t('home.how.ctaSecondary')}</span>
            <svg
              aria-hidden="true"
              className="w-5 h-5 transition-transform group-hover:translate-y-1"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
