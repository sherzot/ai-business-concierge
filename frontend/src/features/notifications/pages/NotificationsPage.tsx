import React, { useCallback, useEffect, useState } from "react";
import { Bell, Check, CheckCheck, RefreshCw, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getNotifications, markNotificationRead, type Notification } from "../api/notificationsApi";
import { useRealtimeNotifications } from "../hooks/useRealtimeNotifications";

const TYPE_LABELS: Record<string, string> = {
  hr_employee_confirmed:   "HR",
  hr_password_set:         "HR",
  task_assigned:           "Vazifa",
  task_completed:          "Vazifa",
  inbox_message:           "Xabar",
  system:                  "Tizim",
};

const TYPE_COLORS: Record<string, string> = {
  hr_employee_confirmed:  "bg-emerald-100 text-emerald-700",
  hr_password_set:        "bg-blue-100 text-blue-700",
  task_assigned:          "bg-indigo-100 text-indigo-700",
  task_completed:         "bg-green-100 text-green-700",
  inbox_message:          "bg-purple-100 text-purple-700",
  system:                 "bg-slate-100 text-slate-600",
};

type FilterType = "all" | "unread" | "read";

type Props = { tenantId: string; userId?: string };

export function NotificationsPage({ tenantId, userId }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getNotifications(tenantId);
      setNotifications(data);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { load(); }, [load]);
  useRealtimeNotifications(userId, tenantId, load);

  async function handleMarkRead(n: Notification) {
    if (n.read_at) return;
    try {
      await markNotificationRead(tenantId, n.id);
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x))
      );
    } catch { /* silent */ }
  }

  async function markAllRead() {
    setMarkingAll(true);
    const unread = notifications.filter((n) => !n.read_at);
    await Promise.allSettled(unread.map((n) => markNotificationRead(tenantId, n.id)));
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    setMarkingAll(false);
  }

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read_at;
    if (filter === "read") return !!n.read_at;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
          <Bell size={18} className="text-indigo-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-800">Bildirishnomalar</h2>
          <p className="text-xs text-slate-400">
            {unreadCount > 0 ? `${unreadCount} ta o'qilmagan` : "Hammasi o'qilgan"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <CheckCheck size={13} />
              Hammasini o'qi
            </button>
          )}
          <button
            onClick={() => { setLoading(true); load(); }}
            disabled={loading}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        <Filter size={14} className="text-slate-400" />
        {(["all", "unread", "read"] as FilterType[]).map((f) => {
          const labels = { all: "Barchasi", unread: "O'qilmagan", read: "O'qilgan" };
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filter === f
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {labels[f]}
              {f === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 bg-white/20 rounded-full px-1">{unreadCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <RefreshCw size={18} className="animate-spin mr-2" /> Yuklanmoqda...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <Bell size={32} className="text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">
            {filter === "unread" ? "O'qilmagan bildirishnomalar yo'q" : "Bildirishnomalar yo'q"}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {filtered.map((n, i) => {
            const isUnread = !n.read_at;
            const typeLabel = TYPE_LABELS[n.type] ?? n.type;
            const typeColor = TYPE_COLORS[n.type] ?? "bg-slate-100 text-slate-600";
            return (
              <div
                key={n.id}
                onClick={() => handleMarkRead(n)}
                className={`flex items-start gap-4 px-5 py-4 border-b border-slate-100 last:border-0 transition-colors ${
                  isUnread ? "bg-indigo-50/40 cursor-pointer hover:bg-indigo-50/70" : "hover:bg-slate-50/60"
                } ${i === 0 ? "" : ""}`}
              >
                {/* Unread dot */}
                <div className="mt-1.5 shrink-0">
                  {isUnread ? (
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  ) : (
                    <Check size={14} className="text-slate-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className={`text-sm font-medium ${isUnread ? "text-slate-900" : "text-slate-600"}`}>
                      {n.title}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${typeColor}`}>
                      {typeLabel}
                    </span>
                  </div>
                  {n.message && (
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
