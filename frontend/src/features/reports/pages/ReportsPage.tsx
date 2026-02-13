import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  Download,
  Loader2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { getDashboardStats } from "../api/reportsApi";
import { useI18n } from "../../../app/providers/I18nProvider";
import { useAuthContext } from "../../auth/context/AuthContext";
import { sendAIChatMessage } from "../../../shared/lib/aiApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../shared/ui/dialog";

type Tenant = {
  id: string;
  name: string;
};

interface ReportsPageProps {
  tenant: Tenant;
}

type DashboardStats = {
  healthScore: number;
  monthlyRevenue: number;
  tasksOverdue: number;
  pendingApprovals: number;
  chartData: { day: string; score: number }[];
  insights?: { type: "danger" | "warning" | "info"; title: string; desc: string }[];
  trendHealth?: string;
  trendRevenue?: string;
  trendOverdue?: string;
  trendApprovals?: string;
};

export function ReportsPage({ tenant }: ReportsPageProps) {
  const { translate } = useI18n();
  const { profile, currentTenant } = useAuthContext();
  const userName = currentTenant?.fullName?.split(" ")[0] ?? profile?.tenants?.[0]?.fullName?.split(" ")[0] ?? profile?.user?.email?.split("@")[0] ?? "User";
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [auditOpen, setAuditOpen] = React.useState(false);
  const [auditLoading, setAuditLoading] = React.useState(false);
  const [auditResult, setAuditResult] = React.useState<string | null>(null);
  const [auditError, setAuditError] = React.useState<string | null>(null);

  function downloadReport() {
    if (!stats) return;
    const rows: string[][] = [
      [translate("reports.health"), `${stats.healthScore ?? 0}/100`],
      [translate("reports.revenue"), `$${(stats.monthlyRevenue ?? 0).toLocaleString()}`],
      [translate("reports.tasksOverdue"), String(stats.tasksOverdue ?? 0)],
      [translate("reports.pendingApprovals"), String(stats.pendingApprovals ?? 0)],
      [translate("reports.trend") + " (7 days)", stats.chartData?.map((d) => `${d.day}: ${d.score}`).join("; ") ?? ""],
    ];
    if (stats.insights?.length) {
      rows.push(["", ""], [translate("reports.insights"), ""]);
      stats.insights.forEach((i) => rows.push([i.title, i.desc]));
    }
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hisobot-${tenant.name || tenant.id || "report"}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function runAIAudit() {
    setAuditOpen(true);
    setAuditLoading(true);
    setAuditResult(null);
    setAuditError(null);
    const context = stats ? {
      healthScore: stats.healthScore,
      monthlyRevenue: stats.monthlyRevenue,
      tasksOverdue: stats.tasksOverdue,
      pendingApprovals: stats.pendingApprovals,
      insights: stats.insights?.map((i) => `${i.title}: ${i.desc}`) ?? [],
    } : {};
    const prompt = stats
      ? translate("reports.auditPrompt", {
          health: String(stats.healthScore),
          revenue: stats.monthlyRevenue?.toLocaleString() ?? "0",
          overdue: String(stats.tasksOverdue ?? 0),
          approvals: String(stats.pendingApprovals ?? 0),
          insights: stats.insights?.map((i) => i.title).join(", ") ?? "",
        })
      : translate("reports.auditPromptGeneric");
    try {
      const res = await sendAIChatMessage(tenant.id, prompt, context);
      setAuditResult(res.reply ?? "");
    } catch (err) {
      console.error("AI Audit failed", err);
      setAuditError(translate("reports.auditError"));
    } finally {
      setAuditLoading(false);
    }
  }

  React.useEffect(() => {
    loadStats();
  }, [tenant.id]);

  async function loadStats() {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats(tenant.id);
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
      setError(translate("reports.loadError"));
      setStats(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {translate("reports.greeting", { name: userName })}
          </h1>
          <p className="text-slate-500">{translate("reports.subtitle")}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={downloadReport}
            disabled={!stats || loading}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download size={18} />
            {translate("reports.download")}
          </button>
          <button
            onClick={runAIAudit}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {auditLoading ? <Loader2 size={18} className="animate-spin" /> : null}
            {translate("reports.audit")}
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title={translate("reports.health")} 
          value={loading ? "..." : `${stats?.healthScore ?? 0}/100`} 
          trend={stats?.trendHealth ?? "—"} 
          trendUp={true}
          icon={<HeartBeatIcon />} 
          color="indigo"
          compareLabel={translate("reports.compare")}
        />
        <StatCard 
          title={translate("reports.revenue")} 
          value={loading ? "..." : `$${stats?.monthlyRevenue?.toLocaleString() ?? 0}`} 
          trend={stats?.trendRevenue ?? "—"} 
          trendUp={true}
          icon={<TrendingUp size={20} className="text-emerald-600" />} 
          color="emerald"
          compareLabel={translate("reports.compare")}
        />
        <StatCard 
          title={translate("reports.tasksOverdue")} 
          value={loading ? "..." : `${stats?.tasksOverdue ?? 0}`} 
          trend={stats?.trendOverdue ?? "0"} 
          trendUp={(stats?.tasksOverdue ?? 0) <= 0}
          inverseTrend
          icon={<Clock size={20} className="text-amber-600" />} 
          color="amber"
          compareLabel={translate("reports.compare")}
        />
        <StatCard 
          title={translate("reports.pendingApprovals")} 
          value={loading ? "..." : `${stats?.pendingApprovals ?? 0}`} 
          trend={stats?.trendApprovals ?? "0"} 
          trendUp={(stats?.pendingApprovals ?? 0) === 0}
          icon={<CheckCircle2 size={20} className="text-blue-600" />} 
          color="blue"
          compareLabel={translate("reports.compare")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-800">{translate("reports.trend")}</h3>
            <select className="text-sm border-slate-200 rounded-md text-slate-500">
              <option>{translate("reports.last7")}</option>
              <option>{translate("reports.last30")}</option>
            </select>
          </div>
          {error && <div className="mb-4 text-sm text-rose-600">{translate("reports.loadError")}</div>}
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.chartData ?? []}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                  domain={[60, 100]}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#4f46e5" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights / Bottlenecks */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            {translate("reports.insights")}
          </h3>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {(stats?.insights ?? [
              { type: "info" as const, title: translate("reports.insight.cashRisk"), desc: translate("reports.insight.cashRiskDesc") },
              { type: "warning" as const, title: translate("reports.insight.hrBurnout"), desc: translate("reports.insight.hrBurnoutDesc") },
              { type: "info" as const, title: translate("reports.insight.contract"), desc: translate("reports.insight.contractDesc") },
            ]).map((insight, i) => (
              <InsightItem
                key={i}
                type={insight.type}
                title={insight.title}
                desc={insight.desc}
              />
            ))}
          </div>
          <button className="mt-4 w-full py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center gap-2">
            {translate("reports.viewAll")} <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* AI Audit Modal */}
      <Dialog open={auditOpen} onOpenChange={(o) => { setAuditOpen(o); if (!o) { setAuditResult(null); setAuditError(null); } }}>
        <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{translate("reports.audit")}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            {auditLoading && (
              <div className="flex items-center gap-3 py-6 text-slate-600">
                <Loader2 size={24} className="animate-spin shrink-0" />
                <span>{translate("reports.auditRunning")}</span>
              </div>
            )}
            {auditError && (
              <div className="py-4 text-rose-600 text-sm">{auditError}</div>
            )}
            {auditResult && !auditLoading && (
              <div className="prose prose-slate max-w-none text-sm whitespace-pre-wrap">{auditResult}</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Components
function StatCard({ title, value, trend, trendUp, inverseTrend, icon, color, compareLabel }: any) {
  const isPositive = inverseTrend ? !trendUp : trendUp;
  
  const colorMap: any = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className={`flex items-center font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
          {trend}
        </span>
        <span className="text-slate-400 ml-2">{compareLabel}</span>
      </div>
    </div>
  );
}

function InsightItem({ type, title, desc }: { type: 'danger' | 'warning' | 'info', title: string, desc: string }) {
  const styles = {
    danger: "bg-rose-50 border-rose-100 text-rose-900",
    warning: "bg-amber-50 border-amber-100 text-amber-900",
    info: "bg-blue-50 border-blue-100 text-blue-900",
  };

  const icons = {
    danger: <AlertTriangle size={16} className="text-rose-600 shrink-0" />,
    warning: <Clock size={16} className="text-amber-600 shrink-0" />,
    info: <CheckCircle2 size={16} className="text-blue-600 shrink-0" />,
  };

  return (
    <div className={`p-3 rounded-lg border ${styles[type]} flex items-start gap-3`}>
      <div className="mt-0.5">{icons[type]}</div>
      <div>
        <h4 className="text-sm font-semibold">{title}</h4>
        <p className="text-xs mt-1 opacity-90 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function HeartBeatIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="text-indigo-600"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
