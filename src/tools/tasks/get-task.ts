import { z } from 'zod';
import { MotionClient } from '../../lib/motion-client.js';
import { Task } from '../../types/motion.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const getTaskSchema = z.object({
  taskId: z.string().describe('The ID of the task to retrieve'),
});

export type GetTaskParams = z.infer<typeof getTaskSchema>;

export const getTaskTool: Tool = {
  name: 'motion_get_task',
  description: 'Get detailed information about a specific task',
  inputSchema: {
    type: 'object',
    properties: {
      taskId: { type: 'string', description: 'The ID of the task to retrieve' },
    },
    required: ['taskId'],
  },
};

export async function getTask(params: GetTaskParams, client: MotionClient): Promise<Task> {
  return await client.get<Task>(`/tasks/${params.taskId}`);
}