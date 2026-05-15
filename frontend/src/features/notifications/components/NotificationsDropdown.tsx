import React, { useCallback, useEffect, useState } from "react";
import { clsx } from "clsx";
import { Bell, CheckSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../shared/ui/dropdown-menu";
import { getNotifications, markNotificationRead, type Notification } from "../api/notificationsApi";
import { useRealtimeNotifications } from "../hooks/useRealtimeNotifications";
import { formatDistanceToNow } from "date-fns";

type Props = {
  tenantId: string;
  userId?: string;
  onViewAll?: () => void;
};

export function NotificationsDropdown({ tenantId, userId, onViewAll }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(() => {
    if (tenantId) {
      getNotifications(tenantId).then(setNotifications).catch(() => setNotifications([]));
    }
  }, [tenantId]);

  useEffect(() => { refresh(); }, [refresh, open]);

  useRealtimeNotifications(userId, tenantId, refresh);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  async function handleMarkRead(n: Notification) {
    if (n.read_at) return;
    try {
      await markNotificationRead(tenantId, n.id);
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x))
      );
    } catch {
      // ignore
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-rose-500 text-white rounded-full border-2 border-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-slate-500">
            Bildirishnomalar yo&apos;q
          </div>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              onClick={() => handleMarkRead(n)}
              className={clsx(
                "flex flex-col items-start gap-0.5 py-3 cursor-pointer",
                !n.read_at && "bg-indigo-50/50"
              )}
            >
              <div className="flex items-start gap-2 w-full">
                <CheckSquare size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{n.title}</p>
                  {n.message && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
        {onViewAll && (
          <div className="border-t border-slate-100 p-2">
            <button
              onClick={() => { setOpen(false); onViewAll(); }}
              className="w-full text-xs text-indigo-600 font-medium hover:bg-indigo-50 rounded-md py-1.5 transition-colors"
            >
              Barchasini ko&apos;rish
            </button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
