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
      className="editorial-section bg-card"
    >
      <div className="editorial-page">
        <header className="mb-12 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="editorial-kicker">{t.badge}</p>
            <h2 className="editorial-title mt-6">{t.title}</h2>
          </div>
          <p className="editorial-copy text-base lg:col-span-4">{t.subtitle}</p>
        </header>

        {/* 4-step process */}
        <div className="grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-4">
          {t.steps.map((step, idx) => (
            <article key={step.step} className="relative min-h-60 border-b border-r border-border p-6 transition-colors hover:bg-background lg:p-7">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{step.step}</span>
                {idx < t.steps.length - 1 && <ArrowRight size={16} className="text-muted-foreground" />}
              </div>
              <h3 className="mt-16 text-lg font-semibold tracking-[-0.02em] text-foreground">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.desc}</p>
            </article>
          ))}
        </div>

        {/* Features grid */}
        <div className="mt-14 grid gap-8 border-y border-border py-8 lg:grid-cols-12">
          <h3 className="text-lg font-semibold tracking-[-0.02em] text-foreground lg:col-span-4">{t.featuresTitle}</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
            {t.features.map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <CheckCircle2 size={15} className="shrink-0 text-primary" aria-hidden="true" />
                <span className="text-sm text-foreground">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-muted-foreground">{t.ctaNote}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t.alreadyAccount}{" "}
              <button onClick={() => navigate("/login")} className="font-semibold text-foreground underline underline-offset-4 hover:text-primary">
                {tNav.login}
              </button>
            </p>
          </div>
          <button
            onClick={() => navigate("/contact")}
            className="editorial-btn-primary"
          >
            {t.cta}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
