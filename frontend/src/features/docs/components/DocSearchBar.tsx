import React from "react";
import { Search, X } from "lucide-react";
import { useI18n } from "../../../app/providers/I18nProvider";

export function DocSearchBar({
  value,
  onChange,
  onClear,
}: {
  value: string;
  onChange: (next: string) => void;
  onClear: () => void;
}) {
  const { translate } = useI18n();
  return (
    <div className="relative flex-1">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={translate("docs.searchPlaceholder")}
        className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-8 text-sm text-foreground focus:ring-2 focus:ring-primary"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
          aria-label={translate("common.clearSearch")}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
