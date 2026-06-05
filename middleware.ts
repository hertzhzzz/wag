import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PROTECTED_PATHS = ["/factory"]
const PUBLIC_PATHS = ["/factory/login", "/api/factory/auth"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if path is under a protected prefix
  const isProtected = PROTECTED_PATHS.some((prefix) => pathname.startsWith(prefix))
  const isPublic = PUBLIC_PATHS.some((prefix) => pathname.startsWith(prefix))

  if (!isProtected || isPublic) {
    return NextResponse.next()
  }

  // Check for auth cookie
  const authToken = request.cookies.get("factory_auth")

  if (!authToken || authToken.value !== (process.env.FACTORY_AUTH_TOKEN || "").trim()) {
    const loginUrl = new URL("/factory/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/factory/:path*", "/api/factory/:path*"],
}
