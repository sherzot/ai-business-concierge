import { apiRequest } from "../../../shared/lib/apiClient";
import type { Task, CreateTaskInput, UpdateTaskInput, Member } from "../types";

/** Server snake_case → client camelCase normalizatsiyasi */
function normalizeTask(raw: Record<string, unknown>): Task {
  return {
    id: raw.id as string,
    title: raw.title as string,
    description: (raw.description ?? null) as string | null,
    status: (raw.status ?? 'todo') as Task['status'],
    priority: (raw.priority ?? 'medium') as Task['priority'],
    assignee: (raw.assignee ?? null) as Task['assignee'],
    acknowledgedAt: (raw.acknowledged_at ?? raw.acknowledgedAt ?? null) as string | null,
    dueDate: (raw.due_date ?? raw.dueDate ?? null) as string | null,
    tags: (raw.tags as string[]) ?? [],
    comments: (raw.comments as number) ?? 0,
  };
}

export async function getTasks(tenantId: string): Promise<Task[]> {
  const data = await apiRequest<Record<string, unknown>[]>("/tasks", { tenantId });
  return data.map(normalizeTask);
}

export async function createTask(tenantId: string, input: CreateTaskInput): Promise<Task> {
  const payload = {
    title: input.title,
    description: input.description ?? null,
    status: input.status ?? 'todo',
    priority: input.priority ?? 'medium',
    assignee: input.assignee ?? null,
    due_date: input.dueDate ?? null,
    tags: input.tags ?? [],
  };
  const raw = await apiRequest<Record<string, unknown>>("/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
    tenantId,
  });
  return normalizeTask(raw);
}

export async function updateTask(
  tenantId: string,
  taskId: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const payload: Record<string, unknown> = { ...input };
  if ('dueDate' in input) {
    payload.due_date = input.dueDate ?? null;
    delete payload.dueDate;
  }
  const raw = await apiRequest<Record<string, unknown>>(`/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    tenantId,
  });
  return normalizeTask(raw);
}

export async function acknowledgeTask(tenantId: string, taskId: string): Promise<void> {
  await apiRequest(`/tasks/${taskId}/acknowledge`, { method: "POST", tenantId });
}

export async function deleteTask(tenantId: string, taskId: string): Promise<void> {
  await apiRequest(`/tasks/${taskId}`, { method: "DELETE", tenantId });
}

export async function getMembers(tenantId: string): Promise<Member[]> {
  return apiRequest<Member[]>(`/tenants/${tenantId}/members`, { tenantId });
}
