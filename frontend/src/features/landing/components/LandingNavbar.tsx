import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import type { LandingLocale } from "../types";
import type { landingI18n } from "../i18n";
import { LocaleSelect } from "../../../shared/components/LocaleSelect";
import type { Locale } from "../../../app/i18n";

type NavT = typeof landingI18n[LandingLocale]["nav"];

type Props = {
  locale: LandingLocale;
  onLocaleChange: (l: LandingLocale) => void;
  t: NavT;
};

export function LandingNavbar({ locale, onLocaleChange, t }: Props) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg hidden sm:block">
            AI Business Concierge
          </span>
          <span className="font-bold text-white text-lg sm:hidden">ABC</span>
        </div>

        <div className="flex items-center gap-3">
          <LocaleSelect
            variant="dark"
            locale={locale as Locale}
            onLocaleChange={(l) => onLocaleChange(l as LandingLocale)}
          />
          <a
            href="#company-onboarding"
            className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-medium border border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10 transition-colors"
          >
            {t.contact}
          </a>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {t.login}
          </button>
        </div>
      </div>
    </header>
  );
}
