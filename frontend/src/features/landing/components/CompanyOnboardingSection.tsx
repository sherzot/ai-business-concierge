import React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { landingI18n } from "../i18n";
import type { LandingLocale } from "../types";

type CompanyOnboardingT = typeof landingI18n[LandingLocale]["companyOnboarding"];
type NavT = typeof landingI18n[LandingLocale]["nav"];

type Props = { t: CompanyOnboardingT; tNav: NavT };

export function CompanyOnboardingSection({ t, tNav }: Props) {
  const navigate = useNavigate();

  return (
    <section
      id="company-onboarding"
      className="py-20 sm:py-24 bg-white"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-widest mb-4">
            {t.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">{t.title}</h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">{t.subtitle}</p>
        </div>

        {/* 4-step process */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {t.steps.map((step, idx) => (
            <div key={step.step} className="relative">
              {/* Connector line (desktop only) */}
              {idx < t.steps.length - 1 && (
                <div
                  className="hidden lg:block absolute top-9 left-[calc(100%-8px)] w-5 z-10"
                  aria-hidden="true"
                >
                  <ArrowRight size={16} className="text-indigo-300" />
                </div>
              )}
              <div className="rounded-2xl bg-white border border-slate-200 p-6 hover:border-indigo-300 hover:shadow-sm transition-all h-full">
                {/* Step number + icon */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl flex-shrink-0">
                    {step.icon}
                  </div>
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Features grid */}
        <div className="rounded-2xl bg-slate-50 border border-indigo-100 p-8 mb-10">
          <h3 className="text-lg font-bold text-slate-900 mb-6 text-center">{t.featuresTitle}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.features.map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-indigo-600 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm text-slate-700">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => navigate("/contact")}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 text-white font-semibold text-base hover:bg-indigo-700 active:scale-95 transition-all shadow-sm mb-3"
          >
            {t.cta}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          <p className="text-slate-500 text-sm mb-4">{t.ctaNote}</p>
          <p className="text-slate-600 text-sm">
            {t.alreadyAccount}{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-indigo-700 hover:text-indigo-800 underline underline-offset-2 transition-colors"
            >
              {tNav.login}
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
