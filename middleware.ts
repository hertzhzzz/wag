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
  const isProtected = PROTECTED_PATHS.some((prefix) =>
    pathname.startsWith(prefix),
  )
  const isPublic = PUBLIC_PATHS.some((prefix) => pathname.startsWith(prefix))

  if (!isProtected || isPublic) {
    return NextResponse.next()
  }

  // Factory auth guard
  if (pathname.startsWith("/factory")) {
    return handleFactoryAuth(request)
  }

  // Client auth guard
  if (pathname.startsWith("/client")) {
    return handleClientAuth(request)
  }

  // Admin auth guard
  if (pathname.startsWith("/admin")) {
    return handleAdminAuth(request)
  }

  return NextResponse.next()
}

function handleFactoryAuth(request: NextRequest): NextResponse {
  const authToken = request.cookies.get("factory_auth")

  if (
    !authToken ||
    authToken.value !== (process.env.FACTORY_AUTH_TOKEN || "").trim()
  ) {
    const loginUrl = new URL("/factory/login", request.url)
    loginUrl.searchParams.set("from", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl, 302)
  }

  return NextResponse.next()
}

function handleClientAuth(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  const segments = pathname.split("/").filter(Boolean)

  // /client/{slug} (exactly 2 segments) or /client (list) — allow through
  if (segments.length <= 2) {
    return NextResponse.next()
  }

  const slug = segments[1]

  // Cookie existence check — fast path, no KV call in Edge Runtime
  const sessionCookie = request.cookies.get(`client_auth_${slug}`)
  if (!sessionCookie?.value) {
    return redirectToClientLogin(request, slug)
  }

  return NextResponse.next()
}

function handleAdminAuth(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl

  // Public admin paths: login, recover, and their API routes
  if (
    pathname === "/admin" ||
    pathname === "/admin/recover" ||
    pathname.startsWith("/api/admin/auth") ||
    pathname.startsWith("/api/admin/recover")
  ) {
    return NextResponse.next()
  }

  // Check for admin session cookie
  const sessionCookie = request.cookies.get("admin_session")
  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL("/admin", request.url), 302)
  }

  // HMAC verification delegated to page-level validateAdminSession
  // Middleware only does cookie existence check (same as client portal pattern)
  // Full KV validation happens in server components and API routes

  return NextResponse.next()
}

function redirectToClientLogin(
  request: NextRequest,
  slug: string,
): NextResponse {
  const loginUrl = new URL(`/client/${slug}`, request.url)
  loginUrl.searchParams.set("from", request.nextUrl.pathname)
  return NextResponse.redirect(loginUrl, 302)
}

export const config = {
  matcher: [
    "/factory/:path*",
    "/api/factory/:path*",
    "/client/:path*",
    "/api/client/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/case-studies/:path*",
    "/adelaide",
    "/perth",
    "/brisbane",
    "/melbourne",
    "/resources/china-supplier-verification",
  ],
}
