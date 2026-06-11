"use client"

import { useEffect, useState } from "react"

interface Heading {
  level: number
  text: string
  id: string
}

interface Props {
  headings: Heading[]
}

export function ReportTOC({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first (topmost) visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => {
            const rectA = a.target.getBoundingClientRect()
            const rectB = b.target.getBoundingClientRect()
            return rectA.top - rectB.top
          })
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      },
    )

    const elements: Element[] = []
    for (const { id } of headings) {
      const el = document.getElementById(id)
      if (el) {
        observer.observe(el)
        elements.push(el)
      }
    }

    return () => {
      for (const el of elements) {
        observer.unobserve(el)
      }
    }
  }, [headings])

  if (headings.length === 0) {
    return (
      <nav aria-label="Table of contents">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Contents
        </h4>
        <p className="text-xs text-gray-300">No sections</p>
      </nav>
    )
  }

  return (
    <nav aria-label="Table of contents">
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
        Contents
      </h4>
      <ul className="space-y-0.5">
        {headings.map(({ level, text, id }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`block text-sm py-1.5 transition-colors border-l-2 ${
                level === 3 ? "pl-5" : level === 4 ? "pl-7" : "pl-3"
              } ${
                activeId === id
                  ? "text-navy font-medium border-navy"
                  : "text-gray-500 hover:text-navy border-transparent hover:border-gray-300"
              }`}
              onClick={(e) => {
                e.preventDefault()
                const el = document.getElementById(id)
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" })
                  setActiveId(id)
                }
              }}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
