import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  FileText,
  ShoppingCart,
  Check,
  ChevronRight,
  Sparkles,
  Bot,
  Zap,
} from "lucide-react";
import type { Locale } from "../../../app/i18n";
import { landingI18n } from "../i18n";

const LOCALE_OPTIONS: { id: Locale; flag: string; label: string }[] = [
  { id: "uz", flag: "🇺🇿", label: "O'zbek" },
  { id: "ru", flag: "🇷🇺", label: "Русский" },
  { id: "en", flag: "🇬🇧", label: "English" },
  { id: "ja", flag: "🇯🇵", label: "日本語" },
];

const TELEGRAM_BOT_URL = "https://t.me/ai_business_concierge_bot";

export function LandingPage() {
  const navigate = useNavigate();
  const [locale, setLocale] = useState<Locale>("uz");
  const t = landingI18n[locale];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg hidden sm:block">
              AI Business Concierge
            </span>
            <span className="font-bold text-white text-lg sm:hidden">ABC</span>
          </div>

          {/* Right: locale + login */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1 rounded-full bg-white/10 p-1 border border-white/10">
              {LOCALE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setLocale(opt.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    locale === opt.id
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                  aria-label={opt.label}
                >
                  <span className="hidden sm:inline">{opt.flag} {opt.label}</span>
                  <span className="sm:hidden">{opt.flag}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-slate-900 hover:bg-slate-100 transition-colors"
            >
              {t.nav.login}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-8">
            <Zap size={14} />
            {t.hero.badge}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 max-w-3xl mx-auto">
            {t.hero.title}
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-base transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
            >
              <Bot size={20} />
              {t.hero.ctaTelegram}
            </a>
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-base transition-all"
            >
              {t.hero.ctaLogin}
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 sm:py-24 bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t.features.title}</h2>
            <p className="text-slate-400 text-lg">{t.features.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AI Maslahatchi */}
            <div className="relative rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-900/20 border border-indigo-500/20 p-6 hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-5">
                <MessageSquare size={22} className="text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t.features.maslahatchi.title}</h3>
              <p className="text-slate-400 leading-relaxed">{t.features.maslahatchi.desc}</p>
            </div>

            {/* AI Hujjatchi — soon */}
            <div className="relative rounded-2xl bg-slate-800/50 border border-white/10 p-6 opacity-75">
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium">
                {t.features.soon}
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-700/60 flex items-center justify-center mb-5">
                <FileText size={22} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t.features.hujjatchi.title}</h3>
              <p className="text-slate-500 leading-relaxed">{t.features.hujjatchi.desc}</p>
            </div>

            {/* AI Sotuvchi — soon */}
            <div className="relative rounded-2xl bg-slate-800/50 border border-white/10 p-6 opacity-75">
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium">
                {t.features.soon}
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-700/60 flex items-center justify-center mb-5">
                <ShoppingCart size={22} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{t.features.sotuvchi.title}</h3>
              <p className="text-slate-500 leading-relaxed">{t.features.sotuvchi.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 sm:py-24 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t.howItWorks.title}</h2>
            <p className="text-slate-400 text-lg">{t.howItWorks.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", ...t.howItWorks.step1 },
              { step: "2", ...t.howItWorks.step2 },
              { step: "3", ...t.howItWorks.step3 },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-indigo-500/20 border-2 border-indigo-500/40 flex items-center justify-center mx-auto mb-5">
                  <span className="text-2xl font-bold text-indigo-400">{s.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 sm:py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t.pricing.title}</h2>
            <p className="text-slate-400 text-lg">{t.pricing.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <div className="rounded-2xl bg-slate-800 border border-white/10 p-8">
              <h3 className="text-lg font-semibold text-slate-300 mb-1">{t.pricing.free.name}</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">{t.pricing.free.price}</span>
                <span className="text-slate-400 mb-1">{t.pricing.free.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {t.pricing.free.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-slate-300 text-sm">
                    <Check size={16} className="text-indigo-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={TELEGRAM_BOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-colors"
              >
                {t.pricing.free.cta}
              </a>
            </div>

            {/* Pro */}
            <div className="relative rounded-2xl bg-slate-800/50 border border-white/10 p-8 opacity-75">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-semibold">
                {t.pricing.pro.badge}
              </div>
              <h3 className="text-lg font-semibold text-slate-300 mb-1">{t.pricing.pro.name}</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-extrabold text-white">{t.pricing.pro.price}</span>
                <span className="text-slate-400 mb-1">{t.pricing.pro.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {t.pricing.pro.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-slate-300 text-sm">
                    <Check size={16} className="text-slate-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled
                className="block w-full text-center py-3 rounded-xl bg-slate-700 text-slate-500 font-semibold cursor-not-allowed"
              >
                {t.pricing.pro.cta}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-indigo-500">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            {t.hero.ctaTelegram}
          </h2>
          <p className="text-indigo-100 mb-8 text-lg">{t.hero.subtitle}</p>
          <a
            href={TELEGRAM_BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-indigo-600 font-bold text-lg hover:bg-indigo-50 transition-colors shadow-xl"
          >
            <Bot size={22} />
            @ai_business_concierge_bot
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 bg-slate-950 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Sparkles size={14} className="text-indigo-400" />
            </div>
            <span className="text-slate-400 text-sm">{t.footer.tagline}</span>
          </div>
          <p className="text-slate-500 text-sm">{t.footer.rights}</p>
        </div>
      </footer>
    </div>
  );
}
