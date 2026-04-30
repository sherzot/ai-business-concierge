/**
 * CandidateSummaryCard — AI summary + strengths/weaknesses + hiring recommendation.
 *
 * i18n: useI18n() — global locale, hr.candidates.* keys
 */

import { useI18n } from "../../../../app/providers/I18nProvider";
import type { CandidateAnalysisPayload, HiringRecommendation } from "../types";

const DECISION_STYLES: Record<HiringRecommendation["decision"], { bg: string; fg: string }> = {
  strong_hire:    { bg: "bg-emerald-50", fg: "text-emerald-700" },
  interview:      { bg: "bg-indigo-50",  fg: "text-indigo-700" },
  borderline:     { bg: "bg-amber-50",   fg: "text-amber-700" },
  do_not_proceed: { bg: "bg-rose-50",    fg: "text-rose-700" },
};

type Props = {
  payload: CandidateAnalysisPayload;
};

export function CandidateSummaryCard({ payload }: Props) {
  const { translate } = useI18n();
  const { strengths, weaknesses, summary, hiring_recommendation } = payload;
  const style = DECISION_STYLES[hiring_recommendation.decision];
  const label = translate(`hr.candidates.decisions.${hiring_recommendation.decision}`);

  return (
    <div className="space-y-6">
      <div className={`rounded-xl ${style.bg} p-5`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-semibold uppercase tracking-wide ${style.fg}`}>
            {label}
          </span>
          <span className={`text-sm ${style.fg}`}>
            {translate("hr.candidates.result.confidence")}: {Math.round(hiring_recommendation.confidence * 100)}%
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-700">{hiring_recommendation.rationale}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            ✓ {translate("hr.candidates.result.strengths")}
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
            {strengths.map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </section>
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            ⚠ {translate("hr.candidates.result.weaknesses")}
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
            {weaknesses.map((w, i) => <li key={i}>• {w}</li>)}
          </ul>
        </section>
      </div>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
          {translate("hr.candidates.result.summary")}
        </h3>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-800">
          {summary}
        </p>
      </section>
    </div>
  );
}
