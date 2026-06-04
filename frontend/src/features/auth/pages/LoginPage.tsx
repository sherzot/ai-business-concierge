import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, CheckCircle2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { useI18n } from "../../../app/providers/I18nProvider";
import { useEffect } from "react";
import { LocaleSelect } from "../../../shared/components/LocaleSelect";

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
  const { translate } = useI18n();
  const { session, loading, login, error, currentTenant } = useAuthContext();
  const navigate = useNavigate();

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPwd, setShowPwd]     = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading || !session) return;
    const isAdmin = currentTenant?.role === "super_admin" || currentTenant?.role === "sub_admin";
    navigate(isAdmin ? "/admin" : "/app", { replace: true });
  }, [session, loading, currentTenant, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
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
    <div className="min-h-screen bg-white flex">
      {/* ── Left panel — branding (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[480px] flex-col justify-between p-12 bg-gradient-to-br from-indigo-600 to-violet-700 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 relative">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">AI Business Concierge</span>
        </div>

        {/* Middle content */}
        <div className="relative">
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            {translate("auth.loginSubtitle")}
          </h2>
          <p className="text-indigo-200 mb-8 leading-relaxed">
            {translate("auth.platformSubtitle")}
          </p>
          <ul className="space-y-4">
            {(["auth.benefit1", "auth.benefit2", "auth.benefit3"] as const).map((k) => (
              <li key={k} className="flex items-center gap-3 text-indigo-100 text-sm">
                <CheckCircle2 size={16} className="text-indigo-200 flex-shrink-0" aria-hidden />
                {translate(k)}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-indigo-300 text-xs relative">© 2026 AI Business Concierge</p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            {translate("auth.backToHome")}
          </Link>

          <LocaleSelect variant="light" />
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles size={18} className="text-white" />
              </div>
              <span className="font-bold text-slate-900">AI Business Concierge</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                {translate("auth.loginTitle")}
              </h1>
              <p className="text-slate-500 text-sm mb-7">
                {translate("auth.loginSubtitle")}
              </p>

              {/* Status message */}
              {statusMsg.type === "pending" && (
                <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700 text-sm">
                  {statusMsg.text}
                </div>
              )}
              {statusMsg.type === "suspended" && (
                <div className="mb-5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-orange-700 text-sm">
                  {statusMsg.text}
                </div>
              )}
              {statusMsg.type === "blocked" && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
                  {statusMsg.text}
                </div>
              )}
              {statusMsg.type === "error" && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
                  {statusMsg.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
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
                    className="w-full rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                      {translate("auth.password")}
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors"
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
                      className="w-full rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 px-4 py-3 pr-11 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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
                  className="w-full rounded-xl bg-indigo-600 text-white font-semibold py-3 text-sm hover:bg-indigo-700 active:scale-[.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {submitting || loading
                    ? translate("auth.signingIn")
                    : translate("auth.signIn")}
                </button>
              </form>

              {/* No account CTA */}
              <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                <p className="text-slate-500 text-sm mb-3">{translate("auth.noAccount")}</p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-indigo-200 text-indigo-600 text-sm font-medium hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                >
                  {translate("auth.contactUs")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
