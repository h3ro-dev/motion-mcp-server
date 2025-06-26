import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from '../config/index.js';

export class RateLimitDatabase {
  private db: Database.Database;

  constructor() {
    // Ensure the directory exists
    const dbDir = path.dirname(config.database.path);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new Database(config.database.path);
    this.initialize();
  }

  private initialize() {
    // Create the requests table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        endpoint TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index for faster queries
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_requests_timestamp 
      ON requests(timestamp)
    `);

    // Prepare statements for better performance
    this.prepareStatements();
  }

  private prepareStatements() {
    // These will be used frequently, so prepare them
    this.insertStmt = this.db.prepare(
      'INSERT INTO requests (endpoint, timestamp) VALUES (?, ?)'
    );
    
    this.countStmt = this.db.prepare(
      'SELECT COUNT(*) as count FROM requests WHERE timestamp > ?'
    );
    
    this.cleanupStmt = this.db.prepare(
      'DELETE FROM requests WHERE timestamp < ?'
    );
  }

  private insertStmt!: Database.Statement;
  private countStmt!: Database.Statement;
  private cleanupStmt!: Database.Statement;

  addRequest(endpoint: string): void {
    const timestamp = Date.now();
    this.insertStmt.run(endpoint, timestamp);
  }

  getRequestCount(windowStart: number): number {
    const result = this.countStmt.get(windowStart) as { count: number };
    return result.count;
  }

  cleanup(before: number): void {
    this.cleanupStmt.run(before);
  }

  close(): void {
    this.db.close();
  }
}