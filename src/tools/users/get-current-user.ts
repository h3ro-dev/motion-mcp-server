import { z } from 'zod';
import { MotionClient } from '../../lib/motion-client.js';
import { User } from '../../types/motion.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const getCurrentUserSchema = z.object({});

export type GetCurrentUserParams = z.infer<typeof getCurrentUserSchema>;

export const getCurrentUserTool: Tool = {
  name: 'motion_get_current_user',
  description: 'Get information about the currently authenticated user',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function getCurrentUser(_params: GetCurrentUserParams, client: MotionClient): Promise<User> {
  return await client.get<User>('/users/me');
}