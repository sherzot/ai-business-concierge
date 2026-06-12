import React from "react";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";

type ForWhoT = typeof landingI18n[LandingLocale]["forWho"];

type Props = { t: ForWhoT };

export function ForWhoSection({ t }: Props) {
  return (
    <section className="py-20 sm:py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">{t.title}</h2>
          <p className="text-slate-600 text-lg">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.items.map((item, idx) => (
            <div
              key={item.title}
              className={`rounded-2xl border p-6 flex gap-4 transition-all hover:border-indigo-300 hover:shadow-sm ${
                idx === t.items.length - 1 && t.items.length % 3 !== 0
                  ? "lg:col-span-1"
                  : ""
              } bg-white border-slate-200`}
            >
              <div
                className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 text-2xl"
                aria-hidden="true"
              >
                {item.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
