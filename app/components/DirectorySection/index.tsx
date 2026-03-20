'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import FilterTabs from './FilterTabs'
import CityList from './CityList'
import DirectoryMap from './DirectoryMap'
import { directoryCities } from './data/directory-cities'
import { IndustryFilter, CityEntry } from './types'

export default function DirectorySection() {
  const [activeFilter, setActiveFilter] = useState<IndustryFilter>('All')
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  const filteredCities = useMemo(() => {
    if (activeFilter === 'All') {
      return directoryCities
    }
    return directoryCities.filter((city) =>
      city.industries.includes(activeFilter)
    )
  }, [activeFilter])

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

  const handleCitySelect = (city: string) => {
    setSelectedCity(city)
  }

  return (
    <section
      ref={sectionRef}
      className={`bg-white py-14 md:py-18 px-4 md:px-10 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="max-w-[1100px] mx-auto">
        {/* Section header */}
        <div className="mb-8">
          <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">
            Factory Directory
          </p>
          <h2 className="font-serif text-[clamp(32px,5vw,48px)] font-semibold text-navy leading-tight tracking-tight">
            Explore Verified Manufacturers
          </h2>
        </div>

        {/* Filter tabs */}
        <div className="mb-6">
          <FilterTabs
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>

        {/* Desktop: 30/70 split layout. Mobile: stacked */}
        <div className="grid grid-cols-1 md:grid-cols-[30%_1fr] gap-4 md:gap-6">
          {/* City list - 30% on desktop */}
          <div className="h-[400px] md:h-[500px]">
            <CityList
              cities={filteredCities}
              selectedCity={selectedCity}
              onCitySelect={handleCitySelect}
            />
          </div>

          {/* Map - 70% on desktop */}
          <div className="h-[300px] md:h-[500px]">
            <DirectoryMap
              cities={filteredCities}
              selectedCity={selectedCity}
              onCitySelect={handleCitySelect}
            />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 flex justify-start">
          <Link
            href="/enquiry"
            className="inline-flex items-center gap-3 px-6 py-3 text-sm font-semibold transition-all duration-300 no-underline min-h-11 hover:gap-4 bg-amber text-white hover:bg-amber/90"
          >
            View Full Directory
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
        </div>
      </div>

      {/* Reduced motion */}
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
