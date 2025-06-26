import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { getConfig, validateConfig } from '../../../src/config/index.js';

describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getConfig', () => {
    it('should return valid configuration with API key', () => {
      process.env['MOTION_API_KEY'] = 'test-api-key-123';
      
      const config = getConfig();
      
      expect(config).toBeDefined();
      expect(config.motion.apiKey).toBe('test-api-key-123');
      expect(config.motion.baseUrl).toBe('https://api.usemotion.com/v1');
    });

    it('should throw error when API key is missing', () => {
      delete process.env['MOTION_API_KEY'];
      
      expect(() => getConfig()).toThrow('MOTION_API_KEY is required');
    });

    it('should use custom base URL when provided', () => {
      process.env['MOTION_API_KEY'] = 'test-key';
      process.env['MOTION_BASE_URL'] = 'https://custom.motion.api/v2';
      
      const config = getConfig();
      
      expect(config.motion.baseUrl).toBe('https://custom.motion.api/v2');
    });
  });

  describe('validateConfig', () => {
    it('should validate correct configuration', () => {
      const validConfig = {
        motion: {
          apiKey: 'test-key',
          baseUrl: 'https://api.motion.com/v1',
        },
      };

      expect(() => validateConfig(validConfig)).not.toThrow();
    });

    it('should reject invalid configuration', () => {
      const invalidConfigs = [
        { motion: { apiKey: '', baseUrl: 'https://api.motion.com' } },
        { motion: { apiKey: 'key', baseUrl: 'not-a-url' } },
        { motion: { baseUrl: 'https://api.motion.com' } },
        {},
      ];

      invalidConfigs.forEach(config => {
        expect(() => validateConfig(config)).toThrow();
      });
    });
  });
});