import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { useI18n } from "../../app/providers/I18nProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { translate } = useI18n();
  const label = translate(theme === "dark" ? "theme.toLight" : "theme.toDark");

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
