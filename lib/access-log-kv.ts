import { Redis } from "@upstash/redis"

export interface AccessLogEntry {
  client_slug: string
  project_slug: string
  path: string
  action_type: "access-page" | "dashboard" | "report-view" | "auth-failure"
  timestamp: string
  user_agent: string
  ip: string
  referer: string
  session_id: string
}

function getRedis(): Redis | null {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return Redis.fromEnv()
  }
  return null
}

const redis = getRedis()

function logKey(clientSlug: string): string {
  return `access_logs:${clientSlug}`
}

function authFailureKey(clientSlug: string): string {
  return `auth_failures:${clientSlug}`
}

/**
 * Append an access log entry to KV.
 * Uses Redis LIST with LPUSH (newest first). Keeps last 1000 entries per client.
 */
export async function logAccess(entry: AccessLogEntry): Promise<void> {
  if (!redis) return

  const key = logKey(entry.client_slug)
  const payload = JSON.stringify(entry)

  await Promise.all([
    redis.lpush(key, payload),
    redis.ltrim(key, 0, 999),
  ])
}

/**
 * Log a failed authentication attempt for anomaly detection.
 */
export async function logAuthFailure(
  clientSlug: string,
  reason: string,
  ip: string,
  userAgent: string,
): Promise<void> {
  if (!redis) return

  const key = authFailureKey(clientSlug)
  const entry = JSON.stringify({
    client_slug: clientSlug,
    reason,
    ip,
    user_agent: userAgent,
    timestamp: new Date().toISOString(),
  })

  await Promise.all([
    redis.lpush(key, entry),
    redis.ltrim(key, 0, 99),
  ])
}

/**
 * Get recent failed auth attempts for anomaly detection.
 */
export async function getRecentAuthFailures(
  clientSlug: string,
  count: number = 20,
): Promise<Array<{ timestamp: string; ip: string; reason: string }>> {
  if (!redis) return []

  const key = authFailureKey(clientSlug)
  const items = await redis.lrange(key, 0, count - 1)
  return items.map((item) => {
    try { return JSON.parse(item as string) } catch { return null }
  }).filter(Boolean) as Array<{ timestamp: string; ip: string; reason: string }>
}

/**
 * Get access logs for a client. Returns newest first.
 */
export async function getAccessLogs(
  clientSlug: string,
  count: number = 200,
): Promise<AccessLogEntry[]> {
  if (!redis) return []

  const key = logKey(clientSlug)
  const items = await redis.lrange(key, 0, count - 1)
  return items
    .map((item) => {
      try { return JSON.parse(item as string) as AccessLogEntry } catch { return null }
    })
    .filter(Boolean) as AccessLogEntry[]
}

/**
 * Get access stats summary.
 */
export async function getAccessStats(clientSlug: string): Promise<{
  totalVisits: number
  uniquePaths: number
  uniqueSessions: number
  lastVisit: string | null
  visitsByPath: Record<string, number>
  visitsByDay: Record<string, number>
}> {
  const logs = await getAccessLogs(clientSlug, 500)
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
    lastVisit: logs[0]?.timestamp ?? null,
    visitsByPath: byPath,
    visitsByDay: byDay,
  }
}
