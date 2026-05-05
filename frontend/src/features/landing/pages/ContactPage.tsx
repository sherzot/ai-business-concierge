import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { useLandingLocale } from "../hooks/useLandingLocale";
import { landingI18n } from "../i18n";
import { SUPPORTED_LOCALES } from "../types";
import type { LandingLocale } from "../types";

const LOCALE_FLAGS: Record<LandingLocale, string> = {
  uz: "🇺🇿", ru: "🇷🇺", en: "🇬🇧", ja: "🇯🇵",
};

const EMPLOYEE_COUNTS = ["1-10", "11-50", "51-200", "200+"];
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

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
      const res = await fetch(`${API_BASE}/v1/contact`, {
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

  const inputCls = "w-full rounded-xl bg-slate-800 border border-white/10 text-white placeholder-slate-500 px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors";
  const labelCls = "block text-sm font-medium text-slate-300 mb-1.5";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-bold text-white hidden sm:block">AI Business Concierge</span>
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
            <h1 className="text-3xl font-bold text-white mb-3">{ct.title}</h1>
            <p className="text-slate-400 leading-relaxed mb-8">{ct.subtitle}</p>

            {/* Process steps */}
            <div className="space-y-5">
              {t.companyOnboarding.steps.map((step) => (
                <div key={step.step} className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
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
              <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-10 text-center">
                <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-3">{ct.successTitle}</h2>
                <p className="text-slate-300 mb-6">{ct.successDesc}</p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-400 transition-colors"
                >
                  <ArrowLeft size={16} />
                  {ct.backToHome}
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl bg-slate-800/40 border border-white/8 p-7 sm:p-8 space-y-5"
              >
                {/* Row: full_name + phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>{ct.fullName}</label>
                    <input required className={inputCls} placeholder={ct.fullNamePlaceholder}
                      value={form.full_name} onChange={set("full_name")} />
                  </div>
                  <div>
                    <label className={labelCls}>{ct.phone}</label>
                    <input required type="tel" className={inputCls} placeholder={ct.phonePlaceholder}
                      value={form.phone} onChange={set("phone")} />
                  </div>
                </div>

                {/* Row: email + company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>{ct.email}</label>
                    <input required type="email" className={inputCls} placeholder={ct.emailPlaceholder}
                      value={form.email} onChange={set("email")} />
                  </div>
                  <div>
                    <label className={labelCls}>{ct.companyName}</label>
                    <input className={inputCls} placeholder={ct.companyNamePlaceholder}
                      value={form.company_name} onChange={set("company_name")} />
                  </div>
                </div>

                {/* Row: business_type + employee_count */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>{ct.businessType}</label>
                    <select className={inputCls} value={form.business_type} onChange={set("business_type")}>
                      <option value="">{ct.businessTypePlaceholder}</option>
                      {(Object.entries(ct.businessTypes) as [string, string][]).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>{ct.employeeCount}</label>
                    <select className={inputCls} value={form.employee_count} onChange={set("employee_count")}>
                      <option value="">{ct.employeeCountPlaceholder}</option>
                      {EMPLOYEE_COUNTS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row: stir + source */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>{ct.stir}</label>
                    <input className={inputCls} placeholder={ct.stirPlaceholder}
                      value={form.stir} onChange={set("stir")} />
                  </div>
                  <div>
                    <label className={labelCls}>{ct.source}</label>
                    <select className={inputCls} value={form.source} onChange={set("source")}>
                      <option value="">{ct.sourcePlaceholder}</option>
                      {(Object.entries(ct.sources) as [string, string][]).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className={labelCls}>{ct.message}</label>
                  <textarea
                    className={`${inputCls} resize-none h-28`}
                    placeholder={ct.messagePlaceholder}
                    value={form.message}
                    onChange={set("message")}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <p className="text-slate-500 text-xs">{ct.required}</p>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-500 text-white font-semibold py-3.5 hover:bg-indigo-400 active:scale-[.98] transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
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
