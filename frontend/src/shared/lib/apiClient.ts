import { API_BASE_URL, publicAnonKey } from "../../app/config";
import { supabase } from "./supabase";

export type ApiOptions = RequestInit & { tenantId?: string };

export async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { tenantId, ...fetchOptions } = options;
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? publicAnonKey;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(tenantId ? { "X-Tenant-Id": tenantId } : {}),
    ...(fetchOptions.headers as Record<string, string> ?? {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = errorData.meta?.errors?.[0]?.message ?? errorData.message ?? `API Error: ${response.statusText}`;
    throw new Error(msg);
  }

  const result = await response.json();
  return result.data ?? result;
}
