import { appendFileSync, existsSync, readFileSync, mkdirSync } from "fs"
import { join } from "path"

export interface AccessLogEntry {
  client_slug: string
  project_slug: string
  path: string
  timestamp: string
  user_agent: string
  ip: string
  referer: string
  session_id: string
}

const LOGS_DIR = join(process.cwd(), "data/logs")

function ensureLogsDir(): void {
  if (!existsSync(LOGS_DIR)) {
    mkdirSync(LOGS_DIR, { recursive: true })
  }
}

function getLogPath(clientSlug: string): string {
  return join(LOGS_DIR, `access-${clientSlug}.jsonl`)
}

/**
 * Append an access log entry.
 *
 * ⚠️ Vercel serverless: filesystem is ephemeral. Logs will NOT persist
 * across cold starts. For production persistence, replace with Vercel
 * KV, Blob Storage, or an external database adapter.
 */
export function logAccess(
  clientSlug: string,
  projectSlug: string,
  path: string,
  userAgent: string,
  ip: string,
  referer: string,
  sessionId: string,
): void {
  const entry: AccessLogEntry = {
    client_slug: clientSlug,
    project_slug: projectSlug,
    path,
    timestamp: new Date().toISOString(),
    user_agent: userAgent,
    ip,
    referer,
    session_id: sessionId,
  }

  ensureLogsDir()
  appendFileSync(getLogPath(clientSlug), JSON.stringify(entry) + "\n")
}

export function getAccessLogs(clientSlug: string): AccessLogEntry[] {
  const logPath = getLogPath(clientSlug)
  if (!existsSync(logPath)) return []

  const raw = readFileSync(logPath, "utf-8")
  const lines = raw.split("\n").filter(Boolean)

  return lines.map((line) => JSON.parse(line) as AccessLogEntry)
}

/** Summary stats for admin dashboard */
export function getAccessStats(clientSlug: string): {
  totalVisits: number
  uniquePaths: number
  uniqueSessions: number
  lastVisit: string | null
  visitsByPath: Record<string, number>
  visitsByDay: Record<string, number>
} {
  const logs = getAccessLogs(clientSlug)
  if (logs.length === 0) {
    return {
      totalVisits: 0, uniquePaths: 0, uniqueSessions: 0, lastVisit: null,
      visitsByPath: {}, visitsByDay: {},
    }
  }

  const paths = new Set<string>()
  const sessions = new Set<string>()
  const byPath: Record<string, number> = {}
  const byDay: Record<string, number> = {}

  for (const entry of logs) {
    paths.add(entry.path)
    if (entry.session_id) sessions.add(entry.session_id)
    byPath[entry.path] = (byPath[entry.path] || 0) + 1
    const day = entry.timestamp.slice(0, 10)
    byDay[day] = (byDay[day] || 0) + 1
  }

  return {
    totalVisits: logs.length,
    uniquePaths: paths.size,
    uniqueSessions: sessions.size,
    lastVisit: logs[logs.length - 1].timestamp,
    visitsByPath: byPath,
    visitsByDay: byDay,
  }
}
