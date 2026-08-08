import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { useLandingLocale } from "../hooks/useLandingLocale";
import { landingI18n } from "../i18n";
import { SUPPORTED_LOCALES } from "../types";
import type { LandingLocale } from "../types";
import { API_BASE_URL } from "../../../app/config";
import { BrandLockup } from "../../../shared/components/BrandMark";

const LOCALE_FLAGS: Record<LandingLocale, string> = {
  uz: "🇺🇿", ru: "🇷🇺", en: "🇬🇧", ja: "🇯🇵",
};

const EMPLOYEE_COUNTS = ["1-10", "11-50", "51-200", "200+"];

type FormState = {
  full_name: string;
  company_name: string;
  stir: string;
  phone: string;
  email: string;
  business_type: string;
  employee_count: string;
  message: string;
  source: string;
};

const EMPTY: FormState = {
  full_name: "", company_name: "", stir: "",
  phone: "", email: "", business_type: "",
  employee_count: "", message: "", source: "",
};

export function ContactPage() {
  const { locale, setLocale } = useLandingLocale();
  const t = landingI18n[locale];
  const ct = t.contact;

  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, locale }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message ?? "Server error");
      }
      setSuccess(true);
      setForm(EMPTY);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full border-0 border-b border-white/20 bg-transparent px-0 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#5f7cff] focus:ring-0";
  const labelCls = "block text-[11px] font-bold uppercase tracking-[0.12em] text-white/55";

  return (
    <div className="editorial-inverse min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-foreground/90 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/">
            <BrandLockup inverse compact />
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex gap-1 rounded-full bg-white/5 p-1 border border-white/10">
              {SUPPORTED_LOCALES.map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  aria-pressed={locale === l}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    locale === l ? "bg-indigo-500 text-white" : "text-white/50 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {LOCALE_FLAGS[l]}
                </button>
              ))}
            </div>
            <Link
              to="/"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">{ct.backToHome}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left — info panel */}
          <div className="lg:col-span-2">
            <p className="editorial-kicker text-[#5f7cff]">Start a conversation</p>
            <h1 className="mb-4 mt-5 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">{ct.title}</h1>
            <p className="text-slate-400 leading-relaxed mb-8">{ct.subtitle}</p>

            {/* Process steps */}
            <div className="border-t border-white/15">
              {t.companyOnboarding.steps.map((step) => (
                <div key={step.step} className="flex gap-4 border-b border-white/15 py-4">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center border border-white/15 text-lg">
                    {step.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-0.5">
                      {step.step}
                    </div>
                    <div className="text-sm font-semibold text-white mb-0.5">{step.title}</div>
                    <div className="text-xs text-slate-400 leading-relaxed">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Direct contact */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-xs text-slate-500 mb-3">{ct.successNote}</p>
              <div className="space-y-2 text-sm text-slate-300">
                <div>📞 +998 XX XXX-XX-XX</div>
                <div>💬 <a href="https://t.me/ai_business_concierge_bot" className="text-indigo-400 hover:text-indigo-300">@ai_business_concierge_bot</a></div>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-3">
            {success ? (
              <div className="border-y border-emerald-500/40 py-10 text-center">
                <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-3">{ct.successTitle}</h2>
                <p className="text-slate-300 mb-6">{ct.successDesc}</p>
                <Link
                  to="/"
                  className="editorial-btn-primary"
                >
                  <ArrowLeft size={16} />
                  {ct.backToHome}
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-6 border-y border-white/15 py-8"
              >
                {/* Row: full_name + phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="contact-full-name" className={labelCls}>{ct.fullName}</label>
                    <input id="contact-full-name" required className={inputCls} placeholder={ct.fullNamePlaceholder}
                      value={form.full_name} onChange={set("full_name")} />
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className={labelCls}>{ct.phone}</label>
                    <input id="contact-phone" required type="tel" className={inputCls} placeholder={ct.phonePlaceholder}
                      value={form.phone} onChange={set("phone")} />
                  </div>
                </div>

                {/* Row: email + company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="contact-email" className={labelCls}>{ct.email}</label>
                    <input id="contact-email" required type="email" className={inputCls} placeholder={ct.emailPlaceholder}
                      value={form.email} onChange={set("email")} />
                  </div>
                  <div>
                    <label htmlFor="contact-company" className={labelCls}>{ct.companyName}</label>
                    <input id="contact-company" className={inputCls} placeholder={ct.companyNamePlaceholder}
                      value={form.company_name} onChange={set("company_name")} />
                  </div>
                </div>

                {/* Row: business_type + employee_count */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="contact-business-type" className={labelCls}>{ct.businessType}</label>
                    <select id="contact-business-type" className={inputCls} value={form.business_type} onChange={set("business_type")}>
                      <option value="">{ct.businessTypePlaceholder}</option>
                      {(Object.entries(ct.businessTypes) as [string, string][]).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="contact-employee-count" className={labelCls}>{ct.employeeCount}</label>
                    <select id="contact-employee-count" className={inputCls} value={form.employee_count} onChange={set("employee_count")}>
                      <option value="">{ct.employeeCountPlaceholder}</option>
                      {EMPLOYEE_COUNTS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row: stir + source */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="contact-stir" className={labelCls}>{ct.stir}</label>
                    <input id="contact-stir" className={inputCls} placeholder={ct.stirPlaceholder}
                      value={form.stir} onChange={set("stir")} />
                  </div>
                  <div>
                    <label htmlFor="contact-source" className={labelCls}>{ct.source}</label>
                    <select id="contact-source" className={inputCls} value={form.source} onChange={set("source")}>
                      <option value="">{ct.sourcePlaceholder}</option>
                      {(Object.entries(ct.sources) as [string, string][]).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="contact-message" className={labelCls}>{ct.message}</label>
                  <textarea
                    id="contact-message"
                    className={`${inputCls} resize-none h-28`}
                    placeholder={ct.messagePlaceholder}
                    value={form.message}
                    onChange={set("message")}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="border-l-2 border-red-400 py-2 pl-4 text-sm text-red-300">
                    {error}
                  </div>
                )}

                <p className="text-slate-500 text-xs">{ct.required}</p>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="editorial-btn-primary w-full disabled:opacity-50"
                >
                  <Send size={16} aria-hidden />
                  {submitting ? ct.submitting : ct.submit}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
