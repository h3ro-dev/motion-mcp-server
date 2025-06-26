import { z } from 'zod';
import { MotionClient } from '../../lib/motion-client.js';
import { Task, CreateTaskRequest } from '../../types/motion.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const createTaskSchema = z.object({
  name: z.string().describe('Name of the task'),
  workspaceId: z.string().describe('ID of the workspace where the task will be created'),
  description: z.string().optional().describe('HTML description of the task'),
  dueDate: z.string().optional().describe('Due date in ISO 8601 format'),
  duration: z.union([
    z.literal('NONE'),
    z.literal('REMINDER'),
    z.number().positive()
  ]).optional().describe('Duration in minutes, or "NONE" or "REMINDER"'),
  status: z.string().optional().describe('Status name (must exist in workspace)'),
  autoScheduled: z.object({
    startDate: z.string().optional().describe('Start date in ISO 8601 format'),
    deadlineType: z.enum(['HARD', 'SOFT', 'NONE']).optional().describe('Type of deadline'),
    schedule: z.string().optional().describe('Schedule name'),
  }).optional().describe('Auto-scheduling configuration'),
  projectId: z.string().optional().describe('ID of the project to add the task to'),
  labels: z.array(z.string()).optional().describe('Array of label names'),
  priority: z.enum(['ASAP', 'HIGH', 'MEDIUM', 'LOW']).optional().describe('Task priority'),
  assigneeId: z.string().optional().describe('ID of the user to assign the task to'),
});

export type CreateTaskParams = z.infer<typeof createTaskSchema>;

export const createTaskTool: Tool = {
  name: 'motion_create_task',
  description: 'Create a new task in Motion',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Name of the task' },
      workspaceId: { type: 'string', description: 'ID of the workspace where the task will be created' },
      description: { type: 'string', description: 'HTML description of the task' },
      dueDate: { type: 'string', description: 'Due date in ISO 8601 format' },
      duration: { 
        oneOf: [
          { type: 'string', enum: ['NONE', 'REMINDER'] },
          { type: 'number', minimum: 1 }
        ],
        description: 'Duration in minutes, or "NONE" or "REMINDER"' 
      },
      status: { type: 'string', description: 'Status name (must exist in workspace)' },
      autoScheduled: {
        type: 'object',
        properties: {
          startDate: { type: 'string', description: 'Start date in ISO 8601 format' },
          deadlineType: { type: 'string', enum: ['HARD', 'SOFT', 'NONE'], description: 'Type of deadline' },
          schedule: { type: 'string', description: 'Schedule name' },
        },
        description: 'Auto-scheduling configuration'
      },
      projectId: { type: 'string', description: 'ID of the project to add the task to' },
      labels: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Array of label names' 
      },
      priority: { type: 'string', enum: ['ASAP', 'HIGH', 'MEDIUM', 'LOW'], description: 'Task priority' },
      assigneeId: { type: 'string', description: 'ID of the user to assign the task to' },
    },
    required: ['name', 'workspaceId'],
  },
};

export async function createTask(params: CreateTaskParams, client: MotionClient): Promise<Task> {
  const request: CreateTaskRequest = {
    name: params.name,
    workspaceId: params.workspaceId,
  };

  if (params.description) request.description = params.description;
  if (params.dueDate) request.dueDate = params.dueDate;
  if (params.duration) request.duration = params.duration;
  if (params.status) request.status = params.status;
  if (params.autoScheduled) {
    request.autoScheduled = {
      startDate: params.autoScheduled.startDate,
      deadlineType: params.autoScheduled.deadlineType,
      schedule: params.autoScheduled.schedule,
    };
  }
  if (params.projectId) request.projectId = params.projectId;
  if (params.labels) request.labels = params.labels;
  if (params.priority) request.priority = params.priority;
  if (params.assigneeId) request.assigneeId = params.assigneeId;

  return await client.post<Task>('/tasks', request);
}