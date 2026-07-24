import React, { useCallback, useEffect, useState } from "react";
import { clsx } from "clsx";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../shared/ui/dropdown-menu";
import { getNotifications, markNotificationRead, type Notification } from "../api/notificationsApi";
import { useRealtimeNotifications } from "../hooks/useRealtimeNotifications";
import { formatDistanceToNow } from "date-fns";
import { enUS, ja, ru, uz } from "date-fns/locale";
import { useI18n } from "../../../app/providers/I18nProvider";

// Icon per notification type
const TYPE_ICON: Record<string, string> = {
  task: "✅",
  hr: "👤",
  invoice: "💳",
  system: "🔧",
};

type Props = {
  tenantId: string;
  userId?: string;
  onViewAll?: () => void;
};

export function NotificationsDropdown({ tenantId, userId, onViewAll }: Props) {
  const { locale, translate } = useI18n();
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

  async function handleMarkAllRead() {
    const unread = notifications.filter((n) => !n.read_at);
    await Promise.allSettled(unread.map((n) => markNotificationRead(tenantId, n.id)));
    setNotifications((prev) => prev.map((x) => ({ ...x, read_at: x.read_at ?? new Date().toISOString() })));
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          aria-label={translate("notifications.title")}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <>
              {/* Ping ring for new notifications */}
              <span className="absolute top-1.5 right-1.5 w-[18px] h-[18px] rounded-full bg-rose-500 opacity-40 animate-ping" />
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-rose-500 text-white rounded-full border-2 border-white z-10">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <span className="text-sm font-semibold text-foreground">{translate("notifications.title")}</span>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              <CheckCheck size={13} />
              {translate("notifications.markAllRead")}
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-8 gap-2 text-slate-400">
              <BellOff size={28} className="opacity-40" />
              <p className="text-sm text-muted-foreground">{translate("notifications.empty")}</p>
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                onClick={() => handleMarkRead(n)}
                className={clsx(
                  "flex items-start gap-3 px-4 py-3 cursor-pointer rounded-none border-b border-slate-50 last:border-0 focus:rounded-none",
                  !n.read_at && "bg-indigo-50/60 hover:bg-indigo-50"
                )}
              >
                {/* Type icon */}
                <span className="text-base mt-0.5 shrink-0">
                  {TYPE_ICON[(n as any).type ?? ""] ?? "🔔"}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-sm font-medium text-slate-800 leading-snug">{n.title}</p>
                    {!n.read_at && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                    )}
                  </div>
                  {n.message && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">
                    {formatDistanceToNow(new Date(n.created_at), {
                      addSuffix: true,
                      locale: { uz, ru, en: enUS, ja }[locale],
                    })}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        {/* Footer */}
        {onViewAll && (
          <div className="border-t border-slate-100 p-2">
            <button
              onClick={() => { setOpen(false); onViewAll(); }}
              className="w-full text-xs text-indigo-600 font-medium hover:bg-indigo-50 rounded-md py-1.5 transition-colors"
            >
              {translate("notifications.viewAll")}
            </button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
