import { apiRequest } from "../../../shared/lib/apiClient";

export type HealthStats = {
  status: "ok" | "degraded";
  checked_at: string;
  db_latency_ms: number;
  tenants: { total: number; active: number; pending_approval: number };
  users: { total: number; active: number; pending_setup: number };
  contacts: { total: number; needs_action: number };
  notifications: { total: number; unread: number };
};

export async function getAdminHealth(): Promise<HealthStats> {
  return apiRequest<HealthStats>("/admin/health");
}

export async function sendAdminAIMessage(message: string, locale = "uz"): Promise<{ reply: string }> {
  return apiRequest<{ reply: string }>("/admin/ai/chat", {
    method: "POST",
    body: JSON.stringify({ message, locale }),
  });
}
