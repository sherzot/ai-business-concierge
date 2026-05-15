import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2, Users, Activity, MessageSquare, ArrowRight,
  RefreshCw, Clock, CheckCircle2, AlertCircle, TrendingUp,
} from "lucide-react";
import { getAdminHealth, getAdminCompanies, type HealthStats, type Company } from "../api/adminApi";

function StatCard({
  label, value, sub, icon: Icon, accent, onClick,
}: {
  label: string; value: number | string; sub?: string;
  icon: React.ElementType; accent: string; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`w-full text-left bg-slate-800/50 border border-white/8 rounded-xl p-5 flex items-start gap-4 transition-all ${
        onClick ? "hover:border-white/20 hover:bg-slate-800/80 cursor-pointer" : "cursor-default"
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm font-medium text-slate-300">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
      {onClick && <ArrowRight size={16} className="ml-auto text-slate-600 self-center shrink-0" />}
    </button>
  );
}

function QuickLink({ to, icon: Icon, label, desc }: {
  to: string; icon: React.ElementType; label: string; desc: string;
}) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center gap-3 p-4 bg-slate-800/30 border border-white/8 rounded-xl hover:bg-slate-800/60 hover:border-white/15 transition-all text-left"
    >
      <div className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-indigo-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <ArrowRight size={14} className="ml-auto text-slate-600" />
    </button>
  );
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [health, setHealth] = useState<HealthStats | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [h, c] = await Promise.all([getAdminHealth(), getAdminCompanies()]);
      setHealth(h);
      setCompanies(c);
    } catch {
      // silently fail — each section shows its own state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 30_000);
    return () => clearInterval(interval);
  }, []);

  const pending   = companies.filter((c) => c.status === "pending_approval").length;
  const active    = companies.filter((c) => c.status === "active").length;
  const suspended = companies.filter((c) => c.status === "suspended").length;
  const blocked   = companies.filter((c) => c.status === "blocked").length;
  const total     = companies.length;

  const checkedAt = health?.checked_at
    ? new Date(health.checked_at).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })
    : "--";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {loading ? "Yuklanmoqda..." : `Oxirgi yangilanish: ${checkedAt}`}
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={loading || refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 text-slate-200 text-sm hover:bg-slate-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Yangilash
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32 text-slate-500">
          <RefreshCw size={24} className="animate-spin mr-3" /> Yuklanmoqda...
        </div>
      ) : (
        <>
          {/* DB status banner */}
          {health && (
            <div className={`mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
              health.status === "ok"
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                : "bg-amber-500/10 border-amber-500/25 text-amber-300"
            }`}>
              {health.status === "ok"
                ? <CheckCircle2 size={16} />
                : <AlertCircle size={16} />
              }
              <span>
                Tizim holati: <strong>{health.status === "ok" ? "Yaxshi" : "Muammo bor"}</strong>
                {" · "}DB kechikish: <strong>{health.db_latency_ms} ms</strong>
              </span>
            </div>
          )}

          {/* Main stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Jami kompaniyalar"
              value={total}
              sub={`${pending} tasdiqqacha kutmoqda`}
              icon={Building2}
              accent="bg-indigo-500"
              onClick={() => navigate("/admin/companies")}
            />
            <StatCard
              label="Faol kompaniyalar"
              value={active}
              sub={`${suspended} to'xtatilgan, ${blocked} bloklangan`}
              icon={TrendingUp}
              accent="bg-emerald-500"
              onClick={() => navigate("/admin/companies?status=active")}
            />
            <StatCard
              label="Jami foydalanuvchilar"
              value={health?.users.total ?? "—"}
              sub={health ? `${health.users.active} faol · ${health.users.pending_setup} setup kutmoqda` : undefined}
              icon={Users}
              accent="bg-sky-500"
            />
            <StatCard
              label="Murojaatlar"
              value={health?.contacts.total ?? "—"}
              sub={health ? `${health.contacts.needs_action} harakat talab qiladi` : undefined}
              icon={Clock}
              accent="bg-amber-500"
              onClick={() => navigate("/admin/contacts")}
            />
          </div>

          {/* Company status breakdown */}
          {total > 0 && (
            <div className="mb-8 bg-slate-800/30 border border-white/8 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Kompaniyalar holati</h3>
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: "Kutilmoqda", count: pending,   color: "bg-amber-500" },
                  { label: "Faol",       count: active,    color: "bg-emerald-500" },
                  { label: "To'xtatilgan", count: suspended, color: "bg-orange-500" },
                  { label: "Bloklangan", count: blocked,   color: "bg-red-500" },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 rounded-lg">
                    <span className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-xs text-slate-300">{label}</span>
                    <span className="text-xs font-bold text-white">{count}</span>
                  </div>
                ))}
              </div>
              {total > 0 && (
                <div className="mt-3 h-2 rounded-full bg-slate-700 overflow-hidden flex">
                  {active    > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${(active/total)*100}%` }} />}
                  {pending   > 0 && <div className="bg-amber-500  transition-all" style={{ width: `${(pending/total)*100}%` }} />}
                  {suspended > 0 && <div className="bg-orange-500 transition-all" style={{ width: `${(suspended/total)*100}%` }} />}
                  {blocked   > 0 && <div className="bg-red-500    transition-all" style={{ width: `${(blocked/total)*100}%` }} />}
                </div>
              )}
            </div>
          )}

          {/* Quick links */}
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Tezkor harakatlar</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <QuickLink to="/admin/contacts"  icon={Users}        label="Murojaatlarni ko'rish"   desc="Yangi arizalar va harakat kerak bo'lganlar" />
            <QuickLink to="/admin/companies" icon={Building2}    label="Kompaniyalarni boshqarish" desc="Tasdiqlash, bloklash, tafsilotlar" />
            <QuickLink to="/admin/health"    icon={Activity}     label="Tizim holati"             desc="DB, API, foydalanuvchilar statistikasi" />
            <QuickLink to="/admin/ai-chat"   icon={MessageSquare} label="Admin AI Chat"            desc="Tizim haqida savollar berish" />
          </div>
        </>
      )}
    </div>
  );
}
