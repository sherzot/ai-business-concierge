import React from "react";
import { LoginForm } from "../components/LoginForm";
import { useAuthContext } from "../context/AuthContext";
import { useI18n } from "../../../app/providers/I18nProvider";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export function LoginPage() {
  const { translate } = useI18n();
  const { session, loading } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) {
      navigate("/", { replace: true });
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
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
