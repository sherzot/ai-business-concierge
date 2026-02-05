import React from "react";
import { useI18n } from "../../../app/providers/I18nProvider";
import type { Locale } from "../../../app/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale, translate } = useI18n();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">{translate("common.language")}</h3>
      <div className="flex gap-2">
        {[
          { id: "uz", label: "O'zbek" },
          { id: "ru", label: "Русский" },
          { id: "en", label: "English" },
          { id: "ja", label: "日本語" },
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => {
              setLocale(opt.id as Locale);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
              locale === opt.id ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
