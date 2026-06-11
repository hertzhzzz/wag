import { NextRequest, NextResponse } from "next/server"
import { appendFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"

// In-memory store for reviewed deliverables (ephemeral on Vercel, persistent via JSONL log)
const reviewedCache = new Map<string, Set<string>>()

function reviewedKey(clientSlug: string, projectSlug: string): string {
  return `${clientSlug}:${projectSlug}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { client_slug, project_slug, deliverable_id } = body

    if (!client_slug || !project_slug || !deliverable_id) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      )
    }

    const key = reviewedKey(client_slug, project_slug)
    if (!reviewedCache.has(key)) {
      reviewedCache.set(key, new Set())
    }

    if (reviewedCache.get(key)!.has(deliverable_id)) {
      return NextResponse.json(
        { success: false, error: "Already marked as reviewed" },
        { status: 409 },
      )
    }

    reviewedCache.get(key)!.add(deliverable_id)

    // Append to audit log for persistence
    const logsDir = join(process.cwd(), "data", "logs")
    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true })
    }
    appendFileSync(
      join(logsDir, `status-${client_slug}.jsonl`),
      JSON.stringify({
        client_slug,
        project_slug,
        deliverable_id,
        action: "client_reviewed",
        timestamp: new Date().toISOString(),
      }) + "\n",
    )

    return NextResponse.json({ success: true, deliverable_id })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update status" },
      { status: 500 },
    )
  }
}
