import Database from 'better-sqlite3';

interface RateLimitStats {
  totalRequests: number;
  windowRequests: number;
  remaining: number;
  resetIn: number; // seconds
}

export class RateLimiter {
  public db: Database.Database;
  private windowMs: number;
  private maxRequests: number;

  constructor(dbPath: string = ':memory:', options?: { windowMs?: number; maxRequests?: number }) {
    this.windowMs = options?.windowMs ?? 180000; // 3 minutes
    this.maxRequests = options?.maxRequests ?? 12;

    this.db = new Database(dbPath);
    this.initialize();
  }

  private initialize(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS rate_limit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL
      )
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_rate_limit_log_timestamp
      ON rate_limit_log(timestamp)
    `);
  }

  private cleanupOldEntries(now: number): void {
    const cutoff = now - this.windowMs;
    this.db.prepare('DELETE FROM rate_limit_log WHERE timestamp < ?').run(cutoff);
  }

  async checkRateLimit(): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    const now = Date.now();

    // Cleanup first to keep the table small
    this.cleanupOldEntries(now);

    const windowStart = now - this.windowMs;
    const countRow = this.db
      .prepare('SELECT COUNT(*) as count FROM rate_limit_log WHERE timestamp > ?')
      .get(windowStart) as { count: number };

    const currentCount = countRow.count;
    const remainingBefore = Math.max(0, this.maxRequests - currentCount);

    if (currentCount >= this.maxRequests) {
      // Reset in is the remaining time in the current window (approximation)
      const resetIn = Math.ceil((this.windowMs - (now - windowStart)) / 1000);
      return { allowed: false, remaining: 0, resetIn };
    }

    // Record this request
    this.db.prepare('INSERT INTO rate_limit_log (timestamp) VALUES (?)').run(now);

    const remainingAfter = Math.max(0, remainingBefore - 1);
    const resetIn = Math.ceil((this.windowMs - (now - windowStart)) / 1000);

    return { allowed: true, remaining: remainingAfter, resetIn };
  }

  getStats(): RateLimitStats {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const totalRow = this.db
      .prepare('SELECT COUNT(*) as count FROM rate_limit_log')
      .get() as { count: number };

    const windowRow = this.db
      .prepare('SELECT COUNT(*) as count FROM rate_limit_log WHERE timestamp > ?')
      .get(windowStart) as { count: number };

    const windowRequests = windowRow.count;
    const remaining = Math.max(0, this.maxRequests - windowRequests);
    const resetIn = Math.ceil((this.windowMs - (now - windowStart)) / 1000);

    return {
      totalRequests: totalRow.count,
      windowRequests,
      remaining,
      resetIn,
    };
  }

  reset(): void {
    this.db.exec('DELETE FROM rate_limit_log');
  }

  close(): void {
    this.db.close();
  }
}