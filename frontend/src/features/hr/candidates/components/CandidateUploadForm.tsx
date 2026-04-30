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
 * i18n: all strings via useI18n().translate() (4 locales)
 */

import { useState } from "react";
import { useI18n } from "../../../../app/providers/I18nProvider";
import type { AnalyzeFormInput, Locale, AnalysisDepth } from "../types";

type Props = {
  onSubmit: (input: AnalyzeFormInput) => void;
  isSubmitting?: boolean;
};

const LOCALE_OPTIONS: { id: Locale; label: string }[] = [
  { id: "uz", label: "O'zbekcha" },
  { id: "ja", label: "日本語" },
  { id: "en", label: "English" },
];

export function CandidateUploadForm({ onSubmit, isSubmitting = false }: Props) {
  const { translate, locale: globalLocale } = useI18n();
  // Form locale defaults to global UI locale; user can pick a different report locale
  const [githubInput, setGithubInput] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [locale, setLocale] = useState<Locale>(
    (globalLocale === "ru" ? "uz" : globalLocale) as Locale,
  );
  const [analysisDepth, setAnalysisDepth] = useState<AnalysisDepth>("deep");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!githubInput || !cvFile) return;
    onSubmit({ githubInput, cvFile, jobDescription, locale, analysisDepth });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* GitHub input */}
      <div>
        <label className="block text-sm font-medium text-slate-900">
          {translate("hr.candidates.form.githubLabel")}
        </label>
        <input
          type="text"
          value={githubInput}
          onChange={(e) => setGithubInput(e.target.value)}
          placeholder={translate("hr.candidates.form.githubPlaceholder")}
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          required
        />
      </div>

      {/* CV drop zone */}
      <div>
        <label className="block text-sm font-medium text-slate-900">
          {translate("hr.candidates.form.cvLabel")}
        </label>
        <input
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
          className="mt-1.5 w-full rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm hover:border-indigo-400"
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
          {translate("hr.candidates.form.jdLabel")}{" "}
          <span className="text-slate-500">{translate("hr.candidates.form.jdOptional")}</span>
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={4}
          placeholder={translate("hr.candidates.form.jdPlaceholder")}
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-base focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Locale */}
      <div>
        <label className="block text-sm font-medium text-slate-900">
          {translate("hr.candidates.form.localeLabel")}
        </label>
        <div className="mt-1.5 flex w-full gap-1 rounded-lg border border-slate-300 bg-white p-1">
          {LOCALE_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.id}
              onClick={() => setLocale(opt.id)}
              className={
                "flex-1 rounded-md px-2 py-2 text-sm font-medium transition whitespace-nowrap " +
                (locale === opt.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100")
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Depth */}
      <div>
        <label className="block text-sm font-medium text-slate-900">
          {translate("hr.candidates.form.depthLabel")}
        </label>
        <div className="mt-1.5 flex w-full gap-1 rounded-lg border border-slate-300 bg-white p-1">
          {(["fast", "deep"] as AnalysisDepth[]).map((d) => (
            <button
              type="button"
              key={d}
              onClick={() => setAnalysisDepth(d)}
              className={
                "flex-1 rounded-md px-3 py-2 text-sm font-medium transition whitespace-nowrap " +
                (analysisDepth === d
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100")
              }
            >
              {d === "fast"
                ? translate("hr.candidates.form.depthFast")
                : translate("hr.candidates.form.depthDeep")}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {analysisDepth === "fast"
            ? translate("hr.candidates.form.depthFastHint")
            : translate("hr.candidates.form.depthDeepHint")}
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || !githubInput || !cvFile}
        className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isSubmitting
          ? translate("hr.candidates.form.submitting")
          : translate("hr.candidates.form.submit")}
      </button>
    </form>
  );
}
