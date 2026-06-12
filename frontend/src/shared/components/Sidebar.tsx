import React from "react";

export function Sidebar({ children }: { children?: React.ReactNode }) {
  return <aside className="bg-sidebar border-r border-sidebar-border text-sidebar-foreground">{children}</aside>;
}
