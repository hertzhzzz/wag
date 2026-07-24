'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackPageView } from '@/lib/analytics'

/**
 * Sends GA4 page_view on App Router client navigations.
 * First paint is covered by the head gtag config; we skip the initial mount
 * to avoid double-counting the landing hit.
 */
export default function GaPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      return
    }
    const search = searchParams?.toString()
    const path = search ? `${pathname}?${search}` : pathname
    trackPageView(path)
  }, [pathname, searchParams])

  return null
}
