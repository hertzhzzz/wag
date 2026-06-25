'use client'

import { useState, useRef, useEffect } from 'react'
import { Factory, MapPin, BadgeCheck, ClipboardCheck } from 'lucide-react'

const reasons = [
  {
    icon: Factory,
    title: 'Direct Factory Access',
    description: 'No traders, no middlemen. We introduce you directly to manufacturers and accompany you through every meeting, translation, and negotiation.',
  },
  {
    icon: MapPin,
    title: 'Australia-Based Team',
    description: 'Our Adelaide office manages your project with Australian standards of communication and professionalism, while our Shenzhen team provides on-ground support.',
  },
  {
    icon: BadgeCheck,
    title: 'Verified Suppliers Only',
    description: 'Every factory in our directory has been physically vetted. We verify business licenses, production capacity, quality control systems, and sample quality.',
  },
  {
    icon: ClipboardCheck,
    title: 'End-to-End Support',
    description: 'Factory matching, visit coordination, quality inspection, shipping logistics, and customs clearance — we can support as little or as much as you need.',
  },
]

export default function WhyChooseUs() {
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
      <div className="max-w-[1120px] mx-auto">
        <div
          ref={sectionRef}
          className={`max-w-[1120px] mx-auto mb-12 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="font-serif text-sm tracking-[0.08em] text-amber mb-4 italic">
            Our Commitment
          </p>
          <h2 className="font-serif text-[clamp(32px,5vw,48px)] font-semibold text-navy leading-tight tracking-tight mb-4 text-balance">
            Why Winning Adventure Global
          </h2>
          <p className="text-navy/70 text-lg leading-relaxed">
            We founded Winning Adventure Global because Australian businesses deserve better than dealing with factories through brokers or cold outreach. Our model is simple: introduce you directly to verified manufacturers, accompany you through the process, and ensure every box gets inspected before it leaves China.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-navy/5">
              <reason.icon className="h-5 w-5 text-amber mb-4" />
              <h3 className="text-lg font-semibold text-navy mb-3">{reason.title}</h3>
              <p className="text-navy/60 text-sm leading-relaxed">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
