import type { SupabaseClient } from "npm:@supabase/supabase-js@2.49.8";
import {
  releaseHrCandidateQuota,
  reserveHrCandidateQuota,
  resolveHrCandidateQuotaPolicy,
} from "./quota.ts";

const USER_ID = "44444444-4444-4444-8444-444444444444";
const LEASE_ID = "66666666-6666-4666-8666-666666666666";

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

type QueryResponse = {
  data: Record<string, unknown> | null;
  error: { message: string } | null;
};

function client(options: {
  subscription?: QueryResponse;
  tenant?: QueryResponse;
  rpc?: (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message: string } | null }>;
}): SupabaseClient {
  const from = (table: string) => {
    const builder = {
      select: () => builder,
      eq: () => builder,
      in: () => builder,
      order: () => builder,
      limit: () => builder,
      maybeSingle: () =>
        Promise.resolve(
          table === "subscriptions"
            ? options.subscription ?? { data: null, error: null }
            : options.tenant ?? { data: null, error: null },
        ),
    };
    return builder;
  };

  return {
    from,
    rpc: options.rpc ?? (() => Promise.resolve({ data: null, error: null })),
  } as unknown as SupabaseClient;
}

Deno.test("HR quota resolves the active database starter plan", async () => {
  const result = await resolveHrCandidateQuotaPolicy(
    client({
      subscription: { data: { plan: "starter" }, error: null },
    }),
    "tenant-1",
  );

  assert(result.ok, "starter plan should resolve");
  assertEquals(
    result.policy,
    { concurrent: 2, per_minute: 5, per_day: 20 },
    "starter policy",
  );
});

Deno.test("HR quota falls back to the legacy tenant plan without a subscription", async () => {
  const result = await resolveHrCandidateQuotaPolicy(
    client({
      tenant: { data: { plan: "Pro" }, error: null },
    }),
    "tenant-1",
  );

  assert(result.ok, "legacy Pro plan should resolve");
  assertEquals(
    result.policy,
    { concurrent: 5, per_minute: 20, per_day: 100 },
    "legacy Pro policy",
  );
});

Deno.test("HR quota reservation passes the resolved policy to PostgreSQL", async () => {
  const calls: Array<{ name: string; args: Record<string, unknown> }> = [];
  const supabase = client({
    subscription: { data: { plan: "company" }, error: null },
    rpc: (name, args) => {
      calls.push({ name, args });
      return Promise.resolve({
        data: [{
          allowed: true,
          reason: null,
          lease_id: LEASE_ID,
          retry_after_seconds: 0,
          minute_remaining: 59,
          day_remaining: 499,
        }],
        error: null,
      });
    },
  });

  const result = await reserveHrCandidateQuota(
    supabase,
    "tenant-1",
    USER_ID,
  );

  assert(result.ok, "reservation should be allowed");
  assertEquals(result.leaseId, LEASE_ID, "lease ID");
  assertEquals(result.minuteRemaining, 59, "minute remaining");
  assertEquals(result.dayRemaining, 499, "day remaining");
  assertEquals(calls.length, 1, "one RPC call");
  assertEquals(calls[0].name, "reserve_hr_candidate_request", "RPC name");
  assertEquals(calls[0].args.p_concurrent_limit, 10, "company concurrency");
  assertEquals(calls[0].args.p_per_minute_limit, 60, "company minute");
  assertEquals(calls[0].args.p_per_day_limit, 500, "company day");
  assertEquals(calls[0].args.p_lease_seconds, 45, "bounded lease duration");
});

Deno.test("HR quota returns a typed PostgreSQL denial", async () => {
  const result = await reserveHrCandidateQuota(
    client({
      subscription: { data: { plan: "free" }, error: null },
      rpc: () =>
        Promise.resolve({
          data: [{
            allowed: false,
            reason: "minute",
            lease_id: null,
            retry_after_seconds: 37,
            minute_remaining: 0,
            day_remaining: 1,
          }],
          error: null,
        }),
    }),
    "tenant-1",
    USER_ID,
  );

  assert(!result.ok, "reservation should be denied");
  assertEquals(result.reason, "minute", "denial reason");
  assertEquals(result.retryAfterSeconds, 37, "retry delay");
});

Deno.test("HR quota fails closed for unknown plans and skips the RPC", async () => {
  let rpcCalls = 0;
  const result = await reserveHrCandidateQuota(
    client({
      subscription: { data: { plan: "unmapped-plan" }, error: null },
      rpc: () => {
        rpcCalls += 1;
        return Promise.resolve({ data: null, error: null });
      },
    }),
    "tenant-1",
    USER_ID,
  );

  assert(!result.ok, "unknown plan must fail closed");
  assertEquals(result.reason, "unavailable", "safe failure reason");
  assertEquals(rpcCalls, 0, "RPC must not run without a policy");
});

Deno.test("HR quota fails closed for malformed PostgreSQL responses", async () => {
  const result = await reserveHrCandidateQuota(
    client({
      subscription: { data: { plan: "free" }, error: null },
      rpc: () =>
        Promise.resolve({
          data: [{ allowed: true, lease_id: "not-a-uuid" }],
          error: null,
        }),
    }),
    "tenant-1",
    USER_ID,
  );

  assert(!result.ok, "malformed response must fail closed");
  assertEquals(result.reason, "unavailable", "safe failure reason");
});

Deno.test("HR quota releases the exact tenant/user lease", async () => {
  const calls: Array<{ name: string; args: Record<string, unknown> }> = [];
  const released = await releaseHrCandidateQuota(
    client({
      rpc: (name, args) => {
        calls.push({ name, args });
        return Promise.resolve({ data: true, error: null });
      },
    }),
    "tenant-1",
    USER_ID,
    LEASE_ID,
  );

  assert(released, "lease should be released");
  assertEquals(calls[0], {
    name: "release_hr_candidate_request",
    args: {
      p_tenant_id: "tenant-1",
      p_user_id: USER_ID,
      p_lease_id: LEASE_ID,
    },
  }, "release RPC contract");
});
