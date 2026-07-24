import React from "react";
import { FileText, RefreshCw, Sparkles } from "lucide-react";
import {
  getDocTemplates,
  type DocumentTemplate,
  type GenerateDocumentResult,
} from "../api/docsApi";
import { TemplateGenerateModal } from "./TemplateGenerateModal";
import { useI18n } from "../../../app/providers/I18nProvider";
import type { Locale } from "../../../app/i18n";

type Props = {
  tenantId: string;
  locale: Locale;
  onGenerated: (result: GenerateDocumentResult) => void;
};

const CATEGORIES: Array<{
  value: "all" | DocumentTemplate["category"];
}> = [
  { value: "all" },
  { value: "shartnoma" },
  { value: "ariza" },
  { value: "buyruq" },
  { value: "boshqa" },
];

const CATEGORY_LABEL_KEYS: Record<DocumentTemplate["category"], string> = {
  shartnoma: "docs.templates.category.shartnoma",
  ariza: "docs.templates.category.ariza",
  buyruq: "docs.templates.category.buyruq",
  boshqa: "docs.templates.category.boshqa",
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
  const { translate } = useI18n();
  const [templates, setTemplates] = React.useState<DocumentTemplate[]>([]);
  const [category, setCategory] = React.useState<
    "all" | DocumentTemplate["category"]
  >("all");
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<DocumentTemplate | null>(null);
  const requestSequence = React.useRef(0);

  const loadTemplates = React.useCallback(async () => {
    const requestId = ++requestSequence.current;
    setLoading(true);
    setError(null);
    try {
      const nextTemplates = await getDocTemplates(tenantId, locale);
      if (requestId !== requestSequence.current) return;
      setTemplates(nextTemplates);
    } catch (err) {
      if (requestId !== requestSequence.current) return;
      setTemplates([]);
      setError(
        err instanceof Error
          ? err.message
          : translate("docs.templates.loadError"),
      );
    } finally {
      if (requestId === requestSequence.current) {
        setLoading(false);
      }
    }
  }, [tenantId, locale, translate]);

  React.useEffect(() => {
    void loadTemplates();
    return () => {
      requestSequence.current += 1;
    };
  }, [loadTemplates]);

  React.useEffect(() => {
    setSelected(null);
  }, [tenantId, locale]);

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
      <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-accent px-4 py-3 text-sm text-accent-foreground">
        <Sparkles size={16} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">{translate("docs.templates.betaTitle")}</p>
          <p className="mt-0.5 text-xs text-accent-foreground/80">
            {translate("docs.templates.betaDescription")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={translate("docs.templates.searchPlaceholder")}
          className="min-w-48 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((item) => (
            <button
              key={item.value}
              onClick={() => setCategory(item.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                category === item.value
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {translate(
                item.value === "all"
                  ? "docs.templates.category.all"
                  : CATEGORY_LABEL_KEYS[item.value],
              )}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-xl border border-border bg-card"
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
            {translate("docs.templates.retry")}
          </button>
        </div>
      )}

      {!loading && !error && shown.length === 0 && (
        <div className="py-10 text-center text-sm text-muted-foreground">
          {translate("docs.templates.empty")}
        </div>
      )}

      {!loading && !error && shown.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((template) => (
            <article
              key={template.id}
              className="group rounded-xl border border-border bg-card p-4 text-card-foreground transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none">
                  {CATEGORY_ICONS[template.category]}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium leading-snug text-foreground">
                    {template.title}
                  </h3>
                  {template.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {template.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[template.category]}`}
                    >
                      {translate(CATEGORY_LABEL_KEYS[template.category])}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FileText size={10} />
                      {translate("docs.templates.fieldCount", {
                        count: String(template.fields.length),
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelected(template)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground transition-colors hover:border-primary/50 hover:bg-accent/80"
              >
                <Sparkles size={12} />
                {translate("docs.templates.createDraft")}
              </button>
            </article>
          ))}
        </div>
      )}

      {!loading && !error && (
        <p className="text-center text-xs text-muted-foreground">
          {translate("docs.templates.totalCount", {
            shown: String(shown.length),
            total: String(templates.length),
          })}
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
