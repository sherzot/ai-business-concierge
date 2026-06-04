import React from "react";
import { useNavigate } from "react-router-dom";
import { Bot, ChevronRight, Zap } from "lucide-react";
import { TELEGRAM_BOT_URL } from "../types";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";
import { useAuthContext } from "../../auth/context/AuthContext";

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
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-8">
          <Zap size={14} aria-hidden="true" />
          {t.badge}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 max-w-3xl mx-auto">
          {t.title}
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          {t.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={TELEGRAM_BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-base transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
          >
            <Bot size={20} aria-hidden="true" />
            {t.ctaTelegram}
          </a>
          <button
            onClick={handleLoginClick}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-base transition-all"
          >
            {t.ctaLogin}
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
