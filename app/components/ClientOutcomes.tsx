'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Search, Factory, Star, ArrowRight } from 'lucide-react'

export default function ClientOutcomes() {
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

      <div className="mt-12" style={fade(0.25)}>
        {/* Section break */}
        <div className="flex items-center gap-3 mb-8">
          <span className="h-px flex-1 bg-navy/10" aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-navy/30">Case Story</span>
          <span className="h-px flex-1 bg-navy/10" aria-hidden="true" />
        </div>

        {/* Timeline — vertical, full-width story flow */}
        <div className="space-y-10">
          {[
            {
              icon: Search,
              iconBg: 'bg-navy/10',
              iconColor: 'text-navy',
              title: 'The Challenge',
              body: 'The existing supplier had stopped allowing factory visits. Quality defects had doubled over 12 months, leaving the importer unable to verify whether the factory was still manufacturing in-house.',
            },
            {
              icon: Factory,
              iconBg: 'bg-amber/10',
              iconColor: 'text-amber',
              title: 'Our Approach',
              body: 'Our team visited the existing factory and two alternative suppliers in Guangdong over four days. We verified registrations, photographed production lines, interviewed floor managers, and cross-checked certifications.',
            },
            {
              icon: Star,
              iconBg: 'bg-navy',
              iconColor: 'text-white',
              title: 'The Outcome',
              body: 'We confirmed the existing factory had shifted production to an unregistered sub-contractor and shortlisted an alternative with 14 years of AV manufacturing history and better unit pricing — transitioned within six weeks with zero supply interruption.',
            },
          ].map((step, i) => (
            <div key={i} className="flex gap-5" style={fade(0.3 + i * 0.08)}>
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full ${step.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <step.icon size={18} className={step.iconColor} />
                </div>
                {i < 2 && <div className="w-px flex-1 bg-navy/10 mt-2" aria-hidden="true" />}
              </div>
              {/* Content */}
              <div className="pb-2">
                <h3 className="font-semibold text-navy text-[16px] mb-2">{step.title}</h3>
                <p className="text-[14px] text-navy/70 leading-relaxed max-w-[600px]">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== CTA BAND ===== */}
      <div className="mt-12 bg-navy text-white px-6 py-8 md:py-10" style={fade(0.5)}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="font-serif font-bold text-[clamp(1.2rem,2.2vw,1.6rem)] leading-tight mb-1">
              Need supplier verification?
            </h3>
            <p className="text-white/70 text-[14px] max-w-[480px]">
              Get the same verification process used in this engagement. We&apos;ll audit your supplier and deliver a structured report.
            </p>
          </div>
          <Link
            href="/enquiry"
            className="inline-flex items-center gap-2 bg-navy text-white font-semibold px-6 py-3 text-[13px] hover:bg-navy/90 transition-colors flex-shrink-0 ring-1 ring-white/20"
          >
            Book Free Consult <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* ===== DISCLAIMER ===== */}
      <p className="text-[12px] text-navy/60 italic mt-6" style={fade(0.55)}>
        Client details de-identified. Results are specific to this engagement and do not guarantee identical outcomes.
      </p>
    </div>
  )
}
