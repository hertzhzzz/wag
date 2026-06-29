'use client'

import { useState, useRef, useEffect } from 'react'
import { Factory, MapPin, BadgeCheck, ClipboardCheck, DollarSign, Eye } from 'lucide-react'
import { useT } from '@/i18n/useT'

const reasons = [
  {
    icon: Factory,
    titleKey: 'home.why.reason1.title',
    descriptionKey: 'home.why.reason1.description',
  },
  {
    icon: MapPin,
    titleKey: 'home.why.reason2.title',
    descriptionKey: 'home.why.reason2.description',
  },
  {
    icon: BadgeCheck,
    titleKey: 'home.why.reason3.title',
    descriptionKey: 'home.why.reason3.description',
  },
  {
    icon: ClipboardCheck,
    titleKey: 'home.why.reason4.title',
    descriptionKey: 'home.why.reason4.description',
  },
  {
    icon: DollarSign,
    titleKey: 'home.why.reason5.title',
    descriptionKey: 'home.why.reason5.description',
  },
  {
    icon: Eye,
    titleKey: 'home.why.reason6.title',
    descriptionKey: 'home.why.reason6.description',
  },
] as const

export default function WhyChooseUs() {
  const t = useT()
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section className="bg-[#f8f9fb] py-16 md:py-20 px-8 md:px-20">
      <div className="max-w-[1120px] mx-auto">
        <div
          ref={sectionRef}
          className={`max-w-[1120px] mx-auto mb-12 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="font-serif text-sm tracking-[0.08em] text-amber mb-4 italic">
            {t('home.why.subtitle')}
          </p>
          <h2 className="font-serif text-[clamp(32px,5vw,48px)] font-semibold text-navy leading-tight tracking-tight mb-4 text-balance">
            {t('home.why.title')}
          </h2>
          <p className="text-navy/70 text-lg leading-relaxed">
            {t('home.why.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-navy/5">
              <reason.icon className="h-5 w-5 text-amber mb-4" />
              <h3 className="text-lg font-semibold text-navy mb-3">{t(reason.titleKey)}</h3>
              <p className="text-navy/60 text-sm leading-relaxed">{t(reason.descriptionKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
