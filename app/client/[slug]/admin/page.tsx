import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { getClientConfig, isValidClientSlug } from "@/lib/clients"
import { getAccessStats, getAccessLogs, getRecentAuthFailures, AccessLogEntry } from "@/lib/access-log-kv"
import { getActiveSessionCount } from "@/lib/session-store"
import Link from "next/link"

const actionLabels: Record<string, string> = {
  "access-page": "Page",
  "dashboard": "Dashboard",
  "report-view": "Report",
  "auth-failure": "Failed Login",
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const adelaide = new Date(d.getTime() + 9.5 * 60 * 60 * 1000)
  return adelaide.toISOString().replace("T", " ").slice(0, 19) + " ACST"
}

function formatAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default async function AdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const sp = await searchParams

  // Admin auth: require separate admin key (not client access code)
  const adminKey = process.env.ADMIN_ACCESS_KEY
  if (!adminKey) {
    notFound()
  }
  const provided = (sp.key as string) || ""
  if (provided !== adminKey) {
    notFound()
  }

  if (!isValidClientSlug(slug)) notFound()

  const cookieStore = await cookies()
  if (!cookieStore.get(`client_auth_${slug}`)?.value) {
    redirect(`/client/${slug}`)
  }

  const client = getClientConfig(slug)
  const [stats, logs, failures, activeSessions] = await Promise.all([
    getAccessStats(slug),
    getAccessLogs(slug, 50),
    getRecentAuthFailures(slug, 20),
    getActiveSessionCount(slug),
  ])

  const hasActivity = stats.totalVisits > 0

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-bold tracking-[0.05em] text-amber-600 mb-1">ADMIN</p>
          <h1 className="font-serif text-2xl font-bold text-navy">
            {client?.client_name || slug} — Access Log
          </h1>
          <p className="text-sm text-gray-500 mt-1">{client?.client_company || ""}</p>
        </div>
        <Link
          href={`/client/${slug}`}
          className="text-sm text-navy hover:underline"
        >
          &larr; Back to Portal
        </Link>
      </div>

      {/* Status banner */}
      <div className={`rounded-lg p-4 mb-6 ${hasActivity ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
        <p className={`text-sm font-semibold ${hasActivity ? "text-green-800" : "text-amber-800"}`}>
          {hasActivity
            ? "Client has accessed the portal"
            : "No access detected yet — client may not have opened the link"}
        </p>
        {hasActivity && stats.lastVisit && (
          <p className="text-xs text-green-600 mt-1">
            Last visit: {formatTime(stats.lastVisit)} ({formatAgo(stats.lastVisit)})
          </p>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Visits" value={String(stats.totalVisits)} />
        <StatCard label="Unique Sessions" value={String(stats.uniqueSessions)} />
        <StatCard label="Pages Viewed" value={String(stats.uniquePaths)} />
        <StatCard label="Active Sessions" value={String(activeSessions)} />
        <StatCard label="Failed Logins" value={String(failures.length)} />
      </div>

      {/* Recent access log */}
      <section className="mb-8">
        <h2 className="font-sans text-base font-semibold text-navy mb-3">Recent Access</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-gray-400">No access records yet.</p>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Time (ACST)</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Path</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((entry: AccessLogEntry, i: number) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 text-gray-700 font-mono text-xs whitespace-nowrap">
                      {formatTime(entry.timestamp)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        entry.action_type === "report-view"
                          ? "bg-blue-50 text-blue-700"
                          : entry.action_type === "dashboard"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-gray-100 text-gray-600"
                      }`}>
                        {actionLabels[entry.action_type] || entry.action_type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 font-mono text-xs max-w-[300px] truncate">
                      {entry.path}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 font-mono text-xs">
                      {entry.ip || "-"}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 font-mono text-xs">
                      {entry.session_id ? entry.session_id.slice(0, 8) : "-"}
                    </td>
                    <td className="px-4 py-2.5 text-gray-400 text-xs whitespace-nowrap">
                      {formatAgo(entry.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Failed auth attempts */}
      {failures.length > 0 && (
        <section className="mb-8">
          <h2 className="font-sans text-base font-semibold text-navy mb-3">Failed Login Attempts</h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Time (ACST)</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {failures.map((f, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 text-gray-700 font-mono text-xs whitespace-nowrap">
                      {formatTime(f.timestamp)}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 font-mono text-xs">
                      {f.ip}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 text-xs">
                      {f.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Visits by day */}
      {Object.keys(stats.visitsByDay).length > 0 && (
        <section className="mb-8">
          <h2 className="font-sans text-base font-semibold text-navy mb-3">Visits by Day</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="space-y-2">
              {Object.entries(stats.visitsByDay).sort().map(([day, count]) => (
                <div key={day} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-24">{day}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-navy h-4 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (count / Math.max(...Object.values(stats.visitsByDay))) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-navy w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-navy">{value}</p>
    </div>
  )
}
