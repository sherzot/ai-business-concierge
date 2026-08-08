import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight, Bot } from "lucide-react";
import { TELEGRAM_BOT_URL } from "../types";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";
import { useAuthContext } from "../../auth/context/AuthContext";
import { LandingSystemVisual } from "./LandingSystemVisual";

type HeroT = typeof landingI18n[LandingLocale]["hero"];

type Props = { t: HeroT };

export function HeroSection({ t }: Props) {
  const navigate = useNavigate();
  const { session, currentTenant } = useAuthContext();

  function handleLoginClick() {
    if (session) {
      const isAdmin = currentTenant?.role === "super_admin" || currentTenant?.role === "sub_admin";
      navigate(isAdmin ? "/admin" : "/app");
    } else {
      navigate("/login");
    }
  }

  return (
    <section className="relative min-h-[calc(100svh-68px)] overflow-hidden border-b border-border bg-background">
      <div className="editorial-page grid min-h-[calc(100svh-68px)] items-center gap-12 py-12 lg:grid-cols-12 lg:gap-16 lg:py-16">
        <div className="lg:col-span-7">
          <p className="editorial-kicker editorial-enter">{t.badge}</p>
          <h1 className="editorial-enter editorial-delay-1 mt-7 max-w-[760px] text-[clamp(3rem,7vw,6.7rem)] font-semibold leading-[0.94] tracking-[-0.075em] text-foreground">
            {t.title}
          </h1>
          <p className="editorial-copy editorial-enter editorial-delay-2 mt-7 max-w-xl">
            {t.subtitle}
          </p>

          <div className="editorial-enter editorial-delay-3 mt-9 flex flex-col gap-3 sm:flex-row">
          <a
            href={TELEGRAM_BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="editorial-btn-primary"
          >
            <Bot size={20} aria-hidden="true" />
            {t.ctaTelegram}
          </a>
          <button
            onClick={handleLoginClick}
            className="editorial-btn-secondary"
          >
            {t.ctaLogin}
            <ArrowUpRight size={17} aria-hidden="true" />
          </button>
        </div>
          <a href="#features" className="mt-14 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground">
            Explore system <ArrowDownRight size={15} />
          </a>
        </div>

        <div className="editorial-enter editorial-delay-2 hidden lg:col-span-5 lg:block">
          <LandingSystemVisual />
        </div>
      </div>
    </section>
  );
}
