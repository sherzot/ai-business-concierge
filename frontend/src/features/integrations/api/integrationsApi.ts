import { apiRequest } from "../../../shared/lib/apiClient";

export type IntegrationApiItem = {
  id: string;
  name: string;
  description: string;
  status: "connected" | "disconnected" | "pending";
  last_sync: string;
};

export async function getIntegrations(tenantId: string) {
  return apiRequest<IntegrationApiItem[]>("/integrations", { tenantId });
}

export async function updateIntegration(
  tenantId: string,
  id: string,
  payload: { apiKey?: string; webhook?: string },
) {
  return apiRequest<{ id: string; status: string }>(`/integrations/${id}`, {
    method: "POST",
    body: JSON.stringify(payload),
    tenantId,
  });
}
