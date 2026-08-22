/**
 * Application execution boundary for one HR Candidate request.
 *
 * This coordinates canonical context, pre-provider validation, provider-stage
 * composition, and the persistent quota lease without activating the HTTP
 * route. The same request ULID is used by the public result and usage records.
 */

import type { SupabaseClient } from "npm:@supabase/supabase-js@2.49.8";
import type { HrProviderInvoke } from "./provider-stages.ts";
import type {
  AnalyzeRequest,
  CandidateAnalysisResult,
  ErrorCode,
  ErrorEnvelope,
  Locale,
} from "./types.ts";
import { createCandidateAnalyzer, createUlid } from "./index.ts";
import { composeHrProviderStages } from "./provider-composition.ts";
import { HrProviderConfigurationError } from "./provider-stages.ts";
import {
  executeWithHrCandidateQuota,
  type HrQuotaExecutionResult,
} from "./quota.ts";
import {
  isHrCandidateRoleAllowed,
  validateAnalyzeRequest,
} from "./request-boundary.ts";

const DEFAULT_ANALYSIS_TIMEOUT_MS = 30_000;

type HttpStatus = 200 | 400 | 403 | 404 | 429 | 500 | 502 | 503 | 504;

export type HrCandidateApplicationResult = {
  httpStatus: HttpStatus;
  body: CandidateAnalysisResult;
  quota?: {
    minuteRemaining: number;
    dayRemaining: number;
  };
};

export type HrCandidateApplicationInput = {
  apiKey: string;
  supabase: SupabaseClient;
  tenantId: string;
  userId: string;
  role: string | undefined;
  request: unknown;
  invoke?: HrProviderInvoke;
};

export type ExecuteAnalysisQuota = (
  supabase: SupabaseClient,
  tenantId: string,
  userId: string,
  execute: () => Promise<CandidateAnalysisResult>,
) => Promise<HrQuotaExecutionResult<CandidateAnalysisResult>>;

export type HrCandidateApplicationDependencies = {
  requestId: () => string;
  now: () => number;
  analysisTimeoutMs: number;
  composeStages: typeof composeHrProviderStages;
  createAnalyzer: typeof createCandidateAnalyzer;
  executeQuota: ExecuteAnalysisQuota;
};

export async function executeHrCandidateAnalysis(
  input: HrCandidateApplicationInput,
  overrides: Partial<HrCandidateApplicationDependencies> = {},
): Promise<HrCandidateApplicationResult> {
  const dependencies: HrCandidateApplicationDependencies = {
    requestId: createUlid,
    now: Date.now,
    analysisTimeoutMs: DEFAULT_ANALYSIS_TIMEOUT_MS,
    composeStages: composeHrProviderStages,
    createAnalyzer: createCandidateAnalyzer,
    executeQuota: (supabase, tenantId, userId, execute) =>
      executeWithHrCandidateQuota(
        supabase,
        tenantId,
        userId,
        () => execute(),
      ),
    ...overrides,
  };
  const requestId = dependencies.requestId();
  const startedAt = dependencies.now();
  const locale = localeFromUnknown(input.request);

  if (!isHrCandidateRoleAllowed(input.role)) {
    return errorApplicationResult(
      403,
      requestId,
      startedAt,
      locale,
      errorEnvelope("FORBIDDEN_ROLE"),
      dependencies.now,
    );
  }

  const validation = validateAnalyzeRequest(input.request);
  if (!validation.ok) {
    return errorApplicationResult(
      400,
      requestId,
      startedAt,
      locale,
      validation.error,
      dependencies.now,
    );
  }

  let analyze: (request: AnalyzeRequest) => Promise<CandidateAnalysisResult>;
  try {
    const providerStages = dependencies.composeStages({
      apiKey: input.apiKey,
      supabase: input.supabase,
      context: {
        tenantId: input.tenantId,
        userId: input.userId,
        requestId,
      },
      invoke: input.invoke,
    });
    analyze = dependencies.createAnalyzer({
      providerStages,
      requestId: () => requestId,
    });
  } catch (error) {
    const configurationUnavailable = error instanceof
      HrProviderConfigurationError;
    return errorApplicationResult(
      configurationUnavailable ? 503 : 500,
      requestId,
      startedAt,
      validation.value.locale,
      errorEnvelope(
        configurationUnavailable ? "AI_UNAVAILABLE" : "INTERNAL",
        configurationUnavailable ? "provider_unavailable" : "internal",
      ),
      dependencies.now,
    );
  }

  let execution: HrQuotaExecutionResult<CandidateAnalysisResult>;
  try {
    execution = await withApplicationDeadline(
      dependencies.executeQuota(
        input.supabase,
        input.tenantId,
        input.userId,
        () => analyze(validation.value),
      ),
      dependencies.analysisTimeoutMs,
    );
  } catch (error) {
    if (error instanceof HrApplicationDeadlineError) {
      return errorApplicationResult(
        504,
        requestId,
        startedAt,
        validation.value.locale,
        timeoutEnvelope(),
        dependencies.now,
      );
    }
    return errorApplicationResult(
      503,
      requestId,
      startedAt,
      validation.value.locale,
      errorEnvelope("RATE_LIMIT_UNAVAILABLE"),
      dependencies.now,
    );
  }

  if (!execution.ok) {
    const unavailable = execution.reason === "unavailable";
    return errorApplicationResult(
      unavailable ? 503 : 429,
      requestId,
      startedAt,
      validation.value.locale,
      errorEnvelope(
        unavailable ? "RATE_LIMIT_UNAVAILABLE" : "RATE_LIMITED",
      ),
      dependencies.now,
    );
  }

  return {
    httpStatus: httpStatusForAnalysis(execution.value),
    body: execution.value,
    quota: {
      minuteRemaining: execution.reservation.minuteRemaining,
      dayRemaining: execution.reservation.dayRemaining,
    },
  };
}

class HrApplicationDeadlineError extends Error {
  constructor() {
    super("HR_ANALYSIS_DEADLINE_EXCEEDED");
    this.name = "HrApplicationDeadlineError";
  }
}

async function withApplicationDeadline<T>(
  operation: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  const boundedTimeout = Number.isFinite(timeoutMs)
    ? Math.max(1, Math.min(Math.trunc(timeoutMs), 30_000))
    : DEFAULT_ANALYSIS_TIMEOUT_MS;
  return await new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new HrApplicationDeadlineError()),
      boundedTimeout,
    );
    operation.then(
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

function errorApplicationResult(
  httpStatus: HttpStatus,
  requestId: string,
  startedAt: number,
  locale: Locale,
  error: ErrorEnvelope,
  now: () => number,
): HrCandidateApplicationResult {
  return {
    httpStatus,
    body: {
      request_id: requestId,
      status: "error",
      duration_ms: Math.max(0, now() - startedAt),
      locale,
      error,
    },
  };
}

function errorEnvelope(
  code: ErrorCode,
  variant: "default" | "provider_unavailable" | "internal" = "default",
): ErrorEnvelope {
  if (variant === "provider_unavailable") {
    return {
      code,
      message_uz: "AI tahlil vaqtincha ishlamayapti.",
      message_ja: "AI分析は一時的に利用できません。",
      message_en: "AI analysis is temporarily unavailable.",
    };
  }
  if (variant === "internal") {
    return {
      code,
      message_uz: "Ichki xato yuz berdi. Iltimos, keyinroq urinib ko'ring.",
      message_ja: "内部エラーが発生しました。後でもう一度お試しください。",
      message_en: "An internal error occurred. Please try again later.",
    };
  }
  switch (code) {
    case "FORBIDDEN_ROLE":
      return {
        code,
        message_uz: "Bu tahlil uchun HR, manager yoki admin roli kerak.",
        message_ja: "この分析にはHR、manager、またはadmin権限が必要です。",
        message_en: "This analysis requires an HR, manager, or admin role.",
      };
    case "RATE_LIMITED":
      return {
        code,
        message_uz: "So'rov limiti tugadi. Keyinroq qayta urinib ko'ring.",
        message_ja: "リクエスト上限に達しました。後でもう一度お試しください。",
        message_en: "The request limit was reached. Please try again later.",
      };
    case "RATE_LIMIT_UNAVAILABLE":
      return {
        code,
        message_uz: "So'rov limitini tekshirib bo'lmadi.",
        message_ja: "リクエスト上限を確認できませんでした。",
        message_en: "The request limit could not be verified.",
      };
    default:
      return errorEnvelope("INTERNAL", "internal");
  }
}

function timeoutEnvelope(): ErrorEnvelope {
  return {
    code: "TIMEOUT",
    message_uz: "Tahlil 30 soniyalik limitdan oshdi. Qayta urinib ko'ring.",
    message_ja: "分析が30秒の上限を超えました。もう一度お試しください。",
    message_en: "The analysis exceeded the 30-second limit. Please try again.",
  };
}

function httpStatusForAnalysis(result: CandidateAnalysisResult): HttpStatus {
  if (result.status !== "error") return 200;
  switch (result.error?.code) {
    case "INVALID_REQUEST":
    case "INVALID_GITHUB_INPUT":
    case "CV_PARSE_FAILED":
    case "CV_TOO_LARGE":
    case "UNSUPPORTED_FILE_TYPE":
      return 400;
    case "FORBIDDEN_ROLE":
      return 403;
    case "GITHUB_USER_NOT_FOUND":
      return 404;
    case "RATE_LIMITED":
      return 429;
    case "GITHUB_UNAVAILABLE":
      return 502;
    case "RATE_LIMIT_UNAVAILABLE":
    case "AI_UNAVAILABLE":
      return 503;
    case "TIMEOUT":
      return 504;
    default:
      return 500;
  }
}

function localeFromUnknown(input: unknown): Locale {
  if (
    typeof input === "object" && input !== null && "locale" in input &&
    (input.locale === "uz" || input.locale === "ja" || input.locale === "en")
  ) {
    return input.locale;
  }
  return "uz";
}
