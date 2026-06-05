import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 })
    }

    const expectedPassword = process.env.FACTORY_ACCESS_KEY

    if (!expectedPassword) {
      return NextResponse.json(
        { error: "Auth not configured. Set FACTORY_ACCESS_KEY env var." },
        { status: 500 }
      )
    }

    if (password !== expectedPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    const token = process.env.FACTORY_AUTH_TOKEN || "wag-factory-default-token"

    const response = NextResponse.json({ success: true })
    response.cookies.set("factory_auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch {
    return NextResponse.json({ error: "Auth error" }, { status: 500 })
  }
}
