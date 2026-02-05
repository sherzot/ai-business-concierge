import { apiRequest } from "../../../shared/lib/apiClient";

export async function getInboxItems(tenantId: string) {
  const data = await apiRequest<any[]>("/inbox", { tenantId });
  return data.map((item) => ({
    ...item,
    isRead: item.is_read ?? item.isRead ?? false,
  }));
}
