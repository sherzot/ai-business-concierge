/**
 * RoleBasedDashboard — har rol uchun mos dashboard tanlaydi.
 *
 * Rol matritsasi (SPEC.md §2.2):
 *   leader            → strategic overview (barcha KPI'lar, insights, AI Audit)
 *   hr                → HR Pulse (cases, surveys, candidates)
 *   accounting        → moliyaviy KPI, soliq AI, hujjat review
 *   department_head   → bo'lim KPI, team tasks, inbox
 *   employee          → shaxsiy vazifalar, inbox, bildirishnomalar
 *
 * Har rol uchun:
 *   • Greeting (ismli)
 *   • Role-specific quick stats (4 ta KPI)
 *   • Role-specific quick actions (3-4 tugma)
 *   • Default: DashboardPage (full view) — yashirin emas, faqat below
 */

import React from "react";
import {
  Mail,
  CheckSquare,
  FileText,
  Users,
  ClipboardList,
  UserPlus,
  TrendingUp,
  AlertTriangle,
  Calculator,
  Briefcase,
  HeartPulse,
  Sparkles,
} from "lucide-react";
import { useI18n } from "../../../app/providers/I18nProvider";
import { useAuthContext } from "../../auth/context/AuthContext";
import { DashboardPage } from "./DashboardPage";

type Tenant = { id: string; name: string };
type Props = { tenant: Tenant; onNavigate?: (module: string) => void };

export function RoleBasedDashboard({ tenant, onNavigate }: Props) {
  const { translate } = useI18n();
  const { currentTenant } = useAuthContext();
  const role = currentTenant?.role ?? "employee";
  const fullName = currentTenant?.fullName ?? "";
  const firstName = fullName.split(" ")[0] || "User";

  return (
    <div className="space-y-6">
      <RoleHeader role={role} firstName={firstName} translate={translate} />
      <RoleQuickActions role={role} onNavigate={onNavigate} translate={translate} />
      <RoleHighlight role={role} translate={translate} />

      {/* Asosiy dashboard — barcha rol uchun mavjud */}
      <DashboardPage tenant={tenant} onNavigate={onNavigate} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header — rol va greeting
// ---------------------------------------------------------------------------

function RoleHeader({
  role,
  firstName,
  translate,
}: {
  role: string;
  firstName: string;
  translate: (k: string, p?: Record<string, string>) => string;
}) {
  const roleLabel = translate(`auth.role.${role}`);
  const greeting = translate("dashboard.role.greeting", { name: firstName, role: roleLabel });

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-white p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
          {roleLabel}
        </p>
        <h1 className="mt-1 text-xl font-bold text-slate-900">{greeting}</h1>
        <p className="mt-0.5 text-sm text-slate-600">
          {translate(`dashboard.role.${role}.tagline`)}
        </p>
      </div>
      <RoleIcon role={role} />
    </div>
  );
}

function RoleIcon({ role }: { role: string }) {
  const iconClass = "w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center";
  const adminClass = "w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center";
  switch (role) {
    case "super_admin":     return <div className={adminClass}><Sparkles size={24} /></div>;
    case "leader":          return <div className={iconClass}><TrendingUp size={24} /></div>;
    case "hr":              return <div className={iconClass}><HeartPulse size={24} /></div>;
    case "accounting":      return <div className={iconClass}><Calculator size={24} /></div>;
    case "department_head": return <div className={iconClass}><Briefcase size={24} /></div>;
    case "employee":        return <div className={iconClass}><CheckSquare size={24} /></div>;
    default:                return <div className={iconClass}><Sparkles size={24} /></div>;
  }
}

// ---------------------------------------------------------------------------
// Quick Actions — rolga mos
// ---------------------------------------------------------------------------

function RoleQuickActions({
  role,
  onNavigate,
  translate,
}: {
  role: string;
  onNavigate?: (m: string) => void;
  translate: (k: string) => string;
}) {
  const actions = ROLE_ACTIONS[role] ?? ROLE_ACTIONS.employee;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
        {translate("dashboard.role.quickActions")}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((a) => (
          <button
            key={a.module}
            onClick={() => onNavigate?.(a.module)}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100">
              {a.icon}
            </div>
            <span className="text-sm font-medium text-slate-800">
              {translate(a.labelKey)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

const ROLE_ACTIONS: Record<string, { module: string; icon: React.ReactNode; labelKey: string }[]> = {
  super_admin: [
    { module: "reports", icon: <TrendingUp size={18} />, labelKey: "nav.reports" },
    { module: "hr",      icon: <Users size={18} />,      labelKey: "nav.hrEmployees" },
    { module: "tasks",   icon: <CheckSquare size={18} />, labelKey: "nav.tasks" },
    { module: "settings", icon: <Sparkles size={18} />,  labelKey: "nav.settings" },
  ],
  leader: [
    { module: "reports", icon: <TrendingUp size={18} />, labelKey: "nav.reports" },
    { module: "tasks",   icon: <CheckSquare size={18} />, labelKey: "nav.tasks" },
    { module: "inbox",   icon: <Mail size={18} />,        labelKey: "nav.inbox" },
    { module: "hr-cases", icon: <Users size={18} />,      labelKey: "nav.hr" },
  ],
  hr: [
    { module: "hr",             icon: <Users size={18} />,      labelKey: "nav.hrEmployees" },
    { module: "hr-surveys",     icon: <ClipboardList size={18} />, labelKey: "nav.hrSurveys" },
    { module: "hr-cases",       icon: <Briefcase size={18} />,  labelKey: "nav.hrIssues" },
    { module: "hr-candidates",  icon: <UserPlus size={18} />,   labelKey: "nav.hrCandidates" },
  ],
  accounting: [
    { module: "docs",    icon: <FileText size={18} />,   labelKey: "nav.docs" },
    { module: "inbox",   icon: <Mail size={18} />,       labelKey: "nav.inbox" },
    { module: "tasks",   icon: <CheckSquare size={18} />, labelKey: "nav.tasks" },
    { module: "reports", icon: <TrendingUp size={18} />,  labelKey: "nav.reports" },
  ],
  department_head: [
    { module: "tasks",   icon: <CheckSquare size={18} />, labelKey: "nav.tasks" },
    { module: "inbox",   icon: <Mail size={18} />,       labelKey: "nav.inbox" },
    { module: "docs",    icon: <FileText size={18} />,   labelKey: "nav.docs" },
    { module: "reports", icon: <TrendingUp size={18} />,  labelKey: "nav.reports" },
  ],
  employee: [
    { module: "tasks",   icon: <CheckSquare size={18} />, labelKey: "nav.tasks" },
    { module: "inbox",   icon: <Mail size={18} />,       labelKey: "nav.inbox" },
    { module: "docs",    icon: <FileText size={18} />,   labelKey: "nav.docs" },
    { module: "settings", icon: <Sparkles size={18} />,  labelKey: "nav.settings" },
  ],
};

// ---------------------------------------------------------------------------
// Highlight — rolga mos AI tip
// ---------------------------------------------------------------------------

function RoleHighlight({
  role,
  translate,
}: {
  role: string;
  translate: (k: string) => string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <AlertTriangle size={20} className="text-amber-600 mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-amber-900">
          {translate(`dashboard.role.${role}.highlight.title`)}
        </p>
        <p className="mt-1 text-sm text-amber-800">
          {translate(`dashboard.role.${role}.highlight.body`)}
        </p>
      </div>
    </div>
  );
}
