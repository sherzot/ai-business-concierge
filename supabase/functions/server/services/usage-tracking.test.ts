import type { SupabaseClient } from "npm:@supabase/supabase-js@2.49.8";
import {
  releaseAiRequestReservation,
  reserveAiRequest,
} from "./usage-tracking.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test("AI request reservation delegates the atomic limit to PostgreSQL", async () => {
  const calls: Array<{ name: string; args: Record<string, unknown> }> = [];
  const supabase = {
    rpc: (name: string, args: Record<string, unknown>) => {
      calls.push({ name, args });
      return Promise.resolve({
        data: [{ allowed: true, remaining: 0 }],
        error: null,
      });
    },
  } as unknown as SupabaseClient;

  const result = await reserveAiRequest(
    supabase,
    "tenant-1",
    "11111111-1111-4111-8111-111111111111",
    "free",
  );

  assert(result.ok, "reservation should be allowed");
  assert(result.remaining === 0, "remaining count should come from PostgreSQL");
  assert(calls.length === 1, "reservation RPC should be called once");
  assert(calls[0].name === "reserve_ai_request", "atomic RPC name");
  assert(calls[0].args.p_limit === 5, "free plan limit should be passed");
});

Deno.test("AI request reservation fails closed when PostgreSQL is unavailable", async () => {
  const supabase = {
    rpc: () => Promise.resolve({
      data: null,
      error: { message: "database unavailable" },
    }),
  } as unknown as SupabaseClient;

  const result = await reserveAiRequest(
    supabase,
    "tenant-1",
    "11111111-1111-4111-8111-111111111111",
    "starter",
  );

  assert(!result.ok, "reservation must fail");
  assert(result.reason === "unavailable", "database errors must fail closed");
});

Deno.test("failed provider calls release their AI request reservation", async () => {
  const calls: Array<{ name: string; args: Record<string, unknown> }> = [];
  const supabase = {
    rpc: (name: string, args: Record<string, unknown>) => {
      calls.push({ name, args });
      return Promise.resolve({ data: true, error: null });
    },
  } as unknown as SupabaseClient;

  await releaseAiRequestReservation(
    supabase,
    "tenant-1",
    "11111111-1111-4111-8111-111111111111",
  );

  assert(calls.length === 1, "release RPC should be called once");
  assert(calls[0].name === "release_ai_request", "release RPC name");
});
