import { NextRequest, NextResponse } from "next/server";

// In-memory rate limit store (consider using Redis for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;
  max: number;
  skipPaths?: string[];
}

export function createRateLimiter(config: RateLimitConfig) {
  return (req: NextRequest) => {
    const path = req.nextUrl.pathname;
    
    // Skip rate limiting for certain paths
    if (config.skipPaths?.some(skipPath => path.startsWith(skipPath))) {
      return null;
    }

    // Get client identifier (IP or session)
  // NextRequest doesn't expose `ip` on the server runtime; prefer x-forwarded-for or x-real-ip
  const ipHeader = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
  const clientId = ipHeader ? ipHeader.split(',')[0].trim() : "anonymous";
    const key = `${clientId}:${path}`;
    
    const now = Date.now();
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    
    // Clean up old entries
    if (entry && entry.resetTime < now) {
      entry = undefined;
    }
    
    if (!entry) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
      };
      rateLimitStore.set(key, entry);
    }
    
    // Increment count
    entry.count++;
    
    // Check if limit exceeded
    if (entry.count > config.max) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return NextResponse.json(
        {
          success: false,
          message: "Too many requests, please try again later.",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": config.max.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(entry.resetTime).toISOString(),
          },
        }
      );
    }
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      const cutoff = now - config.windowMs * 2;
      for (const [k, v] of rateLimitStore.entries()) {
        if (v.resetTime < cutoff) {
          rateLimitStore.delete(k);
        }
      }
    }
    
    return null;
  };
}

// Default rate limiter for API routes
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  skipPaths: ["/api/auth/session", "/api/auth/csrf"],
});

// Stricter rate limiter for auth endpoints
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  skipPaths: [],
});
