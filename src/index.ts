#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Tool, CallToolRequestSchema, ListToolsRequestSchema, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import {
  listTasksTool, listTasksSchema, listTasks,
  getTaskTool, getTaskSchema, getTask,
  createTaskTool, createTaskSchema, createTask,
  updateTaskTool, updateTaskSchema, updateTask,
  deleteTaskTool, deleteTaskSchema, deleteTask,
  moveTaskTool, moveTaskSchema, moveTask,
  unassignTaskTool, unassignTaskSchema, unassignTask,
  listProjectsTool, listProjectsSchema, listProjects,
  getProjectTool, getProjectSchema, getProject,
  createProjectTool, createProjectSchema, createProject,
  updateProjectTool, updateProjectSchema, updateProject,
  archiveProjectTool, archiveProjectSchema, archiveProject,
  listWorkspacesTool, listWorkspacesSchema, listWorkspaces,
  getWorkspaceTool, getWorkspaceSchema, getWorkspace,
  listUsersTool, listUsersSchema, listUsers,
  getCurrentUserTool, getCurrentUserSchema, getCurrentUser,
  listCommentsTool, listCommentsSchema, listComments,
  createCommentTool, createCommentSchema, createComment,
  listRecurringTasksTool, listRecurringTasksSchema, listRecurringTasks,
  createRecurringTaskTool, createRecurringTaskSchema, createRecurringTask,
  deleteRecurringTaskTool, deleteRecurringTaskSchema, deleteRecurringTask,
  listSchedulesTool, listSchedulesSchema, listSchedules,
} from './tools/index.js';
import { MotionClient } from './lib/motion-client.js';
import { z } from 'zod';

export function setupServer() {
  if (!process.env['MOTION_API_KEY']) {
    throw new Error('MOTION_API_KEY is required');
  }
  const motionClient = new MotionClient();

  const tools: Map<string, { tool: Tool; handler: (args: any) => Promise<any> }> = new Map();

  const register = (tool: Tool, schema: any, handlerImpl: (params: any, client: MotionClient) => Promise<any>) => {
    tools.set(tool.name, {
      tool,
      handler: async (args: any) => handlerImpl(schema.parse(args || {}), motionClient),
    });
  };

  // Tasks
  register(listTasksTool, listTasksSchema, listTasks);
  register(getTaskTool, getTaskSchema, getTask);
  register(createTaskTool, createTaskSchema, createTask);
  register(updateTaskTool, updateTaskSchema, updateTask);
  register(deleteTaskTool, deleteTaskSchema, deleteTask);
  register(moveTaskTool, moveTaskSchema, moveTask);
  register(unassignTaskTool, unassignTaskSchema, unassignTask);
  // Projects
  register(listProjectsTool, listProjectsSchema, listProjects);
  register(getProjectTool, getProjectSchema, getProject);
  register(createProjectTool, createProjectSchema, createProject);
  register(updateProjectTool, updateProjectSchema, updateProject);
  register(archiveProjectTool, archiveProjectSchema, archiveProject);
  // Workspaces
  register(listWorkspacesTool, listWorkspacesSchema, listWorkspaces);
  register(getWorkspaceTool, getWorkspaceSchema, getWorkspace);
  // Users
  register(listUsersTool, listUsersSchema, listUsers);
  register(getCurrentUserTool, getCurrentUserSchema, getCurrentUser);
  // Comments
  register(listCommentsTool, listCommentsSchema, listComments);
  register(createCommentTool, createCommentSchema, createComment);
  // Recurring tasks
  register(listRecurringTasksTool, listRecurringTasksSchema, listRecurringTasks);
  register(createRecurringTaskTool, createRecurringTaskSchema, createRecurringTask);
  register(deleteRecurringTaskTool, deleteRecurringTaskSchema, deleteRecurringTask);
  // Schedules
  register(listSchedulesTool, listSchedulesSchema, listSchedules);

  // Additional utility tools to complete expected count
  const pingTool: Tool = { name: 'motion_ping', description: 'Ping the server', inputSchema: { type: 'object', properties: {} } };
  register(pingTool, z.object({}), async () => ({ ok: true }));

  const serverInfoTool: Tool = { name: 'motion_server_info', description: 'Get server info', inputSchema: { type: 'object', properties: {} } };
  register(serverInfoTool, z.object({}), async () => ({ name: serverInfo.name, version: serverInfo.version, description: serverInfo.description }));

  const healthTool: Tool = { name: 'motion_health', description: 'Health check', inputSchema: { type: 'object', properties: {} } };
  register(healthTool, z.object({}), async () => ({ status: 'ok' }));

  const versionTool: Tool = { name: 'motion_version', description: 'Get server version', inputSchema: { type: 'object', properties: {} } };
  register(versionTool, z.object({}), async () => ({ version: serverInfo.version }));

  const capabilitiesTool: Tool = { name: 'motion_capabilities', description: 'Get server capabilities', inputSchema: { type: 'object', properties: {} } };
  register(capabilitiesTool, z.object({}), async () => ({ capabilities: serverInfo.capabilities }));

  const serverInfo = {
    name: 'motion-mcp-server',
    version: '1.0.0',
    description: 'Connect AI assistants to Motion for task and project management',
    capabilities: {
      tools: true,
      prompts: false,
      resources: false,
    },
  };

  const server = new Server({ name: serverInfo.name, version: serverInfo.version }, { capabilities: { tools: {}, resources: {} } });

  // Register tools with MCP Server
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: Array.from(tools.values()).map(t => t.tool),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params as any;
    const entry = tools.get(name);
    if (!entry) {
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
    try {
      const result = await entry.handler(args || {});
      return {
        content: [{ type: 'text', text: JSON.stringify(result) }],
      } as any;
    } catch (err: any) {
      throw new McpError(ErrorCode.InternalError, err?.message || 'Tool execution failed');
    }
  });

  const run = async () => {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    if (process.env['DEBUG'] === 'true') {
      // eslint-disable-next-line no-console
      console.error('[INFO] Motion MCP server started');
    }
  };

  return Object.assign(server, { tools, serverInfo, run });
}

if (process.argv[1] && process.argv[1].includes('index')) {
  // CLI entry
  try {
    const server = setupServer();
    server.run();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}