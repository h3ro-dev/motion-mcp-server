import { z } from 'zod';
import { MotionClient } from '../../lib/motion-client.js';
import { Project, CreateProjectRequest } from '../../types/motion.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const createProjectSchema = z.object({
  name: z.string().describe('Name of the project'),
  workspaceId: z.string().describe('ID of the workspace where the project will be created'),
  description: z.string().optional().describe('Description of the project'),
  status: z.array(z.object({
    name: z.string().describe('Status name'),
    isDefaultStatus: z.boolean().optional().describe('Whether this is the default status'),
    isResolvedStatus: z.boolean().optional().describe('Whether this is a resolved status'),
  })).optional().describe('Project statuses (will use workspace defaults if not provided)'),
});

export type CreateProjectParams = z.infer<typeof createProjectSchema>;

export const createProjectTool: Tool = {
  name: 'motion_create_project',
  description: 'Create a new project in Motion',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Name of the project' },
      workspaceId: { type: 'string', description: 'ID of the workspace where the project will be created' },
      description: { type: 'string', description: 'Description of the project' },
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
        description: 'Project statuses (will use workspace defaults if not provided)',
      },
    },
    required: ['name', 'workspaceId'],
  },
};

export async function createProject(params: CreateProjectParams, client: MotionClient): Promise<Project> {
  const request: CreateProjectRequest = {
    name: params.name,
    workspaceId: params.workspaceId,
  };

  if (params.description) request.description = params.description;
  if (params.status) request.status = params.status;

  return await client.post<Project>('/projects', request);
}