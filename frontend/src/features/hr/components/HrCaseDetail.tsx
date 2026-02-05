import React from "react";
import { User, Tag } from "lucide-react";
import { HrCase } from "./HrCaseList";

export function HrCaseDetail({ item }: { item?: HrCase }) {
  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <User size={32} className="mb-2 opacity-40" />
        <p className="text-sm">HR case tanlang</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
          <p className="text-xs text-slate-500 mt-1">{item.employee}</p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full border bg-slate-100 text-slate-600">
          {item.status.replace("_", " ")}
        </span>
      </div>

      <div className="text-sm text-slate-600 leading-relaxed">
        <p className="mb-3">{item.summary}</p>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Tag size={12} /> Priority: {item.priority}
        </div>
      </div>
    </div>
  );
}
