/**
 * Rate Limiting Middleware
 * 
 * Implements per-IP and per-API-key rate limiting
 * Phase 2: Week 2 Implementation
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitBucket {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private buckets = new Map<string, RateLimitBucket>();
  private readonly WINDOW_MS = 3600000; // 1 hour
  private readonly LIMIT_PER_IP = 100; // Per IP
  private readonly LIMIT_PER_KEY = 10000; // Per API key

  cleanup(): void {
    const now = Date.now();
    for (const [key, bucket] of this.buckets.entries()) {
      if (bucket.resetTime < now) {
        this.buckets.delete(key);
      }
    }
  }

  check(identifier: string, limit: number): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    let bucket = this.buckets.get(identifier);

    if (!bucket || bucket.resetTime < now) {
      bucket = {
        count: 0,
        resetTime: now + this.WINDOW_MS
      };
      this.buckets.set(identifier, bucket);
    }

    const allowed = bucket.count < limit;
    const remaining = Math.max(0, limit - bucket.count - 1);

    if (allowed) {
      bucket.count++;
    }

    return {
      allowed,
      remaining,
      resetTime: bucket.resetTime
    };
  }
}

const limiter = new RateLimiter();

// Cleanup every 5 minutes
setInterval(() => limiter.cleanup(), 5 * 60 * 1000);

export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = (req.headers.authorization || '').replace('Bearer ', '');
  const ip = req.ip || 'unknown';

  // Determine identifier and limit based on API key
  let identifier: string;
  let limit: number;

  if (apiKey && apiKey.startsWith('sk-paradigm-')) {
    identifier = `key:${apiKey}`;
    limit = 10000; // Standard tier
  } else {
    identifier = `ip:${ip}`;
    limit = 100; // Free tier
  }

  const result = limiter.check(identifier, limit);

  // Set rate limit headers
  res.set('X-RateLimit-Limit', limit.toString());
  res.set('X-RateLimit-Remaining', result.remaining.toString());
  res.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString());

  if (!result.allowed) {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        details: {
          limit,
          reset_time: new Date(result.resetTime).toISOString()
        }
      }
    });
    return;
  }

  next();
};
