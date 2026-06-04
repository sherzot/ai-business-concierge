import React, { useEffect, useState } from "react";
import {
  Activity, Building2, Users, Bell, MessageSquare, Clock, RefreshCw, CheckCircle2, AlertCircle,
} from "lucide-react";
import { getAdminHealth, type HealthStats } from "../api/adminApi";

function StatCard({ label, value, sub, icon: Icon, accent }: {
  label: string; value: number | string; sub?: string;
  icon: React.ElementType; accent: string;
}) {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-white/8 p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm font-medium text-slate-300">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function AdminHealthPage() {
  const [data, setData] = useState<HealthStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setRefreshing(true);
    setError(null);
    try {
      const res = await getAdminHealth();
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-700" />
          <div className="space-y-1.5">
            <div className="h-5 w-32 bg-slate-700 rounded" />
            <div className="h-3 w-48 bg-slate-700 rounded" />
          </div>
        </div>
        <div className="h-16 rounded-xl bg-slate-700" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/8 p-4 space-y-2 bg-slate-800/50">
              <div className="h-3 w-20 bg-slate-700 rounded" />
              <div className="h-8 w-16 bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Tizim holati</h1>
            {data && (
              <p className="text-xs text-slate-500">
                Tekshirildi: {new Date(data.checked_at).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={load}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Yangilash
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 py-3 flex items-center gap-2 text-sm text-rose-400">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Status banner */}
          <div className={`rounded-xl border px-5 py-4 flex items-center gap-3 ${
            data.db_latency_ms < 500
              ? "bg-emerald-500/10 border-emerald-500/20"
              : "bg-amber-500/10 border-amber-500/20"
          }`}>
            <CheckCircle2 size={20} className={data.db_latency_ms < 500 ? "text-emerald-400" : "text-amber-400"} />
            <div>
              <p className={`font-semibold text-sm ${data.db_latency_ms < 500 ? "text-emerald-300" : "text-amber-300"}`}>
                {data.db_latency_ms < 500 ? "Tizim normal ishlayapti" : "Kechikish sezilmoqda"}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <Clock size={11} /> DB javob vaqti: <strong className="text-slate-200">{data.db_latency_ms} ms</strong>
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard
              label="Jami kompaniyalar"
              value={data.tenants.total}
              sub={`${data.tenants.active} active · ${data.tenants.pending_approval} kutmoqda`}
              icon={Building2}
              accent="bg-indigo-500"
            />
            <StatCard
              label="Tasdiqlash kutayotgan"
              value={data.tenants.pending_approval}
              sub="Kompaniyalar"
              icon={AlertCircle}
              accent={data.tenants.pending_approval > 0 ? "bg-amber-500" : "bg-slate-600"}
            />
            <StatCard
              label="Jami foydalanuvchilar"
              value={data.users.total}
              sub={`${data.users.active} active · ${data.users.pending_setup} parol kutmoqda`}
              icon={Users}
              accent="bg-violet-500"
            />
            <StatCard
              label="Murojaat qilganlar"
              value={data.contacts.total}
              sub={`${data.contacts.needs_action} ta harakatni kutmoqda`}
              icon={MessageSquare}
              accent="bg-sky-500"
            />
            <StatCard
              label="Bildirishnomalar"
              value={data.notifications.total}
              sub={`${data.notifications.unread} o'qilmagan`}
              icon={Bell}
              accent="bg-rose-500"
            />
            <StatCard
              label="DB Latency"
              value={`${data.db_latency_ms} ms`}
              sub={data.db_latency_ms < 200 ? "Juda yaxshi" : data.db_latency_ms < 500 ? "Normal" : "Sekin"}
              icon={Clock}
              accent={data.db_latency_ms < 500 ? "bg-emerald-500" : "bg-amber-500"}
            />
          </div>
        </>
      )}
    </div>
  );
}
