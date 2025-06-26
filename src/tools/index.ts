// Export all tools from subdirectories
export * from './tasks/index.js';
export * from './projects/index.js';
export * from './workspaces/index.js';
export * from './users/index.js';
export * from './comments/index.js';
export * from './recurring-tasks/index.js';
export * from './schedules/index.js';

// Collect all tools for easy registration
export { listTasksTool, getTaskTool, createTaskTool, updateTaskTool, deleteTaskTool, moveTaskTool, unassignTaskTool } from './tasks/index.js';
export { listProjectsTool, getProjectTool, createProjectTool, updateProjectTool, archiveProjectTool } from './projects/index.js';
export { listWorkspacesTool, getWorkspaceTool } from './workspaces/index.js';
export { listUsersTool, getCurrentUserTool } from './users/index.js';
export { listCommentsTool, createCommentTool } from './comments/index.js';
export { listRecurringTasksTool, createRecurringTaskTool, deleteRecurringTaskTool } from './recurring-tasks/index.js';
export { listSchedulesTool } from './schedules/index.js';