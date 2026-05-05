import React from "react";
import { useLandingLocale } from "../hooks/useLandingLocale";
import { landingI18n } from "../i18n";
import { LandingNavbar } from "../components/LandingNavbar";
import { HeroSection } from "../components/HeroSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { HowItWorksSection } from "../components/HowItWorksSection";
import { PricingSection } from "../components/PricingSection";
import { LandingCtaBanner } from "../components/LandingCtaBanner";
import { LandingFooter } from "../components/LandingFooter";

export function LandingPage() {
  const { locale, setLocale } = useLandingLocale();
  const t = landingI18n[locale];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <LandingNavbar locale={locale} onLocaleChange={setLocale} t={t.nav} />
      <main>
        <HeroSection t={t.hero} />
        <FeaturesSection t={t.features} />
        <HowItWorksSection t={t.howItWorks} />
        <PricingSection t={t.pricing} />
        <LandingCtaBanner t={t.hero} />
      </main>
      <LandingFooter t={t.footer} />
    </div>
  );
}
