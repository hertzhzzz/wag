import { Redis } from "@upstash/redis"

const SESSION_TTL = 60 * 60 * 24 // 24 hours

export interface SessionData {
  token: string
  clientSlug: string
  createdAt: string
  lastAccess: string
  ip: string
  userAgent: string
}

function getRedis(): Redis | null {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return Redis.fromEnv()
  }
  return null
}

const redis = getRedis()

function sessionKey(slug: string, token: string): string {
  return `client_session:${slug}:${token}`
}

function sessionsSetKey(slug: string): string {
  return `client_sessions:${slug}`
}

/** Create a session in KV. Stores session data and adds token to the client's active set. */
export async function createSession(
  slug: string,
  token: string,
  ip: string,
  userAgent: string,
): Promise<void> {
  if (!redis) return

  const now = new Date().toISOString()
  const data: SessionData = {
    token,
    clientSlug: slug,
    createdAt: now,
    lastAccess: now,
    ip,
    userAgent,
  }

  await Promise.all([
    redis.set(sessionKey(slug, token), JSON.stringify(data), { ex: SESSION_TTL }),
    redis.sadd(sessionsSetKey(slug), token),
    redis.expire(sessionsSetKey(slug), SESSION_TTL),
  ])
}

/** Validate a session token. Returns session data if valid, null if expired or missing. */
export async function validateSession(
  slug: string,
  token: string,
): Promise<SessionData | null> {
  if (!redis) {
    // No KV configured — accept any non-empty cookie as valid (dev fallback)
    return token ? {
      token,
      clientSlug: slug,
      createdAt: new Date().toISOString(),
      lastAccess: new Date().toISOString(),
      ip: "",
      userAgent: "",
    } : null
  }

  const raw = await redis.get<string>(sessionKey(slug, token))
  if (!raw) return null

  const data = JSON.parse(raw) as SessionData

  // Touch lastAccess and refresh TTL
  data.lastAccess = new Date().toISOString()
  await redis.set(sessionKey(slug, token), JSON.stringify(data), { ex: SESSION_TTL })

  return data
}

/** Count active sessions for a client. */
export async function getActiveSessionCount(slug: string): Promise<number> {
  if (!redis) return 1
  return redis.scard(sessionsSetKey(slug))
}

/** Destroy a session (logout). */
export async function destroySession(slug: string, token: string): Promise<void> {
  if (!redis) return
  await Promise.all([
    redis.del(sessionKey(slug, token)),
    redis.srem(sessionsSetKey(slug), token),
  ])
}

/** Detect anomaly: IP change since last access. Returns true if anomaly detected. */
export async function detectAnomaly(
  slug: string,
  token: string,
  currentIp: string,
): Promise<{ ipChanged: boolean; previousIp: string }> {
  if (!redis) return { ipChanged: false, previousIp: "" }

  const raw = await redis.get<string>(sessionKey(slug, token))
  if (!raw) return { ipChanged: false, previousIp: "" }

  const data = JSON.parse(raw) as SessionData
  const changed = data.ip !== "" && currentIp !== "" && data.ip !== currentIp
  return { ipChanged: changed, previousIp: data.ip }
}
