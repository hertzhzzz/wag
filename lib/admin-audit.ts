import { Redis } from "@upstash/redis/cloudflare"

const MAX_ENTRIES = 9999

export interface AuditEntry {
  action: string
  timestamp: string
  ip: string
  result: "success" | "failure"
}

function getRedis(): Redis | null {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return Redis.fromEnv()
  }
  return null
}

const redis = getRedis()

export async function logAudit(entry: AuditEntry): Promise<void> {
  if (!redis) return
  await redis.lpush("admin:audit", JSON.stringify(entry))
  await redis.ltrim("admin:audit", 0, MAX_ENTRIES)
}

export async function getAuditLogs(count: number = 50): Promise<AuditEntry[]> {
  if (!redis) return []
  const items = await redis.lrange("admin:audit", 0, count - 1)
  return items.map((i) => {
    try { return JSON.parse(i as string) as AuditEntry } catch { return null }
  }).filter(Boolean) as AuditEntry[]
}
