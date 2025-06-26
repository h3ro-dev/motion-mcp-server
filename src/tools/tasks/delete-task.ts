import { z } from 'zod';
import { MotionClient } from '../../lib/motion-client.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const deleteTaskSchema = z.object({
  taskId: z.string().describe('ID of the task to delete'),
});

export type DeleteTaskParams = z.infer<typeof deleteTaskSchema>;

export const deleteTaskTool: Tool = {
  name: 'motion_delete_task',
  description: 'Delete a task from Motion',
  inputSchema: {
    type: 'object',
    properties: {
      taskId: { type: 'string', description: 'ID of the task to delete' },
    },
    required: ['taskId'],
  },
};

export async function deleteTask(params: DeleteTaskParams, client: MotionClient): Promise<void> {
  await client.delete(`/tasks/${params.taskId}`);
}