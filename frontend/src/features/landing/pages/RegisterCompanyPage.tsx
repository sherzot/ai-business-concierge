import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useLandingLocale } from "../hooks/useLandingLocale";
import { landingI18n } from "../i18n";
import { SUPPORTED_LOCALES } from "../types";
import type { LandingLocale } from "../types";
import { API_BASE_URL } from "../../../app/config";
import { BrandLockup } from "../../../shared/components/BrandMark";

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
      if (!res.ok) {
        const msg =
          json?.error?.message ??
          json?.meta?.errors?.[0]?.message ??
          "Server error";
        throw new Error(msg);
      }
      setSuccess(true);
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
        <div className="mx-auto flex h-18 max-w-2xl items-center justify-between px-4 sm:px-6">
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
          <div className="border-y border-red-500/40 py-10 text-center">
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
          <div className="border-y border-emerald-500/40 py-10 text-center">
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
              <p className="editorial-kicker text-[#5f7cff]">Company activation</p>
              <h1 className="mb-2 mt-5 text-4xl font-semibold tracking-[-0.05em] text-white">{t.title}</h1>
              <p className="text-slate-400">{t.subtitle}</p>
            </div>

            {/* Pre-filled contact info */}
            {contactInfo && (
              <div className="mb-6 border-y border-white/15 py-4 text-sm text-white/70">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-slate-500">Ism: </span>{contactInfo.full_name}</div>
                  <div><span className="text-slate-500">Email: </span>{contactInfo.email}</div>
                  <div><span className="text-slate-500">Tel: </span>{contactInfo.phone}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 border-y border-white/15 py-8">
              {/* Company name */}
              <div>
                <label htmlFor="register-company" className={labelCls}>{t.companyName} *</label>
                <input
                  id="register-company"
                  required className={inputCls}
                  placeholder={t.companyNamePlaceholder}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              {/* Legal form + STIR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="register-legal-form" className={labelCls}>{t.legalForm}</label>
                  <select id="register-legal-form" className={inputCls} value={legalForm} onChange={(e) => setLegalForm(e.target.value)}>
                    <option value="">{t.legalFormPlaceholder}</option>
                    {(Object.entries(t.legalForms) as [string, string][]).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="register-stir" className={labelCls}>{t.stir}</label>
                  <input
                    id="register-stir"
                    className={inputCls}
                    placeholder={t.stirPlaceholder}
                    value={stir}
                    onChange={(e) => setStir(e.target.value)}
                  />
                </div>
              </div>

              {/* Legal address */}
              <div>
                <label htmlFor="register-address" className={labelCls}>{t.legalAddress}</label>
                <input
                  id="register-address"
                  className={inputCls}
                  placeholder={t.legalAddressPlaceholder}
                  value={legalAddress}
                  onChange={(e) => setLegalAddress(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="register-password" className={labelCls}>{t.password} *</label>
                  <div className="relative">
                    <input
                      required
                      id="register-password"
                      minLength={8}
                      type={showPw ? "text" : "password"}
                      className={`${inputCls} pr-11`}
                      placeholder={t.passwordPlaceholder}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPw((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/45 hover:text-white" aria-label={showPw ? "Parolni yashirish" : "Parolni ko'rsatish"}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="register-password-confirm" className={labelCls}>{t.confirmPassword} *</label>
                  <div className="relative">
                    <input
                      required
                      id="register-password-confirm"
                      type={showConfirm ? "text" : "password"}
                      className={`${inputCls} pr-11`}
                      placeholder={t.confirmPasswordPlaceholder}
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/45 hover:text-white" aria-label={showConfirm ? "Parolni yashirish" : "Parolni ko'rsatish"}>
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="border-l-2 border-red-400 py-2 pl-4 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="editorial-btn-primary w-full disabled:opacity-50"
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
