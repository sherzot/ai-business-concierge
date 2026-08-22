import {
  computeBaselineScores,
  detectInconsistencies,
  scoreCandidate,
  toGrade,
  weightedOverall,
} from "./candidate-scorer.ts";
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

function richSignals(): RawSignals {
  return {
    github: {
      account_age_years: 6,
      total_stars_received: 6,
      primary_languages: [
        { name: "TypeScript", percent: 60 },
        { name: "Python", percent: 25 },
        { name: "Go", percent: 15 },
      ],
      activity: {
        commits_last_year_estimate: 100,
        active_months_last_12: 9,
        longest_streak_days: 12,
      },
      repo_signals: {
        with_readme_pct: 80,
        with_tests_pct: 60,
        with_ci_cd_pct: 40,
        fork_to_original_ratio: 0.1,
      },
      pinned_repos: [
        repo("api", 4, 80),
        repo("worker", 2, 70),
        repo("cli", 0, 90),
      ],
      fetch_status: "complete",
    },
    cv: {
      filename: "candidate.pdf",
      format: "pdf",
      extracted_text_chars: 2_000,
      experience_years_total: 8,
      roles: [{
        title: "Senior Backend Engineer",
        company: "Example",
        start: "2018-01",
        end: null,
        duration_months: 96,
      }],
      tech_skills: ["TypeScript", "Python", "AWS"],
      parse_status: "complete",
    },
  };
}

function repo(name: string, stars: number, qualityScore: number) {
  return {
    name,
    stars,
    primary_language: "TypeScript",
    has_readme: true,
    has_tests: true,
    has_ci: true,
    last_commit_at: "2026-08-01T00:00:00Z",
    is_fork: false,
    quality_score: qualityScore,
  };
}

Deno.test("deterministic scorer applies the documented rubric and grade weights", async () => {
  const result = await scoreCandidate(
    richSignals(),
    "TypeScript, Python and Rust backend engineer",
    "en",
    "deep",
  );

  assertEquals(result.category_scores, {
    tech_depth: 95,
    project_quality: 69,
    activity: 90,
    communication_docs: 40,
    cv_github_consistency: 93,
    role_fit: 67,
  }, "category rubric");
  assertEquals(result.overall_score, 80, "weighted overall");
  assertEquals(result.grade, "B+", "grade");
  assertEquals(result.inconsistency_flags, [], "consistent evidence");
});

Deno.test("role fit is null without a job and neutral when no technology requirement is observable", () => {
  const signals = richSignals();
  const withoutJob = computeBaselineScores(signals);
  const generalJob = computeBaselineScores(
    signals,
    "Collaborative product engineer",
  );

  assertEquals(withoutJob.role_fit, null, "missing job description");
  assertEquals(generalJob.role_fit, 50, "no observable technology requirement");
  assertEquals(weightedOverall(withoutJob), 82, "null role weight omitted");
});

Deno.test("inconsistency flags require complete comparable evidence and are localized", () => {
  const signals = richSignals();
  signals.cv.tech_skills = ["Go"];
  signals.cv.experience_years_total = 6;
  signals.github.account_age_years = 1.5;
  signals.github.primary_languages = [
    { name: "TypeScript", percent: 96 },
    { name: "Go", percent: 4 },
  ];
  signals.github.activity!.active_months_last_12 = 1;
  signals.github.pinned_repos = [
    repo("one", 0, 10),
    repo("two", 0, 20),
    repo("three", 0, 15),
  ];

  const flags = detectInconsistencies(signals, "uz");
  assertEquals(
    flags.map((flag) => [flag.type, flag.severity]),
    [
      ["stack_mismatch", "medium"],
      ["experience_gap", "low"],
      ["title_inflation", "low"],
    ],
    "conservative flag set",
  );
  assert(
    flags.every((flag) => flag.explanation.length > 20),
    "localized explanations",
  );

  signals.github.fetch_status = "partial";
  assertEquals(
    detectInconsistencies(signals, "uz"),
    [],
    "partial GitHub evidence cannot produce flags",
  );
});

Deno.test("all category and aggregate outputs remain finite integers within schema bounds", () => {
  const signals = richSignals();
  signals.github.account_age_years = Number.POSITIVE_INFINITY;
  signals.github.total_stars_received = -10;
  signals.github.activity = {
    commits_last_year_estimate: Number.NaN,
    active_months_last_12: 999,
    longest_streak_days: -20,
  };
  signals.github.repo_signals = {
    with_readme_pct: 999,
    with_tests_pct: -1,
    with_ci_cd_pct: Number.NaN,
    fork_to_original_ratio: 99,
  };
  signals.github.pinned_repos = [
    repo("unbounded", Number.POSITIVE_INFINITY, 999),
  ];

  const scores = computeBaselineScores(signals, "Go backend engineer");
  for (const value of Object.values(scores)) {
    assert(
      value === null || (Number.isInteger(value) && value >= 0 && value <= 100),
      `bounded category score: ${value}`,
    );
  }

  assertEquals(
    weightedOverall({
      tech_depth: 200,
      project_quality: -1,
      activity: Number.NaN,
      communication_docs: Number.POSITIVE_INFINITY,
      cv_github_consistency: 50,
      role_fit: null,
    }),
    39,
    "aggregate clamps untrusted refinements",
  );
  assertEquals(toGrade(Number.POSITIVE_INFINITY), "F", "invalid grade input");
});
