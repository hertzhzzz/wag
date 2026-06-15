import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PROTECTED_PATHS = ["/factory", "/client", "/admin"]
const PUBLIC_PATHS = [
  "/factory/login",
  "/api/factory/auth",
  "/api/client/auth",
  "/api/admin/auth",
  "/api/admin/recover",
]

// GONE_PATHS: paths returning HTTP 410 Gone. sitemap.ts uses its own BLOCKED_SLUGS list — update BOTH when adding/removing deleted article paths.
export const GONE_PATHS = [
  "/case-studies",
  "/adelaide",
  "/perth",
  "/brisbane",
  "/melbourne",
  "/resources/china-supplier-verification",
  "/resources/resource-",  // 29 deleted resource-* articles (Phase 1 cleanup)
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  for (const gonePath of GONE_PATHS) {
    // Prefix entries (ending with -) match as startsWith directly, e.g. /resources/resource-
    // Exact entries match the path itself + sub-paths, e.g. /case-studies + /case-studies/...
    if (gonePath.endsWith("-")) {
      if (pathname.startsWith(gonePath)) {
        return new NextResponse("Gone", { status: 410 })
      }
    } else if (pathname === gonePath || pathname.startsWith(gonePath + "/")) {
      return new NextResponse("Gone", { status: 410 })
    }
  }

  const isProtected = PROTECTED_PATHS.some((prefix) => pathname.startsWith(prefix))
  const isPublic = PUBLIC_PATHS.some((prefix) => pathname.startsWith(prefix))

  let response: NextResponse

  // Auth guards
  if (isProtected && !isPublic) {
    if (pathname.startsWith("/factory")) {
      response = handleFactoryAuth(request)
    } else if (pathname.startsWith("/client")) {
      response = handleClientAuth(request)
    } else if (pathname.startsWith("/admin")) {
      response = handleAdminAuth(request)
    } else {
      response = NextResponse.next()
    }
  } else {
    response = NextResponse.next()
  }

  // Tag admin paths so root layout can suppress enquiry widget
  if (pathname.startsWith("/admin")) {
    response.headers.set("x-is-admin", "1")
  }

  return response
}

function handleFactoryAuth(request: NextRequest): NextResponse {
  const expected = process.env.FACTORY_AUTH_TOKEN?.trim()
  if (!expected) {
    return new NextResponse("Auth not configured", { status: 500 })
  }
  const authToken = request.cookies.get("factory_auth")
  if (!authToken || authToken.value !== expected) {
    const loginUrl = new URL("/factory/login", request.url)
    loginUrl.searchParams.set("from", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl, 302)
  }
  return NextResponse.next()
}

function handleClientAuth(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length <= 2) return NextResponse.next()
  const slug = segments[1]
  const sessionCookie = request.cookies.get(`client_auth_${slug}`)
  if (!sessionCookie?.value) {
    const loginUrl = new URL(`/client/${slug}`, request.url)
    loginUrl.searchParams.set("from", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl, 302)
  }
  return NextResponse.next()
}

function handleAdminAuth(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  if (pathname === "/admin" || pathname === "/admin/recover" ||
      pathname.startsWith("/api/admin/auth") || pathname.startsWith("/api/admin/recover")) {
    return NextResponse.next()
  }
  const sessionCookie = request.cookies.get("admin_session")
  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL("/admin", request.url), 302)
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/factory/:path*", "/api/factory/:path*",
    "/client/:path*", "/api/client/:path*",
    "/admin/:path*", "/api/admin/:path*",
    "/case-studies/:path*", "/adelaide", "/perth", "/brisbane", "/melbourne",
    "/resources/china-supplier-verification",
    "/resources/resource-:path*",  // deleted resource-* articles → 410
  ],
}
