/**
 * Key-configured HR provider stages.
 *
 * This module owns prompt/model/cache/accounting/validation composition but
 * does not read secrets or construct database clients. The HTTP composition
 * root must inject a server-only API key and an accounting closure.
 */

import type { LLMRequest, LLMResponse } from "../llm-router.ts";
import {
  accountAndValidateHrProviderOutput,
  type CvSemanticOutput,
  type ReportNarrativeOutput,
  type ScoringRefinementOutput,
  validateCvSemanticOutput,
  validateReportNarrativeOutput,
  validateScoringRefinementOutput,
} from "./provider-contract.ts";
import {
  cvStructurePrompt,
  cvStructureUserPrompt,
  reportSystemPrompt,
  reportUserPrompt,
  scorerSystemPrompt,
  scorerUserPrompt,
} from "./prompts.ts";
import {
  computeHiringRecommendation,
  type ReportOutput,
} from "./report-generator.ts";
import {
  type ScorerOutput,
  toGrade,
  weightedOverall,
} from "./candidate-scorer.ts";
import type {
  AnalysisDepth,
  CvSignals,
  InconsistencyFlag,
  Locale,
  RawSignals,
} from "./types.ts";
import type {
  HrProviderStage,
  HrUsageReceipt,
  HrUsageRecordResult,
} from "./usage-accounting.ts";

export type HrProviderInvoke = (
  apiKey: string,
  request: LLMRequest,
) => Promise<LLMResponse>;

export type HrProviderStages = {
  structureCv: (cvText: string, locale: Locale) => Promise<CvSemanticOutput>;
  refineScoring: (
    signals: RawSignals,
    jobDescription: string | undefined,
    locale: Locale,
    depth: AnalysisDepth,
  ) => Promise<ScoringRefinementOutput>;
  refineReport: (
    signals: RawSignals,
    scores: ScorerOutput,
    jobDescription: string | undefined,
    locale: Locale,
  ) => Promise<ReportNarrativeOutput>;
};

export class HrProviderConfigurationError extends Error {
  constructor(readonly code: "PROVIDER_CONFIGURATION_UNAVAILABLE") {
    super(code);
    this.name = "HrProviderConfigurationError";
  }
}

export function createHrProviderStages(config: {
  apiKey: string;
  cacheScope: string;
  account: (
    stage: HrProviderStage,
    receipt: HrUsageReceipt,
  ) => Promise<HrUsageRecordResult>;
  invoke?: HrProviderInvoke;
}): HrProviderStages {
  const apiKey = requiredSecret(config.apiKey);
  const cacheScope = requiredScope(config.cacheScope);
  const invoke = config.invoke ?? defaultInvoke;

  const run = <T>(input: {
    stage: HrProviderStage;
    request: LLMRequest;
    validate: (rawOutput: string) => T;
  }): Promise<T> =>
    accountAndValidateHrProviderOutput({
      stage: input.stage,
      invoke: () => invoke(apiKey, input.request),
      account: config.account,
      validate: input.validate,
    });

  return {
    structureCv: (cvText, locale) =>
      run({
        stage: "cv_semantic",
        request: request({
          message: cvStructureUserPrompt(cvText),
          systemPrompt: cvStructurePrompt(locale),
          locale,
          complexity: "simple",
          cacheScope: `${cacheScope}:cv-semantic`,
          maxTokens: 1_200,
          timeoutMs: 10_000,
        }),
        validate: validateCvSemanticOutput,
      }),
    refineScoring: (signals, jobDescription, locale, depth) => {
      const hasJobDescription = hasText(jobDescription);
      return run({
        stage: "candidate_scoring",
        request: request({
          message: scorerUserPrompt(signals, jobDescription),
          systemPrompt: scorerSystemPrompt(locale),
          locale,
          complexity: depth === "fast" ? "simple" : "analysis",
          cacheScope: `${cacheScope}:candidate-scoring`,
          maxTokens: 1_800,
          timeoutMs: 12_000,
        }),
        validate: (rawOutput) =>
          validateScoringRefinementOutput(rawOutput, hasJobDescription),
      });
    },
    refineReport: (signals, scores, jobDescription, locale) => {
      const roleFitIncluded = scores.category_scores.role_fit !== null &&
        hasText(jobDescription);
      return run({
        stage: "report_generation",
        request: request({
          message: reportUserPrompt(signals, scores, jobDescription),
          systemPrompt: reportSystemPrompt(locale),
          locale,
          complexity: "document",
          cacheScope: `${cacheScope}:report-generation`,
          maxTokens: 2_400,
          timeoutMs: 14_000,
        }),
        validate: (rawOutput) =>
          validateReportNarrativeOutput(rawOutput, roleFitIncluded),
      });
    },
  };
}

export function mergeCvSemanticOutput(
  baseline: CvSignals,
  semantic: CvSemanticOutput,
): CvSignals {
  return {
    ...baseline,
    roles: semantic.roles ?? baseline.roles,
    tech_skills: mergeUnique(
      baseline.tech_skills,
      semantic.tech_skills,
      80,
    ),
    education: semantic.education ?? baseline.education,
    languages: mergeUnique(baseline.languages, semantic.languages, 20),
    parse_status: "complete",
    error_reason: undefined,
  };
}

export function finalizeScoringRefinement(
  baseline: ScorerOutput,
  refinement: ScoringRefinementOutput,
): ScorerOutput {
  const overall = weightedOverall(refinement.category_scores);
  return {
    overall_score: overall,
    grade: toGrade(overall),
    category_scores: refinement.category_scores,
    inconsistency_flags: mergeFlags(
      baseline.inconsistency_flags,
      refinement.inconsistency_flags,
    ),
  };
}

export function finalizeReportNarrative(
  scores: ScorerOutput,
  narrative: ReportNarrativeOutput,
  locale: Locale,
): ReportOutput {
  return {
    ...narrative,
    hiring_recommendation: computeHiringRecommendation(
      scores.overall_score,
      scores.inconsistency_flags,
      narrative.summary,
      locale,
    ),
  };
}

function request(input: LLMRequest): LLMRequest {
  return input;
}

const defaultInvoke: HrProviderInvoke = async (apiKey, llmRequest) => {
  const { callClaude } = await import("../llm-router.ts");
  return await callClaude(apiKey, llmRequest);
};

function requiredSecret(value: unknown): string {
  if (typeof value !== "string" || value.trim().length < 8) invalidConfig();
  return value.trim();
}

function requiredScope(value: unknown): string {
  if (
    typeof value !== "string" || value !== value.trim() || value.length < 1 ||
    value.length > 200 || Array.from(value).some((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return codePoint <= 0x1f || codePoint === 0x7f;
    })
  ) invalidConfig();
  return value;
}

function hasText(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function mergeUnique(
  preferred: string[] | undefined,
  fallback: string[] | undefined,
  maximum: number,
): string[] | undefined {
  const result: string[] = [];
  const seen = new Set<string>();
  for (const value of [...(preferred ?? []), ...(fallback ?? [])]) {
    const key = value.toLocaleLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(value);
    }
  }
  return result.length > 0 ? result.slice(0, maximum) : undefined;
}

function mergeFlags(
  baseline: InconsistencyFlag[],
  refinement: InconsistencyFlag[],
): InconsistencyFlag[] {
  const result: InconsistencyFlag[] = [];
  const seen = new Set<string>();
  for (const flag of [...baseline, ...refinement]) {
    const key = `${flag.type}:${flag.severity}:${flag.explanation}`
      .toLocaleLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(flag);
    }
  }
  return result.slice(0, 12);
}

function invalidConfig(): never {
  throw new HrProviderConfigurationError("PROVIDER_CONFIGURATION_UNAVAILABLE");
}
