import React from "react";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";

type AutomationT = typeof landingI18n[LandingLocale]["automation"];

type Props = { t: AutomationT };

export function AutomationSection({ t }: Props) {
  return (
    <section className="py-20 sm:py-24 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t.title}</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {t.items.map((item) => (
            <div
              key={item.title}
              className="rounded-xl bg-slate-800/40 border border-white/8 p-5 hover:bg-slate-800/70 hover:border-indigo-500/20 transition-all"
            >
              <div className="text-2xl mb-3" aria-hidden="true">{item.icon}</div>
              <h3 className="text-sm font-bold text-white mb-1.5">{item.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
