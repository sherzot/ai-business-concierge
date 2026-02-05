import React from "react";
import { DocDetail } from "../components/DocDetail";
import { DocList, DocItem } from "../components/DocList";
import { DocSearchBar } from "../components/DocSearchBar";
import { getDocs } from "../api/docsApi";
import { useI18n } from "../../../app/providers/I18nProvider";

export function DocsPage({ tenant }: { tenant: { id: string; name: string } }) {
  const { translate } = useI18n();
  const [query, setQuery] = React.useState("");
  const [docs, setDocs] = React.useState<DocItem[]>([]);
  const [selected, setSelected] = React.useState<DocItem | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadDocs();
  }, [tenant.id, query]);

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
      }));
      setDocs(mapped);
      setSelected(mapped[0]);
    } catch (err) {
      console.error("Failed to load docs", err);
      setError(translate("docs.loadError"));
      setDocs([]);
      setSelected(undefined);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="w-full md:w-1/3 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <DocSearchBar value={query} onChange={setQuery} onClear={() => setQuery("")} />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {translate("common.tenant")}: {tenant.name}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading && <div className="p-6 text-sm text-slate-400">{translate("common.loading")}</div>}
          {!loading && error && <div className="p-6 text-sm text-rose-600">{error}</div>}
          {!loading && !error && (
            <DocList docs={docs} selectedId={selected?.id} onSelect={setSelected} />
          )}
        </div>
      </div>
      <div className="hidden md:flex flex-1 flex-col bg-white">
        <DocDetail doc={selected} />
      </div>
    </div>
  );
}
