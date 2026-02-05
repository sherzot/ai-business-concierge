import { API_BASE_URL, publicAnonKey } from "../../app/config";

export type ApiOptions = RequestInit & { tenantId?: string };

export async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { tenantId, ...fetchOptions } = options;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${publicAnonKey}`,
    ...(tenantId ? { "X-Tenant-Id": tenantId } : {}),
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
  return result.data ?? result;
}
