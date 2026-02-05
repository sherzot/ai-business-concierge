import React from "react";

export type DocStatus = "draft" | "review" | "approved" | "expired";

const statusStyles: Record<DocStatus, string> = {
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  review: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  expired: "bg-rose-50 text-rose-700 border-rose-200",
};

const statusLabels: Record<DocStatus, string> = {
  draft: "Draft",
  review: "Review",
  approved: "Approved",
  expired: "Expired",
};

export function DocStatusBadge({ status }: { status: DocStatus }) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}
