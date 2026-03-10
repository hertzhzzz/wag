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
  const [visible, setVisible] = useState(true)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    // Fallback: show after 500ms anyway
    const fallbackTimer = setTimeout(() => setVisible(true), 500)

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      observer.disconnect()
      clearTimeout(fallbackTimer)
    }
  }, [])

  return (
    <section id="howitworks" className="bg-white py-20 px-4 md:px-6">
      <div className="max-w-[1100px] mx-auto">
        <p className="uppercase tracking-[0.12em] text-xs font-semibold text-amber mb-3">
          Our Process
        </p>
        <h2 className="font-serif text-[clamp(28px,4vw,42px)] font-semibold text-navy mb-3">
          Your China Trip, End to End
        </h2>
        <p className="text-base text-[#5a6a7e] mb-[60px]">
          From pre-trip research to post-trip contracts — we handle every step.
        </p>

        <div ref={sectionRef} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`relative bg-white rounded-xl py-6 px-4 overflow-hidden shadow-[0_2px_12px_rgba(15,45,94,0.06)] transition-all duration-[600ms] ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'
              }`}
              style={{ transitionDelay: `${idx * 200}ms` }}
            >
              <div className="absolute top-[-5px] right-[-5px] text-[80px] font-bold font-serif text-[rgba(15,45,94,0.05)] leading-none select-none pointer-events-none">
                {step.num}
              </div>
              <div className="text-[11px] font-bold text-navy tracking-[0.08em] uppercase mb-3 flex items-center gap-2">
                <span className="inline-block w-6 h-0.5 bg-[#0F2D5E]"></span>
                <step.icon size={16} className="text-amber" />
                Step {step.num}
              </div>
              <div className="text-[15px] font-bold text-navy mb-2 relative z-[1] leading-tight">
                {step.title}
              </div>
              <p className="text-xs text-[#5a6a7e] leading-[1.6] relative z-[1]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/services"
            className="inline-block bg-[#0F2D5E] text-white px-8 py-4 text-sm font-semibold hover:bg-[#0a1f42] transition-colors no-underline min-h-11"
          >
            View All Services →
          </Link>
          <a
            href="#industries"
            className="flex flex-col items-center gap-1.5 text-[#94a3b8] hover:text-navy transition-colors no-underline group min-h-11"
            aria-label="See industries we cover"
          >
            <span className="text-[11px] font-medium tracking-[0.12em] uppercase">Industries We Cover</span>
            <svg
              className="w-5 h-5 animate-bounce"
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
