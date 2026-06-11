import { appendFileSync, existsSync, readFileSync, mkdirSync } from "fs"
import { join } from "path"

export interface AccessLogEntry {
  client_slug: string
  project_slug: string
  path: string
  timestamp: string
  user_agent: string
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
 * Append an access log entry to the JSONL file for a given client.
 * Creates the logs directory if it does not exist.
 *
 * Note: This uses the local filesystem (appendFileSync). On Vercel's
 * serverless runtime, the filesystem is ephemeral — logs written here
 * will NOT persist across function instances. For production, replace
 * with a database or blob storage adapter.
 */
export function logAccess(
  clientSlug: string,
  projectSlug: string,
  path: string,
  userAgent: string,
): void {
  const entry: AccessLogEntry = {
    client_slug: clientSlug,
    project_slug: projectSlug,
    path,
    timestamp: new Date().toISOString(),
    user_agent: userAgent,
  }

  ensureLogsDir()
  appendFileSync(getLogPath(clientSlug), JSON.stringify(entry) + "\n")
}

/**
 * Read all access log entries for a given client.
 * Returns an empty array if no logs exist.
 */
export function getAccessLogs(clientSlug: string): AccessLogEntry[] {
  const logPath = getLogPath(clientSlug)
  if (!existsSync(logPath)) return []

  const raw = readFileSync(logPath, "utf-8")
  const lines = raw.split("\n").filter(Boolean)

  return lines.map((line) => JSON.parse(line) as AccessLogEntry)
}
