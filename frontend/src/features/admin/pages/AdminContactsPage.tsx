import React, { useEffect, useState, useCallback } from "react";
import { Search, Phone, Mail, Building2, Users, RefreshCw, ChevronDown, Copy, Check, Send } from "lucide-react";
import { apiRequest } from "../../../shared/lib/apiClient";

type ContactStatus = "new" | "contacted" | "invite_sent" | "registered" | "rejected";

type ContactRequest = {
  id: string;
  full_name: string;
  company_name: string | null;
  phone: string;
  email: string;
  business_type: string | null;
  employee_count: string | null;
  message: string | null;
  source: string | null;
  status: ContactStatus;
  admin_note: string | null;
  invite_token: string | null;
  invite_expires_at: string | null;
  created_at: string;
};

const STATUS_LABELS: Record<ContactStatus, string> = {
  new:         "Yangi",
  contacted:   "Bog'landi",
  invite_sent: "Invite yuborildi",
  registered:  "Ro'yxatdan o'tdi",
  rejected:    "Rad etildi",
};

const STATUS_COLORS: Record<ContactStatus, string> = {
  new:         "bg-blue-500/15 text-blue-300 border-blue-500/30",
  contacted:   "bg-amber-500/15 text-amber-300 border-amber-500/30",
  invite_sent: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  registered:  "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  rejected:    "bg-red-500/15 text-red-300 border-red-500/30",
};

const NEXT_STATUS: Partial<Record<ContactStatus, { label: string; value: ContactStatus }[]>> = {
  new:         [{ label: "Bog'landim", value: "contacted" }, { label: "Rad etish", value: "rejected" }],
  contacted:   [{ label: "Invite yuborish", value: "invite_sent" }, { label: "Rad etish", value: "rejected" }],
  invite_sent: [{ label: "Rad etish", value: "rejected" }],
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function AdminContactsPage() {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [filter, setFilter]     = useState<ContactStatus | "all">("all");
  const [search, setSearch]     = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [copied, setCopied]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<ContactRequest[]>("/admin/contacts");
      setContacts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const copyInviteLink = (token: string, id: string) => {
    const link = `${window.location.origin}/register?token=${token}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const updateStatus = async (id: string, status: ContactStatus, note?: string) => {
    setUpdating(id);
    try {
      const updated = await apiRequest<ContactRequest>(`/admin/contacts/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, admin_note: note }),
      });
      setContacts((prev) => prev.map((c) => c.id === id ? { ...c, ...updated } : c));
      if (status !== "invite_sent") setExpanded(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = contacts.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.full_name.toLowerCase().includes(q) ||
        (c.company_name ?? "").toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
      );
    }
    return true;
  });

  const counts = contacts.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Murojaatlar</h1>
          <p className="text-slate-400 text-sm mt-0.5">Landing page orqali kelgan kompaniya murojaatlari</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm hover:bg-slate-50 transition-colors disabled:opacity-50 shrink-0"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Yangilash
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(["all", "new", "contacted", "invite_sent", "registered", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filter === s
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            {s === "all" ? "Hammasi" : STATUS_LABELS[s]}
            {s !== "all" && counts[s] ? (
              <span className="ml-1.5 bg-black/10 rounded-full px-1.5">{counts[s]}</span>
            ) : null}
            {s === "all" && (
              <span className="ml-1.5 bg-black/10 rounded-full px-1.5">{contacts.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ism, kompaniya, email yoki telefon..."
          className="w-full rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white border border-slate-200 px-5 py-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-slate-200 rounded" />
                  <div className="h-3 w-64 bg-slate-100 rounded" />
                </div>
                <div className="h-6 w-20 bg-slate-200 rounded-full" />
                <div className="h-7 w-7 bg-slate-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
          <Users size={40} className="opacity-30" />
          <p className="text-sm font-medium">Murojaat topilmadi</p>
          {(search || filter !== "all") && (
            <p className="text-xs text-slate-600">Filtrlarni tozalang yoki boshqa so'z kiriting</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="rounded-xl bg-white border border-slate-200 overflow-hidden"
            >
              {/* Row */}
              <div
                className="flex flex-wrap items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900 text-sm">{c.full_name}</span>
                    {c.company_name && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Building2 size={11} /> {c.company_name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1"><Phone size={11} /> {c.phone}</span>
                    <span className="flex items-center gap-1"><Mail size={11} /> {c.email}</span>
                    <span>{formatDate(c.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[c.status]}`}>
                    {STATUS_LABELS[c.status]}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-500 transition-transform ${expanded === c.id ? "rotate-180" : ""}`}
                  />
                </div>
              </div>

              {/* Expanded */}
              {expanded === c.id && (
                <div className="border-t border-slate-200 dark:border-white/8 px-5 py-4 bg-slate-900/40">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5 text-sm">
                    {c.business_type && <div><span className="text-slate-500">Biznes turi: </span><span className="text-slate-200">{c.business_type.toUpperCase()}</span></div>}
                    {c.employee_count && <div><span className="text-slate-500">Xodimlar: </span><span className="text-slate-200">{c.employee_count}</span></div>}
                    {c.source && <div><span className="text-slate-500">Manba: </span><span className="text-slate-200">{c.source}</span></div>}
                  </div>
                  {c.message && (
                    <div className="mb-5 rounded-xl bg-slate-800 border border-slate-200 dark:border-white/8 px-4 py-3 text-sm text-slate-300">
                      <span className="text-slate-500 text-xs block mb-1">Xabar:</span>
                      {c.message}
                    </div>
                  )}
                  {c.admin_note && (
                    <div className="mb-5 text-sm text-amber-300">
                      <span className="text-slate-500 text-xs">Admin izohi: </span>{c.admin_note}
                    </div>
                  )}

                  {/* Invite link (when invite_sent) */}
                  {c.status === "invite_sent" && c.invite_token && (
                    <div className="mb-5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 px-4 py-3">
                      <div className="text-xs text-indigo-400 font-medium mb-2">Ro'yxatdan o'tish havolasi:</div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs text-slate-300 bg-slate-900/60 rounded-lg px-3 py-2 truncate">
                          {`${window.location.origin}/register?token=${c.invite_token}`}
                        </code>
                        <button
                          onClick={() => copyInviteLink(c.invite_token!, c.id)}
                          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-xs font-medium transition-colors"
                        >
                          {copied === c.id ? <Check size={13} /> : <Copy size={13} />}
                          {copied === c.id ? "Nusxalandi!" : "Nusxalash"}
                        </button>
                      </div>
                      {c.invite_expires_at && (
                        <div className="text-xs text-slate-500 mt-1.5">
                          Muddat: {formatDate(c.invite_expires_at)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {NEXT_STATUS[c.status]?.map((action) => (
                      <button
                        key={action.value}
                        disabled={updating === c.id}
                        onClick={() => updateStatus(c.id, action.value)}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                          action.value === "rejected"
                            ? "bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25"
                            : "bg-indigo-500 text-white hover:bg-indigo-400"
                        }`}
                      >
                        {updating === c.id ? "..." : action.label}
                      </button>
                    ))}
                    {/* Invite qayta yuborish */}
                    {c.status === "invite_sent" && (
                      <button
                        disabled={updating === c.id}
                        onClick={() => updateStatus(c.id, "invite_sent")}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-700 text-slate-200 hover:bg-slate-600 transition-all disabled:opacity-50"
                      >
                        <Send size={12} />
                        {updating === c.id ? "..." : "Qayta yuborish"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
