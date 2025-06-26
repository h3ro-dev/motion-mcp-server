import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import axios from 'axios';
import { MotionClient } from '../../../src/lib/motion-client.js';
import { RateLimiter } from '../../../src/lib/rate-limiter.js';
import { mockTask, mockListResponse, mockErrorResponse } from '../../fixtures/motion-responses.js';

jest.mock('axios');
jest.mock('../../../src/lib/rate-limiter.js');

describe('MotionClient', () => {
  let client: MotionClient;
  let mockAxios: jest.MockedObjectDeep<typeof axios>;
  let mockRateLimiter: jest.MockedObject<RateLimiter>;

  beforeEach(() => {
    mockAxios = axios as jest.MockedObjectDeep<typeof axios>;
    mockRateLimiter = {
      checkRateLimit: jest.fn().mockResolvedValue({ allowed: true, remaining: 10, resetIn: 180 }),
      close: jest.fn(),
      getStats: jest.fn(),
      reset: jest.fn(),
    } as any;

    (RateLimiter as jest.MockedClass<typeof RateLimiter>).mockImplementation(() => mockRateLimiter);

    // Reset environment
    process.env['MOTION_API_KEY'] = 'test-api-key';
    process.env['MOTION_BASE_URL'] = 'https://api.motion.com/v1';

    client = new MotionClient();
  });

  describe('request method', () => {
    it('should make successful GET request', async () => {
      mockAxios.request.mockResolvedValueOnce({ data: mockTask });

      const result = await client.request('/tasks/123');

      expect(mockRateLimiter.checkRateLimit).toHaveBeenCalled();
      expect(mockAxios.request).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.motion.com/v1/tasks/123',
        headers: {
          'X-API-Key': 'test-api-key',
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockTask);
    });

    it('should handle rate limit blocking', async () => {
      mockRateLimiter.checkRateLimit.mockResolvedValueOnce({ 
        allowed: false, 
        remaining: 0, 
        resetIn: 120 
      });

      await expect(client.request('/tasks')).rejects.toThrow('Rate limit exceeded');
      expect(mockAxios.request).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      mockAxios.request.mockRejectedValueOnce({
        response: {
          status: 429,
          data: mockErrorResponse,
        },
      });

      await expect(client.request('/tasks')).rejects.toThrow('Motion API error');
    });

    it('should handle network errors', async () => {
      mockAxios.request.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.request('/tasks')).rejects.toThrow('Network error');
    });
  });

  describe('HTTP methods', () => {
    it('should make GET request', async () => {
      mockAxios.request.mockResolvedValueOnce({ data: mockListResponse });

      const result = await client.get('/tasks', { status: 'TODO' });

      expect(mockAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          params: { status: 'TODO' },
        })
      );
      expect(result).toEqual(mockListResponse);
    });

    it('should make POST request', async () => {
      mockAxios.request.mockResolvedValueOnce({ data: mockTask });

      const payload = { name: 'New Task', priority: 'HIGH' };
      const result = await client.post('/tasks', payload);

      expect(mockAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          data: payload,
        })
      );
      expect(result).toEqual(mockTask);
    });

    it('should make PATCH request', async () => {
      mockAxios.request.mockResolvedValueOnce({ data: mockTask });

      const updates = { status: 'DONE' };
      const result = await client.patch('/tasks/123', updates);

      expect(mockAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
          data: updates,
        })
      );
      expect(result).toEqual(mockTask);
    });

    it('should make DELETE request', async () => {
      mockAxios.request.mockResolvedValueOnce({ data: { success: true } });

      const result = await client.delete('/tasks/123');

      expect(mockAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(result).toEqual({ success: true });
    });

    it('should make PUT request', async () => {
      mockAxios.request.mockResolvedValueOnce({ data: mockTask });

      const replacement = { name: 'Updated Task', status: 'IN_PROGRESS' };
      const result = await client.put('/tasks/123', replacement);

      expect(mockAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          data: replacement,
        })
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('error handling', () => {
    it('should extract error message from Motion API response', async () => {
      mockAxios.request.mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            error: {
              message: 'Invalid task ID format',
            },
          },
        },
      });

      try {
        await client.request('/tasks/invalid');
      } catch (error: any) {
        expect(error.message).toContain('Invalid task ID format');
        expect(error.status).toBe(400);
      }
    });

    it('should handle non-standard error responses', async () => {
      mockAxios.request.mockRejectedValueOnce({
        response: {
          status: 500,
          data: 'Internal Server Error',
        },
      });

      try {
        await client.request('/tasks');
      } catch (error: any) {
        expect(error.message).toContain('Motion API error (500)');
      }
    });
  });
});