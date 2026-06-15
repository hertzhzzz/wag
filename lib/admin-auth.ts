import { Redis } from "@upstash/redis"
import crypto from "crypto"
import { signToken, verifySignedToken } from "@/lib/admin-hmac"

const SESSION_TTL = 60 * 60 * 24

export interface AdminSession {
  version: number
  created_at: string
}

function getRedis(): Redis | null {
  try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      return Redis.fromEnv()
    }
  } catch { /* module init might not have env vars ready */ }
  return null
}

function sessionKey(token: string): string {
  return `admin:session:${token}`
}

export async function createAdminSession(_ip: string): Promise<string | null> {
  const redis = getRedis()
  if (!redis) return null

  const token = crypto.randomUUID()

  const versionStr = await redis.get<string>("admin:session_version")
  const version = versionStr ? parseInt(versionStr) : 1

  const session: AdminSession = {
    version,
    created_at: new Date().toISOString(),
  }

  await redis.set(sessionKey(token), JSON.stringify(session), { ex: SESSION_TTL })
  try {
    return await signToken(token)
  } catch {
    return null
  }
}

export async function validateAdminSession(signed: string): Promise<AdminSession | null> {
  let token: string | null
  try {
    token = await verifySignedToken(signed)
  } catch {
    return null
  }
  if (!token) return null

  const redis = getRedis()
  if (!redis) return null

  const raw = await redis.get<string>(sessionKey(token))
  if (!raw) return null

  const session = JSON.parse(raw) as AdminSession

  const currentVersionStr = await redis.get<string>("admin:session_version")
  const currentVersion = currentVersionStr ? parseInt(currentVersionStr) : 1
  if (session.version < currentVersion) return null

  return session
}

export async function revokeAllSessions(): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  await redis.incr("admin:session_version")
}
