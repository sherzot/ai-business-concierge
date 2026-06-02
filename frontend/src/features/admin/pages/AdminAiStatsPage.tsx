import React, { useEffect, useState } from "react";
import { RefreshCw, Bot, DollarSign, Zap, TrendingUp, Building2 } from "lucide-react";
import { getAdminAiStats, AiStats } from "../api/adminApi";

const DAYS_OPTIONS = [7, 14, 30, 60, 90] as const;

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtK(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function BarChart({ data }: { data: { label: string; value: number; cost: number }[] }) {
  if (!data.length) return null;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-24 w-full">
      {data.map((d, i) => {
        const pct = (d.value / maxVal) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative min-w-0">
            <div
              className="w-full rounded-t-sm bg-indigo-500/40 group-hover:bg-indigo-500/70 transition-colors"
              style={{ height: `${Math.max(pct, 2)}%` }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-10">
              <div className="bg-slate-800 border border-white/10 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                <p className="font-semibold">{d.label}</p>
                <p>{fmtK(d.value)} so'rov</p>
                <p>${fmt(d.cost, 4)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AdminAiStatsPage() {
  const [stats, setStats]   = useState<AiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const [days, setDays]     = useState<30 | 7 | 14 | 60 | 90>(30);

  const load = async (d = days) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminAiStats(d);
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [days]);

  const dailyChartData = (stats?.daily ?? []).map((d) => ({
    label: new Date(d.date).toLocaleDateString("uz-UZ", { month: "short", day: "numeric" }),
    value: d.requests,
    cost: d.cost_usd,
  }));

  const totalModels = stats?.by_model.reduce((s, m) => s + m.requests, 0) ?? 1;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Statistika</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            AI so'rovlari, tokenlar va xarajatlar tahlili
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Days selector */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            {DAYS_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDays(d as typeof days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  days === d
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {d}k
              </button>
            ))}
          </div>
          <button
            onClick={() => load()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 shrink-0"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Yangilash
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-600 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading && !stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 p-5 animate-pulse">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
              <div className="h-8 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Jami so'rovlar", value: fmtK(stats.total_requests), icon: Bot, color: "text-indigo-500 dark:text-indigo-400" },
              { label: "Jami tokenlar", value: fmtK(stats.total_tokens), icon: Zap, color: "text-amber-500 dark:text-amber-400" },
              { label: "Jami xarajat", value: `$${fmt(stats.total_cost_usd)}`, icon: DollarSign, color: "text-emerald-500 dark:text-emerald-400" },
              { label: "Kunlik o'rtacha", value: fmtK(Math.round(stats.total_requests / Math.max(days, 1))), icon: TrendingUp, color: "text-blue-500 dark:text-blue-400" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className={color} />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
              </div>
            ))}
          </div>

          {/* Daily chart */}
          {dailyChartData.length > 0 && (
            <div className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 p-5 mb-5">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Kunlik so'rovlar ({days} kun)
              </h2>
              <BarChart data={dailyChartData} />
              <div className="flex justify-between mt-2 text-[10px] text-slate-400 dark:text-slate-500">
                <span>{dailyChartData[0]?.label}</span>
                <span>{dailyChartData[dailyChartData.length - 1]?.label}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Model breakdown */}
            {stats.by_model.length > 0 && (
              <div className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 p-5">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Model taqsimoti</h2>
                <div className="space-y-3">
                  {stats.by_model
                    .sort((a, b) => b.requests - a.requests)
                    .map((m) => {
                      const pct = Math.round((m.requests / totalModels) * 100);
                      return (
                        <div key={m.model}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{m.model}</span>
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 shrink-0">
                              <span>{fmtK(m.requests)} so'rov</span>
                              <span className="text-emerald-600 dark:text-emerald-400">${fmt(m.cost_usd)}</span>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700">
                            <div
                              className="h-1.5 rounded-full bg-indigo-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{pct}% • {fmtK(m.tokens)} token</p>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Top tenants */}
            {stats.top_tenants.length > 0 && (
              <div className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 p-5">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Top kompaniyalar</h2>
                <div className="space-y-2.5">
                  {stats.top_tenants.map((t, i) => {
                    const pct = Math.round((t.requests / Math.max(stats.total_requests, 1)) * 100);
                    return (
                      <div key={t.tenant_id} className="flex items-center gap-3">
                        <span className="w-5 text-xs text-slate-400 dark:text-slate-500 text-right font-mono shrink-0">{i + 1}</span>
                        <Building2 size={13} className="text-slate-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{t.tenant_name || t.tenant_id.slice(0, 8)}</span>
                            <div className="flex items-center gap-2 text-xs shrink-0">
                              <span className="text-slate-500 dark:text-slate-400">{fmtK(t.requests)}</span>
                              <span className="text-emerald-600 dark:text-emerald-400">${fmt(t.cost_usd)}</span>
                            </div>
                          </div>
                          <div className="h-1 rounded-full bg-slate-100 dark:bg-slate-700">
                            <div className="h-1 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Empty state for AI stats */}
          {stats.total_requests === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <Bot size={40} className="opacity-30" />
              <p className="text-sm font-medium">Bu davrda AI so'rovlari yo'q</p>
              <p className="text-xs text-slate-500 dark:text-slate-500">Boshqa davr tanlang yoki botni ishga tushiring</p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
