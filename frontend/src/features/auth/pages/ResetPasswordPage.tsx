import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useI18n } from "../../../app/providers/I18nProvider";
import { supabase } from "../../../shared/lib/supabase";
import { LocaleSelect } from "../../../shared/components/LocaleSelect";

export function ResetPasswordPage() {
  const { translate } = useI18n();
  const navigate = useNavigate();

  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [showPwd, setShowPwd]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [expired, setExpired]       = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setExpired(false);
      }
    });
    const hash = window.location.hash;
    if (hash.includes("error=") && hash.includes("expired")) {
      setExpired(true);
    }
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError(translate("setup.errorPasswordShort"));
      return;
    }
    if (password !== confirm) {
      setError(translate("setup.errorPasswordMismatch"));
      return;
    }
    setSubmitting(true);
    try {
      const { error: sbError } = await supabase.auth.updateUser({ password });
      if (sbError) {
        if (sbError.message.toLowerCase().includes("expired") || sbError.status === 401) {
          setExpired(true);
        } else {
          setError(sbError.message);
        }
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 2500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <Link
          to="/login"
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          {translate("auth.backToLogin")}
        </Link>
        <LocaleSelect variant="light" />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">AI Business Concierge</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            {expired ? (
              <div className="text-center">
                <div className="inline-flex w-16 h-16 rounded-full bg-amber-100 items-center justify-center mb-4">
                  <span className="text-3xl">⏰</span>
                </div>
                <h1 className="text-xl font-bold text-slate-900 mb-2">
                  {translate("auth.resetPasswordExpired")}
                </h1>
                <Link
                  to="/forgot-password"
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  {translate("auth.forgotPasswordSubmit")}
                </Link>
              </div>
            ) : success ? (
              <div className="text-center">
                <div className="inline-flex w-16 h-16 rounded-full bg-emerald-100 items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-emerald-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  {translate("auth.resetPasswordSuccess")}
                </h1>
                <p className="text-slate-500 text-sm">{translate("auth.backToLogin")}...</p>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                  {translate("auth.resetPasswordTitle")}
                </h1>
                <p className="text-slate-500 text-sm mb-7">
                  {translate("auth.resetPasswordSubtitle")}
                </p>

                {error && (
                  <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                      {translate("setup.password")}
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPwd ? "text" : "password"}
                        required
                        autoFocus
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={translate("setup.passwordPlaceholder")}
                        className="w-full rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 px-4 py-3 pr-11 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{translate("setup.passwordHint")}</p>
                  </div>

                  <div>
                    <label htmlFor="confirm" className="block text-sm font-medium text-slate-700 mb-1.5">
                      {translate("setup.confirmPassword")}
                    </label>
                    <input
                      id="confirm"
                      type={showPwd ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="w-full rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-indigo-600 text-white font-semibold py-3 text-sm hover:bg-indigo-700 active:scale-[.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {submitting
                      ? translate("auth.resetPasswordSubmitting")
                      : translate("auth.resetPasswordSubmit")}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
