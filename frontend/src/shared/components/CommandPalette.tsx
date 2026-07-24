/**
 * CommandPalette — ⌘K global modal
 * Fuzzy search across pages, employees, quick actions.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  Inbox,
  CheckSquare,
  FileText,
  Users,
  BarChart3,
  Settings,
  Plug,
  UserPlus,
  Plus,
  ClipboardList,
  Briefcase,
  HeartPulse,
  Bell,
  User,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { listEmployees, type Employee } from "../../features/hr/api/employeesApi";
import { useI18n } from "../../app/providers/I18nProvider";

// ── Types ──────────────────────────────────────────────────────────────────────

type ItemKind = "page" | "employee" | "action";

interface PaletteItem {
  id: string;
  kind: ItemKind;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  module?: string;          // setActiveModule target
  onSelect?: () => void;
}

// ── Fuzzy match ────────────────────────────────────────────────────────────────

function fuzzyMatch(query: string, text: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;
  // Character-by-character fuzzy
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-indigo-500 dark:text-indigo-400 font-semibold">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}

// ── Static page items ──────────────────────────────────────────────────────────

const PAGE_ITEMS: Array<Omit<PaletteItem, "label"> & { labelKey: string }> = [
  { id: "page-dashboard",   kind: "page", labelKey: "nav.dashboard",     icon: <LayoutDashboard size={16} />, module: "dashboard" },
  { id: "page-inbox",       kind: "page", labelKey: "nav.inbox",         icon: <Inbox size={16} />,           module: "inbox" },
  { id: "page-tasks",       kind: "page", labelKey: "nav.tasksTitle",    icon: <CheckSquare size={16} />,     module: "tasks" },
  { id: "page-docs",        kind: "page", labelKey: "nav.docsTitle",     icon: <FileText size={16} />,        module: "docs" },
  { id: "page-employees",   kind: "page", labelKey: "nav.hrEmployees",   icon: <Users size={16} />,           module: "hr" },
  { id: "page-surveys",     kind: "page", labelKey: "nav.hrSurveys",     icon: <ClipboardList size={16} />,   module: "hr-surveys" },
  { id: "page-hr-cases",    kind: "page", labelKey: "nav.hrIssues",      icon: <Briefcase size={16} />,       module: "hr-cases" },
  { id: "page-candidates",  kind: "page", labelKey: "nav.hrCandidates",  icon: <UserPlus size={16} />,        module: "hr-candidates" },
  { id: "page-reports",     kind: "page", labelKey: "nav.reports",       icon: <BarChart3 size={16} />,       module: "reports" },
  { id: "page-analytics",   kind: "page", labelKey: "analytics.title",   icon: <BarChart3 size={16} />,       module: "analytics" },
  { id: "page-health",      kind: "page", labelKey: "health.title",      icon: <HeartPulse size={16} />,      module: "health" },
  { id: "page-integrations",kind: "page", labelKey: "nav.integrations",  icon: <Plug size={16} />,            module: "integrations" },
  { id: "page-settings",    kind: "page", labelKey: "nav.settings",      icon: <Settings size={16} />,        module: "settings" },
  { id: "page-notifications",kind:"page", labelKey: "notifications.title", icon: <Bell size={16} />,          module: "notifications" },
];

// ── Props ──────────────────────────────────────────────────────────────────────

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (module: string) => void;
  tenantId?: string;
  canAccess: (perm: string) => boolean;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function CommandPalette({
  open,
  onClose,
  onNavigate,
  tenantId,
  canAccess,
}: CommandPaletteProps) {
  const { translate } = useI18n();
  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmp, setLoadingEmp] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const localizedPages: PaletteItem[] = PAGE_ITEMS.map(({ labelKey, ...item }) => ({
    ...item,
    label: translate(labelKey),
  }));
  const actionItems: PaletteItem[] = [{
    id: "action-add-employee",
    kind: "action",
    label: translate("command.addEmployee"),
    sublabel: translate("command.addEmployeeSub"),
    icon: <Plus size={16} />,
    module: "hr-add-employee",
  }];

  // Load employees once when palette opens (if HR access)
  useEffect(() => {
    if (!open) { setQuery(""); setCursor(0); return; }
    setTimeout(() => inputRef.current?.focus(), 10);

    if (canAccess("hr") && tenantId && employees.length === 0) {
      setLoadingEmp(true);
      listEmployees(tenantId, "active")
        .then(setEmployees)
        .catch(() => {})
        .finally(() => setLoadingEmp(false));
    }
  }, [open]);

  // Build employee items
  const employeeItems: PaletteItem[] = employees.map((e) => ({
    id: `emp-${e.id}`,
    kind: "employee",
    label: e.name ?? e.email ?? translate("command.employees"),
    sublabel: e.email ?? undefined,
    icon: <User size={16} />,
    module: `employee-detail:${e.id}`,
  }));

  // Combine + filter
  const allItems: PaletteItem[] = [
    ...localizedPages,
    ...actionItems,
    ...employeeItems,
  ];

  const filtered = query
    ? allItems.filter((item) =>
        fuzzyMatch(query, item.label) ||
        (item.sublabel && fuzzyMatch(query, item.sublabel))
      )
    : allItems.filter((item) => item.kind !== "employee"); // hide employees in empty state

  // Grouped display
  const pages    = filtered.filter((i) => i.kind === "page");
  const actions  = filtered.filter((i) => i.kind === "action");
  const empItems = filtered.filter((i) => i.kind === "employee");

  const flat = [...pages, ...actions, ...empItems];

  // Clamp cursor
  useEffect(() => {
    setCursor((c) => Math.min(c, Math.max(flat.length - 1, 0)));
  }, [flat.length]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => (c + 1) % Math.max(flat.length, 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => (c - 1 + Math.max(flat.length, 1)) % Math.max(flat.length, 1));
      }
      if (e.key === "Enter" && flat[cursor]) {
        selectItem(flat[cursor]);
      }
    },
    [flat, cursor, onClose],
  );

  function selectItem(item: PaletteItem) {
    if (item.onSelect) { item.onSelect(); }
    else if (item.module) { onNavigate(item.module); }
    onClose();
  }

  // Scroll cursor into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${cursor}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  if (!open) return null;

  const renderGroup = (
    title: string,
    items: PaletteItem[],
    startIdx: number,
  ) => {
    if (!items.length) return null;
    return (
      <div className="mb-1">
        <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {title}
        </div>
        {items.map((item, i) => {
          const idx = startIdx + i;
          const active = cursor === idx;
          return (
            <div
              key={item.id}
              data-idx={idx}
              onMouseEnter={() => setCursor(idx)}
              onClick={() => selectItem(item)}
              className={[
                "flex items-center gap-3 px-3 py-2 rounded-md mx-1 cursor-pointer transition-colors",
                active
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
              ].join(" ")}
            >
              <span className={active ? "text-indigo-500" : "text-gray-400 dark:text-gray-500"}>
                {item.icon}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium truncate">
                  {highlight(item.label, query)}
                </span>
                {item.sublabel && (
                  <span className="block text-xs text-gray-400 dark:text-gray-500 truncate">
                    {highlight(item.sublabel, query)}
                  </span>
                )}
              </span>
              {active && <ChevronRight size={14} className="shrink-0 text-indigo-400" />}
            </div>
          );
        })}
      </div>
    );
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-[2px]"
          onClick={handleBackdrop}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: -8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
                placeholder={translate("command.search")}
                className="flex-1 bg-transparent outline-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600"
              />
              {loadingEmp && <Loader2 size={14} className="animate-spin text-gray-400" />}
              <kbd className="text-[11px] text-gray-400 bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5 font-mono">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              className="py-2 max-h-[380px] overflow-y-auto"
            >
              {flat.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-600">
                  {translate("command.noResultsFor", { query })}
                </div>
              ) : (
                <>
                  {renderGroup(translate("command.pages"), pages, 0)}
                  {renderGroup(translate("command.quickActions"), actions, pages.length)}
                  {renderGroup(translate("command.employees"), empItems, pages.length + actions.length)}
                </>
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center gap-3 px-4 py-2 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 dark:text-gray-600">
              <span><kbd className="font-mono bg-gray-100 dark:bg-gray-800 rounded px-1">↑↓</kbd> {translate("common.navigate")}</span>
              <span><kbd className="font-mono bg-gray-100 dark:bg-gray-800 rounded px-1">↵</kbd> {translate("common.open")}</span>
              <span><kbd className="font-mono bg-gray-100 dark:bg-gray-800 rounded px-1">ESC</kbd> {translate("common.close")}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
