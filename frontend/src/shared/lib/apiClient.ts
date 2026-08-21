import { API_BASE_URL } from "../../app/config";
import { resolveApiErrorMessage } from "./apiError";
import { supabase } from "./supabase";

export type ApiOptions = RequestInit & { tenantId?: string };

export type ApiError = Error & { traceId?: string };

export async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { tenantId, ...fetchOptions } = options;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    const err = new Error("Authentication required") as ApiError;
    throw err;
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
    ...(tenantId ? { "X-Tenant-Id": tenantId } : {}),
    ...(session?.user?.id ? { "X-User-Id": session.user.id } : {}),
    ...(fetchOptions.headers as Record<string, string> ?? {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const result = await response.json().catch(() => ({}));
  const traceId = result?.meta?.trace_id;

  if (!response.ok) {
    const msg = resolveApiErrorMessage(result, response.statusText);
    const err = new Error(msg) as ApiError;
    err.traceId = traceId;
    throw err;
  }

  if (traceId && import.meta.env.DEV) {
    console.debug("trace_id", traceId, endpoint);
  }
  if (traceId && typeof (window as any)?.Sentry !== "undefined") {
    (window as any).Sentry.addBreadcrumb({ category: "api", message: endpoint, data: { trace_id: traceId } });
    (window as any).Sentry.setTag("trace_id", traceId);
  }

  return result.data ?? result;
}
