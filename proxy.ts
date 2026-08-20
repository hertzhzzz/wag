import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getBlogRedirectTarget, isBlogGoneSlug, isGonePath } from "@/lib/gone-paths"
import {
  NOINDEX_ROBOTS_TAG,
  shouldSendNoIndexRobotsTag,
} from "@/lib/non-production-robots"

// Render the branded /gone page (reuses real Navbar/Footer) with a true 410 status.
function goneResponse(request: NextRequest): NextResponse {
  return applyNoIndexIfNeeded(request, NextResponse.rewrite(new URL("/gone", request.url), { status: 410 }))
}

/** Preview / *.vercel.app: never allow indexing. Production brand host stays indexable. */
function applyNoIndexIfNeeded(request: NextRequest, response: NextResponse): NextResponse {
  if (
    shouldSendNoIndexRobotsTag({
      hostname: request.nextUrl.hostname,
      vercelEnv: process.env.VERCEL_ENV,
    })
  ) {
    response.headers.set("X-Robots-Tag", NOINDEX_ROBOTS_TAG)
  }
  return response
}

const PROTECTED_PATHS = ["/client"]
const PUBLIC_PATHS = [
  "/api/client/auth",
]

function getArticleSlug(pathname: string): string | null {
  const match = pathname.match(/^\/article\/([^/]+)\/?$/)
  return match ? decodeURIComponent(match[1]) : null
}

function getResourceSlug(pathname: string): string | null {
  const match = pathname.match(/^\/resources\/([^/]+)\/?$/)
  return match ? decodeURIComponent(match[1]) : null
}

export function proxy(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl

  // Legacy CMS "_deleted/" paths (e.g. /article/_deleted/{slug}) were exposed
  // in old sitemaps and are still indexed. They have two path segments, so
  // getArticleSlug() below misses them and they fall through to a plain 404.
  // Serve a direct 410 instead — stronger "permanently gone" signal.
  if (pathname.includes("/_deleted/")) {
    return goneResponse(request)
  }

  const articleSlug = getArticleSlug(pathname)
  if (articleSlug) {
    if (isBlogGoneSlug(articleSlug)) {
      return goneResponse(request)
    }
    // resource- 旧版文章 301 → canonical 新版（传递权重）
    const articleRedirect = getBlogRedirectTarget(articleSlug)
    if (articleRedirect) {
      return applyNoIndexIfNeeded(
        request,
        NextResponse.redirect(new URL(articleRedirect, request.url), 301),
      )
    }
  }

  const resourceSlug = getResourceSlug(pathname)
  if (resourceSlug) {
    if (isBlogGoneSlug(resourceSlug)) {
      return goneResponse(request)
    }

    const redirectTarget = getBlogRedirectTarget(resourceSlug) || `/article/${resourceSlug}`
    return applyNoIndexIfNeeded(
      request,
      NextResponse.redirect(new URL(redirectTarget, request.url), 301),
    )
  }

  if (isGonePath(pathname)) {
    return goneResponse(request)
  }

  // Block the factory wiki in production (local dev only for now).
  // Match the /factory route segment exactly — a bare startsWith("/factory")
  // also swallows sibling routes like /factory-audit-china, which 404'd in
  // production for weeks while working fine on localhost.
  const isFactoryWiki = pathname === "/factory" || pathname.startsWith("/factory/")
  if (isFactoryWiki && !hostname.includes("localhost") && !hostname.includes("127.0.0.1")) {
    return applyNoIndexIfNeeded(
      request,
      new NextResponse("Not Found", { status: 404 }),
    )
  }

  const isProtected = PROTECTED_PATHS.some((prefix) => pathname.startsWith(prefix))
  const isPublic = PUBLIC_PATHS.some((prefix) => pathname.startsWith(prefix))

  // Auth guard — client portal only
  if (isProtected && !isPublic && pathname.startsWith("/client")) {
    return handleClientAuth(request)
  }

  return applyNoIndexIfNeeded(request, NextResponse.next())
}

function handleClientAuth(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length <= 2) {
    return applyNoIndexIfNeeded(request, NextResponse.next())
  }
  const slug = segments[1]
  const sessionCookie = request.cookies.get(`client_auth_${slug}`)
  if (!sessionCookie?.value) {
    const loginUrl = new URL(`/client/${slug}`, request.url)
    loginUrl.searchParams.set("from", request.nextUrl.pathname)
    return applyNoIndexIfNeeded(request, NextResponse.redirect(loginUrl, 302))
  }
  return applyNoIndexIfNeeded(request, NextResponse.next())
}

export const config = {
  matcher: [
    // Non-production noindex header on all document routes (excludes static assets)
    "/((?!_next/static|_next/image|.*\\..*).*)",
    "/factory/:path*",
    "/client/:path*",
    "/api/client/:path*",
    "/case-studies/:path*",
    "/adelaide",
    "/perth",
    "/brisbane",
    "/melbourne",
    "/sydney",
    "/china-vs-alibaba",
    "/china-supplier-verification",
    "/article/:slug*",
    "/resources/:slug*",
  ],
}
