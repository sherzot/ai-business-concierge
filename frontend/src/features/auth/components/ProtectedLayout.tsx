import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useI18n } from "../../../app/providers/I18nProvider";
import App from "../../../App";

export function ProtectedLayout() {
  const { session, profile, loading, error, currentTenant } = useAuthContext();
  const navigate = useNavigate();
  const { translate } = useI18n();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate("/login", { replace: true });
      return;
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-500">{translate("common.loading")}</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (error) {
    const isJwtError = /invalid|token|jwt|noto'g'ri/i.test(error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md p-6">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-slate-500">
            {isJwtError
              ? "JWT_SECRET Edge Function secrets da sozlanganligini tekshiring (Supabase → Project Settings → API → JWT Secret)."
              : "Sizning hisobingiz user_tenants jadvalida yo'q. Administrator bilan bog'laning."}
          </p>
        </div>
      </div>
    );
  }

  if (!profile?.tenants?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md p-6">
          <p className="text-slate-700 mb-2">Profil topilmadi</p>
          <p className="text-sm text-slate-500">
            Sizga hali tenant va rol berilmagan. Administrator bilan bog'laning.
          </p>
        </div>
      </div>
    );
  }

  if (!currentTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md p-6">
          <p className="text-slate-700">Tenant tanlang</p>
        </div>
      </div>
    );
  }

  return <App />;
}
