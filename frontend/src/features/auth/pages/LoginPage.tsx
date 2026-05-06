import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, CheckCircle2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { useI18n } from "../../../app/providers/I18nProvider";
import { useEffect } from "react";
import type { Locale } from "../../../app/i18n";

const LOCALE_OPTIONS: { id: Locale; flag: string; label: string }[] = [
  { id: "uz", flag: "🇺🇿", label: "O'zbek" },
  { id: "ru", flag: "🇷🇺", label: "Русский" },
  { id: "en", flag: "🇬🇧", label: "English" },
  { id: "ja", flag: "🇯🇵", label: "日本語" },
];

function accountStatusMessage(
  error: string | null,
  translate: (k: string) => string
): { type: "pending" | "suspended" | "blocked" | "error" | null; text: string } {
  if (!error) return { type: null, text: "" };
  const e = error.toLowerCase();
  if (e.includes("pending") || e.includes("tasdiqlash") || e.includes("подтвержд"))
    return { type: "pending", text: translate("auth.accountPending") };
  if (e.includes("suspend") || e.includes("to'xtatil") || e.includes("приостановл"))
    return { type: "suspended", text: translate("auth.accountSuspended") };
  if (e.includes("block") || e.includes("bloklang") || e.includes("заблокир"))
    return { type: "blocked", text: translate("auth.accountBlocked") };
  return { type: "error", text: error };
}

export function LoginPage() {
  const { translate, locale, setLocale } = useI18n();
  const { session, loading, login, error } = useAuthContext();
  const navigate = useNavigate();

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPwd, setShowPwd]     = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate("/app", { replace: true });
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }
  if (session) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try { await login(email, password); } catch { /* error in context */ }
    finally { setSubmitting(false); }
  };

  const statusMsg = accountStatusMessage(error, translate);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* ── Left panel — branding (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[480px] flex-col justify-between p-12 bg-gradient-to-b from-indigo-950/60 to-slate-950 border-r border-white/5">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">AI Business Concierge</span>
        </div>

        {/* Middle content */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            {translate("auth.loginSubtitle")}
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            {translate("auth.platformSubtitle")}
          </p>
          <ul className="space-y-4">
            {(["auth.benefit1", "auth.benefit2", "auth.benefit3"] as const).map((k) => (
              <li key={k} className="flex items-center gap-3 text-slate-300 text-sm">
                <CheckCircle2 size={16} className="text-indigo-400 flex-shrink-0" aria-hidden />
                {translate(k)}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-slate-600 text-xs">© 2026 AI Business Concierge</p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            {translate("auth.backToHome")}
          </Link>

          {/* Locale switcher */}
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            className="rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer hover:border-white/20 transition-colors"
          >
            {LOCALE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-slate-900 text-white">
                {opt.flag} {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles size={18} className="text-white" />
              </div>
              <span className="font-bold text-white">AI Business Concierge</span>
            </div>

            <h1 className="text-2xl font-bold text-white mb-1">
              {translate("auth.loginTitle")}
            </h1>
            <p className="text-slate-400 text-sm mb-8">
              {translate("auth.loginSubtitle")}
            </p>

            {/* Status message */}
            {statusMsg.type === "pending" && (
              <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-300 text-sm">
                {statusMsg.text}
              </div>
            )}
            {statusMsg.type === "suspended" && (
              <div className="mb-6 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-orange-300 text-sm">
                {statusMsg.text}
              </div>
            )}
            {statusMsg.type === "blocked" && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
                {statusMsg.text}
              </div>
            )}
            {statusMsg.type === "error" && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
                {statusMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                  {translate("auth.email")}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@company.com"
                  className="w-full rounded-xl bg-slate-800 border border-white/10 text-white placeholder-slate-500 px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                    {translate("auth.password")}
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {translate("auth.forgotPassword")}
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl bg-slate-800 border border-white/10 text-white placeholder-slate-500 px-4 py-3 pr-11 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={showPwd ? "Parolni yashirish" : "Parolni ko'rsatish"}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || loading}
                className="w-full rounded-xl bg-indigo-500 text-white font-semibold py-3 text-sm hover:bg-indigo-400 active:scale-[.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
              >
                {submitting || loading
                  ? translate("auth.signingIn")
                  : translate("auth.signIn")}
              </button>
            </form>

            {/* No account CTA */}
            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-slate-400 text-sm mb-3">{translate("auth.noAccount")}</p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-indigo-500/40 text-indigo-300 text-sm font-medium hover:bg-indigo-500/10 hover:border-indigo-400 transition-all"
              >
                {translate("auth.contactUs")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
