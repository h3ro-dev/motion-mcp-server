import { z } from 'zod';
import { MotionClient } from '../../lib/motion-client.js';
import { User, ListResponse } from '../../types/motion.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const listUsersSchema = z.object({
  workspaceId: z.string().describe('ID of the workspace to list users from'),
  cursor: z.string().optional().describe('Pagination cursor from previous request'),
});

export type ListUsersParams = z.infer<typeof listUsersSchema>;

export const listUsersTool: Tool = {
  name: 'motion_list_users',
  description: 'List all users in a workspace',
  inputSchema: {
    type: 'object',
    properties: {
      workspaceId: { type: 'string', description: 'ID of the workspace to list users from' },
      cursor: { type: 'string', description: 'Pagination cursor from previous request' },
    },
    required: ['workspaceId'],
  },
};

export async function listUsers(params: ListUsersParams, client: MotionClient): Promise<ListResponse<User>> {
  const queryParams: any = {
    workspaceId: params.workspaceId,
  };
  
  if (params.cursor) queryParams.cursor = params.cursor;

  const response = await client.get<{ meta: any; users: User[] }>('/users', queryParams);
  
  return {
    meta: response.meta,
    users: response.users,
  };
}