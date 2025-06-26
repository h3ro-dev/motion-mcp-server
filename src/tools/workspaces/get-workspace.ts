import { z } from 'zod';
import { MotionClient } from '../../lib/motion-client.js';
import { Workspace } from '../../types/motion.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const getWorkspaceSchema = z.object({
  workspaceId: z.string().describe('The ID of the workspace to retrieve'),
});

export type GetWorkspaceParams = z.infer<typeof getWorkspaceSchema>;

export const getWorkspaceTool: Tool = {
  name: 'motion_get_workspace',
  description: 'Get detailed information about a specific workspace',
  inputSchema: {
    type: 'object',
    properties: {
      workspaceId: { type: 'string', description: 'The ID of the workspace to retrieve' },
    },
    required: ['workspaceId'],
  },
};

export async function getWorkspace(params: GetWorkspaceParams, client: MotionClient): Promise<Workspace> {
  return await client.get<Workspace>(`/workspaces/${params.workspaceId}`);
}