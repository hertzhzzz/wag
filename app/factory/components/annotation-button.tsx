"use client"

import { useState, useEffect } from "react"
import type { IssueType } from "@/lib/factory-annotations"

interface Props {
  memberId: string
  slug: string
  companyName: string
  fieldName: string
  fieldLabel: string
  actualValue: string
}

const ISSUE_TYPES: { value: IssueType; label: string; desc: string }[] = [
  { value: "wrong_value", label: "Wrong Value", desc: "Scraper extracted incorrect data" },
  { value: "missing_value", label: "Missing Value", desc: "Field should have data but is empty" },
  { value: "parsing_error", label: "Parsing Error", desc: "Garbled text, encoding issue" },
  { value: "truncation_error", label: "Truncation", desc: "Value was cut off" },
  { value: "extra_data", label: "Extra Data", desc: "Data from wrong factory mixed in" },
  { value: "other", label: "Other", desc: "Something else" },
]

export function AnnotationButton({ memberId, slug, companyName, fieldName, fieldLabel, actualValue }: Props) {
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [issueType, setIssueType] = useState<IssueType>("wrong_value")
  const [expectedValue, setExpectedValue] = useState("")
  const [comment, setComment] = useState("")

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!expectedValue.trim() && issueType !== "other") return

    setLoading(true)
    try {
      const res = await fetch("/api/factory/annotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId, slug, companyName, fieldName, fieldLabel,
          issueType, expectedValue: expectedValue.trim(),
          actualValue, comment: comment.trim(),
        }),
      })
      if (res.ok) {
        setSubmitted(true)
        setOpen(false)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="shrink-0">
      {/* Trigger button */}
      {!submitted && !open && (
        <button
          onClick={() => setOpen(true)}
          className="opacity-0 group-hover:opacity-100 transition text-xs px-2 py-1 rounded border border-gray-200 hover:bg-amber-50 hover:border-amber-300 text-gray-400 hover:text-amber-700 whitespace-nowrap"
        >
          Report Issue
        </button>
      )}

      {submitted && (
        <span className="text-xs text-green-600 font-medium whitespace-nowrap">Reported</span>
      )}

      {/* Drawer + backdrop */}
      {open && (
        <div>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setOpen(false)} />

          {/* Right-side drawer */}
          <div className="fixed top-0 right-0 h-full w-[420px] max-w-[90vw] bg-white shadow-2xl z-50 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-navy text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Report Issue</h2>
                <p className="text-xs text-gray-300 mt-0.5">{fieldLabel}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white text-xl leading-none p-1"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Factory context */}
              <div className="bg-gray-50 rounded p-3 text-xs text-gray-500">
                <span className="font-medium text-gray-700">{companyName}</span>
                {" · "}{memberId}
              </div>

              {/* Issue type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Issue Type
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as IssueType)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                >
                  {ISSUE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} — {t.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scraper extracted (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Scraper Extracted
                </label>
                <div className="w-full bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-800 max-h-24 overflow-y-auto font-mono whitespace-pre-wrap break-words">
                  {actualValue || "(empty)"}
                </div>
              </div>

              {/* Expected value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Correct Value <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={expectedValue}
                  onChange={(e) => setExpectedValue(e.target.value)}
                  placeholder="What does the 1688 page actually show?"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  autoFocus
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Note (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Any additional context..."
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || (!expectedValue.trim() && issueType !== "other")}
                  className="flex-1 px-4 py-2.5 bg-navy text-white text-sm font-medium rounded-lg hover:bg-navy/90 disabled:opacity-50 transition"
                >
                  {loading ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
