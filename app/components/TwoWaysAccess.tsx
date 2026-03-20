'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Compass, Database } from 'lucide-react'
import DirectoryAccessModal from './DirectoryAccessModal'

const cards = [
  {
    isPrimary: true,
    icon: Compass,
    title: 'Full Service / Guided Tours',
    description: 'Your dedicated guide handles every detail — from factory matching to on-ground logistics.',
    bullets: [
      'Dedicated guide accompanies you',
      'Factory screening and matching',
      'Quality control guidance',
      'Contract follow-up support',
    ],
    cta: 'Start Your Tour',
    ctaHref: '/enquiry',
  },
  {
    isPrimary: false,
    icon: Database,
    title: 'Factory Directory Access — Free',
    description: 'Browse verified manufacturers independently at no cost — submit an enquiry to unlock full contact details.',
    bullets: [
      'Free access to factory directory',
      'Browse partial factory previews',
      'Submit enquiry for full details',
    ],
    cta: 'Access Directory Free',
    ctaHref: '/enquiry',
  },
]

export default function TwoWaysAccess() {
  const [visible, setVisible] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
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
    <section className="bg-white py-20 md:py-28 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        {/* Section header */}
        <div className="max-w-2xl mb-16">
          <p className="font-serif text-sm tracking-[0.08em] text-amber mb-4 italic">
            Our Services
          </p>
          <h2 className="font-serif text-[clamp(32px,5vw,48px)] font-semibold text-navy leading-tight tracking-tight">
            How Would You Like to Find Your Factory?
          </h2>
        </div>

        {/* Cards grid */}
        <div
          ref={sectionRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
        >
          {cards.map((card, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 md:p-8 h-full transition-all duration-700 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              } ${
                card.isPrimary
                  ? 'bg-amber/5 border-amber/30 shadow-[0_8px_32px_rgba(245,158,11,0.15)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.2)]'
                  : 'bg-white border-navy/5 shadow-[0_4px_24px_rgba(15,45,94,0.06)] hover:shadow-[0_8px_32px_rgba(15,45,94,0.1)]'
              }`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                  card.isPrimary ? 'bg-amber/20' : 'bg-navy/5'
                }`}
              >
                <card.icon
                  size={24}
                  className={card.isPrimary ? 'text-amber' : 'text-navy'}
                />
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-navy mb-3">
                {card.title}
              </h3>

              {/* Description */}
              <p className="text-navy/60 mb-6">
                {card.description}
              </p>

              {/* Bullets */}
              <ul className="space-y-2 mb-8">
                {card.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-3">
                    <span
                      className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        card.isPrimary ? 'bg-amber' : 'bg-navy/30'
                      }`}
                    />
                    <span className="text-sm text-navy/80">{bullet}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {card.isPrimary ? (
                <Link
                  href={card.ctaHref}
                  className="inline-flex items-center gap-3 px-6 py-3 text-sm font-semibold transition-all duration-300 no-underline min-h-11 hover:gap-4 bg-amber text-white hover:bg-amber/90"
                >
                  {card.cta}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              ) : (
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-3 px-6 py-3 text-sm font-semibold transition-all duration-300 no-underline min-h-11 hover:gap-4 bg-navy text-white hover:bg-navy/90"
                >
                  {card.cta}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Directory Access Modal */}
      <DirectoryAccessModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Reduced motion accessibility */}
      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          .opacity-0.translate-y-8 {
            opacity: 1;
            transform: translate-y-0;
          }
        }
      `}</style>
    </section>
  )
}
