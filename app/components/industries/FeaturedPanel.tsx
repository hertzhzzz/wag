'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Industry } from './types'

interface FeaturedPanelProps {
  industries: Industry[]
  activeIndex: number
  isMobile?: boolean
}

export default function FeaturedPanel({ industries, activeIndex, isMobile }: FeaturedPanelProps) {
  // Mobile view: show horizontal scroll banner
  if (isMobile) {
    return (
      <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-2 px-2">
        {industries.map((industry, idx) => (
          <div key={idx} className="relative overflow-hidden min-h-[320px] w-[85%] snap-center flex-shrink-0 mr-3">
            <Image
              src={industry.img}
              width={1200}
              height={800}
              alt={industry.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#0F2D5E]/80" />
            <div className="relative z-10 flex flex-col h-full p-6">
              <div className="text-[0.7rem] font-bold tracking-[0.15em] text-amber uppercase mb-2">
                {industry.num} — {industry.name}
              </div>
              <div className="font-serif text-xl text-white font-semibold leading-tight mb-1">
                {industry.name}
              </div>
              <div className="text-[0.8rem] text-blue-200 mb-4">
                {industry.sub}
              </div>
              <p className="text-[0.85rem] text-blue-100 leading-[1.6] mb-4 line-clamp-3">
                {industry.desc}
              </p>
              <div className="flex gap-2 flex-wrap mb-4">
                {industry.tags.map((tag, tidx) => (
                  <span key={tidx} className="text-[0.6rem] font-semibold tracking-[0.08em] uppercase text-white bg-white/15 border border-white/25 px-2 py-0.5">
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href="/enquiry"
                className="inline-flex items-center gap-2 bg-amber text-navy text-[0.75rem] font-semibold tracking-[0.08em] uppercase py-2.5 px-4 no-underline transition-all hover:bg-white hover:text-navy w-fit"
              >
                Enquire →
              </Link>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Desktop view: show single active industry
  const active = industries[activeIndex]

  return (
    <div className="relative overflow-hidden min-h-[480px]">
      {/* Only render the active image */}
      {active && (
        <Image
          src={active.img}
          width={1200}
          height={800}
          alt={active.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#0F2D5E]/75" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-12">
        <div className="text-[0.7rem] font-bold tracking-[0.15em] text-amber uppercase mb-3">
          {active.num} — {active.name}
        </div>
        <div className="font-serif text-[1.75rem] text-white font-semibold leading-tight mb-1.5">
          {active.name}
        </div>
        <div className="text-[0.85rem] text-blue-200 mb-6">
          {active.sub}
        </div>
        <div className="w-10 h-0.5 bg-amber mb-6" />
        <p className="text-[0.9rem] text-blue-100 leading-[1.75] mb-7">
          {active.desc}
        </p>
        <div className="flex gap-2 flex-wrap mb-8">
          {active.tags.map((tag, idx) => (
            <span key={idx} className="text-[0.68rem] font-semibold tracking-[0.08em] uppercase text-white bg-white/15 border border-white/25 px-2.5 py-1">
              {tag}
            </span>
          ))}
        </div>

        {/* What we arrange */}
        <div className="border-t border-white/20 pt-7 mb-8">
          <p className="text-[0.7rem] font-bold tracking-[0.12em] uppercase text-blue-300 mb-4">What We Arrange For You</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
            {[
              'Factory shortlist (2–3 verified)',
              'Bilingual guide on the ground',
              'Supplier pre-screening',
              'All logistics & transport',
              'Factory floor visits',
              'Post-visit supplier report',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[0.82rem] text-blue-100">
                <span className="w-1.5 h-1.5 rounded-full bg-amber flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/enquiry"
          className="inline-flex items-center gap-2.5 bg-amber text-navy text-[0.8rem] font-semibold tracking-[0.08em] uppercase py-3 px-6 no-underline transition-all hover:bg-white hover:text-navy w-fit"
        >
          Enquire About {active.name} →
        </Link>
      </div>
    </div>
  )
}
