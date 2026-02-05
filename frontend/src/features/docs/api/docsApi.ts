import { apiRequest } from "../../../shared/lib/apiClient";

export type DocApiItem = {
  id: string;
  title: string;
  owner?: string;
  status?: "draft" | "review" | "approved" | "expired";
  updated_at?: string;
  content?: string;
};

export async function getDocs(tenantId: string, query?: string) {
  const q = query ? `?q=${encodeURIComponent(query)}` : "";
  return apiRequest<DocApiItem[]>(`/docs${q}`, { tenantId });
}

export async function getDocById(tenantId: string, id: string) {
  return apiRequest<DocApiItem>(`/docs/${id}`, { tenantId });
}
