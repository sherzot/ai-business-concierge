/**
 * HR Candidate Analysis — Orchestrator
 *
 * Status: PARTIAL. Provider-independent orchestration is implemented and
 * tested; deterministic scoring and evidence-linked reporting are implemented.
 * Injectable provider stages can refine all three phases while sanitized CV
 * text remains in-memory and outside the public result envelope.
 *
 * Responsibilities:
 *   1. Validate and normalize input before provider calls
 *   2. Run github_analyzer + cv_parser in parallel (Promise.allSettled, hard timeouts)
 *   3. Hard-fail if CV parse failed (no scoring possible without CV)
 *   4. Optionally structure the CV through an injected provider stage
 *   5. Run deterministic scoring and optional provider refinement
 *   6. Run deterministic report generation and optional provider refinement
 *   7. Assemble CandidateAnalysisResult without private semantic text
 *
 * SLA: total ≤ 25 s p50, hard timeout 30 s.
 * No persistence (MVP) — only in-memory.
 */

import type {
  AnalyzeRequest,
  CandidateAnalysisPayload,
  CandidateAnalysisResult,
  ErrorEnvelope,
  RawSignals,
} from "./types.ts";
import type { ScorerOutput } from "./candidate-scorer.ts";
import type { ReportOutput } from "./report-generator.ts";
import type { HrProviderStages } from "./provider-stages.ts";

import { fetchGithubSignals } from "./github-analyzer.ts";
import { parseCvForAnalysis } from "./cv-parser.ts";
import { scoreCandidate } from "./candidate-scorer.ts";
import { generateReport } from "./report-generator.ts";
import {
  finalizeReportNarrative,
  finalizeScoringRefinement,
  mergeCvSemanticOutput,
} from "./provider-stages.ts";
import { validateAnalyzeRequest } from "./request-boundary.ts";

type CandidateAnalyzerDependencies = {
  fetchGithubSignals: typeof fetchGithubSignals;
  parseCvForAnalysis: typeof parseCvForAnalysis;
  providerStages?: HrProviderStages;
  scoreCandidate: (
    signals: RawSignals,
    jobDescription: string | undefined,
    locale: AnalyzeRequest["locale"],
    depth: AnalyzeRequest["analysis_depth"],
  ) => Promise<ScorerOutput>;
  generateReport: (
    signals: RawSignals,
    scores: ScorerOutput,
    jobDescription: string | undefined,
    locale: AnalyzeRequest["locale"],
  ) => Promise<ReportOutput>;
  now: () => number;
  requestId: () => string;
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function createCandidateAnalyzer(
  overrides: Partial<CandidateAnalyzerDependencies> = {},
): (input: unknown) => Promise<CandidateAnalysisResult> {
  const dependencies: CandidateAnalyzerDependencies = {
    fetchGithubSignals,
    parseCvForAnalysis,
    scoreCandidate,
    generateReport,
    now: Date.now,
    requestId: createUlid,
    ...overrides,
  };

  return async (input: unknown): Promise<CandidateAnalysisResult> => {
    const requestId = dependencies.requestId();
    const startedAt = dependencies.now();
    const validation = validateAnalyzeRequest(input);
    if (!validation.ok) {
      return errorResult(
        requestId,
        startedAt,
        localeFromUnknown(input),
        validation.error,
        dependencies.now,
      );
    }
    const parsed = validation.value;

    try {
      // -----------------------------------------------------------------------
      // Phase 1 — Parallel raw signal collection
      // -----------------------------------------------------------------------
      const [githubResult, cvResult] = await Promise.allSettled([
        withTimeout(
          dependencies.fetchGithubSignals(parsed.github_input),
          6_000,
          "GITHUB_UNAVAILABLE",
        ),
        withTimeout(
          dependencies.parseCvForAnalysis(
            parsed.cv_file,
            parsed.cv_mime,
            parsed.cv_filename,
          ),
          5_000,
          "CV_PARSE_FAILED",
        ),
      ]);

      // CV is required — bail if it failed
      if (
        cvResult.status === "rejected" ||
        cvResult.value.signals.parse_status === "failed"
      ) {
        return errorResult(requestId, startedAt, parsed.locale, {
          code: "CV_PARSE_FAILED",
          message_uz:
            "CV faylni tahlil qilib bo'lmadi. Iltimos, boshqa fayl yuklang.",
          message_ja:
            "CV ファイルを解析できませんでした。別のファイルをお試しください。",
          message_en:
            "Could not parse the CV file. Please try a different file.",
          field: "cv_file",
        }, dependencies.now);
      }

      let cvSignals = cvResult.value.signals;
      if (dependencies.providerStages) {
        if (!cvResult.value.semanticText) {
          throw new Error("CV_SEMANTIC_INPUT_UNAVAILABLE");
        }
        const semantic = await withTimeout(
          dependencies.providerStages.structureCv(
            cvResult.value.semanticText,
            parsed.locale,
          ),
          10_000,
          "INTERNAL",
        );
        cvSignals = mergeCvSemanticOutput(cvSignals, semantic);
      }

      const signals: RawSignals = {
        github: githubResult.status === "fulfilled" ? githubResult.value : {
          fetch_status: "failed",
          error_reason: safeProviderFailureReason(githubResult.reason),
        },
        cv: cvSignals,
      };

      // -----------------------------------------------------------------------
      // Phase 2 — Scoring (Sonnet/Haiku based on analysis_depth)
      // -----------------------------------------------------------------------
      // TODO: retry with exponential backoff (3 attempts, base 500ms)
      const baselineScores = await withTimeout(
        dependencies.scoreCandidate(
          signals,
          parsed.job_description,
          parsed.locale,
          parsed.analysis_depth,
        ),
        12_000,
        "INTERNAL",
      );
      const scores = dependencies.providerStages
        ? finalizeScoringRefinement(
          baselineScores,
          await withTimeout(
            dependencies.providerStages.refineScoring(
              signals,
              parsed.job_description,
              parsed.locale,
              parsed.analysis_depth,
            ),
            12_000,
            "INTERNAL",
          ),
        )
        : baselineScores;

      // -----------------------------------------------------------------------
      // Phase 3 — Report generation (always Sonnet, locale-aware)
      // -----------------------------------------------------------------------
      const baselineReport = await withTimeout(
        dependencies.generateReport(
          signals,
          scores,
          parsed.job_description,
          parsed.locale,
        ),
        14_000,
        "INTERNAL",
      );
      const report = dependencies.providerStages
        ? finalizeReportNarrative(
          scores,
          await withTimeout(
            dependencies.providerStages.refineReport(
              signals,
              scores,
              parsed.job_description,
              parsed.locale,
            ),
            14_000,
            "INTERNAL",
          ),
          parsed.locale,
        )
        : baselineReport;

      // -----------------------------------------------------------------------
      // Phase 4 — Assemble payload
      // -----------------------------------------------------------------------
      const payload: CandidateAnalysisPayload = {
        ...scores,
        ...report,
        raw_signals: signals,
      };

      const status = signals.github.fetch_status === "failed"
        ? "degraded"
        : "ok";
      const duration = Math.max(0, dependencies.now() - startedAt);

      return {
        request_id: requestId,
        status,
        duration_ms: duration,
        locale: parsed.locale,
        result: payload,
      };
    } catch (err) {
      return errorResult(
        requestId,
        startedAt,
        parsed.locale,
        normalizeError(err),
        dependencies.now,
      );
    }
  };
}

const defaultCandidateAnalyzer = createCandidateAnalyzer();

export async function analyzeCandidate(
  input: AnalyzeRequest,
): Promise<CandidateAnalysisResult> {
  return await defaultCandidateAnalyzer(input);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Wrap a promise with a hard timeout. On timeout the promise is rejected with
 * the given error code so the caller can map it to ErrorEnvelope.
 */
async function withTimeout<T>(
  p: Promise<T>,
  ms: number,
  code: string,
): Promise<T> {
  return await new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`TIMEOUT:${code}:${ms}ms`)),
      ms,
    );
    p.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function errorResult(
  requestId: string,
  startedAt: number,
  locale: AnalyzeRequest["locale"],
  error: ErrorEnvelope,
  now: () => number = Date.now,
): CandidateAnalysisResult {
  return {
    request_id: requestId,
    status: "error",
    duration_ms: Math.max(0, now() - startedAt),
    locale,
    error,
  };
}

function normalizeError(err: unknown): ErrorEnvelope {
  const message = err instanceof Error ? err.message : String(err);
  if (message.startsWith("TIMEOUT:")) {
    return {
      code: "TIMEOUT",
      message_uz: "Tahlil vaqti tugadi. Iltimos, qayta urinib ko'ring.",
      message_ja: "分析がタイムアウトしました。もう一度お試しください。",
      message_en: "The analysis timed out. Please try again.",
    };
  }
  return {
    code: "INTERNAL",
    message_uz:
      "Ichki xato yuz berdi. Iltimos, biroz keyin qayta urinib ko'ring.",
    message_ja:
      "内部エラーが発生しました。しばらくしてから再度お試しください。",
    message_en: "An internal error occurred. Please try again shortly.",
  };
}

function safeProviderFailureReason(reason: unknown): string {
  const message = reason instanceof Error ? reason.message : String(reason);
  return /^[A-Z][A-Z0-9_:.-]{0,119}$/.test(message)
    ? message
    : "GITHUB_UNAVAILABLE";
}

function localeFromUnknown(input: unknown): AnalyzeRequest["locale"] {
  if (
    typeof input === "object" && input !== null &&
    "locale" in input &&
    (input.locale === "uz" || input.locale === "ja" || input.locale === "en")
  ) {
    return input.locale;
  }
  return "uz";
}

const CROCKFORD_BASE32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function createUlid(now = Date.now()): string {
  let timestamp = BigInt(Math.max(0, Math.trunc(now)));
  const timeChars = Array<string>(10);
  for (let index = timeChars.length - 1; index >= 0; index -= 1) {
    timeChars[index] = CROCKFORD_BASE32[Number(timestamp & 31n)];
    timestamp >>= 5n;
  }
  const random = crypto.getRandomValues(new Uint8Array(16));
  const randomChars = Array.from(
    random,
    (byte) => CROCKFORD_BASE32[byte & 31],
  ).join("");
  return `${timeChars.join("")}${randomChars}`;
}
