/**
 * Provider-independent request and access boundary for HR Candidate Analysis.
 *
 * This module is pure: it performs no network/database work and does not log
 * uploaded content. HTTP adapters should authenticate the tenant first, then
 * call these guards before reserving quota or invoking any provider.
 */

import { normaliseGithubInput } from "./github-analyzer.ts";
import type { AnalyzeRequest, ErrorEnvelope } from "./types.ts";

const PDF_MIME = "application/pdf";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const MAX_CV_BYTES = 5 * 1024 * 1024;
const MAX_FILENAME_CHARS = 180;
const MAX_JOB_DESCRIPTION_CHARS = 5_000;

export const HR_CANDIDATE_ALLOWED_ROLES = [
  "hr",
  "manager",
  "company_admin",
  // Kept for active tenants created before company_admin replaced leader.
  "leader",
  "super_admin",
] as const;

export type HrCandidatePlan = "free" | "entrepreneur" | "business";

export type HrRateLimitPolicy = {
  concurrent: number;
  per_minute: number;
  per_day: number;
};

const RATE_LIMIT_POLICIES: Record<HrCandidatePlan, HrRateLimitPolicy> = {
  free: { concurrent: 1, per_minute: 1, per_day: 2 },
  entrepreneur: { concurrent: 2, per_minute: 5, per_day: 20 },
  business: { concurrent: 5, per_minute: 20, per_day: 100 },
};

export type AnalyzeRequestValidation =
  | { ok: true; value: AnalyzeRequest }
  | { ok: false; error: ErrorEnvelope };

export function isHrCandidateRoleAllowed(role: unknown): boolean {
  if (typeof role !== "string") return false;
  return (HR_CANDIDATE_ALLOWED_ROLES as readonly string[]).includes(
    role.trim().toLowerCase(),
  );
}

export function getHrRateLimitPolicy(plan: unknown): HrRateLimitPolicy | null {
  if (typeof plan !== "string") return null;
  const normalized = plan.trim().toLowerCase();
  const aliases: Record<string, HrCandidatePlan> = {
    free: "free",
    bepul: "free",
    entrepreneur: "entrepreneur",
    tadbirkor: "entrepreneur",
    business: "business",
    biznes: "business",
  };
  const canonical = aliases[normalized];
  return canonical ? { ...RATE_LIMIT_POLICIES[canonical] } : null;
}

export function validateAnalyzeRequest(
  input: unknown,
): AnalyzeRequestValidation {
  if (!isRecord(input)) {
    return invalidRequest(
      "Request body yaroqsiz.",
      "リクエスト本文が無効です。",
      "Invalid request body.",
    );
  }

  const githubInput = typeof input.github_input === "string"
    ? normaliseGithubInput(input.github_input)
    : null;
  if (!githubInput) {
    return invalid(
      "INVALID_GITHUB_INPUT",
      "GitHub username yoki exact profil URL kiriting.",
      "GitHubユーザー名または正確なプロフィールURLを入力してください。",
      "Enter a GitHub username or exact profile URL.",
      "github_input",
    );
  }

  if (
    !(input.cv_file instanceof Uint8Array) || input.cv_file.byteLength === 0
  ) {
    return invalid(
      "CV_PARSE_FAILED",
      "CV fayl majburiy.",
      "CVファイルが必要です。",
      "A CV file is required.",
      "cv_file",
    );
  }
  if (input.cv_file.byteLength > MAX_CV_BYTES) {
    return invalid(
      "CV_TOO_LARGE",
      "CV hajmi 5 MBdan oshmasligi kerak.",
      "CVは5 MB以下にしてください。",
      "CV must be 5 MB or smaller.",
      "cv_file",
    );
  }
  if (input.cv_mime !== PDF_MIME && input.cv_mime !== DOCX_MIME) {
    return invalid(
      "UNSUPPORTED_FILE_TYPE",
      "Faqat PDF yoki DOCX qabul qilinadi.",
      "PDFまたはDOCXのみ使用できます。",
      "Only PDF or DOCX is accepted.",
      "cv_file",
    );
  }

  if (
    typeof input.cv_filename !== "string" ||
    input.cv_filename.trim().length === 0 ||
    [...input.cv_filename].length > MAX_FILENAME_CHARS
  ) {
    return invalidRequest(
      "CV fayl nomi yaroqsiz.",
      "CVファイル名が無効です。",
      "Invalid CV filename.",
      "cv_filename",
    );
  }

  const jobDescription = input.job_description;
  if (jobDescription !== undefined && typeof jobDescription !== "string") {
    return invalidRequest(
      "Lavozim tavsifi matn bo'lishi kerak.",
      "求人説明は文字列で指定してください。",
      "Job description must be text.",
      "job_description",
    );
  }
  const normalizedJobDescription = jobDescription?.normalize("NFKC").trim();
  if (
    normalizedJobDescription &&
    [...normalizedJobDescription].length > MAX_JOB_DESCRIPTION_CHARS
  ) {
    return invalidRequest(
      "Lavozim tavsifi 5 000 belgidan oshmasligi kerak.",
      "求人説明は5,000文字以内にしてください。",
      "Job description must not exceed 5,000 characters.",
      "job_description",
    );
  }

  if (input.locale !== "uz" && input.locale !== "ja" && input.locale !== "en") {
    return invalidRequest(
      "Locale uz, ja yoki en bo'lishi kerak.",
      "Localeはuz、ja、enのいずれかです。",
      "Locale must be uz, ja, or en.",
      "locale",
    );
  }
  if (input.analysis_depth !== "fast" && input.analysis_depth !== "deep") {
    return invalidRequest(
      "Tahlil chuqurligi fast yoki deep bo'lishi kerak.",
      "分析深度はfastまたはdeepです。",
      "Analysis depth must be fast or deep.",
      "analysis_depth",
    );
  }

  return {
    ok: true,
    value: {
      github_input: githubInput,
      cv_file: input.cv_file.slice(),
      cv_mime: input.cv_mime,
      cv_filename: input.cv_filename,
      job_description: normalizedJobDescription || undefined,
      locale: input.locale,
      analysis_depth: input.analysis_depth,
    },
  };
}

function invalidRequest(
  messageUz: string,
  messageJa: string,
  messageEn: string,
  field?: string,
): AnalyzeRequestValidation {
  return invalid(
    "INVALID_REQUEST",
    messageUz,
    messageJa,
    messageEn,
    field,
  );
}

function invalid(
  code: ErrorEnvelope["code"],
  messageUz: string,
  messageJa: string,
  messageEn: string,
  field?: string,
): AnalyzeRequestValidation {
  return {
    ok: false,
    error: {
      code,
      message_uz: messageUz,
      message_ja: messageJa,
      message_en: messageEn,
      ...(field ? { field } : {}),
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
