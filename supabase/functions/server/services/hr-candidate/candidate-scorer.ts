/**
 * Candidate Scorer (Tool 3)
 *
 * Status: SKELETON (TODO bloklari implementatsiya kutilmoqda).
 * Owner: backend agent (next session).
 *
 * Responsibilities:
 *   • Combine GitHub + CV signals
 *   • Compute 6 category scores (0–100): tech_depth, project_quality, activity,
 *     communication_docs, cv_github_consistency, role_fit
 *   • Detect inconsistency_flags (stack_mismatch, experience_gap, title_inflation, ...)
 *   • Determine grade and overall_score (weighted average)
 *
 * Model selection (analysis_depth):
 *   • "fast" → Claude Haiku 3.5 (quick, deterministic rubric)
 *   • "deep" → Claude Sonnet 4 (full reasoning, default)
 *
 * Output: subset of CandidateAnalysisPayload (overall_score, grade,
 *         category_scores, inconsistency_flags). Strengths/weaknesses
 *         and the narrative summary are produced by report-generator.ts.
 */

import type {
  RawSignals,
  CategoryScores,
  InconsistencyFlag,
  Locale,
  AnalysisDepth,
} from "./types.ts";

export type ScorerOutput = {
  overall_score: number;
  grade: "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F";
  category_scores: CategoryScores;
  inconsistency_flags: InconsistencyFlag[];
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function scoreCandidate(
  signals: RawSignals,
  jobDescription: string | undefined,
  locale: Locale,
  depth: AnalysisDepth,
): Promise<ScorerOutput> {
  // -------------------------------------------------------------------------
  // 1. Deterministic pre-scoring (no AI) — gives Sonnet a baseline to refine.
  // -------------------------------------------------------------------------
  const baseline = computeBaselineScores(signals);

  // -------------------------------------------------------------------------
  // 2. AI refinement (Haiku for fast, Sonnet for deep)
  // -------------------------------------------------------------------------
  // TODO: call llm-router.callClaude({
  //         complexity: depth === "deep" ? "analysis" : "simple",
  //         systemPrompt: prompts.scorerSystem(locale),
  //         message: JSON.stringify({ signals, baseline, jobDescription }),
  //         responseFormat: "json",
  //       })
  //       Parse → validate (Zod) → adjustedScores
  const adjustedScores: CategoryScores = baseline.scores;
  const inconsistencyFlags: InconsistencyFlag[] = detectInconsistencies(signals);

  // -------------------------------------------------------------------------
  // 3. Overall + grade
  // -------------------------------------------------------------------------
  const overall = weightedOverall(adjustedScores);
  const grade = toGrade(overall);

  return {
    overall_score: overall,
    grade,
    category_scores: adjustedScores,
    inconsistency_flags: inconsistencyFlags,
  };
}

// ---------------------------------------------------------------------------
// Baseline (deterministic) scoring
// ---------------------------------------------------------------------------

function computeBaselineScores(signals: RawSignals): { scores: CategoryScores } {
  // TODO: implement rubrics described in HR_CANDIDATE_ANALYSIS.md §6.3.
  //       For each category, compute 0–100 from raw signals only.
  //       Below is a placeholder zero-state.
  return {
    scores: {
      tech_depth: 0,
      project_quality: 0,
      activity: 0,
      communication_docs: 0,
      cv_github_consistency: 0,
      role_fit: null,
    },
  };
}

// ---------------------------------------------------------------------------
// Inconsistency detection
// ---------------------------------------------------------------------------

export function detectInconsistencies(signals: RawSignals): InconsistencyFlag[] {
  const flags: InconsistencyFlag[] = [];

  // Stack mismatch: CV claims senior <X> but GitHub <X>% < 5
  // TODO: walk cv.tech_skills × github.primary_languages; flag missing senior signal

  // Experience gap: CV says 5y but GitHub account_age < 2y
  // TODO: compare cv.experience_years_total vs github.account_age_years

  // Title inflation: "Senior" / "Lead" in roles but no leadership signals
  // TODO: detect "senior|lead|principal|staff" and check pinned/PR signals

  // Education unverified: trivially true for MVP — surface only as low severity
  return flags;
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

const WEIGHTS = {
  tech_depth: 0.25,
  project_quality: 0.20,
  activity: 0.15,
  communication_docs: 0.10,
  cv_github_consistency: 0.20,
  role_fit: 0.10,
} as const;

export function weightedOverall(scores: CategoryScores): number {
  let total = 0;
  let weight = 0;
  for (const [k, w] of Object.entries(WEIGHTS) as [keyof CategoryScores, number][]) {
    const v = scores[k];
    if (v == null) continue; // role_fit is null when no JD provided
    total += v * w;
    weight += w;
  }
  return Math.round(total / (weight || 1));
}

export function toGrade(score: number): ScorerOutput["grade"] {
  if (score >= 92) return "A+";
  if (score >= 85) return "A";
  if (score >= 78) return "B+";
  if (score >= 70) return "B";
  if (score >= 63) return "C+";
  if (score >= 55) return "C";
  if (score >= 45) return "D";
  return "F";
}
