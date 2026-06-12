import { NextRequest, NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"
import { Redis } from "@upstash/redis"

const SLUG_RE = /^[a-z0-9-]{2,64}$/

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    if (!SLUG_RE.test(slug)) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 })
    }

    const sessionCookie = request.cookies.get("admin_session")
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let clientName = ""
    let clientCompany = ""
    try {
      const raw = readFileSync(join(process.cwd(), "data", "clients", `${slug}.json`), "utf-8")
      const config = JSON.parse(raw)
      clientName = config.client_name || slug
      clientCompany = config.client_company || ""
    } catch {
      return NextResponse.json({ error: "Not Found" }, { status: 404 })
    }

    let redis: Redis | null = null
    try { redis = Redis.fromEnv() } catch { /* */ }

    let logs: Array<{ action_type: string; path: string; timestamp: string; session_id: string }> = []
    let activeSessions = 0
    const reportViewCounts: Record<string, number> = {}

    if (redis) {
      try {
        const entries = await redis.lrange(`access_logs:${slug}`, 0, 199)
        for (const e of entries) {
          try {
            const entry = JSON.parse(e as string)
            logs.push({ action_type: entry.action_type || "unknown", path: entry.path || "", timestamp: entry.timestamp || "", session_id: (entry.session_id || "").slice(0, 8) })
            if (entry.action_type === "report-view") {
              const reportId = (entry.path || "").split("/").pop() || entry.path
              reportViewCounts[reportId] = (reportViewCounts[reportId] || 0) + 1
            }
          } catch { /* skip */ }
        }
      } catch { /* */ }
      try { activeSessions = await redis.scard(`client_sessions:${slug}`) } catch { /* */ }
    }

    return NextResponse.json({ clientName, clientCompany, logs, activeSessions, reportViewCounts })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
