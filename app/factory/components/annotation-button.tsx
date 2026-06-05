"use client"

import { useState } from "react"
import type { IssueType } from "@/lib/factory-annotations"

interface Props {
  memberId: string
  slug: string
  companyName: string
  fieldName: string
  fieldLabel: string
  actualValue: string  // What the scraper extracted (auto-filled)
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!expectedValue.trim() && issueType !== "other") return

    setLoading(true)
    try {
      const res = await fetch("/api/factory/annotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          slug,
          companyName,
          fieldName,
          fieldLabel,
          issueType,
          expectedValue: expectedValue.trim(),
          actualValue,
          comment: comment.trim(),
        }),
      })
      if (res.ok) {
        setSubmitted(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative shrink-0">
      {!open && !submitted && (
        <button
          onClick={() => setOpen(true)}
          className="opacity-0 group-hover:opacity-100 transition text-xs px-2 py-1 rounded border border-gray-200 hover:bg-amber-50 hover:border-amber-300 text-gray-400 hover:text-amber-700 whitespace-nowrap"
        >
          Report Issue
        </button>
      )}

      {submitted && (
        <span className="text-xs text-green-600 font-medium whitespace-nowrap">
          Reported
        </span>
      )}

      {open && !submitted && (
        <div className="absolute right-0 top-0 w-80 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-semibold text-navy block">
                Report Issue: {fieldLabel}
              </span>
              <span className="text-[10px] text-gray-400">{companyName}</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Issue type */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Issue Type
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as IssueType)}
                className="w-full border border-gray-200 rounded p-1.5 text-xs focus:outline-none focus:border-navy"
              >
                {ISSUE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label} — {t.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* Current value (what scraper got) */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Scraper Extracted
              </label>
              <div className="w-full bg-gray-50 border border-gray-100 rounded p-2 text-xs text-gray-500 max-h-16 overflow-y-auto font-mono">
                {actualValue || "(empty)"}
              </div>
            </div>

            {/* Expected value (what 1688 actually shows) */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Correct Value <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={expectedValue}
                onChange={(e) => setExpectedValue(e.target.value)}
                placeholder="What does the 1688 page actually show?"
                className="w-full border border-gray-200 rounded p-1.5 text-xs focus:outline-none focus:border-navy"
                autoFocus
              />
            </div>

            {/* Optional comment */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Note (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Any additional context..."
                className="w-full border border-gray-200 rounded p-1.5 text-xs resize-none h-14 focus:outline-none focus:border-navy"
              />
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-[10px] text-gray-400">{memberId}</span>
              <button
                type="submit"
                disabled={loading || (!expectedValue.trim() && issueType !== "other")}
                className="px-4 py-1.5 bg-navy text-white text-xs rounded hover:bg-navy/90 disabled:opacity-50 transition font-medium"
              >
                {loading ? "..." : "Submit Report"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
