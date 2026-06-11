import { NextRequest, NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { isValidClientSlug } from "@/lib/clients"

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

    // Read bcrypt hashes from JSON file (env vars mangle $ signs)
    const secretsPath = join(process.cwd(), "data", "clients", "secrets.json")
    let secrets: Record<string, string> = {}
    try {
      secrets = JSON.parse(readFileSync(secretsPath, "utf-8"))
    } catch {
      // file not found — no auth configured
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
      return respond(request, slug,
        { error: "invalid", status: 401, message: "Invalid access code" })
    }

    // Generate session token — random, not derived from the user's code
    const sessionToken = crypto.randomUUID()
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
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  })
  // Also set a marker cookie so middleware can skip bcrypt
  res.cookies.set(`client_session_${slug}`, "1", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  })
}
