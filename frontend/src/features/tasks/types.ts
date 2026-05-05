export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';

export type TaskAssignee = {
  id?: string;
  name: string;
  avatar?: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: TaskAssignee | null;
  acknowledgedAt?: string | null;
  dueDate?: string | null;
  tags: string[];
  comments: number;
};

export type CreateTaskInput = {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: TaskAssignee | null;
  dueDate?: string | null;
  tags?: string[];
};

export type UpdateTaskInput = {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: TaskAssignee | null;
  dueDate?: string | null;
  tags?: string[];
};

export type Member = {
  id: string;
  name: string;
};

/** Vazifa tugash sanasi o'tganmi va hali done emasmi */
export function isOverdue(task: Pick<Task, 'dueDate' | 'status'>): boolean {
  if (!task.dueDate || task.status === 'done') return false;
  return new Date(task.dueDate) < new Date();
}
