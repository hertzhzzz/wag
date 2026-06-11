"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Props {
  clientSlug: string
  projectSlug: string
  deliverableId: string
}

export function MarkAsReviewedButton({
  clientSlug,
  projectSlug,
  deliverableId,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleClick = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/client/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_slug: clientSlug,
          project_slug: projectSlug,
          deliverable_id: deliverableId,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to update status")
      }

      setDone(true)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <span className="shrink-0 text-xs font-medium text-green-600 flex items-center gap-1">
        <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2.5 7l3 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Reviewed
      </span>
    )
  }

  return (
    <div className="shrink-0">
      {error && (
        <p className="text-xs text-red-600 mb-1 max-w-[180px] text-right">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="text-xs font-medium text-navy border border-navy rounded px-3 py-1.5 hover:bg-navy hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        aria-label={`Mark ${deliverableId} as reviewed`}
      >
        {loading ? (
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 border border-navy border-t-transparent rounded-full animate-spin" />
            Submitting...
          </span>
        ) : (
          "Mark as Reviewed"
        )}
      </button>
    </div>
  )
}
