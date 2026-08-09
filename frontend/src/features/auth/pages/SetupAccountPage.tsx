/**
 * SetupAccountPage — yangi xodim email invite link orqali keladi
 *
 * Flow:
 *   1. HR/Rahbar /v1/tenants/:id/members POST mode='invite' chaqiradi
 *   2. Supabase email yuboradi: link redirect to /setup-account
 *   3. Bu sahifada: yangi parol + telefon + tug'ilgan sana majburiy
 *   4. supabase.auth.updateUser({ password, phone, data: { dob, setup_complete: true } })
 *   5. Muvaffaqiyat → / (dashboard) ga redirect
 *
 * Xavfsizlik:
 *   - Session yo'q bo'lsa /login ga
 *   - setup_complete=true bo'lsa to'g'ridan-to'g'ri / ga (qaytadan parol berish kerak emas)
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../../app/providers/I18nProvider";
import { useAuthContext } from "../context/AuthContext";
import { supabase } from "../../../shared/lib/supabase";
import { notifySetupComplete } from "../api/authApi";
import { AuthShell, authInputClass, authLabelClass } from "../components/AuthShell";

export function SetupAccountPage() {
  const { translate } = useI18n();
  const { session, loading } = useAuthContext();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("+998");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect logic
  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate("/login", { replace: true });
      return;
    }
    // Agar foydalanuvchi allaqachon setup tugatgan bo'lsa, dashboard'ga
    const meta = (session.user.user_metadata ?? {}) as Record<string, unknown>;
    if (meta.setup_complete === true) {
      navigate("/app", { replace: true });
    }
  }, [session, loading, navigate]);

  if (loading || !session) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="animate-pulse text-muted-foreground">{translate("common.loading")}</div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validatsiya
    if (password.length < 8) {
      setError(translate("setup.errorPasswordShort"));
      return;
    }
    if (password !== confirmPassword) {
      setError(translate("setup.errorPasswordMismatch"));
      return;
    }
    const phoneClean = phone.replace(/\s/g, "");
    if (!/^\+998\d{9}$/.test(phoneClean)) {
      setError(translate("setup.errorPhoneInvalid"));
      return;
    }
    if (!dateOfBirth) {
      setError(translate("setup.errorDobRequired"));
      return;
    }

    setPending(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
        phone: phoneClean,
        data: {
          phone: phoneClean,
          date_of_birth: dateOfBirth,
          setup_complete: true,
        },
      });
      if (updateError) throw updateError;

      // Backend ga xabar berish: xodim setup tugadi → status = password_set
      await notifySetupComplete().catch(() => {
        // Non-blocking: backend miss bo'lsa ham login ishlayveradi
      });

      navigate("/app", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : translate("setup.errorGeneric"));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell backTo="/login" backLabel={translate("auth.backToLogin")}>
      <div className="border-y border-border py-8">
        <div className="mb-8">
          <p className="editorial-kicker">Workspace activation</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-foreground">{translate("setup.title")}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{translate("setup.subtitle")}</p>
          <p className="mt-2 text-xs font-semibold text-foreground">
            {session.user.email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Password */}
          <div>
            <label htmlFor="setup-password" className={authLabelClass}>
              {translate("setup.password")}
            </label>
            <input
              id="setup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              autoComplete="new-password"
              placeholder={translate("setup.passwordPlaceholder")}
              className={authInputClass}
              required
            />
            <p className="mt-2 text-xs text-muted-foreground">{translate("setup.passwordHint")}</p>
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="setup-password-confirm" className={authLabelClass}>
              {translate("setup.confirmPassword")}
            </label>
            <input
              id="setup-password-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              autoComplete="new-password"
              className={authInputClass}
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="setup-phone" className={authLabelClass}>
              {translate("setup.phone")}
            </label>
            <input
              id="setup-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 XX XXX XX XX"
              className={authInputClass}
              required
            />
            <p className="mt-2 text-xs text-muted-foreground">{translate("setup.phoneHint")}</p>
          </div>

          {/* DOB */}
          <div>
            <label htmlFor="setup-dob" className={authLabelClass}>
              {translate("setup.dob")}
            </label>
            <input
              id="setup-dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className={authInputClass}
              required
            />
          </div>

          {error && (
            <div className="border-l-2 border-status-danger py-2 pl-4 text-sm text-[var(--status-danger-fg)]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="editorial-btn-primary mt-2 w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? translate("setup.submitting") : translate("setup.submit")}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
