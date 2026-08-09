import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";

type FaqT = typeof landingI18n[LandingLocale]["faq"];

type Props = { t: FaqT };

export function FaqSection({ t }: Props) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="editorial-section bg-card" id="faq">
      <div className="editorial-page grid gap-12 lg:grid-cols-12">
        <header className="lg:col-span-4">
          <p className="editorial-kicker">FAQ</p>
          <h2 className="editorial-title mt-6 !text-[clamp(1.9rem,3.4vw,2.75rem)]">{t.title}</h2>
        </header>

        <div className="border-t border-border lg:col-span-8">
          {t.items.map((item, i) => (
            <div key={item.q} className="border-b border-border">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-6 py-6 text-left text-foreground transition-colors hover:text-primary"
                aria-expanded={open === i}
              >
                <span className="text-base font-semibold tracking-[-0.015em]">{item.q}</span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>

              {open === i && (
                <div className="max-w-2xl pb-6 pr-10 text-sm leading-7 text-muted-foreground">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
