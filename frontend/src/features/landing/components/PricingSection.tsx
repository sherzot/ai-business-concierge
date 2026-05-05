import React from "react";
import { Check } from "lucide-react";
import { TELEGRAM_BOT_URL } from "../types";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";

type PricingT = typeof landingI18n[LandingLocale]["pricing"];

type Props = { t: PricingT };

export function PricingSection({ t }: Props) {
  return (
    <section className="py-20 sm:py-24 bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t.title}</h2>
          <p className="text-slate-400 text-lg">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="rounded-2xl bg-slate-800 border border-white/10 p-8">
            <h3 className="text-lg font-semibold text-slate-300 mb-1">{t.free.name}</h3>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-extrabold text-white">{t.free.price}</span>
              <span className="text-slate-400 mb-1">{t.free.period}</span>
            </div>
            <ul className="space-y-3 mb-8">
              {t.free.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-slate-300 text-sm">
                  <Check size={16} className="text-indigo-400 flex-shrink-0" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-colors"
            >
              {t.free.cta}
            </a>
          </div>

          <div className="relative rounded-2xl bg-slate-800/50 border border-white/10 p-8 opacity-75">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-semibold">
              {t.pro.badge}
            </span>
            <h3 className="text-lg font-semibold text-slate-300 mb-1">{t.pro.name}</h3>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-4xl font-extrabold text-white">{t.pro.price}</span>
              <span className="text-slate-400 mb-1">{t.pro.period}</span>
            </div>
            <ul className="space-y-3 mb-8">
              {t.pro.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-slate-300 text-sm">
                  <Check size={16} className="text-slate-500 flex-shrink-0" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              disabled
              aria-disabled="true"
              className="block w-full text-center py-3 rounded-xl bg-slate-700 text-slate-500 font-semibold cursor-not-allowed"
            >
              {t.pro.cta}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
