"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { createPortal } from "react-dom"

interface TooltipState {
  html: string
  top: number
  left: number
  below: boolean
}

export function FootnoteEnhancer({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const showTooltip = useCallback((trigger: HTMLAnchorElement) => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
    const href = trigger.getAttribute("href")
    if (!href) return
    const id = href.replace("#", "")
    const def = document.getElementById(id)
    if (!def) return
    // getBoundingClientRect returns viewport-relative coords. Popover uses position:fixed
    // which also uses viewport-relative positioning, so no scroll offset needed.
    const rect = trigger.getBoundingClientRect()
    const popoverH = 200 // estimated max popover height
    const below = rect.bottom + popoverH < window.innerHeight - 16
    const dd = def.nextElementSibling as HTMLElement | null
    setTooltip({
      html: dd?.innerHTML || def.innerHTML,
      top: below ? rect.bottom + 6 : rect.top - popoverH - 6,
      left: rect.left,
      below,
    })
  }, [])

  const scheduleHide = useCallback(() => {
    hideTimer.current = setTimeout(() => setTooltip(null), 150)
  }, [])

  // Event delegation for footnote hover
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const ref = target.closest("a[data-footnote-ref]") as HTMLAnchorElement | null
      if (ref) showTooltip(ref)
    }

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest("a[data-footnote-ref]")) {
        scheduleHide()
      }
    }

    // Mobile tap support
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const ref = target.closest("a[data-footnote-ref]") as HTMLAnchorElement | null
      if (!ref) return
      e.preventDefault()
      showTooltip(ref)
    }

    // Close on outside click
    const handleOutsideClick = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        const ref = (e.target as HTMLElement).closest("a[data-footnote-ref]")
        if (!ref) setTooltip(null)
      }
    }

    container.addEventListener("mouseover", handleMouseOver)
    container.addEventListener("mouseout", handleMouseOut)
    container.addEventListener("click", handleClick)
    document.addEventListener("click", handleOutsideClick)

    return () => {
      container.removeEventListener("mouseover", handleMouseOver)
      container.removeEventListener("mouseout", handleMouseOut)
      container.removeEventListener("click", handleClick)
      document.removeEventListener("click", handleOutsideClick)
    }
  }, [showTooltip, scheduleHide])

  // Style the glossary section professionally
  useEffect(() => {
    const glossary = document.querySelector(".terms-glossary") as HTMLElement | null
    if (!glossary) return
    glossary.style.cssText = ""
  }, [])

  return (
    <div ref={containerRef} className="footnote-container">
      {/* Inject styles for footnote reference links */}
      <style>{`
        a[data-footnote-ref] {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.625rem;
          font-weight: 700;
          line-height: 1;
          color: #b45309;
          background: #fef3c7;
          border: 1px solid #fcd34d;
          border-radius: 9999px;
          min-width: 1.15rem;
          height: 1.15rem;
          padding: 0 0.28rem;
          text-decoration: none;
          vertical-align: super;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          margin-left: 1px;
        }
        a[data-footnote-ref]:hover {
          background: #f59e0b;
          color: #fff;
          border-color: #d97706;
        }
        a[data-footnote-ref]:focus-visible {
          outline: 2px solid #0f2d5e;
          outline-offset: 1px;
        }
        /* Hide the outer sup wrapper */
        sup:has(> a[data-footnote-ref]) {
          all: unset;
        }
      `}</style>

      {children}

      {tooltip &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            className="fixed z-[60] max-w-sm bg-white border border-gray-200 rounded-xl shadow-[0_8px_30px_rgba(15,45,94,0.12)] p-4 text-sm leading-relaxed text-gray-700"
            style={{
              top: tooltip.top,
              left: Math.max(8, Math.min(tooltip.left, window.innerWidth - 392)),
            }}
            onMouseEnter={() => {
              if (hideTimer.current) {
                clearTimeout(hideTimer.current)
                hideTimer.current = null
              }
            }}
            onMouseLeave={scheduleHide}
          >
            <div
              className="prose prose-sm max-w-none prose-a:text-amber-700 prose-a:no-underline hover:prose-a:underline prose-p:my-1 prose-strong:text-navy"
              dangerouslySetInnerHTML={{ __html: tooltip.html }}
            />
            <div
              className={`absolute left-4 w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45 ${
                tooltip.below ? "-top-1.5" : "-bottom-1.5 rotate-[225deg]"
              }`}
            />
          </div>,
          document.body,
        )}
    </div>
  )
}
