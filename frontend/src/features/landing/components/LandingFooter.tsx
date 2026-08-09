import React from "react";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";
import { BrandLockup } from "../../../shared/components/BrandMark";

type FooterT = typeof landingI18n[LandingLocale]["footer"];

type Props = { t: FooterT };

const FOOTER_LINKS = [
  { label: (t: FooterT) => t.links.features, href: "#features" },
  { label: (t: FooterT) => t.links.pricing,  href: "#pricing" },
  { label: (t: FooterT) => t.links.faq,      href: "#faq" },
  { label: (t: FooterT) => t.links.contact,  href: "#company-onboarding" },
] as const;

export function LandingFooter({ t }: Props) {
  function scrollTo(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer className="border-t border-border bg-background py-10">
      <div className="editorial-page">
        <div className="flex flex-col items-start justify-between gap-7 sm:flex-row sm:items-center">
          <div>
            <BrandLockup compact />
            <p className="mt-3 text-sm text-muted-foreground">{t.tagline}</p>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-1 flex-wrap justify-center">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollTo(e, link.href)}
                className="px-2 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label(t)}
              </a>
            ))}
          </nav>
        </div>

        <p className="mt-8 border-t border-border pt-6 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{t.rights}</p>
      </div>
    </footer>
  );
}
