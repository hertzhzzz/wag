import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { readFileSync } from "fs"
import { join } from "path"
import type { AccessLogEntry } from "@/lib/access-log-kv"

const SLUG_RE = /^[a-z0-9-]{2,64}$/

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
  if (!cookieStore.get("admin_session")?.value) { redirect("/admin") }
  const { validateAdminSession } = await import("@/lib/admin-auth")
  if (!(await validateAdminSession(cookieStore.get("admin_session")!.value))) { redirect("/admin") }

  let clientName = ""
  let clientCompany = ""
  try {
    const raw = readFileSync(join(process.cwd(), "data", "clients", `${slug}.json`), "utf-8")
    const config = JSON.parse(raw)
    clientName = config.client_name || slug
    clientCompany = config.client_company || ""
  } catch { notFound() }

  let redis: Awaited<ReturnType<typeof import("@upstash/redis").Redis.fromEnv>> | null = null
  try { const { Redis } = await import("@upstash/redis"); if (process.env.UPSTASH_REDIS_REST_URL) redis = Redis.fromEnv() } catch { /* */ }

  let logs: AccessLogEntry[] = []
  let activeSessions = 0
  if (redis) {
    try { const e = await redis.lrange(`access_logs:${slug}`, 0, 199); logs = e.map((x) => { try { return JSON.parse(x as string) } catch { return null } }).filter(Boolean) as AccessLogEntry[] } catch { /* */ }
    try { activeSessions = await redis.scard(`client_sessions:${slug}`) } catch { /* */ }
  }

  const reportViewCounts: Record<string, number> = {}
  for (const entry of logs) { if (entry.action_type === "report-view") { const id = entry.path.split("/").pop() || entry.path; reportViewCounts[id] = (reportViewCounts[id] || 0) + 1 } }

  return (
    <div>
      <div className="flex items-center justify-between mb-6"><div><Link href="/admin/clients" className="text-xs text-gray-400 hover:text-navy transition mb-1 inline-block">&larr; All Clients</Link><h1 className="font-serif text-2xl font-bold text-navy">{clientName}</h1><p className="text-sm text-gray-500">{clientCompany}</p></div><div className="flex items-center gap-4"><StatBadge label="Active Sessions" value={String(activeSessions)} /><StatBadge label="Total Views" value={String(logs.length)} /><StatBadge label="Reports" value={String(Object.keys(reportViewCounts).length)} /></div></div>
      {Object.keys(reportViewCounts).length > 0 && (<section className="mb-8"><h2 className="text-base font-semibold text-navy mb-3">Report Views</h2><div className="bg-white rounded-lg border border-gray-200 p-4"><div className="space-y-2">{Object.entries(reportViewCounts).sort(([, a], [, b]) => b - a).map(([id, count]) => (<div key={id} className="flex items-center justify-between text-sm"><span className="text-gray-700 font-mono text-xs">{id}</span><span className="font-semibold text-navy">{count} views</span></div>))}</div></div></section>)}
      <section><h2 className="text-base font-semibold text-navy mb-3">Access Log</h2>{logs.length === 0 ? (<div className="bg-white rounded-lg border border-gray-200 p-8 text-center"><p className="text-gray-400 text-sm">No access records yet.</p></div>) : (<div className="bg-white rounded-lg border border-gray-200 overflow-hidden"><table className="w-full text-sm"><thead><tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"><th className="px-4 py-3">Time (ACST)</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Path</th><th className="px-4 py-3">Session</th><th className="px-4 py-3">When</th></tr></thead><tbody className="divide-y divide-gray-100">{logs.map((entry, i) => (<tr key={i} className="hover:bg-gray-50/50"><td className="px-4 py-2.5 text-gray-700 font-mono text-xs whitespace-nowrap">{formatTime(entry.timestamp)}</td><td className="px-4 py-2.5"><span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${entry.action_type === "report-view" ? "bg-blue-50 text-blue-700" : entry.action_type === "dashboard" ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-600"}`}>{actionLabels[entry.action_type] || entry.action_type}</span></td><td className="px-4 py-2.5 text-gray-600 font-mono text-xs max-w-[300px] truncate">{entry.path}</td><td className="px-4 py-2.5 text-gray-500 font-mono text-xs">{entry.session_id ? entry.session_id.slice(0, 8) : "-"}</td><td className="px-4 py-2.5 text-gray-400 text-xs whitespace-nowrap">{formatAgo(entry.timestamp)}</td></tr>))}</tbody></table></div>)}</section>
    </div>
  )
}

function StatBadge({ label, value }: { label: string; value: string }) {
  return (<div className="text-center"><p className="text-2xl font-bold text-navy">{value}</p><p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p></div>)
}
