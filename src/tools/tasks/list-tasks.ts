import { z } from 'zod';
import { MotionClient } from '../../lib/motion-client.js';
import { Task, ListResponse } from '../../types/motion.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const listTasksSchema = z.object({
  workspaceId: z.string().optional().describe('Filter tasks by workspace ID'),
  projectId: z.string().optional().describe('Filter tasks by project ID'),
  assigneeId: z.string().optional().describe('Filter tasks by assignee ID'),
  status: z.array(z.string()).optional().describe('Filter tasks by status (can specify multiple)'),
  includeAllStatuses: z.boolean().optional().describe('Include tasks of all statuses'),
  label: z.string().optional().describe('Filter tasks by label'),
  name: z.string().optional().describe('Filter tasks by name (case-insensitive)'),
  cursor: z.string().optional().describe('Pagination cursor from previous request'),
});

export type ListTasksParams = z.infer<typeof listTasksSchema>;

export const listTasksTool: Tool = {
  name: 'motion_list_tasks',
  description: 'List tasks from Motion with optional filtering by workspace, project, assignee, status, label, or name',
  inputSchema: {
    type: 'object',
    properties: {
      workspaceId: { type: 'string', description: 'Filter tasks by workspace ID' },
      projectId: { type: 'string', description: 'Filter tasks by project ID' },
      assigneeId: { type: 'string', description: 'Filter tasks by assignee ID' },
      status: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Filter tasks by status (can specify multiple)' 
      },
      includeAllStatuses: { type: 'boolean', description: 'Include tasks of all statuses' },
      label: { type: 'string', description: 'Filter tasks by label' },
      name: { type: 'string', description: 'Filter tasks by name (case-insensitive)' },
      cursor: { type: 'string', description: 'Pagination cursor from previous request' },
    },
  },
};

export async function listTasks(params: ListTasksParams, client: MotionClient): Promise<ListResponse<Task>> {
  const queryParams: any = {};
  
  if (params.workspaceId) queryParams.workspaceId = params.workspaceId;
  if (params.projectId) queryParams.projectId = params.projectId;
  if (params.assigneeId) queryParams.assigneeId = params.assigneeId;
  if (params.status && params.status.length > 0) queryParams.status = params.status;
  if (params.includeAllStatuses !== undefined) queryParams.includeAllStatuses = params.includeAllStatuses;
  if (params.label) queryParams.label = params.label;
  if (params.name) queryParams.name = params.name;
  if (params.cursor) queryParams.cursor = params.cursor;

  const response = await client.get<{ meta: any; tasks: Task[] }>('/tasks', queryParams);
  
  return {
    meta: response.meta,
    tasks: response.tasks,
  };
}