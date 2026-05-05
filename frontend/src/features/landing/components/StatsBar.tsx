import React from "react";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";

type StatsT = typeof landingI18n[LandingLocale]["stats"];

type Props = { t: StatsT };

export function StatsBar({ t }: Props) {
  return (
    <div className="bg-indigo-600/10 border-y border-indigo-500/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {t.items.map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-400 mb-1">
                {item.value}
              </div>
              <div className="text-sm text-slate-400">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
