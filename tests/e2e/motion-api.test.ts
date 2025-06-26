import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { MotionClient } from '../../src/lib/motion-client.js';

// End-to-end tests that actually call Motion API
// These are skipped by default - run with MOTION_TEST_LIVE=true
const SKIP_LIVE_TESTS = process.env['MOTION_TEST_LIVE'] !== 'true';

describe('Motion API E2E Tests', () => {
  if (SKIP_LIVE_TESTS) {
    it.skip('Live tests skipped - set MOTION_TEST_LIVE=true to run', () => {});
    return;
  }

  let client: MotionClient;
  let testWorkspaceId: string;
  let testTaskId: string;

  beforeAll(() => {
    // Ensure we have a real API key for live tests
    if (!process.env['MOTION_API_KEY'] || process.env['MOTION_API_KEY'] === 'test-api-key') {
      throw new Error('Real MOTION_API_KEY required for E2E tests');
    }

    client = new MotionClient();
  });

  afterAll(() => {
    // Cleanup any test data if needed
  });

  describe('Workspaces', () => {
    it('should list workspaces', async () => {
      const response = await client.get('/workspaces');
      
      expect(response).toHaveProperty('workspaces');
      expect(Array.isArray(response.workspaces)).toBe(true);
      
      if (response.workspaces.length > 0) {
        testWorkspaceId = response.workspaces[0].id;
        const workspace = response.workspaces[0];
        
        expect(workspace).toHaveProperty('id');
        expect(workspace).toHaveProperty('name');
        expect(workspace.id).toBeValidMotionId();
      }
    });
  });

  describe('Tasks', () => {
    it('should create a task', async () => {
      if (!testWorkspaceId) {
        console.warn('No workspace available for task creation');
        return;
      }

      const newTask = {
        name: `E2E Test Task ${Date.now()}`,
        workspaceId: testWorkspaceId,
        description: 'Created by Motion MCP Server E2E tests',
        priority: 'MEDIUM',
      };

      const task = await client.post('/tasks', newTask);
      
      expect(task).toHaveProperty('id');
      expect(task.name).toBe(newTask.name);
      expect(task.workspaceId).toBe(testWorkspaceId);
      expect(task.id).toBeValidMotionId();
      
      testTaskId = task.id;
    });

    it('should list tasks', async () => {
      const response = await client.get('/tasks');
      
      expect(response).toHaveProperty('tasks');
      expect(Array.isArray(response.tasks)).toBe(true);
      
      if (testTaskId) {
        const createdTask = response.tasks.find(t => t.id === testTaskId);
        expect(createdTask).toBeDefined();
      }
    });

    it('should get a specific task', async () => {
      if (!testTaskId) {
        console.warn('No test task available');
        return;
      }

      const task = await client.get(`/tasks/${testTaskId}`);
      
      expect(task).toHaveProperty('id');
      expect(task.id).toBe(testTaskId);
      expect(task.name).toContain('E2E Test Task');
    });

    it('should update a task', async () => {
      if (!testTaskId) {
        console.warn('No test task available');
        return;
      }

      const updates = {
        status: 'IN_PROGRESS',
        priority: 'HIGH',
      };

      const updatedTask = await client.patch(`/tasks/${testTaskId}`, updates);
      
      expect(updatedTask.id).toBe(testTaskId);
      expect(updatedTask.status).toBe('IN_PROGRESS');
      expect(updatedTask.priority).toBe('HIGH');
    });

    it('should delete a task', async () => {
      if (!testTaskId) {
        console.warn('No test task available');
        return;
      }

      const result = await client.delete(`/tasks/${testTaskId}`);
      
      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
      
      // Verify deletion
      try {
        await client.get(`/tasks/${testTaskId}`);
        fail('Task should have been deleted');
      } catch (error: any) {
        expect(error.status).toBe(404);
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limits gracefully', async () => {
      // Make requests up to the limit
      const promises = [];
      for (let i = 0; i < 15; i++) {
        promises.push(
          client.get('/tasks').catch(err => ({ error: err }))
        );
      }

      const results = await Promise.all(promises);
      
      // Some requests should succeed
      const successful = results.filter(r => !r.error);
      expect(successful.length).toBeGreaterThan(0);
      
      // Later requests should be rate limited
      const rateLimited = results.filter(r => 
        r.error?.message?.includes('Rate limit')
      );
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
});