import { z } from 'zod';
import { MotionClient } from '../../lib/motion-client.js';
import { Task } from '../../types/motion.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const moveTaskSchema = z.object({
  taskId: z.string().describe('ID of the task to move'),
  workspaceId: z.string().describe('ID of the workspace to move the task to'),
});

export type MoveTaskParams = z.infer<typeof moveTaskSchema>;

export const moveTaskTool: Tool = {
  name: 'motion_move_task',
  description: 'Move a task to a different workspace in Motion',
  inputSchema: {
    type: 'object',
    properties: {
      taskId: { type: 'string', description: 'ID of the task to move' },
      workspaceId: { type: 'string', description: 'ID of the workspace to move the task to' },
    },
    required: ['taskId', 'workspaceId'],
  },
};

export async function moveTask(params: MoveTaskParams, client: MotionClient): Promise<Task> {
  return await client.post<Task>(`/tasks/${params.taskId}/move`, {
    workspaceId: params.workspaceId,
  });
}