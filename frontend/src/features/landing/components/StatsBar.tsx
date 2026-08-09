import React from "react";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";

type StatsT = typeof landingI18n[LandingLocale]["stats"];

type Props = { t: StatsT };

export function StatsBar({ t }: Props) {
  return (
    <section className="border-b border-border bg-background" aria-label="Product metrics">
      <div className="editorial-page">
        <dl className="grid grid-cols-2 border-l border-border md:grid-cols-4">
          {t.items.map((item) => (
            <div key={item.label} className="border-r border-border px-5 py-7 sm:px-7 sm:py-9">
              <dt className="text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-4xl tabular-nums">
                {item.value}
              </dt>
              <dd className="mt-2 text-[11px] font-semibold uppercase leading-5 tracking-[0.12em] text-muted-foreground">{item.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
