/**
 * Locale-aware prompts for HR Candidate Analysis.
 *
 * Status: SKELETON — final wording will be tuned with 10+ test fixtures
 *         during the implementation session.
 *
 * Owner: backend agent. Each prompt is a function so callers can inject
 *        runtime context (signals, scores, job description) safely.
 */

import type { Locale } from "./types.ts";

// ---------------------------------------------------------------------------
// CV structuring (Haiku, cheap, ~500 tokens)
// ---------------------------------------------------------------------------

export function cvStructurePrompt(locale: Locale): string {
  // TODO: refine with parser examples + JSON schema reference
  const intro: Record<Locale, string> = {
    uz: "Sen CV matnidan strukturali ma'lumot olib chiqasan.",
    ja: "あなたは CV テキストから構造化データを抽出するアシスタントです。",
    en: "You extract structured data from CV text.",
  };
  return `${intro[locale]}

Output ONLY valid JSON matching this shape (no prose, no markdown):
{
  "roles":      [{"title": str, "company": str, "start": "YYYY-MM", "end": "YYYY-MM"|null, "duration_months": int}],
  "tech_skills": [str],
  "education":  [{"degree": str, "institution": str, "year": int|null}],
  "languages":  [str]
}

Rules:
  • Skills must be canonical names (e.g. "TypeScript" not "typescript", "PostgreSQL" not "postgres").
  • Date format strictly YYYY-MM. If only a year is given, use the first month (YYYY-01).
  • Currently-held role: end = null.
  • Don't invent missing fields; omit them or set null.`;
}

// ---------------------------------------------------------------------------
// Candidate scoring (Sonnet/Haiku, "analysis" complexity for deep)
// ---------------------------------------------------------------------------

export function scorerSystemPrompt(locale: Locale): string {
  // TODO: refine rubric wording. For now a compact baseline.
  const intro: Record<Locale, string> = {
    uz: "Sen texnik HR analitiksan. GitHub va CV signal larini birlashtirib nomzodni 6 kategoriya bo'yicha 0–100 ball bilan baholaysan.",
    ja: "あなたは技術系 HR アナリストです。GitHub と CV のシグナルを組み合わせ、候補者を 6 カテゴリで 0〜100 点で評価します。",
    en: "You are a technical HR analyst. Combine GitHub + CV signals to score the candidate across 6 categories on a 0–100 scale.",
  };
  return `${intro[locale]}

Categories: tech_depth, project_quality, activity, communication_docs, cv_github_consistency, role_fit.

Hard rules:
  • Use ONLY the signals provided. Never speculate.
  • role_fit: if no job_description is given, return null.
  • Output ONLY JSON: {"category_scores": {...}, "inconsistency_flags": [{"type":..., "severity":..., "explanation":...}]}.
  • Bias guard: do NOT consider name, gender, age, country of origin, or photos.

Bias-aware reasoning:
  • Two candidates with identical technical signals must score the same regardless of name spelling, school prestige, or company logos.`;
}

// ---------------------------------------------------------------------------
// Report generation (Sonnet, "document" complexity)
// ---------------------------------------------------------------------------

export function reportSystemPrompt(locale: Locale): string {
  // TODO: refine length, voice, examples per locale
  const intro: Record<Locale, string> = {
    uz: "Sen technical recruiter uchun nomzod hisobotini tayyorlaysan. Tilingiz aniq, qisqa, va ish kontekstiga bog'langan.",
    ja: "あなたは技術系リクルーター向けの候補者レポートを作成します。簡潔で正確、業務文脈に紐づいた言葉で書いてください。",
    en: "You write a candidate report for a technical recruiter. Be concise, precise, tied to evidence.",
  };
  return `${intro[locale]}

Output ONLY JSON: {
  "strengths": [<= 6 short bullets, each tied to a specific repo or CV item>],
  "weaknesses": [<= 6 short bullets, factual, no judgmental tone>],
  "summary": "<= 1500 chars narrative",
  "interview_questions": [
    {"category": "tech_depth"|..., "question": "...", "expected_signal": "...", "linked_evidence": "pinned_repo:foo"|"cv_role:..."}
  ]
}

Interview question rules:
  • 5–12 questions, at least 1 per non-null category + at least 1 behavioral.
  • Every question references a concrete signal (repo, commit pattern, CV role).
  • No yes/no questions. No generic puzzles.
  • expected_signal explains what a strong answer SOUNDS like (so any interviewer can grade).

Style:
  • In ${locale}: ${locale === "uz" ? "muloyim, formal-neytral" : locale === "ja" ? "敬体（です・ます）" : "professional, neutral"}.`;
}
