import React from "react";
import { Bot } from "lucide-react";
import { TELEGRAM_BOT_URL, TELEGRAM_BOT_HANDLE } from "../types";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";

type HeroT = typeof landingI18n[LandingLocale]["hero"];

type Props = { t: HeroT };

export function LandingCtaBanner({ t }: Props) {
  return (
    <section className="py-16 bg-gradient-to-r from-indigo-600 to-indigo-500">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          {t.ctaTelegram}
        </h2>
        <p className="text-indigo-100 mb-8 text-lg">{t.subtitle}</p>
        <a
          href={TELEGRAM_BOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-indigo-600 font-bold text-lg hover:bg-indigo-50 transition-colors shadow-xl"
        >
          <Bot size={22} aria-hidden="true" />
          {TELEGRAM_BOT_HANDLE}
        </a>
      </div>
    </section>
  );
}
