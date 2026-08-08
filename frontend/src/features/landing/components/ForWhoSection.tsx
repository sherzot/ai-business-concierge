import React from "react";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";

type ForWhoT = typeof landingI18n[LandingLocale]["forWho"];

type Props = { t: ForWhoT };

export function ForWhoSection({ t }: Props) {
  return (
    <section className="editorial-section bg-card">
      <div className="editorial-page grid gap-12 lg:grid-cols-12">
        <header className="lg:col-span-4">
          <p className="editorial-kicker">Teams</p>
          <h2 className="editorial-title mt-6 !text-[clamp(2rem,4vw,3rem)]">{t.title}</h2>
          <p className="editorial-copy mt-6 text-base">{t.subtitle}</p>
        </header>

        <div className="editorial-rule-list lg:col-span-8">
          {t.items.map((item, index) => (
            <article key={item.title} className="grid gap-4 py-6 sm:grid-cols-[3rem_1fr_1.4fr] sm:gap-6">
              <span className="text-[11px] font-bold tracking-[0.16em] text-primary">0{index + 1}</span>
              <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
