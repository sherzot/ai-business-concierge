import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Building2, Activity, MessageSquare,
  Zap, LogOut, Menu, X, ChevronRight,
} from "lucide-react";
import { useAuthContext } from "../../auth/context/AuthContext";

const NAV = [
  { to: "/admin",          label: "Dashboard",     icon: LayoutDashboard, exact: true },
  { to: "/admin/contacts", label: "Murojaatlar",   icon: Users },
  { to: "/admin/companies",label: "Kompaniyalar",  icon: Building2 },
  { to: "/admin/health",   label: "Tizim holati",  icon: Activity },
  { to: "/admin/ai-chat",  label: "AI Chat",       icon: MessageSquare },
];

export function AdminLayout() {
  const { logout, profile } = useAuthContext();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const userName = profile?.user?.email?.split("@")[0] ?? "Admin";

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-white/8
          transition-all duration-300 ease-in-out lg:relative lg:translate-x-0
          ${sidebarOpen ? "w-56 translate-x-0" : "w-0 -translate-x-full lg:w-16"}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-white/8 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
            <Zap size={16} className="text-indigo-400" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">Admin Panel</p>
              <p className="text-xs text-slate-500 truncate">AI Business Concierge</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/6"
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/8 space-y-1 shrink-0">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/6 transition-colors"
          >
            <ChevronRight size={16} className="shrink-0" />
            {sidebarOpen && <span>Asosiy sayt</span>}
          </button>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-red-300 hover:bg-red-500/8 transition-colors"
          >
            <LogOut size={16} className="shrink-0" />
            {sidebarOpen && <span>Chiqish ({userName})</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center gap-3 px-4 border-b border-white/8 bg-slate-900/60 backdrop-blur shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span className="text-sm text-slate-400">Super Admin</span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
