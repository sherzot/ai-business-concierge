import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;           // 1-indexed
  totalPages: number;
  onPageChange: (p: number) => void;
  pageSize?: number;
  totalItems?: number;
  className?: string;
};

export function Pagination({ page, totalPages, onPageChange, pageSize, totalItems, className = "" }: Props) {
  if (totalPages <= 1) return null;

  // Show at most 5 page buttons: current ± 2
  const pages: (number | "…")[] = [];
  const delta = 2;
  const left = Math.max(1, page - delta);
  const right = Math.min(totalPages, page + delta);

  if (left > 1) { pages.push(1); if (left > 2) pages.push("…"); }
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages) { if (right < totalPages - 1) pages.push("…"); pages.push(totalPages); }

  const from = pageSize ? (page - 1) * pageSize + 1 : null;
  const to = pageSize && totalItems ? Math.min(page * pageSize, totalItems) : null;

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 pt-4 ${className}`}>
      {/* Info */}
      {from !== null && to !== null && totalItems !== undefined ? (
        <p className="text-xs text-slate-500">
          {from}–{to} / {totalItems} ta
        </p>
      ) : (
        <span />
      )}

      {/* Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Oldingi"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-slate-400 text-sm select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`min-w-[30px] h-7 px-2 rounded-lg text-xs font-medium transition-all ${
                p === page
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Keyingi"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/** Helper: slice an array for the current page */
export function paginateArray<T>(arr: T[], page: number, pageSize: number): T[] {
  return arr.slice((page - 1) * pageSize, page * pageSize);
}
