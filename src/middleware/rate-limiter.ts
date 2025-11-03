interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

const RATE_LIMITS = {
  auth: { requests: 5, window: 60000 }, // 5 req/min
  tracks: { requests: 30, window: 60000 }, // 30 req/min
  upload: { requests: 3, window: 60000 }, // 3 req/min
  nft: { requests: 10, window: 60000 }, // 10 req/min
  general: { requests: 100, window: 60000 }, // 100 req/min
}

// Upstash/Redis-backed limiter for production; in-memory fallback for dev/test
let useUpstash = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

let ratelimit: any = null
if (useUpstash) {
  try {
    // Lazy import to avoid bundling in environments where not needed
    const { Ratelimit } = require('@upstash/ratelimit')
    const { Redis } = require('@upstash/redis')
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    ratelimit = {
      auth: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(RATE_LIMITS.auth.requests, `${RATE_LIMITS.auth.window / 1000} s`) }),
      tracks: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(RATE_LIMITS.tracks.requests, `${RATE_LIMITS.tracks.window / 1000} s`) }),
      upload: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(RATE_LIMITS.upload.requests, `${RATE_LIMITS.upload.window / 1000} s`) }),
      nft: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(RATE_LIMITS.nft.requests, `${RATE_LIMITS.nft.window / 1000} s`) }),
      general: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(RATE_LIMITS.general.requests, `${RATE_LIMITS.general.window / 1000} s`) }),
    }
  } catch {
    useUpstash = false
  }
}

// In-memory store for fallback
const memoryStore = new Map<string, { count: number; resetTime: number }>()

export async function checkRateLimit(
  identifier: string,
  endpoint: string = 'general'
): Promise<RateLimitResult> {
  const limits = RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS] || RATE_LIMITS.general
  const key = `${endpoint}:${identifier}`

  if (useUpstash && ratelimit) {
    const limiter = ratelimit[endpoint] || ratelimit.general
    const { success, limit, remaining, reset } = await limiter.limit(key)
    return { success, limit, remaining, reset }
  }

  // In-memory fallback
  const now = Date.now()
  const current = memoryStore.get(key)
  if (!current || now > current.resetTime) {
    memoryStore.set(key, { count: 1, resetTime: now + limits.window })
    return { success: true, limit: limits.requests, remaining: limits.requests - 1, reset: now + limits.window }
  }
  if (current.count >= limits.requests) {
    return { success: false, limit: limits.requests, remaining: 0, reset: current.resetTime }
  }
  current.count++
  memoryStore.set(key, current)
  return { success: true, limit: limits.requests, remaining: limits.requests - current.count, reset: current.resetTime }
}