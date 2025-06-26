import { z } from 'zod';
import { MotionClient } from '../../lib/motion-client.js';
import { Comment, ListResponse } from '../../types/motion.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const listCommentsSchema = z.object({
  taskId: z.string().describe('ID of the task to list comments for'),
  cursor: z.string().optional().describe('Pagination cursor from previous request'),
});

export type ListCommentsParams = z.infer<typeof listCommentsSchema>;

export const listCommentsTool: Tool = {
  name: 'motion_list_comments',
  description: 'List all comments for a specific task',
  inputSchema: {
    type: 'object',
    properties: {
      taskId: { type: 'string', description: 'ID of the task to list comments for' },
      cursor: { type: 'string', description: 'Pagination cursor from previous request' },
    },
    required: ['taskId'],
  },
};

export async function listComments(params: ListCommentsParams, client: MotionClient): Promise<ListResponse<Comment>> {
  const queryParams: any = {};
  if (params.cursor) queryParams.cursor = params.cursor;

  const response = await client.get<{ meta: any; comments: Comment[] }>(
    `/tasks/${params.taskId}/comments`,
    queryParams
  );
  
  return {
    meta: response.meta,
    comments: response.comments,
  };
}