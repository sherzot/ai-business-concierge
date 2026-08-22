import type { SupabaseClient } from "npm:@supabase/supabase-js@2.49.8";
import type { LLMResponse } from "../llm-router.ts";
import { recordHrProviderUsage } from "./usage-accounting.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const CONTEXT = {
  tenantId: "tenant-1",
  userId: "11111111-1111-4111-8111-111111111111",
  requestId: "01K36X8M3M0123456789ABCDEF",
};

const USAGE: LLMResponse = {
  text: "private model output",
  model: "claude-sonnet-4-6",
  complexity: "analysis",
  inputTokens: 120,
  outputTokens: 45,
  costUsd: 0.001035,
  latencyMs: 850,
  cached: false,
};

Deno.test("HR provider usage delegates only bounded billing metadata to PostgreSQL", async () => {
  const calls: Array<{ name: string; args: Record<string, unknown> }> = [];
  const supabase = {
    rpc: (name: string, args: Record<string, unknown>) => {
      calls.push({ name, args });
      return Promise.resolve({ data: true, error: null });
    },
  } as unknown as SupabaseClient;

  const result = await recordHrProviderUsage(
    supabase,
    CONTEXT,
    "candidate_scoring",
    USAGE,
  );

  assert(result === "recorded", "usage should be recorded");
  assert(calls.length === 1, "RPC should be called once");
  assert(calls[0].name === "record_hr_candidate_ai_usage", "RPC name");
  assert(calls[0].args.p_prompt_tokens === 120, "prompt tokens");
  assert(calls[0].args.p_completion_tokens === 45, "completion tokens");
  assert(!("text" in calls[0].args), "model output must not be persisted");
});

Deno.test("HR provider usage exposes idempotent duplicate result", async () => {
  const supabase = {
    rpc: () => Promise.resolve({ data: false, error: null }),
  } as unknown as SupabaseClient;
  const result = await recordHrProviderUsage(
    supabase,
    CONTEXT,
    "report_generation",
    USAGE,
  );
  assert(result === "duplicate", "duplicate should be explicit");
});

Deno.test("HR provider usage rejects inconsistent cached or unbounded metrics before DB", async () => {
  let calls = 0;
  const supabase = {
    rpc: () => {
      calls += 1;
      return Promise.resolve({ data: true, error: null });
    },
  } as unknown as SupabaseClient;
  const result = await recordHrProviderUsage(
    supabase,
    CONTEXT,
    "cv_semantic",
    { ...USAGE, cached: true },
  );
  assert(result === "unavailable", "invalid metrics fail closed");
  assert(calls === 0, "invalid metrics must not reach PostgreSQL");
});

Deno.test("HR provider usage hides database failure details", async () => {
  const originalError = console.error;
  const messages: unknown[][] = [];
  console.error = (...args: unknown[]) => messages.push(args);
  try {
    const supabase = {
      rpc: () =>
        Promise.resolve({
          data: null,
          error: { message: "private database detail" },
        }),
    } as unknown as SupabaseClient;
    const result = await recordHrProviderUsage(
      supabase,
      CONTEXT,
      "candidate_scoring",
      USAGE,
    );
    assert(result === "unavailable", "database failure is unavailable");
    assert(
      !JSON.stringify(messages).includes("private database detail"),
      "database details must not be logged",
    );
  } finally {
    console.error = originalError;
  }
});
