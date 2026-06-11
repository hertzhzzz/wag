import { NextRequest, NextResponse } from "next/server"
import { appendFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"

interface FeedbackEntry {
  client_slug: string
  project_slug: string
  report_id: string
  message: string
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { client_slug, project_slug, report_id, message } = body

    if (!client_slug || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: client_slug and message" },
        { status: 400 },
      )
    }

    const entry: FeedbackEntry = {
      client_slug,
      project_slug: project_slug || "",
      report_id: report_id || "",
      message: message.trim(),
      timestamp: new Date().toISOString(),
    }

    const logsDir = join(process.cwd(), "data/logs")
    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true })
    }

    const filePath = join(logsDir, `feedback-${client_slug}.jsonl`)
    appendFileSync(filePath, JSON.stringify(entry) + "\n")

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to submit feedback" },
      { status: 500 },
    )
  }
}
