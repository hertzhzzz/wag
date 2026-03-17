'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ClipboardList, ShieldCheck, CalendarCheck, Plane, Building2 } from 'lucide-react'

const steps = [
  {
    num: '1',
    icon: ClipboardList,
    title: 'Submit Your Inquiry',
    desc: 'Fill out our enquiry form with your industry, product type, and sourcing requirements. We\'ll get back to you within 24 hours.',
  },
  {
    num: '2',
    icon: ShieldCheck,
    title: 'We Review & Match',
    desc: 'Within 3-7 days, we review your requirements and shortlist 2-3 pre-screened factories from our verified network.',
  },
  {
    num: '3',
    icon: CalendarCheck,
    title: 'Initial Consultation',
    desc: 'We schedule an in-person or online meeting to discuss your trip details, timeline, and specific factory requirements.',
  },
  {
    num: '4',
    icon: Plane,
    title: 'Confirm Your Trip',
    desc: 'Once you\'re ready, we arrange flights, accommodation, transport, and your full itinerary in China.',
  },
  {
    num: '5',
    icon: Building2,
    title: 'Factory Visit Experience',
    desc: 'Arrive in China — your bilingual guide accompanies you throughout. Visit factories, ask questions, and make informed decisions.',
  },
]

export default function HowItWorks() {
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

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
    <section id="howitworks" className="bg-white py-20 md:py-28 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Section header - more professional */}
        <div className="max-w-2xl mb-16">
          <p className="uppercase tracking-[0.15em] text-xs font-semibold text-amber mb-4">
            Our Process
          </p>
          <h2 className="font-serif text-[clamp(32px,5vw,48px)] font-semibold text-navy leading-tight tracking-tight">
            Your China Trip, End to End
          </h2>
          <p className="text-lg text-navy/60 mt-4 leading-relaxed">
            From pre-trip research to post-trip contracts — we handle every step of your sourcing journey with expertise and care.
          </p>
        </div>

        {/* Steps - enhanced with connecting lines */}
        <div ref={sectionRef} className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4 mb-16 relative">
          {/* Connecting line - desktop only */}
          <div className="hidden md:block absolute top-16 left-[12%] right-[12%] h-px bg-gradient-to-r from-amber/50 via-amber/20 to-amber/50 z-0" />

          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`relative z-10 transition-all duration-700 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <div className="bg-white rounded-2xl p-6 h-full border border-navy/5 shadow-[0_4px_24px_rgba(15,45,94,0.06)] hover:shadow-[0_8px_32px_rgba(15,45,94,0.1)] transition-shadow duration-300">
                {/* Step number badge */}
                <div className="w-10 h-10 rounded-full bg-navy text-white font-semibold text-sm flex items-center justify-center mb-4">
                  {step.num}
                </div>

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center mb-4">
                  <step.icon size={24} className="text-amber" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-navy mb-2 leading-tight">
                  {step.title}
                </h3>
                <p className="text-sm text-navy/60 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-8 border-t border-navy/10">
          <Link
            href="/services"
            className="inline-flex items-center gap-3 bg-navy text-white px-8 py-4 text-sm font-semibold hover:bg-navy/90 transition-all duration-300 no-underline min-h-11 hover:gap-4"
          >
            View All Services
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <a
            href="#industries"
            className="inline-flex items-center gap-2 text-navy/60 hover:text-navy transition-colors no-underline group min-h-11"
          >
            <span className="text-sm font-medium">Industries We Cover</span>
            <svg
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
