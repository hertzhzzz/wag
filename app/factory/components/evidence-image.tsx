"use client"

import { useState } from "react"

export function EvidenceImage({ url, alt }: { url: string; alt: string }) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="w-full h-24 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
        <span className="text-[10px] text-gray-400 text-center px-2">{alt}</span>
      </div>
    )
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <img
        src={url}
        alt={alt}
        className="w-full h-24 object-cover rounded border border-gray-200 hover:border-navy transition"
        loading="lazy"
        onError={() => setError(true)}
      />
    </a>
  )
}
