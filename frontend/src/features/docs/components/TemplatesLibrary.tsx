import React from "react";
import { FileText, RefreshCw, Sparkles } from "lucide-react";
import {
  getDocTemplates,
  type DocumentTemplate,
  type GenerateDocumentResult,
} from "../api/docsApi";
import { TemplateGenerateModal } from "./TemplateGenerateModal";

type Props = {
  tenantId: string;
  locale: "uz" | "ru";
  onGenerated: (result: GenerateDocumentResult) => void;
};

const CATEGORIES: Array<{
  value: "all" | DocumentTemplate["category"];
  label: string;
}> = [
  { value: "all", label: "Hammasi" },
  { value: "shartnoma", label: "Shartnoma" },
  { value: "ariza", label: "Ariza" },
  { value: "buyruq", label: "Buyruq" },
  { value: "boshqa", label: "Boshqa" },
];

const CATEGORY_LABELS: Record<DocumentTemplate["category"], string> = {
  shartnoma: "Shartnoma",
  ariza: "Ariza",
  buyruq: "Buyruq",
  boshqa: "Boshqa",
};

const CATEGORY_COLORS: Record<DocumentTemplate["category"], string> = {
  shartnoma: "bg-blue-50 text-blue-700 border-blue-100",
  ariza: "bg-green-50 text-green-700 border-green-100",
  buyruq: "bg-purple-50 text-purple-700 border-purple-100",
  boshqa: "bg-slate-50 text-slate-600 border-slate-200",
};

const CATEGORY_ICONS: Record<DocumentTemplate["category"], string> = {
  shartnoma: "🤝",
  ariza: "📋",
  buyruq: "✅",
  boshqa: "📜",
};

export function TemplatesLibrary({
  tenantId,
  locale,
  onGenerated,
}: Props) {
  const [templates, setTemplates] = React.useState<DocumentTemplate[]>([]);
  const [category, setCategory] = React.useState<
    "all" | DocumentTemplate["category"]
  >("all");
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<DocumentTemplate | null>(null);

  const loadTemplates = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTemplates(await getDocTemplates(tenantId, locale));
    } catch (err) {
      setTemplates([]);
      setError(
        err instanceof Error
          ? err.message
          : "Shablonlarni yuklab bo'lmadi.",
      );
    } finally {
      setLoading(false);
    }
  }, [tenantId, locale]);

  React.useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const shown = templates.filter((template) => {
    if (category !== "all" && template.category !== category) return false;
    if (
      search &&
      !template.title.toLowerCase().includes(search.trim().toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
        <Sparkles size={16} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">AI Hujjatchi — Phase 2 beta</p>
          <p className="mt-0.5 text-xs text-indigo-700">
            Shablonni tanlab, maydonlarni to'ldiring. Natija “Mening
            hujjatlarim”ga tahrirlanadigan qoralama sifatida saqlanadi.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Shablon nomi..."
          className="min-w-48 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((item) => (
            <button
              key={item.value}
              onClick={() => setCategory(item.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                category === item.value
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
          <p className="text-sm text-rose-700">{error}</p>
          <button
            onClick={loadTemplates}
            className="mx-auto mt-3 flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900"
          >
            <RefreshCw size={13} />
            Qayta urinish
          </button>
        </div>
      )}

      {!loading && !error && shown.length === 0 && (
        <div className="py-10 text-center text-sm text-slate-400">
          Shablon topilmadi
        </div>
      )}

      {!loading && !error && shown.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((template) => (
            <article
              key={template.id}
              className="group rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-300 hover:shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none">
                  {CATEGORY_ICONS[template.category]}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium leading-snug text-slate-800">
                    {template.title}
                  </h3>
                  {template.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {template.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[template.category]}`}
                    >
                      {CATEGORY_LABELS[template.category]}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <FileText size={10} />
                      {template.fields.length} maydon
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelected(template)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:border-indigo-300 hover:bg-indigo-100"
              >
                <Sparkles size={12} />
                Qoralama yaratish
              </button>
            </article>
          ))}
        </div>
      )}

      {!loading && !error && (
        <p className="text-center text-xs text-slate-400">
          {shown.length} ta shablon · Jami {templates.length} ta
        </p>
      )}

      <TemplateGenerateModal
        tenantId={tenantId}
        template={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onGenerated={(result) => {
          setSelected(null);
          onGenerated(result);
        }}
      />
    </div>
  );
}
