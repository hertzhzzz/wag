import { NextRequest, NextResponse } from "next/server"
import { getAccessStats, getAccessLogs, getRecentAuthFailures } from "@/lib/access-log-kv"
import { getActiveSessionCount, validateSession } from "@/lib/session-store"

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 })
  }

  // Auth: validate session token against KV, not just cookie existence
  const sessionCookie = request.cookies.get(`client_auth_${slug}`)
  if (!sessionCookie?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const valid = await validateSession(slug, sessionCookie.value)
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [stats, logs, failures, activeSessions] = await Promise.all([
    getAccessStats(slug),
    getAccessLogs(slug, 50),
    getRecentAuthFailures(slug, 20),
    getActiveSessionCount(slug),
  ])

  return NextResponse.json({
    slug,
    stats,
    recent_logs: logs,
    auth_failures: failures,
    active_sessions: activeSessions,
  })
}
