import { RateLimitDatabase } from './database.js';
import { config } from '../config/index.js';

export class RateLimiter {
  private db: RateLimitDatabase;
  private windowMs: number;
  private maxRequests: number;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.db = new RateLimitDatabase();
    this.windowMs = config.rateLimit.windowMs;
    this.maxRequests = config.rateLimit.maxRequests;

    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  async checkLimit(endpoint: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
    retryAfter?: number;
  }> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Count requests in the current window
    const count = this.db.getRequestCount(windowStart);
    const remaining = Math.max(0, this.maxRequests - count);
    const resetAt = now + this.windowMs;

    if (count >= this.maxRequests) {
      // Calculate when the oldest request in the window will expire
      const retryAfter = Math.ceil(this.windowMs / 1000); // Convert to seconds
      
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfter
      };
    }

    // Add this request
    this.db.addRequest(endpoint);

    return {
      allowed: true,
      remaining: remaining - 1,
      resetAt
    };
  }

  private cleanup(): void {
    const cutoff = Date.now() - (this.windowMs * 2); // Keep some buffer
    this.db.cleanup(cutoff);
  }

  close(): void {
    clearInterval(this.cleanupInterval);
    this.db.close();
  }
}