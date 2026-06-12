import { NextRequest, NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { isValidClientSlug } from "@/lib/clients"
import { createSession } from "@/lib/session-store"
import { checkAuthRateLimit } from "@/lib/rate-limit"
import { logAuthFailure } from "@/lib/access-log-kv"

const SESSION_MAX_AGE = 60 * 60 * 24 // 24 hours

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""
    let slug: string, code: string, from: string

    if (contentType.includes("application/json")) {
      const body = await request.json()
      slug = (body.slug || "").trim()
      code = (body.code || "").trim()
      from = (body.from || "").trim()
    } else {
      const formData = await request.formData()
      slug = ((formData.get("slug") as string) || "").trim()
      code = ((formData.get("code") as string) || "").trim()
      from = ((formData.get("from") as string) || "").trim()
    }

    if (!slug || !code) {
      return respond(request, slug,
        { error: "missing", status: 400, message: "Missing slug or access code" })
    }

    if (!isValidClientSlug(slug)) {
      return respond(request, slug,
        { error: "invalid", status: 404, message: "Invalid client" })
    }

    // Rate limit: 5 attempts per 15 min per IP+slug
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown"
    const rateLimitKey = `auth:${slug}:${ip}`
    const allowed = await checkAuthRateLimit(rateLimitKey)
    if (!allowed) {
      return respond(request, slug,
        { error: "rate_limited", status: 429, message: "Too many attempts. Try again in 15 minutes." })
    }

    // Read bcrypt hashes
    let secrets: Record<string, string> = {}
    const b64 = process.env.CLIENT_SECRETS_B64
    if (b64) {
      try {
        secrets = JSON.parse(Buffer.from(b64, "base64").toString("utf-8"))
      } catch { /* corrupted env var */ }
    }
    if (Object.keys(secrets).length === 0) {
      try {
        const secretsPath = join(process.cwd(), "data", "clients", "secrets.json")
        secrets = JSON.parse(readFileSync(secretsPath, "utf-8"))
      } catch { /* no auth configured */ }
    }
    const clientCodeHash = secrets[slug]
    const masterCodeHash = secrets["master"]

    if (!clientCodeHash && !masterCodeHash) {
      return respond(request, slug,
        { error: "not_configured", status: 500, message: "No auth configured" })
    }

    const isValid = (clientCodeHash && bcrypt.compareSync(code, clientCodeHash))
      || (masterCodeHash && bcrypt.compareSync(code, masterCodeHash))

    if (!isValid) {
      // Log failed attempt for anomaly detection
      const ua = request.headers.get("user-agent") || ""
      await logAuthFailure(slug, "invalid_code", ip, ua)

      return respond(request, slug,
        { error: "invalid", status: 401, message: "Invalid access code" })
    }

    // Generate session token and store in KV
    const sessionToken = crypto.randomUUID()
    const ua = request.headers.get("user-agent") || ""
    await createSession(slug, sessionToken, ip, ua)

    const redirectTo = from || `/client/${slug}`
    const isJson = contentType.includes("application/json")

    if (isJson) {
      const res = NextResponse.json({ success: true, redirect: redirectTo })
      setSessionCookie(res, slug, sessionToken)
      return res
    }

    const res = NextResponse.redirect(new URL(redirectTo, request.url))
    setSessionCookie(res, slug, sessionToken)
    return res
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 },
    )
  }
}

function respond(request: NextRequest, slug: string, opts: {
  error: string; status: number; message: string
}): NextResponse {
  const isForm = !(request.headers.get("content-type") || "").includes("application/json")
  if (isForm) {
    const u = new URL(`/client/${slug}`, request.url)
    u.searchParams.set("error", opts.error)
    return NextResponse.redirect(u)
  }
  return NextResponse.json({ success: false, error: opts.message }, { status: opts.status })
}

function setSessionCookie(res: NextResponse, slug: string, token: string): void {
  res.cookies.set(`client_auth_${slug}`, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
  })
}
