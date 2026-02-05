import React from "react";

export function Sidebar({ children }: { children?: React.ReactNode }) {
  return <aside className="bg-slate-900 text-white">{children}</aside>;
}
