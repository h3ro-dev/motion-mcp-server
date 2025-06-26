import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { setupServer } from '../../src/index.js';
import { MotionClient } from '../../src/lib/motion-client.js';

jest.mock('../../src/lib/motion-client.js');
jest.mock('@modelcontextprotocol/sdk/server/stdio.js');

describe('Motion MCP Server Integration', () => {
  let server: Server;
  let mockTransport: jest.MockedObject<StdioServerTransport>;
  let mockClient: jest.MockedObject<MotionClient>;

  beforeEach(() => {
    // Setup mocks
    mockTransport = {
      start: jest.fn(),
      close: jest.fn(),
      send: jest.fn(),
    } as any;

    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      put: jest.fn(),
      request: jest.fn(),
    } as any;

    (MotionClient as jest.MockedClass<typeof MotionClient>).mockImplementation(() => mockClient);
    (StdioServerTransport as jest.MockedClass<typeof StdioServerTransport>).mockImplementation(() => mockTransport);

    // Create server
    server = setupServer();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Server Info', () => {
    it('should provide correct server information', () => {
      const serverInfo = (server as any).serverInfo;
      
      expect(serverInfo.name).toBe('motion-mcp-server');
      expect(serverInfo.version).toBe('1.0.0');
      expect(serverInfo.description).toBe('Connect AI assistants to Motion for task and project management');
      expect(serverInfo.capabilities).toEqual({
        tools: true,
        prompts: false,
        resources: false,
      });
    });
  });

  describe('Tool Registration', () => {
    it('should register all Motion tools', async () => {
      const tools = (server as any).tools;
      
      expect(tools.size).toBe(27); // Total number of tools
      
      // Check key tools are registered
      const expectedTools = [
        'motion_list_tasks',
        'motion_get_task',
        'motion_create_task',
        'motion_update_task',
        'motion_delete_task',
        'motion_list_projects',
        'motion_create_project',
        'motion_list_workspaces',
        'motion_list_users',
        'motion_list_comments',
      ];

      expectedTools.forEach(toolName => {
        expect(tools.has(toolName)).toBe(true);
      });
    });
  });

  describe('Tool Execution', () => {
    it('should execute list tasks tool', async () => {
      const mockResponse = {
        meta: { pageSize: 20, hasMore: false },
        tasks: [{ id: '1', name: 'Test Task' }],
      };
      mockClient.get.mockResolvedValueOnce(mockResponse);

      const tools = (server as any).tools;
      const listTasksTool = tools.get('motion_list_tasks');
      
      expect(listTasksTool).toBeDefined();
      
      // Execute the tool handler
      const handler = listTasksTool.handler;
      const result = await handler({ workspaceId: 'ws-123' });

      expect(mockClient.get).toHaveBeenCalledWith('/tasks', { workspaceId: 'ws-123' });
      expect(result.tasks).toEqual(mockResponse.tasks);
    });

    it('should execute create task tool', async () => {
      const newTask = { id: 'task-new', name: 'New Task', status: 'TODO' };
      mockClient.post.mockResolvedValueOnce(newTask);

      const tools = (server as any).tools;
      const createTaskTool = tools.get('motion_create_task');
      
      const result = await createTaskTool.handler({
        name: 'New Task',
        workspaceId: 'ws-123',
      });

      expect(mockClient.post).toHaveBeenCalledWith('/tasks', {
        name: 'New Task',
        workspaceId: 'ws-123',
      });
      expect(result).toEqual(newTask);
    });

    it('should handle tool execution errors', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('API Error'));

      const tools = (server as any).tools;
      const listTasksTool = tools.get('motion_list_tasks');
      
      await expect(listTasksTool.handler({})).rejects.toThrow('API Error');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing Motion API key', () => {
      delete process.env['MOTION_API_KEY'];
      
      expect(() => setupServer()).toThrow();
    });

    it('should handle invalid tool arguments', async () => {
      const tools = (server as any).tools;
      const createTaskTool = tools.get('motion_create_task');
      
      // Missing required 'name' field
      await expect(createTaskTool.handler({ workspaceId: 'ws-123' }))
        .rejects.toThrow();
    });
  });

  describe('Transport Communication', () => {
    it('should start transport when running server', async () => {
      const runPromise = (server as any).run();
      
      // Allow event loop to process
      await new Promise(resolve => setImmediate(resolve));
      
      expect(mockTransport.start).toHaveBeenCalled();
    });
  });
});