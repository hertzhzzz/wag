import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    let password: string
    let from: string

    // Handle both form-encoded (HTML form) and JSON (API clients)
    const contentType = request.headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
      const body = await request.json()
      password = (body.password || "").trim()
      from = body.from || "/factory"
    } else {
      const formData = await request.formData()
      password = (formData.get("password") as string || "").trim()
      from = (formData.get("from") as string) || "/factory"
    }

    if (!password) {
      const loginUrl = new URL("/factory/login", request.url)
      loginUrl.searchParams.set("error", "Password required")
      loginUrl.searchParams.set("from", from)
      return NextResponse.redirect(loginUrl)
    }

    const expectedPassword = (process.env.FACTORY_ACCESS_KEY || "").trim()

    if (!expectedPassword) {
      return NextResponse.json(
        { error: "Auth not configured. Set FACTORY_ACCESS_KEY env var." },
        { status: 500 }
      )
    }

    if (password !== expectedPassword) {
      const loginUrl = new URL("/factory/login", request.url)
      loginUrl.searchParams.set("error", "invalid")
      loginUrl.searchParams.set("from", from)
      return NextResponse.redirect(loginUrl)
    }

    const token = process.env.FACTORY_AUTH_TOKEN?.trim()
    if (!token) throw new Error("FACTORY_AUTH_TOKEN not set")

    // Validate redirect target to prevent open redirect
    let redirectUrl: URL
    try {
      redirectUrl = new URL(from, request.url)
    } catch {
      redirectUrl = new URL("/factory", request.url)
    }
    if (redirectUrl.origin !== request.nextUrl.origin) {
      redirectUrl = new URL("/factory", request.url)
    }

    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set("factory_auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return response
  } catch (e) {
    console.error("Factory auth error:", e instanceof Error ? e.message : e)
    return NextResponse.json({ error: "Auth error" }, { status: 500 })
  }
}
