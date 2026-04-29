/**
 * Report Generator (Tool 4)
 *
 * Status: SKELETON (TODO bloklari implementatsiya kutilmoqda).
 * Owner: backend agent (next session).
 *
 * Responsibilities:
 *   • Take scoring output + raw signals + job description
 *   • Produce: strengths[], weaknesses[], narrative summary,
 *     interview_questions[] (5–12), hiring_recommendation
 *   • Locale-aware (uz / ja / en) — uses prompts.ts templates
 *
 * Model: Always Claude Sonnet 4 (high-quality narrative + reasoning).
 * Mode: Structured JSON output (the schema is the candidate-analysis result subset).
 *
 * Hiring decision rule (deterministic post-AI):
 *   overall_score >= 85   → strong_hire
 *   70 ≤ score < 85       → interview
 *   55 ≤ score < 70       → borderline
 *   score < 55            → do_not_proceed
 *   • Any high-severity inconsistency → step one bucket DOWN.
 */

import type {
  RawSignals,
  Locale,
  HiringRecommendation,
  InterviewQuestion,
} from "./types.ts";
import type { ScorerOutput } from "./candidate-scorer.ts";

export type ReportOutput = {
  strengths: string[];
  weaknesses: string[];
  summary: string;
  interview_questions: InterviewQuestion[];
  hiring_recommendation: HiringRecommendation;
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function generateReport(
  signals: RawSignals,
  scores: ScorerOutput,
  jobDescription: string | undefined,
  locale: Locale,
): Promise<ReportOutput> {
  // -------------------------------------------------------------------------
  // 1. Build prompt (locale-aware)
  // -------------------------------------------------------------------------
  // TODO: import prompts from ./prompts.ts and select by locale.
  //       Inject: signals digest, scores, optional jobDescription.

  // -------------------------------------------------------------------------
  // 2. Call Sonnet (structured JSON output)
  // -------------------------------------------------------------------------
  // TODO: call llm-router.callClaude({
  //         complexity: "document",       // ~2000 tokens out
  //         systemPrompt,
  //         message,
  //         responseFormat: "json",
  //       })
  //       Validate output (Zod) → narrativeBlock
  const narrativeBlock = await generateNarrativeBlock(signals, scores, jobDescription, locale);

  // -------------------------------------------------------------------------
  // 3. Apply deterministic hiring decision (consistent across runs)
  // -------------------------------------------------------------------------
  const recommendation = computeHiringRecommendation(
    scores.overall_score,
    scores.inconsistency_flags,
    narrativeBlock.summary,
    locale,
  );

  return {
    strengths: narrativeBlock.strengths,
    weaknesses: narrativeBlock.weaknesses,
    summary: narrativeBlock.summary,
    interview_questions: narrativeBlock.interview_questions,
    hiring_recommendation: recommendation,
  };
}

// ---------------------------------------------------------------------------
// Internal — Sonnet narrative
// ---------------------------------------------------------------------------

type NarrativeBlock = {
  strengths: string[];
  weaknesses: string[];
  summary: string;
  interview_questions: InterviewQuestion[];
};

async function generateNarrativeBlock(
  _signals: RawSignals,
  _scores: ScorerOutput,
  _jobDescription: string | undefined,
  _locale: Locale,
): Promise<NarrativeBlock> {
  // TODO: real Sonnet call. For now return empty stub.
  return {
    strengths: [],
    weaknesses: [],
    summary: "",
    interview_questions: [],
  };
}

// ---------------------------------------------------------------------------
// Hiring recommendation logic (deterministic)
// ---------------------------------------------------------------------------

export function computeHiringRecommendation(
  overall: number,
  flags: ScorerOutput["inconsistency_flags"],
  narrative: string,
  locale: Locale,
): HiringRecommendation {
  let bucket = decisionFromScore(overall);

  // Any high-severity inconsistency drops one bucket.
  const hasHighFlag = flags.some(f => f.severity === "high");
  if (hasHighFlag) bucket = stepDown(bucket);

  const confidence = computeConfidence(overall, flags);
  const rationale = narrative.slice(0, 500) || rationaleFallback(bucket, locale);

  return { decision: bucket, confidence, rationale };
}

function decisionFromScore(score: number): HiringRecommendation["decision"] {
  if (score >= 85) return "strong_hire";
  if (score >= 70) return "interview";
  if (score >= 55) return "borderline";
  return "do_not_proceed";
}

function stepDown(d: HiringRecommendation["decision"]): HiringRecommendation["decision"] {
  switch (d) {
    case "strong_hire": return "interview";
    case "interview":   return "borderline";
    case "borderline":  return "do_not_proceed";
    case "do_not_proceed": return "do_not_proceed";
  }
}

function computeConfidence(overall: number, flags: ScorerOutput["inconsistency_flags"]): number {
  // Distance from nearest decision boundary → confidence proxy
  const distances = [85, 70, 55].map(b => Math.abs(overall - b));
  const min = Math.min(...distances);
  let conf = Math.min(0.95, 0.55 + min / 50); // 0.55..0.95
  conf -= flags.filter(f => f.severity === "high").length * 0.1;
  return Number(Math.max(0.2, conf).toFixed(2));
}

function rationaleFallback(d: HiringRecommendation["decision"], locale: Locale): string {
  const M: Record<Locale, Record<HiringRecommendation["decision"], string>> = {
    uz: {
      strong_hire:    "Yuqori sifat va izchillik. Tezda intervyu va taklif qilish tavsiya etiladi.",
      interview:      "Yaxshi nomzod. Texnik intervyu o'tkazish va kuchli tomonlarini tekshirish kerak.",
      borderline:     "Aralash signal. Skrining intervyu va aniqlik kiritish tavsiya etiladi.",
      do_not_proceed: "Talablar bilan moslik past. Boshqa nomzodlarga ustunlik bering.",
    },
    ja: {
      strong_hire:    "高品質かつ整合性が高い。すぐに面接とオファーを推奨します。",
      interview:      "良い候補者。技術面接で強みを確認してください。",
      borderline:     "判断が難しい。スクリーニング面接で確認することを推奨します。",
      do_not_proceed: "要件との一致度が低い。他の候補者を優先してください。",
    },
    en: {
      strong_hire:    "High quality and consistency. Move fast to interview + offer.",
      interview:      "Promising candidate. Run a technical interview to verify strengths.",
      borderline:     "Mixed signals. Recommend a screening call before deciding.",
      do_not_proceed: "Low fit with the role. Prioritise other candidates.",
    },
  };
  return M[locale][d];
}
