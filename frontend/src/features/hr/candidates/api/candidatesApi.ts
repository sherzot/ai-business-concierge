/**
 * API client — POST /v1/hr/candidates/analyze
 *
 * The production route intentionally returns a typed 501 until provider
 * wiring is ready. Transport and response-shape failures still fail closed.
 */

import { API_BASE_URL } from "../../../../app/config";
import { supabase } from "../../../../shared/lib/supabase";
import type { AnalyzeFormInput, CandidateAnalysisResult } from "../types";

const ENDPOINT = `${API_BASE_URL}/hr/candidates/analyze`;
const REQUEST_TIMEOUT_MS = 40_000;

export type CandidateRequestErrorCode =
  | "AUTHENTICATION_REQUIRED"
  | "TENANT_REQUIRED"
  | "FORBIDDEN"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "CANCELLED"
  | "NETWORK_ERROR"
  | "REQUEST_FAILED"
  | "INVALID_RESPONSE";

export class CandidateRequestError extends Error {
  constructor(readonly code: CandidateRequestErrorCode) {
    super(code);
    this.name = "CandidateRequestError";
  }
}

type AnalyzeCandidateOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

export async function analyzeCandidate(
  input: AnalyzeFormInput,
  tenantId: string | undefined,
  options: AnalyzeCandidateOptions = {},
): Promise<CandidateAnalysisResult> {
  if (!tenantId?.trim()) {
    throw new CandidateRequestError("TENANT_REQUIRED");
  }

  let accessToken: string | undefined;
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (!error) accessToken = session?.access_token;
  } catch {
    // Provider/session details are intentionally hidden from the caller.
  }

  if (!accessToken) {
    throw new CandidateRequestError("AUTHENTICATION_REQUIRED");
  }

  const form = new FormData();
  form.append("github_input", input.githubInput);
  form.append("cv_file", input.cvFile, input.cvFile.name);
  if (input.jobDescription)
    form.append("job_description", input.jobDescription);
  form.append("locale", input.locale);
  form.append("analysis_depth", input.analysisDepth);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Accept-Language": input.locale,
    // Note: Content-Type yozilmaydi — multipart boundary'ni browser belgilaydi
  };
  headers["X-Tenant-Id"] = tenantId;

  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, options.timeoutMs ?? REQUEST_TIMEOUT_MS);
  const cancel = () => controller.abort();
  options.signal?.addEventListener("abort", cancel, { once: true });
  if (options.signal?.aborted) controller.abort();

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers,
      body: form,
      signal: controller.signal,
    });
    const json: unknown = await res.json().catch(() => null);
    if (isCandidateAnalysisResult(json)) return json;
    if (!res.ok)
      throw new CandidateRequestError(errorCodeForStatus(res.status));
    throw new CandidateRequestError("INVALID_RESPONSE");
  } catch (error) {
    if (error instanceof CandidateRequestError) throw error;
    if (isAbortError(error)) {
      throw new CandidateRequestError(timedOut ? "TIMEOUT" : "CANCELLED");
    }
    throw new CandidateRequestError("NETWORK_ERROR");
  } finally {
    window.clearTimeout(timeoutId);
    options.signal?.removeEventListener("abort", cancel);
  }
}

function isCandidateAnalysisResult(
  value: unknown,
): value is CandidateAnalysisResult {
  if (!isRecord(value)) return false;
  if (typeof value.request_id !== "string" || value.request_id.length === 0) {
    return false;
  }
  if (!isAnalysisStatus(value.status) || !isLocale(value.locale)) return false;
  if (typeof value.duration_ms !== "number" || value.duration_ms < 0) {
    return false;
  }
  if (value.status === "error") return isErrorEnvelope(value.error);
  return isCandidateAnalysisPayload(value.result);
}

function isCandidateAnalysisPayload(value: unknown): boolean {
  if (!isRecord(value)) return false;

  return (
    isScore(value.overall_score) &&
    isOneOf(value.grade, ["A+", "A", "B+", "B", "C+", "C", "D", "F"]) &&
    isCategoryScores(value.category_scores) &&
    isStringArray(value.strengths) &&
    isStringArray(value.weaknesses) &&
    isInconsistencyFlags(value.inconsistency_flags) &&
    typeof value.summary === "string" &&
    isInterviewQuestions(value.interview_questions) &&
    isHiringRecommendation(value.hiring_recommendation) &&
    isRawSignals(value.raw_signals)
  );
}

function isCategoryScores(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    isScore(value.tech_depth) &&
    isScore(value.project_quality) &&
    isScore(value.activity) &&
    isScore(value.communication_docs) &&
    isScore(value.cv_github_consistency) &&
    (value.role_fit === null || isScore(value.role_fit))
  );
}

function isInconsistencyFlags(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.every(
      (flag) =>
        isRecord(flag) &&
        isOneOf(flag.type, [
          "stack_mismatch",
          "experience_gap",
          "title_inflation",
          "education_unverified",
          "timeline_conflict",
          "other",
        ]) &&
        isOneOf(flag.severity, ["low", "medium", "high"]) &&
        typeof flag.explanation === "string",
    )
  );
}

function isInterviewQuestions(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.every(
      (question) =>
        isRecord(question) &&
        isOneOf(question.category, [
          "tech_depth",
          "project_quality",
          "activity",
          "communication_docs",
          "consistency",
          "role_fit",
          "behavioral",
        ]) &&
        typeof question.question === "string" &&
        typeof question.expected_signal === "string" &&
        (question.linked_evidence === undefined ||
          typeof question.linked_evidence === "string"),
    )
  );
}

function isHiringRecommendation(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    isOneOf(value.decision, [
      "strong_hire",
      "interview",
      "borderline",
      "do_not_proceed",
    ]) &&
    typeof value.confidence === "number" &&
    value.confidence >= 0 &&
    value.confidence <= 1 &&
    typeof value.rationale === "string"
  );
}

function isRawSignals(value: unknown): boolean {
  if (!isRecord(value) || !isRecord(value.github) || !isRecord(value.cv)) {
    return false;
  }

  return (
    isOneOf(value.github.fetch_status, ["complete", "partial", "failed"]) &&
    typeof value.cv.filename === "string" &&
    isOneOf(value.cv.format, ["pdf", "docx"]) &&
    isOneOf(value.cv.parse_status, ["complete", "partial", "failed"])
  );
}

function errorCodeForStatus(status: number): CandidateRequestErrorCode {
  if (status === 401) return "AUTHENTICATION_REQUIRED";
  if (status === 403) return "FORBIDDEN";
  if (status === 429) return "RATE_LIMITED";
  return "REQUEST_FAILED";
}

function isErrorEnvelope(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.code === "string" &&
    typeof value.message_uz === "string" &&
    typeof value.message_ja === "string" &&
    typeof value.message_en === "string"
  );
}

function isAnalysisStatus(value: unknown): boolean {
  return value === "ok" || value === "degraded" || value === "error";
}

function isLocale(value: unknown): boolean {
  return value === "uz" || value === "ja" || value === "en";
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function isScore(value: unknown): boolean {
  return (
    Number.isInteger(value) &&
    (value as number) >= 0 &&
    (value as number) <= 100
  );
}

function isStringArray(value: unknown): boolean {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function isOneOf<const T extends readonly unknown[]>(
  value: unknown,
  values: T,
): value is T[number] {
  return values.includes(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
