import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { useI18n } from "../../../app/providers/I18nProvider";
import { useEffect } from "react";
import { AuthShell, authInputClass, authLabelClass } from "../components/AuthShell";

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
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
    <AuthShell>
            <div className="border-y border-border py-8">
              <p className="editorial-kicker">Secure workspace</p>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-foreground">
                {translate("auth.loginTitle")}
              </h1>
              <p className="mb-8 mt-3 text-sm leading-6 text-muted-foreground">
                {translate("auth.loginSubtitle")}
              </p>

              {/* Status message */}
              {statusMsg.type === "pending" && (
                <div className="mb-5 border-l-2 border-status-warning py-2 pl-4 text-sm text-[var(--status-warning-fg)]">
                  {statusMsg.text}
                </div>
              )}
              {statusMsg.type === "suspended" && (
                <div className="mb-5 border-l-2 border-status-warning py-2 pl-4 text-sm text-[var(--status-warning-fg)]">
                  {statusMsg.text}
                </div>
              )}
              {statusMsg.type === "blocked" && (
                <div className="mb-5 border-l-2 border-status-danger py-2 pl-4 text-sm text-[var(--status-danger-fg)]">
                  {statusMsg.text}
                </div>
              )}
              {statusMsg.type === "error" && (
                <div className="mb-5 border-l-2 border-status-danger py-2 pl-4 text-sm text-[var(--status-danger-fg)]">
                  {statusMsg.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="email" className={authLabelClass}>
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
                    className={authInputClass}
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className={authLabelClass}>
                      {translate("auth.password")}
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-primary hover:text-[var(--brand-primary-hover)] transition-colors"
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
                      className={`${authInputClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                  className="editorial-btn-primary mt-2 w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting || loading
                    ? translate("auth.signingIn")
                    : translate("auth.signIn")}
                </button>
              </form>

              {/* No account CTA */}
              <div className="mt-8 border-t border-border pt-6 text-center">
                <p className="text-muted-foreground text-sm mb-3">{translate("auth.noAccount")}</p>
                <Link
                  to="/contact"
                  className="text-xs font-bold uppercase tracking-[0.1em] text-primary hover:underline"
                >
                  {translate("auth.contactUs")}
                </Link>
              </div>
            </div>
    </AuthShell>
  );
}
