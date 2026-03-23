'use client'

import { useEffect, useRef } from 'react'
import { trackScrollDepth } from './analytics'

const SCROLL_MILESTONES = [25, 50, 75, 90, 100]

/**
 * Hook to track scroll depth on a page
 * Fires events at 25%, 50%, 75%, 90%, 100% scroll milestones
 */
export function useScrollDepth() {
  const milestonesHit = useRef<Set<number>>(new Set())
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight <= 0) return

      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100)

      for (const milestone of SCROLL_MILESTONES) {
        if (scrollPercent >= milestone && !milestonesHit.current.has(milestone)) {
          milestonesHit.current.add(milestone)
          trackScrollDepth(milestone, pathname)
        }
      }
    }

    // Initial check
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])
}
