import React from "react";
import { MessageSquare, FileText, ShoppingCart } from "lucide-react";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";

type FeaturesT = typeof landingI18n[LandingLocale]["features"];

type Props = { t: FeaturesT };

export function FeaturesSection({ t }: Props) {
  return (
    <section className="py-20 sm:py-24 bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t.title}</h2>
          <p className="text-slate-400 text-lg">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-900/20 border border-indigo-500/20 p-6 hover:border-indigo-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-5">
              <MessageSquare size={22} className="text-indigo-400" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{t.maslahatchi.title}</h3>
            <p className="text-slate-400 leading-relaxed">{t.maslahatchi.desc}</p>
          </div>

          <div className="relative rounded-2xl bg-slate-800/50 border border-white/10 p-6 opacity-75">
            <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium">
              {t.soon}
            </span>
            <div className="w-12 h-12 rounded-xl bg-slate-700/60 flex items-center justify-center mb-5">
              <FileText size={22} className="text-slate-400" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{t.hujjatchi.title}</h3>
            <p className="text-slate-500 leading-relaxed">{t.hujjatchi.desc}</p>
          </div>

          <div className="relative rounded-2xl bg-slate-800/50 border border-white/10 p-6 opacity-75">
            <span className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium">
              {t.soon}
            </span>
            <div className="w-12 h-12 rounded-xl bg-slate-700/60 flex items-center justify-center mb-5">
              <ShoppingCart size={22} className="text-slate-400" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{t.sotuvchi.title}</h3>
            <p className="text-slate-500 leading-relaxed">{t.sotuvchi.desc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
