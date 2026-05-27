/**
 * AnalyticsPage — real DB analytics with Recharts
 * Shows: task status donut, 7-day task trend, inbox by category, employee stats.
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell, Tooltip as RTooltip,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";
import { CheckSquare, Inbox, Users, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { getAnalytics, type AnalyticsData } from "../api/analyticsApi";
import { staggerContainer, staggerItem } from "../../../shared/lib/motionVariants";

// ── Palette ────────────────────────────────────────────────────────────────────

const TASK_COLORS: Record<string, string> = {
  todo:        "#6366f1",
  in_progress: "#f59e0b",
  done:        "#10b981",
  overdue:     "#ef4444",
};

const INBOX_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color = "indigo" }: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  color?: "indigo" | "amber" | "emerald" | "rose";
}) {
  const colors: Record<string, string> = {
    indigo:  "bg-indigo-500/10 text-indigo-400",
    amber:   "bg-amber-500/10 text-amber-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
    rose:    "bg-rose-500/10 text-rose-400",
  };
  return (
    <motion.div
      variants={staggerItem}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${colors[color]}`}>{icon}</div>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

interface Props {
  tenant: { id: string; name: string };
}

export function AnalyticsPage({ tenant }: Props) {
  const [data, setData]     = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await getAnalytics(tenant.id);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xato");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [tenant.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={28} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <AlertTriangle size={28} className="text-amber-500" />
        <p className="text-slate-500 text-sm">{error || "Ma'lumot yuklanmadi"}</p>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-indigo-600 hover:bg-indigo-50 transition-colors">
          <RefreshCw size={14} /> Qayta urinish
        </button>
      </div>
    );
  }

  const { taskStats, taskTrend, inboxCategories, employeeStats } = data;

  // Task pie data
  const taskPie = [
    { name: "Yangi", value: taskStats.todo,        fill: TASK_COLORS.todo },
    { name: "Jarayonda", value: taskStats.in_progress, fill: TASK_COLORS.in_progress },
    { name: "Bajarildi", value: taskStats.done,     fill: TASK_COLORS.done },
    { name: "Muddati o'tdi", value: taskStats.overdue, fill: TASK_COLORS.overdue },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Analitika</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            So'nggi 30 kun · {new Date(data.generatedAt).toLocaleString("uz-UZ")}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
        >
          <RefreshCw size={14} /> Yangilash
        </button>
      </div>

      {/* KPI Row */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <StatCard
          icon={<CheckSquare size={18} />}
          label="Jami vazifalar"
          value={taskStats.total}
          sub={`${taskStats.done} bajarildi`}
          color="indigo"
        />
        <StatCard
          icon={<AlertTriangle size={18} />}
          label="Muddati o'tgan"
          value={taskStats.overdue}
          sub={taskStats.overdue === 0 ? "Hammasi tartibda!" : "Zudlik bilan ko'ring"}
          color={taskStats.overdue > 0 ? "rose" : "emerald"}
        />
        <StatCard
          icon={<Inbox size={18} />}
          label="Inbox (30 kun)"
          value={inboxCategories.reduce((s, c) => s + c.count, 0)}
          sub={`${inboxCategories.length} ta kategoriya`}
          color="amber"
        />
        <StatCard
          icon={<Users size={18} />}
          label="Xodimlar"
          value={employeeStats.active}
          sub={`${employeeStats.recent_joins} ta yangi (7 kun)`}
          color="emerald"
        />
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task trend — Area chart (7 days) */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Vazifalar (so'nggi 7 kun)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={taskTrend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <RTooltip
                contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#94a3b8" }}
                itemStyle={{ color: "#e2e8f0" }}
              />
              <Area type="monotone" dataKey="created" name="Yaratildi" stroke="#6366f1" strokeWidth={2} fill="url(#gradCreated)" dot={false} />
              <Area type="monotone" dataKey="done"    name="Bajarildi" stroke="#10b981" strokeWidth={2} fill="url(#gradDone)"    dot={false} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Task status donut */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Vazifa holatlari
          </h3>
          {taskPie.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-slate-400 text-sm">
              Hozircha vazifalar yo'q
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={taskPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {taskPie.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <RTooltip
                  contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, fontSize: 12 }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Inbox by category — Bar chart */}
      {inboxCategories.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Inbox kategoriyalari (so'nggi 30 kun)
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={inboxCategories} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <RTooltip
                contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: "#e2e8f0" }}
              />
              <Bar dataKey="count" name="Xabarlar" radius={[4, 4, 0, 0]}>
                {inboxCategories.map((_, i) => (
                  <Cell key={i} fill={INBOX_COLORS[i % INBOX_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Employee stats */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Xodimlar holati</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Jami", value: employeeStats.total, color: "text-indigo-600" },
            { label: "Faol", value: employeeStats.active, color: "text-emerald-600" },
            { label: "Kutilmoqda", value: employeeStats.pending, color: "text-amber-600" },
            { label: "So'nggi 7 kun", value: employeeStats.recent_joins, color: "text-blue-600" },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
