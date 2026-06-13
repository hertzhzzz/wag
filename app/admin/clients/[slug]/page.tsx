import { cookies, headers } from "next/headers"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"

const SLUG_RE = /^[a-z0-9-]{2,64}$/

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

export default async function AdminClientDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!SLUG_RE.test(slug)) notFound()

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("admin_session")
  if (!sessionCookie?.value) { redirect("/admin") }

  const headersList = await headers()
  const host = headersList.get("host") || "localhost:3000"
  const proto = headersList.get("x-forwarded-proto") || "http"

  let clientName = ""
  let clientCompany = ""
  let logs: LogEntry[] = []
  let activeSessions = 0
  let reportViewCounts: Record<string, number> = {}

  try {
    const res = await fetch(`${proto}://${host}/api/admin/clients/${slug}`, {
      headers: { Cookie: `admin_session=${sessionCookie.value}` }
    })
    if (res.ok) {
      const data = await res.json()
      clientName = data.clientName
      clientCompany = data.clientCompany
      logs = data.logs || []
      activeSessions = data.activeSessions || 0
      reportViewCounts = data.reportViewCounts || {}
    } else if (res.status === 401) {
      redirect("/admin")
    } else if (res.status === 404) {
      notFound()
    }
  } catch { /* API unavailable — show empty */ }

  return (
    <div>
      <div className="flex items-center justify-between mb-6"><div><Link href="/admin/clients" className="text-xs text-gray-400 hover:text-navy transition mb-1 inline-block">&larr; All Clients</Link><h1 className="font-serif text-2xl font-bold text-navy">{clientName}</h1><p className="text-sm text-gray-500">{clientCompany}</p></div><div className="flex items-center gap-4"><StatBadge label="Active Sessions" value={String(activeSessions)} /><StatBadge label="Total Views" value={String(logs.length)} /><StatBadge label="Reports" value={String(Object.keys(reportViewCounts).length)} /></div></div>
      {Object.keys(reportViewCounts).length > 0 && (<section className="mb-8"><h2 className="text-base font-semibold text-navy mb-3">Report Views</h2><div className="bg-white rounded-lg border border-gray-200 p-4"><div className="space-y-2">{Object.entries(reportViewCounts).sort(([, a], [, b]) => b - a).map(([id, count]) => (<div key={id} className="flex items-center justify-between text-sm"><span className="text-gray-700 font-mono text-xs">{id}</span><span className="font-semibold text-navy">{count} views</span></div>))}</div></div></section>)}
      <section><h2 className="text-base font-semibold text-navy mb-3">Access Log</h2>{logs.length === 0 ? (<div className="bg-white rounded-lg border border-gray-200 p-8 text-center"><p className="text-gray-400 text-sm">No access records yet.</p></div>) : (<div className="bg-white rounded-lg border border-gray-200 overflow-hidden"><table className="w-full text-sm"><thead><tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"><th className="px-4 py-3">Time (ACST)</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Path</th><th className="px-4 py-3">Session</th><th className="px-4 py-3">When</th></tr></thead><tbody className="divide-y divide-gray-100">{logs.map((entry, i) => (<tr key={i} className="hover:bg-gray-50/50"><td className="px-4 py-2.5 text-gray-700 font-mono text-xs whitespace-nowrap">{formatTime(entry.timestamp)}</td><td className="px-4 py-2.5"><span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${entry.action_type === "report-view" ? "bg-blue-50 text-blue-700" : entry.action_type === "dashboard" ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-600"}`}>{actionLabels[entry.action_type] || entry.action_type}</span></td><td className="px-4 py-2.5 text-gray-600 font-mono text-xs max-w-[300px] truncate">{entry.path}</td><td className="px-4 py-2.5 text-gray-500 font-mono text-xs">{entry.session_id || "-"}</td><td className="px-4 py-2.5 text-gray-400 text-xs whitespace-nowrap">{formatAgo(entry.timestamp)}</td></tr>))}</tbody></table></div>)}</section>
    </div>
  )
}

function StatBadge({ label, value }: { label: string; value: string }) {
  return (<div className="text-center"><p className="text-2xl font-bold text-navy">{value}</p><p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p></div>)
}
