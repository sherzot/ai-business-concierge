/**
 * AdminKnowledgeBasePage — KB articles CRUD for super admins.
 * Supports: list, filter, create, edit, toggle is_active, delete.
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Plus, Search, RefreshCw, Pencil, Trash2, ToggleLeft, ToggleRight,
  BookOpen, ChevronDown, ChevronUp, Tag, Globe, Loader2, X, Save,
} from "lucide-react";
import {
  listKbArticles, createKbArticle, updateKbArticle, deleteKbArticle,
  type KbArticle, type CreateKbInput,
} from "../api/kbApi";
import { staggerContainer, staggerItem } from "../../../shared/lib/motionVariants";

// ── Constants ──────────────────────────────────────────────────────────────────

const LOCALES = ["uz", "ru", "en", "ja"];
const CATEGORIES = ["tax", "hr", "docs", "sales", "general", "billing", "legal"];

// ── Article Form Modal ────────────────────────────────────────────────────────

interface FormModalProps {
  initial?: KbArticle;
  onSave: (data: CreateKbInput) => Promise<void>;
  onClose: () => void;
}

function FormModal({ initial, onSave, onClose }: FormModalProps) {
  const [locale, setLocale]     = useState(initial?.locale ?? "uz");
  const [category, setCategory] = useState(initial?.category ?? "general");
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [answer, setAnswer]     = useState(initial?.answer ?? "");
  const [tags, setTags]         = useState((initial?.tags ?? []).join(", "));
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) { setError("Savol va javob majburiy."); return; }
    setSaving(true);
    try {
      await onSave({
        locale, category, question: question.trim(), answer: answer.trim(),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        is_active: isActive,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xato");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <BookOpen size={18} className="text-indigo-400" />
            <h2 className="text-base font-semibold text-white">
              {initial ? "Maqolani tahrirlash" : "Yangi KB maqola"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/8">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Locale + Category */}
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-slate-400 mb-1.5 block">Til</span>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {LOCALES.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-slate-400 mb-1.5 block">Kategoriya</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>

          {/* Question */}
          <label className="block">
            <span className="text-xs text-slate-400 mb-1.5 block">Savol</span>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Mijoz so'raydigan savol..."
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </label>

          {/* Answer */}
          <label className="block">
            <span className="text-xs text-slate-400 mb-1.5 block">Javob</span>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              placeholder="To'liq, aniq javob..."
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
            />
          </label>

          {/* Tags + is_active */}
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-slate-400 mb-1.5 block flex items-center gap-1">
                <Tag size={11} /> Teglar (vergul bilan ajratilgan)
              </span>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="soliq, QQS, hisobot"
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-400 mb-1.5 block">Holat</span>
              <button
                type="button"
                onClick={() => setIsActive((v) => !v)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                    : "bg-slate-800 border-white/10 text-slate-400"
                }`}
              >
                {isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                {isActive ? "Faol" : "Nofaol"}
              </button>
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {initial ? "Saqlash" : "Yaratish"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function AdminKnowledgeBasePage() {
  const [articles, setArticles] = useState<KbArticle[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [filterLocale, setFilterLocale]   = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing]   = useState<KbArticle | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [busy, setBusy]         = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listKbArticles();
      setArticles(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xato");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filter
  const filtered = articles.filter((a) => {
    if (filterLocale !== "all" && a.locale !== filterLocale) return false;
    if (filterCategory !== "all" && a.category !== filterCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.question.toLowerCase().includes(q) || a.answer.toLowerCase().includes(q);
    }
    return true;
  });

  async function handleCreate(data: CreateKbInput) {
    const created = await createKbArticle(data);
    setArticles((prev) => [created, ...prev]);
  }

  async function handleUpdate(data: CreateKbInput) {
    if (!editing) return;
    const updated = await updateKbArticle(editing.id, data);
    setArticles((prev) => prev.map((a) => a.id === updated.id ? updated : a));
    setEditing(null);
  }

  async function handleToggle(article: KbArticle) {
    setBusy(article.id);
    try {
      const updated = await updateKbArticle(article.id, { is_active: !article.is_active });
      setArticles((prev) => prev.map((a) => a.id === updated.id ? updated : a));
    } catch { /* silent */ } finally { setBusy(null); }
  }

  async function handleDelete(id: string) {
    setBusy(id);
    try {
      await deleteKbArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch { /* silent */ } finally { setBusy(null); setDeleting(null); }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-400" />
            Knowledge Base
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {articles.length} ta maqola · {articles.filter((a) => a.is_active).length} ta faol
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/8 border border-white/8 transition-colors"
          >
            <RefreshCw size={13} /> Yangilash
          </button>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            <Plus size={16} /> Yangi maqola
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidiruv..."
            className="pl-8 pr-4 py-1.5 bg-slate-800 border border-white/10 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-48"
          />
        </div>
        <select
          value={filterLocale}
          onChange={(e) => setFilterLocale(e.target.value)}
          className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
        >
          <option value="all">Barcha tillar</option>
          {LOCALES.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
        >
          <option value="all">Barcha kategoriyalar</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="text-xs text-slate-500">{filtered.length} ta natija</span>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-indigo-400" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={32} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Maqolalar topilmadi</p>
        </div>
      ) : (
        <motion.div
          className="space-y-2"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {filtered.map((article) => (
            <motion.div
              key={article.id}
              variants={staggerItem}
              className={`rounded-xl border overflow-hidden transition-colors ${
                article.is_active
                  ? "bg-slate-800/50 border-white/8"
                  : "bg-slate-900/30 border-white/4 opacity-60"
              }`}
            >
              {/* Row */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-800/80 transition-colors"
                onClick={() => setExpanded(expanded === article.id ? null : article.id)}
              >
                {/* Locale badge */}
                <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                  {article.locale}
                </span>

                {/* Category */}
                <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                  {article.category}
                </span>

                {/* Question */}
                <p className="flex-1 text-sm text-white truncate">{article.question}</p>

                {/* Tags */}
                {article.tags?.length > 0 && (
                  <div className="hidden sm:flex items-center gap-1 shrink-0">
                    {article.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-400">{t}</span>
                    ))}
                    {article.tags.length > 2 && <span className="text-[10px] text-slate-500">+{article.tags.length - 2}</span>}
                  </div>
                )}

                {/* Active toggle */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggle(article); }}
                  disabled={busy === article.id}
                  className={`shrink-0 transition-colors ${article.is_active ? "text-emerald-400 hover:text-emerald-300" : "text-slate-600 hover:text-slate-400"}`}
                  title={article.is_active ? "O'chirish" : "Yoqish"}
                >
                  {busy === article.id
                    ? <Loader2 size={16} className="animate-spin" />
                    : article.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />
                  }
                </button>

                {/* Chevron */}
                <span className="text-slate-600 shrink-0">
                  {expanded === article.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
              </div>

              {/* Expanded */}
              {expanded === article.id && (
                <div className="px-4 pb-4 border-t border-white/6 space-y-3">
                  <p className="text-sm text-slate-300 whitespace-pre-wrap pt-3">{article.answer}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setEditing(article)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-300 hover:bg-indigo-500/15 border border-indigo-500/20 transition-colors"
                    >
                      <Pencil size={12} /> Tahrirlash
                    </button>
                    <button
                      onClick={() => setDeleting(article.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/15 border border-red-500/20 transition-colors"
                    >
                      <Trash2 size={12} /> O'chirish
                    </button>
                    <span className="ml-auto text-[11px] text-slate-600">
                      v{article.version} · {new Date(article.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Modal */}
      {creating && (
        <FormModal onSave={handleCreate} onClose={() => setCreating(false)} />
      )}

      {/* Edit Modal */}
      {editing && (
        <FormModal initial={editing} onSave={handleUpdate} onClose={() => setEditing(null)} />
      )}

      {/* Delete Confirm */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-2">Maqolani o'chirish</h3>
            <p className="text-sm text-slate-400 mb-5">Bu amal qaytarib bo'lmaydi. Davom etasizmi?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleting(null)}
                className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/8"
              >
                Bekor
              </button>
              <button
                onClick={() => handleDelete(deleting)}
                disabled={busy === deleting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-500 text-white disabled:opacity-50"
              >
                {busy === deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
