import { apiRequest } from "../../../shared/lib/apiClient";

export async function getDashboardStats(tenantId: string) {
  return apiRequest<any>("/dashboard", { tenantId });
}
