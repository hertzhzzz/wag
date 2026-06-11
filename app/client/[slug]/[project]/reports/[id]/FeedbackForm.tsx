"use client"

import { useState } from "react"

interface Props {
  clientSlug: string
  projectSlug: string
  reportId: string
}

export function FeedbackForm({ clientSlug, projectSlug, reportId }: Props) {
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/client/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_slug: clientSlug,
          project_slug: projectSlug,
          report_id: reportId,
          message: message.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to submit feedback")
      }

      setSubmitted(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-green-800">
              Thank you for your feedback
            </p>
            <p className="text-sm text-green-600 mt-0.5">
              We value your input and will review it promptly.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <h3 className="font-serif font-bold text-navy text-lg">Feedback</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          Have questions about this report? Let us know.
        </p>
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy resize-y"
        placeholder="Your feedback or questions..."
        aria-label="Feedback message"
        disabled={loading}
        required
      />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="bg-navy text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-navy/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Submit feedback"
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
        <p className="text-xs text-gray-400">
          We typically respond within 2 business days.
        </p>
      </div>
    </form>
  )
}
