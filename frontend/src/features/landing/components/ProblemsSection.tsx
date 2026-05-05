import React from "react";
import { X, Check } from "lucide-react";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";

type ProblemsT = typeof landingI18n[LandingLocale]["problems"];

type Props = { t: ProblemsT };

export function ProblemsSection({ t }: Props) {
  return (
    <section className="py-20 sm:py-24 bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t.title}</h2>
          <p className="text-slate-400 text-lg">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {t.items.map((item) => (
            <div
              key={item.problem}
              className="rounded-2xl bg-slate-800/50 border border-white/10 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">{item.emoji}</span>
                <h3 className="text-base font-bold text-white">{item.problem}</h3>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <X size={14} className="text-red-400" aria-hidden="true" />
                    <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">
                      {t.beforeLabel}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{item.before}</p>
                </div>
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Check size={14} className="text-emerald-400" aria-hidden="true" />
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                      {t.afterLabel}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{item.after}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
