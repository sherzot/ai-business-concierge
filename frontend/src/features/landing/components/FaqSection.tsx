import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";

type FaqT = typeof landingI18n[LandingLocale]["faq"];

type Props = { t: FaqT };

export function FaqSection({ t }: Props) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 bg-slate-950" id="faq">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
          {t.title}
        </h2>

        <div className="space-y-2">
          {t.items.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/8 bg-slate-800/40 overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-800/60 transition-colors"
                aria-expanded={open === i}
              >
                <span className="text-sm font-medium text-white">{item.q}</span>
                <ChevronDown
                  size={16}
                  className={`flex-shrink-0 text-slate-400 transition-transform duration-200 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>

              {open === i && (
                <div className="px-5 pb-4 text-sm text-slate-300 leading-relaxed border-t border-white/8 pt-3">
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
