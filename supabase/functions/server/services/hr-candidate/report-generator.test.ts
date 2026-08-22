import {
  computeHiringRecommendation,
  generateReport,
} from "./report-generator.ts";
import type { ScorerOutput } from "./candidate-scorer.ts";
import type { RawSignals } from "./types.ts";

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
    roles: [{
      title: "Backend Engineer",
      company: "Example",
      start: "2022-01",
      end: null,
    }],
    parse_status: "complete",
  },
};

function scores(roleFit: number | null = 76): ScorerOutput {
  return {
    overall_score: 78,
    grade: "B+",
    category_scores: {
      tech_depth: 80,
      project_quality: 75,
      activity: 60,
      communication_docs: 50,
      cv_github_consistency: 85,
      role_fit: roleFit,
    },
    inconsistency_flags: [],
  };
}

Deno.test("deterministic report returns bounded evidence-linked content for every category", async () => {
  const result = await generateReport(
    SIGNALS,
    scores(),
    "TypeScript backend engineer",
    "en",
  );

  assert(
    result.strengths.length >= 3 && result.strengths.length <= 6,
    "strength bounds",
  );
  assert(
    result.weaknesses.length >= 1 && result.weaknesses.length <= 6,
    "gap bounds",
  );
  assert(
    result.summary.length > 50 && result.summary.length <= 1_500,
    "summary bounds",
  );
  assertEquals(
    result.interview_questions.length,
    7,
    "six categories plus behavioral",
  );
  assertEquals(
    result.interview_questions.map((item) => item.category),
    [
      "tech_depth",
      "project_quality",
      "activity",
      "communication_docs",
      "consistency",
      "role_fit",
      "behavioral",
    ],
    "question coverage",
  );
  assert(
    result.interview_questions.every((item) =>
      item.question && item.expected_signal && item.linked_evidence
    ),
    "every question is evidence-linked",
  );
  assertEquals(result.hiring_recommendation.decision, "interview", "decision");
  assertEquals(
    result.hiring_recommendation.rationale,
    result.summary,
    "summary rationale",
  );
});

Deno.test("report omits role-fit question without a job description", async () => {
  const result = await generateReport(SIGNALS, scores(null), undefined, "ja");

  assertEquals(
    result.interview_questions.length,
    6,
    "five categories plus behavioral",
  );
  assert(
    !result.interview_questions.some((item) => item.category === "role_fit"),
    "no unsupported role-fit question",
  );
  assert(result.summary.includes("決定論的分析"), "Japanese output");
});

Deno.test("high-severity evidence flag steps the hiring decision down exactly once", () => {
  const recommendation = computeHiringRecommendation(
    90,
    [{
      type: "timeline_conflict",
      severity: "high",
      explanation: "Conflicting dates require verification.",
    }, {
      type: "other",
      severity: "high",
      explanation: "A second high flag.",
    }],
    "",
    "uz",
  );

  assertEquals(recommendation.decision, "interview", "single bucket downgrade");
  assert(
    recommendation.confidence >= 0.2 && recommendation.confidence <= 0.95,
    "confidence bounds",
  );
  assert(recommendation.rationale.length > 20, "localized fallback rationale");
});

Deno.test("recommendation clamps invalid scores and narrative length", () => {
  const result = computeHiringRecommendation(
    Number.POSITIVE_INFINITY,
    [],
    `  ${"evidence ".repeat(100)}  `,
    "en",
  );

  assertEquals(result.decision, "do_not_proceed", "invalid score fails closed");
  assertEquals(result.rationale.length, 500, "rationale bound");
  assert(Number.isFinite(result.confidence), "finite confidence");
});

Deno.test("incomplete GitHub data is described as an evidence gap, not invented performance", async () => {
  const signals: RawSignals = {
    ...SIGNALS,
    github: { fetch_status: "failed", error_reason: "GITHUB_UNAVAILABLE" },
  };
  const result = await generateReport(signals, scores(null), undefined, "uz");

  assert(
    result.weaknesses.some((item) => item.includes("to'liq olinmagan")),
    "explicit unavailable-evidence caveat",
  );
  assert(result.summary.includes("failed"), "source status retained");
});

Deno.test("low evidence still satisfies the report schema without inventing a strength", async () => {
  const lowScores: ScorerOutput = {
    overall_score: 20,
    grade: "F",
    category_scores: {
      tech_depth: 20,
      project_quality: 15,
      activity: 10,
      communication_docs: 25,
      cv_github_consistency: 5,
      role_fit: null,
    },
    inconsistency_flags: [],
  };
  const result = await generateReport(
    {
      ...SIGNALS,
      github: { fetch_status: "complete", pinned_repos: [] },
    },
    lowScores,
    undefined,
    "en",
  );

  assertEquals(result.strengths.length, 1, "schema-required strength count");
  assert(
    result.strengths[0].includes("highest available evidence signal") &&
      result.strengths[0].includes("not presented as strong evidence"),
    "factual low-evidence fallback",
  );
  assert(
    result.interview_questions.every((item) =>
      item.question.length <= 400 && item.expected_signal.length <= 400
    ),
    "question schema bounds",
  );
});
