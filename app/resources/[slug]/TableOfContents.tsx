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
    <nav className="bg-white border border-gray-200 rounded-lg p-5 shadow-[0_4px_20px_rgba(15,45,94,0.08)]">
      <p className="text-[0.65rem] font-bold tracking-[0.15em] uppercase text-[#F59E0B] mb-4">
        Table of Contents
      </p>
      <ul className="space-y-2">
        {headings.map(({ id, text, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`
                block text-sm transition-colors
                ${level === 1 ? 'font-semibold' : 'font-normal pl-3'}
                ${activeId === id
                  ? 'text-[#0F2D5E] font-semibold'
                  : 'text-gray-500 hover:text-[#0F2D5E]'}
              `}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
