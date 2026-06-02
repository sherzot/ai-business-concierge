import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Building2, Activity, MessageSquare, BookOpen, Shield,
  Zap, LogOut, Menu, X, ChevronRight, PanelLeftClose, PanelLeftOpen, ShieldAlert,
  BarChart3, Users2, Globe,
} from "lucide-react";
import { useAuthContext } from "../../auth/context/AuthContext";
import { apiRequest } from "../../../shared/lib/apiClient";
import { ThemeToggle } from "../../../shared/components/ThemeToggle";

type NavGroup = {
  label?: string;
  items: NavEntry[];
};
type NavEntry = {
  to: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: boolean;
};

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Boshqaruv",
    items: [
      { to: "/admin/contacts",  label: "Murojaatlar",     icon: Users,    badge: true },
      { to: "/admin/companies", label: "Kompaniyalar",    icon: Building2 },
      { to: "/admin/users",     label: "Foydalanuvchilar",icon: Users2    },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { to: "/admin/health",    label: "Tizim holati",  icon: Activity   },
      { to: "/admin/risk",      label: "Xavfsizlik",    icon: ShieldAlert },
      { to: "/admin/audit",     label: "Audit Log",     icon: Shield     },
      { to: "/admin/ai-stats",  label: "AI Statistika", icon: BarChart3  },
    ],
  },
  {
    label: "Kontent",
    items: [
      { to: "/admin/knowledge-base", label: "Knowledge Base", icon: BookOpen    },
      { to: "/admin/ai-chat",        label: "AI Chat",        icon: MessageSquare },
    ],
  },
];

// Flat list for badge lookup
const ALL_NAV = NAV_GROUPS.flatMap((g) => g.items);

// ─── NavItem ─────────────────────────────────────────────────────────────────
function NavItem({
  to, label, icon: Icon, exact, badge, contactBadge, collapsed,
}: {
  to: string; label: string; icon: React.ElementType;
  exact?: boolean; badge?: boolean; contactBadge: number; collapsed: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const btnRef = useRef<HTMLAnchorElement>(null);
  const [tooltipY, setTooltipY] = useState(0);

  const handleMouseEnter = () => {
    if (collapsed && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setTooltipY(rect.top + rect.height / 2);
    }
    setHovered(true);
  };

  return (
    <div className="relative">
      <NavLink
        ref={btnRef}
        to={to}
        end={exact}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setHovered(false)}
        className={({ isActive }) =>
          `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
           transition-all duration-150 group select-none
           ${isActive
             ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-600/20 dark:text-white"
             : "text-slate-600 hover:text-slate-900 hover:bg-black/5 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/6"
           }`
        }
      >
        {({ isActive }) => (
          <>
            <span
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-full bg-indigo-500
                transition-all duration-200
                ${isActive ? "h-5 opacity-100" : "h-0 opacity-0"}`}
            />
            <Icon
              size={18}
              className={`shrink-0 transition-transform duration-150
                ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}
                ${hovered && !isActive ? "scale-110" : "scale-100"}`}
            />
            {!collapsed && (
              <span className="truncate flex-1 transition-opacity duration-150">{label}</span>
            )}
            {badge && contactBadge > 0 && !collapsed && (
              <span className="animate-pulse bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none shrink-0">
                {contactBadge > 99 ? "99+" : contactBadge}
              </span>
            )}
            {badge && contactBadge > 0 && collapsed && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </>
        )}
      </NavLink>

      {collapsed && hovered && (
        <div
          className="fixed z-[200] pointer-events-none"
          style={{ top: tooltipY, left: 68, transform: "translateY(-50%)" }}
        >
          <div className="flex items-center gap-2 bg-white border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-white/10 dark:text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
            {label}
            {badge && contactBadge > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 leading-5 min-w-[18px] text-center">
                {contactBadge > 99 ? "99+" : contactBadge}
              </span>
            )}
          </div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 w-2 h-2 bg-white dark:bg-slate-800 border-l border-b border-slate-200 dark:border-white/10 rotate-45" />
        </div>
      )}
    </div>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name
    .split(/[\s@._-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const sz = size === "sm" ? "w-7 h-7 text-xs" : "w-8 h-8 text-sm";
  return (
    <div className={`${sz} rounded-full bg-indigo-100 border border-indigo-200 dark:bg-indigo-500/30 dark:border-indigo-400/30 flex items-center justify-center font-semibold text-indigo-600 dark:text-indigo-200 shrink-0 select-none`}>
      {initials || "A"}
    </div>
  );
}

// ─── AdminLayout ──────────────────────────────────────────────────────────────
export function AdminLayout() {
  const { logout, profile } = useAuthContext();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contactBadge, setContactBadge] = useState(0);

  const userName = profile?.user?.email ?? "admin";
  const displayName = userName.split("@")[0];
  const collapsed = !sidebarOpen;

  useEffect(() => {
    async function fetchBadge() {
      try {
        const contacts = await apiRequest<{ status: string }[]>("/admin/contacts");
        setContactBadge(
          Array.isArray(contacts) ? contacts.filter((c) => c.status === "new").length : 0
        );
      } catch { /* silent */ }
    }
    fetchBadge();
    const id = setInterval(fetchBadge, 60_000);
    return () => clearInterval(id);
  }, []);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-200 dark:border-white/8 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
          <Zap size={16} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">Admin Panel</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">AI Business Concierge</p>
          </div>
        )}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-slate-900 hover:bg-black/6 dark:text-slate-500 dark:hover:text-white dark:hover:bg-white/8 transition-colors shrink-0"
          aria-label={collapsed ? "Kengaytirish" : "Yig'ish"}
        >
          {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-4">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.label && !collapsed && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.to}
                  {...item}
                  contactBadge={contactBadge}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="p-2 border-t border-slate-200 dark:border-white/8 space-y-0.5 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <Avatar name={displayName} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{displayName}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{userName}</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center py-1.5 mb-0.5">
            <Avatar name={displayName} size="sm" />
          </div>
        )}

        {/* Asosiy sayt */}
        <div className="relative group/home">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-900 hover:bg-black/5 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/6 transition-colors"
          >
            <Globe size={15} className="shrink-0" />
            {!collapsed && <span>Asosiy sayt</span>}
          </button>
          {collapsed && (
            <div className="absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover/home:flex items-center bg-white border border-slate-200 text-slate-900 dark:bg-slate-800 dark:border-white/10 dark:text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-[200] pointer-events-none">
              Asosiy sayt
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="relative group/logout">
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-300 dark:hover:bg-red-500/8 transition-colors"
          >
            <LogOut size={15} className="shrink-0" />
            {!collapsed && <span>Chiqish</span>}
          </button>
          {collapsed && (
            <div className="absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover/logout:flex items-center bg-white border border-slate-200 text-red-600 dark:bg-slate-800 dark:border-white/10 dark:text-red-300 text-xs font-medium px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-[200] pointer-events-none">
              Chiqish ({displayName})
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden">

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/8
          transition-all duration-300 ease-in-out shrink-0
          ${collapsed ? "w-16" : "w-56"}`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-56 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/8
          transition-transform duration-300 ease-in-out lg:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-black/6 dark:hover:text-white dark:hover:bg-white/8"
        >
          <X size={16} />
        </button>
        {sidebarContent}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center gap-3 px-4 border-b border-slate-200 dark:border-white/8 bg-white/90 dark:bg-slate-900/60 backdrop-blur shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-black/6 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/8 transition-colors"
            aria-label="Menu"
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Super Admin</span>
            {contactBadge > 0 && (
              <span className="bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 text-xs font-medium px-2 py-0.5 rounded-full border border-red-200 dark:border-red-500/30">
                {contactBadge} yangi murojaat
              </span>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Avatar name={displayName} size="sm" />
            <span className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 truncate max-w-32">{displayName}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
