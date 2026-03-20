'use client'

import { useEffect, useRef, useState } from 'react'
import { CityEntry } from './types'

interface CityListProps {
  cities: CityEntry[]
  selectedCity: string | null
  onCitySelect: (city: string) => void
}

export default function CityList({ cities, selectedCity, onCitySelect }: CityListProps) {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set())
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) {
      setVisibleItems(new Set(cities.map((c) => c.city)))
      return
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const city = entry.target.getAttribute('data-city')
            if (city) {
              setVisibleItems((prev) => new Set(prev).add(city))
            }
          }
        })
      },
      { threshold: 0.1 }
    )

    itemRefs.current.forEach((element) => {
      if (element) {
        observerRef.current?.observe(element)
      }
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [cities])

  return (
    <div className="bg-[#f0f4f8] rounded-lg overflow-y-auto h-full">
      {cities.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <p className="text-navy font-semibold text-lg mb-2">No factories found</p>
          <p className="text-navy/60 text-sm">Try selecting a different industry filter above.</p>
        </div>
      ) : (
        <div className="space-y-3 p-4">
          {cities.map((cityEntry, index) => {
            const isVisible = visibleItems.has(cityEntry.city)
            const isSelected = selectedCity === cityEntry.city

            return (
              <div
                key={cityEntry.city}
                ref={(el) => {
                  if (el) itemRefs.current.set(cityEntry.city, el)
                }}
                data-city={cityEntry.city}
                onClick={() => onCitySelect(cityEntry.city)}
                className={`
                  rounded-lg border p-4 cursor-pointer transition-all duration-200
                  ${
                    isSelected
                      ? 'bg-white border-l-[3px] border-l-amber shadow-sm'
                      : 'bg-white border-navy/5 shadow-sm hover:bg-amber/10'
                  }
                  ${
                    isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4'
                  }
                `}
                style={{
                  transitionDelay: isVisible ? '0ms' : `${index * 80}ms`,
                  transitionDuration: '700ms',
                  transitionTimingFunction: 'ease-out',
                }}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-lg font-semibold text-navy leading-tight">
                    {cityEntry.city}
                  </h3>
                  <span className="text-xs text-navy/60 font-medium">
                    {cityEntry.province}
                  </span>
                </div>
                <p className="text-sm text-navy/60 mb-2">
                  {cityEntry.factories} factories
                </p>
                <p className="text-sm text-navy/80 italic">
                  {cityEntry.focus}
                </p>
              </div>
            )
          })}
        </div>
      )}
      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          .opacity-0.translate-y-4 {
            opacity: 1 !important;
            transform: translate-y-0 !important;
          }
        }
      `}</style>
    </div>
  )
}
