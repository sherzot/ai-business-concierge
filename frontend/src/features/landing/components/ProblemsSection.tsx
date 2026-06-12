import React from "react";
import { X, Check } from "lucide-react";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";

type ProblemsT = typeof landingI18n[LandingLocale]["problems"];

type Props = { t: ProblemsT };

export function ProblemsSection({ t }: Props) {
  return (
    <section className="py-20 sm:py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">{t.title}</h2>
          <p className="text-slate-600 text-lg">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {t.items.map((item) => (
            <div
              key={item.problem}
              className="rounded-2xl bg-white border border-slate-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">{item.emoji}</span>
                <h3 className="text-base font-bold text-slate-900">{item.problem}</h3>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-red-50 border border-red-100 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <X size={14} className="text-red-600" aria-hidden="true" />
                    <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                      {t.beforeLabel}
                    </span>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">{item.before}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Check size={14} className="text-emerald-600" aria-hidden="true" />
                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                      {t.afterLabel}
                    </span>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">{item.after}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
