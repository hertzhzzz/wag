import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PROTECTED_PATHS = ["/factory"]
const PUBLIC_PATHS = ["/factory/login", "/api/factory/auth"]

// Permanently deleted pages — return 410 Gone so Google stops crawling them
const GONE_PATHS = [
  "/case-studies",
  "/adelaide",
  "/perth",
  "/brisbane",
  "/melbourne",
  "/resources/china-supplier-verification",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Return 410 Gone for permanently deleted pages
  for (const gonePath of GONE_PATHS) {
    if (pathname === gonePath || pathname.startsWith(gonePath + "/")) {
      return new NextResponse("Gone", { status: 410 })
    }
  }

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
    return NextResponse.redirect(loginUrl, 302)  // 302: always GET, prevents POST→login 405
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/factory/:path*",
    "/api/factory/:path*",
    "/case-studies/:path*",
    "/adelaide",
    "/perth",
    "/brisbane",
    "/melbourne",
    "/resources/china-supplier-verification",
  ],
}
