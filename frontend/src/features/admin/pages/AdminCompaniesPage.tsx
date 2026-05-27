import React, { useEffect, useState, useCallback } from "react";
import {
  Search, RefreshCw, ChevronDown, Building2, Phone, Mail,
  Users, CheckCircle, PauseCircle, XCircle, Clock,
} from "lucide-react";
import { Pagination, paginateArray } from "../../../shared/components/Pagination";
import { getAdminCompanies, updateCompanyStatus, Company, CompanyStatus } from "../api/adminApi";

const STATUS_LABELS: Record<CompanyStatus, string> = {
  pending_approval: "Kutilmoqda",
  active:           "Faol",
  suspended:        "To'xtatilgan",
  blocked:          "Bloklangan",
};

const STATUS_COLORS: Record<CompanyStatus, string> = {
  pending_approval: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  active:           "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  suspended:        "bg-orange-500/15 text-orange-300 border-orange-500/30",
  blocked:          "bg-red-500/15 text-red-300 border-red-500/30",
};

const STATUS_ICONS: Record<CompanyStatus, React.ReactNode> = {
  pending_approval: <Clock size={13} />,
  active:           <CheckCircle size={13} />,
  suspended:        <PauseCircle size={13} />,
  blocked:          <XCircle size={13} />,
};

const LEGAL_FORM_LABELS: Record<string, string> = {
  yatt: "YaTT",
  llc:  "MChJ",
  jsc:  "AJ",
  other: "Boshqa",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uz-UZ", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function BlockReasonModal({
  onConfirm, onCancel,
}: { onConfirm: (reason: string) => void; onCancel: () => void }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-white font-semibold text-lg mb-1">Bloklash sababi</h3>
        <p className="text-slate-400 text-sm mb-4">Bu sabab kompaniyaga yuborilmaydi, faqat admin uchun.</p>
        <textarea
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Masalan: Shartlar buzildi, noto'g'ri ma'lumotlar..."
          rows={3}
          className="w-full rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 px-4 py-3 text-sm resize-none focus:outline-none focus:border-indigo-500 transition-colors mb-4"
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            Bekor
          </button>
          <button
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason.trim())}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-400 transition-colors disabled:opacity-40"
          >
            Bloklash
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminCompaniesPage() {
  const [companies, setCompanies]   = useState<Company[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [filter, setFilter]         = useState<CompanyStatus | "all">("all");
  const [search, setSearch]         = useState("");
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const [updating, setUpdating]     = useState<string | null>(null);
  const [blockTarget, setBlockTarget] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminCompanies();
      setCompanies(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id: string, status: "active" | "suspended" | "blocked", reason?: string) => {
    setUpdating(id);
    setBlockTarget(null);
    try {
      await updateCompanyStatus(id, status, reason);
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, status, blocked_reason: reason ?? c.blocked_reason, approved_at: status === "active" ? new Date().toISOString() : c.approved_at }
            : c
        )
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Xatolik yuz berdi");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = companies.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.stir ?? "").includes(q) ||
        (c.contact_email ?? "").toLowerCase().includes(q) ||
        (c.contact_phone ?? "").includes(q)
      );
    }
    return true;
  });

  const counts = companies.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const FILTER_TABS = (["all", "pending_approval", "active", "suspended", "blocked"] as const);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Kompaniyalar</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Ro'yxatdan o'tgan kompaniyalar — tasdiqlash va boshqarish
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 text-slate-200 text-sm hover:bg-slate-600 transition-colors disabled:opacity-50 shrink-0"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Yangilash
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(["pending_approval", "active", "suspended", "blocked"] as const).map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(filter === s ? "all" : s); setPage(1); }}
            className={`rounded-xl border p-3.5 text-left transition-all ${
              filter === s
                ? STATUS_COLORS[s] + " ring-1 ring-white/20"
                : "bg-slate-800/50 border-white/8 hover:border-white/15"
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className={filter === s ? "" : "text-slate-500"}>{STATUS_ICONS[s]}</span>
              <span className={`text-xs font-medium ${filter === s ? "" : "text-slate-400"}`}>
                {STATUS_LABELS[s]}
              </span>
            </div>
            <div className={`text-2xl font-bold ${filter === s ? "" : "text-white"}`}>
              {counts[s] ?? 0}
            </div>
          </button>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTER_TABS.map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filter === s
                ? "bg-indigo-500 border-indigo-400 text-white"
                : "bg-slate-800 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
            }`}
          >
            {s === "all" ? "Hammasi" : STATUS_LABELS[s]}
            <span className="ml-1.5 bg-white/15 rounded-full px-1.5">
              {s === "all" ? companies.length : (counts[s] ?? 0)}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Kompaniya nomi, STIR, email yoki telefon..."
          className="w-full rounded-xl bg-slate-800 border border-white/10 text-white placeholder-slate-500 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-slate-800/50 border border-white/8 px-5 py-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-slate-700 rounded" />
                  <div className="h-3 w-72 bg-slate-700/60 rounded" />
                </div>
                <div className="h-6 w-20 bg-slate-700 rounded-full" />
                <div className="h-7 w-7 bg-slate-700 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
          <Building2 size={40} className="opacity-30" />
          <p className="text-sm font-medium">Kompaniya topilmadi</p>
          {(search || statusFilter !== "all") && (
            <p className="text-xs text-slate-600">Filtrlarni tozalang yoki boshqa so'z kiriting</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {paginateArray(filtered, page, PAGE_SIZE).map((c) => (
            <div
              key={c.id}
              className="rounded-xl bg-slate-800/50 border border-white/8 overflow-hidden"
            >
              {/* Row */}
              <div
                className="flex flex-wrap items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-800/70 transition-colors"
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Building2 size={15} className="text-slate-500 flex-shrink-0" />
                    <span className="font-semibold text-white text-sm">{c.name}</span>
                    {c.legal_form && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                        {LEGAL_FORM_LABELS[c.legal_form] ?? c.legal_form}
                      </span>
                    )}
                    {c.stir && (
                      <span className="text-xs text-slate-500">STIR: {c.stir}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-400 flex-wrap">
                    {c.contact_email && (
                      <span className="flex items-center gap-1"><Mail size={11} /> {c.contact_email}</span>
                    )}
                    {c.contact_phone && (
                      <span className="flex items-center gap-1"><Phone size={11} /> {c.contact_phone}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users size={11} /> {c.member_count} xodim
                    </span>
                    <span>Qo'shildi: {formatDate(c.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[c.status]}`}>
                    {STATUS_ICONS[c.status]}
                    {STATUS_LABELS[c.status]}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-500 transition-transform ${expanded === c.id ? "rotate-180" : ""}`}
                  />
                </div>
              </div>

              {/* Expanded details */}
              {expanded === c.id && (
                <div className="border-t border-white/8 px-5 py-4 bg-slate-900/40">
                  {/* Details grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5 text-sm">
                    {c.legal_address && (
                      <div><span className="text-slate-500">Manzil: </span><span className="text-slate-200">{c.legal_address}</span></div>
                    )}
                    {c.activity_type && (
                      <div><span className="text-slate-500">Faoliyat: </span><span className="text-slate-200">{c.activity_type}</span></div>
                    )}
                    {c.employee_count_range && (
                      <div><span className="text-slate-500">Xodimlar soni: </span><span className="text-slate-200">{c.employee_count_range}</span></div>
                    )}
                    {c.bank_name && (
                      <div><span className="text-slate-500">Bank: </span><span className="text-slate-200">{c.bank_name}</span></div>
                    )}
                    {c.bank_account && (
                      <div><span className="text-slate-500">Hisob: </span><span className="text-slate-200">{c.bank_account}</span></div>
                    )}
                    {c.website && (
                      <div>
                        <span className="text-slate-500">Sayt: </span>
                        <a href={c.website} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                          {c.website}
                        </a>
                      </div>
                    )}
                    {c.approved_at && (
                      <div><span className="text-slate-500">Tasdiqlangan: </span><span className="text-slate-200">{formatDate(c.approved_at)}</span></div>
                    )}
                  </div>

                  {/* Block reason */}
                  {c.blocked_reason && (
                    <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 text-sm text-red-300">
                      <span className="text-slate-500 text-xs block mb-1">Bloklash sababi:</span>
                      {c.blocked_reason}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {c.status === "pending_approval" && (
                      <button
                        disabled={updating === c.id}
                        onClick={() => changeStatus(c.id, "active")}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-400 transition-all disabled:opacity-50"
                      >
                        <CheckCircle size={13} />
                        {updating === c.id ? "..." : "Tasdiqlash"}
                      </button>
                    )}
                    {c.status === "active" && (
                      <button
                        disabled={updating === c.id}
                        onClick={() => changeStatus(c.id, "suspended")}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-orange-500/15 text-orange-300 border border-orange-500/30 hover:bg-orange-500/25 transition-all disabled:opacity-50"
                      >
                        <PauseCircle size={13} />
                        {updating === c.id ? "..." : "To'xtatish"}
                      </button>
                    )}
                    {c.status === "suspended" && (
                      <button
                        disabled={updating === c.id}
                        onClick={() => changeStatus(c.id, "active")}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-400 transition-all disabled:opacity-50"
                      >
                        <CheckCircle size={13} />
                        {updating === c.id ? "..." : "Qayta faollashtirish"}
                      </button>
                    )}
                    {c.status !== "blocked" && (
                      <button
                        disabled={updating === c.id}
                        onClick={() => setBlockTarget(c.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 transition-all disabled:opacity-50"
                      >
                        <XCircle size={13} />
                        {updating === c.id ? "..." : "Bloklash"}
                      </button>
                    )}
                    {c.status === "blocked" && (
                      <button
                        disabled={updating === c.id}
                        onClick={() => changeStatus(c.id, "active")}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-400 transition-all disabled:opacity-50"
                      >
                        <CheckCircle size={13} />
                        {updating === c.id ? "..." : "Blokdan chiqarish"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <Pagination
          page={page}
          totalPages={Math.ceil(filtered.length / PAGE_SIZE)}
          onPageChange={setPage}
          pageSize={PAGE_SIZE}
          totalItems={filtered.length}
          className="[&_button]:!text-slate-300 [&_button]:!hover:bg-slate-800"
        />
      )}

      {/* Block reason modal */}
      {blockTarget && (
        <BlockReasonModal
          onConfirm={(reason) => changeStatus(blockTarget, "blocked", reason)}
          onCancel={() => setBlockTarget(null)}
        />
      )}
    </div>
  );
}
