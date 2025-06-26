import { z } from 'zod';
import { MotionClient } from '../../lib/motion-client.js';
import { Project, ListResponse } from '../../types/motion.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const listProjectsSchema = z.object({
  workspaceId: z.string().describe('ID of the workspace to list projects from'),
  includeArchived: z.boolean().optional().describe('Include archived projects in the list'),
  cursor: z.string().optional().describe('Pagination cursor from previous request'),
});

export type ListProjectsParams = z.infer<typeof listProjectsSchema>;

export const listProjectsTool: Tool = {
  name: 'motion_list_projects',
  description: 'List all projects in a workspace',
  inputSchema: {
    type: 'object',
    properties: {
      workspaceId: { type: 'string', description: 'ID of the workspace to list projects from' },
      includeArchived: { type: 'boolean', description: 'Include archived projects in the list' },
      cursor: { type: 'string', description: 'Pagination cursor from previous request' },
    },
    required: ['workspaceId'],
  },
};

export async function listProjects(params: ListProjectsParams, client: MotionClient): Promise<ListResponse<Project>> {
  const queryParams: any = {
    workspaceId: params.workspaceId,
  };
  
  if (params.includeArchived !== undefined) queryParams.includeArchived = params.includeArchived;
  if (params.cursor) queryParams.cursor = params.cursor;

  const response = await client.get<{ meta: any; projects: Project[] }>('/projects', queryParams);
  
  return {
    meta: response.meta,
    projects: response.projects,
  };
}