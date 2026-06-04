import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2, Users, Activity, MessageSquare, ArrowRight,
  RefreshCw, Clock, CheckCircle2, AlertCircle, TrendingUp,
  ShieldCheck, Zap, DollarSign, Bot,
} from "lucide-react";
import {
  getAdminHealth, getAdminCompanies, getAdminAiStats,
  type HealthStats, type Company, type AiStats,
} from "../api/adminApi";

// ─────────────────────────────────────────────────────────────────────────────
// StatCard
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, accent, onClick, trend,
}: {
  label: string; value: number | string; sub?: string;
  icon: React.ElementType; accent: string; onClick?: () => void;
  trend?: { value: number; label: string };
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`w-full text-left bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 rounded-xl p-5 flex items-start gap-4
        transition-all duration-200
        ${onClick ? "hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:scale-[1.01] cursor-pointer" : "cursor-default"}`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
        <p className="text-sm font-medium text-slate-300">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
        {trend && (
          <p className={`text-xs mt-1 font-medium ${trend.value >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)} {trend.label}
          </p>
        )}
      </div>
      {onClick && <ArrowRight size={16} className="ml-auto text-slate-600 self-center shrink-0" />}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DonutChart — pure SVG, no library
// ─────────────────────────────────────────────────────────────────────────────
type DonutSlice = { value: number; color: string; label: string };

function DonutChart({ slices, size = 140 }: { slices: DonutSlice[]; size?: number }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total === 0) return (
    <div style={{ width: size, height: size }} className="flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 10} fill="none" stroke="#334155" strokeWidth={18} />
      </svg>
    </div>
  );

  const cx = size / 2, cy = size / 2, r = size / 2 - 12;
  const circumference = 2 * Math.PI * r;

  let cumulativeAngle = -90; // Start from top

  const paths = slices
    .filter((s) => s.value > 0)
    .map((slice) => {
      const angle = (slice.value / total) * 360;
      const startAngle = (cumulativeAngle * Math.PI) / 180;
      cumulativeAngle += angle;
      const endAngle = (cumulativeAngle * Math.PI) / 180;

      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = angle > 180 ? 1 : 0;

      return {
        d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
        color: slice.color,
        label: slice.label,
        value: slice.value,
      };
    });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
      {/* Background ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={18} />

      {paths.map((p, i) => (
        <g key={i} className="group/slice">
          <path d={p.d} fill={p.color} opacity={0.9} className="transition-opacity hover:opacity-100" />
        </g>
      ))}

      {/* Center hole */}
      <circle cx={cx} cy={cy} r={r - 18} fill="#0f172a" />

      {/* Center text */}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize={20} fontWeight="bold"
        className="font-mono">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize={10}>jami</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MiniBarChart — 7 kunlik registratsiyalar
// ─────────────────────────────────────────────────────────────────────────────
function MiniBarChart({ companies }: { companies: Company[] }) {
  const bars = useMemo(() => {
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days[d.toISOString().slice(0, 10)] = 0;
    }
    companies.forEach((c) => {
      const day = c.created_at?.slice(0, 10) ?? "";
      if (day in days) days[day]++;
    });
    return Object.entries(days).map(([date, count]) => ({
      date: date.slice(5), // "MM-DD"
      count,
    }));
  }, [companies]);

  const max = Math.max(...bars.map((b) => b.count), 1);
  const H = 60, W = 180;
  const barW = Math.floor(W / bars.length) - 3;

  return (
    <div>
      <p className="text-xs text-slate-500 mb-2">So'nggi 7 kun registratsiyalar</p>
      <svg width={W} height={H + 16} className="overflow-visible">
        {bars.map((bar, i) => {
          const bh = Math.max(bar.count > 0 ? (bar.count / max) * H : 2, 2);
          const x = i * (barW + 3);
          const y = H - bh;
          return (
            <g key={bar.date}>
              <rect
                x={x} y={y} width={barW} height={bh}
                rx={2}
                fill={bar.count > 0 ? "#6366f1" : "#1e293b"}
                className="transition-all duration-300"
              />
              {bar.count > 0 && (
                <text x={x + barW / 2} y={y - 3} textAnchor="middle"
                  fill="#a5b4fc" fontSize={8}>{bar.count}</text>
              )}
              <text x={x + barW / 2} y={H + 13} textAnchor="middle"
                fill="#475569" fontSize={8}>{bar.date}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LatencyGauge — DB latency visual
// ─────────────────────────────────────────────────────────────────────────────
function LatencyGauge({ ms }: { ms: number }) {
  // 0–50ms green, 51–200ms yellow, 200+ red
  const color = ms <= 50 ? "#10b981" : ms <= 200 ? "#f59e0b" : "#ef4444";
  const label = ms <= 50 ? "A'lo" : ms <= 200 ? "Qoniqarli" : "Sekin";
  // Arc from -140deg to 140deg (280deg total)
  const pct = Math.min(ms / 500, 1); // 500ms = max
  const angle = -140 + pct * 280;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const cx = 60, cy = 55, r = 42;
  const x = cx + r * Math.cos(toRad(angle));
  const y = cy + r * Math.sin(toRad(angle));

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs text-slate-500 mb-1">DB kechikish</p>
      <svg width={120} height={75} viewBox="0 0 120 75" className="overflow-visible">
        {/* Track arc */}
        <path
          d={`M ${cx + r * Math.cos(toRad(-140))} ${cy + r * Math.sin(toRad(-140))}
              A ${r} ${r} 0 1 1 ${cx + r * Math.cos(toRad(140))} ${cy + r * Math.sin(toRad(140))}`}
          fill="none" stroke="#1e293b" strokeWidth={8} strokeLinecap="round"
        />
        {/* Value arc */}
        {pct > 0 && (
          <path
            d={`M ${cx + r * Math.cos(toRad(-140))} ${cy + r * Math.sin(toRad(-140))}
                A ${r} ${r} 0 ${pct > 9 / 14 ? 1 : 0} 1 ${x} ${y}`}
            fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
            className="transition-all duration-700"
          />
        )}
        {/* Needle dot */}
        <circle cx={x} cy={y} r={4} fill={color} className="transition-all duration-700" />
        {/* Center value */}
        <text x={cx} y={cy + 5} textAnchor="middle" fill="white" fontSize={16} fontWeight="bold"
          className="font-mono">{ms}</text>
        <text x={cx} y={cy + 18} textAnchor="middle" fill="#64748b" fontSize={8}>ms</text>
        <text x={cx} y={cy + 28} textAnchor="middle" fill={color} fontSize={8} fontWeight="600">{label}</text>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SecurityPosture — 14+ completed security fixes
// ─────────────────────────────────────────────────────────────────────────────
const SECURITY_FIXES = [
  // Critical
  { id: "K-001", sev: "critical", title: "getTenantContext() — autentifikatsiyasiz header bekor qilindi" },
  { id: "K-002", sev: "critical", title: "/ai/chat — system_prompt injection to'sib qo'yildi" },
  { id: "K-004", sev: "critical", title: "Hardcoded credentials config.ts dan olib tashlandi" },
  { id: "K-005", sev: "critical", title: "Telegram webhook secreti majburiy qilindi" },
  { id: "K-006", sev: "critical", title: "Demo foydalanuvchi parollari hujjatlardan o'chirildi" },
  // High
  { id: "H-001", sev: "high",     title: "CORS — wildcard '*' aniq domenlar bilan almashtirildi" },
  { id: "H-002", sev: "high",     title: "AI kvota — guardUsage() + recordUsage() ulandi" },
  { id: "H-003", sev: "high",     title: "Rate limiting — in-memory emas, DB asosiga o'tkazildi" },
  { id: "H-004", sev: "high",     title: "RequireRole — /admin marshrut DB-based tekshiruvi" },
  { id: "H-005", sev: "high",     title: "match_knowledge() — tenant izolyatsiyasi DB darajasida" },
  { id: "H-006", sev: "high",     title: "Resend webhook — imzo tekshiruvi majburiy qilindi" },
  { id: "H-007", sev: "high",     title: "apiClient.ts — anon key fallback olib tashlandi" },
  // Medium
  { id: "M-002", sev: "medium",   title: "increment_usage() — auth.uid() tekshiruvi qo'shildi" },
  { id: "M-003", sev: "medium",   title: "Taklif tokeni — har safar yangi token generatsiya" },
  { id: "M-004", sev: "medium",   title: "CV matni — LLM ga yuborishdan oldin sanitizatsiya" },
  { id: "M-005", sev: "medium",   title: "Hard-delete — faqat admin rollar ruxsat etildi" },
  { id: "M-006", sev: "medium",   title: "Bildirishnomalar — tenant_id filtri qo'shildi" },
  { id: "M-008", sev: "medium",   title: "Parol uzunligi — minimum 8 dan 12 ga oshirildi" },
] as const;

type SevKey = "critical" | "high" | "medium";
const SEV_CONFIG: Record<SevKey, { label: string; dot: string; badge: string }> = {
  critical: { label: "Kritik",   dot: "bg-red-500",    badge: "text-red-400 bg-red-500/10 border-red-500/25" },
  high:     { label: "Yuqori",   dot: "bg-orange-500", badge: "text-orange-400 bg-orange-500/10 border-orange-500/25" },
  medium:   { label: "O'rta",    dot: "bg-amber-400",  badge: "text-amber-400 bg-amber-500/10 border-amber-500/25" },
};

function SecurityPosture() {
  const grouped = useMemo(() => ({
    critical: SECURITY_FIXES.filter((f) => f.sev === "critical"),
    high:     SECURITY_FIXES.filter((f) => f.sev === "high"),
    medium:   SECURITY_FIXES.filter((f) => f.sev === "medium"),
  }), []);

  return (
    <div className="bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-white/8 rounded-xl p-5 mb-4">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
          <ShieldCheck size={18} className="text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Xavfsizlik holati</h3>
          <p className="text-xs text-slate-500">{SECURITY_FIXES.length} ta muammo aniqlandi va bartaraf etildi</p>
        </div>
        <span className="ml-auto text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
          {SECURITY_FIXES.length}/{SECURITY_FIXES.length} ✓
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["critical", "high", "medium"] as SevKey[]).map((sev) => {
          const cfg = SEV_CONFIG[sev];
          const fixes = grouped[sev];
          return (
            <div key={sev}>
              <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border mb-3 ${cfg.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label} ({fixes.length})
              </div>
              <ul className="space-y-2">
                {fixes.map((f) => (
                  <li key={f.id} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-slate-400 leading-relaxed">
                      <span className="font-mono text-slate-500 mr-1">{f.id}</span>
                      {f.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AiCostBarChart — daily cost visualization
// ─────────────────────────────────────────────────────────────────────────────
function AiCostBarChart({ daily }: { daily: { date: string; cost_usd: number }[] }) {
  const max = Math.max(...daily.map((d) => d.cost_usd), 0.001);
  const H = 56, barW = 10;

  if (!daily.length) {
    return <p className="text-xs text-slate-500 py-4 text-center">Ma'lumot yo'q</p>;
  }

  return (
    <div className="overflow-x-auto">
      <svg width={daily.length * 14} height={H + 18} className="overflow-visible min-w-full">
        {daily.map((d, i) => {
          const bh = Math.max((d.cost_usd / max) * H, d.cost_usd > 0 ? 2 : 1);
          const x = i * 14;
          const y = H - bh;
          return (
            <g key={d.date}>
              <rect x={x} y={y} width={barW} height={bh} rx={2}
                fill={d.cost_usd > 0 ? "#6366f1" : "#1e293b"}
                className="transition-all duration-300" />
              {i % 7 === 0 && (
                <text x={x + barW / 2} y={H + 13} textAnchor="middle"
                  fill="#475569" fontSize={7}>{d.date.slice(5)}</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AiStatsPanel
// ─────────────────────────────────────────────────────────────────────────────
function AiStatsPanel({ stats }: { stats: AiStats | null }) {
  const fmtCost = (v: number) =>
    v < 0.01 ? `$${(v * 100).toFixed(3)}¢` : `$${v.toFixed(3)}`;
  const fmtNum  = (v: number) => v.toLocaleString("uz-UZ");

  return (
    <div className="bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-white/8 rounded-xl p-5 mb-4">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center shrink-0">
          <Bot size={18} className="text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">AI Biznes Tahlil</h3>
          <p className="text-xs text-slate-500">So'nggi {stats?.period_days ?? 30} kun</p>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { icon: Zap,         label: "So'rovlar",  value: fmtNum(stats?.total_requests ?? 0),    accent: "text-indigo-400" },
          { icon: Activity,    label: "Tokenlar",   value: fmtNum(stats?.total_tokens ?? 0),      accent: "text-sky-400" },
          { icon: DollarSign,  label: "Xarajat",    value: fmtCost(stats?.total_cost_usd ?? 0),   accent: "text-emerald-400" },
        ].map(({ icon: Icon, label, value, accent }) => (
          <div key={label} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/6 rounded-xl p-3 text-center">
            <Icon size={16} className={`${accent} mx-auto mb-1`} />
            <p className="text-base font-bold text-white tabular-nums">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Columns: chart + model breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily cost chart */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Kunlik xarajat ($)</p>
          <AiCostBarChart daily={stats?.daily ?? []} />
        </div>

        {/* Model breakdown */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Modellar kesimida</p>
          {stats?.by_model?.length ? (
            <ul className="space-y-2">
              {stats.by_model.map((m) => (
                <li key={m.model} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  <span className="text-slate-300 font-mono truncate flex-1" title={m.model}>
                    {m.model.replace("claude-", "").replace("-20", " ")}
                  </span>
                  <span className="text-slate-400 tabular-nums">{fmtNum(m.requests)}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-emerald-400 tabular-nums">{fmtCost(m.cost_usd)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">Ma'lumot yo'q</p>
          )}

          {/* Top tenants */}
          {(stats?.top_tenants?.length ?? 0) > 0 && (
            <>
              <p className="text-xs text-slate-500 mt-4 mb-2">Top kompaniyalar</p>
              <ul className="space-y-2">
                {stats!.top_tenants.slice(0, 5).map((t) => (
                  <li key={t.tenant_id} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                    <span className="text-slate-300 truncate flex-1">{t.tenant_name}</span>
                    <span className="text-slate-400 tabular-nums">{fmtNum(t.requests)}</span>
                    <span className="text-emerald-400 tabular-nums">{fmtCost(t.cost_usd)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// QuickLink
// ─────────────────────────────────────────────────────────────────────────────
function QuickLink({ to, icon: Icon, label, desc }: {
  to: string; icon: React.ElementType; label: string; desc: string;
}) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-white/8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:border-slate-200 dark:hover:border-white/15 hover:scale-[1.01] transition-all text-left"
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

// ─────────────────────────────────────────────────────────────────────────────
// AdminDashboardPage
// ─────────────────────────────────────────────────────────────────────────────
export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [health, setHealth]       = useState<HealthStats | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [aiStats, setAiStats]     = useState<AiStats | null>(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [h, c, ai] = await Promise.all([
        getAdminHealth(),
        getAdminCompanies(),
        getAdminAiStats(30).catch(() => null),
      ]);
      setHealth(h);
      setCompanies(c);
      setAiStats(ai);
    } catch {
      // each section shows its own state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(() => load(true), 30_000);
    return () => clearInterval(id);
  }, []);

  const pending   = companies.filter((c) => c.status === "pending_approval").length;
  const active    = companies.filter((c) => c.status === "active").length;
  const suspended = companies.filter((c) => c.status === "suspended").length;
  const blocked   = companies.filter((c) => c.status === "blocked").length;
  const total     = companies.length;

  // 7 kunlik yangi kompaniyalar (trend)
  const weekNew = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return companies.filter((c) => c.created_at && new Date(c.created_at) > cutoff).length;
  }, [companies]);

  const checkedAt = health?.checked_at
    ? new Date(health.checked_at).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })
    : "--";

  const donutSlices: { value: number; color: string; label: string }[] = [
    { value: active,    color: "#10b981", label: "Faol" },
    { value: pending,   color: "#f59e0b", label: "Kutilmoqda" },
    { value: suspended, color: "#f97316", label: "To'xtatilgan" },
    { value: blocked,   color: "#ef4444", label: "Bloklangan" },
  ];

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
        /* ── Skeleton ── */
        <div className="space-y-4">
          {/* Stat cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 animate-pulse" />
            ))}
          </div>
          {/* Chart skeleton */}
          <div className="h-48 rounded-xl bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-white/8 animate-pulse" />
          {/* Quick links skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-white/8 animate-pulse" />
            ))}
          </div>
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
              {health.status === "ok" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>
                Tizim holati: <strong>{health.status === "ok" ? "Yaxshi" : "Muammo bor"}</strong>
                {" · "}DB kechikish: <strong>{health.db_latency_ms} ms</strong>
              </span>
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Jami kompaniyalar" value={total}
              sub={pending ? `${pending} tasdiqqacha kutmoqda` : "Barcha faol"}
              icon={Building2} accent="bg-indigo-500"
              trend={{ value: weekNew, label: "bu hafta yangi" }}
              onClick={() => navigate("/admin/companies")}
            />
            <StatCard
              label="Faol kompaniyalar" value={active}
              sub={`${suspended} to'xtatilgan, ${blocked} bloklangan`}
              icon={TrendingUp} accent="bg-emerald-500"
              onClick={() => navigate("/admin/companies?status=active")}
            />
            <StatCard
              label="Foydalanuvchilar" value={health?.users.total ?? "—"}
              sub={health ? `${health.users.active} faol · ${health.users.pending_setup} setup kutmoqda` : undefined}
              icon={Users} accent="bg-sky-500"
            />
            <StatCard
              label="Murojaatlar" value={health?.contacts.total ?? "—"}
              sub={health ? `${health.contacts.needs_action} harakat talab qiladi` : undefined}
              icon={Clock} accent="bg-amber-500"
              onClick={() => navigate("/admin/contacts")}
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Donut chart */}
            <div className="md:col-span-1 bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-white/8 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Kompaniyalar holati</h3>
              <div className="flex items-center gap-6">
                <DonutChart slices={donutSlices} size={120} />
                <div className="space-y-2">
                  {[
                    { label: "Faol",          count: active,    color: "bg-emerald-500" },
                    { label: "Kutilmoqda",    count: pending,   color: "bg-amber-500" },
                    { label: "To'xtatilgan",  count: suspended, color: "bg-orange-500" },
                    { label: "Bloklangan",    count: blocked,   color: "bg-red-500" },
                  ].map(({ label, count, color }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
                      <span className="text-xs text-slate-400">{label}</span>
                      <span className="text-xs font-bold text-white ml-auto pl-2">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 7 kunlik bar chart */}
            <div className="md:col-span-1 bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-white/8 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Registratsiya dinamikasi</h3>
              <MiniBarChart companies={companies} />
            </div>

            {/* DB latency gauge */}
            <div className="md:col-span-1 bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-white/8 rounded-xl p-5 flex flex-col">
              <h3 className="text-sm font-semibold text-white mb-4">Tizim ishlashi</h3>
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                {health ? (
                  <>
                    <LatencyGauge ms={health.db_latency_ms} />
                    <div className="flex gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-white tabular-nums">{health.users.total}</p>
                        <p className="text-xs text-slate-500">Foydalanuvchi</p>
                      </div>
                      <div className="w-px bg-white/8" />
                      <div>
                        <p className="text-lg font-bold text-white tabular-nums">{health.contacts.total}</p>
                        <p className="text-xs text-slate-500">Murojaat</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-500 text-sm">Ma'lumot yo'q</p>
                )}
              </div>
            </div>
          </div>

          {/* Security posture */}
          <SecurityPosture />

          {/* AI stats */}
          <AiStatsPanel stats={aiStats} />

          {/* Quick links */}
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tezkor harakatlar</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <QuickLink to="/admin/contacts"  icon={Users}         label="Murojaatlarni ko'rish"    desc="Yangi arizalar va harakat kerak bo'lganlar" />
            <QuickLink to="/admin/companies" icon={Building2}     label="Kompaniyalarni boshqarish" desc="Tasdiqlash, bloklash, tafsilotlar" />
            <QuickLink to="/admin/health"    icon={Activity}      label="Tizim holati"              desc="DB, API, foydalanuvchilar statistikasi" />
            <QuickLink to="/admin/ai-chat"   icon={MessageSquare} label="Admin AI Chat"             desc="Tizim haqida savollar berish" />
          </div>
        </>
      )}
    </div>
  );
}
