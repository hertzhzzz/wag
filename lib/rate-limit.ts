import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Check if Redis is configured
const isRedisConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
)

// Fallback to in-memory if Redis not configured
let ratelimit: Ratelimit | null = null

if (isRedisConfigured) {
  try {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(3, '60 s'),
      analytics: true,
    })
  } catch (error) {
    console.error('Failed to initialize rate limiter:', error)
  }
}

// In-memory fallback
const memoryRateLimitMap = new Map<string, { count: number; resetTime: number }>()
const MEMORY_RATE_LIMIT = 3
const MEMORY_WINDOW = 60 * 1000

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (usually IP address)
 * @returns true if request is allowed, false if rate limited
 */
export async function checkRateLimit(identifier: string): Promise<boolean> {
  // Use Redis rate limiter if available
  if (ratelimit) {
    try {
      const result = await ratelimit.limit(identifier)
      return result.success
    } catch (error) {
      console.error('Rate limit error:', error)
      // Fall through to memory rate limit on error
    }
  }

  // Fallback to in-memory
  const now = Date.now()
  const record = memoryRateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    memoryRateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + MEMORY_WINDOW,
    })
    return true
  }

  if (record.count >= MEMORY_RATE_LIMIT) {
    return false
  }

  record.count++
  return true
}
