import { useEffect, useRef } from "react";
import { supabase } from "../../../shared/lib/supabase";

/**
 * R-002: Inbox uchun Supabase Realtime subscription.
 * Yangi xabar kelsa yoki o'zgarsa, onUpdate chaqiriladi (odatda refetch).
 */
export function useRealtimeInbox(tenantId: string | undefined, onUpdate: () => void) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!tenantId) return;

    const channel = supabase
      .channel(`inbox-${tenantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inbox_items",
          filter: `tenant_id=eq.${tenantId}`,
        },
        () => {
          onUpdateRef.current();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId]);
}
