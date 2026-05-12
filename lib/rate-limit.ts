/**
 * Rate Limiting Utility
 * 
 * Provides rate limiting functionality using Upstash Redis
 * 
 * Requirements:
 * - 25.3: Rate limiting per user
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Redis client for rate limiting
 * Uses Upstash Redis for serverless-friendly rate limiting
 */
const redis = new Redis({
  url: process.env.REDIS_URL || '',
  token: process.env.REDIS_TOKEN || '',
});

/**
 * Rate limiter for AI generation endpoint
 * 
 * Limits: 10 requests per hour per user
 * 
 * Requirements:
 * - 25.3: Rate limiting per user (10 requests per hour)
 */
export const aiGenerationRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
  prefix: 'ratelimit:ai-generation',
});

/**
 * Rate limiter for general API endpoints
 * 
 * Limits: 100 requests per minute per user
 */
export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'ratelimit:api',
});

/**
 * Check rate limit for a user
 * 
 * @param identifier - User identifier (user ID or IP address)
 * @param limiter - Rate limiter to use
 * @returns Rate limit result with success status and metadata
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit = apiRateLimit
) {
  try {
    const result = await limiter.limit(identifier);
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    
    // Fail open - allow request if rate limiting service is down
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now(),
    };
  }
}

/**
 * Get rate limit headers for HTTP response
 * 
 * @param result - Rate limit result
 * @returns Headers object with rate limit information
 */
export function getRateLimitHeaders(result: {
  limit: number;
  remaining: number;
  reset: number;
}) {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  };
}
