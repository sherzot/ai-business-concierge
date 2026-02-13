import React from "react";
import { formatDistanceToNow } from "date-fns";
import { uz } from "date-fns/locale";
import { Mail, CheckSquare, FileText, Zap, AlertTriangle, TrendingUp, Lightbulb, Clock } from "lucide-react";
import { getDashboardStats } from "../api/reportsApi";
import { getInboxItems } from "../../inbox/api/inboxApi";
import { getTasks } from "../../tasks/api/tasksApi";
import { useI18n } from "../../../app/providers/I18nProvider";
import { useAuthContext } from "../../auth/context/AuthContext";

type Tenant = { id: string; name: string };

interface DashboardPageProps {
  tenant: Tenant;
}

export function DashboardPage({ tenant }: DashboardPageProps) {
  const { translate } = useI18n();
  const [stats, setStats] = React.useState<any>(null);
  const [inbox, setInbox] = React.useState<any[]>([]);
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      getDashboardStats(tenant.id).then(setStats).catch(() => setStats(null)),
      getInboxItems(tenant.id).then(setInbox).catch(() => setInbox([])),
      getTasks(tenant.id).then(setTasks).catch(() => setTasks([])),
    ]).finally(() => setLoading(false));
  }, [tenant.id]);

  const inboxCount = inbox.length;
  const unreadInbox = inbox.filter((i) => !i.isRead).length;
  const activeTasks = tasks.filter((t) => t.status !== "done").length;
  const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date()).length;
  const insights = stats?.insights ?? [
    { type: "danger" as const, title: translate("reports.insight.hrBurnout"), desc: translate("reports.insight.hrBurnoutDesc") },
    { type: "info" as const, title: translate("reports.insight.cashRisk"), desc: translate("reports.insight.cashRiskDesc") },
    { type: "info" as const, title: translate("reports.insight.contract"), desc: translate("reports.insight.contractDesc") },
  ];
  const healthScore = stats?.healthScore ?? 78;
  const deptScores = { hr: 72, tasks: 85, docs: 90, sales: 68 };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Mail size={20} className="text-blue-600" />}
          title={translate("dashboard.kpi.inbox")}
          value={inboxCount}
          trend="↑ 12% kecha nisbatan"
          trendUp
        />
        <KpiCard
          icon={<CheckSquare size={20} className="text-indigo-600" />}
          title={translate("dashboard.kpi.activeTasks")}
          value={activeTasks}
          trend="↓ 5% kecha nisbatan"
          trendUp={false}
        />
        <KpiCard
          icon={<FileText size={20} className="text-amber-600" />}
          title={translate("dashboard.kpi.docsReview")}
          value={8}
        />
        <KpiCard
          icon={<Zap size={20} className="text-emerald-600" />}
          title={translate("dashboard.kpi.aiTasks")}
          value={156}
          trend="↑ 25% kecha nisbatan"
          trendUp
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unified Inbox */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">{translate("dashboard.unifiedInbox")}</h3>
            <div className="flex items-center gap-2">
              {unreadInbox > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-rose-100 text-rose-700 rounded-full">
                  {translate("dashboard.newCount", { count: String(unreadInbox) })}
                </span>
              )}
              <span className="text-sm text-indigo-600 font-medium cursor-pointer hover:underline">
                {translate("dashboard.all")} →
              </span>
            </div>
          </div>
          <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
            {inbox.slice(0, 8).map((item) => (
              <InboxRow key={item.id} item={item} />
            ))}
            {inbox.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">{translate("inbox.empty")}</div>
            )}
          </div>
        </div>

        {/* AI Tahlil */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">{translate("dashboard.aiAnalysis")}</h3>
            <span className="text-sm text-indigo-600 font-medium cursor-pointer hover:underline">
              {translate("dashboard.all")} →
            </span>
          </div>
          <div className="p-4 space-y-4 max-h-[320px] overflow-y-auto">
            {insights.slice(0, 3).map((ins: any, i: number) => (
              <InsightCard key={i} type={ins.type} title={ins.title} desc={ins.desc} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Faol vazifalar */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">{translate("dashboard.activeTasks")}</h3>
            <div className="flex items-center gap-2">
              {overdueTasks > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-rose-100 text-rose-700 rounded-full">
                  {translate("dashboard.overdueCount", { count: String(overdueTasks) })}
                </span>
              )}
              <span className="text-sm text-indigo-600 font-medium cursor-pointer hover:underline">
                {translate("dashboard.all")} →
              </span>
            </div>
          </div>
          <div className="max-h-[280px] overflow-y-auto divide-y divide-slate-100">
            {tasks.filter((t) => t.status !== "done").slice(0, 6).map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
            {activeTasks === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">{translate("tasks.empty")}</div>
            )}
          </div>
        </div>

        {/* Biznes holati */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-800 mb-2">{translate("dashboard.businessStatus")}</h3>
          <p className="text-xs text-slate-500 mb-4">{translate("dashboard.updated", { time: "2 soat" })}</p>
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="2.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  strokeDasharray={`${healthScore}, 100`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-emerald-600">{healthScore}</span>
                <span className="text-xs text-slate-500">{translate("dashboard.good")}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "HR", value: deptScores.hr },
              { label: translate("nav.tasksTitle"), value: deptScores.tasks },
              { label: translate("nav.docsTitle"), value: deptScores.docs },
              { label: "Sotuv", value: deptScores.sales },
            ].map((d) => (
              <div key={d.label} className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">{d.label}</p>
                <p className="text-sm font-semibold text-slate-800">{d.value}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  title,
  value,
  trend,
  trendUp,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className="p-2 rounded-lg bg-slate-100">{icon}</div>
      </div>
      {trend && (
        <p className={`text-sm mt-3 font-medium ${trendUp ? "text-emerald-600" : "text-rose-600"}`}>
          {trend}
        </p>
      )}
    </div>
  );
}

function InboxRow({ item }: { item: any }) {
  const { translate } = useI18n();
  const sender = item.sender?.name ?? item.sender?.email ?? "—";
  const category = item.category ?? "Other";
  const categoryColors: Record<string, string> = {
    HR: "bg-purple-100 text-purple-700",
    Docs: "bg-emerald-100 text-emerald-700",
    Sales: "bg-blue-100 text-blue-700",
    Support: "bg-amber-100 text-amber-700",
    Other: "bg-slate-100 text-slate-600",
  };
  return (
    <div className="p-4 hover:bg-slate-50/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
          <Mail size={14} className="text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-slate-800">{sender}</span>
            {item.category && (
              <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${categoryColors[category] ?? categoryColors.Other}`}>
                {category}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 line-clamp-2 mt-0.5">{item.subject ?? item.preview}</p>
          <p className="text-xs text-slate-400 mt-1">
            {item.timestamp ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: uz }) : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: any }) {
  const { translate } = useI18n();
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const assignee = task.assignee?.name ?? "Barcha";
  const dueLabel = task.dueDate
    ? (() => {
        const d = new Date(task.dueDate);
        const today = new Date();
        const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 0) return "Bugun";
        if (diff === 1) return "Ertaga";
        if (diff > 0 && diff <= 7) return `${diff} kun`;
        return d.toLocaleDateString("uz-UZ", { weekday: "short" });
      })()
    : "—";
  return (
    <div className="p-4 hover:bg-slate-50/50 transition-colors flex items-center gap-3">
      {isOverdue ? (
        <AlertTriangle size={18} className="text-rose-500 shrink-0" />
      ) : (
        <Clock size={18} className="text-blue-500 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 truncate">{task.title}</p>
        <p className="text-xs text-slate-500">{assignee}</p>
      </div>
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded ${
          isOverdue ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"
        }`}
      >
        {dueLabel}
      </span>
    </div>
  );
}

function InsightCard({ type, title, desc }: { type: string; title: string; desc: string }) {
  const styles: Record<string, string> = {
    danger: "bg-rose-50 border-rose-100",
    warning: "bg-amber-50 border-amber-100",
    info: "bg-blue-50 border-blue-100",
  };
  const icons: Record<string, React.ReactNode> = {
    danger: <AlertTriangle size={18} className="text-rose-600" />,
    warning: <TrendingUp size={18} className="text-amber-600" />,
    info: <Lightbulb size={18} className="text-blue-600" />,
  };
  return (
    <div className={`p-3 rounded-lg border ${styles[type] ?? styles.info}`}>
      <div className="flex items-start gap-2">
        {icons[type] ?? icons.info}
        <div>
          <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
          <p className="text-xs text-slate-600 mt-1">{desc}</p>
        </div>
      </div>
    </div>
  );
}
