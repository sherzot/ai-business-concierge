import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, RefreshCw, Users2, Building2, Shield, UserCheck, UserX } from "lucide-react";
import { staggerContainer, staggerItem } from "../../../shared/lib/motionVariants";
import { Pagination, paginateArray } from "../../../shared/components/Pagination";
import { getAdminUsers, AdminUser } from "../api/adminApi";

const ROLE_LABELS: Record<string, string> = {
  super_admin:    "Super Admin",
  sub_admin:      "Sub Admin",
  company_admin:  "Kompaniya Admin",
  leader:         "Rahbar",
  hr:             "HR",
  accounting:     "Buxgalter",
  department_head:"Bo'lim boshlig'i",
  manager:        "Menejer",
  employee:       "Xodim",
};

const ROLE_COLORS: Record<string, string> = {
  super_admin:    "bg-violet-500/15 text-violet-400 border-violet-500/30",
  sub_admin:      "bg-purple-500/15 text-purple-400 border-purple-500/30",
  company_admin:  "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  leader:         "bg-blue-500/15 text-blue-400 border-blue-500/30",
  hr:             "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  accounting:     "bg-teal-500/15 text-teal-400 border-teal-500/30",
  department_head:"bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  manager:        "bg-green-500/15 text-green-400 border-green-500/30",
  employee:       "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  active:          "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  pending_approval:"bg-amber-500/15 text-amber-400 border-amber-500/30",
  suspended:       "bg-orange-500/15 text-orange-400 border-orange-500/30",
  blocked:         "bg-red-500/15 text-red-400 border-red-500/30",
  password_pending:"bg-slate-500/15 text-slate-400 border-slate-500/30",
  password_set:    "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  active:          "Faol",
  pending_approval:"Kutilmoqda",
  suspended:       "To'xtatilgan",
  blocked:         "Bloklangan",
  password_pending:"Parol kutilmoqda",
  password_set:    "Parol o'rnatildi",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uz-UZ", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export function AdminUsersPage() {
  const [users, setUsers]     = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [search, setSearch]   = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage]       = useState(1);
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        u.email.toLowerCase().includes(q) ||
        (u.full_name ?? "").toLowerCase().includes(q) ||
        u.tenant_name.toLowerCase().includes(q) ||
        (u.phone ?? "").includes(q)
      );
    }
    return true;
  });

  const counts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topRoles = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Foydalanuvchilar</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Barcha kompaniyalardagi foydalanuvchilar va rollar
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 shrink-0"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Yangilash
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {topRoles.map(([role, count]) => (
          <button
            key={role}
            onClick={() => { setRoleFilter(roleFilter === role ? "all" : role); setPage(1); }}
            className={`rounded-xl border p-3.5 text-left transition-all ${
              roleFilter === role
                ? (ROLE_COLORS[role] ?? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30") + " ring-1 ring-white/20"
                : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-white/8 hover:border-indigo-300 dark:hover:border-indigo-500/40"
            }`}
          >
            <p className={`text-xs font-medium mb-1 ${roleFilter === role ? "" : "text-slate-500 dark:text-slate-400"}`}>
              {ROLE_LABELS[role] ?? role}
            </p>
            <p className={`text-2xl font-bold ${roleFilter === role ? "" : "text-slate-900 dark:text-white"}`}>
              {count}
            </p>
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 mb-4 text-sm text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5"><Users2 size={14} /> Jami: <b className="text-slate-900 dark:text-white">{users.length}</b></span>
        <span className="flex items-center gap-1.5"><Building2 size={14} /> Kompaniyalar: <b className="text-slate-900 dark:text-white">{new Set(users.map(u => u.tenant_id)).size}</b></span>
        <span className="flex items-center gap-1.5"><UserCheck size={14} /> Faol: <b className="text-emerald-600 dark:text-emerald-400">{users.filter(u => u.status === "active").length}</b></span>
        <span className="flex items-center gap-1.5"><UserX size={14} /> Bloklangan: <b className="text-red-600 dark:text-red-400">{users.filter(u => u.status === "blocked").length}</b></span>
      </div>

      {/* Role filter pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => { setRoleFilter("all"); setPage(1); }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            roleFilter === "all"
              ? "bg-indigo-500 border-indigo-400 text-white"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20"
          }`}
        >
          Hammasi <span className="ml-1 bg-white/20 rounded-full px-1.5">{users.length}</span>
        </button>
        {Object.entries(ROLE_LABELS).map(([role, label]) => {
          const cnt = counts[role] ?? 0;
          if (cnt === 0) return null;
          return (
            <button
              key={role}
              onClick={() => { setRoleFilter(roleFilter === role ? "all" : role); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                roleFilter === role
                  ? "bg-indigo-500 border-indigo-400 text-white"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20"
              }`}
            >
              {label} <span className="ml-1 bg-white/20 rounded-full px-1.5">{cnt}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Email, ism, kompaniya yoki telefon..."
          className="w-full rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-600 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 px-5 py-3.5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-32 bg-slate-100 dark:bg-slate-700/60 rounded" />
                </div>
                <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Users2 size={40} className="opacity-30" />
          <p className="text-sm font-medium">Foydalanuvchi topilmadi</p>
          {(search || roleFilter !== "all") && (
            <button
              onClick={() => { setSearch(""); setRoleFilter("all"); }}
              className="text-xs text-indigo-500 hover:text-indigo-400 underline"
            >
              Filtrlarni tozalash
            </button>
          )}
        </div>
      ) : (
        <motion.div
          className="space-y-1.5"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {paginateArray(filtered, page, PAGE_SIZE).map((u) => {
            const initials = (u.full_name ?? u.email)
              .split(/[\s@._-]/).filter(Boolean).slice(0, 2)
              .map((w: string) => w[0]?.toUpperCase() ?? "").join("") || "U";
            return (
              <motion.div
                key={u.id}
                variants={staggerItem}
                className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/8 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-300 shrink-0 select-none">
                  {initials}
                </div>

                {/* Identity */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {u.full_name ?? u.email}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.email}</p>
                </div>

                {/* Tenant */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 min-w-0 shrink-0">
                  <Building2 size={12} className="shrink-0" />
                  <span className="truncate max-w-[140px]">{u.tenant_name || "—"}</span>
                </div>

                {/* Role */}
                <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0 ${ROLE_COLORS[u.role] ?? "bg-slate-500/15 text-slate-400 border-slate-500/30"}`}>
                  <Shield size={10} />
                  {ROLE_LABELS[u.role] ?? u.role}
                </span>

                {/* Status */}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0 ${STATUS_COLORS[u.status] ?? "bg-slate-500/15 text-slate-400 border-slate-500/30"}`}>
                  {STATUS_LABELS[u.status] ?? u.status}
                </span>

                {/* Date */}
                <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0 hidden sm:block">
                  {formatDate(u.created_at)}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <Pagination
          page={page}
          totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
          onPageChange={setPage}
          pageSize={PAGE_SIZE}
          totalItems={filtered.length}
        />
      )}
    </div>
  );
}
