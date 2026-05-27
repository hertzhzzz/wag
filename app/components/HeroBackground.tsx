'use client'

import Image from 'next/image'
import { useState } from 'react'

interface HeroBackgroundProps {
  /** Mobile: show hero-image.webp after load (starts invisible) */
  mobileOnly?: boolean
  /** Desktop: show video with og-image-1920.webp poster, image fallback on error */
  videoDesktop?: boolean
  /** Height for mobile container (e.g. '280px' or '60vh') */
  mobileHeight?: string
  /** Alt text for the hero image */
  alt: string
}

export default function HeroBackground({
  mobileOnly = false,
  videoDesktop = false,
  mobileHeight,
  alt,
}: HeroBackgroundProps) {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [mobileImageLoaded, setMobileImageLoaded] = useState(false)

  const mobileStyle = mobileHeight ? { height: mobileHeight } : {}

  return (
    <>
      {/* Mobile: image fades in on load */}
      <div className="absolute inset-0 md:hidden" style={mobileStyle}>
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            mobileImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src="/hero-image.webp"
            alt={alt}
            fill
            priority={true}
            loading="eager"
            fetchPriority="high"
            quality={80}
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover"
            onLoad={() => setMobileImageLoaded(true)}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy/20" />
      </div>

      {/* Desktop: video fades in, image fallback on error */}
      {!mobileOnly && (
        <div className="hidden md:block absolute inset-0" aria-hidden="true">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              videoLoaded && !videoError ? 'opacity-100' : 'opacity-0'
            }`}
            onLoadedMetadata={() => setVideoLoaded(true)}
            onError={() => setVideoError(true)}
            poster="/og-image-1920.webp"
          >
            <source src="https://pub-543b90f0e56147e5bdd93d5e7cc36c10.r2.dev/hero_vid_compressed.mp4" type="video/mp4" />
          </video>
          <div
            className={`absolute inset-0 transition-opacity duration-700 ${
              videoError ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src="/og-image-1920.webp"
              alt={alt}
              fill
              priority={true}
              loading="eager"
              quality={80}
              sizes="1200px"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy/20" />
        </div>
      )}
    </>
  )
}
