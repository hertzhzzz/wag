"use client"

import { useState } from "react"
import { resolveReportImagePath } from "./imagePath"

export { resolveReportImagePath } from "./imagePath"

export function ReportImage({
  src,
  alt,
  clientSlug,
  className,
  ...props
}: {
  src?: string
  alt?: string
  clientSlug: string
  className?: string
  [key: string]: unknown
}) {
  const [error, setError] = useState(false)
  const resolved = resolveReportImagePath(src || "", clientSlug)

  if (error || !resolved) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-400 text-sm my-6 border border-gray-200">
        {alt || "Image unavailable"}
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt || ""}
      className={`rounded-lg max-w-2xl mx-auto h-auto max-h-[420px] object-contain my-6 border border-gray-200 bg-white ${className || ""}`}
      onError={() => setError(true)}
      loading="lazy"
      {...props}
    />
  )
}
