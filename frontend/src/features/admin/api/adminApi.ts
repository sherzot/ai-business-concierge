import { apiRequest } from "../../../shared/lib/apiClient";

export type CompanyStatus = "pending_approval" | "active" | "suspended" | "blocked";

export type Company = {
  id: string;
  name: string;
  status: CompanyStatus;
  legal_form: "yatt" | "llc" | "jsc" | "other" | null;
  stir: string | null;
  legal_address: string | null;
  activity_type: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
  employee_count_range: "1-10" | "11-50" | "51-200" | "200+" | null;
  bank_name: string | null;
  bank_account: string | null;
  blocked_reason: string | null;
  blocked_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  contact_request_id: string | null;
  member_count: number;
};

export async function getAdminCompanies(status?: string): Promise<Company[]> {
  const qs = status && status !== "all" ? `?status=${status}` : "";
  return apiRequest<Company[]>(`/admin/companies${qs}`);
}

export async function updateCompanyStatus(
  id: string,
  status: "active" | "suspended" | "blocked",
  blocked_reason?: string,
): Promise<{ tenant_id: string; status: string }> {
  return apiRequest(`/admin/tenants/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, blocked_reason }),
  });
}

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

export type AiModelStat = {
  model: string;
  requests: number;
  tokens: number;
  cost_usd: number;
};

export type AiDailyStat = {
  date: string;
  requests: number;
  tokens: number;
  cost_usd: number;
};

export type AiTenantStat = {
  tenant_id: string;
  tenant_name: string;
  requests: number;
  cost_usd: number;
};

export type AiStats = {
  period_days: number;
  total_requests: number;
  total_tokens: number;
  total_cost_usd: number;
  by_model: AiModelStat[];
  top_tenants: AiTenantStat[];
  daily: AiDailyStat[];
};

type RawAiStats = Partial<Omit<AiStats, "by_model" | "top_tenants" | "daily">> & {
  by_model?: Array<Partial<AiModelStat> & { cost?: number }>;
  top_tenants?: Array<Partial<AiTenantStat> & { cost?: number }>;
  daily?: Array<Partial<AiDailyStat> & { cost?: number }>;
};

function finiteNumber(value: unknown): number {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : 0;
}

export async function getAdminAiStats(days = 30): Promise<AiStats> {
  const stats = await apiRequest<RawAiStats>(`/admin/ai-stats?days=${days}`);

  return {
    period_days: finiteNumber(stats.period_days) || days,
    total_requests: finiteNumber(stats.total_requests),
    total_tokens: finiteNumber(stats.total_tokens),
    total_cost_usd: finiteNumber(stats.total_cost_usd),
    by_model: (stats.by_model ?? []).map((item) => ({
      model: item.model ?? "unknown",
      requests: finiteNumber(item.requests),
      tokens: finiteNumber(item.tokens),
      cost_usd: finiteNumber(item.cost_usd ?? item.cost),
    })),
    top_tenants: (stats.top_tenants ?? []).map((item) => ({
      tenant_id: item.tenant_id ?? "unknown",
      tenant_name: item.tenant_name ?? "",
      requests: finiteNumber(item.requests),
      cost_usd: finiteNumber(item.cost_usd ?? item.cost),
    })),
    daily: (stats.daily ?? []).map((item) => ({
      date: item.date ?? "",
      requests: finiteNumber(item.requests),
      tokens: finiteNumber(item.tokens),
      cost_usd: finiteNumber(item.cost_usd ?? item.cost),
    })),
  };
}

export type AdminUser = {
  id: string;
  user_id: string;
  tenant_id: string;
  tenant_name: string;
  role: string;
  status: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
};

export async function getAdminUsers(): Promise<AdminUser[]> {
  return apiRequest<AdminUser[]>("/admin/users");
}
