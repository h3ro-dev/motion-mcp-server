import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { RateLimiter } from '../../../src/lib/rate-limiter.js';
import Database from 'better-sqlite3';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  let db: Database.Database;

  beforeEach(() => {
    // Use in-memory database for tests
    rateLimiter = new RateLimiter(':memory:');
    db = (rateLimiter as any).db;
  });

  afterEach(() => {
    rateLimiter.close();
  });

  describe('initialization', () => {
    it('should create rate_limit_log table', () => {
      const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='rate_limit_log'").get();
      expect(tableInfo).toBeDefined();
      expect(tableInfo.sql).toContain('CREATE TABLE');
      expect(tableInfo.sql).toContain('timestamp');
    });
  });

  describe('checkRateLimit', () => {
    it('should allow requests within rate limit', async () => {
      const result = await rateLimiter.checkRateLimit();
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(11); // 12 - 1
      expect(result.resetIn).toBeLessThanOrEqual(180);
    });

    it('should track multiple requests', async () => {
      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        await rateLimiter.checkRateLimit();
      }

      const result = await rateLimiter.checkRateLimit();
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(6); // 12 - 6
    });

    it('should block requests when limit exceeded', async () => {
      // Make 12 requests (the limit)
      for (let i = 0; i < 12; i++) {
        await rateLimiter.checkRateLimit();
      }

      const result = await rateLimiter.checkRateLimit();
      
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.resetIn).toBeGreaterThan(0);
      expect(result.resetIn).toBeLessThanOrEqual(180);
    });

    it('should reset after time window', async () => {
      // Make 12 requests
      for (let i = 0; i < 12; i++) {
        await rateLimiter.checkRateLimit();
      }

      // Mock time passing (3 minutes + 1 second)
      const futureTime = Date.now() + 181000;
      jest.spyOn(Date, 'now').mockReturnValue(futureTime);

      const result = await rateLimiter.checkRateLimit();
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(11);

      jest.restoreAllMocks();
    });
  });

  describe('cleanup', () => {
    it('should clean up old entries', async () => {
      // Add some requests
      for (let i = 0; i < 5; i++) {
        await rateLimiter.checkRateLimit();
      }

      // Mock time passing (4 minutes)
      const futureTime = Date.now() + 240000;
      jest.spyOn(Date, 'now').mockReturnValue(futureTime);

      // Add a new request (triggers cleanup)
      await rateLimiter.checkRateLimit();

      // Check that old entries were cleaned up
      const count = db.prepare('SELECT COUNT(*) as count FROM rate_limit_log').get() as { count: number };
      expect(count.count).toBe(1); // Only the new request should remain

      jest.restoreAllMocks();
    });
  });

  describe('getStats', () => {
    it('should return current rate limit statistics', async () => {
      // Make some requests
      for (let i = 0; i < 3; i++) {
        await rateLimiter.checkRateLimit();
      }

      const stats = rateLimiter.getStats();
      
      expect(stats.totalRequests).toBe(3);
      expect(stats.windowRequests).toBe(3);
      expect(stats.remaining).toBe(9);
      expect(stats.resetIn).toBeLessThanOrEqual(180);
    });
  });

  describe('reset', () => {
    it('should clear all rate limit data', async () => {
      // Make some requests
      for (let i = 0; i < 5; i++) {
        await rateLimiter.checkRateLimit();
      }

      rateLimiter.reset();

      const stats = rateLimiter.getStats();
      expect(stats.totalRequests).toBe(0);
      expect(stats.windowRequests).toBe(0);
      expect(stats.remaining).toBe(12);
    });
  });
});