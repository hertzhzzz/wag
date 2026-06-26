'use client'

import { useState, useEffect } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )

    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav aria-label="Table of contents">
      <p className="text-[0.7rem] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-3 px-1">
        On this page
      </p>
      <ul>
        {headings.map(({ id, text }) => {
          const active = activeId === id
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={active ? 'location' : undefined}
                className="group flex items-start gap-2.5 py-[0.4rem] text-sm leading-snug"
              >
                <span
                  aria-hidden="true"
                  className={`mt-[0.45rem] h-1.5 w-1.5 rounded-full flex-shrink-0 transition-all duration-200 ${
                    active
                      ? 'bg-[#F59E0B] scale-100'
                      : 'bg-gray-300 scale-75 group-hover:bg-gray-400'
                  }`}
                />
                <span
                  className={`transition-colors duration-200 ${
                    active
                      ? 'text-[#0F2D5E] font-semibold'
                      : 'text-gray-500 group-hover:text-[#0F2D5E]'
                  }`}
                >
                  {text}
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
