import React from "react";
import { FileText } from "lucide-react";
import { DocItem } from "./DocList";
import { DocStatusBadge } from "./DocStatusBadge";

export function DocDetail({ doc }: { doc?: DocItem }) {
  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <FileText size={32} className="mb-2 opacity-40" />
        <p className="text-sm">Hujjatni tanlang</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{doc.title}</h2>
          <p className="text-xs text-slate-500 mt-1">Owner: {doc.owner}</p>
        </div>
        <DocStatusBadge status={doc.status} />
      </div>

      <div className="text-sm text-slate-600 leading-relaxed">
        <p className="mb-3">
          {doc.content ||
            "Ushbu hujjat kompaniya ichki siyosatlari va jarayonlariga tegishli. Mazmuni tekshirilmoqda va tasdiqlangandan so'ng tegishli bo'limlarga tarqatiladi."}
        </p>
        <p className="text-xs text-slate-400">Oxirgi yangilanish: {doc.updatedAt}</p>
      </div>
    </div>
  );
}
