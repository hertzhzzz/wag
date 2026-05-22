"use client"

import { useEffect, useRef } from "react"

/**
 * Intersection Observer hook for scroll-triggered animations.
 * Adds data-animate="true" when element enters viewport.
 */
export function useScrollReveal(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.animate = "true"
          observer.disconnect()
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px", ...options }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [options])

  return ref
}

/**
 * Attach scroll reveal to multiple elements within a container.
 * Returns cleanup function.
 */
export function useScrollRevealAll(
  containerRef: React.RefObject<HTMLElement | null>,
  selector: string,
  staggerDelay = 80
) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const elements = container.querySelectorAll<HTMLElement>(selector)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            el.dataset.animate = "true"
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    )

    elements.forEach((el, i) => {
      el.style.transitionDelay = `${i * staggerDelay}ms`
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [selector, staggerDelay, containerRef])
}