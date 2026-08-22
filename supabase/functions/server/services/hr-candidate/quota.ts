/**
 * Persistent tenant quota adapter for HR Candidate Analysis.
 *
 * PostgreSQL owns the race-sensitive minute/day counters and concurrency
 * leases. This adapter resolves the tenant plan and fails closed when either
 * plan lookup or the service-role-only RPC is unavailable.
 */

import type { SupabaseClient } from "npm:@supabase/supabase-js@2.49.8";
import {
  getHrRateLimitPolicy,
  type HrRateLimitPolicy,
} from "./request-boundary.ts";

const DEFAULT_LEASE_SECONDS = 45;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type HrQuotaLimitReason = "concurrent" | "minute" | "day";

export type HrQuotaReservationResult =
  | {
    ok: true;
    leaseId: string;
    minuteRemaining: number;
    dayRemaining: number;
    policy: HrRateLimitPolicy;
  }
  | {
    ok: false;
    reason: HrQuotaLimitReason | "unavailable";
    retryAfterSeconds: number;
    policy?: HrRateLimitPolicy;
  };

type PlanResolution =
  | { ok: true; policy: HrRateLimitPolicy }
  | { ok: false };

/** Resolve the active subscription first, then the legacy tenant plan. */
export async function resolveHrCandidateQuotaPolicy(
  supabase: SupabaseClient,
  tenantId: string,
): Promise<PlanResolution> {
  try {
    const subscription = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("tenant_id", tenantId)
      .in("status", ["active", "grace"])
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscription.error) {
      console.error(
        "hr-candidate quota: subscription plan lookup failed",
        subscription.error.message,
      );
      return { ok: false };
    }

    if (subscription.data) {
      const policy = getHrRateLimitPolicy(subscription.data.plan);
      return policy ? { ok: true, policy } : { ok: false };
    }

    const tenant = await supabase
      .from("tenants")
      .select("plan")
      .eq("id", tenantId)
      .maybeSingle();

    if (tenant.error || !tenant.data) {
      if (tenant.error) {
        console.error(
          "hr-candidate quota: tenant plan lookup failed",
          tenant.error.message,
        );
      }
      return { ok: false };
    }

    const policy = getHrRateLimitPolicy(tenant.data.plan);
    return policy ? { ok: true, policy } : { ok: false };
  } catch (error) {
    console.error("hr-candidate quota: plan lookup failed", error);
    return { ok: false };
  }
}

export async function reserveHrCandidateQuota(
  supabase: SupabaseClient,
  tenantId: string,
  userId: string,
): Promise<HrQuotaReservationResult> {
  const resolved = await resolveHrCandidateQuotaPolicy(supabase, tenantId);
  if (!resolved.ok) {
    return { ok: false, reason: "unavailable", retryAfterSeconds: 0 };
  }

  const policy = resolved.policy;
  try {
    const { data, error } = await supabase.rpc(
      "reserve_hr_candidate_request",
      {
        p_tenant_id: tenantId,
        p_user_id: userId,
        p_concurrent_limit: policy.concurrent,
        p_per_minute_limit: policy.per_minute,
        p_per_day_limit: policy.per_day,
        p_lease_seconds: DEFAULT_LEASE_SECONDS,
      },
    );

    if (error) {
      console.error("hr-candidate quota: reservation failed", error.message);
      return {
        ok: false,
        reason: "unavailable",
        retryAfterSeconds: 0,
        policy,
      };
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!isRecord(row) || typeof row.allowed !== "boolean") {
      console.error("hr-candidate quota: invalid reservation response");
      return {
        ok: false,
        reason: "unavailable",
        retryAfterSeconds: 0,
        policy,
      };
    }

    if (!row.allowed) {
      const reason = isLimitReason(row.reason) ? row.reason : null;
      const retryAfterSeconds = toNonNegativeInteger(row.retry_after_seconds);
      if (!reason || retryAfterSeconds === null || retryAfterSeconds < 1) {
        console.error("hr-candidate quota: invalid denial response");
        return {
          ok: false,
          reason: "unavailable",
          retryAfterSeconds: 0,
          policy,
        };
      }
      return { ok: false, reason, retryAfterSeconds, policy };
    }

    const leaseId = typeof row.lease_id === "string" ? row.lease_id : "";
    const minuteRemaining = toNonNegativeInteger(row.minute_remaining);
    const dayRemaining = toNonNegativeInteger(row.day_remaining);
    if (
      !UUID_PATTERN.test(leaseId) || minuteRemaining === null ||
      dayRemaining === null
    ) {
      console.error("hr-candidate quota: invalid allowed response");
      return {
        ok: false,
        reason: "unavailable",
        retryAfterSeconds: 0,
        policy,
      };
    }

    return {
      ok: true,
      leaseId,
      minuteRemaining,
      dayRemaining,
      policy,
    };
  } catch (error) {
    console.error("hr-candidate quota: reservation failed", error);
    return {
      ok: false,
      reason: "unavailable",
      retryAfterSeconds: 0,
      policy,
    };
  }
}

export async function releaseHrCandidateQuota(
  supabase: SupabaseClient,
  tenantId: string,
  userId: string,
  leaseId: string,
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc(
      "release_hr_candidate_request",
      {
        p_tenant_id: tenantId,
        p_user_id: userId,
        p_lease_id: leaseId,
      },
    );
    if (error) {
      console.error("hr-candidate quota: lease release failed", error.message);
      return false;
    }
    return data === true;
  } catch (error) {
    console.error("hr-candidate quota: lease release failed", error);
    return false;
  }
}

function isLimitReason(value: unknown): value is HrQuotaLimitReason {
  return value === "concurrent" || value === "minute" || value === "day";
}

function toNonNegativeInteger(value: unknown): number | null {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
