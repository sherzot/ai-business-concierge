/**
 * Usage Tracking — tarifga mos kunlik limit middleware
 * Phase 0 — AI Business Concierge
 *
 * Maqsad:
 *   • Foydalanuvchining tarifi (free / starter / pro / company) ga qarab
 *     kunlik AI so'rovi va hujjat generatsiya limitini tekshiradi.
 *   • Limit yetganda 429 RATE_LIMITED qaytaradi.
 *   • AI request limitlari provider chaqiruvidan oldin PostgreSQL'da atomik
 *     rezervatsiya qilinadi; muvaffaqiyatsiz provider chaqiruvi rezervatsiyani
 *     qaytaradi.
 *
 * Migrationga qarang:
 *   20260417_phase0_new_tables.sql — usage_tracking jadval + increment_usage funksiyasi
 *   20260429_phase0_rls_complete.sql — RLS yopilgan
 *
 * Tarif limitlari (SPEC.md §6 ga muvofiq):
 */

import type { SupabaseClient } from "npm:@supabase/supabase-js@2.49.8";

// ---------------------------------------------------------------------------
// Tariflar va limitlar
// ---------------------------------------------------------------------------

export type Plan = "free" | "starter" | "pro" | "company";

export type Resource = "ai_requests" | "docs_generated";

type Limits = Record<Resource, number>; // -1 = cheksiz

const PLAN_LIMITS: Record<Plan, Limits> = {
  free:    { ai_requests: 5,    docs_generated: 2  },  // AI: kunlik, hujjat: oylik
  starter: { ai_requests: 50,   docs_generated: 20 },  // AI: kunlik, hujjat: oylik
  pro:     { ai_requests: -1,   docs_generated: -1     },
  company: { ai_requests: -1,   docs_generated: -1     },
};

// ---------------------------------------------------------------------------
// Limit tekshiruv
// ---------------------------------------------------------------------------

export type CheckArgs = {
  supabase: SupabaseClient;
  tenantId: string;
  userId: string | null;
  resource: Resource;
};

export type CheckResult =
  | { allowed: true;  remaining: number; plan: Plan }
  | { allowed: false; remaining: 0; plan: Plan; reason: string };

/**
 * Kunlik limit tekshiruvi. Limit yetgan bo'lsa allowed=false.
 * Bu funksiya so'rov **boshlanishidan oldin** chaqiriladi.
 */
export async function checkLimit(args: CheckArgs): Promise<CheckResult> {
  const plan = await getActivePlan(args.supabase, args.tenantId);
  const limit = PLAN_LIMITS[plan][args.resource];

  if (limit === -1) {
    return { allowed: true, remaining: Number.POSITIVE_INFINITY, plan };
  }

  const used = await getPeriodUsage(
    args.supabase,
    args.tenantId,
    args.userId,
    args.resource,
  );
  const remaining = Math.max(0, limit - used);

  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      plan,
      reason: `Kunlik ${args.resource} limiti yetdi (${plan} tarif)`,
    };
  }

  return { allowed: true, remaining, plan };
}

/**
 * Muvaffaqiyatli so'rovdan keyin chaqiriladi — counterni oshiradi.
 * Atomik: SQL `increment_usage()` funksiyasi ishlatadi (ON CONFLICT DO UPDATE).
 */
export async function recordUsage(
  supabase: SupabaseClient,
  tenantId: string,
  userId: string | null,
  delta: { ai_requests?: number; ai_tokens?: number; docs_generated?: number },
): Promise<void> {
  const { error } = await supabase.rpc("increment_usage", {
    p_tenant_id:   tenantId,
    p_user_id:     userId,
    p_ai_requests: delta.ai_requests ?? 0,
    p_ai_tokens:   delta.ai_tokens ?? 0,
    p_docs:        delta.docs_generated ?? 0,
  });

  if (error) {
    // Limit hisobini yozolmadik — log qilamiz, lekin so'rovni rad etmaymiz
    console.error("usage-tracking: recordUsage failed", error.message);
  }
}

export type AiRequestReservationResult =
  | { ok: true; remaining: number; plan: Plan }
  | {
    ok: false;
    remaining: 0;
    plan: Plan;
    reason: "limit" | "unavailable";
  };

/**
 * Bitta AI request o'rnini PostgreSQL'da atomik rezervatsiya qiladi.
 * Limitni tekshirish va counterni oshirish bitta DB statement ichida bajariladi,
 * shuning uchun parallel so'rovlar bitta qolgan o'rinni birga ishlata olmaydi.
 */
export async function reserveAiRequest(
  supabase: SupabaseClient,
  tenantId: string,
  userId: string,
  plan: Plan,
): Promise<AiRequestReservationResult> {
  const limit = PLAN_LIMITS[plan].ai_requests;
  try {
    const { data, error } = await supabase.rpc("reserve_ai_request", {
      p_tenant_id: tenantId,
      p_user_id: userId,
      p_limit: limit,
    });

    if (error) {
      console.error("usage-tracking: reserveAiRequest failed", error.message);
      return { ok: false, remaining: 0, plan, reason: "unavailable" };
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row || typeof row.allowed !== "boolean") {
      console.error("usage-tracking: reserveAiRequest returned invalid data");
      return { ok: false, remaining: 0, plan, reason: "unavailable" };
    }

    if (!row.allowed) {
      return { ok: false, remaining: 0, plan, reason: "limit" };
    }

    return {
      ok: true,
      remaining: limit === -1
        ? Number.POSITIVE_INFINITY
        : Math.max(0, Number(row.remaining ?? 0)),
      plan,
    };
  } catch (error) {
    console.error("usage-tracking: reserveAiRequest failed", error);
    return { ok: false, remaining: 0, plan, reason: "unavailable" };
  }
}

/** Providerga yetib bormagan request uchun oldingi rezervatsiyani qaytaradi. */
export async function releaseAiRequestReservation(
  supabase: SupabaseClient,
  tenantId: string,
  userId: string,
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("release_ai_request", {
      p_tenant_id: tenantId,
      p_user_id: userId,
    });
    if (error) {
      console.error(
        "usage-tracking: releaseAiRequestReservation failed",
        error.message,
      );
      return false;
    }
    return data === true;
  } catch (error) {
    console.error("usage-tracking: releaseAiRequestReservation failed", error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Helperlar
// ---------------------------------------------------------------------------

async function getActivePlan(supabase: SupabaseClient, tenantId: string): Promise<Plan> {
  const { data } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("tenant_id", tenantId)
    .in("status", ["active", "grace"])
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const plan = (data?.plan as Plan) ?? "free";
  return plan;
}

async function getPeriodUsage(
  supabase: SupabaseClient,
  tenantId: string,
  userId: string | null,
  resource: Resource,
): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const column = resource === "ai_requests" ? "ai_requests" : "docs_generated";

  let query = supabase
    .from("usage_tracking")
    .select(column)
    .eq("tenant_id", tenantId);

  if (resource === "ai_requests") {
    query = query.eq("date", today);
  } else {
    const monthStart = `${today.slice(0, 7)}-01`;
    query = query.gte("date", monthStart).lte("date", today);
  }

  if (userId) {
    query = query.eq("user_id", userId);
  } else {
    query = query.is("user_id", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error("usage-tracking: getTodayUsage failed", error.message);
    return 0;
  }

  return ((data ?? []) as Array<Record<string, unknown>>).reduce(
    (sum, row) => sum + Number(row?.[column] ?? 0),
    0,
  );
}

// ---------------------------------------------------------------------------
// Hono helper (optional convenience wrapper)
// ---------------------------------------------------------------------------

/**
 * Convenience helper for Hono handlers:
 *
 *   const gate = await guardUsage({ supabase, tenantId, userId, resource: 'ai_requests' });
 *   if (!gate.ok) return c.json(gate.body, 429);
 *   ...do work...
 *   await recordUsage(supabase, tenantId, userId, { ai_requests: 1, ai_tokens });
 */
export async function guardUsage(args: CheckArgs): Promise<
  | { ok: true; plan: Plan; remaining: number }
  | { ok: false; body: { ok: false; error: { code: "RATE_LIMITED"; message: string; plan: Plan; remaining: 0 } } }
> {
  const r = await checkLimit(args);
  if (r.allowed) return { ok: true, plan: r.plan, remaining: r.remaining };
  return {
    ok: false,
    body: {
      ok: false,
      error: {
        code: "RATE_LIMITED",
        message: r.reason,
        plan: r.plan,
        remaining: 0,
      },
    },
  };
}
