import React from "react";
import { Sparkles } from "lucide-react";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";

type FooterT = typeof landingI18n[LandingLocale]["footer"];

type Props = { t: FooterT };

export function LandingFooter({ t }: Props) {
  return (
    <footer className="py-10 bg-slate-950 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Sparkles size={14} className="text-indigo-400" aria-hidden="true" />
          </div>
          <span className="text-slate-400 text-sm">{t.tagline}</span>
        </div>
        <p className="text-slate-500 text-sm">{t.rights}</p>
      </div>
    </footer>
  );
}
