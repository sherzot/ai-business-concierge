import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, CheckCircle2 } from "lucide-react";
import { useI18n } from "../../../app/providers/I18nProvider";
import { supabase } from "../../../shared/lib/supabase";
import { AuthShell, authInputClass, authLabelClass } from "../components/AuthShell";

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
    <AuthShell backTo="/login" backLabel={translate("auth.backToLogin")}>
          <div className="border-y border-border py-8">
            {success ? (
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center border border-status-success text-status-success">
                  <CheckCircle2 size={24} />
                </div>
                <p className="editorial-kicker">Email sent</p>
                <h1 className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-foreground">
                  {translate("auth.forgotPasswordTitle")}
                </h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{translate("auth.forgotPasswordSuccess")}</p>
                <p className="mb-7 mt-2 text-sm font-semibold text-foreground">{email}</p>
                <Link
                  to="/login"
                  className="text-xs font-bold uppercase tracking-[0.1em] text-primary hover:underline"
                >
                  {translate("auth.backToLogin")}
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6 flex h-12 w-12 items-center justify-center border border-border text-primary">
                  <Mail size={21} />
                </div>
                <p className="editorial-kicker">Account recovery</p>
                <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-foreground">
                  {translate("auth.forgotPasswordTitle")}
                </h1>
                <p className="mb-8 mt-3 text-sm leading-6 text-muted-foreground">
                  {translate("auth.forgotPasswordSubtitle")}
                </p>

                {error && (
                  <div className="mb-5 border-l-2 border-status-danger py-2 pl-4 text-sm text-[var(--status-danger-fg)]">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className={authLabelClass}>
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
                      className={authInputClass}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="editorial-btn-primary mt-2 w-full disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting
                      ? translate("auth.forgotPasswordSubmitting")
                      : translate("auth.forgotPasswordSubmit")}
                  </button>
                </form>
              </>
            )}
          </div>
    </AuthShell>
  );
}
