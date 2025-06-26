import { z } from 'zod';
import { MotionClient } from '../../lib/motion-client.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const deleteRecurringTaskSchema = z.object({
  recurringTaskId: z.string().describe('ID of the recurring task to delete'),
});

export type DeleteRecurringTaskParams = z.infer<typeof deleteRecurringTaskSchema>;

export const deleteRecurringTaskTool: Tool = {
  name: 'motion_delete_recurring_task',
  description: 'Delete a recurring task template and stop creating new instances',
  inputSchema: {
    type: 'object',
    properties: {
      recurringTaskId: { type: 'string', description: 'ID of the recurring task to delete' },
    },
    required: ['recurringTaskId'],
  },
};

export async function deleteRecurringTask(params: DeleteRecurringTaskParams, client: MotionClient): Promise<void> {
  await client.delete(`/recurring-tasks/${params.recurringTaskId}`);
}