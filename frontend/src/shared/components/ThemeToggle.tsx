import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
      aria-label={theme === "dark" ? "Yorug' rejim" : "Qorong'i rejim"}
      title={theme === "dark" ? "Yorug' rejim" : "Qorong'i rejim"}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
