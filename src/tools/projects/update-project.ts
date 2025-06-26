import { z } from 'zod';
import { MotionClient } from '../../lib/motion-client.js';
import { Project, UpdateProjectRequest } from '../../types/motion.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const updateProjectSchema = z.object({
  projectId: z.string().describe('ID of the project to update'),
  name: z.string().optional().describe('New name for the project'),
  description: z.string().optional().describe('New description for the project'),
  status: z.array(z.object({
    name: z.string().describe('Status name'),
    isDefaultStatus: z.boolean().optional().describe('Whether this is the default status'),
    isResolvedStatus: z.boolean().optional().describe('Whether this is a resolved status'),
  })).optional().describe('Updated project statuses'),
});

export type UpdateProjectParams = z.infer<typeof updateProjectSchema>;

export const updateProjectTool: Tool = {
  name: 'motion_update_project',
  description: 'Update an existing project in Motion',
  inputSchema: {
    type: 'object',
    properties: {
      projectId: { type: 'string', description: 'ID of the project to update' },
      name: { type: 'string', description: 'New name for the project' },
      description: { type: 'string', description: 'New description for the project' },
      status: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Status name' },
            isDefaultStatus: { type: 'boolean', description: 'Whether this is the default status' },
            isResolvedStatus: { type: 'boolean', description: 'Whether this is a resolved status' },
          },
          required: ['name'],
        },
        description: 'Updated project statuses',
      },
    },
    required: ['projectId'],
  },
};

export async function updateProject(params: UpdateProjectParams, client: MotionClient): Promise<Project> {
  const { projectId, ...updateData } = params;
  const request: UpdateProjectRequest = {};

  if (updateData.name !== undefined) request.name = updateData.name;
  if (updateData.description !== undefined) request.description = updateData.description;
  if (updateData.status !== undefined) request.status = updateData.status;

  return await client.patch<Project>(`/projects/${projectId}`, request);
}