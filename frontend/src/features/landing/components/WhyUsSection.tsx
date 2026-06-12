import React from "react";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";

type WhyUsT = typeof landingI18n[LandingLocale]["whyUs"];

type Props = { t: WhyUsT };

export function WhyUsSection({ t }: Props) {
  return (
    <section className="py-20 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">{t.title}</h2>
          <p className="text-slate-600 text-lg max-w-3xl mx-auto">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.items.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl bg-white border border-slate-200 p-6 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="text-3xl mb-4" aria-hidden="true">{item.icon}</div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
