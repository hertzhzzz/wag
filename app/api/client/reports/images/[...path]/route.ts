import { NextRequest, NextResponse } from "next/server"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".bmp": "image/bmp",
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params

  const slug = path[0]
  const filePath = path.slice(1).join("/")

  if (!slug || !filePath) {
    return new NextResponse("Not Found", { status: 404 })
  }

  // Validate auth cookie — just check existence (same as middleware fast path)
  const sessionCookie = request.cookies.get(`client_auth_${slug}`)
  if (!sessionCookie?.value) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  // Read from content/reports/ (NOT public/ — would bloat Vercel function size)
  const fullPath = join(process.cwd(), "content", "reports", slug, filePath)

  // Prevent directory traversal
  if (!fullPath.startsWith(join(process.cwd(), "content", "reports"))) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  if (!existsSync(fullPath)) {
    return new NextResponse("Not Found", { status: 404 })
  }

  const ext = fullPath.slice(fullPath.lastIndexOf(".")).toLowerCase()
  const contentType = MIME[ext] || "application/octet-stream"

  try {
    const buffer = readFileSync(fullPath)
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-cache",
      },
    })
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
