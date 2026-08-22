import type { SupabaseClient } from "npm:@supabase/supabase-js@2.49.8";
import {
  executeWithHrCandidateQuota,
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

Deno.test("HR quota lifecycle skips analysis and release when reservation is denied", async () => {
  const events: string[] = [];
  const result = await executeWithHrCandidateQuota(
    client({}),
    "tenant-1",
    USER_ID,
    () => {
      events.push("execute");
      return Promise.resolve("not reached");
    },
    {
      reserve: () => {
        events.push("reserve");
        return Promise.resolve({
          ok: false,
          reason: "minute",
          retryAfterSeconds: 12,
        });
      },
      release: () => {
        events.push("release");
        return Promise.resolve(true);
      },
    },
  );

  assertEquals(events, ["reserve"], "denied lifecycle order");
  assertEquals(result, {
    ok: false,
    reason: "minute",
    retryAfterSeconds: 12,
  }, "denial preserved");
});

Deno.test("HR quota lifecycle releases the exact lease after success", async () => {
  const events: string[] = [];
  const releaseArgs: string[] = [];
  const result = await executeWithHrCandidateQuota(
    client({}),
    "tenant-1",
    USER_ID,
    (reservation) => {
      events.push(`execute:${reservation.leaseId}`);
      return Promise.resolve("analysis-result");
    },
    {
      reserve: () => {
        events.push("reserve");
        return Promise.resolve({
          ok: true,
          leaseId: LEASE_ID,
          minuteRemaining: 4,
          dayRemaining: 19,
          policy: { concurrent: 2, per_minute: 5, per_day: 20 },
        });
      },
      release: (_supabase, tenantId, userId, leaseId) => {
        events.push("release");
        releaseArgs.push(tenantId, userId, leaseId);
        return Promise.resolve(true);
      },
    },
  );

  assert(result.ok, "successful lifecycle");
  assertEquals(result.value, "analysis-result", "analysis value");
  assertEquals(
    events,
    ["reserve", `execute:${LEASE_ID}`, "release"],
    "success lifecycle order",
  );
  assertEquals(
    releaseArgs,
    ["tenant-1", USER_ID, LEASE_ID],
    "release identity",
  );
});

Deno.test("HR quota lifecycle releases after analysis rejection and preserves the error", async () => {
  const operationError = new Error("analysis timeout");
  let releaseCalls = 0;
  let caught: unknown;
  try {
    await executeWithHrCandidateQuota(
      client({}),
      "tenant-1",
      USER_ID,
      () => Promise.reject(operationError),
      {
        reserve: () =>
          Promise.resolve({
            ok: true,
            leaseId: LEASE_ID,
            minuteRemaining: 4,
            dayRemaining: 19,
            policy: { concurrent: 2, per_minute: 5, per_day: 20 },
          }),
        release: () => {
          releaseCalls += 1;
          return Promise.resolve(true);
        },
      },
    );
  } catch (error) {
    caught = error;
  }

  assertEquals(releaseCalls, 1, "one release after rejection");
  assert(caught === operationError, "original analysis error preserved");
});

Deno.test("HR quota lifecycle does not replace success when cleanup is unavailable", async () => {
  const result = await executeWithHrCandidateQuota(
    client({}),
    "tenant-1",
    USER_ID,
    () => Promise.resolve(42),
    {
      reserve: () =>
        Promise.resolve({
          ok: true,
          leaseId: LEASE_ID,
          minuteRemaining: 4,
          dayRemaining: 19,
          policy: { concurrent: 2, per_minute: 5, per_day: 20 },
        }),
      release: () => Promise.resolve(false),
    },
  );

  assert(result.ok, "cleanup false must not mask success");
  assertEquals(result.value, 42, "successful result retained");
});

Deno.test("HR quota lifecycle does not replace the analysis error when cleanup throws", async () => {
  const originalError = console.error;
  console.error = () => {};
  const operationError = new Error("provider failed");
  let caught: unknown;
  try {
    await executeWithHrCandidateQuota(
      client({}),
      "tenant-1",
      USER_ID,
      () => Promise.reject(operationError),
      {
        reserve: () =>
          Promise.resolve({
            ok: true,
            leaseId: LEASE_ID,
            minuteRemaining: 4,
            dayRemaining: 19,
            policy: { concurrent: 2, per_minute: 5, per_day: 20 },
          }),
        release: () => Promise.reject(new Error("database unavailable")),
      },
    );
  } catch (error) {
    caught = error;
  } finally {
    console.error = originalError;
  }

  assert(
    caught === operationError,
    "cleanup error cannot mask operation error",
  );
});
