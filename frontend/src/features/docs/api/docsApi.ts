import { apiRequest } from "../../../shared/lib/apiClient";
import type { Locale } from "../../../app/i18n";

export type DocApiItem = {
  id: string;
  title: string;
  owner?: string;
  status?: "draft" | "review" | "approved" | "expired";
  updated_at?: string;
  content?: string;
  file_ready?: boolean;
  file_format?: "pdf" | "docx" | null;
  file_size?: number | null;
  mime_type?: string | null;
  sha256?: string | null;
};

export type DocMetadata = {
  owner?: string;
  status?: "draft" | "review" | "approved" | "expired";
  assignee_id?: string;
};

export type DocumentTemplateField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "date" | "number";
  required: boolean;
};

export type DocumentTemplate = {
  id: string;
  slug: string;
  category: "shartnoma" | "ariza" | "buyruq" | "boshqa";
  title: string;
  description: string;
  fields: DocumentTemplateField[];
  requested_locale: Locale;
  applied_locale: Locale;
};

export type GenerateDocumentInput = {
  templateId?: string;
  templateSlug?: string;
  title?: string;
  locale: Locale;
  format: "pdf" | "docx";
  fieldsData: Record<string, string | number>;
};

export type GenerateDocumentResult = {
  document_id: string;
  generated_id: string;
  title: string;
  content: string;
  format: "pdf" | "docx";
  requested_locale: Locale;
  applied_locale: Locale;
  file_ready: boolean;
  file_name: string;
  file_size: number;
  mime_type: string;
  sha256: string;
  download_url: string;
  download_expires_in: number;
  remaining: number | null;
};

export type ExportDocumentResult = {
  document_id: string;
  generated_id: string;
  format: "pdf" | "docx";
  file_ready: true;
  file_name: string;
  file_size: number;
  mime_type: string;
  sha256: string;
  download_url: string;
  download_expires_in: number;
};

export async function getDocTemplates(
  tenantId: string,
  locale: Locale = "uz",
  category?: DocumentTemplate["category"],
) {
  const params = new URLSearchParams({ locale });
  if (category) params.set("category", category);
  return apiRequest<DocumentTemplate[]>(`/doc-templates?${params.toString()}`, {
    tenantId,
  });
}

export async function generateDoc(
  tenantId: string,
  input: GenerateDocumentInput,
) {
  return apiRequest<GenerateDocumentResult>("/docs/generate", {
    tenantId,
    method: "POST",
    body: JSON.stringify({
      template_id: input.templateId,
      template_slug: input.templateSlug,
      title: input.title,
      locale: input.locale,
      format: input.format,
      fields_data: input.fieldsData,
    }),
  });
}

export async function getDocs(tenantId: string, query?: string) {
  const q = query ? `?q=${encodeURIComponent(query)}` : "";
  return apiRequest<DocApiItem[]>(`/docs${q}`, { tenantId });
}

export async function getDocById(tenantId: string, id: string) {
  return apiRequest<DocApiItem>(`/docs/${id}`, { tenantId });
}

export async function exportDoc(
  tenantId: string,
  id: string,
  format: "pdf" | "docx",
  locale: Locale,
) {
  return apiRequest<ExportDocumentResult>(`/docs/${id}/export`, {
    tenantId,
    method: "POST",
    body: JSON.stringify({ format, locale }),
  });
}

export async function createDoc(
  tenantId: string,
  payload: { title: string; content: string; metadata?: DocMetadata },
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
  payload: { title?: string; content?: string; metadata?: DocMetadata },
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
