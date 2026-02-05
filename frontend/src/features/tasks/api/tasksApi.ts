import { apiRequest } from "../../../shared/lib/apiClient";

export async function getTasks(tenantId: string) {
  const data = await apiRequest<any[]>("/tasks", { tenantId });
  return data.map((task) => ({
    ...task,
    dueDate: task.due_date ?? task.dueDate ?? null,
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
