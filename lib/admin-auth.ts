import { Redis } from "@upstash/redis"
import crypto from "crypto"
import { signToken, verifySignedToken } from "@/lib/admin-hmac"

const SESSION_TTL = 60 * 60 * 24

export interface AdminSession {
  version: number
  created_at: string
}

function getRedis(): Redis | null {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return Redis.fromEnv()
  }
  return null
}

const redis = getRedis()

function sessionKey(token: string): string {
  return `admin:session:${token}`
}

/** Create admin session in KV. Returns signed token for cookie. */
export async function createAdminSession(_ip: string): Promise<string | null> {
  if (!redis) return null

  const token = crypto.randomUUID()

  const versionStr = await redis.get<string>("admin:session_version")
  const version = versionStr ? parseInt(versionStr) : 1

  const session: AdminSession = {
    version,
    created_at: new Date().toISOString(),
  }

  await redis.set(sessionKey(token), JSON.stringify(session), { ex: SESSION_TTL })
  return signToken(token)
}

/** Validate admin session. Returns session data if valid, null otherwise. */
export async function validateAdminSession(signed: string): Promise<AdminSession | null> {
  const token = await verifySignedToken(signed)
  if (!token) return null

  if (!redis) return null

  const raw = await redis.get<string>(sessionKey(token))
  if (!raw) return null

  const session = JSON.parse(raw) as AdminSession

  const currentVersionStr = await redis.get<string>("admin:session_version")
  const currentVersion = currentVersionStr ? parseInt(currentVersionStr) : 1
  if (session.version < currentVersion) return null

  return session
}

/** Revoke all admin sessions by incrementing version counter. */
export async function revokeAllSessions(): Promise<void> {
  if (!redis) return
  await redis.incr("admin:session_version")
}
