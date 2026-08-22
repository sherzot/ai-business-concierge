import { createCandidateAnalyzer, createUlid } from "./index.ts";
import type {
  AnalyzeRequest,
  CvSignals,
  GithubSignals,
  RawSignals,
} from "./types.ts";
import type { ScorerOutput } from "./candidate-scorer.ts";
import type { ReportOutput } from "./report-generator.ts";
import type { HrProviderStages } from "./provider-stages.ts";

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

function request(overrides: Partial<AnalyzeRequest> = {}): AnalyzeRequest {
  return {
    github_input: "https://github.com/Octocat/",
    cv_file: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]),
    cv_mime: "application/pdf",
    cv_filename: "candidate.pdf",
    job_description: "Backend engineer",
    locale: "en",
    analysis_depth: "deep",
    ...overrides,
  };
}

const GITHUB: GithubSignals = {
  username: "Octocat",
  fetch_status: "complete",
};

const CV: CvSignals = {
  filename: "candidate.pdf",
  format: "pdf",
  extracted_text_chars: 400,
  parse_status: "partial",
  error_reason: "SEMANTIC_STRUCTURING_PENDING",
};

const SCORES: ScorerOutput = {
  overall_score: 78,
  grade: "B+",
  category_scores: {
    tech_depth: 80,
    project_quality: 75,
    activity: 70,
    communication_docs: 72,
    cv_github_consistency: 85,
    role_fit: 76,
  },
  inconsistency_flags: [],
};

const REPORT: ReportOutput = {
  strengths: ["Strong TypeScript evidence"],
  weaknesses: ["Limited public CI evidence"],
  summary: "Candidate evidence is consistent enough for a technical interview.",
  interview_questions: [{
    category: "tech_depth",
    question: "How did you design the service boundary in your main project?",
    expected_signal:
      "Explains tradeoffs, ownership, tests, and failure handling.",
  }],
  hiring_recommendation: {
    decision: "interview",
    confidence: 0.8,
    rationale: "Proceed to a structured technical interview.",
  },
};

function dependencies(
  overrides: Parameters<typeof createCandidateAnalyzer>[0] = {},
) {
  let now = 1_000;
  return {
    requestId: () => REQUEST_ID,
    now: () => (now += 25),
    fetchGithubSignals: (_input: string) => Promise.resolve(GITHUB),
    parseCvForAnalysis: (
      _file: Uint8Array,
      _mime: string,
      _filename: string,
    ) =>
      Promise.resolve({
        signals: CV,
        semanticText: "Sanitized candidate CV evidence for semantic analysis.",
      }),
    scoreCandidate: (
      _signals: RawSignals,
      _jobDescription: string | undefined,
      _locale: AnalyzeRequest["locale"],
      _depth: AnalyzeRequest["analysis_depth"],
    ) => Promise.resolve(SCORES),
    generateReport: (
      _signals: RawSignals,
      _scores: ScorerOutput,
      _jobDescription: string | undefined,
      _locale: AnalyzeRequest["locale"],
    ) => Promise.resolve(REPORT),
    ...overrides,
  };
}

Deno.test("orchestrator validates first and passes normalized data through the full flow", async () => {
  let githubInput = "";
  const analyze = createCandidateAnalyzer(dependencies({
    fetchGithubSignals: (input: string) => {
      githubInput = input;
      return Promise.resolve(GITHUB);
    },
  }));

  const result = await analyze(request());

  assertEquals(result.status, "ok", "success status");
  assertEquals(result.request_id, REQUEST_ID, "request ID");
  assertEquals(githubInput, "Octocat", "normalized GitHub input");
  assertEquals(result.result?.overall_score, 78, "scoring result");
  assertEquals(result.result?.raw_signals.cv, CV, "raw CV signals");
  assert(result.duration_ms >= 0, "non-negative duration");
});

Deno.test("orchestrator degrades on GitHub failure and continues with CV", async () => {
  let scoringCalls = 0;
  const analyze = createCandidateAnalyzer(dependencies({
    fetchGithubSignals: () => Promise.reject(new Error("provider unavailable")),
    scoreCandidate: () => {
      scoringCalls += 1;
      return Promise.resolve(SCORES);
    },
  }));

  const result = await analyze(request());

  assertEquals(result.status, "degraded", "degraded status");
  assertEquals(
    result.result?.raw_signals.github.fetch_status,
    "failed",
    "failed GitHub signal",
  );
  assertEquals(
    result.result?.raw_signals.github.error_reason,
    "GITHUB_UNAVAILABLE",
    "provider exception details are not exposed",
  );
  assertEquals(scoringCalls, 1, "scoring continues");
});

Deno.test("orchestrator hard-fails a fulfilled CV result with failed parse status", async () => {
  let scoringCalls = 0;
  const analyze = createCandidateAnalyzer(dependencies({
    parseCvForAnalysis: () =>
      Promise.resolve({
        signals: {
          ...CV,
          extracted_text_chars: 0,
          parse_status: "failed" as const,
          error_reason: "INVALID_PDF_SIGNATURE",
        },
      }),
    scoreCandidate: () => {
      scoringCalls += 1;
      return Promise.resolve(SCORES);
    },
  }));

  const result = await analyze(request());

  assertEquals(result.status, "error", "error status");
  assertEquals(result.error?.code, "CV_PARSE_FAILED", "safe CV error");
  assertEquals(scoringCalls, 0, "scoring not called");
});

Deno.test("orchestrator rejects invalid input before all provider work", async () => {
  let calls = 0;
  const analyze = createCandidateAnalyzer(dependencies({
    fetchGithubSignals: () => {
      calls += 1;
      return Promise.resolve(GITHUB);
    },
    parseCvForAnalysis: () => {
      calls += 1;
      return Promise.resolve({ signals: CV, semanticText: "private" });
    },
  }));

  const result = await analyze(request({ github_input: "octocat/repository" }));

  assertEquals(result.status, "error", "validation status");
  assertEquals(
    result.error?.code,
    "INVALID_GITHUB_INPUT",
    "validation code",
  );
  assertEquals(calls, 0, "no provider calls");
});

Deno.test("orchestrator passes sanitized CV text only through injected provider stages", async () => {
  const calls: string[] = [];
  const semanticText = "PRIVATE_SEMANTIC_CV_TEXT";
  let scoringCvStatus = "";
  let reportScore = 0;
  const providerStages: HrProviderStages = {
    structureCv: (text, locale) => {
      calls.push(`structure:${locale}`);
      assertEquals(text, semanticText, "in-memory semantic input");
      return Promise.resolve({
        roles: [{
          title: "Backend Engineer",
          company: "Example",
          start: "2022-01",
          end: null,
        }],
        tech_skills: ["PostgreSQL"],
      });
    },
    refineScoring: (signals, _jobDescription, locale, depth) => {
      calls.push(`score:${locale}:${depth}`);
      scoringCvStatus = signals.cv.parse_status;
      return Promise.resolve({
        category_scores: {
          tech_depth: 90,
          project_quality: 82,
          activity: 74,
          communication_docs: 80,
          cv_github_consistency: 88,
          role_fit: 86,
        },
        inconsistency_flags: [],
      });
    },
    refineReport: (_signals, scores, _jobDescription, locale) => {
      calls.push(`report:${locale}`);
      reportScore = scores.overall_score;
      return Promise.resolve({
        strengths: ["Strong evidence across the supplied sources."],
        weaknesses: ["Validate system ownership during the interview."],
        summary:
          "The bounded evidence supports a structured technical interview.",
        interview_questions: REPORT.interview_questions,
      });
    },
  };
  const analyze = createCandidateAnalyzer(dependencies({
    parseCvForAnalysis: () => Promise.resolve({ signals: CV, semanticText }),
    providerStages,
    scoreCandidate: (signals) => {
      calls.push("baseline-score");
      assertEquals(signals.cv.parse_status, "complete", "semantic CV merged");
      return Promise.resolve(SCORES);
    },
    generateReport: (_signals, scores) => {
      calls.push("baseline-report");
      assert(scores.overall_score !== SCORES.overall_score, "refined score");
      return Promise.resolve(REPORT);
    },
  }));

  const result = await analyze(request());

  assertEquals(result.status, "ok", "provider-refined status");
  assertEquals(calls, [
    "structure:en",
    "baseline-score",
    "score:en:deep",
    "baseline-report",
    "report:en",
  ], "provider stage order");
  assertEquals(scoringCvStatus, "complete", "refinement receives merged CV");
  assertEquals(reportScore, result.result?.overall_score, "report score");
  assertEquals(
    result.result?.raw_signals.cv.tech_skills,
    ["PostgreSQL"],
    "semantic CV signal merged",
  );
  assert(
    !JSON.stringify(result).includes(semanticText),
    "private semantic input never enters the result envelope",
  );
});

Deno.test("orchestrator fails closed when provider stages lack semantic CV input", async () => {
  let providerCalls = 0;
  const providerStages: HrProviderStages = {
    structureCv: () => {
      providerCalls += 1;
      return Promise.resolve({});
    },
    refineScoring: () => {
      providerCalls += 1;
      return Promise.reject(new Error("unexpected"));
    },
    refineReport: () => {
      providerCalls += 1;
      return Promise.reject(new Error("unexpected"));
    },
  };
  const analyze = createCandidateAnalyzer(dependencies({
    parseCvForAnalysis: () => Promise.resolve({ signals: CV }),
    providerStages,
  }));

  const result = await analyze(request());

  assertEquals(result.status, "error", "safe error status");
  assertEquals(result.error?.code, "INTERNAL", "safe public code");
  assertEquals(providerCalls, 0, "provider not called without semantic input");
});

Deno.test("orchestrator maps timeout-shaped failures to the public timeout envelope", async () => {
  const analyze = createCandidateAnalyzer(dependencies({
    scoreCandidate: () => Promise.reject(new Error("TIMEOUT:INTERNAL:12000ms")),
  }));

  const result = await analyze(request({ locale: "ja" }));

  assertEquals(result.status, "error", "timeout status");
  assertEquals(result.error?.code, "TIMEOUT", "timeout code");
  assertEquals(result.locale, "ja", "request locale preserved");
});

Deno.test("ULID generator always matches the canonical Crockford schema", () => {
  const first = createUlid(0);
  const second = createUlid(Date.parse("2026-08-21T00:00:00Z"));
  const pattern = /^[0-9A-HJKMNP-TV-Z]{26}$/;

  assert(pattern.test(first), `valid zero-time ULID: ${first}`);
  assert(pattern.test(second), `valid dated ULID: ${second}`);
  assert(first !== second, "different timestamp/random IDs");
});
