import React from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { uz } from "date-fns/locale";
import { Mail, CheckSquare, FileText, Zap, AlertTriangle, TrendingUp, Lightbulb, Clock } from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { useI18n } from "../../../app/providers/I18nProvider";
import { healthScoreColor } from "../types";
import type { Insight, InsightType } from "../types";
import { staggerContainer, staggerItem, cardHover } from "../../../shared/lib/motionVariants";

interface DashboardPageProps {
  tenant: { id: string; name: string };
  onNavigate?: (module: string) => void;
}

export function DashboardPage({ tenant, onNavigate }: DashboardPageProps) {
  const { translate } = useI18n();
  const { data, loading } = useDashboard(tenant.id);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const { stats, inboxCount, unreadInbox, activeTasks, overdueTasks, docsReviewCount, aiHandledCount, recentInbox, recentTasks } = data;

  const healthScore = stats?.healthScore ?? 78;
  const deptScores = stats?.deptScores ?? { hr: 72, tasks: 85, docs: 90, sales: 68 };
  const scoreColor = healthScoreColor(healthScore);
  const insights: Insight[] = stats?.insights ?? [
    { type: 'danger', title: translate("reports.insight.hrBurnout"), desc: translate("reports.insight.hrBurnoutDesc") },
    { type: 'info', title: translate("reports.insight.cashRisk"), desc: translate("reports.insight.cashRiskDesc") },
    { type: 'info', title: translate("reports.insight.contract"), desc: translate("reports.insight.contractDesc") },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <KpiCard
          icon={<Mail size={20} className="text-status-info" />}
          title={translate("dashboard.kpi.inbox")}
          value={inboxCount}
          trend="↑ 12% kecha nisbatan"
          trendUp
          onClick={() => onNavigate?.("inbox")}
        />
        <KpiCard
          icon={<CheckSquare size={20} className="text-primary" />}
          title={translate("dashboard.kpi.activeTasks")}
          value={activeTasks}
          trend="↓ 5% kecha nisbatan"
          trendUp={false}
          onClick={() => onNavigate?.("tasks")}
        />
        <KpiCard
          icon={<FileText size={20} className="text-status-warning" />}
          title={translate("dashboard.kpi.docsReview")}
          value={docsReviewCount}
          onClick={() => onNavigate?.("docs")}
        />
        <KpiCard
          icon={<Zap size={20} className="text-status-success" />}
          title={translate("dashboard.kpi.aiTasks")}
          value={aiHandledCount}
          trend="↑ 25% kecha nisbatan"
          trendUp
          onClick={() => onNavigate?.("reports")}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unified Inbox */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-card-foreground">{translate("dashboard.unifiedInbox")}</h3>
            <div className="flex items-center gap-2">
              {unreadInbox > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-[var(--status-danger-soft)] text-[var(--status-danger-fg)] rounded-full">
                  {translate("dashboard.newCount", { count: String(unreadInbox) })}
                </span>
              )}
              <button onClick={() => onNavigate?.("inbox")} className="text-sm text-primary font-medium hover:underline">
                {translate("dashboard.all")} →
              </button>
            </div>
          </div>
          <div className="max-h-[320px] overflow-y-auto divide-y divide-border">
            {(recentInbox as any[]).map((item) => <InboxRow key={item.id} item={item} />)}
            {recentInbox.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">{translate("inbox.empty")}</div>
            )}
          </div>
        </div>

        {/* AI Tahlil */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-card-foreground">{translate("dashboard.aiAnalysis")}</h3>
            <button onClick={() => onNavigate?.("reports")} className="text-sm text-primary font-medium hover:underline">
              {translate("dashboard.all")} →
            </button>
          </div>
          <div className="p-4 space-y-4 max-h-[320px] overflow-y-auto">
            {insights.slice(0, 3).map((ins, i) => (
              <InsightCard key={i} type={ins.type} title={ins.title} desc={ins.desc} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Faol vazifalar */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-card-foreground">{translate("dashboard.activeTasks")}</h3>
            <div className="flex items-center gap-2">
              {overdueTasks > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-[var(--status-danger-soft)] text-[var(--status-danger-fg)] rounded-full">
                  {translate("dashboard.overdueCount", { count: String(overdueTasks) })}
                </span>
              )}
              <button onClick={() => onNavigate?.("tasks")} className="text-sm text-primary font-medium hover:underline">
                {translate("dashboard.all")} →
              </button>
            </div>
          </div>
          <div className="max-h-[280px] overflow-y-auto divide-y divide-border">
            {(recentTasks as any[]).map((task) => <TaskRow key={task.id} task={task} />)}
            {recentTasks.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">{translate("tasks.empty")}</div>
            )}
          </div>
        </div>

        {/* Biznes holati */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold text-card-foreground mb-2">{translate("dashboard.businessStatus")}</h3>
          <p className="text-xs text-muted-foreground mb-4">{translate("dashboard.updated", { time: "2 soat" })}</p>
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--border)" strokeWidth="2.5" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={healthScoreStroke(scoreColor)} strokeWidth="2.5" strokeDasharray={`${healthScore}, 100`} strokeLinecap="round" className="transition-all duration-500" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${healthScoreTextClass(scoreColor)}`}>{healthScore}</span>
                <span className="text-xs text-muted-foreground">{translate("dashboard.good")}</span>
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
              <div key={d.label} className="p-3 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground">{d.label}</p>
                <p className="text-sm font-semibold text-foreground">{d.value}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, title, value, trend, trendUp, onClick }: {
  icon: React.ReactNode; title: string; value: number;
  trend?: string; trendUp?: boolean; onClick?: () => void;
}) {
  return (
    <motion.div
      variants={staggerItem}
      initial="rest"
      whileHover="hover"
      animate="rest"
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className={`bg-card p-5 rounded-xl border border-border shadow-sm ${onClick ? "cursor-pointer" : ""}`}
      style={{ transformOrigin: "center" }}
    >
      <motion.div variants={cardHover}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-card-foreground mt-1">{value}</p>
        </div>
        <div className="p-2 rounded-lg bg-secondary">{icon}</div>
      </div>
      {trend && (
        <p className={`text-sm mt-3 font-medium ${trendUp ? "text-status-success" : "text-status-danger"}`}>{trend}</p>
      )}
      </motion.div>
    </motion.div>
  );
}

function InboxRow({ item }: { item: any }) {
  const { translate } = useI18n();
  const sender = item.sender?.name ?? item.sender?.email ?? "—";
  const category = item.category ?? "General";
  const categoryColors: Record<string, string> = {
    HR: "bg-accent text-accent-foreground",
    Docs: "bg-[var(--status-success-soft)] text-[var(--status-success-fg)]",
    Sales: "bg-[var(--status-info-soft)] text-[var(--status-info-fg)]",
    Support: "bg-[var(--status-warning-soft)] text-[var(--status-warning-fg)]",
    General: "bg-secondary text-muted-foreground",
  };
  return (
    <div className="p-4 hover:bg-secondary/70 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
          <Mail size={14} className="text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-foreground">{sender}</span>
            <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${categoryColors[category] ?? categoryColors.General}`}>
              {category}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{item.subject ?? item.preview}</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            {item.timestamp ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true, locale: uz }) : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: any }) {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueDate = task.dueDate ? parseDateOnly(task.dueDate) : null;
  const overdue = !!(dueDate && dueDate < todayStart);
  const dueLabel = dueDate
    ? (() => {
        const diff = Math.ceil((dueDate.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 0) return "Bugun";
        if (diff === 1) return "Ertaga";
        if (diff > 0 && diff <= 7) return `${diff} kun`;
        return dueDate.toLocaleDateString("uz-UZ", { weekday: "short" });
      })()
    : "—";
  return (
    <div className="p-4 hover:bg-secondary/70 transition-colors flex items-center gap-3">
      {overdue
        ? <AlertTriangle size={18} className="text-status-danger shrink-0" />
        : <Clock size={18} className="text-status-info shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{task.title}</p>
        <p className="text-xs text-muted-foreground">{task.assignee?.name ?? "Barcha"}</p>
      </div>
      <span className={`px-2 py-0.5 text-xs font-medium rounded ${overdue ? "bg-[var(--status-danger-soft)] text-[var(--status-danger-fg)]" : "bg-[var(--status-info-soft)] text-[var(--status-info-fg)]"}`}>
        {dueLabel}
      </span>
    </div>
  );
}

function parseDateOnly(value: string): Date | null {
  const datePart = value.split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return new Date(year, month - 1, day);
}

function healthScoreTextClass(color: ReturnType<typeof healthScoreColor>) {
  if (color === "emerald") return "text-status-success";
  if (color === "amber") return "text-status-warning";
  return "text-status-danger";
}

function healthScoreStroke(color: ReturnType<typeof healthScoreColor>) {
  if (color === "emerald") return "var(--status-success)";
  if (color === "amber") return "var(--status-warning)";
  return "var(--status-danger)";
}

function InsightCard({ type, title, desc }: { type: InsightType; title: string; desc: string }) {
  const styles: Record<InsightType, string> = {
    danger: "bg-[var(--status-danger-soft)] border-status-danger/25",
    warning: "bg-[var(--status-warning-soft)] border-status-warning/25",
    info: "bg-[var(--status-info-soft)] border-status-info/25",
  };
  const icons: Record<InsightType, React.ReactNode> = {
    danger: <AlertTriangle size={18} className="text-status-danger" />,
    warning: <TrendingUp size={18} className="text-status-warning" />,
    info: <Lightbulb size={18} className="text-status-info" />,
  };
  const textStyles: Record<InsightType, string> = {
    danger: "text-[var(--status-danger-fg)]",
    warning: "text-[var(--status-warning-fg)]",
    info: "text-[var(--status-info-fg)]",
  };
  return (
    <div className={`p-3 rounded-lg border ${styles[type]}`}>
      <div className="flex items-start gap-2">
        {icons[type]}
        <div>
          <h4 className={`text-sm font-semibold ${textStyles[type]}`}>{title}</h4>
          <p className={`text-xs mt-1 ${textStyles[type]} opacity-90`}>{desc}</p>
        </div>
      </div>
    </div>
  );
}
