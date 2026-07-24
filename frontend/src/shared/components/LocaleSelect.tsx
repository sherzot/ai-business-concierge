import React from "react";
import { Globe, ChevronDown } from "lucide-react";
import { useI18n } from "../../app/providers/I18nProvider";
import type { Locale } from "../../app/i18n";

const LOCALES: { id: Locale; flag: string; label: string; short: string }[] = [
  { id: "uz", flag: "🇺🇿", label: "O'zbek",  short: "UZ" },
  { id: "ru", flag: "🇷🇺", label: "Русский", short: "RU" },
  { id: "en", flag: "🇬🇧", label: "English", short: "EN" },
  { id: "ja", flag: "🇯🇵", label: "日本語",  short: "JA" },
];

type Props = {
  variant?: "dark" | "light";
  locale?: Locale;
  onLocaleChange?: (l: Locale) => void;
};

/**
 * Globe + current flag + current lang name + transparent native <select> overlay.
 * Immediately signals "language switcher" — globe is universal, flag confirms locale.
 */
export function LocaleSelect({ variant = "dark", locale: propLocale, onLocaleChange }: Props) {
  const ctx = useI18n();
  const locale = propLocale ?? ctx.locale;
  const setLocale = onLocaleChange ?? ctx.setLocale;

  const current = LOCALES.find((l) => l.id === locale) ?? LOCALES[0];

  const dark =
    "bg-white/5 border-white/10 text-white/80 hover:border-white/25 hover:bg-white/8";
  const light =
    "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white";

  return (
    <div
      className={`relative inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-colors cursor-pointer select-none ${
        variant === "dark" ? dark : light
      }`}
    >
      {/* Globe — instantly signals "language" */}
      <Globe
        size={13}
        className={variant === "dark" ? "text-white/40 shrink-0" : "text-slate-400 shrink-0"}
      />

      {/* Current locale flag + name */}
      <span className="text-sm leading-none">{current.flag}</span>
      <span className="text-xs font-medium leading-none hidden sm:inline">
        {current.label}
      </span>
      <span className="text-xs font-medium leading-none sm:hidden">
        {current.short}
      </span>

      {/* Chevron */}
      <ChevronDown
        size={11}
        className={variant === "dark" ? "text-white/30" : "text-slate-400"}
      />

      {/* Native select — transparent overlay, full area clickable */}
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        aria-label={ctx.translate("common.selectLanguage")}
      >
        {LOCALES.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.flag} {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
