import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { listTasks, listTasksSchema } from '../../../../src/tools/tasks/list-tasks.js';
import { MotionClient } from '../../../../src/lib/motion-client.js';
import { mockListResponse } from '../../../fixtures/motion-responses.js';

jest.mock('../../../../src/lib/motion-client.js');

describe('listTasks', () => {
  let mockClient: jest.MockedObject<MotionClient>;

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      put: jest.fn(),
      request: jest.fn(),
    } as any;
  });

  describe('schema validation', () => {
    it('should accept valid parameters', () => {
      const validParams = [
        { workspaceId: 'ws-123' },
        { projectId: 'proj-456' },
        { assigneeId: 'user-789' },
        { status: ['TODO', 'IN_PROGRESS'] },
        { includeAllStatuses: true },
        { label: 'urgent' },
        { name: 'Review' },
        { cursor: 'next-page-token' },
        {}, // All params are optional
      ];

      validParams.forEach(params => {
        expect(() => listTasksSchema.parse(params)).not.toThrow();
      });
    });

    it('should reject invalid parameters', () => {
      const invalidParams = [
        { workspaceId: 123 }, // Should be string
        { status: 'TODO' }, // Should be array
        { includeAllStatuses: 'true' }, // Should be boolean
      ];

      invalidParams.forEach(params => {
        expect(() => listTasksSchema.parse(params)).toThrow();
      });
    });
  });

  describe('API interaction', () => {
    it('should call Motion API with no filters', async () => {
      mockClient.get.mockResolvedValueOnce(mockListResponse);

      const result = await listTasks({}, mockClient);

      expect(mockClient.get).toHaveBeenCalledWith('/tasks', {});
      expect(result).toEqual(mockListResponse);
    });

    it('should pass single filter to API', async () => {
      mockClient.get.mockResolvedValueOnce(mockListResponse);

      const result = await listTasks({ workspaceId: 'ws-123' }, mockClient);

      expect(mockClient.get).toHaveBeenCalledWith('/tasks', {
        workspaceId: 'ws-123',
      });
      expect(result).toEqual(mockListResponse);
    });

    it('should pass multiple filters to API', async () => {
      mockClient.get.mockResolvedValueOnce(mockListResponse);

      const params = {
        workspaceId: 'ws-123',
        projectId: 'proj-456',
        status: ['TODO', 'IN_PROGRESS'],
        label: 'urgent',
        name: 'Review',
      };

      const result = await listTasks(params, mockClient);

      expect(mockClient.get).toHaveBeenCalledWith('/tasks', params);
      expect(result).toEqual(mockListResponse);
    });

    it('should handle pagination cursor', async () => {
      mockClient.get.mockResolvedValueOnce(mockListResponse);

      const result = await listTasks({ cursor: 'next-page' }, mockClient);

      expect(mockClient.get).toHaveBeenCalledWith('/tasks', {
        cursor: 'next-page',
      });
      expect(result).toEqual(mockListResponse);
    });

    it('should handle API errors', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(listTasks({}, mockClient)).rejects.toThrow('API Error');
    });

    it('should handle boolean includeAllStatuses parameter', async () => {
      mockClient.get.mockResolvedValueOnce(mockListResponse);

      await listTasks({ includeAllStatuses: true }, mockClient);

      expect(mockClient.get).toHaveBeenCalledWith('/tasks', {
        includeAllStatuses: true,
      });
    });

    it('should filter undefined parameters', async () => {
      mockClient.get.mockResolvedValueOnce(mockListResponse);

      const params = {
        workspaceId: 'ws-123',
        projectId: undefined,
        status: [],
        label: undefined,
      };

      await listTasks(params, mockClient);

      expect(mockClient.get).toHaveBeenCalledWith('/tasks', {
        workspaceId: 'ws-123',
        // Empty status array should not be included
        // Undefined values should not be included
      });
    });
  });

  describe('response format', () => {
    it('should return meta and tasks from response', async () => {
      const customResponse = {
        meta: {
          pageSize: 50,
          nextCursor: 'token-123',
          hasMore: false,
        },
        tasks: [
          { id: '1', name: 'Task 1' },
          { id: '2', name: 'Task 2' },
        ],
      };

      mockClient.get.mockResolvedValueOnce(customResponse);

      const result = await listTasks({}, mockClient);

      expect(result).toHaveProperty('meta');
      expect(result).toHaveProperty('tasks');
      expect(result.meta).toEqual(customResponse.meta);
      expect(result.tasks).toEqual(customResponse.tasks);
    });
  });
});