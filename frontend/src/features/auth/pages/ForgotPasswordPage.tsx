import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { useI18n } from "../../../app/providers/I18nProvider";
import { supabase } from "../../../shared/lib/supabase";
import { LocaleSelect } from "../../../shared/components/LocaleSelect";

export function ForgotPasswordPage() {
  const { translate } = useI18n();
  const [email, setEmail]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error: sbError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (sbError) {
        if (sbError.message.toLowerCase().includes("not found") || sbError.status === 422) {
          setError(translate("auth.forgotPasswordNotFound"));
        } else {
          setError(sbError.message);
        }
        return;
      }
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <Link
          to="/login"
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          {translate("auth.backToLogin")}
        </Link>
        <LocaleSelect variant="dark" />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg">AI Business Concierge</span>
          </div>

          {success ? (
            <div className="text-center">
              <div className="inline-flex w-16 h-16 rounded-full bg-emerald-500/10 items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {translate("auth.forgotPasswordTitle")}
              </h1>
              <p className="text-slate-400 mb-6">{translate("auth.forgotPasswordSuccess")}</p>
              <p className="text-slate-500 text-sm mb-6">{email}</p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
              >
                <ArrowLeft size={14} />
                {translate("auth.backToLogin")}
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-2 w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Mail size={22} className="text-indigo-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {translate("auth.forgotPasswordTitle")}
              </h1>
              <p className="text-slate-400 text-sm mb-8">
                {translate("auth.forgotPasswordSubtitle")}
              </p>

              {error && (
                <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                    {translate("auth.email")}
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@company.com"
                    className="w-full rounded-xl bg-slate-800 border border-white/10 text-white placeholder-slate-500 px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-indigo-500 text-white font-semibold py-3 text-sm hover:bg-indigo-400 active:scale-[.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                >
                  {submitting
                    ? translate("auth.forgotPasswordSubmitting")
                    : translate("auth.forgotPasswordSubmit")}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
