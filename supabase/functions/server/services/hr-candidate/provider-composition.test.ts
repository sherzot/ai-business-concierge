import type { SupabaseClient } from "npm:@supabase/supabase-js@2.49.8";
import type { LLMRequest, LLMResponse } from "../llm-router.ts";
import {
  composeHrProviderStages,
  type HrProviderCompositionConfig,
} from "./provider-composition.ts";
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

const CONTEXT = {
  tenantId: "22222222-2222-4222-8222-222222222222",
  userId: "11111111-1111-4111-8111-111111111111",
  requestId: "01K36X8M3M0123456789ABCDEF",
};

function response(text: string, request: LLMRequest): LLMResponse {
  return {
    text,
    model: "claude-haiku-4-5-20251001",
    complexity: request.complexity ?? "default",
    inputTokens: 120,
    outputTokens: 40,
    costUsd: 0.0009,
    latencyMs: 500,
    cached: false,
  };
}

Deno.test("HR provider composition binds canonical context to atomic accounting", async () => {
  const rpcCalls: Array<{ name: string; args: Record<string, unknown> }> = [];
  const requests: Array<{ apiKey: string; request: LLMRequest }> = [];
  const supabase = {
    rpc: (name: string, args: Record<string, unknown>) => {
      rpcCalls.push({ name, args });
      return Promise.resolve({ data: true, error: null });
    },
  } as unknown as SupabaseClient;
  const stages = composeHrProviderStages({
    apiKey: "test-provider-key",
    supabase,
    context: CONTEXT,
    invoke: (apiKey, request) => {
      requests.push({ apiKey, request });
      return Promise.resolve(response(
        JSON.stringify({ tech_skills: ["TypeScript"] }),
        request,
      ));
    },
  });

  const result = await stages.structureCv(
    "Private sanitized CV text that must not enter accounting.",
    "en",
  );

  assertEquals(result.tech_skills, ["TypeScript"], "validated output");
  assertEquals(requests.length, 1, "one provider call");
  assertEquals(requests[0].apiKey, "test-provider-key", "server key");
  assertEquals(
    requests[0].request.cacheScope,
    `tenant:${CONTEXT.tenantId}:request:${CONTEXT.requestId}:cv-semantic`,
    "tenant/request/stage cache isolation",
  );
  assertEquals(rpcCalls.length, 1, "one accounting call");
  assertEquals(
    rpcCalls[0].name,
    "record_hr_candidate_ai_usage",
    "atomic RPC",
  );
  assertEquals(rpcCalls[0].args.p_tenant_id, CONTEXT.tenantId, "tenant");
  assertEquals(rpcCalls[0].args.p_user_id, CONTEXT.userId, "user");
  assertEquals(rpcCalls[0].args.p_request_id, CONTEXT.requestId, "request");
  assertEquals(rpcCalls[0].args.p_stage, "cv_semantic", "stage");
  assert(
    !JSON.stringify(rpcCalls).includes("Private sanitized CV text"),
    "private CV text is excluded from accounting",
  );
  assert(
    !JSON.stringify(rpcCalls).includes("test-provider-key"),
    "provider key is excluded from accounting",
  );
});

Deno.test("HR provider composition rejects missing key or invalid context before provider work", () => {
  const invalidConfigs: HrProviderCompositionConfig[] = [{
    apiKey: "",
    supabase: {} as SupabaseClient,
    context: CONTEXT,
  }, {
    apiKey: "test-provider-key",
    supabase: {} as SupabaseClient,
    context: { ...CONTEXT, tenantId: "tenant-1" },
  }, {
    apiKey: "test-provider-key",
    supabase: {} as SupabaseClient,
    context: { ...CONTEXT, requestId: crypto.randomUUID() },
  }, {
    apiKey: "test-provider-key",
    supabase: {} as SupabaseClient,
    context: CONTEXT,
  }];

  for (const config of invalidConfigs) {
    let error: unknown;
    try {
      composeHrProviderStages(config);
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

Deno.test("HR provider composition fails closed when atomic accounting is unavailable", async () => {
  const originalError = console.error;
  console.error = () => undefined;
  try {
    const stages = composeHrProviderStages({
      apiKey: "test-provider-key",
      supabase: {
        rpc: () => Promise.resolve({ data: null, error: { message: "db" } }),
      } as unknown as SupabaseClient,
      context: CONTEXT,
      invoke: (_apiKey, request) =>
        Promise.resolve(response(
          JSON.stringify({ tech_skills: ["TypeScript"] }),
          request,
        )),
    });

    let error: unknown;
    try {
      await stages.structureCv("Sanitized CV text", "en");
    } catch (caught) {
      error = caught;
    }
    assert(
      error instanceof Error &&
        error.message === "USAGE_ACCOUNTING_UNAVAILABLE:cv_semantic",
      "untracked output is rejected",
    );
  } finally {
    console.error = originalError;
  }
});
