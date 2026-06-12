import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createAdminSession, revokeAllSessions } from "@/lib/admin-auth"
import { logAudit } from "@/lib/admin-audit"
import { checkAuthRateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const isJson = (request.headers.get("content-type") || "").includes("application/json")
  let key: string

  if (isJson) {
    const body = await request.json()
    key = (body.key || "").trim()
  } else {
    const formData = await request.formData()
    key = ((formData.get("key") as string) || "").trim()
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown"

  const allowed = await checkAuthRateLimit(`admin:recover:${ip}`)
  if (!allowed) {
    await logAudit({ action: "recovery", timestamp: new Date().toISOString(), ip, result: "failure" })
    return respond(isJson, request, "Too many attempts. Try again in 30 minutes.", 429)
  }

  if (!key) {
    return respond(isJson, request, "Missing recovery key", 400)
  }

  const hash = process.env.ADMIN_RECOVERY_KEY_HASH
  if (!hash) {
    return respond(isJson, request, "Recovery not configured", 500)
  }

  const valid = bcrypt.compareSync(key, hash)
  if (!valid) {
    await logAudit({ action: "recovery", timestamp: new Date().toISOString(), ip, result: "failure" })
    return respond(isJson, request, "Invalid recovery key", 401)
  }

  await revokeAllSessions()

  const signed = await createAdminSession(ip)
  if (!signed) {
    return respond(isJson, request, "Session creation failed", 500)
  }

  await logAudit({ action: "recovery", timestamp: new Date().toISOString(), ip, result: "success" })

  if (isJson) {
    const res = NextResponse.json({ success: true, redirect: "/admin/clients" })
    setCookie(res, signed)
    return res
  }

  const res = NextResponse.redirect(new URL("/admin/clients", request.url))
  setCookie(res, signed)
  return res
}

function respond(isJson: boolean, request: NextRequest, message: string, status: number): NextResponse {
  if (isJson) return NextResponse.json({ success: false, error: message }, { status })
  const u = new URL("/admin/recover", request.url)
  u.searchParams.set("error", message)
  return NextResponse.redirect(u)
}

function setCookie(res: NextResponse, signed: string): void {
  res.cookies.set("admin_session", signed, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
  })
}
