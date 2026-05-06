import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Sparkles, ArrowLeft, CheckCircle2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useLandingLocale } from "../hooks/useLandingLocale";
import { landingI18n } from "../i18n";
import { SUPPORTED_LOCALES } from "../types";
import type { LandingLocale } from "../types";
import { API_BASE_URL } from "../../../app/config";

const LOCALE_FLAGS: Record<LandingLocale, string> = {
  uz: "🇺🇿", ru: "🇷🇺", en: "🇬🇧", ja: "🇯🇵",
};

type ContactInfo = {
  contact_request_id: string;
  full_name: string;
  company_name: string | null;
  email: string;
  phone: string;
  business_type: string | null;
  employee_count: string | null;
};

type TokenState = "loading" | "valid" | "invalid" | "expired" | "used";

export function RegisterCompanyPage() {
  const { locale, setLocale } = useLandingLocale();
  const t = landingI18n[locale].register;
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  const [tokenState, setTokenState] = useState<TokenState>("loading");
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

  const [companyName, setCompanyName]     = useState("");
  const [legalForm, setLegalForm]         = useState("");
  const [stir, setStir]                   = useState("");
  const [legalAddress, setLegalAddress]   = useState("");
  const [password, setPassword]           = useState("");
  const [confirmPw, setConfirmPw]         = useState("");
  const [showPw, setShowPw]               = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setTokenState("invalid"); return; }
    fetch(`${API_BASE_URL}/register/validate-token?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          const code = json?.error?.code;
          if (code === "TOKEN_EXPIRED")  { setTokenState("expired"); return; }
          if (code === "ALREADY_USED")   { setTokenState("used");    return; }
          setTokenState("invalid");
          return;
        }
        const info: ContactInfo = json.data ?? json;
        setContactInfo(info);
        if (info.company_name) setCompanyName(info.company_name);
        setTokenState("valid");
      })
      .catch(() => setTokenState("invalid"));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPw) { setError(t.passwordMismatch); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/register/company`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, company_name: companyName, legal_form: legalForm || undefined, stir: stir || undefined, legal_address: legalAddress || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Server error");
      setSuccess(true);
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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
            <Link to="/" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors">
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">{t.backToHome}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Loading */}
        {tokenState === "loading" && (
          <div className="flex items-center justify-center py-24 text-slate-500">
            <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mr-3" />
            {t.loading}
          </div>
        )}

        {/* Token errors */}
        {(tokenState === "invalid" || tokenState === "expired" || tokenState === "used") && (
          <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-10 text-center">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-3">
              {tokenState === "expired" ? t.tokenExpired : tokenState === "used" ? t.alreadyUsed : t.invalidToken}
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Link to="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-700 text-white font-semibold hover:bg-slate-600 transition-colors">
                <ArrowLeft size={16} /> {t.backToHome}
              </Link>
              {tokenState === "used" && (
                <Link to="/login" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-400 transition-colors">
                  {t.goToLogin}
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-10 text-center">
            <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">{t.successTitle}</h2>
            <p className="text-slate-300 mb-6">{t.successDesc}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-700 text-white font-semibold hover:bg-slate-600 transition-colors">
                <ArrowLeft size={16} /> {t.backToHome}
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-400 transition-colors">
                {t.goToLogin}
              </Link>
            </div>
          </div>
        )}

        {/* Form */}
        {tokenState === "valid" && !success && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">{t.title}</h1>
              <p className="text-slate-400">{t.subtitle}</p>
            </div>

            {/* Pre-filled contact info */}
            {contactInfo && (
              <div className="rounded-xl bg-slate-800/50 border border-white/8 px-5 py-4 mb-6 text-sm text-slate-300">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-slate-500">Ism: </span>{contactInfo.full_name}</div>
                  <div><span className="text-slate-500">Email: </span>{contactInfo.email}</div>
                  <div><span className="text-slate-500">Tel: </span>{contactInfo.phone}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="rounded-2xl bg-slate-800/40 border border-white/8 p-7 space-y-5">
              {/* Company name */}
              <div>
                <label className={labelCls}>{t.companyName} *</label>
                <input
                  required className={inputCls}
                  placeholder={t.companyNamePlaceholder}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              {/* Legal form + STIR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>{t.legalForm}</label>
                  <select className={inputCls} value={legalForm} onChange={(e) => setLegalForm(e.target.value)}>
                    <option value="">{t.legalFormPlaceholder}</option>
                    {(Object.entries(t.legalForms) as [string, string][]).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t.stir}</label>
                  <input
                    className={inputCls}
                    placeholder={t.stirPlaceholder}
                    value={stir}
                    onChange={(e) => setStir(e.target.value)}
                  />
                </div>
              </div>

              {/* Legal address */}
              <div>
                <label className={labelCls}>{t.legalAddress}</label>
                <input
                  className={inputCls}
                  placeholder={t.legalAddressPlaceholder}
                  value={legalAddress}
                  onChange={(e) => setLegalAddress(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>{t.password} *</label>
                  <div className="relative">
                    <input
                      required
                      type={showPw ? "text" : "password"}
                      className={`${inputCls} pr-11`}
                      placeholder={t.passwordPlaceholder}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPw((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>{t.confirmPassword} *</label>
                  <div className="relative">
                    <input
                      required
                      type={showConfirm ? "text" : "password"}
                      className={`${inputCls} pr-11`}
                      placeholder={t.confirmPasswordPlaceholder}
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-500 text-white font-semibold py-3.5 hover:bg-indigo-400 active:scale-[.98] transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
              >
                {submitting ? t.submitting : t.submit}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
