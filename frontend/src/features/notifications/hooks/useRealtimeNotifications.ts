import { useEffect, useRef } from "react";
import { supabase } from "../../../shared/lib/supabase";

export function useRealtimeNotifications(
  userId: string | undefined,
  tenantId: string | undefined,
  onNew: () => void,
) {
  const onNewRef = useRef(onNew);
  onNewRef.current = onNew;

  useEffect(() => {
    if (!userId || !tenantId) return;

    const channel = supabase
      .channel(`notifications-${tenantId}-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => { onNewRef.current(); },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, tenantId]);
}
