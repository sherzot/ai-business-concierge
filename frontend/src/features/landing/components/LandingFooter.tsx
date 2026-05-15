import React from "react";
import { Sparkles } from "lucide-react";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";

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
    <footer className="py-10 bg-slate-950 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Sparkles size={14} className="text-indigo-400" aria-hidden="true" />
            </div>
            <span className="text-slate-400 text-sm">{t.tagline}</span>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-1 flex-wrap justify-center">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollTo(e, link.href)}
                className="px-3 py-1 text-sm text-slate-500 hover:text-slate-300 transition-colors rounded-lg hover:bg-white/5"
              >
                {link.label(t)}
              </a>
            ))}
          </nav>
        </div>

        <p className="text-slate-600 text-xs text-center mt-6">{t.rights}</p>
      </div>
    </footer>
  );
}
