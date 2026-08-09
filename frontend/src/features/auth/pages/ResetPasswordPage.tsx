import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock3, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useI18n } from "../../../app/providers/I18nProvider";
import { supabase } from "../../../shared/lib/supabase";
import { AuthShell, authInputClass, authLabelClass } from "../components/AuthShell";

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
    <AuthShell backTo="/login" backLabel={translate("auth.backToLogin")}>
          <div className="border-y border-border py-8">
            {expired ? (
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center border border-status-warning text-status-warning">
                  <Clock3 size={24} />
                </div>
                <h1 className="text-3xl font-semibold tracking-[-0.045em] text-foreground">
                  {translate("auth.resetPasswordExpired")}
                </h1>
                <Link
                  to="/forgot-password"
                  className="editorial-btn-primary mt-7"
                >
                  {translate("auth.forgotPasswordSubmit")}
                </Link>
              </div>
            ) : success ? (
              <div>
                <div className="mb-6 flex h-12 w-12 items-center justify-center border border-status-success text-status-success">
                  <CheckCircle2 size={24} />
                </div>
                <h1 className="text-3xl font-semibold tracking-[-0.045em] text-foreground">
                  {translate("auth.resetPasswordSuccess")}
                </h1>
                <p className="mt-3 text-sm text-muted-foreground">{translate("auth.backToLogin")}...</p>
              </div>
            ) : (
              <>
                <p className="editorial-kicker">Security update</p>
                <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-foreground">
                  {translate("auth.resetPasswordTitle")}
                </h1>
                <p className="mb-8 mt-3 text-sm leading-6 text-muted-foreground">
                  {translate("auth.resetPasswordSubtitle")}
                </p>

                {error && (
                  <div className="mb-5 border-l-2 border-status-danger py-2 pl-4 text-sm text-[var(--status-danger-fg)]">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="password" className={authLabelClass}>
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
                        className={`${authInputClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={showPwd ? "Parolni yashirish" : "Parolni ko'rsatish"}
                      >
                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{translate("setup.passwordHint")}</p>
                  </div>

                  <div>
                    <label htmlFor="confirm" className={authLabelClass}>
                      {translate("setup.confirmPassword")}
                    </label>
                    <input
                      id="confirm"
                      type={showPwd ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className={authInputClass}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="editorial-btn-primary mt-2 w-full disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting
                      ? translate("auth.resetPasswordSubmitting")
                      : translate("auth.resetPasswordSubmit")}
                  </button>
                </form>
              </>
            )}
          </div>
    </AuthShell>
  );
}
