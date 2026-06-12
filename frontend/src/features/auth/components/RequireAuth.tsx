import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useI18n } from "../../../app/providers/I18nProvider";

type Props = { children: React.ReactNode };

export function RequireAuth({ children }: Props) {
  const { session, loading } = useAuthContext();
  const navigate = useNavigate();
  const { translate } = useI18n();

  useEffect(() => {
    if (!loading && !session) navigate("/login", { replace: true });
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return <>{children}</>;
}
