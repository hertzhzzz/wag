'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Package, Plane, Monitor, ArrowRight } from 'lucide-react'

const services = [
  {
    icon: Package,
    title: 'One-Time Procurement',
    tagline: 'Your product, your choice — go to China with our guide or let us handle it remotely.',
    bestFor: 'Businesses with a clear product spec ready to order',
    features: [
      'Supplier matching from our factory database',
      'Pricing comparison & negotiation',
      'Pre-shipment quality inspection',
      'Logistics to Australian port',
    ],
    cta: 'Start a Procurement',
    href: '/services#tiers',
  },
  {
    icon: Plane,
    title: 'Factory Tour + Supply Chain',
    tagline: 'Visit China with a bilingual guide and build your supply chain in person.',
    bestFor: 'Businesses wanting to meet suppliers and tour production lines',
    features: [
      'Full trip planning & bilingual guide',
      'On-site factory audit & license verification',
      'Export history validation',
      'Ongoing procurement support post-visit',
    ],
    cta: 'Plan a Factory Tour',
    href: '/services#tiers',
    highlighted: true,
  },
  {
    icon: Monitor,
    title: 'Remote Verification + Supply Chain',
    tagline: 'Get verified suppliers and ongoing procurement without travelling.',
    bestFor: 'Businesses that cannot travel but need deep verification',
    features: [
      'SAMR license & certification authentication',
      'Remote factory video walkthrough',
      'Pre-shipment inspection with photo evidence',
      'Quarterly supplier performance reviews',
    ],
    cta: 'Start Remote Verification',
    href: '/services#tiers',
  },
]

export default function TwoWaysAccess() {
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisible(true)
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="bg-white py-16 md:py-20 px-8 md:px-20">
      <div className="max-w-[1120px] mx-auto">
        {/* Section header */}
        <div className="mb-10">
          <p className="font-serif text-sm tracking-[0.08em] text-amber mb-4 italic">
            Our Services
          </p>
          <h2 className="font-serif text-[clamp(32px,5vw,48px)] font-semibold text-navy leading-tight tracking-tight text-balance max-w-[700px]">
            How Would You Like to Find Your Factory?
          </h2>
        </div>

        {/* 3 service cards */}
        <div
          ref={sectionRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6"
        >
          {services.map((svc, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 md:p-7 h-full transition-all duration-700 flex flex-col ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              } ${
                svc.highlighted
                  ? 'bg-amber/5 border-amber/30 shadow-[0_8px_32px_rgba(245,158,11,0.15)] ring-1 ring-amber/20'
                  : 'bg-white border-navy/5 shadow-[0_4px_24px_rgba(15,45,94,0.06)] hover:shadow-[0_8px_32px_rgba(15,45,94,0.1)]'
              }`}
              style={{ transitionDelay: `${idx * 120}ms` }}
            >
              {/* Icon */}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${
                  svc.highlighted ? 'bg-amber/20' : 'bg-navy/5'
                }`}
              >
                <svc.icon size={22} className={svc.highlighted ? 'text-amber' : 'text-navy'} />
              </div>

              {/* Title */}
              <h3 className="text-[17px] font-semibold text-navy mb-2">{svc.title}</h3>

              {/* Tagline */}
              <p className="text-[13px] text-navy/60 leading-relaxed mb-4">{svc.tagline}</p>

              {/* Best for */}
              <p className="text-[11px] font-semibold text-navy/40 uppercase tracking-wide mb-3">
                Best for: <span className="text-navy/70 normal-case">{svc.bestFor}</span>
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-6 flex-1">
                {svc.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      svc.highlighted ? 'bg-amber' : 'bg-navy/30'
                    }`} />
                    <span className="text-[13px] text-navy/80 leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={svc.href}
                className={`inline-flex items-center justify-center gap-2 w-full py-3 text-[13px] font-semibold transition-all duration-300 no-underline min-h-11 ${
                  svc.highlighted
                    ? 'bg-amber text-navy hover:bg-amber/90'
                    : 'bg-navy text-white hover:bg-navy/90'
                }`}
              >
                {svc.cta} <ArrowRight size={15} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
