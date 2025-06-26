import { z } from 'zod';
import { MotionClient } from '../../lib/motion-client.js';
import { RecurringTask, ListResponse } from '../../types/motion.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const listRecurringTasksSchema = z.object({
  workspaceId: z.string().optional().describe('Filter recurring tasks by workspace ID'),
  projectId: z.string().optional().describe('Filter recurring tasks by project ID'),
  assigneeId: z.string().optional().describe('Filter recurring tasks by assignee ID'),
  cursor: z.string().optional().describe('Pagination cursor from previous request'),
});

export type ListRecurringTasksParams = z.infer<typeof listRecurringTasksSchema>;

export const listRecurringTasksTool: Tool = {
  name: 'motion_list_recurring_tasks',
  description: 'List recurring task templates',
  inputSchema: {
    type: 'object',
    properties: {
      workspaceId: { type: 'string', description: 'Filter recurring tasks by workspace ID' },
      projectId: { type: 'string', description: 'Filter recurring tasks by project ID' },
      assigneeId: { type: 'string', description: 'Filter recurring tasks by assignee ID' },
      cursor: { type: 'string', description: 'Pagination cursor from previous request' },
    },
  },
};

export async function listRecurringTasks(params: ListRecurringTasksParams, client: MotionClient): Promise<ListResponse<RecurringTask>> {
  const queryParams: any = {};
  
  if (params.workspaceId) queryParams.workspaceId = params.workspaceId;
  if (params.projectId) queryParams.projectId = params.projectId;
  if (params.assigneeId) queryParams.assigneeId = params.assigneeId;
  if (params.cursor) queryParams.cursor = params.cursor;

  const response = await client.get<{ meta: any; recurringTasks: RecurringTask[] }>('/recurring-tasks', queryParams);
  
  return {
    meta: response.meta,
    recurringTasks: response.recurringTasks,
  };
}