import type { SupabaseClient } from "npm:@supabase/supabase-js@2.49.8";
import type { LLMResponse } from "../llm-router.ts";

export type HrProviderStage =
  | "cv_semantic"
  | "candidate_scoring"
  | "report_generation";

export type HrUsageContext = {
  tenantId: string;
  userId: string;
  requestId: string;
};

export type HrUsageRecordResult = "recorded" | "duplicate" | "unavailable";

/**
 * Persists one already-completed Claude call and its token counter atomically.
 * The PostgreSQL RPC owns idempotency, tenant membership, and numeric bounds.
 */
export async function recordHrProviderUsage(
  supabase: SupabaseClient,
  context: HrUsageContext,
  stage: HrProviderStage,
  response: LLMResponse,
): Promise<HrUsageRecordResult> {
  if (!isSafeUsage(context, response)) return "unavailable";

  try {
    const { data, error } = await supabase.rpc("record_hr_candidate_ai_usage", {
      p_tenant_id: context.tenantId,
      p_user_id: context.userId,
      p_request_id: context.requestId,
      p_stage: stage,
      p_model: response.model,
      p_complexity: response.complexity,
      p_prompt_tokens: response.inputTokens,
      p_completion_tokens: response.outputTokens,
      p_cost_usd: response.costUsd,
      p_cached: response.cached,
      p_latency_ms: response.latencyMs,
    });
    if (error || typeof data !== "boolean") {
      console.error("hr-candidate usage accounting unavailable");
      return "unavailable";
    }
    return data ? "recorded" : "duplicate";
  } catch {
    console.error("hr-candidate usage accounting unavailable");
    return "unavailable";
  }
}

function isSafeUsage(
  context: HrUsageContext,
  response: LLMResponse,
): boolean {
  const tokensAreSafe = Number.isInteger(response.inputTokens) &&
    response.inputTokens >= 0 && response.inputTokens <= 5_000_000 &&
    Number.isInteger(response.outputTokens) && response.outputTokens >= 0 &&
    response.outputTokens <= 5_000_000;
  const metricsAreSafe = Number.isFinite(response.costUsd) &&
    response.costUsd >= 0 && response.costUsd <= 100 &&
    Number.isInteger(response.latencyMs) && response.latencyMs >= 0 &&
    response.latencyMs <= 120_000;
  const cacheIsConsistent = !response.cached ||
    (response.inputTokens === 0 && response.outputTokens === 0 &&
      response.costUsd === 0);

  return context.tenantId.trim().length > 0 &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      .test(context.userId) &&
    /^[0-9A-HJKMNP-TV-Z]{26}$/.test(context.requestId) &&
    response.model.trim().length > 0 && response.model.length <= 160 &&
    tokensAreSafe && metricsAreSafe && cacheIsConsistent;
}
