/**
 * CandidateUploadForm — main intake form.
 *
 * Status: SKELETON (UI scaffolding only).
 * Owner: frontend agent (next session).
 *
 * Design (Indigo + Slate palette, mobile-first):
 *   • GitHub input — large text field with icon
 *   • CV drag-and-drop zone — PDF/DOCX, ≤ 5 MB
 *   • Optional job description — collapsible textarea
 *   • Locale picker — 3-segment toggle (UZ / 日本語 / EN)
 *   • Analysis depth — radio group: "Tez" (Haiku) | "Chuqur" (Sonnet, default)
 *   • Submit button: full-width on mobile, primary indigo
 *
 * TODO (implementation):
 *   • Wire react-hook-form + Zod schema for client validation
 *   • Wire useCandidateAnalysis() hook
 *   • Show inline progress (~25s) — skeleton + estimated time
 *   • Drag/drop file preview + size badge
 *   • i18n via useTranslation('hr.candidates')
 */

import { useState } from "react";
import type { AnalyzeFormInput, Locale, AnalysisDepth } from "../types";

type Props = {
  onSubmit: (input: AnalyzeFormInput) => void;
  isSubmitting?: boolean;
  defaultLocale?: Locale;
};

export function CandidateUploadForm({ onSubmit, isSubmitting = false, defaultLocale = "uz" }: Props) {
  const [githubInput, setGithubInput] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [analysisDepth, setAnalysisDepth] = useState<AnalysisDepth>("deep");

  // TODO: client-side validation (Zod) — return readable errors per field
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!githubInput || !cvFile) return;
    onSubmit({ githubInput, cvFile, jobDescription, locale, analysisDepth });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* GitHub input */}
      <div>
        <label className="block text-sm font-medium text-slate-900">GitHub username yoki URL</label>
        <input
          type="text"
          value={githubInput}
          onChange={(e) => setGithubInput(e.target.value)}
          placeholder="octocat yoki https://github.com/octocat"
          className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          required
        />
      </div>

      {/* CV drop zone — TODO: full drag/drop with @radix-ui patterns */}
      <div>
        <label className="block text-sm font-medium text-slate-900">CV (PDF yoki DOCX, ≤ 5 MB)</label>
        <input
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
          className="mt-1 w-full rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm hover:border-indigo-400"
          required
        />
        {cvFile && (
          <p className="mt-2 text-sm text-slate-600">
            {cvFile.name} · {(cvFile.size / 1024).toFixed(0)} KB
          </p>
        )}
      </div>

      {/* Job description (optional) */}
      <div>
        <label className="block text-sm font-medium text-slate-900">
          Lavozim ta'rifi <span className="text-slate-500">(ixtiyoriy)</span>
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={4}
          placeholder="Vakansiya ta'rifini yozsangiz, AI nomzodning rolga mosligini ham baholaydi"
          className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Locale + depth */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-900">Hisobot tili</label>
          <div className="mt-1 inline-flex rounded-lg border border-slate-300 bg-white p-1">
            {(["uz", "ja", "en"] as Locale[]).map((l) => (
              <button
                type="button"
                key={l}
                onClick={() => setLocale(l)}
                className={
                  "rounded-md px-3 py-1.5 text-sm font-medium transition " +
                  (locale === l ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100")
                }
              >
                {l === "uz" ? "O'zbekcha" : l === "ja" ? "日本語" : "English"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900">Tahlil chuqurligi</label>
          <div className="mt-1 inline-flex rounded-lg border border-slate-300 bg-white p-1">
            {(["fast", "deep"] as AnalysisDepth[]).map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => setAnalysisDepth(d)}
                className={
                  "rounded-md px-3 py-1.5 text-sm font-medium transition " +
                  (analysisDepth === d ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100")
                }
              >
                {d === "fast" ? "Tez (Haiku)" : "Chuqur (Sonnet)"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || !githubInput || !cvFile}
        className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
      >
        {isSubmitting ? "Tahlil qilinmoqda… (~25 soniya)" : "Nomzodni tahlil qilish"}
      </button>
    </form>
  );
}
