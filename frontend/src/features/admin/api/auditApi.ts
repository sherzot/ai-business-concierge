/**
 * Admin Audit Log API client
 * Endpoint: GET /admin/audit
 */

import { apiRequest } from "../../../shared/lib/apiClient";

export interface AuditLog {
  id: string;
  tenant_id: string | null;
  user_id: string | null;
  action: string;
  event_type: string | null;
  entity_type: string | null;
  entity_id: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditFilter {
  tenant_id?: string;
  entity_type?: string;
  action?: string;
  from?: string;
  to?: string;
  limit?: number;
}

export async function listAuditLogs(filter?: AuditFilter): Promise<AuditLog[]> {
  const qs = new URLSearchParams();
  if (filter?.tenant_id)   qs.set("tenant_id", filter.tenant_id);
  if (filter?.entity_type) qs.set("entity_type", filter.entity_type);
  if (filter?.action)      qs.set("action", filter.action);
  if (filter?.from)        qs.set("from", filter.from);
  if (filter?.to)          qs.set("to", filter.to);
  if (filter?.limit)       qs.set("limit", String(filter.limit));
  return apiRequest<AuditLog[]>(`/admin/audit${qs.toString() ? `?${qs}` : ""}`, { method: "GET" });
}
