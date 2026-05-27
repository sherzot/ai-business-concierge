/**
 * Admin Knowledge Base API client
 * Endpoints: GET/POST/PUT/DELETE /admin/kb
 */

import { apiRequest } from "../../../shared/lib/apiClient";

export interface KbArticle {
  id: string;
  tenant_id: string | null;
  locale: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateKbInput {
  locale: string;
  category: string;
  question: string;
  answer: string;
  tags?: string[];
  is_active?: boolean;
  tenant_id?: string | null;
}

export type UpdateKbInput = Partial<CreateKbInput>;

export async function listKbArticles(params?: {
  locale?: string;
  category?: string;
  is_active?: boolean;
}): Promise<KbArticle[]> {
  const qs = new URLSearchParams();
  if (params?.locale) qs.set("locale", params.locale);
  if (params?.category) qs.set("category", params.category);
  if (params?.is_active !== undefined) qs.set("is_active", String(params.is_active));
  return apiRequest<KbArticle[]>(`/admin/kb${qs.toString() ? `?${qs}` : ""}`, { method: "GET" });
}

export async function createKbArticle(input: CreateKbInput): Promise<KbArticle> {
  return apiRequest<KbArticle>("/admin/kb", { method: "POST", body: input });
}

export async function updateKbArticle(id: string, input: UpdateKbInput): Promise<KbArticle> {
  return apiRequest<KbArticle>(`/admin/kb/${id}`, { method: "PUT", body: input });
}

export async function deleteKbArticle(id: string): Promise<void> {
  return apiRequest<void>(`/admin/kb/${id}`, { method: "DELETE" });
}
