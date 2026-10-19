/**
 * Rate Limiter Utility for Unique Studios
 *
 * Uses Upstash Redis for distributed rate limiting.
 * Falls back to in-memory store if Redis is not configured.
 *
 * Limits: 5 order checkout attempts per 10 minutes per IP
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Check if Redis credentials are available
const hasRedis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN

let redis: Redis | null = null
let ratelimit: Ratelimit | null = null

if (hasRedis) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })

  ratelimit = new Ratelimit({
    redis,
    // 5 requests per 10 minutes (600 seconds)
    limiter: Ratelimit.slidingWindow(5, '10 m'),
    analytics: true,
    prefix: 'ratelimit:checkout',
  })
}

// In-memory fallback for development/preview environments
const memoryStore = new Map<string, { count: number; resetAt: number }>()

/**
 * Check rate limit for a given identifier (IP address or user ID)
 *
 * @param identifier - Unique identifier (typically IP address)
 * @returns Rate limit result with success status, limit, remaining, and reset time
 */
export async function checkRateLimit(identifier: string): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
}> {
  // If Redis is configured, use Upstash
  if (ratelimit) {
    return ratelimit.limit(identifier)
  }

  // Fallback: In-memory sliding window (10 minutes)
  const now = Date.now()
  const windowMs = 10 * 60 * 1000 // 10 minutes
  const maxRequests = 5

  const entry = memoryStore.get(identifier)

  if (!entry || now > entry.resetAt) {
    // First request or window expired
    memoryStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    })
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: now + windowMs,
    }
  }

  if (entry.count >= maxRequests) {
    // Rate limited
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: entry.resetAt,
    }
  }

  // Increment counter
  entry.count++
  memoryStore.set(identifier, entry)

  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - entry.count,
    reset: entry.resetAt,
  }
}

/**
 * Extract client IP from request headers
 * Works with Vercel, Cloudflare, and standard proxies
 */
export function getClientIp(request: Request): string {
  // Vercel
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  // Cloudflare
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) {
    return cfIp
  }

  // Standard headers
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback
  return 'unknown'
}

/**
 * Rate limit middleware for Next.js API routes
 * Returns null if allowed, or a NextResponse with 429 if rate limited
 */
export async function rateLimitMiddleware(
  request: Request
): Promise<{ success: boolean; headers: Record<string, string> } | null> {
  const ip = getClientIp(request)
  const result = await checkRateLimit(ip)

  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.reset / 1000).toString(),
  }

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000)
    return {
      success: false,
      headers: {
        ...headers,
        'Retry-After': retryAfter.toString(),
        'Content-Type': 'application/json',
      },
    }
  }

  return { success: true, headers }
}