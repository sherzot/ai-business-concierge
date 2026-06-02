// frontend/src/features/admin/pages/AdminRiskPage.tsx
import React, { useState, useCallback } from "react";
import {
  ShieldAlert, ShieldCheck, Scan, Clock, ChevronDown, ChevronRight,
  AlertTriangle, AlertCircle, Info, CheckCircle2, XCircle,
  FileCode, History, Loader2, RefreshCw, Eye, CheckCheck, X,
} from "lucide-react";
import {
  triggerRiskScan, getRiskScans, getRiskScanDetail, updateFindingStatus,
  type RiskScan, type RiskFinding, type RiskSeverity, type FindingStatus, type ScanResult,
} from "../api/riskApi";

// ─── Severity config ──────────────────────────────────────────────────────────

const SEV_CONFIG: Record<RiskSeverity, {
  label: string; icon: React.ElementType;
  bg: string; border: string; text: string; badge: string; dot: string;
}> = {
  critical: {
    label: "KRITIK", icon: XCircle,
    bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400",
    badge: "bg-red-500/20 text-red-300 border-red-500/30",
    dot: "bg-red-500",
  },
  high: {
    label: "YUQORI", icon: AlertCircle,
    bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400",
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    dot: "bg-orange-400",
  },
  medium: {
    label: "O'RTA", icon: AlertTriangle,
    bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400",
    badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    dot: "bg-yellow-400",
  },
  low: {
    label: "PAST", icon: Info,
    bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    dot: "bg-blue-400",
  },
  info: {
    label: "MA'LUMOT", icon: Info,
    bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-400",
    badge: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    dot: "bg-slate-400",
  },
};

const STATUS_CONFIG: Record<FindingStatus, { label: string; color: string }> = {
  open:           { label: "Ochiq",           color: "text-red-400" },
  acknowledged:   { label: "Ko'rildi",         color: "text-yellow-400" },
  resolved:       { label: "Hal qilindi",      color: "text-emerald-400" },
  false_positive: { label: "Yolg'on signal",   color: "text-slate-400" },
};

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="112" height="112">
        <circle cx="56" cy="56" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle
          cx="56" cy="56" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div className="text-center z-10">
        <p className="text-3xl font-black text-white leading-none">{score}</p>
        <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">Ball</p>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ count, severity }: { count: number; severity: RiskSeverity }) {
  const cfg = SEV_CONFIG[severity] ?? SEV_CONFIG["low"];
  const Icon = cfg.icon;
  return (
    <div className={`rounded-xl border p-4 flex items-center gap-3 ${cfg.bg} ${cfg.border}`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.bg}`}>
        <Icon size={18} className={cfg.text} />
      </div>
      <div>
        <p className={`text-2xl font-black ${cfg.text}`}>{count}</p>
        <p className="text-xs text-slate-500 font-medium">{cfg.label}</p>
      </div>
    </div>
  );
}

// ─── Finding Row ──────────────────────────────────────────────────────────────

function FindingRow({
  finding,
  onStatusChange,
}: {
  finding: RiskFinding;
  onStatusChange: (id: string, status: FindingStatus) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const cfg = SEV_CONFIG[finding.severity] ?? SEV_CONFIG["low"];
  const Icon = cfg.icon;
  const statusCfg = STATUS_CONFIG[finding.status] ?? STATUS_CONFIG["open"];

  const handleStatus = async (status: FindingStatus) => {
    setUpdating(true);
    await onStatusChange(finding.id, status).catch(() => null);
    setUpdating(false);
  };

  return (
    <div className={`rounded-xl border transition-all duration-200 ${
      expanded ? `${cfg.bg} ${cfg.border}` : "border-white/8 hover:border-slate-200 dark:hover:border-white/15"
    }`}>
      {/* Summary row */}
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => setExpanded(v => !v)}
      >
        {/* Severity dot */}
        <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />

        {/* Code badge */}
        <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded border shrink-0 ${cfg.badge}`}>
          {finding.code}
        </span>

        {/* Title */}
        <span className="flex-1 text-sm font-medium text-slate-200 text-left truncate">
          {finding.title}
        </span>

        {/* Source */}
        <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-500 shrink-0">
          <FileCode size={11} />
          {finding.source === "static" ? "Statik" : "Advisor"}
        </span>

        {/* Status */}
        <span className={`text-[11px] font-medium shrink-0 ${statusCfg.color}`}>
          {statusCfg.label}
        </span>

        {/* Expand */}
        <span className="text-slate-600 shrink-0">
          {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-200 dark:border-white/8 pt-4">
          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Tavsif
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">{finding.description}</p>
          </div>

          {/* Location */}
          {finding.location && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Joylashuv
              </p>
              <code className="text-xs bg-slate-900 border border-slate-300 dark:border-white/10 rounded px-2.5 py-1.5 text-slate-300 font-mono block">
                {finding.location}
              </code>
            </div>
          )}

          {/* Remediation */}
          {finding.remediation && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Tuzatish yo'nalishi
              </p>
              <p className="text-sm text-emerald-300 leading-relaxed bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2.5">
                {finding.remediation}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            {finding.status !== "acknowledged" && finding.status !== "resolved" && (
              <button
                disabled={updating}
                onClick={() => handleStatus("acknowledged")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 hover:bg-yellow-500/20 transition-colors disabled:opacity-50"
              >
                <Eye size={12} />
                Ko'rildim
              </button>
            )}
            {finding.status !== "resolved" && (
              <button
                disabled={updating}
                onClick={() => handleStatus("resolved")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
              >
                <CheckCheck size={12} />
                Hal qilindi
              </button>
            )}
            {finding.status !== "false_positive" && (
              <button
                disabled={updating}
                onClick={() => handleStatus("false_positive")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-500/10 border border-slate-500/20 text-slate-400 hover:bg-slate-500/20 transition-colors disabled:opacity-50"
              >
                <X size={12} />
                Yolg'on signal
              </button>
            )}
            {updating && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Loader2 size={12} className="animate-spin" /> Saqlanmoqda...
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Scan History Item ────────────────────────────────────────────────────────

function ScanHistoryItem({
  scan,
  active,
  onClick,
}: {
  scan: RiskScan;
  active: boolean;
  onClick: () => void;
}) {
  const scoreColor = !scan.score ? "text-slate-500"
    : scan.score >= 80 ? "text-emerald-400"
    : scan.score >= 50 ? "text-yellow-400"
    : "text-red-400";

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
        active
          ? "bg-indigo-600/20 border border-indigo-500/30"
          : "hover:bg-white/5 border border-transparent"
      }`}
    >
      <div className={`w-2 h-2 rounded-full shrink-0 ${
        scan.status === "running" ? "bg-blue-400 animate-pulse" :
        scan.status === "failed"  ? "bg-red-400" : "bg-emerald-400"
      }`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-300 truncate">
          {new Date(scan.started_at).toLocaleDateString("uz-UZ", {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
          })}
        </p>
        <p className="text-[10px] text-slate-500">
          {scan.total_count} topilma
          {scan.critical_count > 0 && ` · ${scan.critical_count} kritik`}
        </p>
      </div>
      {scan.score !== null && (
        <span className={`text-sm font-bold shrink-0 ${scoreColor}`}>{scan.score}</span>
      )}
    </button>
  );
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const SEVERITY_FILTERS: Array<{ key: string; label: string }> = [
  { key: "all",      label: "Barchasi" },
  { key: "critical", label: "Kritik" },
  { key: "high",     label: "Yuqori" },
  { key: "medium",   label: "O'rta" },
  { key: "low",      label: "Past" },
];

const STATUS_FILTERS: Array<{ key: string; label: string }> = [
  { key: "all",           label: "Barcha holat" },
  { key: "open",          label: "Ochiq" },
  { key: "acknowledged",  label: "Ko'rilgan" },
  { key: "resolved",      label: "Hal qilingan" },
  { key: "false_positive",label: "Yolg'on signal" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AdminRiskPage() {
  const [scanning, setScanning]     = useState(false);
  const [tab, setTab]               = useState<"results" | "history">("results");
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [history, setHistory]       = useState<RiskScan[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeScanId, setActiveScanId]     = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail]   = useState(false);
  const [sevFilter, setSevFilter]   = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError]           = useState<string | null>(null);

  // ── Scan ishga tushirish ──────────────────────────────────────────────────
  const handleScan = useCallback(async () => {
    setScanning(true);
    setError(null);
    setTab("results");
    try {
      const result = await triggerRiskScan();
      setCurrentScan(result);
      setActiveScanId(result.scan.id);
      // Tarixni yangilash
      setHistory(prev => [result.scan, ...prev.filter(s => s.id !== result.scan.id)]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Skan paytida xatolik yuz berdi");
    } finally {
      setScanning(false);
    }
  }, []);

  // ── Tarixni yuklash ───────────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    if (historyLoaded) return;
    setLoadingHistory(true);
    try {
      const scans = await getRiskScans();
      setHistory(scans);
      setHistoryLoaded(true);
    } catch {
      /* silent */
    } finally {
      setLoadingHistory(false);
    }
  }, [historyLoaded]);

  const handleTabChange = (t: "results" | "history") => {
    setTab(t);
    if (t === "history") loadHistory();
  };

  // ── Tarixdan skan tanlash ─────────────────────────────────────────────────
  const handleSelectScan = useCallback(async (id: string) => {
    if (id === activeScanId) return;
    setLoadingDetail(true);
    setActiveScanId(id);
    setTab("results");
    try {
      const result = await getRiskScanDetail(id);
      setCurrentScan(result);
    } catch (e) {
      setError("Skan ma'lumotlarini yuklashda xatolik");
    } finally {
      setLoadingDetail(false);
    }
  }, [activeScanId]);

  // ── Finding status yangilash ──────────────────────────────────────────────
  const handleStatusChange = useCallback(async (id: string, status: FindingStatus) => {
    const updated = await updateFindingStatus(id, status);
    setCurrentScan(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        findings: prev.findings.map(f => f.id === id ? { ...f, ...updated } : f),
      };
    });
  }, []);

  // ── Filtrlangan topilmalar ────────────────────────────────────────────────
  const filteredFindings = (currentScan?.findings ?? []).filter(f => {
    const sevOk = sevFilter === "all" || f.severity === sevFilter;
    const stOk  = statusFilter === "all" || f.status === statusFilter;
    return sevOk && stOk;
  });

  // Severity bo'yicha tartiblash
  const SEV_ORDER: Record<RiskSeverity, number> = { critical:0, high:1, medium:2, low:3, info:4 };
  const sorted = [...filteredFindings].sort((a, b) =>
    (SEV_ORDER[a.severity] ?? 5) - (SEV_ORDER[b.severity] ?? 5)
  );

  const scan = currentScan?.scan;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col">

      {/* ── Top header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center">
            <ShieldAlert size={18} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Xavfsizlik Skaneri</h1>
            <p className="text-xs text-slate-500">
              Tizim zaifliklarini aniqlash va kuzatish
            </p>
          </div>
        </div>

        <button
          onClick={handleScan}
          disabled={scanning}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            scanning
              ? "bg-indigo-600/40 text-indigo-300 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95"
          }`}
        >
          {scanning
            ? <><Loader2 size={15} className="animate-spin" /> Skanlanmoqda...</>
            : <><Scan size={15} /> Skan qilish</>
          }
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left sidebar — tarix ─────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-52 border-r border-slate-200 dark:border-white/8 shrink-0">
          <div className="flex items-center gap-2 px-3 py-3 border-b border-slate-200 dark:border-white/8">
            <History size={13} className="text-slate-500" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tarix
            </span>
            {loadingHistory && <Loader2 size={12} className="animate-spin text-slate-600 ml-auto" />}
          </div>

          <div
            className="flex-1 overflow-y-auto p-2 space-y-0.5"
            onMouseEnter={loadHistory}
          >
            {history.length === 0 && !loadingHistory && (
              <p className="text-xs text-slate-600 text-center pt-8 px-3">
                Hali hech qanday skan o'tkazilmagan
              </p>
            )}
            {history.map(s => (
              <ScanHistoryItem
                key={s.id}
                scan={s}
                active={s.id === activeScanId}
                onClick={() => handleSelectScan(s.id)}
              />
            ))}
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* Error */}
          {error && (
            <div className="mx-6 mt-4 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 flex items-center gap-2 text-sm text-red-300">
              <AlertCircle size={15} />
              {error}
              <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
            </div>
          )}

          {/* Loading detail */}
          {loadingDetail && (
            <div className="flex items-center justify-center h-40 gap-2 text-slate-500">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm">Yuklanmoqda...</span>
            </div>
          )}

          {/* Empty state */}
          {!currentScan && !scanning && !loadingDetail && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-6">
              <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-200 dark:border-white/8 flex items-center justify-center mb-5">
                <ShieldCheck size={36} className="text-slate-600" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Skan o'tkazilmagan</h2>
              <p className="text-sm text-slate-500 max-w-sm mb-6">
                "Skan qilish" tugmasini bosing — tizim 15+ xavfsizlik
                tekshiruvini avtomatik o'tkazadi va natijalarni ko'rsatadi.
              </p>
              <button
                onClick={handleScan}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20"
              >
                <Scan size={16} />
                Birinchi skanni boshlash
              </button>
            </div>
          )}

          {/* Scanning animation */}
          {scanning && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-5">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-indigo-500/40 animate-ping animation-delay-150" />
                <div className="w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                  <ShieldAlert size={32} className="text-indigo-400 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">Skanlanmoqda...</p>
                <p className="text-sm text-slate-500 mt-1">
                  Statik tekshiruvlar + Security Advisor
                </p>
              </div>
            </div>
          )}

          {/* Results */}
          {currentScan && !scanning && !loadingDetail && (
            <div className="p-6 space-y-6">

              {/* ── Summary row ──────────────────────────────────────────── */}
              <div className="flex flex-wrap items-center gap-6">
                {/* Score ring */}
                <ScoreRing score={scan?.score ?? 0} />

                {/* Stats */}
                <div className="flex-1 min-w-0">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard count={scan?.critical_count ?? 0} severity="critical" />
                    <StatCard count={scan?.high_count ?? 0}     severity="high" />
                    <StatCard count={scan?.medium_count ?? 0}   severity="medium" />
                    <StatCard count={scan?.low_count ?? 0}      severity="low" />
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock size={12} />
                      {scan?.finished_at
                        ? new Date(scan.finished_at).toLocaleString("uz-UZ")
                        : "—"}
                    </span>
                    {scan?.duration_ms && (
                      <span className="text-xs text-slate-500">
                        {(scan.duration_ms / 1000).toFixed(1)}s
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <RefreshCw size={11} />
                      {scan?.total_count ?? 0} ta topilma
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Filters ──────────────────────────────────────────────── */}
              <div className="flex flex-wrap gap-3">
                {/* Severity filter */}
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-200 dark:border-white/8 rounded-lg p-1">
                  {SEVERITY_FILTERS.map(f => (
                    <button
                      key={f.key}
                      onClick={() => setSevFilter(f.key)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        sevFilter === f.key
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-200 dark:border-white/8 rounded-lg p-1">
                  {STATUS_FILTERS.map(f => (
                    <button
                      key={f.key}
                      onClick={() => setStatusFilter(f.key)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        statusFilter === f.key
                          ? "bg-slate-700 text-white"
                          : "text-slate-500 hover:text-white"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Findings list ─────────────────────────────────────────── */}
              {sorted.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-3" />
                  <p className="text-white font-semibold">Topilma yo'q</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Tanlangan filtrlar bo'yicha zaiflik aniqlanmadi
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sorted.map(f => (
                    <FindingRow
                      key={f.id}
                      finding={f}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
