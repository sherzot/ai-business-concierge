import React from "react";

export function Topbar({ title }: { title?: string }) {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center px-6">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
    </header>
  );
}
