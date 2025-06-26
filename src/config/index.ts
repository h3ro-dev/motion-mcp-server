import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load environment variables
dotenv.config();

// Configuration schema
const configSchema = z.object({
  motion: z.object({
    apiKey: z.string().min(1, 'MOTION_API_KEY is required'),
    baseUrl: z.string().url().default('https://api.usemotion.com/v1'),
  }),
  rateLimit: z.object({
    windowMs: z.number().positive().default(180000), // 3 minutes
    maxRequests: z.number().positive().default(12),
  }),
  database: z.object({
    path: z.string().default(path.join(process.cwd(), '.data', 'rate-limit.sqlite')),
  }),
  debug: z.boolean().default(false),
});

// Parse and validate configuration
const parseConfig = () => {
  try {
    return configSchema.parse({
      motion: {
        apiKey: process.env['MOTION_API_KEY'],
        baseUrl: process.env['MOTION_BASE_URL'],
      },
      rateLimit: {
        windowMs: process.env['RATE_LIMIT_WINDOW_MS'] ? parseInt(process.env['RATE_LIMIT_WINDOW_MS']) : undefined,
        maxRequests: process.env['RATE_LIMIT_MAX_REQUESTS'] ? parseInt(process.env['RATE_LIMIT_MAX_REQUESTS']) : undefined,
      },
      database: {
        path: process.env['DATABASE_PATH'],
      },
      debug: process.env['DEBUG'] === 'true',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Configuration validation failed:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

export const config = parseConfig();

export type Config = typeof config;