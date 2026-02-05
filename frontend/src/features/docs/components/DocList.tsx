import React from "react";
import { FileText } from "lucide-react";
import { DocStatus, DocStatusBadge } from "./DocStatusBadge";
import { useI18n } from "../../../app/providers/I18nProvider";

export type DocItem = {
  id: string;
  title: string;
  owner: string;
  updatedAt: string;
  status: DocStatus;
  content?: string;
};

export function DocList({
  docs,
  selectedId,
  onSelect,
}: {
  docs: DocItem[];
  selectedId?: string;
  onSelect: (doc: DocItem) => void;
}) {
  const { translate } = useI18n();
  if (!docs.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
        <FileText size={32} className="mb-2 opacity-40" />
        <p className="text-sm">{translate("docs.empty")}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {docs.map((doc) => (
        <button
          key={doc.id}
          onClick={() => onSelect(doc)}
          className={`w-full text-left p-4 hover:bg-white transition-colors ${
            selectedId === doc.id ? "bg-white border-l-4 border-indigo-600" : "bg-transparent border-l-4 border-transparent"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-800">{doc.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{translate("docs.owner")}: {doc.owner}</p>
            </div>
            <DocStatusBadge status={doc.status} />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {translate("docs.updatedAt")}: {doc.updatedAt}
          </p>
        </button>
      ))}
    </div>
  );
}
