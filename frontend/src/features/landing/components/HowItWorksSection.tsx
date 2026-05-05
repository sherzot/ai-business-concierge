import React from "react";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";

type HowItWorksT = typeof landingI18n[LandingLocale]["howItWorks"];

type Props = { t: HowItWorksT };

export function HowItWorksSection({ t }: Props) {
  const steps = [
    { step: "1", title: t.step1.title, desc: t.step1.desc },
    { step: "2", title: t.step2.title, desc: t.step2.desc },
    { step: "3", title: t.step3.title, desc: t.step3.desc },
  ];

  return (
    <section className="py-20 sm:py-24 bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t.title}</h2>
          <p className="text-slate-400 text-lg">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-14 h-14 rounded-full bg-indigo-500/20 border-2 border-indigo-500/40 flex items-center justify-center mx-auto mb-5">
                <span className="text-2xl font-bold text-indigo-400">{s.step}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
