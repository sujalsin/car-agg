/**
 * Rate Limiting for CARAG API
 * 
 * Implements simple in-memory rate limiting for API routes.
 * For production, consider using Redis or similar for distributed rate limiting.
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory store for rate limiting (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
    // Maximum number of requests
    limit: number;
    // Time window in seconds
    window: number;
}

// Default rate limits for different endpoints
export const RATE_LIMITS = {
    // Vehicle data - more strict since it's expensive to fetch
    vehicles: { limit: 30, window: 60 }, // 30 requests per minute
    
    // Search endpoints
    search: { limit: 60, window: 60 }, // 60 requests per minute
    
    // News - less strict
    news: { limit: 120, window: 60 }, // 120 requests per minute
    
    // VIN decode
    vin: { limit: 30, window: 60 }, // 30 requests per minute
    
    // Compare
    compare: { limit: 20, window: 60 }, // 20 requests per minute
    
    // Default for other endpoints
    default: { limit: 100, window: 60 }, // 100 requests per minute
};

// Clean up expired entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetTime <= now) {
            rateLimitStore.delete(key);
        }
    }
}, 60000); // Clean up every minute

/**
 * Get client IP from request
 */
export function getClientIP(request: Request): string {
    // Try to get IP from various headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    
    if (forwarded) {
        // X-Forwarded-For can contain multiple IPs, take the first one
        return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
        return realIP;
    }
    
    // Fallback to a hash of user agent (not ideal but better than nothing)
    const userAgent = request.headers.get('user-agent') || 'unknown';
    return `ua-${userAgent.slice(0, 20)}`;
}

/**
 * Check rate limit for a key
 */
export function checkRateLimit(
    key: string,
    config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = rateLimitStore.get(key);
    
    if (!entry || entry.resetTime <= now) {
        // First request or window expired, create new entry
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + config.window * 1000,
        });
        return {
            allowed: true,
            remaining: config.limit - 1,
            resetTime: now + config.window * 1000,
        };
    }
    
    // Window still active
    if (entry.count >= config.limit) {
        // Rate limit exceeded
        return {
            allowed: false,
            remaining: 0,
            resetTime: entry.resetTime,
        };
    }
    
    // Increment count
    entry.count++;
    return {
        allowed: true,
        remaining: config.limit - entry.count,
        resetTime: entry.resetTime,
    };
}

/**
 * Generate rate limit headers
 */
export function getRateLimitHeaders(
    limit: number,
    remaining: number,
    resetTime: number
): Record<string, string> {
    return {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
    };
}

/**
 * Create rate limit response
 */
export function createRateLimitResponse(
    resetTime: number
): Response {
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
    
    return new Response(
        JSON.stringify({
            error: 'Rate limit exceeded',
            message: `Too many requests. Please try again in ${retryAfter} seconds.`,
            retryAfter,
        }),
        {
            status: 429,
            headers: {
                'Content-Type': 'application/json',
                'Retry-After': retryAfter.toString(),
            },
        }
    );
}
