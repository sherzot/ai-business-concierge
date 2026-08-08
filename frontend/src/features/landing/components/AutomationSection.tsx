import React from "react";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";

type AutomationT = typeof landingI18n[LandingLocale]["automation"];

type Props = { t: AutomationT };

export function AutomationSection({ t }: Props) {
  return (
    <section className="editorial-section border-b border-border bg-background">
      <div className="editorial-page">
        <header className="mb-12 max-w-3xl">
          <p className="editorial-kicker">Automation</p>
          <h2 className="editorial-title mt-6">{t.title}</h2>
          <p className="editorial-copy mt-6">{t.subtitle}</p>
        </header>

        <div className="grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-4">
          {t.items.map((item, index) => (
            <article key={item.title} className="min-h-56 border-b border-r border-border p-6 transition-colors hover:bg-card lg:p-7">
              <span className="text-[11px] font-bold tracking-[0.16em] text-primary">0{index + 1}</span>
              <h3 className="mt-12 text-lg font-semibold tracking-[-0.02em] text-foreground">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
