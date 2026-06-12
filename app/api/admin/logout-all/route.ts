import { NextRequest, NextResponse } from "next/server"
import { revokeAllSessions, validateAdminSession } from "@/lib/admin-auth"
import { logAudit } from "@/lib/admin-audit"

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get("admin_session")
  if (!sessionCookie?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const valid = await validateAdminSession(sessionCookie.value)
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown"

  await revokeAllSessions()
  await logAudit({ action: "logout_all", timestamp: new Date().toISOString(), ip, result: "success" })

  const res = NextResponse.json({ success: true })
  res.cookies.delete("admin_session")
  return res
}
