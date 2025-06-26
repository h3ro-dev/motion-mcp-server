import { z } from 'zod';
import { MotionClient } from '../../lib/motion-client.js';
import { Workspace, ListResponse } from '../../types/motion.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const listWorkspacesSchema = z.object({
  cursor: z.string().optional().describe('Pagination cursor from previous request'),
});

export type ListWorkspacesParams = z.infer<typeof listWorkspacesSchema>;

export const listWorkspacesTool: Tool = {
  name: 'motion_list_workspaces',
  description: 'List all workspaces accessible to the authenticated user',
  inputSchema: {
    type: 'object',
    properties: {
      cursor: { type: 'string', description: 'Pagination cursor from previous request' },
    },
  },
};

export async function listWorkspaces(params: ListWorkspacesParams, client: MotionClient): Promise<ListResponse<Workspace>> {
  const queryParams: any = {};
  if (params.cursor) queryParams.cursor = params.cursor;

  const response = await client.get<{ meta: any; workspaces: Workspace[] }>('/workspaces', queryParams);
  
  return {
    meta: response.meta,
    workspaces: response.workspaces,
  };
}