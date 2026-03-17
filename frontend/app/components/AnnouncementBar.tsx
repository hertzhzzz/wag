'use client'

import { useState } from 'react'

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-amber text-navy w-full z-[200] relative">
      <div className="max-w-[1200px] mx-auto px-6 py-2.5 flex items-center justify-center gap-3">
        <a
          href="#founding-clients"
          className="flex items-center gap-2 text-[13px] font-semibold hover:opacity-80 transition-opacity"
        >
          <span className="hidden sm:inline text-[11px] font-bold tracking-widest uppercase bg-navy text-amber px-2 py-0.5">
            Limited
          </span>
          Now onboarding our first 10 Australian Founding Clients — direct founder access included
          <span className="font-bold">→</span>
        </a>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-navy/50 hover:text-navy text-lg leading-none bg-transparent border-0 cursor-pointer"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  )
}
