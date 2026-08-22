import type { LLMResponse } from "../llm-router.ts";
import type { ReportOutput } from "./report-generator.ts";
import type {
  CategoryScores,
  CvRole,
  InconsistencyFlag,
  InterviewQuestion,
} from "./types.ts";
import type {
  HrProviderStage,
  HrUsageReceipt,
  HrUsageRecordResult,
} from "./usage-accounting.ts";

const MAX_PROVIDER_JSON_CHARS = 65_536;
const MAX_PROVIDER_JSON_BYTES = 131_072;

export type CvSemanticOutput = {
  roles?: CvRole[];
  tech_skills?: string[];
  education?: { degree: string; institution: string; year: number | null }[];
  languages?: string[];
};

export type ScoringRefinementOutput = {
  category_scores: CategoryScores;
  inconsistency_flags: InconsistencyFlag[];
};

export type ReportNarrativeOutput = Pick<
  ReportOutput,
  "strengths" | "weaknesses" | "summary" | "interview_questions"
>;

export class HrProviderContractError extends Error {
  constructor(
    readonly code:
      | "INVALID_PROVIDER_OUTPUT"
      | "USAGE_ACCOUNTING_UNAVAILABLE",
    readonly stage: HrProviderStage,
  ) {
    super(`${code}:${stage}`);
    this.name = "HrProviderContractError";
  }
}

/**
 * A completed provider call is accounted before its untrusted output is
 * parsed. Invalid output still has a real token/cost receipt; an accounting
 * outage fails closed instead of returning untracked AI output.
 */
export async function accountAndValidateHrProviderOutput<T>(input: {
  stage: HrProviderStage;
  invoke: () => Promise<LLMResponse>;
  account: (
    stage: HrProviderStage,
    receipt: HrUsageReceipt,
  ) => Promise<HrUsageRecordResult>;
  validate: (rawOutput: string) => T;
}): Promise<T> {
  const response = await input.invoke();
  let accounting: HrUsageRecordResult;
  try {
    accounting = await input.account(input.stage, usageReceipt(response));
  } catch {
    throw new HrProviderContractError(
      "USAGE_ACCOUNTING_UNAVAILABLE",
      input.stage,
    );
  }
  if (accounting === "unavailable") {
    throw new HrProviderContractError(
      "USAGE_ACCOUNTING_UNAVAILABLE",
      input.stage,
    );
  }

  try {
    return input.validate(response.text);
  } catch (error) {
    if (error instanceof HrProviderContractError) throw error;
    throw new HrProviderContractError("INVALID_PROVIDER_OUTPUT", input.stage);
  }
}

function usageReceipt(response: LLMResponse): HrUsageReceipt {
  return {
    model: response.model,
    complexity: response.complexity,
    inputTokens: response.inputTokens,
    outputTokens: response.outputTokens,
    costUsd: response.costUsd,
    latencyMs: response.latencyMs,
    cached: response.cached,
  };
}

export function validateCvSemanticOutput(rawOutput: string): CvSemanticOutput {
  const value = parseProviderJson(rawOutput);
  assertExactKeys(value, [], [
    "roles",
    "tech_skills",
    "education",
    "languages",
  ]);
  if (Object.keys(value).length === 0) invalid();

  const result: CvSemanticOutput = {};
  if ("roles" in value) {
    result.roles = arrayOf(value.roles, 0, 20, validateCvRole);
  }
  if ("tech_skills" in value) {
    result.tech_skills = uniqueStrings(value.tech_skills, 0, 80, 1, 100);
  }
  if ("education" in value) {
    result.education = arrayOf(value.education, 0, 20, validateEducation);
  }
  if ("languages" in value) {
    result.languages = uniqueStrings(value.languages, 0, 20, 1, 80);
  }
  return result;
}

export function validateScoringRefinementOutput(
  rawOutput: string,
  hasJobDescription: boolean,
): ScoringRefinementOutput {
  const value = parseProviderJson(rawOutput);
  assertExactKeys(value, ["category_scores", "inconsistency_flags"]);
  const categoryScores = validateCategoryScores(
    value.category_scores,
    hasJobDescription,
  );
  const inconsistencyFlags = arrayOf(
    value.inconsistency_flags,
    0,
    12,
    validateInconsistencyFlag,
  );
  return {
    category_scores: categoryScores,
    inconsistency_flags: inconsistencyFlags,
  };
}

export function validateReportNarrativeOutput(
  rawOutput: string,
  roleFitIncluded: boolean,
): ReportNarrativeOutput {
  const value = parseProviderJson(rawOutput);
  assertExactKeys(value, [
    "strengths",
    "weaknesses",
    "summary",
    "interview_questions",
  ]);
  const strengths = uniqueStrings(value.strengths, 1, 6, 4, 240);
  const weaknesses = uniqueStrings(value.weaknesses, 0, 6, 4, 240);
  const summary = boundedString(value.summary, 50, 1_500);
  const interviewQuestions = arrayOf(
    value.interview_questions,
    5,
    12,
    validateInterviewQuestion,
  );
  assertQuestionCoverage(interviewQuestions, roleFitIncluded);

  return {
    strengths,
    weaknesses,
    summary,
    interview_questions: interviewQuestions,
  };
}

function parseProviderJson(rawOutput: string): Record<string, unknown> {
  if (
    typeof rawOutput !== "string" || rawOutput.length > MAX_PROVIDER_JSON_CHARS
  ) {
    invalid();
  }
  const trimmed = rawOutput.trim();
  const fenced = trimmed.match(/^```json\s*\n([\s\S]*?)\n```$/i);
  const json = fenced ? fenced[1].trim() : trimmed;
  if (
    !json || new TextEncoder().encode(json).byteLength > MAX_PROVIDER_JSON_BYTES
  ) {
    invalid();
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    invalid();
  }
  if (!isRecord(parsed)) invalid();
  return parsed;
}

function validateCategoryScores(
  value: unknown,
  hasJobDescription: boolean,
): CategoryScores {
  if (!isRecord(value)) invalid();
  assertExactKeys(value, [
    "tech_depth",
    "project_quality",
    "activity",
    "communication_docs",
    "cv_github_consistency",
    "role_fit",
  ]);
  const roleFit = value.role_fit;
  if (hasJobDescription ? roleFit === null : roleFit !== null) invalid();
  return {
    tech_depth: boundedInteger(value.tech_depth, 0, 100),
    project_quality: boundedInteger(value.project_quality, 0, 100),
    activity: boundedInteger(value.activity, 0, 100),
    communication_docs: boundedInteger(value.communication_docs, 0, 100),
    cv_github_consistency: boundedInteger(
      value.cv_github_consistency,
      0,
      100,
    ),
    role_fit: roleFit === null ? null : boundedInteger(roleFit, 0, 100),
  };
}

const FLAG_TYPES = new Set<InconsistencyFlag["type"]>([
  "stack_mismatch",
  "experience_gap",
  "title_inflation",
  "education_unverified",
  "timeline_conflict",
  "other",
]);
const FLAG_SEVERITIES = new Set<InconsistencyFlag["severity"]>([
  "low",
  "medium",
  "high",
]);

function validateInconsistencyFlag(value: unknown): InconsistencyFlag {
  if (!isRecord(value)) invalid();
  assertExactKeys(value, ["type", "severity", "explanation"]);
  if (!FLAG_TYPES.has(value.type as InconsistencyFlag["type"])) invalid();
  if (!FLAG_SEVERITIES.has(value.severity as InconsistencyFlag["severity"])) {
    invalid();
  }
  return {
    type: value.type as InconsistencyFlag["type"],
    severity: value.severity as InconsistencyFlag["severity"],
    explanation: boundedString(value.explanation, 10, 500),
  };
}

const QUESTION_CATEGORIES = new Set<InterviewQuestion["category"]>([
  "tech_depth",
  "project_quality",
  "activity",
  "communication_docs",
  "consistency",
  "role_fit",
  "behavioral",
]);

function validateInterviewQuestion(value: unknown): InterviewQuestion {
  if (!isRecord(value)) invalid();
  assertExactKeys(
    value,
    ["category", "question", "expected_signal"],
    ["linked_evidence"],
  );
  if (
    !QUESTION_CATEGORIES.has(value.category as InterviewQuestion["category"])
  ) {
    invalid();
  }
  return {
    category: value.category as InterviewQuestion["category"],
    question: boundedString(value.question, 15, 400),
    expected_signal: boundedString(value.expected_signal, 15, 400),
    ...(value.linked_evidence === undefined
      ? {}
      : { linked_evidence: boundedString(value.linked_evidence, 1, 200) }),
  };
}

function assertQuestionCoverage(
  questions: readonly InterviewQuestion[],
  roleFitIncluded: boolean,
): void {
  const categories = new Set(questions.map((question) => question.category));
  const required: InterviewQuestion["category"][] = [
    "tech_depth",
    "project_quality",
    "activity",
    "communication_docs",
    "consistency",
    "behavioral",
  ];
  if (roleFitIncluded) required.push("role_fit");
  if (required.some((category) => !categories.has(category))) invalid();
  if (!roleFitIncluded && categories.has("role_fit")) invalid();
}

function validateCvRole(value: unknown): CvRole {
  if (!isRecord(value)) invalid();
  assertExactKeys(
    value,
    ["title", "company", "start"],
    ["end", "duration_months"],
  );
  const start = yearMonth(value.start);
  const end = value.end === undefined || value.end === null
    ? value.end
    : yearMonth(value.end);
  const duration = value.duration_months === undefined
    ? undefined
    : boundedInteger(value.duration_months, 0, 1_200);
  return {
    title: boundedString(value.title, 1, 160),
    company: boundedString(value.company, 1, 200),
    start,
    ...(end === undefined ? {} : { end }),
    ...(duration === undefined ? {} : { duration_months: duration }),
  };
}

function validateEducation(
  value: unknown,
): { degree: string; institution: string; year: number | null } {
  if (!isRecord(value)) invalid();
  assertExactKeys(value, ["degree", "institution"], ["year"]);
  const year = value.year === undefined || value.year === null
    ? null
    : boundedInteger(value.year, 1900, 2200);
  return {
    degree: boundedString(value.degree, 1, 160),
    institution: boundedString(value.institution, 1, 200),
    year,
  };
}

function yearMonth(value: unknown): string {
  const result = boundedString(value, 7, 7);
  if (!/^\d{4}-(?:0[1-9]|1[0-2])$/.test(result)) invalid();
  return result;
}

function uniqueStrings(
  value: unknown,
  minimumItems: number,
  maximumItems: number,
  minimumLength: number,
  maximumLength: number,
): string[] {
  const values = arrayOf(
    value,
    minimumItems,
    maximumItems,
    (item) => boundedString(item, minimumLength, maximumLength),
  );
  if (
    new Set(values.map((item) => item.toLocaleLowerCase())).size !==
      values.length
  ) {
    invalid();
  }
  return values;
}

function arrayOf<T>(
  value: unknown,
  minimum: number,
  maximum: number,
  validate: (item: unknown) => T,
): T[] {
  if (
    !Array.isArray(value) || value.length < minimum || value.length > maximum
  ) {
    invalid();
  }
  return value.map(validate);
}

function boundedString(
  value: unknown,
  minimum: number,
  maximum: number,
): string {
  if (typeof value !== "string" || value !== value.trim()) invalid();
  const length = Array.from(value).length;
  if (length < minimum || length > maximum) invalid();
  return value;
}

function boundedInteger(
  value: unknown,
  minimum: number,
  maximum: number,
): number {
  if (
    typeof value !== "number" || !Number.isInteger(value) || value < minimum ||
    value > maximum
  ) invalid();
  return value;
}

function assertExactKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[] = [],
): void {
  const allowed = new Set([...required, ...optional]);
  if (required.some((key) => !(key in value))) invalid();
  if (Object.keys(value).some((key) => !allowed.has(key))) invalid();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function invalid(): never {
  throw new Error("INVALID_PROVIDER_OUTPUT");
}
