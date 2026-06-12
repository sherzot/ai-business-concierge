import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import type { LandingLocale } from "../types";
import type { landingI18n } from "../i18n";
import { LocaleSelect } from "../../../shared/components/LocaleSelect";
import type { Locale } from "../../../app/i18n";
import { useAuthContext } from "../../auth/context/AuthContext";

type NavT = typeof landingI18n[LandingLocale]["nav"];

type Props = {
  locale: LandingLocale;
  onLocaleChange: (l: LandingLocale) => void;
  t: NavT;
};

const NAV_LINKS = [
  { label: (t: NavT) => t.features, href: "#features" },
  { label: (t: NavT) => t.pricing,  href: "#pricing" },
  { label: (t: NavT) => t.faq,      href: "#faq" },
  { label: (t: NavT) => t.contact,  href: "#company-onboarding" },
] as const;

export function LandingNavbar({ locale, onLocaleChange, t }: Props) {
  const navigate = useNavigate();
  const { session, currentTenant } = useAuthContext();

  function scrollTo(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleLoginClick() {
    if (session) {
      const isAdmin = currentTenant?.role === "super_admin" || currentTenant?.role === "sub_admin";
      navigate(isAdmin ? "/admin" : "/app");
    } else {
      navigate("/login");
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg hidden sm:block">
            AI Business Concierge
          </span>
          <span className="font-bold text-slate-900 text-lg sm:hidden">ABC</span>
        </div>

        {/* Anchor nav — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => scrollTo(e, link.href)}
              className="px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              {link.label(t)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSelect
            variant="light"
            locale={locale as Locale}
            onLocaleChange={(l) => onLocaleChange(l as LandingLocale)}
          />
          <button
            onClick={handleLoginClick}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            {t.login}
          </button>
        </div>
      </div>
    </header>
  );
}
