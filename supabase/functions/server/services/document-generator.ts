export type DocumentLocale = "uz" | "ru";
export type DocumentFormat = "pdf" | "docx";

export type DocumentTemplateField = {
  name: string;
  label_uz: string;
  label_ru?: string;
  type?: "text" | "textarea" | "date" | "number";
  required?: boolean;
};

export type DocumentTemplateRow = {
  id: string;
  slug: string;
  category: "shartnoma" | "ariza" | "buyruq" | "boshqa";
  title_uz: string;
  title_ru?: string | null;
  description_uz?: string | null;
  description_ru?: string | null;
  fields: DocumentTemplateField[];
  template_uz: string;
  template_ru?: string | null;
};

const PLACEHOLDER_PATTERN = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;
const MAX_FIELD_LENGTH = 4_000;
const MAX_TOTAL_LENGTH = 24_000;

export class DocumentValidationError extends Error {
  constructor(
    message: string,
    readonly missingFields: string[] = [],
  ) {
    super(message);
    this.name = "DocumentValidationError";
  }
}
export function localizeTemplate(
  template: DocumentTemplateRow,
  locale: DocumentLocale,
) {
  const appliedLocale: DocumentLocale =
    locale === "ru" && template.template_ru ? "ru" : "uz";

  return {
    id: template.id,
    slug: template.slug,
    category: template.category,
    title:
      locale === "ru" && template.title_ru
        ? template.title_ru
        : template.title_uz,
    description:
      locale === "ru" && template.description_ru
        ? template.description_ru
        : template.description_uz ?? "",
    fields: (template.fields ?? []).map((field) => ({
      name: field.name,
      label:
        locale === "ru" && field.label_ru
          ? field.label_ru
          : field.label_uz,
      type: field.type ?? "text",
      required: Boolean(field.required),
    })),
    requested_locale: locale,
    applied_locale: appliedLocale,
  };
}

export function renderDocumentTemplate(
  template: DocumentTemplateRow,
  rawFields: unknown,
  locale: DocumentLocale,
) {
  if (!rawFields || typeof rawFields !== "object" || Array.isArray(rawFields)) {
    throw new DocumentValidationError("fields_data obyekt bo'lishi kerak.");
  }

  const input = rawFields as Record<string, unknown>;
  const normalized: Record<string, string> = {};
  let totalLength = 0;

  for (const field of template.fields ?? []) {
    const rawValue = input[field.name];
    const value =
      typeof rawValue === "string" || typeof rawValue === "number"
        ? String(rawValue).trim()
        : "";

    if (value.length > MAX_FIELD_LENGTH) {
      throw new DocumentValidationError(
        `${field.name} maydoni ${MAX_FIELD_LENGTH} belgidan oshmasligi kerak.`,
      );
    }

    totalLength += value.length;
    normalized[field.name] = value;
  }

  if (totalLength > MAX_TOTAL_LENGTH) {
    throw new DocumentValidationError(
      `Barcha maydonlar jami ${MAX_TOTAL_LENGTH} belgidan oshmasligi kerak.`,
    );
  }

  const missingFields = (template.fields ?? [])
    .filter((field) => field.required && !normalized[field.name])
    .map((field) => field.name);

  if (missingFields.length) {
    throw new DocumentValidationError(
      "Majburiy maydonlar to'ldirilmagan.",
      missingFields,
    );
  }

  const source =
    locale === "ru" && template.template_ru
      ? template.template_ru
      : template.template_uz;
  const appliedLocale: DocumentLocale =
    locale === "ru" && template.template_ru ? "ru" : "uz";

  const content = source
    .replace(PLACEHOLDER_PATTERN, (_match, fieldName: string) => {
      return normalized[fieldName] || "—";
    })
    .trim();

  return {
    content,
    fieldsData: normalized,
    appliedLocale,
  };
}
