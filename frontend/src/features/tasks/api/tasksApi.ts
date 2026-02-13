import { apiRequest } from "../../../shared/lib/apiClient";

export async function getTasks(tenantId: string) {
  const data = await apiRequest<any[]>("/tasks", { tenantId });
  return data.map((task) => ({
    ...task,
    dueDate: task.due_date ?? task.dueDate ?? null,
    acknowledgedAt: task.acknowledged_at ?? null,
  }));
}

export async function createTask(tenantId: string, task: any) {
  const payload = {
    ...task,
    dueDate: undefined,
    due_date: task.dueDate ?? task.due_date ?? null,
  };
  return apiRequest("/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
    tenantId,
  });
}

export async function updateTask(tenantId: string, taskId: string, updates: Partial<{
  title: string;
  status: string;
  priority: string;
  assignee: { id?: string; name: string } | null;
  dueDate: string | null;
  tags: string[];
}>) {
  const payload = {
    ...updates,
    dueDate: updates.dueDate ?? undefined,
    due_date: updates.dueDate ?? updates.due_date ?? null,
  };
  return apiRequest(`/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    tenantId,
  });
}

export async function acknowledgeTask(tenantId: string, taskId: string) {
  return apiRequest(`/tasks/${taskId}/acknowledge`, {
    method: "POST",
    tenantId,
  });
}

export async function deleteTask(tenantId: string, taskId: string) {
  return apiRequest(`/tasks/${taskId}`, {
    method: "DELETE",
    tenantId,
  });
}

export type Member = { id: string; name: string };

export async function getMembers(tenantId: string): Promise<Member[]> {
  return apiRequest<Member[]>(`/tenants/${tenantId}/members`, { tenantId });
}
