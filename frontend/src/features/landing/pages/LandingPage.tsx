import React from "react";
import { useLandingLocale } from "../hooks/useLandingLocale";
import { landingI18n } from "../i18n";
import { LandingNavbar } from "../components/LandingNavbar";
import { HeroSection } from "../components/HeroSection";
import { StatsBar } from "../components/StatsBar";
import { FeaturesSection } from "../components/FeaturesSection";
import { WhyUsSection } from "../components/WhyUsSection";
import { ProblemsSection } from "../components/ProblemsSection";
import { AutomationSection } from "../components/AutomationSection";
import { ForWhoSection } from "../components/ForWhoSection";
import { HowItWorksSection } from "../components/HowItWorksSection";
import { PricingSection } from "../components/PricingSection";
import { CompanyOnboardingSection } from "../components/CompanyOnboardingSection";
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
        <StatsBar t={t.stats} />
        <FeaturesSection t={t.features} />
        <WhyUsSection t={t.whyUs} />
        <ProblemsSection t={t.problems} />
        <AutomationSection t={t.automation} />
        <ForWhoSection t={t.forWho} />
        <HowItWorksSection t={t.howItWorks} />
        <CompanyOnboardingSection t={t.companyOnboarding} tNav={t.nav} />
        <PricingSection t={t.pricing} />
        <LandingCtaBanner t={t.hero} />
      </main>
      <LandingFooter t={t.footer} />
    </div>
  );
}
