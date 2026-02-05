import React from "react";

export function EmptyState({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-6 text-slate-400">
      {message ?? "Ma'lumot yo'q."}
    </div>
  );
}
