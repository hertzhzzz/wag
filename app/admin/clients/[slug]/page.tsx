"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

interface LogEntry { action_type: string; path: string; timestamp: string; session_id: string }

function formatTime(iso: string): string {
  const d = new Date(iso)
  return new Date(d.getTime() + 9.5 * 60 * 60 * 1000).toISOString().replace("T", " ").slice(0, 19) + " ACST"
}
function formatAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
const actionLabels: Record<string, string> = { "access-page": "Page", "dashboard": "Dashboard", "report-view": "Report", "auth-failure": "Failed Login" }

export default function AdminClientDetailPage() {
  const { slug } = useParams()
  const router = useRouter()
  const [data, setData] = useState<{ clientName: string; clientCompany: string; logs: LogEntry[]; activeSessions: number; reportViewCounts: Record<string, number> } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/clients/${slug}`)
      .then((r) => { if (r.status === 401) { router.push("/admin"); return null }; if (r.status === 404) { router.push("/admin/clients"); return null }; return r.json() })
      .then((d) => { if (d) setData(d); setLoading(false) })
  }, [slug, router])

  if (loading) return <div className="p-8 text-gray-400 text-sm">Loading...</div>
  if (!data) return <div className="p-8 text-gray-400 text-sm">Client not found.</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6"><div><Link href="/admin/clients" className="text-xs text-gray-400 hover:text-navy transition mb-1 inline-block">&larr; All Clients</Link><h1 className="font-serif text-2xl font-bold text-navy">{data.clientName}</h1><p className="text-sm text-gray-500">{data.clientCompany}</p></div><div className="flex items-center gap-4"><StatBadge label="Active Sessions" value={String(data.activeSessions)} /><StatBadge label="Total Views" value={String(data.logs.length)} /><StatBadge label="Reports" value={String(Object.keys(data.reportViewCounts).length)} /></div></div>
      {Object.keys(data.reportViewCounts).length > 0 && (<section className="mb-8"><h2 className="text-base font-semibold text-navy mb-3">Report Views</h2><div className="bg-white rounded-lg border border-gray-200 p-4"><div className="space-y-2">{Object.entries(data.reportViewCounts).sort(([, a], [, b]) => b - a).map(([id, count]) => (<div key={id} className="flex items-center justify-between text-sm"><span className="text-gray-700 font-mono text-xs">{id}</span><span className="font-semibold text-navy">{count} views</span></div>))}</div></div></section>)}
      <section><h2 className="text-base font-semibold text-navy mb-3">Access Log</h2>{data.logs.length === 0 ? (<div className="bg-white rounded-lg border border-gray-200 p-8 text-center"><p className="text-gray-400 text-sm">No access records yet.</p></div>) : (<div className="bg-white rounded-lg border border-gray-200 overflow-hidden"><table className="w-full text-sm"><thead><tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"><th className="px-4 py-3">Time (ACST)</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Path</th><th className="px-4 py-3">Session</th><th className="px-4 py-3">When</th></tr></thead><tbody className="divide-y divide-gray-100">{data.logs.map((entry, i) => (<tr key={i} className="hover:bg-gray-50/50"><td className="px-4 py-2.5 text-gray-700 font-mono text-xs whitespace-nowrap">{formatTime(entry.timestamp)}</td><td className="px-4 py-2.5"><span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${entry.action_type === "report-view" ? "bg-blue-50 text-blue-700" : entry.action_type === "dashboard" ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-600"}`}>{actionLabels[entry.action_type] || entry.action_type}</span></td><td className="px-4 py-2.5 text-gray-600 font-mono text-xs max-w-[300px] truncate">{entry.path}</td><td className="px-4 py-2.5 text-gray-500 font-mono text-xs">{entry.session_id || "-"}</td><td className="px-4 py-2.5 text-gray-400 text-xs whitespace-nowrap">{formatAgo(entry.timestamp)}</td></tr>))}</tbody></table></div>)}</section>
    </div>
  )
}

function StatBadge({ label, value }: { label: string; value: string }) {
  return (<div className="text-center"><p className="text-2xl font-bold text-navy">{value}</p><p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p></div>)
}
