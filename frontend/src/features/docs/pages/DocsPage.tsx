import React from "react";
import { DocDetail } from "../components/DocDetail";
import { DocCreateModal } from "../components/DocCreateModal";
import { DocEditModal } from "../components/DocEditModal";
import { DocList, DocItem } from "../components/DocList";
import { DocSearchBar } from "../components/DocSearchBar";
import { TemplatesLibrary } from "../components/TemplatesLibrary";
import { deleteDoc, getDocs } from "../api/docsApi";
import { useI18n } from "../../../app/providers/I18nProvider";
import { Button } from "../../../shared/ui/button";
import { ErrorState } from "../../../shared/components/ErrorState";
import { normalizeError, getTraceIdFromError } from "../../../shared/lib/errorHandling";

type DocsTab = "my-docs" | "templates";

export function DocsPage({ tenant }: { tenant: { id: string; name: string } }) {
  const { translate, locale } = useI18n();
  const [activeTab, setActiveTab] = React.useState<DocsTab>("my-docs");
  const [query, setQuery] = React.useState("");
  const [docs, setDocs] = React.useState<DocItem[]>([]);
  const [selected, setSelected] = React.useState<DocItem | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<unknown>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [generatedNotice, setGeneratedNotice] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (activeTab === "my-docs") loadDocs();
  }, [tenant.id, query, activeTab]);

  async function loadDocs() {
    setLoading(true);
    setError(null);
    try {
      const data = await getDocs(tenant.id, query.trim() || undefined);
      const mapped = data.map((doc) => ({
        id: doc.id,
        title: doc.title,
        owner: doc.owner ?? "Legal",
        status: doc.status ?? "draft",
        updatedAt: doc.updated_at ?? "",
        content: doc.content,
        fileReady: doc.file_ready,
        fileFormat: doc.file_format,
        fileSize: doc.file_size,
      }));
      setDocs(mapped);
      setSelected(mapped[0]);
    } catch (err) {
      console.error("Failed to load docs", err);
      setError(err ?? translate("docs.loadError"));
      setDocs([]);
      setSelected(undefined);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    await deleteDoc(tenant.id, selected.id);
    await loadDocs();
  }

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Knowledge operations</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">{translate("nav.docsTitle")}</h2>
      </header>
      {generatedNotice && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          <span>{generatedNotice}</span>
          <button
            onClick={() => setGeneratedNotice(null)}
            className="text-xs font-semibold hover:text-emerald-900 dark:hover:text-emerald-100"
          >
            {translate("docs.noticeClose")}
          </button>
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex w-fit gap-5 border-b border-border bg-transparent">
        {(["my-docs", "templates"] as DocsTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-1 py-2 text-xs font-bold uppercase tracking-[0.08em] transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            {translate(tab === "my-docs" ? "docs.tabs.myDocs" : "docs.tabs.templates")}
          </button>
        ))}
      </div>

      {activeTab === "templates" ? (
        <TemplatesLibrary
          tenantId={tenant.id}
          locale={locale}
          onGenerated={(result) => {
            setGeneratedNotice(
              translate("docs.generatedNotice", { title: result.title }),
            );
            if (result.download_url) {
              const link = window.document.createElement("a");
              link.href = result.download_url;
              link.download = result.file_name;
              link.rel = "noopener noreferrer";
              window.document.body.appendChild(link);
              link.click();
              window.document.body.removeChild(link);
            }
            setActiveTab("my-docs");
          }}
        />
      ) : (
        <div className="flex h-[calc(100vh-16rem)] overflow-hidden border-y border-border bg-transparent">
          <div className="flex w-full flex-col border-r border-border bg-muted md:w-1/3">
            <div className="border-b border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <DocSearchBar value={query} onChange={setQuery} onClear={() => setQuery("")} />
                <Button onClick={() => setCreateOpen(true)} className="shrink-0">
                  {translate("docs.createAction")}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {translate("common.tenant")}: {tenant.name}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading && <div className="p-6 text-sm text-muted-foreground">{translate("common.loading")}</div>}
              {!loading && Boolean(error) && <ErrorState message={normalizeError(error)} traceId={getTraceIdFromError(error)} />}
              {!loading && !error && (
                <DocList docs={docs} selectedId={selected?.id} onSelect={setSelected} />
              )}
            </div>
          </div>
          <div className="hidden flex-1 flex-col bg-card md:flex">
            <DocDetail
              doc={selected}
              tenantId={tenant.id}
              onEdit={() => setEditOpen(true)}
              onDelete={handleDelete}
              onExported={loadDocs}
            />
          </div>
          <DocCreateModal
            tenantId={tenant.id}
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            onCreated={loadDocs}
          />
          <DocEditModal
            tenantId={tenant.id}
            doc={selected}
            open={editOpen}
            onClose={() => setEditOpen(false)}
            onSaved={loadDocs}
          />
        </div>
      )}
    </div>
  );
}
