import React from "react";
import { MessageSquare, FileText, ShoppingCart, Check } from "lucide-react";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";

type FeaturesT = typeof landingI18n[LandingLocale]["features"];

type Props = { t: FeaturesT };

export function FeaturesSection({ t }: Props) {
  return (
    <section className="py-20 sm:py-24 bg-slate-950" id="features">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t.title}</h2>
          <p className="text-slate-400 text-lg">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Maslahatchi — active */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-900/20 border border-indigo-500/25 p-7 hover:border-indigo-500/50 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/25 flex items-center justify-center mb-5">
              <MessageSquare size={22} className="text-indigo-400" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t.maslahatchi.title}</h3>
            <p className="text-slate-400 leading-relaxed mb-5 text-sm">{t.maslahatchi.desc}</p>
            <ul className="space-y-2">
              {t.maslahatchi.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-slate-300 text-sm">
                  <Check size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* AI Hujjatchi — soon */}
          <div className="relative rounded-2xl bg-slate-800/40 border border-white/10 p-7 opacity-80">
            <span className="absolute top-5 right-5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium">
              {t.soon}
            </span>
            <div className="w-12 h-12 rounded-xl bg-slate-700/60 flex items-center justify-center mb-5">
              <FileText size={22} className="text-slate-400" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t.hujjatchi.title}</h3>
            <p className="text-slate-500 leading-relaxed mb-5 text-sm">{t.hujjatchi.desc}</p>
            <ul className="space-y-2">
              {t.hujjatchi.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-slate-500 text-sm">
                  <Check size={14} className="text-slate-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* AI Sotuvchi — soon */}
          <div className="relative rounded-2xl bg-slate-800/40 border border-white/10 p-7 opacity-80">
            <span className="absolute top-5 right-5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium">
              {t.soon}
            </span>
            <div className="w-12 h-12 rounded-xl bg-slate-700/60 flex items-center justify-center mb-5">
              <ShoppingCart size={22} className="text-slate-400" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t.sotuvchi.title}</h3>
            <p className="text-slate-500 leading-relaxed mb-5 text-sm">{t.sotuvchi.desc}</p>
            <ul className="space-y-2">
              {t.sotuvchi.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-slate-500 text-sm">
                  <Check size={14} className="text-slate-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
