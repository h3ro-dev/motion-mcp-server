import { z } from 'zod';
import { MotionClient } from '../../lib/motion-client.js';
import { Schedule, ListResponse } from '../../types/motion.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const listSchedulesSchema = z.object({
  workspaceId: z.string().describe('ID of the workspace to list schedules from'),
  cursor: z.string().optional().describe('Pagination cursor from previous request'),
});

export type ListSchedulesParams = z.infer<typeof listSchedulesSchema>;

export const listSchedulesTool: Tool = {
  name: 'motion_list_schedules',
  description: 'List all schedules in a workspace',
  inputSchema: {
    type: 'object',
    properties: {
      workspaceId: { type: 'string', description: 'ID of the workspace to list schedules from' },
      cursor: { type: 'string', description: 'Pagination cursor from previous request' },
    },
    required: ['workspaceId'],
  },
};

export async function listSchedules(params: ListSchedulesParams, client: MotionClient): Promise<ListResponse<Schedule>> {
  const queryParams: any = {
    workspaceId: params.workspaceId,
  };
  
  if (params.cursor) queryParams.cursor = params.cursor;

  const response = await client.get<{ meta: any; schedules: Schedule[] }>('/schedules', queryParams);
  
  return {
    meta: response.meta,
    schedules: response.schedules,
  };
}