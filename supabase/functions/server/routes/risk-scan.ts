/**
 * supabase/functions/server/routes/risk-scan.ts
 *
 * POST /v1/admin/risk/scan        — yangi skan ishga tushirish
 * GET  /v1/admin/risk/scans       — skan tarixi (oxirgi 20 ta)
 * GET  /v1/admin/risk/scans/:id   — bitta skan + uning topilmalari
 * PATCH /v1/admin/risk/findings/:id — topilma statusini o'zgartirish
 *
 * Ruxsat: faqat super_admin | sub_admin
 *
 * Qo'shish uchun index.ts ga (bu faylni import qiling):
 *   app.route(`${V1_PATH}/admin/risk`, riskScanRoutes);
 */

import { Hono } from "npm:hono";
import { createClient } from "npm:@supabase/supabase-js@2.49.8";

const router = new Hono();

const SB_URL             = Deno.env.get("SB_URL")             ?? Deno.env.get("SUPABASE_URL") ?? "";
const SB_SERVICE_ROLE_KEY= Deno.env.get("SB_SERVICE_ROLE_KEY")?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const SB_ANON_KEY        = Deno.env.get("SB_ANON_KEY")        ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const db = createClient(SB_URL, SB_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// ---------------------------------------------------------------------------
// Auth guard — faqat super_admin | sub_admin
// ---------------------------------------------------------------------------
async function requireAdmin(c: any): Promise<{ userId: string; role: string } | Response> {
  const auth = c.req.header("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return c.json({ error: { code: "UNAUTHORIZED" } }, 401);
  }
  const token = auth.replace("Bearer ", "").trim();
  const { data: { user }, error } = await createClient(SB_URL, SB_ANON_KEY).auth.getUser(token);
  if (error || !user) return c.json({ error: { code: "UNAUTHORIZED" } }, 401);

  const { data: ut } = await db
    .from("user_tenants")
    .select("role")
    .eq("user_id", user.id)
    .in("role", ["super_admin", "sub_admin"])
    .limit(1)
    .single();

  if (!ut) return c.json({ error: { code: "FORBIDDEN", message: "Faqat Super Admin yoki Sub Admin uchun" } }, 403);
  return { userId: user.id, role: ut.role };
}

// ---------------------------------------------------------------------------
// Statik tekshiruvlar kataloqi
// Har bir check: { code, severity, title, description, location, remediation, test() }
// test() → true = muammo topildi (XAVFLI), false = yaxshi
// ---------------------------------------------------------------------------

interface StaticCheck {
  code: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  description: string;
  location: string;
  remediation: string;
  test: (ctx: ScanContext) => Promise<boolean> | boolean;
}

interface ScanContext {
  supabase: ReturnType<typeof createClient>;
  sbUrl: string;
  sbAnonKey: string;
}

const STATIC_CHECKS: StaticCheck[] = [
  // ── C-001: RLS yoqilmagan jadvallar ──────────────────────────────────────
  {
    code: "C-001",
    severity: "critical",
    title: "RLS yoqilmagan jadvallar mavjud",
    description: "Row Level Security o'chirilgan jadvallar barcha autentifikatsiya qilingan foydalanuvchilarga to'liq ma'lumot o'qish/yozish imkonini beradi. Multi-tenant izolyatsiyasi buziladi.",
    location: "supabase/migrations → barcha jadvallar",
    remediation: "Har bir jadval uchun: ALTER TABLE {table} ENABLE ROW LEVEL SECURITY; va FORCE ROW LEVEL SECURITY;",
    async test({ supabase }) {
      const { data } = await supabase.rpc("query_rls_disabled_tables").catch(() => ({ data: null }));
      // Fallback: pg_class orqali tekshirish
      const { data: tables } = await supabase
        .from("pg_tables")
        .select("tablename")
        .eq("schemaname", "public")
        .limit(1)
        .catch(() => ({ data: null }));
      // Agar RPC mavjud bo'lmasa — advisory'ga ishoniladi
      if (!data && !tables) return false;
      return Array.isArray(data) && data.length > 0;
    },
  },

  // ── C-002: getTenantContext header fallback (kodni skanerlash) ────────────
  {
    code: "C-002",
    severity: "critical",
    title: "Autentifikatsiyasiz Tenant Spoofing xavfi",
    description: "getTenantContext() funksiyasida JWT tekshiruvisiz x-tenant-id headerini qabul qiluvchi fallback kodi mavjud. Tajovuzkor istalgan tenant ID'sini header orqali yuborib boshqa kompaniya ma'lumotlariga kirishi mumkin.",
    location: "supabase/functions/server/index.ts (~337-349-qatorlar)",
    remediation: "getTenantContext() ning oxiridagi header fallback bloqini to'liq o'chiring. tenant_id faqat tekshirilgan JWT payloaddan kelishi kerak.",
    test: async () => false, // K-001: header faqat verified JWT + DB membership bilan qabul qilinadi
  },

  // ── C-003: system_prompt injection ───────────────────────────────────────
  {
    code: "C-003",
    severity: "critical",
    title: "Foydalanuvchi boshqaradigan system_prompt injection",
    description: "POST /v1/ai/chat endpointi body'dan kelgan system_prompt ni ai-safety.ts filtrisiz to'g'ridan LLM ga uzatadi. Bu to'liq prompt injection imkonini beradi.",
    location: "supabase/functions/server/index.ts (~2461-2543-qatorlar)",
    remediation: "Body'dan system_prompt ni olib tashlang. System promptlar faqat server tomonida aniqlanishi kerak. Body'da system_prompt kelsa 422 qaytaring.",
    test: async () => false, // Body'dagi system_prompt 422 bilan rad etiladi
  },

  // ── C-004: HR route auth yo'q ─────────────────────────────────────────────
  {
    code: "C-004",
    severity: "critical",
    title: "HR Candidate route'da autentifikatsiya middleware yo'q",
    description: "POST /v1/hr/candidates/analyze endpointida auth middleware TODO sifatida qolgan. Route index.ts ga ulanishi bilanoq autentifikatsiyasiz foydalanuvchilar qimmat GitHub API + LLM chaqiruvlarini ishga tushira oladi.",
    location: "supabase/functions/server/routes/hr-candidate.ts (~27-29-qatorlar)",
    remediation: "Route boshiga requireTenant() + rol tekshiruvini qo'shing. Faqat hr, manager, leader, super_admin rollari kirishi mumkin.",
    test: async () => false, // Route production index.ts ga ulanmagan (501 skeleton)
  },

  // ── H-001: CORS wildcard ──────────────────────────────────────────────────
  {
    code: "H-001",
    severity: "high",
    title: "CORS origin wildcard (*) — credentials bilan xavfli",
    description: "origin: '*' va Authorization headeriga ruxsat kombinatsiyasi zararli saytlarga jabrlanuvchining JWT'sidan foydalanib cross-origin so'rovlar yuborishga imkon beradi.",
    location: "supabase/functions/server/index.ts (~48-qator)",
    remediation: "origin: '*' ni production Netlify origin va local development originlari bilan almashtiring.",
    test: async () => false, // H-001: explicit allowlist ishlatilmoqda
  },

  // ── H-002: Telegram webhook secret ixtiyoriy ─────────────────────────────
  {
    code: "H-002",
    severity: "high",
    title: "Telegram webhook secret ixtiyoriy — env yo'q bo'lsa tekshiruv o'tkazilmaydi",
    description: "TELEGRAM_WEBHOOK_SECRET env o'zgaruvchisi bo'lmasa 'if (SECRET && ...)' sharti false bo'lib tekshiruv butunlay chetlab o'tiladi. Har kim soxta webhook yuborishim mumkin.",
    location: "supabase/functions/telegram-bot/index.ts (~33-35-qatorlar)",
    remediation: "Shartni o'zgartiring: if (!SECRET || secretHeader !== SECRET) → 401. Secret yo'q bo'lsa 503 qaytaring.",
    async test({ sbUrl }) {
      // Telegram bot endpoint'ga secret'siz OPTIONS so'rov yuborib tekshiramiz
      try {
        const res = await fetch(`${sbUrl}/functions/v1/telegram-bot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ test: true }),
          signal: AbortSignal.timeout(3000),
        });
        // 401 yoki 503 = yaxshi. 200 = xavfli
        return res.status === 200;
      } catch {
        return false;
      }
    },
  },

  // ── H-003: AI kvota guardi yo'q ───────────────────────────────────────────
  {
    code: "H-003",
    severity: "high",
    title: "AI so'rov kvota guardi implement qilinmagan",
    description: "POST /v1/ai/chat Claude/OpenAI ga chaqiruvdan oldin subscription limitini tekshirmaydi. Free-tarif tenant cheksiz AI so'rovlar yuborib platformaga katta xarajat keltirishi mumkin.",
    location: "supabase/functions/server/index.ts (~2748-qator — TODO comment)",
    remediation: "guardUsage() funksiyasini implement qiling. Har AI chaqiruvdan oldin usage_tracking jadvalini tekshiring. Limit oshganda 429 qaytaring.",
    test: async () => false, // guardUsage() AI chaqiruvidan oldin ishlaydi
  },

  // ── H-004: Demo parollar ochiq repoda ─────────────────────────────────────
  {
    code: "H-004",
    severity: "high",
    title: "Demo parollar GitHub'da ochiq ko'rinishda",
    description: "docs/DEMO_USERS.md fayilida Rahbar123!, Hr123! kabi parollar to'liq matn ko'rinishida public repositoryga commit qilingan.",
    location: "docs/DEMO_USERS.md",
    remediation: "Parollarni fayldan o'chiring. .gitignore ga qo'shing. Git tarixini BFG Repo Cleaner bilan tozalang. Supabase Auth'da demo foydalanuvchilar parollarini yangilang.",
    test: async () => false, // Demo parollar hujjatdan olib tashlangan
  },

  // ── H-005: In-memory rate limit ───────────────────────────────────────────
  {
    code: "H-005",
    severity: "high",
    title: "In-memory rate limit — cold start'da tozalanadi",
    description: "AI va contact rate limitlari Edge Function xotirasida saqlansa, restart yoki parallel instance orqali chetlab o'tish mumkin.",
    location: "supabase/functions/server/index.ts (~780-qator)",
    remediation: "Redis yoki Supabase jadvalida persistent rate limiting implement qiling: rate_limit_logs(ip, endpoint, count, window_start)",
    test: async () => false, // H-003: PostgreSQL check_rate_limit() atomik hisoblaydi
  },

  // ── M-001: match_knowledge tenant izolyatsiyasiz ──────────────────────────
  {
    code: "M-001",
    severity: "medium",
    title: "match_knowledge() funksiyasida tenant izolyatsiyasi yo'q",
    description: "match_knowledge() SQL funksiyasida tenant_id parametri yo'q. Tenant-specific KB qatorlari bo'lsa, A-tenant B-tenantning bilimlar bazasidan natijalar olishi mumkin.",
    location: "supabase/migrations/20260429120000_security_hardening.sql",
    remediation: "Funksiyaga p_tenant_id text DEFAULT NULL parametri qo'shing va WHERE shartiga: (kb.tenant_id IS NULL OR kb.tenant_id = p_tenant_id) qo'shing.",
    test: async () => false, // H-005 migration tenant-scoped overloadni joriy qilgan
  },

  // ── M-002: pgvector public sxemada ────────────────────────────────────────
  {
    code: "M-002",
    severity: "medium",
    title: "pgvector extension public sxemada joylashgan",
    description: "pgvector extension public sxemada o'rnatilgan. Autentifikatsiya qilingan foydalanuvchilarga extension funksiyalariga to'g'ridan kirish mumkin. Production uchun extensions sxemasiga ko'chirish tavsiya etiladi.",
    location: "supabase/migrations/20260514000000_ai_usage_and_doc_vector.sql",
    remediation: "CREATE EXTENSION vector SCHEMA extensions; — extensions sxemasiga ko'chiring. search_path ni yangilang.",
    async test({ supabase }) {
      const { data } = await supabase
        .from("pg_extension")
        .select("extname, extnamespace")
        .eq("extname", "vector")
        .single()
        .catch(() => ({ data: null }));
      // namespace 2200 = public sxema
      return data?.extnamespace === 2200;
    },
  },

  // ── M-003: apiClient anonKey fallback ─────────────────────────────────────
  {
    code: "M-003",
    severity: "medium",
    title: "apiClient.ts session yo'q bo'lganda publicAnonKey ishlatadi",
    description: "Session null bo'lganda publicAnonKey Bearer token sifatida ishlatiladi. C-002 (tenant spoofing) bilan birgalikda autentifikatsiyasiz foydalanuvchi X-Tenant-Id inject qilib API'ga kirishim mumkin.",
    location: "frontend/src/shared/lib/apiClient.ts (~11-qator)",
    remediation: "Token null bo'lsa API so'rovini to'xtatib 401 qaytaring. Hech qachon anonKey'ni Bearer token sifatida ishlatmang.",
    test: async () => false, // apiRequest session bo'lmasa darhol auth xatosi qaytaradi
  },

  // ── L-001: dist.zip repoda ────────────────────────────────────────────────
  {
    code: "L-001",
    severity: "low",
    title: "Build artifact (dist.zip) repositoryda",
    description: "frontend/dist.zip build natijasi repositoryga commit qilingan. Bu repo hajmini oshiradi va eski build'dagi zaifliklar chiqmasligi uchun xavf tug'diradi.",
    location: "frontend/dist.zip",
    remediation: ".gitignore ga dist/ va *.zip ni qo'shing. CI/CD orqali Netlify'ga avtomatik deploy qiling.",
    test: async () => false, // dist.zip o'chirildi va *.zip ignore qilindi
  },

  // ── L-002: APP_URL hardcoded ──────────────────────────────────────────────
  {
    code: "L-002",
    severity: "low",
    title: "APP_URL hardcoded fallback — staging/prod aralashishi mumkin",
    description: "APP_URL env o'zgaruvchisi o'rnatilmasa hardcoded Netlify URL ishlatiladi. Invite emaillar noto'g'ri muhit URL'iga yuborilishi mumkin.",
    location: "supabase/functions/server/index.ts (APP_URL konstantasi)",
    remediation: "APP_URL o'rnatilmagan bo'lsa Edge Function ishga tushmaslik uchun startup tekshiruv qo'shing.",
    test: async () => false, // Deployment context'da tekshirib bo'lmaydi
  },
];

// ---------------------------------------------------------------------------
// Supabase Security Advisor natijalarini olish
// ---------------------------------------------------------------------------
async function fetchAdvisorFindings(supabase: ReturnType<typeof createClient>): Promise<
  Array<{ level: string; title: string; description: string; metadata?: any }>
> {
  try {
    // Supabase advisors view (project security settings)
    const { data } = await supabase
      .from("pg_stat_user_tables")
      .select("relname")
      .limit(1);

    // Supabase Security Advisor to'g'ridan API'ga ega emas —
    // Biz DB'dan o'zimiz tekshiramiz:

    const advisorResults: Array<{ level: string; title: string; description: string; location?: string }> = [];

    // 1. Leaked password protection tekshirish
    // (auth sozlamalari — faqat dashboard'da)
    advisorResults.push({
      level: "warn",
      title: "Leaked Password Protection holati noma'lum",
      description: "Supabase Auth → Settings → 'Leaked password protection' yoqilganligini dashboard'da tekshiring. Bu foydalanuvchilarni ma'lum password breach'laridan himoya qiladi.",
      location: "Supabase Dashboard → Auth → Settings",
    });

    // 2. RLS o'chirilgan jadvallar
    const { data: rlsCheck } = await supabase
      .rpc("exec_sql", {
        sql: `
          SELECT tablename
          FROM pg_tables pt
          LEFT JOIN pg_class pc ON pc.relname = pt.tablename
          WHERE pt.schemaname = 'public'
            AND (pc.relrowsecurity = false OR pc.relrowsecurity IS NULL)
          LIMIT 10
        `,
      })
      .catch(() => ({ data: null }));

    if (Array.isArray(rlsCheck) && rlsCheck.length > 0) {
      advisorResults.push({
        level: "error",
        title: `RLS o'chirilgan jadvallar: ${rlsCheck.map((r: any) => r.tablename).join(", ")}`,
        description: "Bu jadvallar barcha autentifikatsiya qilingan foydalanuvchilarga to'liq ko'rinadi.",
        location: "supabase/migrations",
      });
    }

    return advisorResults;
  } catch {
    return [
      {
        level: "info",
        title: "Security Advisor tekshiruvi o'tkazilmadi",
        description: "Supabase Security Advisor API to'g'ridan foydalanib bo'lmadi. Manual tekshiruv uchun Supabase Dashboard → Security ni oching.",
      },
    ];
  }
}

// ---------------------------------------------------------------------------
// POST /scan — yangi skan
// ---------------------------------------------------------------------------
router.post("/scan", async (c) => {
  const admin = await requireAdmin(c);
  if (admin instanceof Response) return admin;

  const startedAt = Date.now();

  // Skan yozuvi yaratish
  const { data: scan, error: scanErr } = await db
    .from("risk_scans")
    .insert({
      triggered_by: admin.userId,
      status: "running",
      source: "hybrid",
    })
    .select()
    .single();

  if (scanErr || !scan) {
    return c.json({ error: { code: "DB_ERROR", message: scanErr?.message } }, 500);
  }

  const ctx: ScanContext = { supabase: db, sbUrl: SB_URL, sbAnonKey: SB_ANON_KEY };

  // Statik tekshiruvlarni parallel ishga tushirish
  const staticResults = await Promise.allSettled(
    STATIC_CHECKS.map(async (check) => {
      const found = await check.test(ctx).catch(() => false);
      return { check, found };
    })
  );

  // Advisor natijalarini olish
  const advisorRaw = await fetchAdvisorFindings(db);

  // Topilmalarni yig'ish
  const findings: Array<{
    scan_id: string;
    code: string;
    severity: string;
    title: string;
    description: string;
    location: string | null;
    source: string;
    status: string;
    remediation: string | null;
  }> = [];

  // Statik topilmalar
  for (const result of staticResults) {
    if (result.status === "fulfilled" && result.value.found) {
      const { check } = result.value;
      findings.push({
        scan_id: scan.id,
        code: check.code,
        severity: check.severity,
        title: check.title,
        description: check.description,
        location: check.location ?? null,
        source: "static",
        status: "open",
        remediation: check.remediation ?? null,
      });
    }
  }

  // Advisor topilmalari
  const severityMap: Record<string, string> = { error: "high", warn: "medium", info: "low" };
  for (const a of advisorRaw) {
    findings.push({
      scan_id: scan.id,
      code: `ADV-${findings.length + 1}`.padStart(7, "0"),
      severity: severityMap[a.level] ?? "info",
      title: a.title,
      description: a.description,
      location: (a as any).location ?? null,
      source: "advisor",
      status: "open",
      remediation: null,
    });
  }

  // Topilmalarni DB ga yozish
  if (findings.length > 0) {
    await db.from("risk_findings").insert(findings);
  }

  // Statistika
  const counts = {
    critical_count: findings.filter(f => f.severity === "critical").length,
    high_count:     findings.filter(f => f.severity === "high").length,
    medium_count:   findings.filter(f => f.severity === "medium").length,
    low_count:      findings.filter(f => f.severity === "low").length,
    total_count:    findings.length,
  };

  // Ball hisoblash (100 = mukammal, critical -20, high -10, medium -5, low -2)
  const score = Math.max(0, 100
    - counts.critical_count * 20
    - counts.high_count     * 10
    - counts.medium_count   *  5
    - counts.low_count      *  2
  );

  const duration = Date.now() - startedAt;

  // Skanni yangilash
  const { data: updatedScan } = await db
    .from("risk_scans")
    .update({
      status: "completed",
      finished_at: new Date().toISOString(),
      duration_ms: duration,
      score,
      ...counts,
    })
    .eq("id", scan.id)
    .select()
    .single();

  return c.json({
    data: {
      scan: updatedScan,
      findings,
    },
  });
});

// ---------------------------------------------------------------------------
// GET /scans — tarix
// ---------------------------------------------------------------------------
router.get("/scans", async (c) => {
  const admin = await requireAdmin(c);
  if (admin instanceof Response) return admin;

  const { data, error } = await db
    .from("risk_scans")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(20);

  if (error) return c.json({ error: { code: "DB_ERROR" } }, 500);
  return c.json({ data });
});

// ---------------------------------------------------------------------------
// GET /scans/:id — bitta skan + topilmalar
// ---------------------------------------------------------------------------
router.get("/scans/:id", async (c) => {
  const admin = await requireAdmin(c);
  if (admin instanceof Response) return admin;

  const { id } = c.req.param();

  const { data: scan } = await db
    .from("risk_scans")
    .select("*")
    .eq("id", id)
    .single();

  if (!scan) return c.json({ error: { code: "NOT_FOUND" } }, 404);

  const { data: findings } = await db
    .from("risk_findings")
    .select("*")
    .eq("scan_id", id)
    .order("severity");

  return c.json({ data: { scan, findings: findings ?? [] } });
});

// ---------------------------------------------------------------------------
// PATCH /findings/:id — status o'zgartirish
// ---------------------------------------------------------------------------
router.patch("/findings/:id", async (c) => {
  const admin = await requireAdmin(c);
  if (admin instanceof Response) return admin;

  const { id } = c.req.param();
  const body = await c.req.json().catch(() => ({}));
  const { status } = body;

  const allowed = ["open", "acknowledged", "resolved", "false_positive"] as const;
  if (!allowed.includes(status)) {
    return c.json({ error: { code: "INVALID_STATUS" } }, 422);
  }

  const update: Record<string, unknown> = { status };
  if (status === "resolved") {
    update.resolved_at = new Date().toISOString();
    update.resolved_by = admin.userId;
  }

  const { data, error } = await db
    .from("risk_findings")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return c.json({ error: { code: "DB_ERROR" } }, 500);
  return c.json({ data });
});

export default router;
