"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { X } from "lucide-react"

interface LightboxCtx {
  open: (src: string, title: string) => void
}

const LightboxCtx = createContext<LightboxCtx>({ open: () => {} })

export function useLightbox() {
  return useContext(LightboxCtx)
}

export function ProductShowcase({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<{ src: string; title: string } | null>(null)

  const open = (src: string, title: string) => setActive({ src, title })
  const close = () => setActive(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    if (active) {
      document.addEventListener("keydown", handler)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handler)
      document.body.style.overflow = ""
    }
  }, [active])

  return (
    <LightboxCtx.Provider value={{ open }}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 my-8 not-prose">
        {children}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-8"
          onClick={close}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            onClick={close}
            aria-label="Close"
          >
            <X size={24} />
          </button>
          <img
            src={active.src}
            alt={active.title}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm">
            {active.title}
          </p>
        </div>
      )}
    </LightboxCtx.Provider>
  )
}

export function ProductCard({ src, title }: { src: string; title: string }) {
  const { open } = useLightbox()
  const resolved = src.startsWith("/") ? src : `/reports/aaron-sansoni/${src}`

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
      onClick={() => open(resolved, title)}
      role="button"
      tabIndex={0}
      aria-label={`View ${title}`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") open(resolved, title) }}
    >
      <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center p-4">
        <img
          src={resolved}
          alt={title}
          className="max-h-full max-w-full h-auto w-auto object-contain"
          loading="lazy"
        />
      </div>
      <div className="px-3 py-2.5 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-700 text-center truncate">{title}</p>
      </div>
    </div>
  )
}
