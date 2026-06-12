import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { readdirSync, readFileSync } from "fs"
import { join } from "path"
import { validateAdminSession } from "@/lib/admin-auth"
import { Redis } from "@upstash/redis/cloudflare"
import type { AccessLogEntry } from "@/lib/access-log-kv"

interface ClientSummary {
  slug: string
  client_name: string
  client_company: string
  lastAccess: string | null
  reportViews: number
}

function getRedis(): Redis | null {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return Redis.fromEnv()
  }
  return null
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

const actionLabels: Record<string, string> = {
  "access-page": "Page",
  "dashboard": "Dashboard",
  "report-view": "Report",
}

export default async function AdminClientsPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("admin_session")
  if (!sessionCookie?.value || !(await validateAdminSession(sessionCookie.value))) {
    redirect("/admin")
  }

  const redis = getRedis()

  // Load all client configs
  const clientsDir = join(process.cwd(), "data", "clients")
  let slugs: string[] = []
  try {
    slugs = readdirSync(clientsDir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""))
  } catch {
    slugs = []
  }

  // Build client summaries
  const clients: ClientSummary[] = []
  for (const slug of slugs) {
    try {
      const raw = readFileSync(join(clientsDir, `${slug}.json`), "utf-8")
      const config = JSON.parse(raw)

      let lastAccess: string | null = null
      let reportViews = 0
      if (redis) {
        const entries = await redis.lrange(`access_logs:${slug}`, 0, 0)
        if (entries.length > 0) {
          const latest = JSON.parse(entries[0] as string) as AccessLogEntry
          lastAccess = latest.timestamp
        }
        const allEntries = await redis.lrange(`access_logs:${slug}`, 0, 999)
        reportViews = allEntries
          .map((e) => {
            try { return JSON.parse(e as string) as AccessLogEntry } catch { return null }
          })
          .filter((e): e is AccessLogEntry => e !== null && e.action_type === "report-view")
          .length
      }

      clients.push({
        slug,
        client_name: config.client_name || slug,
        client_company: config.client_company || "",
        lastAccess,
        reportViews,
      })
    } catch {
      // skip
    }
  }

  // Sort by recent
  clients.sort((a, b) => {
    if (!a.lastAccess && !b.lastAccess) return 0
    if (!a.lastAccess) return 1
    if (!b.lastAccess) return -1
    return b.lastAccess.localeCompare(a.lastAccess)
  })

  // Recent activity
  let recentActivity: Array<AccessLogEntry & { client_name: string }> = []
  if (redis) {
    for (const c of clients.slice(0, 5)) {
      const entries = await redis.lrange(`access_logs:${c.slug}`, 0, 9)
      for (const e of entries) {
        try {
          const parsed = JSON.parse(e as string) as AccessLogEntry
          recentActivity.push({ ...parsed, client_name: c.client_name })
        } catch { /* skip */ }
      }
    }
    recentActivity.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    recentActivity = recentActivity.slice(0, 20)
  }

  // Last visit
  let lastVisit: string | null = null
  if (redis) {
    lastVisit = await redis.get<string>("admin:last_visit")
    await redis.set("admin:last_visit", new Date().toISOString())
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-navy mb-6">Clients</h1>

      {recentActivity.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold text-navy mb-3">Recent Activity</h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-2">Client</th>
                  <th className="px-4 py-2">Action</th>
                  <th className="px-4 py-2">Path</th>
                  <th className="px-4 py-2">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentActivity.map((entry, i) => {
                  const isNew = lastVisit && entry.timestamp > lastVisit
                  return (
                    <tr key={i} className={isNew ? "bg-amber-50/50" : "hover:bg-gray-50/50"}>
                      <td className="px-4 py-2 font-medium text-gray-700">
                        {entry.client_name}
                        {isNew && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">NEW</span>}
                      </td>
                      <td className="px-4 py-2 text-gray-600">{actionLabels[entry.action_type] || entry.action_type}</td>
                      <td className="px-4 py-2 text-gray-500 font-mono text-xs max-w-[200px] truncate">{entry.path}</td>
                      <td className="px-4 py-2 text-gray-400 text-xs whitespace-nowrap">{formatAgo(entry.timestamp)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((c) => (
          <Link
            key={c.slug}
            href={`/admin/clients/${c.slug}`}
            className="block bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-navy/30 transition group"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-navy transition">{c.client_name}</h3>
                <p className="text-xs text-gray-500 mt-1">{c.client_company}</p>
              </div>
              <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-medium ${
                c.lastAccess && new Date(c.lastAccess).getTime() > Date.now() - 7 * 86400000
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}>
                {c.lastAccess && new Date(c.lastAccess).getTime() > Date.now() - 7 * 86400000 ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
              <span>{c.reportViews} report views</span>
              {c.lastAccess && <span>Last: {formatAgo(c.lastAccess)}</span>}
              {!c.lastAccess && <span className="text-gray-400">Never accessed</span>}
            </div>
          </Link>
        ))}
      </div>

      {clients.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-sm">No clients found. Add client configs to data/clients/.</p>
        </div>
      )}
    </div>
  )
}
