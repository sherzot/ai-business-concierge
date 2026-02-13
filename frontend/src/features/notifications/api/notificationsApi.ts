import { apiRequest } from "../../../shared/lib/apiClient";

export type Notification = {
  id: string;
  tenant_id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  task_id: string | null;
  read_at: string | null;
  created_at: string;
};

export async function getNotifications(tenantId: string): Promise<Notification[]> {
  return apiRequest<Notification[]>("/notifications", { tenantId });
}

export async function markNotificationRead(tenantId: string, notificationId: string) {
  return apiRequest(`/notifications/${notificationId}/read`, {
    method: "PATCH",
    tenantId,
  });
}
