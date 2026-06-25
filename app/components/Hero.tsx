'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import LeadForm from '@/components/LeadForm'

export default function Hero() {
  const [videoPlaying, setVideoPlaying] = useState(false)

  return (
    <section className="relative min-h-[60vh] md:min-h-[720px] flex items-center overflow-hidden">
      {/* Poster Image - fades out when video starts playing on all devices */}
      {!videoPlaying && (
        <div className="absolute inset-0">
          <Image
            src="/hero-video-first-frame.webp"
            alt="Chinese manufacturing facility with Australian business team"
            fill
            priority={true}
            loading="eager"
            fetchPriority="high"
            quality={80}
            sizes="1200px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy/20" />
        </div>
      )}

      {/* Video Background - all devices */}
      <div className="absolute inset-0" aria-hidden="true">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
          onLoadedData={() => setVideoPlaying(true)}
        >
          <source src="/hero_vid_compressed.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy/20" />
      </div>

      {/* Decorative element - subtle diagonal line */}
      <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-amber/5 to-transparent skew-x-12" />

      {/* Content - left copy, right lead form */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16 grid lg:grid-cols-[1.25fr_0.75fr] gap-8 lg:gap-10 items-center">
        {/* Left: copy */}
        <div>
          {/* Brand tag */}
          <div className="flex items-center gap-3 mb-6 hero-brand-tag is-visible">
            <span className="h-px w-8 bg-amber/70" />
            <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-white/70">
              Australia
            </p>
          </div>

          <h1 className="max-w-[600px]">
            <span className="block leading-[1.1] tracking-[-2px] font-serif font-bold italic text-[clamp(30px,3.8vw,52px)] text-white hero-headline-line-1 is-visible">
              Face to face with <span className="text-amber">factories</span>
            </span>
            <span className="block leading-[1.1] tracking-[-2px] font-serif font-bold text-[clamp(30px,3.8vw,52px)] text-white hero-headline-line-2 is-visible">
              <span className="text-amber">No</span> middleman.
            </span>
            <span className="block leading-[1.1] tracking-[-2px] font-serif font-bold text-[clamp(30px,3.8vw,52px)] text-white hero-headline-line-3 is-visible">
              <span className="text-amber">No</span> markup.
            </span>
          </h1>

          <p className="text-lg md:text-xl font-light leading-[1.7] text-white/80 max-w-[560px] mt-6 mb-8 hero-subtitle is-visible">
            Australia-based sourcing agent — we verify factories so you can buy direct.
          </p>

          <Link
            href="/#factory-visit"
            className="inline-flex items-center gap-2 border border-white/30 text-white px-7 py-3.5 font-medium hover:bg-white/10 hover:border-white/50 transition-all duration-300 no-underline text-sm min-h-11 backdrop-blur-sm hero-cta-secondary is-visible"
          >
            How factory visits work
            <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-12 pt-7 border-t border-white/10 hero-trust is-visible">
            {['Across 50+ Industries', '500+ Verified Suppliers', '24hr Enquiry Response'].map((label) => (
              <div key={label} className="flex items-center gap-2 text-white/65 text-sm trust-item">
                <svg aria-hidden="true" className="w-5 h-5 text-amber flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: lead form */}
        <div className="w-full max-w-[440px] lg:justify-self-end hero-buttons is-visible">
          <LeadForm
            heading="Book your free consult"
            subcopy="Tell us what you’re sourcing — we’ll line up verified factories and a plan."
          />
        </div>
      </div>
    </section>
  )
}
