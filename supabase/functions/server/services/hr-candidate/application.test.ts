import type { SupabaseClient } from "npm:@supabase/supabase-js@2.49.8";
import {
  executeHrCandidateAnalysis,
  type HrCandidateApplicationDependencies,
  type HrCandidateApplicationInput,
} from "./application.ts";
import type { CandidateAnalysisResult } from "./types.ts";
import { HrProviderConfigurationError } from "./provider-stages.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEquals<T>(actual: T, expected: T, message: string): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${message}: expected ${JSON.stringify(expected)}, got ${
        JSON.stringify(actual)
      }`,
    );
  }
}

const REQUEST_ID = "01K36X8M3M0123456789ABCDEF";
const INPUT: HrCandidateApplicationInput = {
  apiKey: "test-provider-key",
  supabase: { rpc: () => undefined } as unknown as SupabaseClient,
  tenantId: "22222222-2222-4222-8222-222222222222",
  userId: "11111111-1111-4111-8111-111111111111",
  role: "HR",
  request: {
    github_input: "octocat",
    cv_file: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]),
    cv_mime: "application/pdf",
    cv_filename: "candidate.pdf",
    job_description: "Backend engineer",
    locale: "en",
    analysis_depth: "deep",
  },
};

const SUCCESS: CandidateAnalysisResult = {
  request_id: REQUEST_ID,
  status: "ok",
  duration_ms: 100,
  locale: "en",
  result: {
    overall_score: 80,
    grade: "B+",
    category_scores: {
      tech_depth: 80,
      project_quality: 80,
      activity: 80,
      communication_docs: 80,
      cv_github_consistency: 80,
      role_fit: 80,
    },
    strengths: ["Evidence"],
    weaknesses: [],
    inconsistency_flags: [],
    summary: "A sufficiently detailed candidate summary for the test result.",
    interview_questions: [],
    hiring_recommendation: {
      decision: "interview",
      confidence: 0.8,
      rationale: "Proceed.",
    },
    raw_signals: {
      github: { fetch_status: "complete" },
      cv: {
        filename: "candidate.pdf",
        format: "pdf",
        extracted_text_chars: 400,
        parse_status: "complete",
      },
    },
  },
};

function baseDependencies(
  calls: string[],
  analysis: CandidateAnalysisResult = SUCCESS,
): HrCandidateApplicationDependencies {
  let now = 1_000;
  return {
    requestId: () => REQUEST_ID,
    now: () => (now += 10),
    analysisTimeoutMs: 30_000,
    composeStages: () => {
      calls.push("compose");
      return {} as never;
    },
    createAnalyzer: (overrides = {}) => {
      calls.push(`create:${overrides.requestId?.()}`);
      return () => {
        calls.push("analyze");
        return Promise.resolve(analysis);
      };
    },
    executeQuota: async (
      _supabase: SupabaseClient,
      _tenantId: string,
      _userId: string,
      execute: () => Promise<CandidateAnalysisResult>,
    ) => {
      calls.push("reserve");
      const value = await execute();
      calls.push("release");
      return {
        ok: true as const,
        value,
        reservation: {
          ok: true as const,
          leaseId: "33333333-3333-4333-8333-333333333333",
          minuteRemaining: 4,
          dayRemaining: 40,
          policy: { concurrent: 1, per_minute: 5, per_day: 50 },
        },
      };
    },
  };
}

Deno.test("HR application shares one request ID across composition, analysis, and result", async () => {
  const calls: string[] = [];
  const result = await executeHrCandidateAnalysis(
    INPUT,
    baseDependencies(calls),
  );

  assertEquals(result.httpStatus, 200, "HTTP status");
  assertEquals(result.body.request_id, REQUEST_ID, "result request ID");
  assertEquals(result.quota, {
    minuteRemaining: 4,
    dayRemaining: 40,
  }, "quota metadata");
  assertEquals(calls, [
    "compose",
    `create:${REQUEST_ID}`,
    "reserve",
    "analyze",
    "release",
  ], "execution order");
});

Deno.test("HR application rejects role and input before composition or quota", async () => {
  for (
    const testCase of [{
      input: { ...INPUT, role: "MEMBER" },
      code: "FORBIDDEN_ROLE",
      status: 403,
    }, {
      input: {
        ...INPUT,
        request: { ...INPUT.request as object, github_input: "x/y" },
      },
      code: "INVALID_GITHUB_INPUT",
      status: 400,
    }]
  ) {
    const calls: string[] = [];
    const result = await executeHrCandidateAnalysis(
      testCase.input,
      baseDependencies(calls),
    );
    assertEquals(result.httpStatus, testCase.status, "HTTP error status");
    assertEquals(result.body.error?.code, testCase.code, "error code");
    assertEquals(calls, [], "no provider/quota work");
  }
});

Deno.test("HR application rejects unavailable provider configuration before quota", async () => {
  const calls: string[] = [];
  const dependencies = baseDependencies(calls);
  dependencies.composeStages = () => {
    calls.push("compose");
    throw new HrProviderConfigurationError(
      "PROVIDER_CONFIGURATION_UNAVAILABLE",
    );
  };

  const result = await executeHrCandidateAnalysis(INPUT, dependencies);

  assertEquals(result.httpStatus, 503, "configuration HTTP status");
  assertEquals(result.body.error?.code, "AI_UNAVAILABLE", "safe public code");
  assertEquals(calls, ["compose"], "quota not consumed");
});

Deno.test("HR application maps quota denial without running analysis", async () => {
  const calls: string[] = [];
  const dependencies = baseDependencies(calls);
  dependencies.executeQuota = () => {
    calls.push("reserve");
    return Promise.resolve({
      ok: false as const,
      reason: "minute" as const,
      retryAfterSeconds: 30,
      policy: { concurrent: 1, per_minute: 5, per_day: 50 },
    });
  };

  const result = await executeHrCandidateAnalysis(INPUT, dependencies);

  assertEquals(result.httpStatus, 429, "limit HTTP status");
  assertEquals(result.body.error?.code, "RATE_LIMITED", "limit code");
  assert(!calls.includes("analyze"), "analysis skipped");
});

Deno.test("HR application maps quota-unavailable denial to safe 503", async () => {
  const calls: string[] = [];
  const dependencies = baseDependencies(calls);
  dependencies.executeQuota = () =>
    Promise.resolve({
      ok: false as const,
      reason: "unavailable" as const,
      retryAfterSeconds: 0,
    });

  const result = await executeHrCandidateAnalysis(INPUT, dependencies);

  assertEquals(result.httpStatus, 503, "unavailable HTTP status");
  assertEquals(
    result.body.error?.code,
    "RATE_LIMIT_UNAVAILABLE",
    "unavailable code",
  );
  assert(!calls.includes("analyze"), "analysis skipped");
});

Deno.test("HR application maps quota infrastructure failure to safe 503", async () => {
  const calls: string[] = [];
  const dependencies = baseDependencies(calls);
  dependencies.executeQuota = () => Promise.reject(new Error("private DB"));

  const result = await executeHrCandidateAnalysis(INPUT, dependencies);

  assertEquals(result.httpStatus, 503, "quota HTTP status");
  assertEquals(
    result.body.error?.code,
    "RATE_LIMIT_UNAVAILABLE",
    "quota code",
  );
  assert(!JSON.stringify(result).includes("private DB"), "details hidden");
});

Deno.test("HR application maps analyzer timeout while preserving quota cleanup", async () => {
  const calls: string[] = [];
  const timeout: CandidateAnalysisResult = {
    request_id: REQUEST_ID,
    status: "error",
    duration_ms: 30_000,
    locale: "ja",
    error: {
      code: "TIMEOUT",
      message_uz: "Tahlil vaqti tugadi.",
      message_ja: "分析がタイムアウトしました。",
      message_en: "The analysis timed out.",
    },
  };
  const result = await executeHrCandidateAnalysis(
    { ...INPUT, request: { ...INPUT.request as object, locale: "ja" } },
    baseDependencies(calls, timeout),
  );

  assertEquals(result.httpStatus, 504, "timeout HTTP status");
  assertEquals(result.body.locale, "ja", "analysis locale");
  assertEquals(calls.at(-1), "release", "lease cleanup completed");
});

Deno.test("HR application maps analyzer provider failure to 503", async () => {
  const calls: string[] = [];
  const unavailable: CandidateAnalysisResult = {
    request_id: REQUEST_ID,
    status: "error",
    duration_ms: 100,
    locale: "en",
    error: {
      code: "AI_UNAVAILABLE",
      message_uz: "AI tahlil vaqtincha ishlamayapti.",
      message_ja: "AI分析は一時的に利用できません。",
      message_en: "AI analysis is temporarily unavailable.",
    },
  };
  const result = await executeHrCandidateAnalysis(
    INPUT,
    baseDependencies(calls, unavailable),
  );

  assertEquals(result.httpStatus, 503, "provider HTTP status");
  assertEquals(result.body.error?.code, "AI_UNAVAILABLE", "provider code");
  assertEquals(calls.at(-1), "release", "lease cleanup completed");
});

Deno.test("HR application enforces a global deadline and lets quota cleanup finish", async () => {
  const calls: string[] = [];
  let finishAnalysis: ((value: CandidateAnalysisResult) => void) | undefined;
  const dependencies = baseDependencies(calls);
  dependencies.analysisTimeoutMs = 5;
  dependencies.createAnalyzer = () => () =>
    new Promise<CandidateAnalysisResult>((resolve) => {
      calls.push("analyze-pending");
      finishAnalysis = resolve;
    });

  const result = await executeHrCandidateAnalysis(INPUT, dependencies);

  assertEquals(result.httpStatus, 504, "global deadline status");
  assertEquals(result.body.error?.code, "TIMEOUT", "global timeout code");
  assert(!calls.includes("release"), "active operation not released early");
  assert(finishAnalysis !== undefined, "analysis resolver captured");

  finishAnalysis(SUCCESS);
  await new Promise((resolve) => setTimeout(resolve, 0));
  assertEquals(calls.at(-1), "release", "background cleanup completed");
});
