"use client"

import { useEffect, useRef } from "react"

/**
 * ScrollReveal — wraps children in a div that fades up when it enters the viewport.
 * The animation is driven by data-animate="true" + CSS in services-animations.css.
 */
export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

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
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    )

    if (delay > 0) el.style.transitionDelay = `${delay}ms`
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={`scroll-reveal ${className}`} data-animate="">
      {children}
    </div>
  )
}