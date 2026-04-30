/**
 * CandidateScoreCard — overall score + 6 category breakdown.
 *
 * i18n: useI18n() — global locale, hr.candidates.* keys
 */

import { useI18n } from "../../../../app/providers/I18nProvider";
import type { CandidateAnalysisPayload, CategoryKey } from "../types";

const CATEGORY_KEYS: CategoryKey[] = [
  "tech_depth",
  "project_quality",
  "activity",
  "communication_docs",
  "cv_github_consistency",
  "role_fit",
];

type Props = {
  payload: CandidateAnalysisPayload;
};

export function CandidateScoreCard({ payload }: Props) {
  const { translate } = useI18n();
  const { overall_score, grade, category_scores } = payload;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-6">
        <ScoreRing score={overall_score} grade={grade} />
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">
            {translate("hr.candidates.result.overallScore")}
          </p>
          <p className="text-3xl font-bold text-slate-900">{overall_score}/100</p>
          <p className="mt-1 text-sm text-slate-600">
            {translate("hr.candidates.result.grade")}: <span className="font-semibold">{grade}</span>
          </p>
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {CATEGORY_KEYS.map((key) => {
          const value = category_scores[key];
          const isNull = value == null;
          const label = translate(`hr.candidates.categories.${key}`);
          return (
            <li key={key}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className={isNull ? "text-slate-400" : "text-slate-700"}>{label}</span>
                <span className={isNull ? "text-slate-400" : "font-medium text-slate-900"}>
                  {isNull ? "—" : `${value}/100`}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                {!isNull && (
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${value}%` }}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ScoreRing({ score, grade }: { score: number; grade: string }) {
  const angle = Math.round((score / 100) * 360);
  return (
    <div
      className="grid h-24 w-24 place-items-center rounded-full text-2xl font-bold text-white"
      style={{
        backgroundImage: `conic-gradient(#4f46e5 ${angle}deg, #e2e8f0 ${angle}deg)`,
      }}
    >
      <span className="grid h-20 w-20 place-items-center rounded-full bg-white text-indigo-700">
        {grade}
      </span>
    </div>
  );
}
