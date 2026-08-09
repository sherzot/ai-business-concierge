import React from "react";
import { Check } from "lucide-react";
import { TELEGRAM_BOT_URL } from "../types";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";

type PricingT = typeof landingI18n[LandingLocale]["pricing"];

type Props = { t: PricingT };

export function PricingSection({ t }: Props) {
  return (
    <section className="editorial-section border-y border-border bg-background" id="pricing">
      <div className="editorial-page">
        <header className="mb-12 max-w-3xl">
          <p className="editorial-kicker">Pricing</p>
          <h2 className="editorial-title mt-6">{t.title}</h2>
          <p className="editorial-copy mt-6">{t.subtitle}</p>
        </header>

        <div className="grid border-l border-t border-border md:grid-cols-2">
          <article className="border-b border-r border-border p-7 sm:p-10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground">{t.free.name}</h3>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">Available</span>
            </div>
            <div className="mt-10 flex items-end gap-2">
              <span className="text-5xl font-semibold tracking-[-0.06em] text-foreground">{t.free.price}</span>
              <span className="mb-1 text-sm text-muted-foreground">{t.free.period}</span>
            </div>
            <ul className="my-9 space-y-3">
              {t.free.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-foreground">
                  <Check size={15} className="shrink-0 text-primary" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="editorial-btn-primary w-full"
            >
              {t.free.cta}
            </a>
          </article>

          <article className="border-b border-r border-border p-7 sm:p-10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground">{t.pro.name}</h3>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{t.pro.badge}</span>
            </div>
            <div className="mt-10 flex items-end gap-2">
              <span className="text-5xl font-semibold tracking-[-0.06em] text-foreground">{t.pro.price}</span>
              <span className="mb-1 text-sm text-muted-foreground">{t.pro.period}</span>
            </div>
            <ul className="my-9 space-y-3">
              {t.pro.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check size={15} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              disabled
              aria-disabled="true"
              className="editorial-btn-secondary w-full cursor-not-allowed opacity-50"
            >
              {t.pro.cta}
            </button>
          </article>
        </div>
      </div>
    </section>
  );
}
