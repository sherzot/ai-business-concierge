import React from "react";
import { useI18n } from "../../../app/providers/I18nProvider";
import type { Locale } from "../../../app/i18n";

const LOCALE_OPTIONS: { id: Locale; flag: string; label: string }[] = [
  { id: "uz", flag: "🇺🇿", label: "O'zbek" },
  { id: "ru", flag: "🇷🇺", label: "Русский" },
  { id: "en", flag: "🇬🇧", label: "English" },
  { id: "ja", flag: "🇯🇵", label: "日本語" },
];

export function LanguageSwitcher() {
  const { locale, setLocale, translate } = useI18n();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">{translate("common.language")}</h3>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="rounded-lg border border-slate-200 bg-white text-slate-700 text-sm px-3 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-colors"
      >
        {LOCALE_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.flag} {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
