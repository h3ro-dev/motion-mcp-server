import { z } from 'zod';
import { MotionClient } from '../../lib/motion-client.js';
import { RecurringTask, CreateRecurringTaskRequest } from '../../types/motion.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const createRecurringTaskSchema = z.object({
  name: z.string().describe('Name of the recurring task'),
  workspaceId: z.string().describe('ID of the workspace'),
  description: z.string().optional().describe('HTML description'),
  frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY']).describe('Recurrence frequency'),
  startingOn: z.string().describe('Starting date in ISO 8601 format'),
  idealTime: z.string().optional().describe('Ideal time of day in HH:MM format'),
  schedule: z.object({
    dayOfWeek: z.number().min(0).max(6).optional().describe('Day of week (0=Sunday, 6=Saturday)'),
    dayOfMonth: z.number().min(1).max(31).optional().describe('Day of month'),
    month: z.number().min(1).max(12).optional().describe('Month (1-12)'),
  }).optional().describe('Schedule details based on frequency'),
  projectId: z.string().optional().describe('Project ID'),
  labels: z.array(z.string()).optional().describe('Labels'),
  priority: z.enum(['ASAP', 'HIGH', 'MEDIUM', 'LOW']).optional().describe('Priority'),
  assigneeId: z.string().optional().describe('Assignee ID'),
  duration: z.union([
    z.literal('NONE'),
    z.literal('REMINDER'),
    z.number().positive()
  ]).optional().describe('Duration in minutes'),
});

export type CreateRecurringTaskParams = z.infer<typeof createRecurringTaskSchema>;

export const createRecurringTaskTool: Tool = {
  name: 'motion_create_recurring_task',
  description: 'Create a new recurring task template',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Name of the recurring task' },
      workspaceId: { type: 'string', description: 'ID of the workspace' },
      description: { type: 'string', description: 'HTML description' },
      frequency: { 
        type: 'string', 
        enum: ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY'],
        description: 'Recurrence frequency' 
      },
      startingOn: { type: 'string', description: 'Starting date in ISO 8601 format' },
      idealTime: { type: 'string', description: 'Ideal time of day in HH:MM format' },
      schedule: {
        type: 'object',
        properties: {
          dayOfWeek: { type: 'number', minimum: 0, maximum: 6, description: 'Day of week (0=Sunday, 6=Saturday)' },
          dayOfMonth: { type: 'number', minimum: 1, maximum: 31, description: 'Day of month' },
          month: { type: 'number', minimum: 1, maximum: 12, description: 'Month (1-12)' },
        },
        description: 'Schedule details based on frequency',
      },
      projectId: { type: 'string', description: 'Project ID' },
      labels: { type: 'array', items: { type: 'string' }, description: 'Labels' },
      priority: { type: 'string', enum: ['ASAP', 'HIGH', 'MEDIUM', 'LOW'], description: 'Priority' },
      assigneeId: { type: 'string', description: 'Assignee ID' },
      duration: { 
        oneOf: [
          { type: 'string', enum: ['NONE', 'REMINDER'] },
          { type: 'number', minimum: 1 }
        ],
        description: 'Duration in minutes' 
      },
    },
    required: ['name', 'workspaceId', 'frequency', 'startingOn'],
  },
};

export async function createRecurringTask(params: CreateRecurringTaskParams, client: MotionClient): Promise<RecurringTask> {
  const request: CreateRecurringTaskRequest = {
    name: params.name,
    workspaceId: params.workspaceId,
    frequency: params.frequency,
    startingOn: params.startingOn,
  };

  if (params.description) request.description = params.description;
  if (params.idealTime) request.idealTime = params.idealTime;
  if (params.schedule) request.schedule = params.schedule;
  if (params.projectId) request.projectId = params.projectId;
  if (params.labels) request.labels = params.labels;
  if (params.priority) request.priority = params.priority;
  if (params.assigneeId) request.assigneeId = params.assigneeId;
  if (params.duration) request.duration = params.duration;

  return await client.post<RecurringTask>('/recurring-tasks', request);
}