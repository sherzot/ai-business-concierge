/**
 * CandidateSummaryCard — AI summary + strengths/weaknesses + hiring recommendation.
 *
 * Status: SKELETON.
 * Owner: frontend agent.
 *
 * Design:
 *   • Recommendation badge (strong_hire = emerald, interview = indigo,
 *     borderline = amber, do_not_proceed = rose)
 *   • Confidence bar (0–100%)
 *   • Two-column lists: ✓ strengths (emerald) / ⚠ weaknesses (slate)
 *   • Narrative summary in prose
 */

import type { CandidateAnalysisPayload, HiringRecommendation } from "../types";

const DECISION_STYLES: Record<HiringRecommendation["decision"], { bg: string; fg: string; label_uz: string; label_ja: string; label_en: string }> = {
  strong_hire:    { bg: "bg-emerald-50",  fg: "text-emerald-700",  label_uz: "Albatta yollang",     label_ja: "強く推奨",       label_en: "Strong hire" },
  interview:      { bg: "bg-indigo-50",   fg: "text-indigo-700",   label_uz: "Intervyu o'tkazing",  label_ja: "面接推奨",       label_en: "Interview" },
  borderline:     { bg: "bg-amber-50",    fg: "text-amber-700",    label_uz: "Chegaraviy",          label_ja: "判断保留",       label_en: "Borderline" },
  do_not_proceed: { bg: "bg-rose-50",     fg: "text-rose-700",     label_uz: "Davom etmang",        label_ja: "不採用推奨",     label_en: "Do not proceed" },
};

type Props = {
  payload: CandidateAnalysisPayload;
  locale: "uz" | "ja" | "en";
};

export function CandidateSummaryCard({ payload, locale }: Props) {
  const { strengths, weaknesses, summary, hiring_recommendation } = payload;
  const style = DECISION_STYLES[hiring_recommendation.decision];
  const label = style[`label_${locale}` as const];

  const strengthsHeading = locale === "uz" ? "Kuchli tomonlari" : locale === "ja" ? "強み" : "Strengths";
  const weaknessesHeading = locale === "uz" ? "Kuchsiz tomonlari" : locale === "ja" ? "弱み" : "Weaknesses";
  const summaryHeading = locale === "uz" ? "Qisqa xulosa" : locale === "ja" ? "総評" : "Summary";

  return (
    <div className="space-y-6">
      {/* Recommendation banner */}
      <div className={`rounded-xl ${style.bg} p-5`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-semibold uppercase tracking-wide ${style.fg}`}>
            {label}
          </span>
          <span className={`text-sm ${style.fg}`}>
            {locale === "uz" ? "Ishonch" : locale === "ja" ? "信頼度" : "Confidence"}: {Math.round(hiring_recommendation.confidence * 100)}%
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-700">{hiring_recommendation.rationale}</p>
      </div>

      {/* Strengths / Weaknesses */}
      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            ✓ {strengthsHeading}
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
            {strengths.map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </section>
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            ⚠ {weaknessesHeading}
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
            {weaknesses.map((w, i) => <li key={i}>• {w}</li>)}
          </ul>
        </section>
      </div>

      {/* Narrative */}
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
          {summaryHeading}
        </h3>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-800">
          {summary}
        </p>
      </section>
    </div>
  );
}
