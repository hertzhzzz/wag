'use client'

import { useEffect, useRef } from 'react'
import {
  createEnquiryFunnelTracker,
  type EnquiryFunnelContext,
} from '@/lib/analytics'

const VIEW_THRESHOLD = 0.5
const VIEW_DURATION_MS = 1000

export function useEnquiryFunnel(context: EnquiryFunnelContext) {
  const formRef = useRef<HTMLFormElement>(null)
  const contextRef = useRef(context)
  contextRef.current = context

  const trackerRef = useRef<ReturnType<typeof createEnquiryFunnelTracker> | null>(null)
  if (!trackerRef.current) {
    trackerRef.current = createEnquiryFunnelTracker(() => contextRef.current)
  }

  useEffect(() => {
    const form = formRef.current
    const tracker = trackerRef.current
    if (!form || !tracker || typeof IntersectionObserver === 'undefined') return

    let viewTimer: ReturnType<typeof setTimeout> | undefined
    const clearViewTimer = () => {
      if (viewTimer === undefined) return
      clearTimeout(viewTimer)
      viewTimer = undefined
    }

    const observer = new IntersectionObserver((entries) => {
      const entry = entries.find((candidate) => candidate.target === form)
      const sufficientlyVisible = Boolean(
        entry?.isIntersecting && entry.intersectionRatio >= VIEW_THRESHOLD,
      )

      if (!sufficientlyVisible) {
        clearViewTimer()
        return
      }
      if (viewTimer !== undefined) return

      viewTimer = setTimeout(() => {
        tracker.view()
        observer.disconnect()
        viewTimer = undefined
      }, VIEW_DURATION_MS)
    }, { threshold: [0, VIEW_THRESHOLD, 1] })

    observer.observe(form)
    return () => {
      clearViewTimer()
      observer.disconnect()
    }
  }, [])

  return {
    formRef,
    start: trackerRef.current.start,
    stepComplete: trackerRef.current.stepComplete,
    error: trackerRef.current.error,
  }
}
