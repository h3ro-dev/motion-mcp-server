import { z } from 'zod';
import { MotionClient } from '../../lib/motion-client.js';
import { Task, UpdateTaskRequest } from '../../types/motion.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const updateTaskSchema = z.object({
  taskId: z.string().describe('ID of the task to update'),
  name: z.string().optional().describe('New name for the task'),
  description: z.string().optional().describe('New HTML description'),
  dueDate: z.string().optional().describe('New due date in ISO 8601 format'),
  duration: z.union([
    z.literal('NONE'),
    z.literal('REMINDER'),
    z.number().positive()
  ]).optional().describe('New duration in minutes, or "NONE" or "REMINDER"'),
  status: z.string().optional().describe('New status name'),
  autoScheduled: z.union([
    z.object({
      startDate: z.string().optional(),
      deadlineType: z.enum(['HARD', 'SOFT', 'NONE']).optional(),
      schedule: z.string().optional(),
    }),
    z.null()
  ]).optional().describe('Auto-scheduling config (set to null to disable)'),
  projectId: z.string().optional().describe('New project ID'),
  labels: z.array(z.string()).optional().describe('New label list'),
  priority: z.enum(['ASAP', 'HIGH', 'MEDIUM', 'LOW']).optional().describe('New priority'),
  assigneeId: z.string().optional().describe('New assignee ID'),
});

export type UpdateTaskParams = z.infer<typeof updateTaskSchema>;

export const updateTaskTool: Tool = {
  name: 'motion_update_task',
  description: 'Update an existing task in Motion',
  inputSchema: {
    type: 'object',
    properties: {
      taskId: { type: 'string', description: 'ID of the task to update' },
      name: { type: 'string', description: 'New name for the task' },
      description: { type: 'string', description: 'New HTML description' },
      dueDate: { type: 'string', description: 'New due date in ISO 8601 format' },
      duration: { 
        oneOf: [
          { type: 'string', enum: ['NONE', 'REMINDER'] },
          { type: 'number', minimum: 1 }
        ],
        description: 'New duration in minutes, or "NONE" or "REMINDER"' 
      },
      status: { type: 'string', description: 'New status name' },
      autoScheduled: {
        oneOf: [
          {
            type: 'object',
            properties: {
              startDate: { type: 'string' },
              deadlineType: { type: 'string', enum: ['HARD', 'SOFT', 'NONE'] },
              schedule: { type: 'string' },
            },
          },
          { type: 'null' }
        ],
        description: 'Auto-scheduling config (set to null to disable)'
      },
      projectId: { type: 'string', description: 'New project ID' },
      labels: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'New label list' 
      },
      priority: { type: 'string', enum: ['ASAP', 'HIGH', 'MEDIUM', 'LOW'], description: 'New priority' },
      assigneeId: { type: 'string', description: 'New assignee ID' },
    },
    required: ['taskId'],
  },
};

export async function updateTask(params: UpdateTaskParams, client: MotionClient): Promise<Task> {
  const { taskId, ...updateData } = params;
  const request: UpdateTaskRequest = {};

  // Only include fields that were provided
  if (updateData.name !== undefined) request.name = updateData.name;
  if (updateData.description !== undefined) request.description = updateData.description;
  if (updateData.dueDate !== undefined) request.dueDate = updateData.dueDate;
  if (updateData.duration !== undefined) request.duration = updateData.duration;
  if (updateData.status !== undefined) request.status = updateData.status;
  if (updateData.autoScheduled !== undefined) {
    if (updateData.autoScheduled === null) {
      request.autoScheduled = null;
    } else {
      request.autoScheduled = {
        startDate: updateData.autoScheduled.startDate,
        deadlineType: updateData.autoScheduled.deadlineType,
        schedule: updateData.autoScheduled.schedule,
      };
    }
  }
  if (updateData.projectId !== undefined) request.projectId = updateData.projectId;
  if (updateData.labels !== undefined) request.labels = updateData.labels;
  if (updateData.priority !== undefined) request.priority = updateData.priority;
  if (updateData.assigneeId !== undefined) request.assigneeId = updateData.assigneeId;

  return await client.patch<Task>(`/tasks/${taskId}`, request);
}