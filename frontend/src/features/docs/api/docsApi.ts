import { apiRequest } from "../../../shared/lib/apiClient";

export type DocApiItem = {
  id: string;
  title: string;
  owner?: string;
  status?: "draft" | "review" | "approved" | "expired";
  updated_at?: string;
  content?: string;
};

export type DocMetadata = {
  owner?: string;
  status?: "draft" | "review" | "approved" | "expired";
};

export async function getDocs(tenantId: string, query?: string) {
  const q = query ? `?q=${encodeURIComponent(query)}` : "";
  return apiRequest<DocApiItem[]>(`/docs${q}`, { tenantId });
}

export async function getDocById(tenantId: string, id: string) {
  return apiRequest<DocApiItem>(`/docs/${id}`, { tenantId });
}

export async function createDoc(
  tenantId: string,
  payload: { title: string; content: string; metadata?: DocMetadata }
) {
  return apiRequest<{ document_id: string }>(`/docs/index`, {
    tenantId,
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateDoc(
  tenantId: string,
  id: string,
  payload: { title?: string; content?: string; metadata?: DocMetadata }
) {
  return apiRequest<{ document_id: string }>(`/docs/${id}`, {
    tenantId,
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteDoc(tenantId: string, id: string) {
  return apiRequest<{ document_id: string }>(`/docs/${id}`, {
    tenantId,
    method: "DELETE",
  });
}
