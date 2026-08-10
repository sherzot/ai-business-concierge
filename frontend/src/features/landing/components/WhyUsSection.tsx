import React from "react";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";

type WhyUsT = typeof landingI18n[LandingLocale]["whyUs"];

type Props = { t: WhyUsT };

export function WhyUsSection({ t }: Props) {
  return (
    <section className="editorial-section editorial-inverse border-y border-foreground">
      <div className="editorial-page">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <header className="lg:col-span-7">
            <p className="editorial-kicker !text-[var(--brand-primary-hover)]">Why this system</p>
            <h2 className="editorial-title mt-6">{t.title}</h2>
            <p className="editorial-copy mt-7">{t.subtitle}</p>
          </header>
          <div className="lg:col-span-5">
            {t.items.map((item, index) => (
              <article key={item.title} className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-white/20 py-6 last:border-b">
                <span className="text-xs font-bold text-[var(--brand-primary-hover)]">0{index + 1}</span>
                <div>
                  <h3 className="text-base font-semibold text-[var(--editorial-inverse-fg)]">{item.title}</h3>
                  <p className="editorial-inverse-muted mt-2 text-sm leading-6">{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
