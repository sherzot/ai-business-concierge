import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Building2, Activity, MessageSquare, BookOpen, Shield,
  LogOut, Menu, X, PanelLeftClose, PanelLeftOpen, ShieldAlert,
  BarChart3, Users2, Globe,
} from "lucide-react";
import { useAuthContext } from "../../auth/context/AuthContext";
import { apiRequest } from "../../../shared/lib/apiClient";
import { ThemeToggle } from "../../../shared/components/ThemeToggle";
import { useI18n } from "../../../app/providers/I18nProvider";
import { BrandLockup, BrandMark } from "../../../shared/components/BrandMark";

type NavGroup = {
  labelKey?: string;
  items: NavEntry[];
};
type NavEntry = {
  to: string;
  labelKey: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: boolean;
};

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { to: "/admin", labelKey: "nav.dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    labelKey: "admin.group.management",
    items: [
      { to: "/admin/contacts", labelKey: "admin.contacts", icon: Users, badge: true },
      { to: "/admin/companies", labelKey: "admin.companies", icon: Building2 },
      { to: "/admin/users", labelKey: "admin.users", icon: Users2 },
    ],
  },
  {
    labelKey: "admin.group.monitoring",
    items: [
      { to: "/admin/health", labelKey: "health.title", icon: Activity },
      { to: "/admin/risk", labelKey: "admin.security", icon: ShieldAlert },
      { to: "/admin/audit", labelKey: "admin.audit", icon: Shield },
      { to: "/admin/ai-stats", labelKey: "admin.aiStats", icon: BarChart3 },
    ],
  },
  {
    labelKey: "admin.group.content",
    items: [
      { to: "/admin/knowledge-base", labelKey: "admin.knowledgeBase", icon: BookOpen },
      { to: "/admin/ai-chat", labelKey: "admin.aiChat", icon: MessageSquare },
    ],
  },
];

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
          `relative flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-medium
           transition-all duration-150 group select-none
           ${isActive
             ? "border-primary text-foreground"
             : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
           }`
        }
      >
        {({ isActive }) => (
          <>
            <span
              className={`absolute -left-0.5 top-1/2 h-5 w-0.5 -translate-y-1/2 bg-primary transition-opacity duration-200 ${isActive ? "opacity-100" : "opacity-0"}`}
            />
            <Icon
              size={18}
              className={`shrink-0 transition-colors duration-150 ${isActive ? "text-primary" : ""}`}
            />
            {!collapsed && (
              <span className="truncate flex-1 transition-opacity duration-150">{label}</span>
            )}
            {badge && contactBadge > 0 && !collapsed && (
              <span className="animate-pulse bg-status-danger text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none shrink-0">
                {contactBadge > 99 ? "99+" : contactBadge}
              </span>
            )}
            {badge && contactBadge > 0 && collapsed && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-status-danger rounded-full animate-pulse" />
            )}
          </>
        )}
      </NavLink>

      {collapsed && hovered && (
        <div
          className="fixed z-[200] pointer-events-none"
          style={{ top: tooltipY, left: 68, transform: "translateY(-50%)" }}
        >
          <div className="flex items-center gap-2 border border-border bg-popover px-3 py-1.5 text-xs font-medium text-popover-foreground whitespace-nowrap">
            {label}
            {badge && contactBadge > 0 && (
              <span className="bg-status-danger text-white text-[10px] font-bold rounded-full px-1.5 leading-5 min-w-[18px] text-center">
                {contactBadge > 99 ? "99+" : contactBadge}
              </span>
            )}
          </div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 w-2 h-2 bg-popover border-l border-b border-border rotate-45" />
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
    <div className={`${sz} flex shrink-0 select-none items-center justify-center border border-border bg-transparent font-semibold text-foreground`}>
      {initials || "A"}
    </div>
  );
}

// ─── AdminLayout ──────────────────────────────────────────────────────────────
export function AdminLayout() {
  const { translate } = useI18n();
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
      <div className="flex h-18 shrink-0 items-center gap-3 border-b border-sidebar-border px-4">
        {collapsed && <BrandMark className="h-8 w-8 shrink-0" />}
        {!collapsed && (
          <BrandLockup compact className="min-w-0 flex-1" />
        )}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="hidden h-7 w-7 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground lg:flex"
          aria-label={translate(collapsed ? "admin.expandSidebar" : "admin.collapseSidebar")}
        >
          {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.labelKey ?? group.items[0]?.to}>
            {group.labelKey && !collapsed && (
              <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {translate(group.labelKey)}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ labelKey, ...item }) => (
                <NavItem
                  key={item.to}
                  {...item}
                  label={translate(labelKey)}
                  contactBadge={contactBadge}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="p-2 border-t border-sidebar-border space-y-0.5 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <Avatar name={displayName} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{displayName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{userName}</p>
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
            className="flex w-full items-center gap-3 border-l-2 border-transparent px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
          >
            <Globe size={15} className="shrink-0" />
            {!collapsed && <span>{translate("admin.mainSite")}</span>}
          </button>
          {collapsed && (
            <div className="pointer-events-none absolute left-14 top-1/2 z-[200] hidden -translate-y-1/2 items-center whitespace-nowrap border border-border bg-popover px-3 py-1.5 text-xs font-medium text-popover-foreground group-hover/home:flex">
              {translate("admin.mainSite")}
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="relative group/logout">
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 border-l-2 border-transparent px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-status-danger hover:text-status-danger"
          >
            <LogOut size={15} className="shrink-0" />
            {!collapsed && <span>{translate("nav.logout")}</span>}
          </button>
          {collapsed && (
            <div className="pointer-events-none absolute left-14 top-1/2 z-[200] hidden -translate-y-1/2 items-center whitespace-nowrap border border-border bg-popover px-3 py-1.5 text-xs font-medium text-status-danger group-hover/logout:flex">
              {translate("nav.logout")} ({displayName})
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border
          transition-all duration-300 ease-in-out shrink-0
          ${collapsed ? "w-16" : "w-[248px]"}`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/45 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-sidebar-border bg-sidebar
          transition-transform duration-300 ease-in-out lg:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 p-1.5 text-muted-foreground hover:text-foreground"
          aria-label={translate("common.close")}
        >
          <X size={16} />
        </button>
        {sidebarContent}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex h-18 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
            aria-label={translate("admin.menu")}
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-semibold text-foreground">
              {translate("auth.role.super_admin")}
            </span>
            {contactBadge > 0 && (
              <span className="border-l-2 border-status-danger pl-2 text-xs font-medium text-[var(--status-danger-fg)]">
                {translate("admin.newRequests", { count: String(contactBadge) })}
              </span>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Avatar name={displayName} size="sm" />
            <span className="hidden sm:block text-xs text-muted-foreground truncate max-w-32">{displayName}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
