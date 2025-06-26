import { z } from 'zod';
import { MotionClient } from '../../lib/motion-client.js';
import { Task } from '../../types/motion.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const unassignTaskSchema = z.object({
  taskId: z.string().describe('ID of the task to unassign'),
});

export type UnassignTaskParams = z.infer<typeof unassignTaskSchema>;

export const unassignTaskTool: Tool = {
  name: 'motion_unassign_task',
  description: 'Unassign a task from its current assignee in Motion',
  inputSchema: {
    type: 'object',
    properties: {
      taskId: { type: 'string', description: 'ID of the task to unassign' },
    },
    required: ['taskId'],
  },
};

export async function unassignTask(params: UnassignTaskParams, client: MotionClient): Promise<Task> {
  // To unassign a task, we update it with a null assigneeId
  return await client.patch<Task>(`/tasks/${params.taskId}`, {
    assigneeId: null,
  });
}