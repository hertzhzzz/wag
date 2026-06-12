import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createAdminSession } from "@/lib/admin-auth"
import { logAudit } from "@/lib/admin-audit"
import { checkAuthRateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const isJson = (request.headers.get("content-type") || "").includes("application/json")
  let password: string

  if (isJson) {
    const body = await request.json()
    password = (body.password || "").trim()
  } else {
    const formData = await request.formData()
    password = ((formData.get("password") as string) || "").trim()
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown"

  const allowed = await checkAuthRateLimit(`admin:auth:${ip}`)
  if (!allowed) {
    await logAudit({ action: "login", timestamp: new Date().toISOString(), ip, result: "failure" })
    return respond(isJson, request, "Too many attempts. Try again in 15 minutes.", 429)
  }

  if (!password) {
    return respond(isJson, request, "Missing password", 400)
  }

  const hash = process.env.ADMIN_PASSWORD_HASH
  if (!hash) {
    return respond(isJson, request, "Admin auth not configured", 500)
  }

  const valid = bcrypt.compareSync(password, hash)
  if (!valid) {
    await logAudit({ action: "login", timestamp: new Date().toISOString(), ip, result: "failure" })
    return respond(isJson, request, "Invalid password", 401)
  }

  const signed = await createAdminSession(ip)
  if (!signed) {
    return respond(isJson, request, "Session creation failed", 500)
  }

  await logAudit({ action: "login", timestamp: new Date().toISOString(), ip, result: "success" })

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
  const u = new URL("/admin", request.url)
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
