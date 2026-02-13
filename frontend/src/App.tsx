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
  MessageSquare,
  Building2,
  Menu,
  X,
  Plug,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuthContext } from "./features/auth/context/AuthContext";
import { useI18n } from "./app/providers/I18nProvider";
import { InboxPage } from "./features/inbox/pages/InboxPage";
import { ReportsPage } from "./features/reports/pages/ReportsPage";
import { TasksPage } from "./features/tasks/pages/TasksPage";
import { HrCasesPage } from "./features/hr/pages/HrCasesPage";
import { DocsPage } from "./features/docs/pages/DocsPage";
import { IntegrationsPage } from "./features/integrations/pages/IntegrationsPage";
import { SettingsPage } from "./features/settings/pages/SettingsPage";
import { AIChat } from "./shared/components/AIChat";
import { NotificationsDropdown } from "./features/notifications/components/NotificationsDropdown";

const ROLE_KEYS: Record<string, string> = {
  leader: "auth.role.leader",
  hr: "auth.role.hr",
  accounting: "auth.role.accounting",
  department_head: "auth.role.department_head",
  employee: "auth.role.employee",
};

const NAV_MODULES: { key: string; module: string; icon: React.ReactNode; permission: string }[] = [
  { key: "dashboard", module: "dashboard", icon: <LayoutDashboard size={20} />, permission: "reports" },
  { key: "inbox", module: "inbox", icon: <Inbox size={20} />, permission: "inbox" },
  { key: "tasks", module: "tasks", icon: <CheckSquare size={20} />, permission: "tasks" },
  { key: "hr", module: "hr", icon: <HeartPulse size={20} />, permission: "hr" },
  { key: "docs", module: "docs", icon: <FileText size={20} />, permission: "docs" },
  { key: "integrations", module: "integrations", icon: <Plug size={20} />, permission: "integrations" },
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const allowedModules = NAV_MODULES.filter((m) => canAccess(m.permission));

  useEffect(() => {
    const hasAccess = allowedModules.some((m) => m.module === activeModule);
    if (!hasAccess && allowedModules.length > 0) {
      setActiveModule(allowedModules[0].module);
    }
  }, [currentTenant?.id]);

  // Responsive sidebar check
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderContent = () => {
    const tenant = { id: currentTenant.id, name: currentTenant.name, plan: currentTenant.plan };
    switch (activeModule) {
      case "dashboard":
        return <ReportsPage tenant={tenant} />;
      case "inbox":
        return <InboxPage tenant={tenant} />;
      case "tasks":
        return <TasksPage tenant={tenant} />;
      case "hr":
        return <HrCasesPage tenant={tenant} />;
      case "docs":
        return <DocsPage tenant={tenant} />;
      case "integrations":
        return <IntegrationsPage tenant={tenant} />;
      case "settings":
        return <SettingsPage tenant={tenant} />;
      default:
        return <ReportsPage tenant={tenant} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 shadow-xl",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/20">
              <span className="font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-lg tracking-tight">Concierge AI</span>
          </div>

          {/* Tenant Switcher */}
          <div className="px-4 py-6 relative">
            <button
              onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shrink-0">
                  <Building2 size={16} className="text-white" />
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-sm font-medium truncate group-hover:text-white text-slate-200">
                    {currentTenant.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {translate(ROLE_KEYS[currentTenant.role] ?? "auth.role.employee")}
                  </p>
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
            {tenantDropdownOpen && profile?.tenants && profile.tenants.length > 1 && (
              <div className="absolute left-4 right-4 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1">
                {profile.tenants
                  .filter((t) => t.id !== currentTenant.id)
                  .map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setCurrentTenant(t);
                        setTenantDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 hover:text-white"
                    >
                      {t.name}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Navigation (role-based) */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {allowedModules.map((m) => (
              <NavItem
                key={m.key}
                icon={m.icon}
                label={translate(
                m.key === "dashboard" ? "nav.reports" : m.key === "tasks" ? "nav.tasksTitle" : m.key === "docs" ? "nav.docsTitle" : `nav.${m.key}`
              )}
                active={activeModule === m.module}
                badge={m.module === "inbox" ? 5 : undefined}
                onClick={() => setActiveModule(m.module)}
              />
            ))}
          </nav>

          {/* Bottom: Settings + User */}
          <div className="p-4 border-t border-slate-800">
            <NavItem
              icon={<Settings size={20} />}
              label={translate("nav.settings")}
              active={activeModule === "settings"}
              onClick={() => setActiveModule("settings")}
            />
            <div className="mt-4 flex items-center justify-between gap-3 px-3 py-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 text-white font-medium">
                  {currentTenant.fullName?.charAt(0) ?? profile?.user?.email?.charAt(0) ?? "?"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">{currentTenant.fullName}</p>
                  <p className="text-xs text-slate-400">{translate(ROLE_KEYS[currentTenant.role] ?? "auth.role.employee")}</p>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Chiqish"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shadow-sm z-20">
          <div className="flex items-center gap-4">
             <button 
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">
              {activeModule === "dashboard" && translate("nav.dashboard")}
              {activeModule === "inbox" && translate("nav.inbox")}
              {activeModule === "tasks" && translate("nav.tasksTitle")}
              {activeModule === "hr" && translate("nav.hr")}
              {activeModule === "docs" && translate("nav.docsTitle")}
              {activeModule === "integrations" && translate("nav.integrations")}
              {activeModule === "settings" && translate("nav.settings")}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder={translate("nav.search")} 
                className="pl-9 pr-4 py-2 w-64 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
            
            {currentTenant && (
              <NotificationsDropdown tenantId={currentTenant.id} />
            )}
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
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

        {/* AI Assistant Toggle */}
        <div className="absolute bottom-6 right-6 z-40">
           <button 
            onClick={() => setIsAIChatOpen(!isAIChatOpen)}
            className="flex items-center justify-center w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 focus:ring-4 focus:ring-indigo-300"
          >
            {isAIChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
          </button>
        </div>

        {/* AI Chat Panel Overlay */}
        <AnimatePresence>
          {isAIChatOpen && (
            <AIChat tenantId={currentTenant.id} onClose={() => setIsAIChatOpen(false)} />
          )}
        </AnimatePresence>

      </main>

       {/* Mobile Overlay */}
       {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// Sub-components
function NavItem({ icon, label, active, badge, onClick }: { icon: React.ReactNode, label: string, active?: boolean, badge?: number, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
        active 
          ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20" 
          : "text-slate-400 hover:text-white hover:bg-slate-800"
      )}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge && (
        <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500 text-white rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}
