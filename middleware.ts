import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getBlogRedirectTarget, isBlogGoneSlug, isGonePath } from "@/lib/gone-paths"

// Render the branded /gone page (reuses real Navbar/Footer) with a true 410 status.
function goneResponse(request: NextRequest): NextResponse {
  return NextResponse.rewrite(new URL("/gone", request.url), { status: 410 })
}

const PROTECTED_PATHS = ["/client", "/admin"]
const PUBLIC_PATHS = [
  "/api/client/auth",
  "/api/admin/auth",
  "/api/admin/recover",
]

function getArticleSlug(pathname: string): string | null {
  const match = pathname.match(/^\/article\/([^/]+)\/?$/)
  return match ? decodeURIComponent(match[1]) : null
}

function getResourceSlug(pathname: string): string | null {
  const match = pathname.match(/^\/resources\/([^/]+)\/?$/)
  return match ? decodeURIComponent(match[1]) : null
}

export function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl

  const articleSlug = getArticleSlug(pathname)
  if (articleSlug && isBlogGoneSlug(articleSlug)) {
    return goneResponse(request)
  }

  const resourceSlug = getResourceSlug(pathname)
  if (resourceSlug) {
    if (isBlogGoneSlug(resourceSlug)) {
      return goneResponse(request)
    }

    const redirectTarget = getBlogRedirectTarget(resourceSlug) || `/article/${resourceSlug}`
    return NextResponse.redirect(new URL(redirectTarget, request.url), 301)
  }

  if (isGonePath(pathname)) {
    return goneResponse(request)
  }

  // Block /factory in production (local dev only for now)
  if (pathname.startsWith("/factory") && !hostname.includes("localhost") && !hostname.includes("127.0.0.1")) {
    return new NextResponse("Not Found", { status: 404 })
  }

  const isProtected = PROTECTED_PATHS.some((prefix) => pathname.startsWith(prefix))
  const isPublic = PUBLIC_PATHS.some((prefix) => pathname.startsWith(prefix))

  let response: NextResponse

  // Auth guards
  if (isProtected && !isPublic) {
    if (pathname.startsWith("/client")) {
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
    "/factory/:path*",
    "/client/:path*", "/api/client/:path*",
    "/admin/:path*", "/api/admin/:path*",
    "/case-studies/:path*", "/adelaide", "/perth", "/brisbane", "/melbourne",
    "/article/:slug*",
    "/resources/:slug*",
  ],
}
