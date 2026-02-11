import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../../../shared/lib/supabase";
import { fetchAuthProfile } from "../api/authApi";
import type { AuthProfile, TenantAssignment } from "../types";

type AuthContextValue = {
  session: Session | null;
  profile: AuthProfile | null;
  error: string | null;
  loading: boolean;
  currentTenant: TenantAssignment | null;
  setCurrentTenant: (t: TenantAssignment | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  canAccess: (module: string) => boolean;
  refetchProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [currentTenant, setCurrentTenant] = useState<TenantAssignment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refetchProfile = useCallback(async () => {
    if (!session) return;
    try {
      const p = await fetchAuthProfile();
      setProfile(p);
      if (!currentTenant && p.defaultTenant) {
        setCurrentTenant(p.defaultTenant);
      }
      if (currentTenant && p.tenants.length) {
        const updated = p.tenants.find((t) => t.id === currentTenant.id);
        if (updated) setCurrentTenant(updated);
      }
    } catch (e) {
      setProfile(null);
      setError(e instanceof Error ? e.message : "Profil yuklanmadi");
    }
  }, [session, currentTenant?.id]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setError(null);
        if (!session) {
          setProfile(null);
          setCurrentTenant(null);
          setLoading(false);
          return;
        }
        try {
          const p = await fetchAuthProfile();
          setProfile(p);
          setCurrentTenant(p.defaultTenant);
        } catch (e) {
          setProfile(null);
          setError(e instanceof Error ? e.message : "Profil yuklanmadi");
        } finally {
          setLoading(false);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) throw new Error(err.message);
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setCurrentTenant(null);
  }, []);

  const canAccess = useCallback(
    (module: string): boolean => {
      if (!currentTenant) return false;
      return currentTenant.permissions.includes(module);
    },
    [currentTenant]
  );

  const value: AuthContextValue = {
    session,
    profile,
    error,
    loading,
    currentTenant,
    setCurrentTenant,
    login,
    logout,
    canAccess,
    refetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
