import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
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
  // Joriy user.id ni eslab qolamiz — TOKEN_REFRESHED yoki tab focus
  // hodisalarida profile'ni qaytadan yuklamaslik uchun.
  const currentUserIdRef = useRef<string | null>(null);

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
    let mounted = true;

    const applySession = async (session: Session | null) => {
      if (!mounted) return;
      setSession(session);
      setError(null);
      if (!session) {
        currentUserIdRef.current = null;
        setProfile(null);
        setCurrentTenant(null);
        setLoading(false);
        return;
      }
      // MUHIM: profile fetch boshlanyapti — loading=true qilamiz, aks holda
      // ProtectedLayout 'Profil topilmadi' banner'ini noto'g'ri ko'rsatadi
      // (profile hali yuklanmagan, lekin session bor).
      setLoading(true);
      try {
        const p = await fetchAuthProfile();
        if (!mounted) return;
        setProfile(p);
        setCurrentTenant(p.defaultTenant);
        currentUserIdRef.current = session.user.id;
      } catch (e) {
        if (!mounted) return;
        setProfile(null);
        setError(e instanceof Error ? e.message : "Profil yuklanmadi");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Tezda boshlang'ich session olish
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) applySession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;

        // ASOSIY OPTIMIZATSIYA:
        // Agar yangi session AYNI O'SHA user uchun (id mos kelsa), bu
        // shunchaki token refresh / tab focus / silent re-auth.
        // Profile va boshqa ma'lumotlar o'zgarmagan — fetchAuthProfile
        // chaqirish kerak emas. Aks holda har tab almashtirganda
        // foydalanuvchining ishi (form ma'lumotlari, ochiq modallar) yo'qoladi.
        const newUserId = newSession?.user?.id ?? null;
        if (
          newUserId &&
          currentUserIdRef.current &&
          newUserId === currentUserIdRef.current
        ) {
          // Faqat token yangilanadi (Realtime ham yangi tokenni oladi)
          setSession(newSession);
          return;
        }

        // Yangi user (login/logout/account o'zgarish) — full applySession
        applySession(newSession);
      }
    );

    // Timeout: 5 sekunddan keyin o'chiq bo'lsa login formani ko'rsat
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) throw new Error(err.message);
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    currentUserIdRef.current = null;
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
