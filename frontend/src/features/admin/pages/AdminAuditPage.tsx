/**
 * AdminAuditPage — audit log viewer for super admins.
 * Filters: tenant_id, entity_type, action, date range.
 * Shows payload in expandable JSON view.
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Shield, Search, RefreshCw, ChevronDown, ChevronUp,
  Clock, User, Database, Loader2, AlertTriangle,
} from "lucide-react";
import { listAuditLogs, type AuditLog } from "../api/auditApi";
import { staggerContainer, staggerItem } from "../../../shared/lib/motionVariants";

// ── Constants ──────────────────────────────────────────────────────────────────

const ENTITY_TYPES = ["tasks", "inbox_items", "documents", "hr_cases", "tenants"];
const ACTIONS = ["create", "update", "delete"];

const ACTION_COLOR: Record<string, string> = {
  create: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  update: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  delete: "bg-red-500/15 text-red-300 border-red-500/30",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("uz-UZ", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function shortId(id: string | null) {
  if (!id) return "—";
  return id.slice(0, 8) + "...";
}

// ── Page ───────────────────────────────────────────────────────────────────────

export function AdminAuditPage() {
  const [logs, setLogs]               = useState<AuditLog[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [search, setSearch]           = useState("");
  const [filterEntity, setFilterEntity] = useState("all");
  const [filterAction, setFilterAction] = useState("all");
  const [filterFrom, setFilterFrom]   = useState("");
  const [filterTo, setFilterTo]       = useState("");
  const [expanded, setExpanded]       = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listAuditLogs({
        entity_type: filterEntity !== "all" ? filterEntity : undefined,
        action:      filterAction !== "all" ? filterAction : undefined,
        from:        filterFrom || undefined,
        to:          filterTo || undefined,
        limit:       200,
      });
      setLogs(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xato");
    } finally {
      setLoading(false);
    }
  }, [filterEntity, filterAction, filterFrom, filterTo]);

  useEffect(() => { load(); }, [load]);

  // Client-side text filter
  const filtered = search
    ? logs.filter((l) => {
        const q = search.toLowerCase();
        return (
          l.event_type?.toLowerCase().includes(q) ||
          l.entity_type?.toLowerCase().includes(q) ||
          l.action?.toLowerCase().includes(q) ||
          l.user_id?.toLowerCase().includes(q) ||
          l.tenant_id?.toLowerCase().includes(q)
        );
      })
    : logs;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Shield size={20} className="text-indigo-400" />
            Audit Log
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            So'nggi {logs.length} ta yozuv · {filtered.length} ta ko'rsatilmoqda
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/8 border border-slate-200 dark:border-white/8 transition-colors shrink-0"
        >
          <RefreshCw size={13} /> Yangilash
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidiruv..."
            className="pl-8 pr-4 py-1.5 bg-slate-800 border border-slate-300 dark:border-white/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-44"
          />
        </div>

        {/* Entity type */}
        <select
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value)}
          className="bg-slate-800 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
        >
          <option value="all">Barcha entity</option>
          {ENTITY_TYPES.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>

        {/* Action */}
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="bg-slate-800 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
        >
          <option value="all">Barcha amal</option>
          {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>

        {/* Date range */}
        <input
          type="date"
          value={filterFrom}
          onChange={(e) => setFilterFrom(e.target.value)}
          className="bg-slate-800 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
          title="Dan"
        />
        <span className="text-slate-600 text-xs">—</span>
        <input
          type="date"
          value={filterTo}
          onChange={(e) => setFilterTo(e.target.value)}
          className="bg-slate-800 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
          title="Gacha"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-indigo-400" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-red-400 py-8">
          <AlertTriangle size={18} /> {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Shield size={32} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Audit yozuvlari topilmadi</p>
        </div>
      ) : (
        <motion.div
          className="space-y-1.5"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {filtered.map((log) => (
            <motion.div
              key={log.id}
              variants={staggerItem}
              className="rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 overflow-hidden"
            >
              {/* Row */}
              <div
                className="flex flex-wrap items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                onClick={() => setExpanded(expanded === log.id ? null : log.id)}
              >
                {/* Action badge */}
                <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border ${ACTION_COLOR[log.action] ?? "bg-slate-700 text-slate-300 border-slate-600"}`}>
                  {log.action.toUpperCase()}
                </span>

                {/* Entity type */}
                <span className="shrink-0 flex items-center gap-1 text-xs text-slate-400">
                  <Database size={11} />
                  {log.entity_type ?? "—"}
                </span>

                {/* Event type */}
                <span className="flex-1 text-sm text-white truncate">{log.event_type ?? log.action}</span>

                {/* User */}
                <span className="hidden sm:flex items-center gap-1 text-xs text-slate-500 shrink-0">
                  <User size={11} />
                  {shortId(log.user_id)}
                </span>

                {/* Tenant */}
                {log.tenant_id && (
                  <span className="hidden md:block text-xs text-slate-600 shrink-0 truncate max-w-[80px]">
                    {shortId(log.tenant_id)}
                  </span>
                )}

                {/* Time */}
                <span className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
                  <Clock size={11} />
                  {formatDate(log.created_at)}
                </span>

                {/* Expand icon */}
                <span className="text-slate-600 shrink-0">
                  {expanded === log.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
              </div>

              {/* Expanded payload */}
              {expanded === log.id && (
                <div className="px-4 pb-4 border-t border-slate-200 dark:border-white/6">
                  <div className="mt-3 rounded-lg bg-slate-900/60 p-3 overflow-x-auto">
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap break-all">
                      {JSON.stringify(
                        {
                          id: log.id,
                          entity_id: log.entity_id,
                          user_id: log.user_id,
                          tenant_id: log.tenant_id,
                          payload: log.payload,
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
