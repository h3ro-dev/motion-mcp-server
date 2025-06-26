import { jest } from '@jest/globals';

// Set test environment variables
process.env['MOTION_API_KEY'] = 'test-api-key';
process.env['NODE_ENV'] = 'test';
process.env['DATABASE_PATH'] = ':memory:'; // Use in-memory SQLite for tests

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Add custom matchers
expect.extend({
  toBeValidMotionId(received: string) {
    const pass = /^[a-zA-Z0-9-_]+$/.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid Motion ID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid Motion ID`,
        pass: false,
      };
    }
  },
  toBeValidISODate(received: string) {
    const pass = !isNaN(Date.parse(received));
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ISO date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ISO date`,
        pass: false,
      };
    }
  },
});

// Type declarations for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidMotionId(): R;
      toBeValidISODate(): R;
    }
  }
}