import React from "react";
import { X, Check } from "lucide-react";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";

type ProblemsT = typeof landingI18n[LandingLocale]["problems"];

type Props = { t: ProblemsT };

export function ProblemsSection({ t }: Props) {
  return (
    <section className="editorial-section bg-card">
      <div className="editorial-page">
        <header className="mb-12 grid gap-7 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="editorial-kicker">Before / after</p>
            <h2 className="editorial-title mt-6">{t.title}</h2>
          </div>
          <p className="editorial-copy text-base lg:col-span-4">{t.subtitle}</p>
        </header>

        <div className="editorial-rule-list">
          {t.items.map((item, index) => (
            <article key={item.problem} className="grid gap-6 py-8 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-4">
                <span className="text-[11px] font-bold tracking-[0.16em] text-primary">0{index + 1}</span>
                <h3 className="mt-4 text-xl font-semibold tracking-[-0.025em] text-foreground">{item.problem}</h3>
              </div>
              <div className="lg:col-span-4">
                <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-status-danger">
                  <X size={13} /> {t.beforeLabel}
                </div>
                <p className="text-sm leading-7 text-muted-foreground">{item.before}</p>
              </div>
              <div className="lg:col-span-4">
                <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-status-success">
                  <Check size={13} /> {t.afterLabel}
                </div>
                <p className="text-sm leading-7 text-foreground">{item.after}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
