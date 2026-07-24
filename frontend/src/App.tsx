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
import { AnalyticsPage } from "./features/reports/pages/AnalyticsPage";
import { DashboardPage } from "./features/reports/pages/DashboardPage";
import { RoleBasedDashboard } from "./features/reports/pages/RoleBasedDashboard";
import { TasksPage } from "./features/tasks/pages/TasksPage";
import { HrCasesPage } from "./features/hr/pages/HrCasesPage";
import { HrSurveysPage } from "./features/hr/pages/HrSurveysPage";
import { CandidateAnalysisPage } from "./features/hr/candidates/pages/CandidateAnalysisPage";
import { AddEmployeePage } from "./features/hr/pages/AddEmployeePage";
import { EmployeesPage } from "./features/hr/pages/EmployeesPage";
import { DocsPage } from "./features/docs/pages/DocsPage";
import { IntegrationsPage } from "./features/integrations/pages/IntegrationsPage";
import { SettingsPage } from "./features/settings/pages/SettingsPage";
import { TenantSettingsPage } from "./features/tenants/pages/TenantSettingsPage";
import { EmployeeDetailPage } from "./features/hr/pages/EmployeeDetailPage";
import { AIChat } from "./shared/components/AIChat";
import { NotificationsDropdown } from "./features/notifications/components/NotificationsDropdown";
import { NotificationsPage } from "./features/notifications/pages/NotificationsPage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./shared/ui/dropdown-menu";
import { LocaleSelect } from "./shared/components/LocaleSelect";
import { ThemeToggle } from "./shared/components/ThemeToggle";
import { CommandPalette } from "./shared/components/CommandPalette";
import { useTour, type TourStep } from "./shared/components/OnboardingTour";
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
  { key: "hrCandidates", module: "hr-candidates", icon: <UserPlus size={18} />, permission: "hr" },
  { key: "hrAddEmployee", module: "hr-add-employee", icon: <Plus size={18} />, permission: "hr" },
  { key: "hrReports", module: "reports", icon: <BarChart3 size={18} />, permission: "hr" },
];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const { translate, locale, setLocale } = useI18n();
  const {
    currentTenant,
    setCurrentTenant,
    profile,
    canAccess,
    logout,
  } = useAuthContext();
  const { startTour } = useTour();

  const DASHBOARD_TOUR: TourStep[] = [
    {
      target: "nav",
      title: "Asosiy menyu",
      content: "Bu yerda barcha modullar — Inbox, Vazifalar, Hujjatlar va HR. Navigatsiya tugmalarini bosing.",
      placement: "right",
    },
    {
      target: "[data-tour='search']",
      title: "Aqlli qidiruv",
      content: "Ism, email yoki hujjat bo'yicha qidiring. ⌘K bilan tez oching.",
      placement: "bottom",
    },
    {
      target: "[aria-label='Bildirishnomalar']",
      title: "Bildirishnomalar",
      content: "Yangi vazifalar, xodim o'zgarishlari va tizim xabarlari bu yerda ko'rinadi.",
      placement: "bottom",
    },
  ];
  const [activeModule, setActiveModule] = useState<string>("dashboard");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  function navigate(module: string) {
    setActiveModule(module);
    setSelectedEmployeeId(null);
  }
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [hrExpanded, setHrExpanded] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [memberCount, setMemberCount] = useState<number>(0);
  const [inboxBadge, setInboxBadge] = useState(0);
  const [tasksBadge, setTasksBadge] = useState(0);
  const [aiTasksCount, setAiTasksCount] = useState(5);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const tenantRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tenantRef.current && !tenantRef.current.contains(e.target as Node)) {
        setTenantDropdownOpen(false);
      }
    };
    if (tenantDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [tenantDropdownOpen]);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (!mod) return;

      // Cmd/Ctrl+K — open command palette
      if (e.key === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }

      // Cmd/Ctrl+N — navigate to add-employee (HR section)
      if (e.key === "n" && canAccess("hr")) {
        e.preventDefault();
        setActiveModule("hr-add-employee");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canAccess]);

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
        return <RoleBasedDashboard tenant={tenant} onNavigate={setActiveModule} />;
      case "reports":
        return <ReportsPage tenant={tenant} />;
      case "analytics":
        return <AnalyticsPage tenant={tenant} />;
      case "inbox":
        return <InboxPage tenant={tenant} />;
      case "tasks":
        return <TasksPage tenant={tenant} />;
      case "hr":
        if (selectedEmployeeId) {
          return (
            <EmployeeDetailPage
              tenantId={tenant.id}
              userId={selectedEmployeeId}
              onBack={() => setSelectedEmployeeId(null)}
            />
          );
        }
        return (
          <EmployeesPage
            tenant={tenant}
            onAddEmployee={() => setActiveModule("hr-add-employee")}
            onViewEmployee={(id) => setSelectedEmployeeId(id)}
          />
        );
      case "hr-cases":
        return <HrCasesPage tenant={tenant} />;
      case "hr-surveys":
        return <HrSurveysPage />;
      case "hr-candidates":
        return <CandidateAnalysisPage />;
      case "hr-add-employee":
        return <AddEmployeePage tenant={tenant} />;
      case "docs":
        return <DocsPage tenant={tenant} />;
      case "integrations":
        return <IntegrationsPage tenant={tenant} />;
      case "settings":
        return <SettingsPage tenant={tenant} />;
      case "company-profile":
        return <TenantSettingsPage tenant={tenant} />;
      case "notifications":
        return <NotificationsPage tenantId={tenant.id} userId={profile?.user.id} />;
      default:
        return <DashboardPage tenant={tenant} />;
    }
  };

  if (!currentTenant) return null;

  const userName = currentTenant?.fullName?.split(" ")[0] ?? profile?.user?.email?.split("@")[0] ?? "User";

  return (
    <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col",
          "bg-sidebar border-r border-sidebar-border",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-20 flex flex-col justify-center px-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Zap size={22} className="text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-semibold text-base tracking-tight text-sidebar-foreground">AI Concierge</h1>
              <p className="text-xs text-muted-foreground">{translate("nav.sidebarTagline")}</p>
            </div>
          </div>
        </div>

        {/* Tenant selector */}
        <div ref={tenantRef} className="px-4 py-4 relative">
          <button
            onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 bg-secondary hover:bg-accent rounded-xl transition-colors border border-border"
          >
            <div className="w-9 h-9 rounded-lg bg-card flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-muted-foreground" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{currentTenant.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground ring-1 ring-primary/20">
                  {translate(ROLE_KEYS[currentTenant.role] ?? "auth.role.employee")}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  · {translate("nav.employeesCount", { count: String(memberCount) })}
                </span>
              </div>
            </div>
            <ChevronDown size={16} className="text-muted-foreground shrink-0" />
          </button>
          {tenantDropdownOpen && profile?.tenants && (
            <div className="absolute left-4 right-4 mt-1 bg-popover border border-border rounded-xl shadow-lg z-50 py-1">
              {profile.tenants.length > 1 ? (
                profile.tenants
                  .filter((t) => t.id !== currentTenant.id)
                  .map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setCurrentTenant(t);
                        setTenantDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-secondary hover:text-foreground rounded-lg mx-1"
                    >
                      {t.name}
                    </button>
                  ))
              ) : (
                <div className="py-3 px-4 text-center text-sm text-muted-foreground">
                  {translate("nav.noOtherTenant")}
                </div>
              )}
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
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HeartPulse size={18} />
                  <span className="text-sm font-medium">{translate("nav.hr")}</span>
                </div>
                {hrExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {hrExpanded && (
                <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-3">
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
        <div className="p-4 border-t border-sidebar-border space-y-2">
          {(currentTenant.role === "company_admin" || currentTenant.role === "leader") && (
            <NavItem
              icon={<Building2 size={20} />}
              label={translate("nav.companyProfile")}
              active={activeModule === "company-profile"}
              onClick={() => setActiveModule("company-profile")}
            />
          )}
          <NavItem
            icon={<Settings size={20} />}
            label={translate("nav.settings")}
            active={activeModule === "settings"}
            onClick={() => setActiveModule("settings")}
          />
          <div className="flex items-center gap-3 px-3 py-2.5 bg-secondary rounded-xl border border-border">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center ring-1 ring-primary/20">
                <Zap size={18} className="text-primary" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-status-success rounded-full border-2 border-card" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{translate("nav.aiActive")}</p>
              <p className="text-xs text-muted-foreground truncate">
                {translate("nav.aiTasksRunning", { count: String(aiTasksCount) })}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative">
        {/* Topbar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 z-20">
          <div className="flex items-center gap-6">
            <button
              className="lg:hidden p-2 text-muted-foreground hover:bg-secondary rounded-lg"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
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
              <p className="text-sm text-muted-foreground">{translate("nav.welcome", { name: userName })}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              data-tour="search"
              onClick={() => setPaletteOpen(true)}
              className="relative hidden md:flex items-center gap-2 pl-10 pr-4 py-2 w-72 bg-secondary border border-border rounded-full text-sm text-muted-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <span className="flex-1 text-left">{translate("nav.searchPlaceholder")}</span>
              <kbd className="text-[11px] bg-card text-muted-foreground rounded px-1.5 py-0.5 font-mono border border-border">⌘K</kbd>
            </button>
            <ThemeToggle />
            <LocaleSelect variant="light" />
            {currentTenant && (
              <NotificationsDropdown tenantId={currentTenant.id} userId={profile?.user.id} onViewAll={() => setActiveModule("notifications")} />
            )}
            <button
              onClick={() => startTour(DASHBOARD_TOUR)}
              className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors"
              title={translate("nav.startTour")}
              aria-label={translate("nav.tour")}
            >
              <HelpCircle size={20} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-status-success rounded-full border-2 border-card" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setActiveModule("settings")}>
                  <Settings size={16} className="mr-2" />
                  {translate("nav.settings")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut size={16} className="mr-2" />
                  {translate("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setActiveModule("settings")}>
                  <Settings size={16} className="mr-2" />
                  {translate("nav.settings")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut size={16} className="mr-2" />
                  {translate("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dashboard action buttons */}
        {activeModule === "dashboard" && (
          <div className="bg-card border-b border-border px-4 lg:px-6 py-3 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveModule("tasks")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-[var(--brand-primary-hover)] transition-colors"
            >
              <Plus size={18} />
              {translate("dashboard.actions.newTask")}
            </button>
            <button
              onClick={() => setActiveModule("docs")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
            >
              <FilePlus size={18} />
              {translate("dashboard.actions.createDoc")}
            </button>
            <button
              onClick={() => setActiveModule("hr")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
            >
              <UserPlus size={18} />
              {translate("dashboard.actions.addEmployee")}
            </button>
            <button
              onClick={() => setActiveModule("inbox")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
            >
              <Send size={18} />
              {translate("dashboard.actions.sendMessage")}
            </button>
            <button
              onClick={() => setIsAIChatOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
            >
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
            className="flex items-center justify-center w-14 h-14 bg-primary hover:bg-[var(--brand-primary-hover)] text-primary-foreground rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 focus:ring-4 focus:ring-primary/25"
          >
            {isAIChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {isAIChatOpen && currentTenant && (
            <AIChat tenantId={currentTenant.id} onClose={() => setIsAIChatOpen(false)} />
          )}
        </AnimatePresence>
      </main>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/45 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ⌘K Command Palette */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={(module) => {
          if (module.startsWith("employee-detail:")) {
            const id = module.replace("employee-detail:", "");
            setSelectedEmployeeId(id);
            setActiveModule("employee-detail");
          } else {
            navigate(module);
          }
        }}
        tenantId={currentTenant?.id}
        canAccess={canAccess}
      />
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
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      )}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center text-xs font-bold bg-status-success text-white rounded-full">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}
