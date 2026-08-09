import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { LandingLocale } from "../types";
import type { landingI18n } from "../i18n";
import { LocaleSelect } from "../../../shared/components/LocaleSelect";
import type { Locale } from "../../../app/i18n";
import { useAuthContext } from "../../auth/context/AuthContext";
import { BrandLockup } from "../../../shared/components/BrandMark";

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
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="editorial-page flex h-[68px] items-center justify-between">
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <BrandLockup compact />
        </button>

        {/* Anchor nav — hidden on mobile */}
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Landing navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => scrollTo(e, link.href)}
              className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label(t)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LocaleSelect
            variant="light"
            locale={locale as Locale}
            onLocaleChange={(l) => onLocaleChange(l as LandingLocale)}
          />
          <button
            onClick={handleLoginClick}
            className="editorial-btn-primary min-h-10 px-4 py-2 text-xs"
          >
            {t.login}
            <ArrowUpRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
