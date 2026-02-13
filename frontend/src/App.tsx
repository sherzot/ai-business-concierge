import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Inbox,
  CheckSquare,
  HeartPulse,
  FileText,
  Settings,
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Building2,
  Menu,
  X,
  Plug,
  LogOut,
  Zap,
  Users,
  ClipboardList,
  Briefcase,
  BarChart3,
  Globe,
  HelpCircle,
  MoreHorizontal,
  Plus,
  FilePlus,
  UserPlus,
  Send,
  Calendar,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuthContext } from "./features/auth/context/AuthContext";
import { useI18n } from "./app/providers/I18nProvider";
import { InboxPage } from "./features/inbox/pages/InboxPage";
import { ReportsPage } from "./features/reports/pages/ReportsPage";
import { DashboardPage } from "./features/reports/pages/DashboardPage";
import { TasksPage } from "./features/tasks/pages/TasksPage";
import { HrCasesPage } from "./features/hr/pages/HrCasesPage";
import { HrSurveysPage } from "./features/hr/pages/HrSurveysPage";
import { DocsPage } from "./features/docs/pages/DocsPage";
import { IntegrationsPage } from "./features/integrations/pages/IntegrationsPage";
import { SettingsPage } from "./features/settings/pages/SettingsPage";
import { AIChat } from "./shared/components/AIChat";
import { NotificationsDropdown } from "./features/notifications/components/NotificationsDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./shared/ui/dropdown-menu";
import { getMembers } from "./features/tasks/api/tasksApi";
import { getTasks } from "./features/tasks/api/tasksApi";
import { getNotifications } from "./features/notifications/api/notificationsApi";

const ROLE_KEYS: Record<string, string> = {
  leader: "auth.role.leader",
  hr: "auth.role.hr",
  accounting: "auth.role.accounting",
  department_head: "auth.role.department_head",
  employee: "auth.role.employee",
};

const NAV_MAIN: { key: string; module: string; icon: React.ReactNode; permission: string }[] = [
  { key: "inbox", module: "inbox", icon: <Inbox size={20} />, permission: "inbox" },
  { key: "tasks", module: "tasks", icon: <CheckSquare size={20} />, permission: "tasks" },
  { key: "docs", module: "docs", icon: <FileText size={20} />, permission: "docs" },
];

const NAV_HR: { key: string; module: string; icon: React.ReactNode; permission: string }[] = [
  { key: "hrEmployees", module: "hr", icon: <Users size={18} />, permission: "hr" },
  { key: "hrSurveys", module: "hr-surveys", icon: <ClipboardList size={18} />, permission: "hr" },
  { key: "hrIssues", module: "hr-cases", icon: <Briefcase size={18} />, permission: "hr" },
  { key: "hrReports", module: "reports", icon: <BarChart3 size={18} />, permission: "hr" },
];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const { translate } = useI18n();
  const {
    currentTenant,
    setCurrentTenant,
    profile,
    canAccess,
    logout,
  } = useAuthContext();
  const [activeModule, setActiveModule] = useState<string>("dashboard");
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [hrExpanded, setHrExpanded] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [memberCount, setMemberCount] = useState<number>(0);
  const [inboxBadge, setInboxBadge] = useState(0);
  const [tasksBadge, setTasksBadge] = useState(0);
  const [aiTasksCount, setAiTasksCount] = useState(5);

  const allowedMain = NAV_MAIN.filter((m) => canAccess(m.permission));
  const allowedHr = NAV_HR.filter((m) => canAccess(m.permission));
  const canAccessHr = canAccess("hr");
  const canAccessReports = canAccess("reports");
  const canAccessIntegrations = canAccess("integrations");

  useEffect(() => {
    if (currentTenant?.id) {
      getMembers(currentTenant.id).then((m) => setMemberCount(m?.length ?? 0)).catch(() => setMemberCount(0));
      getNotifications(currentTenant.id).then((n) => setInboxBadge(n?.filter((x) => !x.read_at).length ?? 0)).catch(() => setInboxBadge(0));
      getTasks(currentTenant.id).then((t) => {
        const todo = t?.filter((x) => x.status === "todo" || x.status === "in_progress").length ?? 0;
        setTasksBadge(todo);
      }).catch(() => setTasksBadge(0));
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    const hasAccess = allowedMain.some((m) => m.module === activeModule) ||
      allowedHr.some((m) => m.module === activeModule) ||
      activeModule === "dashboard" ||
      activeModule === "reports" ||
      activeModule === "integrations" ||
      activeModule === "settings";
    if (!hasAccess && (allowedMain.length > 0 || allowedHr.length > 0)) {
      setActiveModule(canAccessReports ? "dashboard" : allowedMain[0]?.module ?? allowedHr[0]?.module ?? "inbox");
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderContent = () => {
    if (!currentTenant) return null;
    const tenant = { id: currentTenant.id, name: currentTenant.name, plan: currentTenant.plan };
    switch (activeModule) {
      case "dashboard":
        return <DashboardPage tenant={tenant} />;
      case "reports":
        return <ReportsPage tenant={tenant} />;
      case "inbox":
        return <InboxPage tenant={tenant} />;
      case "tasks":
        return <TasksPage tenant={tenant} />;
      case "hr":
      case "hr-cases":
        return <HrCasesPage tenant={tenant} />;
      case "hr-surveys":
        return <HrSurveysPage tenant={tenant} />;
      case "docs":
        return <DocsPage tenant={tenant} />;
      case "integrations":
        return <IntegrationsPage tenant={tenant} />;
      case "settings":
        return <SettingsPage tenant={tenant} />;
      default:
        return <DashboardPage tenant={tenant} />;
    }
  };

  const userName = currentTenant?.fullName?.split(" ")[0] ?? profile?.user?.email?.split("@")[0] ?? "User";

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar - 2-rasm dizayni */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] bg-gradient-to-b from-slate-900 to-slate-950 text-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col shadow-2xl",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-20 flex flex-col justify-center px-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap size={22} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-semibold text-base tracking-tight">AI Concierge</h1>
              <p className="text-xs text-slate-400">{translate("nav.sidebarTagline")}</p>
            </div>
          </div>
        </div>

        {/* Tenant selector */}
        <div className="px-4 py-5 relative">
          <button
            onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 bg-slate-800/90 hover:bg-slate-700/90 rounded-xl transition-colors border border-slate-700/50"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-700/80 flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-slate-300" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-white truncate">{currentTenant.name}</p>
              <p className="text-xs text-slate-400">
                {translate("nav.employeesCount", { count: String(memberCount) })}
              </p>
            </div>
            <ChevronDown size={16} className="text-slate-400 shrink-0" />
          </button>
          {tenantDropdownOpen && profile?.tenants && profile.tenants.length > 1 && (
            <div className="absolute left-4 right-4 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 py-1">
              {profile.tenants
                .filter((t) => t.id !== currentTenant.id)
                .map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setCurrentTenant(t);
                      setTenantDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 hover:text-white rounded-lg mx-1"
                  >
                    {t.name}
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {canAccessReports && (
            <NavItem
              icon={<LayoutDashboard size={20} />}
              label={translate("nav.dashboard")}
              active={activeModule === "dashboard"}
              onClick={() => setActiveModule("dashboard")}
            />
          )}
          {allowedMain.map((m) => (
            <NavItem
              key={m.key}
              icon={m.icon}
              label={m.key === "inbox" ? translate("nav.inboxShort") : m.key === "tasks" ? translate("nav.tasksTitle") : translate("nav.docsTitle")}
              active={activeModule === m.module}
              badge={m.module === "inbox" ? inboxBadge : m.module === "tasks" ? tasksBadge : undefined}
              onClick={() => setActiveModule(m.module)}
            />
          ))}

          {/* HR collapsible */}
          {canAccessHr && (
            <div className="pt-2">
              <button
                onClick={() => setHrExpanded(!hrExpanded)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HeartPulse size={18} />
                  <span className="text-sm font-medium">{translate("nav.hr")}</span>
                </div>
                {hrExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {hrExpanded && (
                <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-700/60 pl-3">
                  {allowedHr.map((m) => (
                    <NavItem
                      key={m.key}
                      icon={m.icon}
                      label={translate(`nav.${m.key}`)}
                      active={activeModule === m.module}
                      onClick={() => setActiveModule(m.module)}
                      indent
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {canAccessIntegrations && (
            <NavItem
              icon={<Plug size={20} />}
              label={translate("nav.integrations")}
              active={activeModule === "integrations"}
              onClick={() => setActiveModule("integrations")}
            />
          )}
        </nav>

        {/* Bottom: Settings + AI Status */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <NavItem
            icon={<Settings size={20} />}
            label={translate("nav.settings")}
            active={activeModule === "settings"}
            onClick={() => setActiveModule("settings")}
          />
          <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-800/90 rounded-xl border border-slate-700/50">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-500/20 flex items-center justify-center">
                <Zap size={18} className="text-cyan-400" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-800" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{translate("nav.aiActive")}</p>
              <p className="text-xs text-slate-400 truncate">
                {translate("nav.aiTasksRunning", { count: String(aiTasksCount) })}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        {/* Topbar - 1-rasm dizayni */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shadow-sm z-20">
          <div className="flex items-center gap-6">
            <button
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {activeModule === "dashboard" && translate("nav.dashboard")}
                {activeModule === "reports" && translate("nav.reports")}
                {activeModule === "inbox" && translate("nav.inbox")}
                {activeModule === "tasks" && translate("nav.tasksTitle")}
                {activeModule === "docs" && translate("nav.docsTitle")}
                {activeModule === "hr" && translate("nav.hr")}
                {activeModule === "hr-cases" && translate("nav.hrIssues")}
                {activeModule === "hr-surveys" && translate("nav.hrSurveys")}
                {activeModule === "integrations" && translate("nav.integrations")}
                {activeModule === "settings" && translate("nav.settings")}
              </h2>
              <p className="text-sm text-slate-500">{translate("nav.welcome", { name: userName })}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder={translate("nav.searchPlaceholder")}
                className="pl-10 pr-4 py-2 w-72 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500/30 focus:bg-white transition-all"
              />
              <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500" size={16} />
            </div>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="Til">
              <Globe size={20} />
            </button>
            {currentTenant && <NotificationsDropdown tenantId={currentTenant.id} />}
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" title="Yordam">
              <HelpCircle size={20} />
            </button>
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-white" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut size={16} className="mr-2" />
                  Chiqish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dashboard action buttons - faqat dashboard sahifasida */}
        {activeModule === "dashboard" && (
          <div className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveModule("tasks")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus size={18} />
              {translate("dashboard.actions.newTask")}
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              <FilePlus size={18} />
              {translate("dashboard.actions.createDoc")}
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              <UserPlus size={18} />
              {translate("dashboard.actions.addEmployee")}
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              <Send size={18} />
              {translate("dashboard.actions.sendMessage")}
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              <Calendar size={18} />
              {translate("dashboard.actions.meeting")}
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            {renderContent()}
          </motion.div>
        </div>

        {/* AI Chat toggle */}
        <div className="absolute bottom-6 right-6 z-40">
          <button
            onClick={() => setIsAIChatOpen(!isAIChatOpen)}
            className="flex items-center justify-center w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 focus:ring-4 focus:ring-indigo-300"
          >
            {isAIChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {isAIChatOpen && (
            <AIChat tenantId={currentTenant.id} onClose={() => setIsAIChatOpen(false)} />
          )}
        </AnimatePresence>
      </main>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  badge,
  onClick,
  indent,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onClick: () => void;
  indent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
        indent && "py-2",
        active
          ? "bg-blue-600/90 text-white shadow-md"
          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
      )}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center text-xs font-bold bg-emerald-500 text-white rounded-full">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}
