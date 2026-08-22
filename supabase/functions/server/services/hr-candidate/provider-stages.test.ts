import type { LLMRequest, LLMResponse } from "../llm-router.ts";
import type { ScorerOutput } from "./candidate-scorer.ts";
import {
  createHrProviderStages,
  finalizeReportNarrative,
  finalizeScoringRefinement,
  HrProviderConfigurationError,
  mergeCvSemanticOutput,
} from "./provider-stages.ts";
import type { InterviewQuestion, Locale, RawSignals } from "./types.ts";
import type { HrProviderStage } from "./usage-accounting.ts";

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

const SIGNALS: RawSignals = {
  github: {
    primary_languages: [{ name: "TypeScript", percent: 100 }],
    pinned_repos: [{
      name: "tenant-api",
      stars: 4,
      primary_language: "TypeScript",
      has_readme: true,
      has_tests: true,
      has_ci: true,
      last_commit_at: "2026-08-01T00:00:00Z",
      is_fork: false,
      quality_score: 85,
    }],
    fetch_status: "complete",
  },
  cv: {
    filename: "candidate.pdf",
    format: "pdf",
    extracted_text_chars: 1_000,
    tech_skills: ["TypeScript"],
    parse_status: "partial",
    error_reason: "SEMANTIC_STRUCTURING_PENDING",
  },
};

const BASELINE: ScorerOutput = {
  overall_score: 70,
  grade: "B",
  category_scores: {
    tech_depth: 70,
    project_quality: 70,
    activity: 70,
    communication_docs: 70,
    cv_github_consistency: 70,
    role_fit: 70,
  },
  inconsistency_flags: [{
    type: "stack_mismatch",
    severity: "low",
    explanation: "Verify the observable stack difference in the interview.",
  }],
};

function receipt(text: string, request: LLMRequest): LLMResponse {
  return {
    text,
    model: request.complexity === "simple"
      ? "claude-haiku-4-5-20251001"
      : "claude-sonnet-4-6",
    complexity: request.complexity ?? "default",
    inputTokens: 100,
    outputTokens: 40,
    costUsd: 0.0009,
    latencyMs: 500,
    cached: false,
  };
}

function questions(includeRoleFit: boolean): InterviewQuestion[] {
  const categories: InterviewQuestion["category"][] = [
    "tech_depth",
    "project_quality",
    "activity",
    "communication_docs",
    "consistency",
  ];
  if (includeRoleFit) categories.push("role_fit");
  categories.push("behavioral");
  return categories.map((category) => ({
    category,
    question:
      `Explain the concrete ${category} evidence and trade-offs in detail.`,
    expected_signal:
      "A verifiable example with decisions, outcomes, and learning.",
    linked_evidence: `signal:${category}`,
  }));
}

Deno.test("HR provider stages select bounded models, scopes, and exact prompts", async () => {
  const calls: Array<{ apiKey: string; request: LLMRequest }> = [];
  const accounted: HrProviderStage[] = [];
  const outputs = [
    JSON.stringify({
      roles: [{
        title: "Backend Engineer",
        company: "Example",
        start: "2022-01",
        end: null,
      }],
    }),
    JSON.stringify({
      category_scores: {
        tech_depth: 80,
        project_quality: 75,
        activity: 70,
        communication_docs: 65,
        cv_github_consistency: 85,
        role_fit: 76,
      },
      inconsistency_flags: [],
    }),
    JSON.stringify({
      strengths: ["Strong public TypeScript project evidence."],
      weaknesses: ["Public activity evidence requires interview verification."],
      summary:
        "The supplied CV and public GitHub evidence support a structured technical interview without inferring private work.",
      interview_questions: questions(true),
    }),
  ];
  const stages = createHrProviderStages({
    apiKey: "test-provider-key",
    cacheScope: "tenant:11111111-1111-4111-8111-111111111111",
    account: (stage) => {
      accounted.push(stage);
      return Promise.resolve("recorded");
    },
    invoke: (apiKey, request) => {
      calls.push({ apiKey, request });
      return Promise.resolve(receipt(outputs[calls.length - 1], request));
    },
  });

  await stages.structureCv("A sufficiently detailed CV text", "uz");
  await stages.refineScoring(
    SIGNALS,
    "TypeScript backend engineer",
    "en",
    "deep",
  );
  await stages.refineReport(
    SIGNALS,
    BASELINE,
    "TypeScript backend engineer",
    "ja",
  );

  assertEquals(accounted, [
    "cv_semantic",
    "candidate_scoring",
    "report_generation",
  ], "accounting stages");
  assertEquals(
    calls.map((call) => call.request.complexity),
    ["simple", "analysis", "document"],
    "model policy",
  );
  assertEquals(
    calls.map((call) => call.request.maxTokens),
    [1_200, 1_800, 2_400],
    "token budgets",
  );
  assertEquals(
    calls.map((call) => call.request.timeoutMs),
    [10_000, 12_000, 14_000],
    "timeouts",
  );
  assert(
    calls.every((call) => call.apiKey === "test-provider-key"),
    "injected key",
  );
  assert(
    calls.every((call) =>
      call.request.cacheScope.startsWith("tenant:11111111-")
    ),
    "tenant cache scope",
  );
  assert(calls[0].request.systemPrompt?.includes("OUTPUT CONTRACT"), "system");
  assert(calls[0].request.message.startsWith("<untrusted_cv_json>"), "data");
});

Deno.test("HR fast scoring selects Haiku policy and enforces null role fit without JD", async () => {
  let captured: LLMRequest | undefined;
  const stages = createHrProviderStages({
    apiKey: "test-provider-key",
    cacheScope: "tenant:test",
    account: () => Promise.resolve("recorded"),
    invoke: (_apiKey, request) => {
      captured = request;
      return Promise.resolve(receipt(
        JSON.stringify({
          category_scores: {
            tech_depth: 60,
            project_quality: 60,
            activity: 60,
            communication_docs: 60,
            cv_github_consistency: 60,
            role_fit: null,
          },
          inconsistency_flags: [],
        }),
        request,
      ));
    },
  });

  const result = await stages.refineScoring(SIGNALS, undefined, "en", "fast");
  assertEquals(captured?.complexity, "simple", "fast policy");
  assertEquals(result.category_scores.role_fit, null, "null role fit");
});

Deno.test("HR provider configuration fails before invocation without secret or scope", () => {
  for (
    const config of [
      { apiKey: "", cacheScope: "tenant:test" },
      { apiKey: "test-provider-key", cacheScope: " bad-scope" },
    ]
  ) {
    let error: unknown;
    try {
      createHrProviderStages({
        ...config,
        account: () => Promise.resolve("recorded"),
      });
    } catch (caught) {
      error = caught;
    }
    assert(
      error instanceof HrProviderConfigurationError &&
        error.code === "PROVIDER_CONFIGURATION_UNAVAILABLE",
      "safe configuration error",
    );
  }
});

Deno.test("HR CV semantic merge preserves local metadata and completes parsing", () => {
  const merged = mergeCvSemanticOutput(SIGNALS.cv, {
    roles: [{
      title: "Backend Engineer",
      company: "Example",
      start: "2022-01",
      end: null,
    }],
    tech_skills: ["PostgreSQL", "typescript"],
    education: [{ degree: "BSc", institution: "Example", year: 2021 }],
    languages: ["English"],
  });

  assertEquals(merged.filename, "candidate.pdf", "local filename");
  assertEquals(merged.extracted_text_chars, 1_000, "local size");
  assertEquals(
    merged.tech_skills,
    ["TypeScript", "PostgreSQL"],
    "case-insensitive merge",
  );
  assertEquals(merged.parse_status, "complete", "semantic complete");
  assertEquals(merged.error_reason, undefined, "pending marker removed");
});

Deno.test("HR scoring finalization recomputes aggregate and preserves deterministic flags", () => {
  const result = finalizeScoringRefinement(BASELINE, {
    category_scores: {
      tech_depth: 90,
      project_quality: 80,
      activity: 70,
      communication_docs: 60,
      cv_github_consistency: 50,
      role_fit: 40,
    },
    inconsistency_flags: [{
      type: "timeline_conflict",
      severity: "medium",
      explanation: "Verify the supplied employment dates during the interview.",
    }],
  });

  assertEquals(result.overall_score, 69, "weighted aggregate");
  assertEquals(result.grade, "C+", "grade recomputed");
  assertEquals(result.inconsistency_flags.length, 2, "flags preserved");
});

for (const locale of ["uz", "ja", "en"] as Locale[]) {
  Deno.test(`HR report finalization keeps recommendation deterministic (${locale})`, () => {
    const summary = locale === "ja"
      ? "提供された公開根拠に基づき、構造化面接で技術判断と成果を確認する必要があります。"
      : locale === "uz"
      ? "Berilgan public dalilga ko'ra texnik qaror va natijalarni strukturali intervyuda tekshirish kerak."
      : "The supplied public evidence supports a structured interview to verify technical decisions and outcomes.";
    const result = finalizeReportNarrative(BASELINE, {
      strengths: ["TypeScript project evidence is available."],
      weaknesses: [],
      summary,
      interview_questions: questions(true),
    }, locale);

    assertEquals(
      result.hiring_recommendation.decision,
      "interview",
      "decision",
    );
    assertEquals(result.hiring_recommendation.rationale, summary, "rationale");
  });
}
