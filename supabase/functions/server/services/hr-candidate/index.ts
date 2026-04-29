/**
 * HR Candidate Analysis — Orchestrator
 *
 * Status: SKELETON (TODO bloklari implementatsiya kutilmoqda).
 * Owner: backend agent (next session).
 *
 * Responsibilities:
 *   1. Validate input (Zod) — schema mismatch → 400
 *   2. Run github_analyzer + cv_parser in parallel (Promise.allSettled, hard timeouts)
 *   3. Hard-fail if CV parse failed (no scoring possible without CV)
 *   4. Run candidate_scorer (3-retry exponential backoff, 12s timeout)
 *   5. Run report_generator (14s timeout)
 *   6. Assemble CandidateAnalysisResult, log to ai_messages, return
 *
 * SLA: total ≤ 25 s p50, hard timeout 30 s.
 * No persistence (MVP) — only in-memory.
 */

import type {
  AnalyzeRequest,
  CandidateAnalysisResult,
  CandidateAnalysisPayload,
  RawSignals,
  ErrorEnvelope,
} from "./types.ts";

import { fetchGithubSignals } from "./github-analyzer.ts";
import { parseCv } from "./cv-parser.ts";
import { scoreCandidate } from "./candidate-scorer.ts";
import { generateReport } from "./report-generator.ts";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function analyzeCandidate(
  input: AnalyzeRequest,
): Promise<CandidateAnalysisResult> {
  const requestId = ulid();
  const t0 = Date.now();

  try {
    // TODO: Zod validation — see ./schemas/candidate-analysis.schema.json
    //       Validate cv_mime, cv_file size (≤ 5 MB), github_input format, locale, analysis_depth.

    // -----------------------------------------------------------------------
    // Phase 1 — Parallel raw signal collection
    // -----------------------------------------------------------------------
    const [githubResult, cvResult] = await Promise.allSettled([
      withTimeout(fetchGithubSignals(input.github_input), 6_000, "GITHUB_UNAVAILABLE"),
      withTimeout(parseCv(input.cv_file, input.cv_mime, input.cv_filename), 5_000, "CV_PARSE_FAILED"),
    ]);

    // CV is required — bail if it failed
    if (cvResult.status === "rejected") {
      return errorResult(requestId, t0, input.locale, {
        code: "CV_PARSE_FAILED",
        message_uz: "CV faylni tahlil qilib bo'lmadi. Iltimos, boshqa fayl yuklang.",
        message_ja: "CV ファイルを解析できませんでした。別のファイルをお試しください。",
        message_en: "Could not parse the CV file. Please try a different file.",
        field: "cv_file",
      });
    }

    const signals: RawSignals = {
      github: githubResult.status === "fulfilled"
        ? githubResult.value
        : { fetch_status: "failed", error_reason: String(githubResult.reason) },
      cv: cvResult.value,
    };

    // -----------------------------------------------------------------------
    // Phase 2 — Scoring (Sonnet/Haiku based on analysis_depth)
    // -----------------------------------------------------------------------
    // TODO: retry with exponential backoff (3 attempts, base 500ms)
    const scores = await withTimeout(
      scoreCandidate(signals, input.job_description, input.locale, input.analysis_depth),
      12_000,
      "INTERNAL",
    );

    // -----------------------------------------------------------------------
    // Phase 3 — Report generation (always Sonnet, locale-aware)
    // -----------------------------------------------------------------------
    const report = await withTimeout(
      generateReport(signals, scores, input.job_description, input.locale),
      14_000,
      "INTERNAL",
    );

    // -----------------------------------------------------------------------
    // Phase 4 — Assemble payload
    // -----------------------------------------------------------------------
    const payload: CandidateAnalysisPayload = {
      ...scores,
      ...report,
      raw_signals: signals,
    };

    const status = signals.github.fetch_status === "failed" ? "degraded" : "ok";
    const duration = Date.now() - t0;

    // TODO: log to ai_messages table (request_id, tokens, cost_usd, duration)
    //       — see CLAUDE.md "Cost tracking" rule

    return {
      request_id: requestId,
      status,
      duration_ms: duration,
      locale: input.locale,
      result: payload,
    };
  } catch (err) {
    return errorResult(requestId, t0, input.locale, normalizeError(err));
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Wrap a promise with a hard timeout. On timeout the promise is rejected with
 * the given error code so the caller can map it to ErrorEnvelope.
 */
async function withTimeout<T>(p: Promise<T>, ms: number, code: string): Promise<T> {
  return await Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`TIMEOUT:${code}:${ms}ms`)), ms),
    ),
  ]);
}

function errorResult(
  requestId: string,
  startedAt: number,
  locale: AnalyzeRequest["locale"],
  error: ErrorEnvelope,
): CandidateAnalysisResult {
  return {
    request_id: requestId,
    status: "error",
    duration_ms: Date.now() - startedAt,
    locale,
    error,
  };
}

function normalizeError(err: unknown): ErrorEnvelope {
  // TODO: map known error shapes (TimeoutError, GithubError, CvParseError)
  //       to ErrorEnvelope codes. Default to INTERNAL.
  return {
    code: "INTERNAL",
    message_uz: "Ichki xato yuz berdi. Iltimos, biroz keyin qayta urinib ko'ring.",
    message_ja: "内部エラーが発生しました。しばらくしてから再度お試しください。",
    message_en: "An internal error occurred. Please try again shortly.",
  };
}

/**
 * ULID generator placeholder. Replace with proper ULID lib in implementation.
 * GitHub: https://github.com/ulid/javascript
 */
function ulid(): string {
  // TODO: use real ulid() — this is a temp shim
  const t = Date.now().toString(36).toUpperCase().padStart(10, "0");
  const r = Math.random().toString(36).slice(2, 18).toUpperCase().padEnd(16, "0");
  return (t + r).slice(0, 26);
}
