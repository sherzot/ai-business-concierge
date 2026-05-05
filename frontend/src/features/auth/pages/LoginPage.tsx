import React from "react";
import { LoginForm } from "../components/LoginForm";
import { useAuthContext } from "../context/AuthContext";
import { useI18n } from "../../../app/providers/I18nProvider";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import type { Locale } from "../../../app/i18n";

const LOCALE_OPTIONS: { id: Locale; label: string }[] = [
  { id: "uz", label: "O'zbek" },
  { id: "ru", label: "Русский" },
  { id: "en", label: "English" },
  { id: "ja", label: "日本語" },
];

export function LoginPage() {
  const { translate, locale, setLocale } = useI18n();
  const { session, loading } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) {
      navigate("/app", { replace: true });
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-500">{translate("common.loading")}</div>
      </div>
    );
  }

  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 relative">
      {/* Til selektori — auth'siz holatda ham o'zgartirish mumkin */}
      <div className="absolute top-4 right-4 flex gap-1 rounded-full bg-white/10 backdrop-blur p-1 border border-white/20">
        {LOCALE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setLocale(opt.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              locale === opt.id
                ? "bg-white text-indigo-700"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
            aria-label={`Switch to ${opt.label}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-xl bg-indigo-500 items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
            <span className="font-bold text-2xl text-white">C</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {translate("auth.loginTitle")}
          </h1>
          <p className="text-slate-400 mt-1">{translate("auth.loginSubtitle")}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
