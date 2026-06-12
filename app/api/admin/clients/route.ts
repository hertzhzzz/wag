import { NextRequest, NextResponse } from "next/server"
import { readdirSync, readFileSync } from "fs"
import { join } from "path"
import { Redis } from "@upstash/redis"
import { validateAdminSession } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin_session")
  if (!sessionCookie?.value || !(await validateAdminSession(sessionCookie.value))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const clientsDir = join(process.cwd(), "data", "clients")
  let slugs: string[] = []
  try { slugs = readdirSync(clientsDir).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", "")) } catch { slugs = [] }

  let redis: Redis | null = null
  try { redis = Redis.fromEnv() } catch { /* */ }

  const clients: Array<{ slug: string; client_name: string; client_company: string; lastAccess: string | null; reportViews: number }> = []

  for (const slug of slugs) {
    try {
      const raw = readFileSync(join(clientsDir, `${slug}.json`), "utf-8")
      const config = JSON.parse(raw)
      let lastAccess: string | null = null
      let reportViews = 0

      if (redis) {
        try { const e = await redis.lrange(`access_logs:${slug}`, 0, 0); if (e.length > 0) { const l = JSON.parse(e[0] as string); lastAccess = l.timestamp } } catch { /* */ }
        try { const ae = await redis.lrange(`access_logs:${slug}`, 0, 999); reportViews = ae.map((e) => { try { return JSON.parse(e as string) } catch { return null } }).filter((e) => e?.action_type === "report-view").length } catch { /* */ }
      }

      clients.push({ slug, client_name: config.client_name || slug, client_company: config.client_company || "", lastAccess, reportViews })
    } catch { /* skip */ }
  }

  clients.sort((a, b) => {
    if (!a.lastAccess && !b.lastAccess) return 0
    if (!a.lastAccess) return 1; if (!b.lastAccess) return -1
    return b.lastAccess.localeCompare(a.lastAccess)
  })

  // Recent activity
  let activity: Array<{ client_name: string; client_slug: string; action_type: string; path: string; timestamp: string }> = []
  if (redis) {
    for (const c of clients.slice(0, 5)) {
      try { const e = await redis.lrange(`access_logs:${c.slug}`, 0, 9); for (const item of e) { try { const p = JSON.parse(item as string); activity.push({ client_name: c.client_name, client_slug: c.slug, action_type: p.action_type, path: p.path, timestamp: p.timestamp }) } catch { /* */ } } } catch { /* */ }
    }
    activity.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    activity = activity.slice(0, 20)
  }

  // Last visit
  let lastVisit: string | null = null
  if (redis) { try { lastVisit = await redis.get<string>("admin:last_visit"); await redis.set("admin:last_visit", new Date().toISOString()) } catch { /* */ } }

  return NextResponse.json({ clients, activity, lastVisit })
}
