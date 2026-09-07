'use client'

import { useState, useRef, useEffect } from 'react'
import { useT } from '@/i18n/useT'

export default function TrustStatement() {
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
    <section className="bg-white py-16 md:py-20 px-8 md:px-20">
      <div
        ref={sectionRef}
        className={`max-w-[800px] mx-auto transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <p className="font-serif text-sm tracking-[0.08em] text-amber mb-4 italic">
          {t('home.trust.subtitle')}
        </p>
        <h2 className="font-serif text-[clamp(28px,4vw,40px)] font-semibold text-navy leading-tight tracking-tight mb-8 text-balance">
          {t('home.trust.title')}
        </h2>
        <div className="space-y-6 text-navy/70 text-[17px] leading-relaxed">
          <p>{t('home.trust.paragraph1')}</p>
          <p>{t('home.trust.paragraph2')}</p>
        </div>
      </div>
    </section>
  )
}
