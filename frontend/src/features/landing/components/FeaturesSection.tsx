import React from "react";
import { ArrowUpRight, Check } from "lucide-react";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";

type FeaturesT = typeof landingI18n[LandingLocale]["features"];

type Props = { t: FeaturesT };

export function FeaturesSection({ t }: Props) {
  const features = [
    { index: "01", item: t.maslahatchi, status: "Live", active: true },
    { index: "02", item: t.hujjatchi, status: t.soon, active: false },
    { index: "03", item: t.sotuvchi, status: t.soon, active: false },
  ];

  return (
    <section className="editorial-section bg-background" id="features">
      <div className="editorial-page">
        <header className="mb-12 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="editorial-kicker">Product system</p>
            <h2 className="editorial-title mt-6">{t.title}</h2>
          </div>
          <p className="editorial-copy text-base lg:col-span-4">{t.subtitle}</p>
        </header>

        <div className="editorial-rule-list">
          {features.map(({ index, item, status, active }) => (
            <article key={item.title} className="group grid gap-6 py-9 md:grid-cols-12 md:items-start lg:py-12">
              <div className="flex items-center justify-between md:col-span-2 md:block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{index}</span>
                <span className={`mt-0 md:mt-5 md:block text-[11px] font-bold uppercase tracking-[0.14em] ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {status}
                </span>
              </div>
              <div className="md:col-span-4">
                <h3 className="text-2xl font-semibold tracking-[-0.035em] text-foreground sm:text-3xl">{item.title}</h3>
                <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">{item.desc}</p>
              </div>
              <ul className="grid gap-3 md:col-span-5 lg:grid-cols-2">
                {item.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 text-sm leading-6 text-foreground">
                    <Check size={14} className="mt-1 shrink-0 text-primary" />
                    {bullet}
                  </li>
                ))}
              </ul>
              <ArrowUpRight className="hidden text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 md:col-span-1 md:block" size={20} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
