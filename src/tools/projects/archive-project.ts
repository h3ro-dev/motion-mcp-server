import { z } from 'zod';
import { MotionClient } from '../../lib/motion-client.js';
import { Project } from '../../types/motion.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const archiveProjectSchema = z.object({
  projectId: z.string().describe('ID of the project to archive'),
});

export type ArchiveProjectParams = z.infer<typeof archiveProjectSchema>;

export const archiveProjectTool: Tool = {
  name: 'motion_archive_project',
  description: 'Archive a project in Motion',
  inputSchema: {
    type: 'object',
    properties: {
      projectId: { type: 'string', description: 'ID of the project to archive' },
    },
    required: ['projectId'],
  },
};

export async function archiveProject(params: ArchiveProjectParams, client: MotionClient): Promise<Project> {
  return await client.post<Project>(`/projects/${params.projectId}/archive`);
}