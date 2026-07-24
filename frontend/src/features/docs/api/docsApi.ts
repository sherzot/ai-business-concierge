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
  requested_locale: "uz" | "ru";
  applied_locale: "uz" | "ru";
};

export type GenerateDocumentInput = {
  templateId?: string;
  templateSlug?: string;
  title?: string;
  locale: "uz" | "ru";
  format: "pdf" | "docx";
  fieldsData: Record<string, string | number>;
};

export type GenerateDocumentResult = {
  document_id: string;
  generated_id: string;
  title: string;
  content: string;
  format: "pdf" | "docx";
  requested_locale: "uz" | "ru";
  applied_locale: "uz" | "ru";
  file_ready: boolean;
  remaining: number | null;
};

export async function getDocTemplates(
  tenantId: string,
  locale: "uz" | "ru" = "uz",
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
