import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { validateSession } from "@/lib/session-store"

const PROTECTED_PATHS = ["/factory", "/client"]
const PUBLIC_PATHS = [
  "/factory/login",
  "/api/factory/auth",
  "/api/client/auth",
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

async function handleClientAuth(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl
  const segments = pathname.split("/").filter(Boolean)

  // /client/{slug} (exactly 2 segments) or /client (list) — allow through
  if (segments.length <= 2) {
    return NextResponse.next()
  }

  const slug = segments[1]

  // Check for auth cookie (client_auth_{slug}, not client_session_{slug})
  const sessionCookie = request.cookies.get(`client_auth_${slug}`)
  if (!sessionCookie?.value) {
    return redirectToClientLogin(request, slug)
  }

  // Validate the session token against KV store
  const valid = await validateSession(slug, sessionCookie.value)
  if (!valid) {
    return redirectToClientLogin(request, slug)
  }

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
    "/case-studies/:path*",
    "/adelaide",
    "/perth",
    "/brisbane",
    "/melbourne",
    "/resources/china-supplier-verification",
  ],
}
