import React from "react";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export type HrCase = {
  id: string;
  title: string;
  employee: string;
  status: "open" | "in_review" | "resolved";
  priority: "high" | "medium" | "low";
  createdAt: string;
  summary: string;
};

const statusMap: Record<HrCase["status"], { label: string; icon: JSX.Element; color: string }> = {
  open: { label: "Open", icon: <AlertTriangle size={12} />, color: "text-rose-600" },
  in_review: { label: "Review", icon: <Clock size={12} />, color: "text-amber-600" },
  resolved: { label: "Resolved", icon: <CheckCircle2 size={12} />, color: "text-emerald-600" },
};

export function HrCaseList({
  cases,
  selectedId,
  onSelect,
}: {
  cases: HrCase[];
  selectedId?: string;
  onSelect: (item: HrCase) => void;
}) {
  return (
    <div className="divide-y divide-slate-100">
      {cases.map((item) => {
        const meta = statusMap[item.status];
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={`w-full text-left p-4 hover:bg-white transition-colors ${
              selectedId === item.id ? "bg-white border-l-4 border-indigo-600" : "bg-transparent border-l-4 border-transparent"
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
              <span className={`text-[10px] flex items-center gap-1 ${meta.color}`}>
                {meta.icon} {meta.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{item.employee}</p>
            <p className="text-[10px] text-slate-400 mt-2">{item.createdAt}</p>
          </button>
        );
      })}
    </div>
  );
}
