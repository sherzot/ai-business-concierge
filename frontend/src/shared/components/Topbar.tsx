import React from "react";

export function Topbar({ title }: { title?: string }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6">
      <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
    </header>
  );
}
