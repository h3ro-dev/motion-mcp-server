import { z } from 'zod';
import { MotionClient } from '../../lib/motion-client.js';
import { Project } from '../../types/motion.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const getProjectSchema = z.object({
  projectId: z.string().describe('The ID of the project to retrieve'),
});

export type GetProjectParams = z.infer<typeof getProjectSchema>;

export const getProjectTool: Tool = {
  name: 'motion_get_project',
  description: 'Get detailed information about a specific project',
  inputSchema: {
    type: 'object',
    properties: {
      projectId: { type: 'string', description: 'The ID of the project to retrieve' },
    },
    required: ['projectId'],
  },
};

export async function getProject(params: GetProjectParams, client: MotionClient): Promise<Project> {
  return await client.get<Project>(`/projects/${params.projectId}`);
}