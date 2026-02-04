import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-6c2837d6/v1`;

type ApiOptions = RequestInit & { tenantId?: string };

// Helper to handle API requests
async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { tenantId, ...fetchOptions } = options;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`,
    ...(tenantId ? { 'X-Tenant-Id': tenantId } : {}),
    ...fetchOptions.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data ?? result; // Handle { data: ... } wrapper if present
}

// --- TASKS API ---
export async function getTasks(tenantId: string) {
  const data = await apiRequest<any[]>('/tasks', { tenantId });
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
  return apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
    tenantId,
  });
}

// --- INBOX API ---
export async function getInboxItems(tenantId: string) {
  const data = await apiRequest<any[]>('/inbox', { tenantId });
  return data.map((item) => ({
    ...item,
    isRead: item.is_read ?? item.isRead ?? false,
  }));
}

// --- AI CHAT API ---
export async function sendAIChatMessage(tenantId: string, message: string, context: any) {
  return apiRequest<{ reply: string, toolUsed?: any }>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, context }),
    tenantId,
  });
}

// --- DASHBOARD API ---
export async function getDashboardStats(tenantId: string) {
  return apiRequest<any>('/dashboard', { tenantId });
}
