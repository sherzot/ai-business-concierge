import { useEffect } from "react";
import { supabase } from "../../shared/lib/supabase";

/**
 * R-002: Realtime RLS uchun session token ni sync qiladi.
 * Session o'zgarganda Realtime connection yangi token bilan yangilanadi.
 */
export function RealtimeAuthSync({ session }: { session: { access_token: string } | null }) {
  useEffect(() => {
    if (session?.access_token) {
      supabase.realtime.setAuth(session.access_token);
    }
  }, [session?.access_token]);
  return null;
}
