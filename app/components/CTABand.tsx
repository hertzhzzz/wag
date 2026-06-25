'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { trackCTAClick } from '@/lib/analytics'

export default function CTABand() {
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

  const handleStartClick = () => {
    trackCTAClick('Start Your China Trip', 'CTABand')
  }

  const handleSeeHowClick = () => {
    trackCTAClick('See How It Works', 'CTABand')
  }

  return (
    <section className="bg-white border-t border-gray-200 py-12 px-8 md:px-20 w-full relative overflow-hidden">
      <div
        ref={sectionRef}
        className={`max-w-[880px] mx-auto flex items-center justify-between gap-10 flex-wrap relative z-[1] transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div>
          <h2 className="font-serif text-[2rem] font-semibold text-navy mb-2.5">
            Your Suppliers Are Ready. Are You?
          </h2>
          <p className="text-base text-navy/60">
            Book a 30-minute discovery call.
          </p>
        </div>
        <div className="flex gap-4 flex-wrap flex-shrink-0">
          <Link
            href="/enquiry"
            onClick={handleStartClick}
            className="bg-navy text-white px-7 py-3.5 border-0 rounded font-sans text-[0.95rem] font-semibold cursor-pointer inline-block transition-all hover:bg-[#163d73] hover:-translate-y-px min-h-11"
          >
            Start Your China Trip →
          </Link>
          <Link
            href="/#howitworks"
            onClick={handleSeeHowClick}
            className="bg-white text-navy px-7 py-3.5 border-2 border-navy rounded font-sans text-[0.95rem] font-medium cursor-pointer inline-block transition-all hover:bg-[#f0f4fa] hover:-translate-y-px min-h-11"
          >
            See How It Works
          </Link>
        </div>
      </div>
    </section>
  )
}
