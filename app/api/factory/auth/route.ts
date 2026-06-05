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

    const token = (process.env.FACTORY_AUTH_TOKEN || "wag-factory-default-token").trim()

    const response = NextResponse.redirect(new URL(from, request.url))
    response.cookies.set("factory_auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return response
  } catch {
    return NextResponse.json({ error: "Auth error" }, { status: 500 })
  }
}
