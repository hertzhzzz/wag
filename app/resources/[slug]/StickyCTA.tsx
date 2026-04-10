'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface StickyCTAProps {
  category: string
  ctaTitle: string
  ctaText: string
  ctaButtonText: string
}

export function StickyCTA({ category, ctaTitle, ctaText, ctaButtonText }: StickyCTAProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true })
    toggleVisibility()
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  if (!isVisible) return null

  return (
    <div
      className="fixed w-[260px] bg-white border border-gray-200 rounded-lg p-5 shadow-[0_4px_20px_rgba(15,45,94,0.08)] z-30"
      style={{
        top: '50%',
        transform: 'translateY(-50%)',
        right: 'max(2rem, calc((100vw - 1100px) / 2 + 1100px + 48px))'
      }}
    >
      <p className="text-[0.65rem] font-bold tracking-[0.12em] uppercase text-[#F59E0B] mb-3">{category}</p>
      <h3 className="font-serif text-lg font-bold text-[#0F2D5E] mb-3 leading-snug">{ctaTitle}</h3>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">{ctaText}</p>
      <Link
        href="/enquiry"
        className="block w-full bg-[#0F2D5E] text-white text-sm font-semibold px-4 py-3 text-center hover:bg-[#F59E0B] hover:text-[#0F2D5E] transition-colors rounded-sm"
      >
        {ctaButtonText}
      </Link>
      <p className="text-[0.65rem] text-gray-400 text-center mt-3">Free consultation · 4 hour response</p>
    </div>
  )
}
