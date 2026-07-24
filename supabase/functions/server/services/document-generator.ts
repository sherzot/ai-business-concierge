export type DocumentLocale = "uz" | "ru" | "en" | "ja";
export type DocumentFormat = "pdf" | "docx";

export type DocumentTemplateField = {
  name: string;
  label_uz: string;
  label_ru?: string;
  label_en?: string;
  label_ja?: string;
  type?: "text" | "textarea" | "date" | "number";
  required?: boolean;
};

export type DocumentTemplateRow = {
  id: string;
  slug: string;
  category: "shartnoma" | "ariza" | "buyruq" | "boshqa";
  title_uz: string;
  title_ru?: string | null;
  title_en?: string | null;
  title_ja?: string | null;
  description_uz?: string | null;
  description_ru?: string | null;
  description_en?: string | null;
  description_ja?: string | null;
  fields: DocumentTemplateField[];
  template_uz: string;
  template_ru?: string | null;
  template_en?: string | null;
  template_ja?: string | null;
};

const PLACEHOLDER_PATTERN = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;
const MAX_FIELD_LENGTH = 4_000;
const MAX_TOTAL_LENGTH = 24_000;
const DOCUMENT_LOCALES: DocumentLocale[] = ["uz", "ru", "en", "ja"];

type DocumentMessageKey =
  | "fieldsObject"
  | "fieldTooLong"
  | "totalTooLong"
  | "required"
  | "invalidCategory"
  | "loadTemplates"
  | "templateRequired"
  | "invalidLocale"
  | "invalidFormat"
  | "templateNotFound";

const DOCUMENT_MESSAGES: Record<
  DocumentLocale,
  Record<DocumentMessageKey, string>
> = {
  uz: {
    fieldsObject: "fields_data obyekt bo'lishi kerak.",
    fieldTooLong: "{field} maydoni {max} belgidan oshmasligi kerak.",
    totalTooLong: "Barcha maydonlar jami {max} belgidan oshmasligi kerak.",
    required: "Majburiy maydonlar to'ldirilmagan.",
    invalidCategory: "Kategoriya noto'g'ri.",
    loadTemplates: "Hujjat shablonlarini yuklab bo'lmadi.",
    templateRequired: "template_id yoki template_slug majburiy.",
    invalidLocale: "Til uz, ru, en yoki ja bo'lishi kerak.",
    invalidFormat: "Format pdf yoki docx bo'lishi kerak.",
    templateNotFound: "Hujjat shabloni topilmadi.",
  },
  ru: {
    fieldsObject: "fields_data должен быть объектом.",
    fieldTooLong: "Поле {field} не должно превышать {max} символов.",
    totalTooLong: "Общий объём полей не должен превышать {max} символов.",
    required: "Обязательные поля не заполнены.",
    invalidCategory: "Неверная категория.",
    loadTemplates: "Не удалось загрузить шаблоны документов.",
    templateRequired: "Необходимо указать template_id или template_slug.",
    invalidLocale: "Язык должен быть uz, ru, en или ja.",
    invalidFormat: "Формат должен быть pdf или docx.",
    templateNotFound: "Шаблон документа не найден.",
  },
  en: {
    fieldsObject: "fields_data must be an object.",
    fieldTooLong: "The {field} field must not exceed {max} characters.",
    totalTooLong: "All fields combined must not exceed {max} characters.",
    required: "Required fields are missing.",
    invalidCategory: "Invalid category.",
    loadTemplates: "Failed to load document templates.",
    templateRequired: "template_id or template_slug is required.",
    invalidLocale: "Locale must be uz, ru, en, or ja.",
    invalidFormat: "Format must be pdf or docx.",
    templateNotFound: "Document template was not found.",
  },
  ja: {
    fieldsObject: "fields_dataはオブジェクトである必要があります。",
    fieldTooLong: "{field}は{max}文字以内で入力してください。",
    totalTooLong: "全項目の合計は{max}文字以内で入力してください。",
    required: "必須項目が入力されていません。",
    invalidCategory: "カテゴリーが正しくありません。",
    loadTemplates: "書類テンプレートを読み込めませんでした。",
    templateRequired: "template_idまたはtemplate_slugが必要です。",
    invalidLocale: "言語はuz、ru、en、jaのいずれかを指定してください。",
    invalidFormat: "形式はpdfまたはdocxを指定してください。",
    templateNotFound: "書類テンプレートが見つかりません。",
  },
};

export function isDocumentLocale(value: unknown): value is DocumentLocale {
  return typeof value === "string" &&
    DOCUMENT_LOCALES.includes(value as DocumentLocale);
}

export function documentMessage(
  locale: DocumentLocale,
  key: DocumentMessageKey,
  vars?: Record<string, string>,
) {
  let message = DOCUMENT_MESSAGES[locale][key];
  for (const [name, value] of Object.entries(vars ?? {})) {
    message = message.replaceAll(`{${name}}`, value);
  }
  return message;
}

function localizedValue(
  locale: DocumentLocale,
  values: Partial<Record<DocumentLocale, string | null | undefined>>,
) {
  const requested = values[locale]?.trim();
  return requested || values.uz?.trim() || "";
}

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
  const templateByLocale: Partial<Record<DocumentLocale, string | null>> = {
    uz: template.template_uz,
    ru: template.template_ru,
    en: template.template_en,
    ja: template.template_ja,
  };
  const appliedLocale: DocumentLocale = templateByLocale[locale]?.trim()
    ? locale
    : "uz";

  return {
    id: template.id,
    slug: template.slug,
    category: template.category,
    title: localizedValue(locale, {
      uz: template.title_uz,
      ru: template.title_ru,
      en: template.title_en,
      ja: template.title_ja,
    }),
    description: localizedValue(locale, {
      uz: template.description_uz,
      ru: template.description_ru,
      en: template.description_en,
      ja: template.description_ja,
    }),
    fields: (template.fields ?? []).map((field) => ({
      name: field.name,
      label: localizedValue(locale, {
        uz: field.label_uz,
        ru: field.label_ru,
        en: field.label_en,
        ja: field.label_ja,
      }),
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
    throw new DocumentValidationError(documentMessage(locale, "fieldsObject"));
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
        documentMessage(locale, "fieldTooLong", {
          field: field.name,
          max: String(MAX_FIELD_LENGTH),
        }),
      );
    }

    totalLength += value.length;
    normalized[field.name] = value;
  }

  if (totalLength > MAX_TOTAL_LENGTH) {
    throw new DocumentValidationError(
      documentMessage(locale, "totalTooLong", {
        max: String(MAX_TOTAL_LENGTH),
      }),
    );
  }

  const missingFields = (template.fields ?? [])
    .filter((field) => field.required && !normalized[field.name])
    .map((field) => field.name);

  if (missingFields.length) {
    throw new DocumentValidationError(
      documentMessage(locale, "required"),
      missingFields,
    );
  }

  const sourceByLocale: Partial<Record<DocumentLocale, string | null>> = {
    uz: template.template_uz,
    ru: template.template_ru,
    en: template.template_en,
    ja: template.template_ja,
  };
  const source = localizedValue(locale, sourceByLocale);
  const appliedLocale: DocumentLocale = sourceByLocale[locale]?.trim()
    ? locale
    : "uz";

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
