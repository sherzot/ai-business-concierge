import React from "react";
import { Bot } from "lucide-react";
import { TELEGRAM_BOT_URL, TELEGRAM_BOT_HANDLE } from "../types";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";

type HeroT = typeof landingI18n[LandingLocale]["hero"];

type Props = { t: HeroT };

export function LandingCtaBanner({ t }: Props) {
  return (
    <section className="editorial-section editorial-inverse">
      <div className="editorial-page grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <p className="editorial-kicker !text-[var(--brand-primary-hover)]">Start now</p>
          <h2 className="editorial-title mt-6">{t.ctaTelegram}</h2>
          <p className="editorial-copy mt-6">{t.subtitle}</p>
        </div>
        <div className="lg:col-span-4 lg:text-right">
          <a
            href={TELEGRAM_BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="editorial-btn-primary"
          >
            <Bot size={18} aria-hidden="true" />
            {TELEGRAM_BOT_HANDLE}
          </a>
        </div>
      </div>
    </section>
  );
}
