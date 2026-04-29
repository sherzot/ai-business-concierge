/**
 * CandidateScoreCard — overall score + 6 category breakdown.
 *
 * Status: SKELETON.
 * Owner: frontend agent.
 *
 * Design:
 *   • Top: large overall score circle (Indigo gradient) + grade letter
 *   • Below: 6 category bars (Slate background, Indigo fill)
 *   • role_fit shown muted if null (no JD provided)
 */

import type { CandidateAnalysisPayload, CategoryKey } from "../types";

const CATEGORY_LABELS: Record<CategoryKey, { uz: string; ja: string; en: string }> = {
  tech_depth:            { uz: "Texnik chuqurlik",   ja: "技術的深さ",       en: "Tech depth" },
  project_quality:       { uz: "Loyiha sifati",       ja: "プロジェクト品質", en: "Project quality" },
  activity:              { uz: "Faollik",             ja: "活動レベル",       en: "Activity" },
  communication_docs:    { uz: "Hujjat va aloqa",     ja: "ドキュメント",     en: "Docs / comm" },
  cv_github_consistency: { uz: "CV ↔ GitHub mosligi", ja: "CV↔GitHub整合性", en: "CV ↔ GitHub" },
  role_fit:              { uz: "Rolga mos",           ja: "役割適合度",       en: "Role fit" },
};

type Props = {
  payload: CandidateAnalysisPayload;
  locale: "uz" | "ja" | "en";
};

export function CandidateScoreCard({ payload, locale }: Props) {
  const { overall_score, grade, category_scores } = payload;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Overall */}
      <div className="flex items-center gap-6">
        <ScoreRing score={overall_score} grade={grade} />
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">
            {locale === "uz" ? "Umumiy ball" : locale === "ja" ? "総合スコア" : "Overall score"}
          </p>
          <p className="text-3xl font-bold text-slate-900">{overall_score}/100</p>
          <p className="mt-1 text-sm text-slate-600">
            {locale === "uz" ? "Baho" : locale === "ja" ? "評価" : "Grade"}: <span className="font-semibold">{grade}</span>
          </p>
        </div>
      </div>

      {/* Category bars */}
      <ul className="mt-6 space-y-3">
        {(Object.keys(CATEGORY_LABELS) as CategoryKey[]).map((key) => {
          const value = category_scores[key];
          const isNull = value == null;
          const label = CATEGORY_LABELS[key][locale];
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

// ---------------------------------------------------------------------------
// ScoreRing — TODO: replace with proper SVG ring (Radix Progress + custom svg)
// ---------------------------------------------------------------------------

function ScoreRing({ score, grade }: { score: number; grade: string }) {
  // Placeholder gradient circle. Implementation will use SVG arcs.
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
