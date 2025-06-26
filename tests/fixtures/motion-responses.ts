// Mock responses from Motion API for testing

export const mockTask = {
  id: 'task-123',
  name: 'Test Task',
  description: 'A test task description',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: '2024-01-15T10:00:00Z',
  duration: 3600,
  assigneeId: 'user-456',
  projectId: 'project-789',
  workspaceId: 'workspace-101',
  createdAt: '2024-01-01T08:00:00Z',
  updatedAt: '2024-01-10T14:30:00Z',
  labels: ['urgent', 'review'],
  isCompleted: false,
  isRecurring: false,
};

export const mockProject = {
  id: 'project-789',
  name: 'Test Project',
  description: 'A test project for unit tests',
  status: 'ACTIVE',
  workspaceId: 'workspace-101',
  createdAt: '2023-12-01T09:00:00Z',
  updatedAt: '2024-01-05T11:00:00Z',
  color: '#3B82F6',
  icon: '📊',
};

export const mockWorkspace = {
  id: 'workspace-101',
  name: 'Test Workspace',
  description: 'A test workspace for unit tests',
  createdAt: '2023-11-01T10:00:00Z',
  updatedAt: '2023-12-15T16:00:00Z',
  memberCount: 5,
  activeProjects: 3,
};

export const mockUser = {
  id: 'user-456',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'MEMBER',
  workspaces: ['workspace-101', 'workspace-102'],
  createdAt: '2023-10-01T12:00:00Z',
  lastActiveAt: '2024-01-14T09:30:00Z',
};

export const mockComment = {
  id: 'comment-321',
  taskId: 'task-123',
  userId: 'user-456',
  content: 'This is a test comment',
  createdAt: '2024-01-12T15:45:00Z',
  updatedAt: '2024-01-12T15:45:00Z',
  isEdited: false,
};

export const mockListResponse = {
  meta: {
    pageSize: 20,
    nextCursor: 'next-cursor-token',
    hasMore: true,
    totalCount: 45,
  },
  tasks: [mockTask],
};

export const mockErrorResponse = {
  error: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please try again later.',
    details: {
      retryAfter: 180,
      limit: 12,
      window: '3 minutes',
    },
  },
};

export const mockSuccessResponse = {
  success: true,
  message: 'Operation completed successfully',
};