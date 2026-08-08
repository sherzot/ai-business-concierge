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
    <section className="editorial-section border-y border-border bg-background">
      <div className="editorial-page">
        <header className="mb-12 max-w-3xl">
          <p className="editorial-kicker">Workflow</p>
          <h2 className="editorial-title mt-6">{t.title}</h2>
          <p className="editorial-copy mt-6">{t.subtitle}</p>
        </header>

        <div className="grid border-t border-border md:grid-cols-3">
          {steps.map((s) => (
            <article key={s.step} className="border-b border-border py-8 md:border-r md:px-7 md:last:border-r-0">
              <span className="text-4xl font-semibold tracking-[-0.05em] text-primary">0{s.step}</span>
              <h3 className="mt-10 text-xl font-semibold tracking-[-0.03em] text-foreground">{s.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{s.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
