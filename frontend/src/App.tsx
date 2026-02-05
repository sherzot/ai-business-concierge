import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Inbox, 
  CheckSquare, 
  HeartPulse, 
  FileText, 
  Settings, 
  Bell, 
  Search, 
  ChevronDown,
  MessageSquare,
  Building2,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { InboxPage } from "./features/inbox/pages/InboxPage";
import { ReportsPage } from "./features/reports/pages/ReportsPage";
import { TasksPage } from "./features/tasks/pages/TasksPage";
import { AIChat } from "./shared/components/AIChat";

// Utility for classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Types
type Tenant = {
  id: string;
  name: string;
  plan: "Pro" | "Enterprise";
};

type User = {
  id: string;
  name: string;
  role: "Admin" | "Manager" | "Employee";
  avatar: string;
};

// Mock Data
const TENANTS: Tenant[] = [
  { id: "t_001", name: "Acme Logistics LLC", plan: "Pro" },
  { id: "t_002", name: "Global Trade Inc", plan: "Enterprise" },
];

const CURRENT_USER: User = {
  id: "u_123",
  name: "Jasurbek Abdullayev",
  role: "Admin",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
};

export default function App() {
  const [currentTenant, setCurrentTenant] = useState<Tenant>(TENANTS[0]);
  const [activeModule, setActiveModule] = useState<string>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

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
    switch (activeModule) {
      case "dashboard":
        return <ReportsPage tenant={currentTenant} />;
      case "inbox":
        return <InboxPage tenant={currentTenant} />;
      case "tasks":
        return <TasksPage tenant={currentTenant} />;
      case "hr":
        return (
           <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
            <HeartPulse size={48} className="mb-4 opacity-50" />
            <h3 className="text-xl font-medium">HR Pulse</h3>
            <p className="text-sm mt-2">Xodimlar so'rovnomalari va kayfiyati...</p>
          </div>
        );
      case "docs":
        return (
           <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
            <FileText size={48} className="mb-4 opacity-50" />
            <h3 className="text-xl font-medium">Docs Hub</h3>
            <p className="text-sm mt-2">Hujjatlar aylanmasi va shablonlar...</p>
          </div>
        );
      default:
        return <ReportsPage tenant={currentTenant} />;
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

          {/* Tenant Switcher (Visual Only) */}
          <div className="px-4 py-6">
            <button className="w-full flex items-center justify-between px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 group">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shrink-0">
                  <Building2 size={16} className="text-white" />
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-sm font-medium truncate group-hover:text-white text-slate-200">
                    {currentTenant.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">Tenant ID: {currentTenant.id}</p>
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            <NavItem 
              icon={<LayoutDashboard size={20} />} 
              label="Manager Reports" 
              active={activeModule === "dashboard"}
              onClick={() => setActiveModule("dashboard")}
            />
            <NavItem 
              icon={<Inbox size={20} />} 
              label="Unified Inbox" 
              active={activeModule === "inbox"}
              badge={5}
              onClick={() => setActiveModule("inbox")}
            />
            <NavItem 
              icon={<CheckSquare size={20} />} 
              label="Tasks & Compliance" 
              active={activeModule === "tasks"}
              onClick={() => setActiveModule("tasks")}
            />
            <NavItem 
              icon={<HeartPulse size={20} />} 
              label="HR Pulse" 
              active={activeModule === "hr"}
              onClick={() => setActiveModule("hr")}
            />
            <NavItem 
              icon={<FileText size={20} />} 
              label="Docs Hub" 
              active={activeModule === "docs"}
              onClick={() => setActiveModule("docs")}
            />
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-slate-800">
             <NavItem 
              icon={<Settings size={20} />} 
              label="Sozlamalar" 
              active={activeModule === "settings"}
              onClick={() => setActiveModule("settings")}
            />
            <div className="mt-4 flex items-center gap-3 px-3 py-2">
              <img src={CURRENT_USER.avatar} alt="User" className="w-8 h-8 rounded-full ring-2 ring-slate-700" />
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{CURRENT_USER.name}</p>
                <p className="text-xs text-slate-400">{CURRENT_USER.role}</p>
              </div>
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
              {activeModule === "dashboard" && "Dashboard"}
              {activeModule === "inbox" && "Unified Inbox"}
              {activeModule === "tasks" && "Vazifalar"}
              {activeModule === "hr" && "HR Pulse"}
              {activeModule === "docs" && "Hujjatlar"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Qidiruv (Ctrl+K)..." 
                className="pl-9 pr-4 py-2 w-64 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
            
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
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
