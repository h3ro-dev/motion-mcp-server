// Motion API Types

export interface User {
  id: string;
  name?: string;
  email: string;
}

export interface Workspace {
  id: string;
  name: string;
  teamId: string;
  type: 'INDIVIDUAL' | 'TEAM';
  labels: Label[];
  statuses: Status[];
}

export interface Status {
  name: string;
  isDefaultStatus?: boolean;
  isResolvedStatus?: boolean;
}

export interface Label {
  name: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  workspaceId: string;
  status?: Status;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  duration: string | number; // "NONE", "REMINDER", or minutes
  dueDate?: string;
  deadlineType: 'HARD' | 'SOFT' | 'NONE';
  parentRecurringTaskId?: string;
  completed: boolean;
  completedTime?: string;
  updatedTime?: string;
  startOn?: string;
  creator: User;
  project?: Project;
  workspace: Workspace;
  status: Status;
  priority: 'ASAP' | 'HIGH' | 'MEDIUM' | 'LOW';
  labels: Label[];
  assignees: User[];
  scheduledStart?: string;
  createdTime: string;
  scheduledEnd?: string;
  schedulingIssue: boolean;
  lastInteractedTime?: string;
  customFieldValues?: Record<string, CustomFieldValue>;
}

export interface RecurringTask {
  id: string;
  name: string;
  description?: string;
  duration: string | number;
  project?: Project;
  workspace: Workspace;
  creator: User;
  frequency: RecurringTaskFrequency;
  scheduledStart?: string;
  priority: 'ASAP' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface RecurringTaskFrequency {
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  interval?: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  // Add more frequency options as needed
}

export interface Comment {
  id: string;
  taskId: string;
  content: string;
  createdAt: string;
  creator: User;
}

export interface Schedule {
  name: string;
  isDefaultTimezone: boolean;
  timezone: string;
  schedule: {
    monday?: TimeSlot[];
    tuesday?: TimeSlot[];
    wednesday?: TimeSlot[];
    thursday?: TimeSlot[];
    friday?: TimeSlot[];
    saturday?: TimeSlot[];
    sunday?: TimeSlot[];
  };
}

export interface TimeSlot {
  start: string; // HH:MM format
  end: string;   // HH:MM format
}

export interface CustomFieldValue {
  type: string;
  value: any;
}

// Request/Response types
export interface ListResponse<T> {
  meta: {
    nextCursor?: string;
    pageSize: number;
  };
  [key: string]: T[] | any;
}

export interface CreateTaskRequest {
  name: string;
  workspaceId: string;
  description?: string;
  dueDate?: string;
  duration?: string | number;
  status?: string;
  autoScheduled?: {
    startDate?: string;
    deadlineType?: 'HARD' | 'SOFT' | 'NONE';
    schedule?: string;
  };
  projectId?: string;
  labels?: string[];
  priority?: 'ASAP' | 'HIGH' | 'MEDIUM' | 'LOW';
  assigneeId?: string;
}

export interface UpdateTaskRequest {
  name?: string;
  description?: string;
  dueDate?: string;
  duration?: string | number;
  status?: string;
  autoScheduled?: {
    startDate?: string;
    deadlineType?: 'HARD' | 'SOFT' | 'NONE';
    schedule?: string;
  } | null;
  projectId?: string;
  labels?: string[];
  priority?: 'ASAP' | 'HIGH' | 'MEDIUM' | 'LOW';
  assigneeId?: string;
}

export interface CreateProjectRequest {
  name: string;
  workspaceId: string;
  description?: string;
  status?: Status[];
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: Status[];
}

export interface CreateCommentRequest {
  content: string;
}

export interface CreateRecurringTaskRequest {
  name: string;
  workspaceId: string;
  description?: string;
  duration?: string | number;
  projectId?: string;
  frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY';
  startingOn: string;
  idealTime?: string;
  schedule?: {
    dayOfWeek?: number;
    dayOfMonth?: number;
    month?: number;
  };
  labels?: string[];
  priority?: 'ASAP' | 'HIGH' | 'MEDIUM' | 'LOW';
  assigneeId?: string;
  idempotencyKey?: string;
}