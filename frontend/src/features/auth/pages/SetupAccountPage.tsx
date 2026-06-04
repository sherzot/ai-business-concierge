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
import { LocaleSelect } from "../../../shared/components/LocaleSelect";

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
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <div className="text-slate-500 animate-pulse">{translate("common.loading")}</div>
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative px-4">
      <div className="absolute top-4 right-4">
        <LocaleSelect variant="light" />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex w-16 h-16 rounded-xl bg-indigo-600 items-center justify-center mb-4 shadow-sm">
            <span className="font-bold text-2xl text-white">C</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{translate("setup.title")}</h1>
          <p className="text-slate-500 mt-1 text-sm">{translate("setup.subtitle")}</p>
          <p className="text-xs text-slate-400 mt-2">
            {session.user.email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-7 space-y-5">
          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-900">
              {translate("setup.password")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              autoComplete="new-password"
              placeholder={translate("setup.passwordPlaceholder")}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              required
            />
            <p className="mt-1 text-xs text-slate-500">{translate("setup.passwordHint")}</p>
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-slate-900">
              {translate("setup.confirmPassword")}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              autoComplete="new-password"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-900">
              {translate("setup.phone")}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 XX XXX XX XX"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              required
            />
            <p className="mt-1 text-xs text-slate-500">{translate("setup.phoneHint")}</p>
          </div>

          {/* DOB */}
          <div>
            <label className="block text-sm font-medium text-slate-900">
              {translate("setup.dob")}
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {pending ? translate("setup.submitting") : translate("setup.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
