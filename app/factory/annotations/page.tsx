"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { Annotation, AnnotationPattern } from "@/lib/factory-annotations"

const STATUS_OPTIONS = ["open", "analyzed", "script_fixed", "verified", "ignored"] as const

export default function AnnotationsDashboard() {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [patterns, setPatterns] = useState<AnnotationPattern[]>([])
  const [summary, setSummary] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("open")
  const [analyzing, setAnalyzing] = useState(false)
  const [aiAnalysisText, setAiAnalysisText] = useState<Record<string, string>>({})
  const [scriptFixText, setScriptFixText] = useState<Record<string, string>>({})

  useEffect(() => {
    loadAnnotations()
  }, [])

  async function loadAnnotations() {
    const res = await fetch("/api/factory/annotations")
    const data = await res.json()
    setAnnotations(data.annotations || [])
    setLoading(false)
  }

  async function handleAnalyze() {
    setAnalyzing(true)
    try {
      const res = await fetch("/api/factory/annotations?analyze=1")
      const data = await res.json()
      setPatterns(data.patterns || [])
      setSummary(data.summary || {})
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleUpdate(id: string, update: Partial<Annotation>) {
    await fetch(`/api/factory/annotations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    })
    setAnnotations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...update } : a))
    )
    // Clear draft fields
    setAiAnalysisText((prev) => { const n = { ...prev }; delete n[id]; return n })
    setScriptFixText((prev) => { const n = { ...prev }; delete n[id]; return n })
  }

  const filtered = annotations.filter((a) =>
    filter === "all" ? true : a.status === filter
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading annotations...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-navy text-white z-10 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <Link href="/factory" className="text-xs text-gray-300 hover:text-white transition">
              &larr; Factory List
            </Link>
            <h1 className="text-lg font-bold mt-0.5">AI Annotation Dashboard</h1>
            <p className="text-xs text-gray-400">
              {annotations.length} reports · {annotations.filter((a) => a.status === "open").length} open
            </p>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-4 py-2 bg-amber-500 text-navy text-sm font-semibold rounded hover:bg-amber-400 disabled:opacity-50 transition"
          >
            {analyzing ? "Analyzing..." : "AI Analyze Patterns"}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* AI Pattern Analysis */}
        {patterns.length > 0 && (
          <div className="mb-6 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">
              AI Pattern Analysis ({summary.open} open issues across {patterns.length} patterns)
            </h2>
            {patterns.map((p, i) => (
              <div
                key={i}
                className={`bg-white border rounded-lg p-4 ${
                  p.priority === "high"
                    ? "border-red-300 bg-red-50/30"
                    : p.priority === "medium"
                    ? "border-amber-300 bg-amber-50/30"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-navy">
                        {p.fieldName}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                        {p.issueType}
                      </span>
                      <span className="text-xs text-gray-500">{p.count} factories</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : p.priority === "medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {p.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 mt-1">
                      Root cause: {p.likelyRootCause}
                    </p>
                    <p className="text-xs text-green-700 mt-1 bg-green-50 rounded p-2">
                      Fix: {p.suggestedFix}
                    </p>
                    <details className="mt-1">
                      <summary className="text-[10px] text-gray-400 cursor-pointer">
                        {p.affectedFactories.length} affected factory IDs
                      </summary>
                      <p className="text-[10px] text-gray-400 mt-1 font-mono">
                        {p.affectedFactories.join(", ")}
                      </p>
                    </details>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(["open", "analyzed", "script_fixed", "verified", "ignored", "all"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                filter === s
                  ? "bg-navy text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-navy"
              }`}
            >
              {s === "all" ? "All" : s.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Annotations list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No annotations</p>
            <p className="text-sm mt-1">Employee issue reports will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((ann) => (
              <div
                key={ann.id}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="grid grid-cols-[1fr_auto] gap-4">
                  <div className="min-w-0 space-y-2">
                    {/* Header */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/factory/${ann.slug}`}
                        className="text-sm font-semibold text-navy hover:underline"
                      >
                        {ann.companyName || ann.memberId}
                      </Link>
                      <span className="text-xs text-gray-400">{ann.fieldLabel}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                        {ann.issueType}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          ann.status === "open"
                            ? "bg-red-50 text-red-700"
                            : ann.status === "analyzed"
                            ? "bg-blue-50 text-blue-700"
                            : ann.status === "script_fixed"
                            ? "bg-purple-50 text-purple-700"
                            : ann.status === "verified"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {ann.status}
                      </span>
                    </div>

                    {/* Diff: actual vs expected */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-red-50 rounded p-2">
                        <span className="text-[10px] text-red-500 font-medium block mb-0.5">
                          SCRAPER GOT
                        </span>
                        <p className="text-xs text-red-800 font-mono break-words">
                          {ann.actualValue || "(empty)"}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded p-2">
                        <span className="text-[10px] text-green-500 font-medium block mb-0.5">
                          CORRECT VALUE
                        </span>
                        <p className="text-xs text-green-800 font-mono break-words">
                          {ann.expectedValue || "(not specified)"}
                        </p>
                      </div>
                    </div>

                    {ann.comment && (
                      <p className="text-xs text-gray-500 italic">{ann.comment}</p>
                    )}

                    {/* AI analysis */}
                    {ann.aiAnalysis && (
                      <div className="bg-blue-50 rounded p-2">
                        <span className="text-[10px] text-blue-500 font-medium block mb-0.5">
                          AI ANALYSIS
                        </span>
                        <p className="text-xs text-blue-800">{ann.aiAnalysis}</p>
                      </div>
                    )}

                    {/* Script fix */}
                    {ann.scriptFix && (
                      <div className="bg-purple-50 rounded p-2">
                        <span className="text-[10px] text-purple-500 font-medium block mb-0.5">
                          SCRIPT FIX
                        </span>
                        <p className="text-xs text-purple-800">{ann.scriptFix}</p>
                        {ann.fixCommit && (
                          <p className="text-[10px] text-purple-400 mt-0.5 font-mono">{ann.fixCommit}</p>
                        )}
                      </div>
                    )}

                    <p className="text-[10px] text-gray-400">
                      {ann.createdAt ? new Date(ann.createdAt).toLocaleString() : ""}
                      {ann.createdBy && ` · by ${ann.createdBy}`}
                    </p>
                  </div>

                  {/* Actions (Mark only) */}
                  <div className="flex flex-col gap-1 w-44 shrink-0">
                    <select
                      value={ann.status}
                      onChange={(e) => handleUpdate(ann.id, { status: e.target.value as Annotation["status"] })}
                      className="text-xs border border-gray-200 rounded p-1"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                      ))}
                    </select>

                    {ann.status === "open" && (
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={aiAnalysisText[ann.id] || ""}
                          onChange={(e) =>
                            setAiAnalysisText((prev) => ({ ...prev, [ann.id]: e.target.value }))
                          }
                          placeholder="AI analysis..."
                          className="w-full text-xs border border-gray-200 rounded p-1"
                        />
                        <input
                          type="text"
                          value={scriptFixText[ann.id] || ""}
                          onChange={(e) =>
                            setScriptFixText((prev) => ({ ...prev, [ann.id]: e.target.value }))
                          }
                          placeholder="Script fix applied..."
                          className="w-full text-xs border border-gray-200 rounded p-1"
                        />
                        <button
                          onClick={() => {
                            handleUpdate(ann.id, {
                              aiAnalysis: aiAnalysisText[ann.id] || "",
                              scriptFix: scriptFixText[ann.id] || "",
                              status: "script_fixed",
                            })
                          }}
                          className="px-2 py-1 bg-navy text-white text-xs rounded hover:bg-navy/90"
                        >
                          Apply Fix
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
