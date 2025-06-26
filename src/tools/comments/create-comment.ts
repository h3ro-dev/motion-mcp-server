import { z } from 'zod';
import { MotionClient } from '../../lib/motion-client.js';
import { Comment, CreateCommentRequest } from '../../types/motion.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const createCommentSchema = z.object({
  taskId: z.string().describe('ID of the task to add a comment to'),
  content: z.string().describe('Markdown content of the comment'),
});

export type CreateCommentParams = z.infer<typeof createCommentSchema>;

export const createCommentTool: Tool = {
  name: 'motion_create_comment',
  description: 'Create a new comment on a task',
  inputSchema: {
    type: 'object',
    properties: {
      taskId: { type: 'string', description: 'ID of the task to add a comment to' },
      content: { type: 'string', description: 'Markdown content of the comment' },
    },
    required: ['taskId', 'content'],
  },
};

export async function createComment(params: CreateCommentParams, client: MotionClient): Promise<Comment> {
  const request: CreateCommentRequest = {
    content: params.content,
  };

  return await client.post<Comment>(`/tasks/${params.taskId}/comments`, request);
}