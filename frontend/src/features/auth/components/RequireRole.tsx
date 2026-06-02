import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

type Props = {
  roles: string[];
  children: React.ReactNode;
};

export function RequireRole({ roles, children }: Props) {
  const { currentTenant, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!currentTenant || !roles.includes(currentTenant.role)) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
