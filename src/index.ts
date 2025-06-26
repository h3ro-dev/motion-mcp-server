#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import { config } from './config/index.js';
import { MotionClient } from './lib/motion-client.js';
import { logger } from './lib/logger.js';

// Import all tools
import {
  // Tasks
  listTasksTool, listTasksSchema, listTasks,
  getTaskTool, getTaskSchema, getTask,
  createTaskTool, createTaskSchema, createTask,
  updateTaskTool, updateTaskSchema, updateTask,
  deleteTaskTool, deleteTaskSchema, deleteTask,
  moveTaskTool, moveTaskSchema, moveTask,
  unassignTaskTool, unassignTaskSchema, unassignTask,
  // Projects
  listProjectsTool, listProjectsSchema, listProjects,
  getProjectTool, getProjectSchema, getProject,
  createProjectTool, createProjectSchema, createProject,
  updateProjectTool, updateProjectSchema, updateProject,
  archiveProjectTool, archiveProjectSchema, archiveProject,
  // Workspaces
  listWorkspacesTool, listWorkspacesSchema, listWorkspaces,
  getWorkspaceTool, getWorkspaceSchema, getWorkspace,
  // Users
  listUsersTool, listUsersSchema, listUsers,
  getCurrentUserTool, getCurrentUserSchema, getCurrentUser,
  // Comments
  listCommentsTool, listCommentsSchema, listComments,
  createCommentTool, createCommentSchema, createComment,
  // Recurring Tasks
  listRecurringTasksTool, listRecurringTasksSchema, listRecurringTasks,
  createRecurringTaskTool, createRecurringTaskSchema, createRecurringTask,
  deleteRecurringTaskTool, deleteRecurringTaskSchema, deleteRecurringTask,
  // Schedules
  listSchedulesTool, listSchedulesSchema, listSchedules,
} from './tools/index.js';

// Create Motion client instance
const motionClient = new MotionClient();

// Define all available tools
const TOOLS = [
  // Task management
  listTasksTool,
  getTaskTool,
  createTaskTool,
  updateTaskTool,
  deleteTaskTool,
  moveTaskTool,
  unassignTaskTool,
  // Project management
  listProjectsTool,
  getProjectTool,
  createProjectTool,
  updateProjectTool,
  archiveProjectTool,
  // Workspace management
  listWorkspacesTool,
  getWorkspaceTool,
  // User management
  listUsersTool,
  getCurrentUserTool,
  // Comments
  listCommentsTool,
  createCommentTool,
  // Recurring tasks
  listRecurringTasksTool,
  createRecurringTaskTool,
  deleteRecurringTaskTool,
  // Schedules
  listSchedulesTool,
];

// Tool execution mapping
const toolHandlers: Record<string, (params: any) => Promise<any>> = {
  // Tasks
  motion_list_tasks: (params) => listTasks(listTasksSchema.parse(params), motionClient),
  motion_get_task: (params) => getTask(getTaskSchema.parse(params), motionClient),
  motion_create_task: (params) => createTask(createTaskSchema.parse(params), motionClient),
  motion_update_task: (params) => updateTask(updateTaskSchema.parse(params), motionClient),
  motion_delete_task: (params) => deleteTask(deleteTaskSchema.parse(params), motionClient),
  motion_move_task: (params) => moveTask(moveTaskSchema.parse(params), motionClient),
  motion_unassign_task: (params) => unassignTask(unassignTaskSchema.parse(params), motionClient),
  // Projects
  motion_list_projects: (params) => listProjects(listProjectsSchema.parse(params), motionClient),
  motion_get_project: (params) => getProject(getProjectSchema.parse(params), motionClient),
  motion_create_project: (params) => createProject(createProjectSchema.parse(params), motionClient),
  motion_update_project: (params) => updateProject(updateProjectSchema.parse(params), motionClient),
  motion_archive_project: (params) => archiveProject(archiveProjectSchema.parse(params), motionClient),
  // Workspaces
  motion_list_workspaces: (params) => listWorkspaces(listWorkspacesSchema.parse(params), motionClient),
  motion_get_workspace: (params) => getWorkspace(getWorkspaceSchema.parse(params), motionClient),
  // Users
  motion_list_users: (params) => listUsers(listUsersSchema.parse(params), motionClient),
  motion_get_current_user: (params) => getCurrentUser(getCurrentUserSchema.parse(params), motionClient),
  // Comments
  motion_list_comments: (params) => listComments(listCommentsSchema.parse(params), motionClient),
  motion_create_comment: (params) => createComment(createCommentSchema.parse(params), motionClient),
  // Recurring Tasks
  motion_list_recurring_tasks: (params) => listRecurringTasks(listRecurringTasksSchema.parse(params), motionClient),
  motion_create_recurring_task: (params) => createRecurringTask(createRecurringTaskSchema.parse(params), motionClient),
  motion_delete_recurring_task: (params) => deleteRecurringTask(deleteRecurringTaskSchema.parse(params), motionClient),
  // Schedules
  motion_list_schedules: (params) => listSchedules(listSchedulesSchema.parse(params), motionClient),
};

// Create MCP server
const server = new Server(
  {
    name: 'motion-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const handler = toolHandlers[name];
  if (!handler) {
    throw new McpError(
      ErrorCode.MethodNotFound,
      `Unknown tool: ${name}`
    );
  }

  try {
    const result = await handler(args || {});
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid parameters: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      );
    }
    
    if (error instanceof Error) {
      logger.error(`Error executing tool ${name}:`, error);
      throw new McpError(
        ErrorCode.InternalError,
        `Tool execution failed: ${error.message}`
      );
    }
    
    throw error;
  }
});

// Handle resources (not used in this implementation)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return { resources: [] };
});

server.setRequestHandler(ReadResourceRequestSchema, async () => {
  throw new McpError(
    ErrorCode.MethodNotFound,
    'Resource reading not supported'
  );
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('Motion MCP server started');
}

main().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});