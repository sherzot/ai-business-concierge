import type { LLMResponse } from "../llm-router.ts";
import {
  accountAndValidateHrProviderOutput,
  HrProviderContractError,
  validateCvSemanticOutput,
  validateReportNarrativeOutput,
  validateScoringRefinementOutput,
} from "./provider-contract.ts";

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

function assertInvalid(run: () => unknown, message: string): void {
  let failed = false;
  try {
    run();
  } catch {
    failed = true;
  }
  assert(failed, message);
}

const RECEIPT: LLMResponse = {
  text: "{}",
  model: "claude-sonnet-4-6",
  complexity: "analysis",
  inputTokens: 100,
  outputTokens: 40,
  costUsd: 0.0009,
  latencyMs: 500,
  cached: false,
};

const CATEGORY_SCORES = {
  tech_depth: 80,
  project_quality: 75,
  activity: 70,
  communication_docs: 65,
  cv_github_consistency: 85,
  role_fit: 76,
};

Deno.test("scoring refinement accepts exact bounded JSON and an exact JSON fence", () => {
  const raw = JSON.stringify({
    category_scores: CATEGORY_SCORES,
    inconsistency_flags: [{
      type: "stack_mismatch",
      severity: "low",
      explanation: "Verify the public stack evidence in the interview.",
    }],
  });
  const plain = validateScoringRefinementOutput(raw, true);
  const fenced = validateScoringRefinementOutput(
    `\`\`\`json\n${raw}\n\`\`\``,
    true,
  );

  assertEquals(plain, fenced, "fenced and plain contract");
  assertEquals(plain.category_scores.role_fit, 76, "role fit");
});

Deno.test("scoring refinement rejects extra fields, fractional scores, and role-fit mismatch", () => {
  assertInvalid(
    () =>
      validateScoringRefinementOutput(
        JSON.stringify({
          category_scores: { ...CATEGORY_SCORES, tech_depth: 80.5 },
          inconsistency_flags: [],
        }),
        true,
      ),
    "fractional score",
  );
  assertInvalid(
    () =>
      validateScoringRefinementOutput(
        JSON.stringify({
          category_scores: { ...CATEGORY_SCORES, role_fit: null },
          inconsistency_flags: [],
          rationale: "untrusted extra field",
        }),
        true,
      ),
    "extra root field",
  );
  assertInvalid(
    () =>
      validateScoringRefinementOutput(
        JSON.stringify({
          category_scores: CATEGORY_SCORES,
          inconsistency_flags: [],
        }),
        false,
      ),
    "role fit without job description",
  );
});

function validQuestions() {
  return [
    "tech_depth",
    "project_quality",
    "activity",
    "communication_docs",
    "consistency",
    "role_fit",
    "behavioral",
  ].map((category) => ({
    category,
    question:
      `Explain the concrete ${category} evidence in this candidate profile.`,
    expected_signal:
      "A specific, verifiable example with trade-offs and outcomes.",
    linked_evidence: `signal:${category}`,
  }));
}

Deno.test("report narrative requires bounded evidence and complete category coverage", () => {
  const raw = JSON.stringify({
    strengths: ["Strong public TypeScript project evidence."],
    weaknesses: ["Public CI evidence is limited and needs verification."],
    summary:
      "The supplied CV and public GitHub evidence support a structured technical interview without inferring private work.",
    interview_questions: validQuestions(),
  });
  const result = validateReportNarrativeOutput(raw, true);
  assertEquals(result.interview_questions.length, 7, "question count");

  const missingBehavioral = {
    ...JSON.parse(raw),
    interview_questions: validQuestions().filter((item) =>
      item.category !== "behavioral"
    ),
  };
  assertInvalid(
    () =>
      validateReportNarrativeOutput(JSON.stringify(missingBehavioral), true),
    "behavioral coverage",
  );
  assertInvalid(
    () => validateReportNarrativeOutput(raw, false),
    "role-fit question without role-fit score",
  );
});

Deno.test("CV semantic output rejects invalid dates, duplicates, and unknown fields", () => {
  const valid = validateCvSemanticOutput(JSON.stringify({
    roles: [{
      title: "Backend Engineer",
      company: "Example",
      start: "2022-01",
      end: null,
      duration_months: 48,
    }],
    tech_skills: ["TypeScript", "PostgreSQL"],
    education: [{
      degree: "BSc",
      institution: "Example University",
      year: 2021,
    }],
    languages: ["Uzbek", "English"],
  }));
  assertEquals(valid.roles?.[0].start, "2022-01", "valid role date");

  assertInvalid(
    () =>
      validateCvSemanticOutput(
        '{"roles":[{"title":"Engineer","company":"X","start":"2022-13"}]}',
      ),
    "invalid month",
  );
  assertInvalid(
    () => validateCvSemanticOutput('{"tech_skills":["Go","go"]}'),
    "case-insensitive duplicate",
  );
  assertInvalid(
    () => validateCvSemanticOutput('{"name":"private person"}'),
    "unknown personal field",
  );
});

Deno.test("completed provider usage is accounted before output validation", async () => {
  const events: string[] = [];
  let accountedText = "";
  let error: unknown;
  try {
    await accountAndValidateHrProviderOutput({
      stage: "candidate_scoring",
      invoke: () => {
        events.push("invoke");
        return Promise.resolve({ ...RECEIPT, text: "invalid json" });
      },
      account: (_stage, response) => {
        events.push("account");
        accountedText = response.text;
        return Promise.resolve("recorded");
      },
      validate: (raw) => {
        events.push("validate");
        return validateScoringRefinementOutput(raw, true);
      },
    });
  } catch (caught) {
    error = caught;
  }

  assertEquals(events, ["invoke", "account", "validate"], "operation order");
  assert(accountedText === "invalid json", "same completed response accounted");
  assert(
    error instanceof HrProviderContractError &&
      error.code === "INVALID_PROVIDER_OUTPUT",
    "safe invalid-output error",
  );
});

Deno.test("accounting outage fails closed before provider output validation", async () => {
  let validationCalls = 0;
  let error: unknown;
  try {
    await accountAndValidateHrProviderOutput({
      stage: "report_generation",
      invoke: () => Promise.resolve(RECEIPT),
      account: () => Promise.resolve("unavailable"),
      validate: () => {
        validationCalls += 1;
        return "not reached";
      },
    });
  } catch (caught) {
    error = caught;
  }

  assert(validationCalls === 0, "unaccounted output cannot be validated");
  assert(
    error instanceof HrProviderContractError &&
      error.code === "USAGE_ACCOUNTING_UNAVAILABLE",
    "safe accounting error",
  );
});

Deno.test("provider failure does not create a usage receipt", async () => {
  let accountingCalls = 0;
  let failed = false;
  try {
    await accountAndValidateHrProviderOutput({
      stage: "cv_semantic",
      invoke: () => Promise.reject(new Error("provider unavailable")),
      account: () => {
        accountingCalls += 1;
        return Promise.resolve("recorded");
      },
      validate: validateCvSemanticOutput,
    });
  } catch {
    failed = true;
  }
  assert(failed, "provider failure propagates");
  assert(accountingCalls === 0, "no response means no usage receipt");
});

Deno.test("provider JSON is size-bounded and rejects surrounding prose", () => {
  assertInvalid(
    () => validateCvSemanticOutput(`Here is JSON: {"tech_skills":["Go"]}`),
    "surrounding prose",
  );
  assertInvalid(
    () => validateCvSemanticOutput("x".repeat(65_537)),
    "character bound",
  );
});
