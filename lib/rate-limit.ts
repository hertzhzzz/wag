import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const isRedisConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
)

let redis: Redis | null = null
let generalLimiter: Ratelimit | null = null
let authLimiter: Ratelimit | null = null

if (isRedisConfigured) {
  try {
    redis = Redis.fromEnv()
    generalLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "60 s"),
      analytics: true,
    })
    authLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
      prefix: "ratelimit:auth",
    })
  } catch (error) {
    console.error("Failed to initialize rate limiter:", error)
  }
}

// In-memory fallback
const memoryMap = new Map<string, { count: number; resetTime: number }>()

function checkMemoryLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const record = memoryMap.get(key)

  if (!record || now > record.resetTime) {
    memoryMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

/** General-purpose rate limit: 3 requests per 60 seconds */
export async function checkRateLimit(identifier: string): Promise<boolean> {
  if (generalLimiter) {
    try {
      const result = await generalLimiter.limit(identifier)
      return result.success
    } catch (error) {
      console.error("Rate limit error:", error)
    }
  }
  return checkMemoryLimit(identifier, 3, 60_000)
}

/** Auth-specific rate limit: 5 attempts per 15 minutes */
export async function checkAuthRateLimit(identifier: string): Promise<boolean> {
  if (authLimiter) {
    try {
      const result = await authLimiter.limit(identifier)
      return result.success
    } catch (error) {
      console.error("Auth rate limit error:", error)
    }
  }
  return checkMemoryLimit(identifier, 5, 15 * 60_000)
}
