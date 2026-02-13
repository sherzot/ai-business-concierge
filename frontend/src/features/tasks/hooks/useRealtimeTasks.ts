import { useEffect, useRef } from "react";
import { supabase } from "../../../shared/lib/supabase";

/**
 * R-002: Tasks uchun Supabase Realtime subscription.
 * Vazifa qo'shilsa yoki o'zgarsa, onUpdate chaqiriladi (odatda refetch).
 */
export function useRealtimeTasks(tenantId: string | undefined, onUpdate: () => void) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!tenantId) return;

    const channel = supabase
      .channel(`tasks-${tenantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
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
