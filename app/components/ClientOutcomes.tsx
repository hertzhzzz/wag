'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Search, Factory, Star, ArrowRight, MapPin, CheckCircle } from 'lucide-react'

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

  return (
    <div ref={ref}>
      {/* Tags row */}
      <div className="flex flex-wrap gap-2 mb-4" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s 0.1s' }}>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-amber bg-amber/5 border border-amber/20 px-3 py-1 rounded">
          AV Equipment · Electronics
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-navy/60 bg-navy/5 border border-navy/10 px-3 py-1 rounded flex items-center gap-1">
          <MapPin size={12} /> Melbourne · Australia
        </span>
      </div>

      {/* Title */}
      <h2 className="font-serif text-[clamp(1.4rem,3vw,2rem)] font-bold text-navy mb-3 leading-tight text-balance" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s 0.2s' }}>
        How a Melbourne AV Equipment Importer Verified Their Supply Chain
      </h2>

      {/* Intro */}
      <p className="text-navy/70 leading-relaxed mb-5 max-w-[620px]" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s 0.3s' }}>
        A Melbourne-based importer of professional audio-visual equipment had been sourcing from a single Chinese factory for three years. Margins were tightening, quality complaints rising, and the factory had become unresponsive on pricing. They reached out to us to verify their existing supplier and explore alternatives.
      </p>

      {/* Outcome highlights */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s 0.35s' }}>
        {[
          { label: 'Alternative supplier verified', sub: 'with 14 years of AV manufacturing history' },
          { label: 'Better unit pricing', sub: '— improved margins confirmed' },
          { label: '6-week transition', sub: '— zero supply interruption' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <CheckCircle size={16} className="text-amber flex-shrink-0" />
            <div>
              <span className="text-[14px] font-semibold text-navy">{item.label}</span>
              <span className="text-[14px] text-navy/60">{item.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="w-16 h-px bg-amber/50 mb-6" aria-hidden="true" />

      {/* 3 cards — wider, less height */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          {
            icon: Search,
            iconBg: 'bg-navy/10',
            iconColor: 'text-navy',
            title: 'The Challenge',
            body: 'The existing supplier had stopped allowing factory visits. Quality defect rates had doubled over 12 months. The importer had no way to verify whether the factory was still manufacturing in-house or sub-contracting.',
          },
          {
            icon: Factory,
            iconBg: 'bg-amber/10',
            iconColor: 'text-amber',
            title: 'Our Approach',
            body: 'Over four days our team visited the existing factory and two alternative suppliers in Guangdong. We verified business registrations, photographed production lines, interviewed floor managers, and cross-checked certifications.',
          },
          {
            icon: Star,
            iconBg: 'bg-navy',
            iconColor: 'text-white',
            title: 'The Outcome',
            body: 'Our verification confirmed the existing factory had shifted production to an unregistered sub-contractor. We shortlisted an alternative supplier with 14 years of AV manufacturing history and better unit pricing.',
          },
        ].map((card, i) => (
          <div key={i} className="bg-[#f8f9fb] border border-gray-100 p-5" style={{ opacity: visible ? 1 : 0, transition: `opacity 0.4s ${0.4 + i * 0.1}s` }}>
            <div className={`w-9 h-9 rounded-full ${card.iconBg} flex items-center justify-center mb-3`}>
              <card.icon size={18} className={card.iconColor} />
            </div>
            <h3 className="font-semibold text-navy text-[15px] mb-1.5">{card.title}</h3>
            <p className="text-[13px] text-navy/70 leading-relaxed">{card.body}</p>
          </div>
        ))}
      </div>

      {/* Disclaimer + CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-[12px] text-navy/40 italic max-w-[400px]">Client details de-identified. Results are specific to this engagement and do not guarantee identical outcomes.</p>
        <Link
          href="/enquiry"
          className="inline-flex items-center gap-2 bg-navy text-white text-[13px] font-semibold px-6 py-3 hover:bg-navy/90 transition-colors flex-shrink-0"
        >
          Need supplier verification? <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  )
}
