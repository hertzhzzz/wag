'use client'

import { useRef, useEffect, useState } from 'react'
import { IndustryFilter } from './types'

const filters: IndustryFilter[] = [
  'All',
  'Electronics',
  'Furniture',
  'Robotics',
  'EV Battery',
  'CBD Property',
  'Construction',
  'Food & Beverage',
]

interface FilterTabsProps {
  activeFilter: IndustryFilter
  onFilterChange: (filter: IndustryFilter) => void
}

export default function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabsRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (activeTabRef.current && tabsRef.current) {
      const containerRect = tabsRef.current.getBoundingClientRect()
      const activeRect = activeTabRef.current.getBoundingClientRect()
      setIndicatorStyle({
        left: activeRect.left - containerRect.left,
        width: activeRect.width,
      })
    }
  }, [activeFilter])

  return (
    <div
      ref={tabsRef}
      className="flex gap-1 overflow-x-auto hide-scrollbar relative"
    >
      {filters.map((filter) => (
        <button
          key={filter}
          ref={filter === activeFilter ? activeTabRef : null}
          onClick={() => onFilterChange(filter)}
          className={`
            flex-shrink-0 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em]
            transition-colors duration-200 rounded-t-md
            ${
              activeFilter === filter
                ? 'text-amber'
                : 'text-navy/60 hover:text-navy hover:bg-amber/10'
            }
          `}
        >
          {filter}
        </button>
      ))}
      {/* Sliding amber underline indicator */}
      <div
        className="absolute bottom-0 h-0.5 bg-amber transition-all duration-200 ease-in-out"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
      />
    </div>
  )
}
