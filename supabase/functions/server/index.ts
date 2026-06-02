import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { createClient } from "npm:@supabase/supabase-js@2.49.8";
import { Webhook } from "npm:svix@1.17.0";
import { logRequest, logAudit, logAI, truncate } from "../_shared/logging.ts";
import { OPENAPI_SPEC, renderScalarHtml } from "./openapi.ts";
import { callClaude, classifyComplexity } from "./services/llm-router.ts";
import {
  searchKnowledgeBase,
  addDisclaimerIfNeeded,
} from "./services/knowledge-base.ts";
import { checkAiSafety, wrapUserMessage } from "./services/ai-safety.ts";
import riskScanRoutes from "./routes/risk-scan.ts";
import { guardUsage, recordUsage } from "./services/usage-tracking.ts";

const app = new Hono();
const BASE_PATH = "/make-server-6c2837d6";
const V1_PATH = `${BASE_PATH}/v1`;
const GATEWAY_PREFIX = "/bright-api";

// B-011: Structured JSON request logging middleware
app.use("*", async (c, next) => {
  const start = Date.now();
  const traceId = c.req.header("X-Trace-Id") ?? crypto.randomUUID();
  const tenantId = c.req.header("X-Tenant-Id") ?? "";
  const userId = c.req.header("X-User-Id") ?? "";
  c.set("trace_id" as never, traceId);

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;
  const level =
    status >= 500
      ? "error"
      : status >= 400
        ? "warn"
        : duration > 2000
          ? "warn"
          : "info";

  logRequest({
    level,
    message: `${c.req.method} ${c.req.path} → ${status} (${duration}ms)`,
    traceId,
    tenantId: tenantId || undefined,
    userId: userId || undefined,
    data: {
      method: c.req.method,
      path: c.req.path,
      status,
      duration_ms: duration,
      ...(duration > 2000 ? { slow_query: true } : {}),
    },
  });
});

app.use(
  "/*",
  cors({
    origin: [
      "https://aibizconcierge.uz",
      "https://ai-business-concierge1.netlify.app",
      "http://localhost:5173",
      "http://localhost:4173",
    ],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Tenant-Id",
      "X-User-Id",
      "X-Trace-Id",
    ],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

type TenantContext = {
  tenantId: string;
  userId?: string;
  roles?: string[];
  permissions?: string[];
};

const TRACE_ID_KEY = "trace_id";
const TENANT_CTX_KEY = "tenant_context";
const TENANT_ID_KEY = "tenantId";
const JWT_SECRET = Deno.env.get("JWT_SECRET") ?? "";
const SB_URL = Deno.env.get("SB_URL") ?? Deno.env.get("SUPABASE_URL") ?? "";
const SB_SERVICE_ROLE_KEY =
  Deno.env.get("SB_SERVICE_ROLE_KEY") ??
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
  "";
const SB_ANON_KEY =
  Deno.env.get("SB_ANON_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini";
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const RESEND_WEBHOOK_SECRET = Deno.env.get("RESEND_WEBHOOK_SECRET") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM_EMAIL =
  Deno.env.get("RESEND_FROM_EMAIL") ?? "noreply@aibizconcierge.uz";
const APP_URL =
  Deno.env.get("APP_URL") ?? "https://ai-business-concierge1.netlify.app";
const ADMIN_NOTIFY_EMAIL = Deno.env.get("ADMIN_NOTIFY_EMAIL") ?? "";

const supabase = createClient(SB_URL, SB_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const TOOL_REGISTRY = [
  {
    tool_name: "classify_inbox",
    description:
      "Classify inbox item into HR/Docs/Sales/Support/Billing/General",
    input_schema: {
      type: "object",
      properties: { message: { type: "string" } },
      required: ["message"],
    },
    output_schema: {
      type: "object",
      properties: {
        category: { type: "string" },
        reason: { type: "string" },
      },
      required: ["category"],
    },
    handler: "InboxClassifierService",
  },
  {
    tool_name: "create_task",
    description: "Create a task from extracted action",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        priority: { type: "string" },
        due_date: { type: "string" },
      },
      required: ["title"],
    },
    output_schema: {
      type: "object",
      properties: { task_id: { type: "string" } },
      required: ["task_id"],
    },
    handler: "CreateTaskService",
  },
  {
    tool_name: "search_docs",
    description: "Search internal docs for relevant snippets",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string" },
        top_k: { type: "number" },
      },
      required: ["query"],
    },
    output_schema: {
      type: "object",
      properties: {
        results: { type: "array" },
      },
      required: ["results"],
    },
    handler: "DocSearchService",
  },
];

const HR_CASES_SEED = [
  {
    id: "hr_001",
    title: "Burnout risk flagged",
    employee: "M. Karimova",
    status: "open",
    priority: "high",
    created_at: "2026-02-03T09:10:00Z",
    summary:
      "Marketing bo'limida stress yuqori, so'rovnoma natijalari diqqat talab qiladi.",
  },
  {
    id: "hr_002",
    title: "Onboarding feedback",
    employee: "A. Rakhimov",
    status: "in_review",
    priority: "medium",
    created_at: "2026-01-31T14:40:00Z",
    summary: "Yangi xodim uchun onboarding jarayoni kechikmoqda.",
  },
  {
    id: "hr_003",
    title: "Policy acknowledgement",
    employee: "N. Usmonova",
    status: "resolved",
    priority: "low",
    created_at: "2026-01-22T11:05:00Z",
    summary: "HR siyosati bilan tanishganlik bo'yicha tasdiq.",
  },
];

const INTEGRATIONS_SEED = [
  {
    id: "int_telegram",
    name: "Telegram",
    description: "Unified inbox uchun Telegram bot",
    status: "connected",
    last_sync: "2026-02-05T09:20:00Z",
  },
  {
    id: "int_email",
    name: "Email",
    description: "Support va billing xatlari",
    status: "pending",
    last_sync: "2026-02-04T18:10:00Z",
  },
  {
    id: "int_amocrm",
    name: "AmoCRM",
    description: "Sales pipeline integratsiyasi",
    status: "disconnected",
    last_sync: "2026-01-30T12:00:00Z",
  },
];

const getTraceId = (c: any) => c.get(TRACE_ID_KEY) ?? crypto.randomUUID();
const getTenantId = (c: any) =>
  c.get(TENANT_ID_KEY) ?? c.get(TENANT_CTX_KEY)?.tenantId;

const success = (c: any, data: any, meta: Record<string, unknown> = {}) =>
  c.json({
    data,
    meta: { success: true, trace_id: getTraceId(c), ...meta },
  });

const failure = (
  c: any,
  status: number,
  code: string,
  message: string,
  fields?: Record<string, unknown>,
) =>
  c.json(
    {
      data: null,
      meta: {
        success: false,
        trace_id: getTraceId(c),
        errors: [
          {
            code,
            message,
            ...(fields ? { fields } : {}),
          },
        ],
      },
    },
    status,
  );

const decodeBase64Url = (input: string) => {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );
  return atob(padded);
};

const decodeBase64UrlBytes = (input: string) => {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
};

const verifyJwtHS256 = async (token: string) => {
  if (!JWT_SECRET) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, signatureB64] = parts;
  try {
    const header = JSON.parse(decodeBase64Url(headerB64));
    if (header.alg !== "HS256") return null;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signature = decodeBase64UrlBytes(signatureB64);
    const valid = await crypto.subtle.verify("HMAC", key, signature, data);
    if (!valid) return null;
    const payload = JSON.parse(decodeBase64Url(payloadB64));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
};

/** JWT_SECRET kerak emas – Supabase Auth API orqali token tekshirish */
const verifyTokenViaSupabaseAuth = async (
  token: string,
): Promise<{ sub: string; email?: string } | null> => {
  const apikey = SB_ANON_KEY || SB_SERVICE_ROLE_KEY;
  if (!SB_URL || !apikey) return null;
  try {
    const res = await fetch(`${SB_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const id = data?.id ?? data?.sub;
    if (!id) return null;
    return { sub: id, email: data?.email ?? undefined };
  } catch {
    return null;
  }
};

const getTenantContext = async (c: any): Promise<TenantContext | null> => {
  const existing = c.get(TENANT_CTX_KEY);
  if (existing) return existing;

  const auth = c.req.header("authorization");
  if (auth?.startsWith("Bearer ")) {
    const token = auth.replace("Bearer ", "").trim();
    let payload = await verifyJwtHS256(token);
    if (!payload) {
      const supabaseUser = await verifyTokenViaSupabaseAuth(token);
      if (supabaseUser) payload = { sub: supabaseUser.sub };
    }
    if (payload) {
      const userId = payload.sub ?? payload.user_id;
      if (!userId) return null;

      // Case 1: JWT da tenant_id to'g'ridan mavjud (custom claim)
      const jwtTenantId = payload.tenant_id;
      if (jwtTenantId) {
        const ctx: TenantContext = {
          tenantId: jwtTenantId,
          userId,
          roles: payload.roles ?? payload.app_metadata?.roles ?? [],
          permissions: payload.permissions ?? [],
        };
        c.set(TENANT_CTX_KEY, ctx);
        c.set(TENANT_ID_KEY, jwtTenantId);
        return ctx;
      }

      // Case 2: JWT da tenant_id yo'q — header tenantini DB da tekshirib tasdiqlaymiz
      const headerTenantId = c.req.header("x-tenant-id");
      if (headerTenantId) {
        const { data: membership } = await supabase
          .from("user_tenants")
          .select("tenant_id")
          .eq("user_id", userId)
          .eq("tenant_id", headerTenantId)
          .maybeSingle();
        if (!membership) return null; // Foydalanuvchi bu tenantga tegishli emas
        const ctx: TenantContext = {
          tenantId: headerTenantId,
          userId,
          roles: payload.roles ?? payload.app_metadata?.roles ?? [],
          permissions: payload.permissions ?? [],
        };
        c.set(TENANT_CTX_KEY, ctx);
        c.set(TENANT_ID_KEY, headerTenantId);
        return ctx;
      }
    }
  }

  // Autentifikatsiyasiz header fallback — yo'q qilindi (K-001)
  return null;
};

const callOpenAI = async (payload: Record<string, unknown>) => {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OPENAI_ERROR:${response.status}:${errorBody}`);
  }
  return response.json();
};

const requireTenant = async (c: any) => {
  const ctx = await getTenantContext(c);
  if (!ctx) {
    return failure(c, 401, "TENANT_REQUIRED", "Tenant context topilmadi.");
  }
  return ctx;
};

const writeAuditLog = async (
  ctx: TenantContext,
  entry: {
    event_type: string;
    entity_type?: string;
    entity_id?: string;
    trace_id: string;
    payload?: Record<string, unknown>;
  },
) => {
  const row = {
    tenant_id: ctx.tenantId,
    user_id: ctx.userId ?? null,
    event_type: entry.event_type,
    entity_type: entry.entity_type ?? null,
    entity_id: entry.entity_id ?? null,
    trace_id: entry.trace_id,
    payload: entry.payload ?? {},
    action: entry.event_type,
  };
  try {
    await supabase.from("audit_logs").insert(row);
    logAudit({
      message: entry.event_type,
      traceId: entry.trace_id,
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      category: "audit",
      data: { entity_type: entry.entity_type, entity_id: entry.entity_id },
    });
  } catch (e) {
    logError({
      message: "audit_log insert failed",
      traceId: entry.trace_id,
      data: { err: String(e) },
    });
  }
};

/** Vazifa biriktirilganda mas'ulga bildirishnoma yaratish */
const createTaskAssignmentNotification = async (
  tenantId: string,
  assigneeId: string,
  taskId: string,
  taskTitle: string,
) => {
  try {
    await supabase.from("notifications").insert({
      tenant_id: tenantId,
      user_id: assigneeId,
      type: "task_assigned",
      title: "Yangi vazifa biriktirildi",
      message: `"${taskTitle}" vazifasi sizga biriktirildi. Statusni tasdiqlang.`,
      task_id: taskId,
    });
  } catch (e) {
    console.error("createTaskAssignmentNotification error:", e);
  }
};

const createDocAssignmentNotification = async (
  tenantId: string,
  assigneeId: string,
  docId: string,
  docTitle: string,
) => {
  try {
    await supabase.from("notifications").insert({
      tenant_id: tenantId,
      user_id: assigneeId,
      type: "doc_assigned",
      title: "Yangi hujjat biriktirildi",
      message: `"${docTitle}" hujjati sizga biriktirildi. Iltimos ko'rib chiqing.`,
    });
  } catch (e) {
    console.error("createDocAssignmentNotification error:", e);
  }
};

// HR/leader larni xabardor qilish: xodim akkauntini sozladi
const createHrSetupCompleteNotification = async (
  tenantId: string,
  employeeName: string,
) => {
  try {
    const { data: hrUsers } = await supabase
      .from("user_tenants")
      .select("user_id")
      .eq("tenant_id", tenantId)
      .in("role", ["leader", "hr"])
      .eq("status", "active");

    if (!hrUsers?.length) return;

    const rows = hrUsers.map((u) => ({
      tenant_id: tenantId,
      user_id: u.user_id,
      type: "employee_setup_complete",
      title: "Xodim ro'yxatdan o'tdi",
      message: `${employeeName} akkauntini sozladi va tasdiqlashni kutmoqda.`,
    }));
    await supabase.from("notifications").insert(rows);
  } catch (e) {
    console.error("createHrSetupCompleteNotification error:", e);
  }
};

// Xodimni xabardor qilish: HR tasdiqladi
const createEmployeeConfirmedNotification = async (
  tenantId: string,
  userId: string,
) => {
  try {
    await supabase.from("notifications").insert({
      tenant_id: tenantId,
      user_id: userId,
      type: "employee_confirmed",
      title: "Hisobingiz tasdiqlandi",
      message:
        "HR xodimi siz tasdiqladi. Endi platformaning barcha imkoniyatlaridan foydalanishingiz mumkin.",
    });
  } catch (e) {
    console.error("createEmployeeConfirmedNotification error:", e);
  }
};

type AiInteractionEntry = {
  role: string;
  prompt_name: string;
  prompt_version: string;
  locale: string;
  input_excerpt?: string;
  output_excerpt?: string;
  tools_used?: Array<{ name: string; success: boolean; error_code?: string }>;
  success_flag: boolean;
  error_code?: string | null;
  latency_ms: number;
  trace_id: string;
};

const writeAiInteraction = async (
  ctx: TenantContext,
  entry: AiInteractionEntry,
) => {
  const row = {
    tenant_id: ctx.tenantId,
    user_id: ctx.userId ?? null,
    role: entry.role,
    prompt_name: entry.prompt_name,
    prompt_version: entry.prompt_version,
    locale: entry.locale,
    input_excerpt: truncate(entry.input_excerpt ?? "", 500),
    output_excerpt: truncate(entry.output_excerpt ?? "", 500),
    tools_used: entry.tools_used ?? [],
    success_flag: entry.success_flag,
    error_code: entry.error_code ?? null,
    latency_ms: entry.latency_ms,
    trace_id: entry.trace_id,
  };
  try {
    await supabase.from("ai_interactions").insert(row);
    logAI({
      message: `AI ${entry.prompt_name} ${entry.success_flag ? "ok" : "error"}`,
      traceId: entry.trace_id,
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      data: { latency_ms: entry.latency_ms, success: entry.success_flag },
    });
  } catch (e) {
    logError({
      message: "ai_interaction insert failed",
      traceId: entry.trace_id,
      data: { err: String(e) },
    });
  }
};

// ---------------------------------------------------------------------------
// insertAiUsageLog — ai_usage_logs jadvaliga non-blocking yozish
// Billing va cost tracking uchun. service_role client ishlatadi (RLS bypass).
// ---------------------------------------------------------------------------
type AiUsageLogEntry = {
  tenantId: string;
  userId?: string | null;
  endpoint: string;
  model: string;
  provider: string; // 'claude' | 'openai' | 'fallback'
  complexity?: string;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
  cached: boolean;
  latencyMs: number;
  traceId: string;
};

const insertAiUsageLog = (entry: AiUsageLogEntry): void => {
  // provider constraint: ('claude','openai','fallback')
  const providerNorm =
    entry.provider === "openai_fallback"
      ? "openai"
      : ["claude", "openai", "fallback"].includes(entry.provider)
        ? entry.provider
        : "fallback";

  supabase
    .from("ai_usage_logs")
    .insert({
      tenant_id: entry.tenantId,
      user_id: entry.userId ?? null,
      endpoint: entry.endpoint,
      model: entry.model,
      provider: providerNorm,
      complexity: entry.complexity ?? null,
      prompt_tokens: entry.promptTokens,
      completion_tokens: entry.completionTokens,
      cost_usd: entry.costUsd,
      cached: entry.cached,
      latency_ms: entry.latencyMs,
      trace_id: entry.traceId,
    })
    .then(({ error }) => {
      if (error) console.error("[ai_usage_log] insert error:", error.message);
    });
};

app.use("*", async (c, next) => {
  const traceId = c.req.header("x-trace-id") ?? crypto.randomUUID();
  c.set(TRACE_ID_KEY, traceId);
  const startedAt = Date.now();
  try {
    await next();
  } finally {
    const ctx = await getTenantContext(c);
    const durationMs = Date.now() - startedAt;
    const statusCode = c.res?.status ?? 200;
    const logEntry = {
      trace_id: traceId,
      method: c.req.method,
      path: c.req.path,
      status_code: statusCode,
      duration_ms: durationMs,
      tenant_id: ctx?.tenantId ?? null,
      user_id: ctx?.userId ?? null,
      ip: c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip") ?? null,
      user_agent: c.req.header("user-agent") ?? null,
      extra: {},
    };
    try {
      await supabase.from("request_logs").insert(logEntry);
      logRequest({
        message: `${c.req.method} ${c.req.path}`,
        traceId,
        tenantId: ctx?.tenantId,
        userId: ctx?.userId,
        data: { status_code: statusCode, duration_ms: durationMs },
      });
    } catch (e) {
      logError({
        message: "request_log insert failed",
        traceId,
        data: { err: String(e) },
      });
    }
  }
});

app.onError((err, c) => {
  console.error(err);
  return failure(c, 500, "INTERNAL_ERROR", "Kutilmagan xatolik yuz berdi.");
});

const ALLOWED_TASK_STATUSES = ["todo", "in_progress", "review", "done"];
const ALLOWED_TASK_PRIORITIES = ["high", "medium", "low"];

const getMockTasks = () => [
  {
    id: "t-1",
    title: "Q4 Moliyaviy hisobotni tayyorlash",
    status: "in_progress",
    priority: "high",
    assignee: { name: "Aziza M." },
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    tags: ["Finance", "Report"],
    comments: 3,
  },
  {
    id: "t-2",
    title: "Yangi ofis menejerini ishga olish",
    status: "todo",
    priority: "medium",
    assignee: { name: "Jasur A." },
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    tags: ["HR", "Hiring"],
    comments: 0,
  },
];

const getMockInbox = () => [
  {
    id: "1",
    source: "telegram",
    sender: { name: "Aziz Rakhimov (HR Lead)" },
    subject: "Yangi ofis menejeri vakansiyasi",
    preview:
      "Assalomu alaykum. Yangi ofis menejeri uchun e'lon matnini tasdiqlashingiz kerak.",
    timestamp: new Date().toISOString(),
    isRead: false,
    category: "HR",
    priority: "High",
    tags: ["Approval", "Recruiting"],
    source_message_id: "seed-1",
  },
  {
    id: "2",
    source: "email",
    sender: { name: "Stripe Billing", email: "billing@stripe.com" },
    subject: "Invoice #4023 payment failed",
    preview: "We were unable to charge your card ending in 4242.",
    timestamp: new Date().toISOString(),
    isRead: false,
    category: "Billing",
    priority: "High",
    tags: ["Finance", "Urgent"],
    source_message_id: "seed-2",
  },
];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const computeDashboardStats = (
  tasks: any[],
  inboxItems: any[],
  documents: { metadata?: { expiry_date?: string } }[] = [],
) => {
  const dueDate = (t: any) => t.due_date ?? t.dueDate;
  const overdue = tasks.filter((task) => {
    const d = dueDate(task);
    return d && new Date(d) < new Date() && task.status !== "done";
  }).length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const pendingApprovals = inboxItems.filter(
    (item) => item.category === "HR" || item.category === "Billing",
  ).length;
  const healthScore = Math.max(
    60,
    Math.min(100, 100 - overdue * 5 - pendingApprovals * 3),
  );
  const monthlyRevenue = 40000 + doneCount * 500 - overdue * 200;

  const now = new Date();
  const chartData = DAY_LABELS.map((day, i) => {
    const dayScore = Math.max(
      60,
      Math.min(100, healthScore - (6 - i) * 2 + (i % 2)),
    );
    return { day, score: dayScore };
  });

  const insights: {
    type: "danger" | "warning" | "info";
    title: string;
    desc: string;
  }[] = [];

  if (overdue > 0 || inboxItems.some((i) => i.category === "Billing")) {
    insights.push({
      type: "danger",
      title: "Kassadagi yetishmovchilik xavfi",
      desc:
        overdue > 0
          ? `${overdue} ta muddati o'tgan vazifa. Joriy xarajatlar sur'ati bilan 15-sana uchun kutilayotgan balans manfiy bo'lishi mumkin.`
          : "Billing xabarlari kutilmoqda. Joriy xarajatlar sur'ati bilan 15-sana uchun kutilayotgan balans manfiy bo'lishi mumkin.",
    });
  }

  const hrCount = inboxItems.filter((i) => i.category === "HR").length;
  if (hrCount >= 2 || pendingApprovals > 0) {
    insights.push({
      type: "warning",
      title: "HR: Diqqat talab qiladi",
      desc:
        hrCount >= 2
          ? `Oxirgi so'rovnomalarda Marketing bo'limida stress darajasi oshgan. ${hrCount} ta HR xabari kutilmoqda.`
          : `${pendingApprovals} ta tasdiqlash kutilmoqda. Oxirgi so'rovnomalarda stress darajasi oshgan bo'lishi mumkin.`,
    });
  }

  const expiringDocs = documents.filter((d) => {
    const exp = d.metadata?.expiry_date;
    if (!exp) return false;
    const expDate = new Date(exp);
    const daysLeft = Math.ceil((expDate.getTime() - now.getTime()) / 86400000);
    return daysLeft > 0 && daysLeft <= 14;
  });
  if (expiringDocs.length > 0) {
    const d = expiringDocs[0];
    const exp = d.metadata?.expiry_date;
    const daysLeft = exp
      ? Math.ceil((new Date(exp).getTime() - now.getTime()) / 86400000)
      : 0;
    insights.push({
      type: "info",
      title: "Shartnoma muddati tugamoqda",
      desc: `Shartnoma ${daysLeft} kundan keyin tugaydi. Avto-yangilash o'chiq.`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: "info",
      title: "Hammasi yaxshi",
      desc: "Hozircha diqqat talab qiladigan masalalar yo'q. Davom eting!",
    });
  }

  const prevOverdue = Math.max(0, overdue - 1);
  const trendOverdue = overdue - prevOverdue;
  const trendHealth =
    healthScore >= 95 ? "+2%" : healthScore >= 85 ? "+1%" : "0%";
  const trendRevenue =
    doneCount > 0 ? `+${Math.min(15, doneCount * 2)}%` : "0%";

  return {
    healthScore,
    monthlyRevenue,
    tasksOverdue: overdue,
    pendingApprovals,
    chartData,
    insights,
    trendHealth,
    trendRevenue,
    trendOverdue: trendOverdue <= 0 ? `${trendOverdue}` : `+${trendOverdue}`,
    trendApprovals: pendingApprovals > 0 ? `${pendingApprovals}` : "0",
  };
};

const ROLE_ACCESS: Record<string, string[]> = {
  super_admin: [
    "admin",
    "reports",
    "inbox",
    "tasks",
    "hr",
    "docs",
    "integrations",
    "settings",
    "billing",
    "ai",
    "knowledge_base",
  ],
  leader: [
    "reports",
    "inbox",
    "tasks",
    "hr",
    "docs",
    "integrations",
    "settings",
  ],
  hr: ["reports", "inbox", "tasks", "hr", "docs", "settings"],
  accounting: ["reports", "docs", "integrations", "settings"],
  department_head: ["reports", "inbox", "tasks", "docs", "settings"],
  employee: ["inbox", "tasks", "settings"],
};

// ─── DB-based rate limit: contact form ────────────────────────────────────────
const CONTACT_LIMIT = 3;
const CONTACT_WINDOW_MS = 60 * 60 * 1000; // 1 soat

async function checkContactRateLimit(ip: string): Promise<boolean> {
  const windowStart = new Date(
    Math.floor(Date.now() / CONTACT_WINDOW_MS) * CONTACT_WINDOW_MS,
  ).toISOString();
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: `contact:${ip}`,
    p_window_start: windowStart,
    p_limit: CONTACT_LIMIT,
  });
  if (error) {
    // DB xatosi bo'lsa — fail open (ruxsat berish)
    console.warn("[rate-limit] DB check failed, allowing request:", error.message);
    return true;
  }
  return data === true;
}

// ─── Email helpers ────────────────────────────────────────────────────────────
async function sendCompanyInviteEmail(
  to: string,
  name: string,
  token: string,
): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn(
      "[invite] RESEND_API_KEY yo'q, email yuborilmadi. Link:",
      `${APP_URL}/register?token=${token}`,
    );
    return;
  }
  const link = `${APP_URL}/register?token=${token}`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `AI Business Concierge <${RESEND_FROM_EMAIL}>`,
        to: [to],
        subject: "AI Business Concierge — Kompaniya ro'yxatdan o'tish taklifi",
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;background:#0f172a;color:#e2e8f0;border-radius:16px">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
    <div style="width:44px;height:44px;border-radius:12px;background:#6366f1;display:flex;align-items:center;justify-content:center;font-size:22px">✦</div>
    <span style="font-size:18px;font-weight:700;color:#fff">AI Business Concierge</span>
  </div>
  <h2 style="color:#fff;margin-bottom:8px">Assalomu alaykum, ${name}!</h2>
  <p style="color:#94a3b8;line-height:1.6">Sizning kompaniya murojaatingiz ko'rib chiqildi. Sizni platformamizga qo'shishdan mamnunmiz!</p>
  <p style="color:#94a3b8;line-height:1.6">Kompaniyangizni ro'yxatdan o'tkazish uchun quyidagi tugmani bosing:</p>
  <a href="${link}" style="display:inline-block;padding:14px 28px;background:#6366f1;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;margin:20px 0;font-size:15px">
    Ro'yxatdan o'tish →
  </a>
  <p style="color:#64748b;font-size:13px;margin-top:24px;padding-top:16px;border-top:1px solid #1e293b">
    Havolaning amal qilish muddati: <strong>48 soat</strong>.<br>
    Agar siz bu so'rovni yubormagan bo'lsangiz, ushbu emailni e'tiborsiz qoldiring.
  </p>
</div>`,
      }),
    });
    if (!res.ok) console.warn("[invite] Resend error:", await res.text());
    else console.info(`[invite] Email sent to ${to}`);
  } catch (e) {
    console.warn("[invite] Email yuborishda xatolik:", e);
  }
}

// ─── Generic Resend sender ────────────────────────────────────────────────────
async function sendResendEmail(
  to: string,
  subject: string,
  html: string,
  tag: string,
): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn(`[${tag}] RESEND_API_KEY yo'q, email yuborilmadi.`);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `AI Business Concierge <${RESEND_FROM_EMAIL}>`,
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) console.warn(`[${tag}] Resend error:`, await res.text());
    else console.info(`[${tag}] Email sent to ${to}`);
  } catch (e) {
    console.warn(`[${tag}] Email yuborishda xatolik:`, e);
  }
}

function emailLayout(content: string): string {
  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;background:#0f172a;color:#e2e8f0;border-radius:16px">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px">
    <div style="width:44px;height:44px;border-radius:12px;background:#6366f1;display:flex;align-items:center;justify-content:center;font-size:22px">✦</div>
    <span style="font-size:18px;font-weight:700;color:#fff">AI Business Concierge</span>
  </div>
  ${content}
  <div style="margin-top:32px;padding-top:20px;border-top:1px solid #1e293b;font-size:12px;color:#475569">
    © 2026 AI Business Concierge · <a href="${APP_URL}" style="color:#6366f1;text-decoration:none">aibizconcierge.uz</a>
  </div>
</div>`;
}

function emailBtn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;padding:14px 28px;background:#6366f1;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;margin:20px 0;font-size:15px">${label} →</a>`;
}

// 2. Company registered (pending approval)
async function sendCompanyRegisteredEmail(
  to: string,
  name: string,
  companyName: string,
): Promise<void> {
  const html = emailLayout(`
    <h2 style="color:#fff;margin-bottom:8px">Tabriklaymiz, ${name}!</h2>
    <p style="color:#94a3b8;line-height:1.6"><strong style="color:#a5b4fc">${companyName}</strong> kompaniyangiz muvaffaqiyatli ro'yxatdan o'tdi.</p>
    <div style="background:#1e293b;border-radius:12px;padding:20px;margin:20px 0">
      <p style="color:#cbd5e1;margin:0;font-size:14px">⏳ <strong>Holat:</strong> Admin ko'rib chiqmoqda</p>
      <p style="color:#64748b;margin:8px 0 0;font-size:13px">Odatda 1–2 ish kuni ichida javob beramiz. Tasdiqlangach email orqali xabardor qilinasiz.</p>
    </div>
    <p style="color:#64748b;font-size:13px">Savol bo'lsa: <a href="mailto:support@aibizconcierge.uz" style="color:#6366f1">support@aibizconcierge.uz</a></p>
  `);
  await sendResendEmail(
    to,
    "Ro'yxatdan o'tish qabul qilindi — AI Business Concierge",
    html,
    "company_registered",
  );
}

// 3. Company rejected
async function sendCompanyRejectedEmail(
  to: string,
  name: string,
  reason?: string,
): Promise<void> {
  const html = emailLayout(`
    <h2 style="color:#fff;margin-bottom:8px">Hurmatli ${name},</h2>
    <p style="color:#94a3b8;line-height:1.6">Afsuski, murojaatingiz ko'rib chiqildi va hozircha qabul qilinmadi.</p>
    ${reason ? `<div style="background:#1e293b;border-radius:12px;padding:16px;margin:16px 0"><p style="color:#94a3b8;margin:0;font-size:14px"><strong>Sabab:</strong> ${reason}</p></div>` : ""}
    <p style="color:#94a3b8;line-height:1.6">Agar savol yoki murojaat bo'lsa, biz bilan bog'laning:</p>
    ${emailBtn(`${APP_URL}/contact`, "Qayta murojaat qilish")}
    <p style="color:#64748b;font-size:13px">Yoki: <a href="mailto:support@aibizconcierge.uz" style="color:#6366f1">support@aibizconcierge.uz</a></p>
  `);
  await sendResendEmail(
    to,
    "Murojaat holati — AI Business Concierge",
    html,
    "company_rejected",
  );
}

// 4. Company approved (tenant active)
async function sendCompanyApprovedEmail(
  to: string,
  name: string,
  companyName: string,
): Promise<void> {
  const html = emailLayout(`
    <h2 style="color:#fff;margin-bottom:8px">🎉 Kompaniya tasdiqlandi!</h2>
    <p style="color:#94a3b8;line-height:1.6">Hurmatli <strong style="color:#fff">${name}</strong>, <strong style="color:#a5b4fc">${companyName}</strong> kompaniyangiz admin tomonidan tasdiqlandi.</p>
    <p style="color:#94a3b8;line-height:1.6">Endi platforma imkoniyatlaridan to'liq foydalanishingiz mumkin: xodimlar qo'shish, vazifalar, AI yordamchi va boshqalar.</p>
    ${emailBtn(`${APP_URL}/app`, "Dashboardga kirish")}
  `);
  await sendResendEmail(
    to,
    "Kompaniya tasdiqlandi — AI Business Concierge",
    html,
    "company_approved",
  );
}

// 5. Employee invite (supplemental branded)
async function sendEmployeeInviteEmail(
  to: string,
  name: string,
  companyName: string,
  setupLink: string,
): Promise<void> {
  const html = emailLayout(`
    <h2 style="color:#fff;margin-bottom:8px">Assalomu alaykum, ${name}!</h2>
    <p style="color:#94a3b8;line-height:1.6"><strong style="color:#a5b4fc">${companyName}</strong> kompaniyasi sizni AI Business Concierge platformasiga qo'shdi.</p>
    <p style="color:#94a3b8;line-height:1.6">Akkauntingizni sozlash uchun quyidagi tugmani bosing va parol o'rnating:</p>
    ${emailBtn(setupLink, "Akkauntni sozlash")}
    <p style="color:#64748b;font-size:13px;margin-top:8px">Havola <strong>48 soat</strong> davomida amal qiladi.<br>Agar siz bu taklifni kutmagan bo'lsangiz, ushbu emailni e'tiborsiz qoldiring.</p>
  `);
  await sendResendEmail(
    to,
    `${companyName} — Platformaga taklif`,
    html,
    "employee_invite",
  );
}

// 6. Employee welcome (after setup-complete)
async function sendEmployeeWelcomeEmail(
  to: string,
  name: string,
  companyName: string,
): Promise<void> {
  const html = emailLayout(`
    <h2 style="color:#fff;margin-bottom:8px">Xush kelibsiz, ${name}! 👋</h2>
    <p style="color:#94a3b8;line-height:1.6">Akkauntingiz muvaffaqiyatli sozlandi. Siz <strong style="color:#a5b4fc">${companyName}</strong> platformasining to'liq a'zosisiz.</p>
    <div style="background:#1e293b;border-radius:12px;padding:20px;margin:20px 0">
      <p style="color:#a5b4fc;margin:0 0 12px;font-weight:600;font-size:14px">Nima qila olasiz:</p>
      <ul style="color:#94a3b8;font-size:14px;line-height:1.8;margin:0;padding-left:20px">
        <li>Vazifalar va loyihalar boshqaruvi</li>
        <li>AI yordamchi bilan ishlash</li>
        <li>Xabarlar va bildirishnomalar</li>
      </ul>
    </div>
    ${emailBtn(`${APP_URL}/app`, "Dashboardga kirish")}
  `);
  await sendResendEmail(
    to,
    "Xush kelibsiz — AI Business Concierge",
    html,
    "employee_welcome",
  );
}

// 7. Admin notification: new company registration
async function sendAdminNewRegistrationEmail(
  companyName: string,
  leaderName: string,
  leaderEmail: string,
  tenantId: string,
): Promise<void> {
  if (!ADMIN_NOTIFY_EMAIL) return;
  const html = emailLayout(`
    <h2 style="color:#fff;margin-bottom:8px">Yangi kompaniya ro'yxatdan o'tdi</h2>
    <div style="background:#1e293b;border-radius:12px;padding:20px;margin:20px 0">
      <p style="color:#cbd5e1;margin:0 0 8px;font-size:14px"><strong>Kompaniya:</strong> ${companyName}</p>
      <p style="color:#cbd5e1;margin:0 0 8px;font-size:14px"><strong>Rahbar:</strong> ${leaderName}</p>
      <p style="color:#cbd5e1;margin:0 0 8px;font-size:14px"><strong>Email:</strong> ${leaderEmail}</p>
      <p style="color:#64748b;margin:0;font-size:13px">Tenant ID: ${tenantId}</p>
    </div>
    <p style="color:#94a3b8;line-height:1.6">Admin panelida ko'rib chiqing va tasdiqlang yoki rad eting.</p>
    ${emailBtn(`${APP_URL}/app`, "Admin panelga kirish")}
  `);
  await sendResendEmail(
    ADMIN_NOTIFY_EMAIL,
    `Yangi ro'yxatdan o'tish: ${companyName}`,
    html,
    "admin_new_reg",
  );
}

const registerRoutes = (prefix: string) => {
  app.get(`${prefix}/health`, (c) => c.json({ status: "ok" }));

  // ─── POST /v1/contact — public, rate limited ──────────────────────────────
  app.post(`${prefix}/contact`, async (c) => {
    const ip =
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!(await checkContactRateLimit(ip))) {
      return c.json(
        {
          error: {
            code: "RATE_LIMITED",
            message:
              "Soatda 3 ta murojaat yubora olasiz. Keyinroq urinib ko'ring.",
          },
        },
        429,
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await c.req.json();
    } catch {
      return c.json(
        { error: { code: "INVALID_JSON", message: "JSON format xato." } },
        400,
      );
    }

    const full_name = String(body.full_name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim();
    const company_name = String(body.company_name ?? "").trim() || null;
    const stir = String(body.stir ?? "").trim() || null;
    const business_type = String(body.business_type ?? "").trim() || null;
    const employee_count = String(body.employee_count ?? "").trim() || null;
    const message = String(body.message ?? "").trim() || null;
    const source = String(body.source ?? "").trim() || null;

    if (!full_name || !phone || !email) {
      return c.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "full_name, phone, email majburiy.",
          },
        },
        400,
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Email format noto'g'ri.",
          },
        },
        400,
      );
    }

    const allowed_bt = ["yatt", "llc", "jsc", "other", null];
    const allowed_ec = ["1-10", "11-50", "51-200", "200+", null];
    const allowed_src = [
      "ads",
      "referral",
      "search",
      "telegram",
      "other",
      null,
    ];
    if (!allowed_bt.includes(business_type as string | null)) {
      return c.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "business_type noto'g'ri.",
          },
        },
        400,
      );
    }

    const { error: dbErr } = await supabase.from("contact_requests").insert({
      full_name,
      phone,
      email,
      company_name,
      stir,
      business_type: allowed_bt.includes(business_type as string | null)
        ? business_type
        : null,
      employee_count: allowed_ec.includes(employee_count as string | null)
        ? employee_count
        : null,
      message,
      source: allowed_src.includes(source as string | null) ? source : null,
      status: "new",
    });

    if (dbErr) {
      console.error("[contact] db error:", dbErr);
      return c.json(
        {
          error: {
            code: "SERVER_ERROR",
            message: "Server xatosi. Qaytadan urinib ko'ring.",
          },
        },
        500,
      );
    }

    // TODO: Resend orqali admin emailiga xabar yuborish (Phase 1.5.4)
    console.info(
      `[contact] new request from ${email} (${company_name ?? "—"})`,
    );

    return c.json({ success: true }, 201);
  });

  app.get(`${prefix}/auth/me`, async (c) => {
    const auth = c.req.header("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return failure(c, 401, "UNAUTHORIZED", "Token talab qilinadi.");
    }
    const token = auth.replace("Bearer ", "").trim();
    // Supabase Auth API orqali tokenni tekshirish (JWT_SECRET talab qilmaydi)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return failure(
        c,
        401,
        "INVALID_TOKEN",
        "Token noto'g'ri yoki muddati tugagan.",
      );
    }
    const userId = user.id;

    const { data: assignments, error } = await supabase
      .from("user_tenants")
      .select("tenant_id, role, full_name")
      .eq("user_id", userId);

    if (error) {
      return failure(c, 500, "DB_ERROR", "Profil yuklashda xatolik.");
    }

    const tenants = (assignments ?? []).map((a) => ({
      id: a.tenant_id,
      role: a.role,
      fullName: a.full_name,
      permissions: ROLE_ACCESS[a.role] ?? [],
    }));

    // SUPER_ADMIN cross-tenant access:
    // Foydalanuvchi super_admin rolida bo'lsa, tizimdagi BARCHA tenantlarga
    // (a'zo bo'lmaganlariga ham) super_admin sifatida kira oladi.
    // Bu tenant switcher'da hammasini ko'rsatish va boshqarish uchun.
    const isSuperAdmin = tenants.some((t) => t.role === "super_admin");
    if (isSuperAdmin) {
      const { data: allTenants } = await supabase
        .from("tenants")
        .select("id, name, plan");
      const existingIds = new Set(tenants.map((t) => t.id));
      const fullName = tenants[0]?.fullName ?? user.email ?? "Super Admin";
      for (const t of allTenants ?? []) {
        if (!existingIds.has(t.id)) {
          tenants.push({
            id: t.id,
            role: "super_admin",
            fullName,
            permissions:
              ROLE_ACCESS["super_admin"] ?? ROLE_ACCESS["leader"] ?? [],
          });
        }
      }
    }

    const { data: tenantRows } = await supabase
      .from("tenants")
      .select("id, name, plan")
      .in(
        "id",
        tenants.map((t) => t.id),
      );

    const tenantMap = Object.fromEntries(
      (tenantRows ?? []).map((t) => [t.id, t]),
    );

    const enrichedTenants = tenants.map((t) => ({
      ...t,
      name: tenantMap[t.id]?.name ?? t.id,
      plan: tenantMap[t.id]?.plan ?? "Pro",
    }));

    return success(c, {
      user: {
        id: userId,
        email: user.email ?? null,
      },
      tenants: enrichedTenants,
      defaultTenant: enrichedTenants[0] ?? null,
    });
  });

  app.get(`${prefix}/dashboard`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const { data: viewRow } = await supabase
      .from("tenant_daily_stats")
      .select(
        "total_tasks, open_tasks, overdue_tasks, done_tasks, inbox_unread_count, pending_approvals",
      )
      .eq("tenant_id", ctx.tenantId)
      .single();

    const { data: documents } = await supabase
      .from("documents")
      .select("id, title, metadata")
      .eq("tenant_id", ctx.tenantId)
      .limit(100);

    const safeDocs = documents ?? [];
    const overdue = viewRow?.overdue_tasks ?? 0;
    const doneCount = viewRow?.done_tasks ?? 0;
    const pendingApprovals = viewRow?.pending_approvals ?? 0;
    const healthScore = Math.max(
      60,
      Math.min(100, 100 - overdue * 5 - pendingApprovals * 3),
    );
    const monthlyRevenue = 40000 + doneCount * 500 - overdue * 200;

    const chartData = DAY_LABELS.map((day, i) => ({
      day,
      score: Math.max(60, Math.min(100, healthScore - (6 - i) * 2 + (i % 2))),
    }));

    const insights: {
      type: "danger" | "warning" | "info";
      title: string;
      desc: string;
    }[] = [];
    if (overdue > 0 || pendingApprovals > 0) {
      insights.push({
        type: "danger",
        title: "Kassadagi yetishmovchilik xavfi",
        desc:
          overdue > 0
            ? `${overdue} ta muddati o'tgan vazifa. Joriy xarajatlar sur'ati bilan 15-sana uchun kutilayotgan balans manfiy bo'lishi mumkin.`
            : "Billing xabarlari kutilmoqda. Joriy xarajatlar sur'ati bilan 15-sana uchun kutilayotgan balans manfiy bo'lishi mumkin.",
      });
    }
    const hrCount = viewRow?.inbox_unread_count ?? 0;
    if (hrCount >= 2 || pendingApprovals > 0) {
      insights.push({
        type: "warning",
        title: "HR: Diqqat talab qiladi",
        desc:
          hrCount >= 2
            ? `Oxirgi so'rovnomalarda Marketing bo'limida stress darajasi oshgan. ${hrCount} ta HR xabari kutilmoqda.`
            : `${pendingApprovals} ta tasdiqlash kutilmoqda. Oxirgi so'rovnomalarda stress darajasi oshgan bo'lishi mumkin.`,
      });
    }
    const now = new Date();
    const expiringDocs = safeDocs.filter((d: any) => {
      const exp = d.metadata?.expiry_date;
      if (!exp) return false;
      const daysLeft = Math.ceil(
        (new Date(exp).getTime() - now.getTime()) / 86400000,
      );
      return daysLeft > 0 && daysLeft <= 14;
    });
    if (expiringDocs.length > 0) {
      const d = expiringDocs[0];
      const exp = d.metadata?.expiry_date;
      const daysLeft = exp
        ? Math.ceil((new Date(exp).getTime() - now.getTime()) / 86400000)
        : 0;
      insights.push({
        type: "info",
        title: "Shartnoma muddati tugamoqda",
        desc: `Shartnoma ${daysLeft} kundan keyin tugaydi. Avto-yangilash o'chiq.`,
      });
    }
    if (insights.length === 0) {
      insights.push({
        type: "info",
        title: "Hammasi yaxshi",
        desc: "Hozircha diqqat talab qiladigan masalalar yo'q. Davom eting!",
      });
    }

    const trendOverdue = overdue - Math.max(0, overdue - 1);
    const trendHealth =
      healthScore >= 95 ? "+2%" : healthScore >= 85 ? "+1%" : "0%";
    const trendRevenue =
      doneCount > 0 ? `+${Math.min(15, doneCount * 2)}%` : "0%";

    const stats = {
      healthScore,
      monthlyRevenue,
      tasksOverdue: overdue,
      pendingApprovals,
      chartData,
      insights,
      trendHealth,
      trendRevenue,
      trendOverdue: trendOverdue <= 0 ? `${trendOverdue}` : `+${trendOverdue}`,
      trendApprovals: pendingApprovals > 0 ? `${pendingApprovals}` : "0",
    };
    return success(c, stats);
  });

  // ─── GET /analytics — real DB aggregation for reports/charts ───────────────
  app.get(`${prefix}/analytics`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;
    const tenantId = ctx.tenantId;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

    // 1) Task status counts
    const { data: taskRows } = await supabase
      .from("tasks")
      .select("status, created_at, due_date")
      .eq("tenant_id", tenantId)
      .is("deleted_at", null);

    const tasks = taskRows ?? [];
    const taskStats = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "todo").length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      done: tasks.filter((t) => t.status === "done").length,
      overdue: tasks.filter(
        (t) => t.status !== "done" && t.due_date && new Date(t.due_date) < now,
      ).length,
    };

    // 2) Tasks created per day (last 7 days)
    const taskTrend: { day: string; created: number; done: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const label = d.toLocaleDateString("uz-UZ", { weekday: "short" });
      const dayStr = d.toISOString().slice(0, 10);
      taskTrend.push({
        day: label,
        created: tasks.filter((t) => t.created_at?.slice(0, 10) === dayStr)
          .length,
        done: tasks.filter(
          (t) => t.status === "done" && t.created_at?.slice(0, 10) === dayStr,
        ).length,
      });
    }

    // 3) Inbox volume by category (last 30 days)
    const { data: inboxRows } = await supabase
      .from("inbox_items")
      .select("category")
      .eq("tenant_id", tenantId)
      .gte("timestamp", thirtyDaysAgo);

    const inboxByCategory: Record<string, number> = {};
    for (const r of inboxRows ?? []) {
      const cat = r.category ?? "Other";
      inboxByCategory[cat] = (inboxByCategory[cat] ?? 0) + 1;
    }
    const inboxCategories = Object.entries(inboxByCategory)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // 4) Employee counts (active vs pending)
    const { data: memberRows } = await supabase
      .from("user_tenants")
      .select("status, created_at")
      .eq("tenant_id", tenantId);

    const members = memberRows ?? [];
    const employeeStats = {
      total: members.length,
      active: members.filter((m) => m.status === "active").length,
      pending: members.filter(
        (m) => m.status !== "active" && m.status !== "terminated",
      ).length,
      recent_joins: members.filter((m) => m.created_at >= sevenDaysAgo).length,
    };

    return success(c, {
      taskStats,
      taskTrend,
      inboxCategories,
      employeeStats,
      generatedAt: now.toISOString(),
    });
  });

  app.get(`${prefix}/inbox`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const { data, error } = await supabase
      .from("inbox_items")
      .select("*")
      .eq("tenant_id", ctx.tenantId)
      .order("timestamp", { ascending: false });
    if (error) {
      return failure(c, 500, "DB_ERROR", "Inbox yuklashda xatolik.");
    }
    return success(c, data?.length ? data : getMockInbox());
  });

  app.post(`${prefix}/inbox/ingest`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const body = await c.req.json();
    const sourceMessageId = body?.source_message_id;
    if (!sourceMessageId) {
      return failure(
        c,
        400,
        "INVALID_PAYLOAD",
        "source_message_id talab qilinadi.",
      );
    }

    const newItem = {
      tenant_id: ctx.tenantId,
      source: body.source ?? "email",
      sender: body.sender ?? { name: "Unknown" },
      subject: body.subject ?? "(no subject)",
      preview: body.preview ?? "",
      timestamp: body.timestamp ?? new Date().toISOString(),
      is_read: false,
      category: body.category ?? "General",
      priority: body.priority ?? "Medium",
      tags: body.tags ?? [],
      source_message_id: sourceMessageId,
    };

    const { data: existing } = await supabase
      .from("inbox_items")
      .select("*")
      .eq("tenant_id", ctx.tenantId)
      .eq("source_message_id", sourceMessageId)
      .maybeSingle();
    if (existing) {
      return success(c, existing, { idempotent: true });
    }

    const { data, error } = await supabase
      .from("inbox_items")
      .insert(newItem)
      .select("*")
      .single();
    if (error) {
      return failure(c, 500, "DB_ERROR", "Inbox saqlashda xatolik.");
    }

    await writeAuditLog(ctx as TenantContext, {
      event_type: "inbox_ingest",
      entity_type: "inbox_item",
      trace_id: getTraceId(c),
      payload: { source_message_id: sourceMessageId, source: newItem.source },
    });

    return success(c, data, { idempotent: false });
  });

  // R-001: Resend email.received webhook (auth talab qilmaydi)
  app.post(`${prefix}/inbox/webhook/resend`, async (c) => {
    const rawBody = await c.req.text();
    if (!rawBody) {
      return failure(c, 400, "INVALID_PAYLOAD", "Body bo'sh.");
    }

    if (!RESEND_WEBHOOK_SECRET) {
      console.error("[SECURITY] RESEND_WEBHOOK_SECRET sozlanmagan — webhook rad etildi");
      return failure(c, 503, "CONFIG_ERROR", "Webhook tekshiruvi sozlanmagan.");
    }
    try {
      const wh = new Webhook(RESEND_WEBHOOK_SECRET);
      const headers = {
        "svix-id": c.req.header("svix-id") ?? "",
        "svix-timestamp": c.req.header("svix-timestamp") ?? "",
        "svix-signature": c.req.header("svix-signature") ?? "",
      };
      wh.verify(rawBody, headers);
    } catch {
      return failure(
        c,
        401,
        "INVALID_SIGNATURE",
        "Webhook imzosi noto'g'ri.",
      );
    }

    let payload: {
      type?: string;
      data?: {
        email_id?: string;
        from?: string;
        to?: string[];
        subject?: string;
        created_at?: string;
      };
    };
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return failure(c, 400, "INVALID_JSON", "JSON parse xatosi.");
    }

    if (payload?.type !== "email.received" || !payload?.data) {
      return c.json({ received: true }, 200);
    }

    const { email_id, from, to, subject, created_at } = payload.data;
    const toRaw = Array.isArray(to) ? to : [to].filter(Boolean);
    const toAddrs = toRaw
      .map((e) => {
        const s = String(e).trim();
        const match = s.match(/<([^>]+)>/);
        return (match ? match[1] : s).toLowerCase();
      })
      .filter(Boolean);
    if (!toAddrs.length) {
      return c.json({ received: true }, 200);
    }

    const { data: mappings, error: mapErr } = await supabase
      .from("tenant_inbox_emails")
      .select("tenant_id")
      .in("email_address", toAddrs)
      .limit(1);
    let mapping = mappings?.[0];

    if (!mapping?.tenant_id) {
      const { data: defaultTenant } = await supabase
        .from("tenants")
        .select("id")
        .limit(1)
        .single();
      if (defaultTenant?.id) {
        mapping = { tenant_id: defaultTenant.id };
        console.warn(
          "Resend webhook: mapping yo'q, default tenant ishlatildi, to=",
          toAddrs,
        );
      } else {
        console.warn(
          "Resend webhook: tenant topilmadi, to=",
          toAddrs,
          "mapErr=",
          mapErr,
        );
        return c.json({ received: true }, 200);
      }
    }

    const senderMatch = String(from || "").match(/^([^<]*)<?([^>]*)>?$/);
    const senderName = (senderMatch?.[1]?.trim() || "Unknown").replace(
      /^["']|["']$/g,
      "",
    );
    const senderEmail = senderMatch?.[2]?.trim() || "";
    const sender = { name: senderName || "Unknown", email: senderEmail };

    const sourceMessageId =
      email_id || `resend-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const newItem = {
      tenant_id: mapping.tenant_id,
      source: "email",
      sender,
      subject: subject || "(no subject)",
      preview: subject || "",
      timestamp: created_at || new Date().toISOString(),
      is_read: false,
      category: "General",
      priority: "Medium",
      tags: [] as string[],
      source_message_id: sourceMessageId,
    };

    const { data: existing } = await supabase
      .from("inbox_items")
      .select("id")
      .eq("tenant_id", mapping.tenant_id)
      .eq("source_message_id", sourceMessageId)
      .maybeSingle();

    if (existing) {
      return c.json({ received: true, idempotent: true }, 200);
    }

    const { error } = await supabase.from("inbox_items").insert(newItem);
    if (error) {
      console.error("Resend webhook insert error:", error);
      return failure(c, 500, "DB_ERROR", "Inbox saqlashda xatolik.");
    }

    return c.json({ received: true }, 200);
  });

  // ─── GET /v1/settings/profile — joriy foydalanuvchi profili ──────────────
  app.get(`${prefix}/settings/profile`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;
    const userId = (ctx as any).userId as string;
    const tenantId = (ctx as any).tenantId as string;

    const { data, error } = await supabase
      .from("user_tenants")
      .select("full_name, role, position, phone")
      .eq("user_id", userId)
      .eq("tenant_id", tenantId)
      .single();
    if (error || !data)
      return failure(c, 404, "NOT_FOUND", "Profil topilmadi.");

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.admin.getUserById(userId);
    if (authErr || !user)
      return failure(c, 500, "AUTH_ERROR", "Auth foydalanuvchi topilmadi.");

    return success(c, {
      full_name: data.full_name,
      email: user.email ?? null,
      role: data.role,
      position: data.position ?? null,
      phone: data.phone ?? null,
    });
  });

  // ─── PATCH /v1/settings/profile — o'z profilini yangilash ───────────────
  app.patch(`${prefix}/settings/profile`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;
    const userId = (ctx as any).userId as string;
    const tenantId = (ctx as any).tenantId as string;

    const body = await c.req.json().catch(() => ({}));
    const { full_name, phone } = body as { full_name?: string; phone?: string };

    const updates: Record<string, unknown> = {};
    if (full_name !== undefined) {
      if (typeof full_name !== "string" || full_name.trim().length < 2)
        return failure(
          c,
          422,
          "VALIDATION_ERROR",
          "Ism kamida 2 belgi bo'lishi kerak.",
        );
      updates.full_name = full_name.trim();
    }
    if (phone !== undefined) {
      updates.phone = typeof phone === "string" ? phone.trim() || null : null;
    }
    if (Object.keys(updates).length === 0)
      return failure(
        c,
        422,
        "VALIDATION_ERROR",
        "Hech narsa o'zgartirilmagan.",
      );

    const { error } = await supabase
      .from("user_tenants")
      .update(updates)
      .eq("user_id", userId)
      .eq("tenant_id", tenantId);
    if (error) return failure(c, 500, "DB_ERROR", error.message);

    return success(c, { ...updates });
  });

  // ─── GET /v1/tenants/:id/profile — kompaniya profili ─────────────────────
  app.get(`${prefix}/tenants/:id/profile`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;
    const tenantId = c.req.param("id");
    if (tenantId !== ctx.tenantId)
      return failure(
        c,
        403,
        "FORBIDDEN",
        "Boshqa tenant profiliga kirish mumkin emas.",
      );
    const { data, error } = await supabase
      .from("tenants")
      .select(
        "id,name,status,legal_form,stir,legal_address,activity_type,reg_date,website,description,contact_phone,contact_email,bank_name,bank_account,employee_count_range,created_at,updated_at",
      )
      .eq("id", tenantId)
      .single();
    if (error || !data)
      return failure(c, 404, "NOT_FOUND", "Tenant topilmadi.");
    return success(c, data);
  });

  // ─── PATCH /v1/tenants/:id/profile — kompaniya profilini tahrirlash ───────
  app.patch(`${prefix}/tenants/:id/profile`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;
    const tenantId = c.req.param("id");
    if (tenantId !== ctx.tenantId)
      return failure(
        c,
        403,
        "FORBIDDEN",
        "Boshqa tenant profilini o'zgartira olmaysiz.",
      );

    const role = (ctx as any).role as string;
    if (
      !["company_admin", "leader", "super_admin", "sub_admin"].includes(role)
    ) {
      return failure(
        c,
        403,
        "FORBIDDEN",
        "Faqat company_admin kompaniya profilini o'zgartira oladi.",
      );
    }

    const body = await c.req.json().catch(() => ({}));
    const allowed = [
      "name",
      "legal_form",
      "stir",
      "legal_address",
      "activity_type",
      "reg_date",
      "website",
      "description",
      "contact_phone",
      "contact_email",
      "bank_name",
      "bank_account",
      "employee_count_range",
    ];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) update[key] = body[key] === "" ? null : body[key];
    }
    if (Object.keys(update).length === 0)
      return failure(c, 400, "VALIDATION_ERROR", "Hech narsa o'zgarmadi.");

    const { data, error } = await supabase
      .from("tenants")
      .update(update)
      .eq("id", tenantId)
      .select()
      .single();
    if (error) return failure(c, 500, "DB_ERROR", error.message);
    return success(c, data);
  });

  // ─── GET /v1/tenants/:id/members/:userId — xodim tafsiloti ──────────────
  app.get(`${prefix}/tenants/:id/members/:userId`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;
    const tenantId = c.req.param("id");
    const targetId = c.req.param("userId");
    if (tenantId !== ctx.tenantId)
      return failure(c, 403, "FORBIDDEN", "Boshqa tenant.");

    const [{ data: ut }, { data: ep }] = await Promise.all([
      supabase
        .from("user_tenants")
        .select("full_name,role,status,position,phone,created_at")
        .eq("tenant_id", tenantId)
        .eq("user_id", targetId)
        .single(),
      supabase
        .from("employee_profiles")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("user_id", targetId)
        .maybeSingle(),
    ]);

    if (!ut) return failure(c, 404, "NOT_FOUND", "Xodim topilmadi.");
    return success(c, { user_tenant: ut, profile: ep ?? null });
  });

  // ─── PATCH /v1/tenants/:id/members/:userId/profile — HR profil upsert ──
  app.patch(`${prefix}/tenants/:id/members/:userId/profile`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;
    const tenantId = c.req.param("id");
    const targetId = c.req.param("userId");
    const callerUserId = (ctx as any).userId as string;
    if (tenantId !== ctx.tenantId)
      return failure(c, 403, "FORBIDDEN", "Boshqa tenant.");

    const { data: callerRow } = await supabase
      .from("user_tenants")
      .select("role")
      .eq("user_id", callerUserId)
      .eq("tenant_id", tenantId)
      .single();
    const role = callerRow?.role ?? "";
    const allowed = [
      "leader",
      "hr",
      "super_admin",
      "sub_admin",
      "company_admin",
    ];
    if (!allowed.includes(role))
      return failure(
        c,
        403,
        "FORBIDDEN_ROLE",
        "Faqat HR yoki rahbar tahrir qila oladi.",
      );

    const body = await c.req.json().catch(() => ({}));
    const ALLOWED_FIELDS = [
      "last_name",
      "first_name",
      "middle_name",
      "birth_date",
      "gender",
      "citizenship",
      "passport_number",
      "jshshir",
      "address",
      "position",
      "department",
      "hire_date",
      "work_type",
      "work_schedule",
      "salary",
      "salary_currency",
      "phone",
      "email",
      "blood_group",
      "notes",
      "emergency_name",
      "emergency_phone",
      "emergency_rel",
    ];
    const data: Record<string, unknown> = {};
    for (const f of ALLOWED_FIELDS) {
      if (f in body) data[f] = body[f] === "" ? null : body[f];
    }
    if (Object.keys(data).length === 0)
      return failure(
        c,
        422,
        "VALIDATION_ERROR",
        "Hech narsa o'zgartirilmagan.",
      );
    if (!data.last_name || !data.first_name || !data.position)
      if ("last_name" in data || "first_name" in data || "position" in data)
        return failure(
          c,
          422,
          "VALIDATION_ERROR",
          "Familiya, ism va lavozim majburiy.",
        );

    const { data: result, error } = await supabase
      .from("employee_profiles")
      .upsert(
        { ...data, user_id: targetId, tenant_id: tenantId },
        { onConflict: "user_id,tenant_id" },
      )
      .select()
      .single();
    if (error) return failure(c, 500, "DB_ERROR", error.message);
    return success(c, result);
  });

  app.get(`${prefix}/tenants/:id/members`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const tenantId = c.req.param("id");
    if (tenantId !== ctx.tenantId) {
      return failure(
        c,
        403,
        "FORBIDDEN",
        "Boshqa tenant a'zolariga kirish mumkin emas.",
      );
    }

    // ?status=active|terminated|all (default: active)
    const statusFilter = c.req.query("status") ?? "active";
    if (!["active", "terminated", "all"].includes(statusFilter)) {
      return failure(c, 422, "VALIDATION_ERROR", "status parametri yaroqsiz.");
    }

    let query = supabase
      .from("user_tenants")
      .select(
        "user_id, full_name, role, status, terminated_at, termination_reason",
      )
      .eq("tenant_id", tenantId);

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    // Faol xodimlar — yangi qo'shilgan birinchi; ketganlar — eng yaqin ketgan birinchi
    if (statusFilter === "terminated") {
      query = query.order("terminated_at", { ascending: false });
    }

    const { data, error } = await query;
    if (error) {
      return failure(c, 500, "DB_ERROR", "A'zolar yuklashda xatolik.");
    }

    // Email'larni auth.users'dan olish
    const userIds = (data ?? []).map((r) => r.user_id).filter(Boolean);
    const emailMap = new Map<string, string>();
    if (userIds.length > 0) {
      // Supabase admin API: list users (paginated), filter by IDs we need
      // Optimal emas, lekin MVP uchun ishlaydi (yuzlab xodim uchun OK)
      try {
        const { data: usersRes } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });
        for (const u of usersRes?.users ?? []) {
          if (userIds.includes(u.id)) {
            emailMap.set(u.id, u.email ?? "");
          }
        }
      } catch {
        // Email yo'qligi blokchi emas — UI'da "—" ko'rinadi
      }
    }

    const members = (data ?? []).map((r) => ({
      id: r.user_id,
      name: r.full_name,
      email: emailMap.get(r.user_id) ?? null,
      role: r.role,
      status: r.status,
      terminated_at: r.terminated_at,
      termination_reason: r.termination_reason,
    }));
    return success(c, members);
  });

  // ---------------------------------------------------------------------------
  // PATCH /tenants/:id/members/:userId — role va full_name yangilash
  // ---------------------------------------------------------------------------
  app.patch(`${prefix}/tenants/:id/members/:userId`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const tenantId = c.req.param("id");
    const targetUserId = c.req.param("userId");
    if (tenantId !== ctx.tenantId) {
      return failure(c, 403, "FORBIDDEN", "Boshqa tenant.");
    }

    // Caller rolini tekshirish (user_tenants'dan)
    const callerUserId = (ctx as any).userId ?? null;
    if (!callerUserId) return failure(c, 401, "UNAUTHORIZED", "User ID yo'q.");
    // Super_admin har tenantda ruxsatga ega; boshqalar — faqat o'z tenantida
    const { data: callerRows } = await supabase
      .from("user_tenants")
      .select("role, tenant_id")
      .eq("user_id", callerUserId);
    const isSuperAdmin = (callerRows ?? []).some(
      (r) => r.role === "super_admin",
    );
    const tenantSpecificRole =
      (callerRows ?? []).find((r) => r.tenant_id === tenantId)?.role ?? "";
    const callerRole = isSuperAdmin ? "super_admin" : tenantSpecificRole;
    if (
      callerRole !== "leader" &&
      callerRole !== "hr" &&
      callerRole !== "super_admin"
    ) {
      return failure(
        c,
        403,
        "FORBIDDEN_ROLE",
        "Faqat Super Admin, Rahbar yoki HR tahrir qila oladi.",
      );
    }

    // O'zining rolini o'zgartirishni taqiqlash
    if (callerUserId === targetUserId) {
      return failure(
        c,
        403,
        "SELF_EDIT_FORBIDDEN",
        "O'zingizning rolingizni o'zgartirib bo'lmaydi.",
      );
    }

    const body = await c.req.json().catch(() => ({}));
    const { role, full_name } = body as { role?: string; full_name?: string };

    const ALLOWED_ROLES = [
      "leader",
      "hr",
      "accounting",
      "department_head",
      "employee",
    ];
    const updates: Record<string, unknown> = {};
    if (role !== undefined) {
      if (!ALLOWED_ROLES.includes(role)) {
        return failure(c, 422, "VALIDATION_ERROR", "Rol yaroqsiz.");
      }
      updates.role = role;
    }
    if (full_name !== undefined) {
      if (typeof full_name !== "string" || full_name.trim().length < 2) {
        return failure(c, 422, "VALIDATION_ERROR", "Ism kamida 2 belgi.");
      }
      updates.full_name = full_name.trim();
    }
    if (Object.keys(updates).length === 0) {
      return failure(
        c,
        422,
        "VALIDATION_ERROR",
        "Hech narsa o'zgartirilmagan.",
      );
    }

    const { error } = await supabase
      .from("user_tenants")
      .update(updates)
      .eq("user_id", targetUserId)
      .eq("tenant_id", tenantId);

    if (error) {
      return failure(c, 500, "DB_ERROR", `Yangilashda xato: ${error.message}`);
    }
    return success(c, { user_id: targetUserId, ...updates });
  });

  // ---------------------------------------------------------------------------
  // DELETE /tenants/:id/members/:userId — soft delete (status='terminated')
  // ---------------------------------------------------------------------------
  app.delete(`${prefix}/tenants/:id/members/:userId`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const tenantId = c.req.param("id");
    const targetUserId = c.req.param("userId");
    if (tenantId !== ctx.tenantId) {
      return failure(c, 403, "FORBIDDEN", "Boshqa tenant.");
    }

    // Caller rolini tekshirish
    const callerUserId = (ctx as any).userId ?? null;
    if (!callerUserId) return failure(c, 401, "UNAUTHORIZED", "User ID yo'q.");
    if (callerUserId === targetUserId) {
      return failure(
        c,
        403,
        "SELF_DELETE_FORBIDDEN",
        "O'zingizni ishdan ketkaza olmaysiz.",
      );
    }
    // Super_admin har tenantda ruxsatga ega; boshqalar — faqat o'z tenantida
    const { data: callerRows } = await supabase
      .from("user_tenants")
      .select("role, tenant_id")
      .eq("user_id", callerUserId);
    const isSuperAdmin = (callerRows ?? []).some(
      (r) => r.role === "super_admin",
    );
    const tenantSpecificRole =
      (callerRows ?? []).find((r) => r.tenant_id === tenantId)?.role ?? "";
    const callerRole = isSuperAdmin ? "super_admin" : tenantSpecificRole;
    if (
      callerRole !== "leader" &&
      callerRole !== "hr" &&
      callerRole !== "super_admin"
    ) {
      return failure(
        c,
        403,
        "FORBIDDEN_ROLE",
        "Faqat Super Admin, Rahbar yoki HR ishdan ketkaza oladi.",
      );
    }

    // Sabab body'da yoki query'da kelishi mumkin
    const body = await c.req.json().catch(() => ({}));
    const reason =
      (body as { reason?: string }).reason?.toString().slice(0, 500) ?? null;

    const { error } = await supabase
      .from("user_tenants")
      .update({
        status: "terminated",
        terminated_at: new Date().toISOString(),
        termination_reason: reason,
        terminated_by: callerUserId,
      })
      .eq("user_id", targetUserId)
      .eq("tenant_id", tenantId)
      .eq("status", "active"); // qayta-qayta o'chirishni oldini olish

    if (error) {
      return failure(
        c,
        500,
        "DB_ERROR",
        `Ishdan ketkazishda xato: ${error.message}`,
      );
    }
    return success(c, { user_id: targetUserId, status: "terminated" });
  });

  // ---------------------------------------------------------------------------
  // PATCH /tenants/:id/members/:userId/status — block / unblock xodim
  // ---------------------------------------------------------------------------
  app.patch(`${prefix}/tenants/:id/members/:userId/status`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;
    const tenantId = c.req.param("id");
    const targetUserId = c.req.param("userId");
    const callerUserId = (ctx as any).userId as string;
    if (tenantId !== ctx.tenantId)
      return failure(c, 403, "FORBIDDEN", "Boshqa tenant.");
    if (callerUserId === targetUserId)
      return failure(
        c,
        403,
        "SELF_EDIT_FORBIDDEN",
        "O'zingizni bloklab bo'lmaydi.",
      );

    const { data: callerRow } = await supabase
      .from("user_tenants")
      .select("role")
      .eq("user_id", callerUserId)
      .eq("tenant_id", tenantId)
      .single();
    const role = callerRow?.role ?? "";
    if (
      !["leader", "hr", "super_admin", "sub_admin", "company_admin"].includes(
        role,
      )
    )
      return failure(
        c,
        403,
        "FORBIDDEN_ROLE",
        "Faqat HR yoki rahbar o'zgartira oladi.",
      );

    const body = await c.req.json().catch(() => ({}));
    const { status } = body as { status?: string };
    if (!status || !["blocked", "active"].includes(status))
      return failure(
        c,
        422,
        "VALIDATION_ERROR",
        "status: 'blocked' yoki 'active' bo'lishi kerak.",
      );

    const { error } = await supabase
      .from("user_tenants")
      .update({ status })
      .eq("user_id", targetUserId)
      .eq("tenant_id", tenantId);
    if (error) return failure(c, 500, "DB_ERROR", error.message);
    return success(c, { user_id: targetUserId, status });
  });

  // ---------------------------------------------------------------------------
  // POST /tenants/:id/members/:userId/reset-password — admin parolni reset qilish
  // Faqat leader|hr|super_admin. Email link orqali yoki to'g'ridan-to'g'ri yangi parol.
  // ---------------------------------------------------------------------------
  app.post(
    `${prefix}/tenants/:id/members/:userId/reset-password`,
    async (c) => {
      const ctx = await requireTenant(c);
      if (!(ctx as any).tenantId) return ctx;

      const tenantId = c.req.param("id");
      const targetUserId = c.req.param("userId");
      if (tenantId !== ctx.tenantId) {
        return failure(c, 403, "FORBIDDEN", "Boshqa tenant.");
      }

      const callerUserId = (ctx as any).userId ?? null;
      if (!callerUserId)
        return failure(c, 401, "UNAUTHORIZED", "User ID yo'q.");
      // Super_admin har tenantda ruxsatga ega; boshqalar — faqat o'z tenantida
      const { data: callerRows } = await supabase
        .from("user_tenants")
        .select("role, tenant_id")
        .eq("user_id", callerUserId);
      const isSuperAdmin = (callerRows ?? []).some(
        (r) => r.role === "super_admin",
      );
      const tenantSpecificRole =
        (callerRows ?? []).find((r) => r.tenant_id === tenantId)?.role ?? "";
      const callerRole = isSuperAdmin ? "super_admin" : tenantSpecificRole;
      if (
        callerRole !== "leader" &&
        callerRole !== "hr" &&
        callerRole !== "super_admin"
      ) {
        return failure(
          c,
          403,
          "FORBIDDEN_ROLE",
          "Faqat Super Admin, Rahbar yoki HR parolni reset qila oladi.",
        );
      }

      const body = await c.req.json().catch(() => ({}));
      const { mode, new_password } = body as {
        mode?: "link" | "set";
        new_password?: string;
      };

      if (mode === "set") {
        if (!new_password || new_password.length < 12) {
          return failure(
            c,
            422,
            "VALIDATION_ERROR",
            "Yangi parol kamida 8 belgi.",
          );
        }
        const { error } = await supabase.auth.admin.updateUserById(
          targetUserId,
          {
            password: new_password,
          },
        );
        if (error) {
          return failure(
            c,
            500,
            "AUTH_ERROR",
            `Parolni o'zgartirib bo'lmadi: ${error.message}`,
          );
        }
        return success(c, { user_id: targetUserId, status: "password_set" });
      }

      // Default: link orqali reset
      const { data: targetUser } =
        await supabase.auth.admin.getUserById(targetUserId);
      if (!targetUser?.user?.email) {
        return failure(c, 404, "NOT_FOUND", "Xodim email topilmadi.");
      }
      const appUrl =
        Deno.env.get("APP_URL") ??
        c.req.header("origin") ??
        "https://ai-business-concierge1.netlify.app";
      const { error: linkErr } = await supabase.auth.resetPasswordForEmail(
        targetUser.user.email,
        { redirectTo: `${appUrl}/reset-password` },
      );
      if (linkErr) {
        return failure(
          c,
          500,
          "AUTH_ERROR",
          `Reset link yuborib bo'lmadi: ${linkErr.message}`,
        );
      }
      return success(c, {
        user_id: targetUserId,
        status: "reset_link_sent",
        email: targetUser.user.email,
      });
    },
  );

  // ---------------------------------------------------------------------------
  // POST /tenants/:id/members/:userId/hard-delete — butunlay o'chirish
  // (adashib kiritilgan yoki test data uchun)
  // ---------------------------------------------------------------------------
  app.post(`${prefix}/tenants/:id/members/:userId/hard-delete`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const tenantId = c.req.param("id");
    const targetUserId = c.req.param("userId");
    if (tenantId !== ctx.tenantId) {
      return failure(c, 403, "FORBIDDEN", "Boshqa tenant.");
    }

    // Caller permission
    const callerUserId = (ctx as any).userId ?? null;
    if (!callerUserId) return failure(c, 401, "UNAUTHORIZED", "User ID yo'q.");
    if (callerUserId === targetUserId) {
      return failure(
        c,
        403,
        "SELF_DELETE_FORBIDDEN",
        "O'zingizni butunlay o'chira olmaysiz.",
      );
    }
    // Super_admin har tenantda ruxsatga ega; boshqalar — faqat o'z tenantida
    const { data: callerRows } = await supabase
      .from("user_tenants")
      .select("role, tenant_id")
      .eq("user_id", callerUserId);
    const isSuperAdmin = (callerRows ?? []).some(
      (r) => r.role === "super_admin",
    );
    const tenantSpecificRole =
      (callerRows ?? []).find((r) => r.tenant_id === tenantId)?.role ?? "";
    const callerRole = isSuperAdmin ? "super_admin" : tenantSpecificRole;
    if (
      callerRole !== "leader" &&
      callerRole !== "company_admin" &&
      callerRole !== "super_admin"
    ) {
      return failure(
        c,
        403,
        "FORBIDDEN_ROLE",
        "Faqat Super Admin yoki Rahbar butunlay o'chira oladi.",
      );
    }

    // Confirmation: target xodim ismini yuborish kerak (typo prevention)
    const body = await c.req.json().catch(() => ({}));
    const confirmName =
      (body as { confirm_name?: string }).confirm_name?.trim() ?? "";
    if (!confirmName) {
      return failure(
        c,
        422,
        "VALIDATION_ERROR",
        "Tasdiqlash uchun xodim ismi majburiy.",
      );
    }
    const { data: targetRow } = await supabase
      .from("user_tenants")
      .select("full_name")
      .eq("user_id", targetUserId)
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (!targetRow) {
      return failure(c, 404, "NOT_FOUND", "Xodim topilmadi.");
    }
    if (targetRow.full_name?.trim() !== confirmName) {
      return failure(c, 422, "NAME_MISMATCH", "Yozilgan ism mos kelmadi.");
    }

    // 1. Boshqa tenantlardagi a'zoligini hisoblash
    const { count: otherCount, error: countErr } = await supabase
      .from("user_tenants")
      .select("*", { count: "exact", head: true })
      .eq("user_id", targetUserId)
      .neq("tenant_id", tenantId);

    if (countErr) {
      return failure(
        c,
        500,
        "DB_ERROR",
        "Boshqa tenant a'zoligini tekshirishda xato.",
      );
    }

    // 2. Bu tenantdan unlink
    const { error: unlinkErr } = await supabase
      .from("user_tenants")
      .delete()
      .eq("user_id", targetUserId)
      .eq("tenant_id", tenantId);

    if (unlinkErr) {
      return failure(c, 500, "DB_ERROR", `Unlink xato: ${unlinkErr.message}`);
    }

    // 3. Agar boshqa tenant yo'q bo'lsa — auth user ham o'chiriladi
    let authUserDeleted = false;
    if ((otherCount ?? 0) === 0) {
      try {
        await supabase.auth.admin.deleteUser(targetUserId);
        authUserDeleted = true;
      } catch (e) {
        // Auth deletion fail bo'lsa ham unlink muvaffaqiyatli edi — log qilamiz
        console.error("auth.admin.deleteUser failed", e);
      }
    }

    await writeAuditLog(ctx as TenantContext, {
      event_type: "employee_hard_delete",
      entity_type: "user_tenants",
      entity_id: targetUserId,
      trace_id: getTraceId(c),
      payload: {
        auth_user_deleted: authUserDeleted,
        confirmed_name: confirmName,
      },
    });

    return success(c, {
      user_id: targetUserId,
      removed_from_tenant: true,
      auth_user_deleted: authUserDeleted,
    });
  });

  // ---------------------------------------------------------------------------
  // POST /tenants/:id/members/:userId/restore — qayta tiklash
  // ---------------------------------------------------------------------------
  app.post(`${prefix}/tenants/:id/members/:userId/restore`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const tenantId = c.req.param("id");
    const targetUserId = c.req.param("userId");
    if (tenantId !== ctx.tenantId) {
      return failure(c, 403, "FORBIDDEN", "Boshqa tenant.");
    }

    const callerUserId = (ctx as any).userId ?? null;
    if (!callerUserId) return failure(c, 401, "UNAUTHORIZED", "User ID yo'q.");
    // Super_admin har tenantda ruxsatga ega; boshqalar — faqat o'z tenantida
    const { data: callerRows } = await supabase
      .from("user_tenants")
      .select("role, tenant_id")
      .eq("user_id", callerUserId);
    const isSuperAdmin = (callerRows ?? []).some(
      (r) => r.role === "super_admin",
    );
    const tenantSpecificRole =
      (callerRows ?? []).find((r) => r.tenant_id === tenantId)?.role ?? "";
    const callerRole = isSuperAdmin ? "super_admin" : tenantSpecificRole;
    if (
      callerRole !== "leader" &&
      callerRole !== "hr" &&
      callerRole !== "super_admin"
    ) {
      return failure(
        c,
        403,
        "FORBIDDEN_ROLE",
        "Faqat Super Admin, Rahbar yoki HR tiklash mumkin.",
      );
    }

    const { error } = await supabase
      .from("user_tenants")
      .update({
        status: "active",
        terminated_at: null,
        termination_reason: null,
        terminated_by: null,
      })
      .eq("user_id", targetUserId)
      .eq("tenant_id", tenantId);

    if (error) {
      return failure(c, 500, "DB_ERROR", `Tiklashda xato: ${error.message}`);
    }
    return success(c, { user_id: targetUserId, status: "active" });
  });

  // ---------------------------------------------------------------------------
  // POST /tenants/:id/members — Yangi xodim qo'shish (faqat leader | hr)
  // ---------------------------------------------------------------------------
  app.post(`${prefix}/tenants/:id/members`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const tenantId = c.req.param("id");
    if (tenantId !== ctx.tenantId) {
      return failure(
        c,
        403,
        "FORBIDDEN",
        "Boshqa tenantga xodim qo'shib bo'lmaydi.",
      );
    }

    // Caller rolini user_tenants jadvalidan o'qish (JWT'da role claim yo'q)
    const callerUserId = (ctx as any).userId ?? null;
    if (!callerUserId) {
      return failure(c, 401, "UNAUTHORIZED", "Foydalanuvchi ID yo'q.");
    }
    const { data: callerRow, error: callerErr } = await supabase
      .from("user_tenants")
      .select("role")
      .eq("user_id", callerUserId)
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (callerErr) {
      return failure(c, 500, "DB_ERROR", "Caller rolini o'qishda xato.");
    }
    const callerRole = (callerRow?.role as string) ?? "";
    if (
      callerRole !== "leader" &&
      callerRole !== "hr" &&
      callerRole !== "super_admin"
    ) {
      return failure(
        c,
        403,
        "FORBIDDEN_ROLE",
        "Faqat Super Admin, Rahbar yoki HR xodim qo'sha oladi.",
      );
    }

    const body = await c.req.json().catch(() => ({}));
    const { email, full_name, role, mode, password } = body as {
      email?: string;
      full_name?: string;
      role?: string;
      mode?: "invite" | "password";
      password?: string;
    };

    // Validatsiya
    const ALLOWED_ROLES = [
      "leader",
      "hr",
      "accounting",
      "department_head",
      "employee",
    ];
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return failure(c, 422, "VALIDATION_ERROR", "Email yaroqsiz.");
    }
    if (!full_name || full_name.trim().length < 2) {
      return failure(
        c,
        422,
        "VALIDATION_ERROR",
        "Ism kamida 2 belgi bo'lishi kerak.",
      );
    }
    if (!role || !ALLOWED_ROLES.includes(role)) {
      return failure(c, 422, "VALIDATION_ERROR", "Rol yaroqsiz.");
    }
    if (mode !== "invite" && mode !== "password") {
      return failure(
        c,
        422,
        "VALIDATION_ERROR",
        "Mode 'invite' yoki 'password' bo'lishi kerak.",
      );
    }
    if (mode === "password" && (!password || password.length < 12)) {
      return failure(c, 422, "VALIDATION_ERROR", "Parol kamida 8 belgi.");
    }

    // 1. Auth user yaratish — invite yoki password
    let userId: string | null = null;
    let actionMessage = "";

    // Production URL — env'dan yoki Origin header'dan
    const appUrl =
      Deno.env.get("APP_URL") ??
      c.req.header("origin") ??
      c.req.header("referer")?.replace(/\/$/, "") ??
      "https://ai-business-concierge1.netlify.app";

    try {
      if (mode === "invite") {
        const { data, error } = await supabase.auth.admin.inviteUserByEmail(
          email,
          {
            data: {
              full_name,
              tenant_id: tenantId,
              role,
              setup_complete: false,
            },
            redirectTo: `${appUrl}/setup-account`,
          },
        );
        if (error) throw error;
        userId = data.user?.id ?? null;
        actionMessage = "invited";
      } else {
        const { data, error } = await supabase.auth.admin.createUser({
          email,
          password: password!,
          email_confirm: true,
          user_metadata: { full_name, tenant_id: tenantId, role },
        });
        if (error) throw error;
        userId = data.user?.id ?? null;
        actionMessage = "created";
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AUTH_ERROR";
      // Email allaqachon mavjud bo'lsa Supabase 422 yoki 400 qaytaradi
      if (/already registered|exists|duplicate/i.test(msg)) {
        return failure(
          c,
          409,
          "EMAIL_EXISTS",
          "Bu email allaqachon ro'yxatdan o'tgan.",
        );
      }
      return failure(
        c,
        500,
        "AUTH_ERROR",
        `Foydalanuvchi yaratib bo'lmadi: ${msg}`,
      );
    }

    if (!userId) {
      return failure(c, 500, "AUTH_ERROR", "Foydalanuvchi ID olinmadi.");
    }

    // 2. user_tenants jadvaliga bog'lash
    const { error: linkError } = await supabase.from("user_tenants").insert({
      user_id: userId,
      tenant_id: tenantId,
      role,
      full_name: full_name.trim(),
      status: mode === "invite" ? "password_pending" : "active",
    });

    if (linkError) {
      // Rollback: agar user_tenants insert fail bo'lsa, auth user'ni o'chirish
      try {
        await supabase.auth.admin.deleteUser(userId);
      } catch {
        // best-effort rollback
      }
      return failure(
        c,
        500,
        "DB_ERROR",
        `Tenantga bog'lashda xato: ${linkError.message}`,
      );
    }

    // Supplemental branded invite email (non-blocking, alongside Supabase's native email)
    if (mode === "invite") {
      const { data: tenantRow } = await supabase
        .from("tenants")
        .select("name")
        .eq("id", tenantId)
        .single();
      const setupLink = `${appUrl}/setup-account`;
      sendEmployeeInviteEmail(
        email,
        full_name.trim(),
        tenantRow?.name ?? "Kompaniya",
        setupLink,
      );
    }

    return success(c, {
      user_id: userId,
      tenant_id: tenantId,
      role,
      full_name: full_name.trim(),
      status: actionMessage,
    });
  });

  // POST /auth/setup-complete — xodim parol va ma'lumotlarini to'ldirdi → password_set
  app.post(`${prefix}/auth/setup-complete`, async (c) => {
    const auth = c.req.header("authorization") ?? "";
    if (!auth.startsWith("Bearer "))
      return failure(c, 401, "UNAUTHORIZED", "Token kerak.");
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser(auth.slice(7));
    if (authErr || !user)
      return failure(c, 401, "UNAUTHORIZED", "Token yaroqsiz.");
    const userId = user.id;

    const { error } = await supabase
      .from("user_tenants")
      .update({ status: "password_set" })
      .eq("user_id", userId)
      .in("status", ["password_pending"]);

    if (error) {
      console.warn("[setup-complete] DB update error:", error.message);
    }

    // Send welcome email + HR notification (non-blocking)
    if (user.email) {
      const { data: utRow } = await supabase
        .from("user_tenants")
        .select("full_name, tenant_id, tenants(name)")
        .eq("user_id", userId)
        .limit(1)
        .single();
      const name = (utRow?.full_name ??
        user.user_metadata?.full_name ??
        user.email) as string;
      const companyName = ((utRow as any)?.tenants?.name ??
        "Kompaniya") as string;
      sendEmployeeWelcomeEmail(user.email, name, companyName);
      if (utRow?.tenant_id) {
        createHrSetupCompleteNotification(utRow.tenant_id, name);
      }
    }

    return success(c, { updated: !error });
  });

  // POST /tenants/:id/members/:userId/resend-invite — taklifni qayta yuborish
  app.post(`${prefix}/tenants/:id/members/:userId/resend-invite`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const tenantId = c.req.param("id");
    const targetUserId = c.req.param("userId");
    if (tenantId !== ctx.tenantId)
      return failure(c, 403, "FORBIDDEN", "Boshqa tenant.");

    const { data: callerRow } = await supabase
      .from("user_tenants")
      .select("role")
      .eq("user_id", (ctx as any).userId)
      .eq("tenant_id", tenantId)
      .maybeSingle();
    const callerRole = callerRow?.role ?? "";
    if (!["leader", "hr", "super_admin"].includes(callerRole)) {
      return failure(
        c,
        403,
        "FORBIDDEN_ROLE",
        "Faqat HR yoki Rahbar taklif yuboroladi.",
      );
    }

    const { data: userRes, error: userErr } =
      await supabase.auth.admin.getUserById(targetUserId);
    if (userErr || !userRes?.user)
      return failure(c, 404, "NOT_FOUND", "Foydalanuvchi topilmadi.");

    const email = userRes.user.email;
    if (!email)
      return failure(c, 422, "NO_EMAIL", "Foydalanuvchi emaili yo'q.");

    const appUrl =
      Deno.env.get("APP_URL") ??
      c.req.header("origin") ??
      "https://ai-business-concierge1.netlify.app";

    const { error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        data: userRes.user.user_metadata ?? {},
        redirectTo: `${appUrl}/setup-account`,
      },
    );
    if (inviteErr)
      return failure(
        c,
        500,
        "INVITE_ERROR",
        `Taklif yuborib bo'lmadi: ${inviteErr.message}`,
      );

    return success(c, { status: "invite_resent", email });
  });

  // POST /tenants/:id/members/:userId/confirm — HR xodimni tasdiqlaydi → active
  app.post(`${prefix}/tenants/:id/members/:userId/confirm`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const tenantId = c.req.param("id");
    const targetUserId = c.req.param("userId");
    if (tenantId !== ctx.tenantId)
      return failure(c, 403, "FORBIDDEN", "Boshqa tenant.");

    const { data: callerRow } = await supabase
      .from("user_tenants")
      .select("role")
      .eq("user_id", (ctx as any).userId)
      .eq("tenant_id", tenantId)
      .maybeSingle();
    const callerRole = callerRow?.role ?? "";
    if (!["leader", "hr", "super_admin"].includes(callerRole)) {
      return failure(
        c,
        403,
        "FORBIDDEN_ROLE",
        "Faqat HR yoki Rahbar tasdiqlashga ruxsatga ega.",
      );
    }

    const { error } = await supabase
      .from("user_tenants")
      .update({ status: "active" })
      .eq("user_id", targetUserId)
      .eq("tenant_id", tenantId)
      .in("status", ["password_set", "password_pending"]);

    if (error)
      return failure(c, 500, "DB_ERROR", `Tasdiqlashda xato: ${error.message}`);

    // Non-blocking in-app notification to the confirmed employee
    createEmployeeConfirmedNotification(tenantId, targetUserId);

    return success(c, { confirmed: true, user_id: targetUserId });
  });

  app.get(`${prefix}/tasks`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("tenant_id", ctx.tenantId)
      .order("created_at", { ascending: false });
    if (error) {
      return failure(c, 500, "DB_ERROR", "Tasks yuklashda xatolik.");
    }

    return success(c, data?.length ? data : getMockTasks());
  });

  app.post(`${prefix}/tasks`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const body = await c.req.json();
    if (!body?.title || typeof body.title !== "string") {
      return failure(c, 422, "VALIDATION_ERROR", "title majburiy.");
    }
    if (body.status && !ALLOWED_TASK_STATUSES.includes(body.status)) {
      return failure(c, 422, "VALIDATION_ERROR", "status noto'g'ri.");
    }
    if (body.priority && !ALLOWED_TASK_PRIORITIES.includes(body.priority)) {
      return failure(c, 422, "VALIDATION_ERROR", "priority noto'g'ri.");
    }

    const newTask = {
      tenant_id: ctx.tenantId,
      title: body.title,
      description:
        typeof body.description === "string"
          ? body.description.trim() || null
          : null,
      status: body.status || "todo",
      priority: body.priority || "medium",
      assignee: body.assignee ?? null,
      due_date: body.dueDate ?? null,
      tags: body.tags || [],
      comments: 0,
    };

    const { data, error } = await supabase
      .from("tasks")
      .insert(newTask)
      .select("*")
      .single();
    if (error) {
      return failure(c, 500, "DB_ERROR", "Task saqlashda xatolik.");
    }

    await writeAuditLog(ctx as TenantContext, {
      event_type: "task_create",
      entity_type: "task",
      entity_id: data.id,
      trace_id: getTraceId(c),
      payload: { task_id: data.id, title: newTask.title },
    });

    const assignee = body.assignee;
    if (assignee?.id && typeof assignee.id === "string") {
      await createTaskAssignmentNotification(
        ctx.tenantId,
        assignee.id,
        data.id,
        newTask.title,
      );
    }

    return success(c, data);
  });

  app.patch(`${prefix}/tasks/:id`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const taskId = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));

    const updates: Record<string, unknown> = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) {
      updates.description =
        typeof body.description === "string"
          ? body.description.trim() || null
          : null;
    }
    if (body.status !== undefined) {
      if (!ALLOWED_TASK_STATUSES.includes(body.status)) {
        return failure(c, 422, "VALIDATION_ERROR", "status noto'g'ri.");
      }
      updates.status = body.status;
    }
    if (body.priority !== undefined) {
      if (!ALLOWED_TASK_PRIORITIES.includes(body.priority)) {
        return failure(c, 422, "VALIDATION_ERROR", "priority noto'g'ri.");
      }
      updates.priority = body.priority;
    }
    if (body.assignee !== undefined) updates.assignee = body.assignee;
    if (body.dueDate !== undefined) updates.due_date = body.dueDate;
    if (body.tags !== undefined) updates.tags = body.tags;

    if (Object.keys(updates).length === 0) {
      return failure(c, 400, "INVALID_PAYLOAD", "Yangilash maydonlari yo'q.");
    }

    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId)
      .eq("tenant_id", ctx.tenantId)
      .select("*")
      .single();

    if (error) {
      return failure(c, 500, "DB_ERROR", "Task yangilashda xatolik.");
    }
    if (!data) {
      return failure(c, 404, "NOT_FOUND", "Task topilmadi.");
    }

    const assignee = body.assignee;
    if (assignee?.id && typeof assignee.id === "string") {
      await createTaskAssignmentNotification(
        ctx.tenantId,
        assignee.id,
        data.id,
        data.title,
      );
    }

    return success(c, data);
  });

  app.post(`${prefix}/tasks/:id/acknowledge`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const taskId = c.req.param("id");
    const userId = (ctx as any).userId;
    if (!userId) {
      return failure(
        c,
        401,
        "AUTH_REQUIRED",
        "Tasdiqlash uchun tizimga kirish kerak.",
      );
    }

    const { data: task, error: fetchError } = await supabase
      .from("tasks")
      .select("id, assignee")
      .eq("id", taskId)
      .eq("tenant_id", ctx.tenantId)
      .single();

    if (fetchError || !task) {
      return failure(c, 404, "NOT_FOUND", "Task topilmadi.");
    }

    const assigneeId =
      (task.assignee as { id?: string })?.id ??
      (task.assignee as { user_id?: string })?.user_id;
    if (assigneeId !== userId) {
      return failure(c, 403, "FORBIDDEN", "Faqat mas'ul tasdiqlashi mumkin.");
    }

    const { data, error } = await supabase
      .from("tasks")
      .update({ acknowledged_at: new Date().toISOString() })
      .eq("id", taskId)
      .eq("tenant_id", ctx.tenantId)
      .select("*")
      .single();

    if (error) {
      return failure(c, 500, "DB_ERROR", "Tasdiqlashda xatolik.");
    }
    return success(c, data);
  });

  app.get(`${prefix}/notifications`, async (c) => {
    const ctx = await requireTenant(c);
    const userId = (ctx as any).userId;
    if (!userId) {
      return success(c, []);
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .eq("tenant_id", ctx.tenantId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return failure(c, 500, "DB_ERROR", "Bildirishnomalar yuklashda xatolik.");
    }
    return success(c, data ?? []);
  });

  app.patch(`${prefix}/notifications/:id/read`, async (c) => {
    const ctx = await requireTenant(c);
    const userId = (ctx as any).userId;
    if (!userId) {
      return failure(c, 401, "AUTH_REQUIRED", "Tizimga kirish kerak.");
    }

    const notifId = c.req.param("id");
    const { data, error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notifId)
      .eq("user_id", userId)
      .eq("tenant_id", (ctx as any).tenantId)
      .select("*")
      .single();

    if (error || !data) {
      return failure(c, 404, "NOT_FOUND", "Bildirishnoma topilmadi.");
    }
    return success(c, data);
  });

  app.delete(`${prefix}/tasks/:id`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const taskId = c.req.param("id");
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .eq("tenant_id", ctx.tenantId);

    if (error) {
      return failure(c, 500, "DB_ERROR", "Task o'chirishda xatolik.");
    }

    return success(c, { deleted: true });
  });

  app.post(`${prefix}/ai/chat`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const body = await c.req.json().catch(() => ({}));
    if (body.system_prompt !== undefined) {
      return failure(c, 422, "VALIDATION_ERROR", "system_prompt maydoni ruxsat etilmagan.");
    }
    const { message, context, locale: reqLocale } = body;
    if (!message || typeof message !== "string") {
      return failure(c, 422, "VALIDATION_ERROR", "message majburiy.");
    }

    // ── Kvota tekshiruvi (tarif limiti) ──────────────────────────────────────
    const usageGate = await guardUsage({
      supabase,
      tenantId: (ctx as any).tenantId,
      userId: (ctx as any).userId ?? null,
      resource: "ai_requests",
    });
    if (!usageGate.ok) return c.json(usageGate.body, 429);

    // ── AI Safety: injection himoya + sanitizatsiya + rate limit ─────────────
    const safety = checkAiSafety(message, (ctx as any).userId ?? null);
    if (!safety.safe) {
      const isRu = (reqLocale ?? "uz") === "ru";
      const errMsg =
        isRu && safety.messageRu ? safety.messageRu : safety.message;
      const httpStatus = safety.code === "RATE_LIMITED" ? 429 : 422;
      return failure(c, httpStatus, safety.code, errMsg);
    }
    // Sanitizatsiya qilingan va xavfsiz xabar ishlatiladi
    const safeMessage = safety.sanitized;

    const locale = (reqLocale ?? "uz") as string;
    const promptVersion = "v2";
    const inputExcerpt = truncate(safeMessage, 500);
    const traceId = getTraceId(c);
    const aiStart = Date.now();

    // Murakkablikni aniqlash
    const complexity = classifyComplexity(safeMessage);
    const promptName = `ai_coo_${complexity}`;

    // Statik fallback (AI mavjud bo'lmasa)
    const buildFallbackReply = (input: string): string => {
      const m = input.toLowerCase();
      if (
        m.includes("xarajat") ||
        m.includes("expense") ||
        m.includes("budget")
      ) {
        return locale === "ru"
          ? "Расходы за январь составили $12,400. Это на 15% меньше прошлого месяца."
          : "Yanvar oyi xarajatlari $12,400 ni tashkil etdi. Bu o'tgan oyga nisbatan 15% kamroq.";
      }
      if (m.includes("task") || m.includes("vazifa") || m.includes("задача")) {
        return locale === "ru"
          ? "У вас сегодня 3 важные задачи."
          : "Sizda bugun 3 ta muhim vazifa bor.";
      }
      return locale === "ru"
        ? "Понятно. Изучу этот вопрос."
        : "Tushunarli. Buni o'rganib chiqaman.";
    };

    let reply = buildFallbackReply(safeMessage);
    let llmProvider = "fallback";
    let llmModel = "none";
    let llmError: string | null = null;
    let inputTokens = 0;
    let outputTokens = 0;
    let costUsd = 0;
    let cached = false;

    // 0) Knowledge Base semantic search (agar OpenAI embedding mavjud bo'lsa)
    let kbContext = context ?? "";
    let kbFound = false;
    let kbSimilarity = 0;
    if (OPENAI_API_KEY) {
      try {
        const kbResult = await searchKnowledgeBase(supabase, OPENAI_API_KEY, {
          query: safeMessage,
          locale: locale as "uz" | "ru" | "en",
          tenantId: (ctx as any).tenantId,
        });
        if (kbResult.found) {
          kbContext = kbResult.contextText + (context ? `\n\n${context}` : "");
          kbFound = true;
          kbSimilarity = kbResult.bestSimilarity;
        }
      } catch (_kbErr) {
        // KB xatosi — davom etamiz (contextSiz)
      }
    }

    // 1) Claude (asosiy)
    // wrapUserMessage: foydalanuvchi xabarini "User message:\n" blokiga o'rash (prompt layering)
    if (ANTHROPIC_API_KEY) {
      try {
        const claudeRes = await callClaude(ANTHROPIC_API_KEY, {
          message: wrapUserMessage(safeMessage),
          context: kbContext || undefined,
          locale,
          complexity,
        });
        reply = claudeRes.text || reply;
        llmProvider = "claude";
        llmModel = claudeRes.model;
        inputTokens = claudeRes.inputTokens;
        outputTokens = claudeRes.outputTokens;
        costUsd = claudeRes.costUsd;
        cached = claudeRes.cached;
      } catch (err) {
        llmError = err instanceof Error ? err.message : "CLAUDE_ERROR";
        logAI({
          message: "Claude xato, OpenAI fallback ga o'tildi",
          traceId,
          data: { error: llmError },
        });

        // 2) OpenAI fallback
        if (OPENAI_API_KEY) {
          try {
            const aiResponse = await callOpenAI({
              model: OPENAI_MODEL,
              input: [
                {
                  role: "system",
                  content:
                    "Sen AI Business Concierge. Javoblar qisqa, amaliy va foydali bo'lsin.",
                },
                { role: "user", content: wrapUserMessage(safeMessage) },
              ],
            });
            const outputText = Array.isArray(aiResponse.output)
              ? aiResponse.output
                  .flatMap((item: any) => item.content || [])
                  .map((part: any) => part.text)
                  .filter(Boolean)
                  .join("\n")
              : "";
            reply = outputText || reply;
            llmProvider = "openai_fallback";
            llmModel = OPENAI_MODEL;
            llmError = null; // OpenAI ishladi
          } catch (fallbackErr) {
            // Ikkala AI ham ishlamadi — statik fallback qoladi
            llmError = `CLAUDE:${llmError} | OPENAI:${
              fallbackErr instanceof Error
                ? fallbackErr.message
                : "OPENAI_ERROR"
            }`;
          }
        }
      }
    } else if (OPENAI_API_KEY) {
      // Faqat OpenAI mavjud
      try {
        const aiResponse = await callOpenAI({
          model: OPENAI_MODEL,
          input: [
            {
              role: "system",
              content:
                "Sen AI Business Concierge. Javoblar qisqa, amaliy va foydali bo'lsin.",
            },
            { role: "user", content: wrapUserMessage(safeMessage) },
          ],
        });
        const outputText = Array.isArray(aiResponse.output)
          ? aiResponse.output
              .flatMap((item: any) => item.content || [])
              .map((part: any) => part.text)
              .filter(Boolean)
              .join("\n")
          : "";
        reply = outputText || reply;
        llmProvider = "openai";
        llmModel = OPENAI_MODEL;
      } catch (err) {
        llmError = err instanceof Error ? err.message : "OPENAI_ERROR";
      }
    }

    const latencyMs = Date.now() - aiStart;
    const toolsUsedArr = [
      {
        name: llmModel,
        success: llmError === null,
        error_code: llmError ?? undefined,
      },
    ];

    await writeAiInteraction(ctx as TenantContext, {
      role: "AI_COO",
      prompt_name: promptName,
      prompt_version: promptVersion,
      locale,
      input_excerpt: inputExcerpt,
      output_excerpt: truncate(reply, 500),
      tools_used: toolsUsedArr,
      success_flag: llmError === null,
      error_code: llmError ?? null,
      latency_ms: latencyMs,
      trace_id: traceId,
    });

    // Har AI chaqiruv — ai_usage_logs ga non-blocking yozish (billing uchun)
    insertAiUsageLog({
      tenantId: (ctx as TenantContext).tenantId,
      userId: (ctx as TenantContext).userId,
      endpoint: "/v1/ai/chat",
      model: llmModel,
      provider: llmProvider,
      complexity,
      promptTokens: inputTokens,
      completionTokens: outputTokens,
      costUsd,
      cached,
      latencyMs,
      traceId,
    });

    // Muvaffaqiyatli AI so'rovni qaydga olish (non-blocking)
    recordUsage(supabase, (ctx as any).tenantId, (ctx as any).userId ?? null, {
      ai_requests: 1,
      ai_tokens: inputTokens + outputTokens,
    }).catch((e: unknown) => console.error("recordUsage failed", e));

    // Disclaimer — KB topilmasa yoki past similarity
    if (!kbFound || kbSimilarity < 0.85) {
      const disclaimer =
        locale === "ru"
          ? "\n\n⚠️ Это AI-консультация, которая не заменяет профессиональную юридическую или финансовую помощь."
          : "\n\n⚠️ Bu AI maslahat bo'lib, professional huquqiy yoki moliyaviy maslahat o'rnini bosmaydi.";
      if (llmProvider !== "fallback") reply = reply + disclaimer;
    }

    const responsePayload: Record<string, unknown> = {
      reply,
      provider: llmProvider,
      model: llmModel,
      complexity,
      cached,
      kb_found: kbFound,
    };
    if (llmError) responsePayload.warning = "AI_ERROR";
    if (costUsd > 0) responsePayload.cost_usd = costUsd;

    return success(c, responsePayload);
  });

  app.get(`${prefix}/ai/tools`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;
    return success(c, TOOL_REGISTRY);
  });

  // ---------------------------------------------------------------------------
  // POST /ai/feedback — AI javobiga 👍/👎 baholash (CLAUDE.md §AI qoidalari №4)
  // ---------------------------------------------------------------------------
  app.post(`${prefix}/ai/feedback`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const body = await c.req.json().catch(() => ({}));
    const { message_id, rating, comment } = body as {
      message_id?: string;
      rating?: number;
      comment?: string;
    };

    if (!message_id || typeof message_id !== "string") {
      return failure(c, 422, "VALIDATION_ERROR", "message_id majburiy.");
    }
    if (rating !== 1 && rating !== -1) {
      return failure(
        c,
        422,
        "VALIDATION_ERROR",
        "rating 1 yoki -1 bo'lishi kerak.",
      );
    }

    const { error } = await supabase.from("ai_feedback").insert({
      message_id,
      tenant_id: ctx.tenantId,
      user_id: (ctx as any).userId ?? null,
      rating,
      comment: comment?.toString().slice(0, 500) ?? null,
    });

    if (error) {
      return failure(c, 500, "DB_ERROR", "Feedbackni saqlab bo'lmadi.", {
        details: error.message,
      });
    }

    return success(c, { saved: true });
  });

  // ---------------------------------------------------------------------------
  // POST /hr/candidates/analyze — HR Candidate Analysis (skeleton)
  // To'liq dizayn: docs/HR_CANDIDATE_ANALYSIS.md
  // Implementatsiya: services/hr-candidate/* (TODO bloklari to'ldirilgach)
  // ---------------------------------------------------------------------------
  app.post(`${prefix}/hr/candidates/analyze`, async (c) => {
    // MUHIM: multipart body'ni drain qilish kerak, aks holda Deno
    // response'ni flush qilolmaydi va function timeout'ga tushadi.
    try {
      await c.req.arrayBuffer();
    } catch {
      // Drain xatosi — davom etamiz
    }

    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    // TODO: rol guard — HR | MANAGER | TENANT_ADMIN | SUPER_ADMIN
    // TODO: usage-tracking guardUsage({ resource: 'ai_requests' })
    // TODO: services/hr-candidate/index.ts.analyzeCandidate() ni chaqirish

    // Frontend types.ts dagi CandidateAnalysisResult shape ga mos
    return c.json(
      {
        request_id: crypto.randomUUID(),
        status: "error" as const,
        duration_ms: 0,
        locale: "uz" as const,
        error: {
          code: "NOT_IMPLEMENTED",
          message_uz:
            "HR Candidate Analysis modul hozircha tayyor emas. Tez orada implementatsiya tugaydi.",
          message_ja: "HR 候補者分析モジュールはまだ準備中です。",
          message_en: "HR Candidate Analysis is under implementation.",
        },
      },
      501,
    );
  });

  app.get(`${prefix}/docs`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const q = c.req.query("q")?.trim();
    let query = supabase
      .from("documents")
      .select("id, title, metadata, created_at, content")
      .eq("tenant_id", ctx.tenantId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (q) {
      query = query.ilike("title", `%${q}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Docs list error", error);
      return failure(c, 500, "DB_ERROR", "Docs list xatoligi.", {
        details: error.message,
      });
    }

    const docs = (data ?? []).map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      owner: doc.metadata?.owner ?? "Legal",
      status: doc.metadata?.status ?? "draft",
      updated_at: doc.created_at,
      content: doc.content,
    }));

    return success(c, docs);
  });

  app.get(`${prefix}/docs/:id`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const id = c.req.param("id");
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("tenant_id", ctx.tenantId)
      .eq("id", id)
      .single();

    if (error || !data) {
      if (error) {
        console.error("Docs detail error", error);
      }
      return failure(c, 404, "NOT_FOUND", "Document topilmadi.");
    }

    return success(c, data);
  });

  app.patch(`${prefix}/docs/:id`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const id = c.req.param("id");
    const payload = await c.req.json().catch(() => ({}));
    const { title, content, metadata } = payload ?? {};

    if (!title && !content && !metadata) {
      return failure(
        c,
        422,
        "VALIDATION_ERROR",
        "title/content/metadata dan biri majburiy.",
      );
    }

    const { data: existing, error: fetchError } = await supabase
      .from("documents")
      .select("*")
      .eq("tenant_id", ctx.tenantId)
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      if (fetchError) {
        console.error("Docs update fetch error", fetchError);
      }
      return failure(c, 404, "NOT_FOUND", "Document topilmadi.");
    }

    const nextTitle = title ?? existing.title;
    const nextContent = content ?? existing.content;
    const nextMetadata = metadata ?? existing.metadata ?? {};

    const { data: updated, error: updateError } = await supabase
      .from("documents")
      .update({
        title: nextTitle,
        content: nextContent,
        metadata: nextMetadata,
      })
      .eq("tenant_id", ctx.tenantId)
      .eq("id", id)
      .select("*")
      .single();

    if (updateError || !updated) {
      if (updateError) {
        console.error("Docs update error", updateError);
      }
      return failure(c, 500, "DB_ERROR", "Document yangilashda xatolik.", {
        details: updateError?.message,
      });
    }

    let chunkCount = 0;
    if (content) {
      await supabase
        .from("doc_chunks")
        .delete()
        .eq("tenant_id", ctx.tenantId)
        .eq("document_id", id);

      const chunks = String(nextContent)
        .split("\n\n")
        .map((chunk: string, idx: number) => ({
          tenant_id: ctx.tenantId,
          document_id: id,
          section: `p${idx + 1}`,
          content: chunk.trim(),
        }))
        .filter((chunk: any) => chunk.content.length > 0);

      if (chunks.length) {
        await supabase.from("doc_chunks").insert(chunks);
      }
      chunkCount = chunks.length;
    }

    await writeAuditLog(ctx as TenantContext, {
      event_type: "doc_update",
      entity_type: "document",
      entity_id: id,
      trace_id: getTraceId(c),
      payload: { document_id: id, title: nextTitle },
    });

    return success(c, { document_id: id, chunks: chunkCount });
  });

  app.delete(`${prefix}/docs/:id`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const id = c.req.param("id");
    const { data, error } = await supabase
      .from("documents")
      .delete()
      .eq("tenant_id", ctx.tenantId)
      .eq("id", id)
      .select("id")
      .single();

    if (error || !data) {
      if (error) {
        console.error("Docs delete error", error);
      }
      return failure(c, 404, "NOT_FOUND", "Document topilmadi.");
    }

    await writeAuditLog(ctx as TenantContext, {
      event_type: "doc_delete",
      entity_type: "document",
      entity_id: id,
      trace_id: getTraceId(c),
      payload: { document_id: id },
    });

    return success(c, { document_id: id });
  });

  app.get(`${prefix}/hr/cases`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;
    return success(c, HR_CASES_SEED);
  });

  app.post(`${prefix}/hr/surveys`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const { score, comment } = await c.req.json();
    if (typeof score !== "number") {
      return failure(c, 422, "VALIDATION_ERROR", "score majburiy.");
    }

    await writeAuditLog(ctx as TenantContext, {
      event_type: "hr_survey_submit",
      entity_type: "hr_survey",
      trace_id: getTraceId(c),
      payload: { score, comment: comment ?? "" },
    });

    return success(c, { status: "received" });
  });

  app.get(`${prefix}/integrations`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;
    return success(c, INTEGRATIONS_SEED);
  });

  app.post(`${prefix}/integrations/:id`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const id = c.req.param("id");
    const payload = await c.req.json().catch(() => ({}));

    await writeAuditLog(ctx as TenantContext, {
      event_type: "integration_update",
      entity_type: "integration",
      trace_id: getTraceId(c),
      payload: { id, ...payload },
    });

    return success(c, { id, status: "saved" });
  });

  app.post(`${prefix}/docs/index`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const { title, content, metadata } = await c.req.json();
    if (!title || !content) {
      return failure(c, 422, "VALIDATION_ERROR", "title va content majburiy.");
    }

    const { data: doc, error } = await supabase
      .from("documents")
      .insert({
        tenant_id: ctx.tenantId,
        title,
        content,
        metadata: metadata ?? {},
      })
      .select("*")
      .single();
    if (error) {
      console.error("Docs index error", error);
      return failure(c, 500, "DB_ERROR", "Document saqlashda xatolik.", {
        details: error.message,
      });
    }

    const chunks = String(content)
      .split("\n\n")
      .map((chunk: string, idx: number) => ({
        tenant_id: ctx.tenantId,
        document_id: doc.id,
        section: `p${idx + 1}`,
        content: chunk.trim(),
      }))
      .filter((chunk: any) => chunk.content.length > 0);

    if (chunks.length) {
      await supabase.from("doc_chunks").insert(chunks);
    }

    await writeAuditLog(ctx as TenantContext, {
      event_type: "doc_index",
      entity_type: "document",
      entity_id: doc.id,
      trace_id: getTraceId(c),
      payload: { document_id: doc.id, title },
    });

    // Mas'ul biriktirilgan bo'lsa — notification yuborish
    const assigneeId = (metadata as Record<string, unknown> | null)
      ?.assignee_id as string | undefined;
    if (assigneeId && typeof assigneeId === "string") {
      await createDocAssignmentNotification(
        ctx.tenantId,
        assigneeId,
        doc.id,
        title,
      );
    }

    return success(c, { document_id: doc.id, chunks: chunks.length });
  });

  app.post(`${prefix}/docs/search`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const { query, top_k } = await c.req.json();
    if (!query || typeof query !== "string") {
      return failure(c, 422, "VALIDATION_ERROR", "query majburiy.");
    }
    const limit = Math.min(Number(top_k) || 5, 20);

    const { data, error } = await supabase
      .from("doc_chunks")
      .select("document_id, section, content")
      .eq("tenant_id", ctx.tenantId)
      .ilike("content", `%${query}%`)
      .limit(limit);

    if (error) {
      console.error("Docs search error", error);
      return failure(c, 500, "DB_ERROR", "Search xatoligi.", {
        details: error.message,
      });
    }

    return success(c, {
      query,
      results: data ?? [],
    });
  });

  // ─── GET /v1/admin/companies — kompaniyalar ro'yxati (super_admin / sub_admin) ──
  app.get(`${prefix}/admin/companies`, async (c) => {
    const auth = c.req.header("authorization");
    if (!auth?.startsWith("Bearer "))
      return failure(c, 401, "UNAUTHORIZED", "Token kerak.");

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser(auth.slice(7));
    if (authErr || !user)
      return failure(c, 401, "UNAUTHORIZED", "Token noto'g'ri.");

    const { data: ut } = await supabase
      .from("user_tenants")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["super_admin", "sub_admin"])
      .limit(1)
      .single();
    if (!ut)
      return failure(c, 403, "FORBIDDEN", "Faqat super_admin / sub_admin.");

    const statusFilter = c.req.query("status");
    let q = supabase
      .from("tenants")
      .select(
        `
        id, name, status, legal_form, stir, legal_address,
        activity_type, contact_phone, contact_email, website,
        employee_count_range, bank_name, bank_account,
        blocked_reason, blocked_at, approved_at, created_at, updated_at,
        contact_request_id
      `,
      )
      .order("created_at", { ascending: false })
      .limit(300);
    if (statusFilter && statusFilter !== "all")
      q = q.eq("status", statusFilter);

    const { data: tenants, error } = await q;
    if (error) return failure(c, 500, "DB_ERROR", error.message);

    // Har tenant uchun member count
    const ids = (tenants ?? []).map((t: any) => t.id);
    let memberCounts: Record<string, number> = {};
    if (ids.length > 0) {
      const { data: counts } = await supabase
        .from("user_tenants")
        .select("tenant_id")
        .in("tenant_id", ids)
        .neq("status", "terminated");
      (counts ?? []).forEach((row: any) => {
        memberCounts[row.tenant_id] = (memberCounts[row.tenant_id] ?? 0) + 1;
      });
    }

    const result = (tenants ?? []).map((t: any) => ({
      ...t,
      member_count: memberCounts[t.id] ?? 0,
    }));

    return success(c, result);
  });

  // ─── GET /v1/admin/contacts — super_admin / sub_admin ─────────────────────
  app.get(`${prefix}/admin/contacts`, async (c) => {
    const auth = c.req.header("authorization");
    if (!auth?.startsWith("Bearer "))
      return failure(c, 401, "UNAUTHORIZED", "Token kerak.");

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser(auth.slice(7));
    if (authErr || !user)
      return failure(c, 401, "UNAUTHORIZED", "Token noto'g'ri.");

    const { data: ut } = await supabase
      .from("user_tenants")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["super_admin", "sub_admin"])
      .limit(1)
      .single();
    if (!ut)
      return failure(c, 403, "FORBIDDEN", "Faqat super_admin / sub_admin.");

    const status = c.req.query("status");
    let q = supabase
      .from("contact_requests")
      .select(
        "id,full_name,company_name,phone,email,business_type,employee_count,message,source,status,admin_note,invite_token,invite_expires_at,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (status && status !== "all") q = q.eq("status", status);

    const { data, error } = await q;
    if (error) return failure(c, 500, "DB_ERROR", error.message);
    return success(c, data ?? []);
  });

  // ─── GET /v1/admin/health — tizim holati (super_admin) ──────────────────────
  app.get(`${prefix}/admin/health`, async (c) => {
    const auth = c.req.header("authorization");
    if (!auth?.startsWith("Bearer "))
      return failure(c, 401, "UNAUTHORIZED", "Token kerak.");
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser(auth.slice(7));
    if (authErr || !user)
      return failure(c, 401, "UNAUTHORIZED", "Token noto'g'ri.");
    const { data: ut } = await supabase
      .from("user_tenants")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["super_admin", "sub_admin"])
      .limit(1)
      .single();
    if (!ut)
      return failure(c, 403, "FORBIDDEN", "Faqat super_admin / sub_admin.");

    const t0 = Date.now();

    const [
      { count: totalTenants },
      { count: activeTenants },
      { count: pendingTenants },
      { count: totalUsers },
      { count: activeUsers },
      { count: pendingUsers },
      { count: totalContacts },
      { count: pendingContacts },
      { count: totalNotifications },
      { count: unreadNotifications },
    ] = await Promise.all([
      supabase.from("tenants").select("*", { count: "exact", head: true }),
      supabase
        .from("tenants")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("tenants")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending_approval"),
      supabase.from("user_tenants").select("*", { count: "exact", head: true }),
      supabase
        .from("user_tenants")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("user_tenants")
        .select("*", { count: "exact", head: true })
        .eq("status", "password_pending"),
      supabase
        .from("contact_requests")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("contact_requests")
        .select("*", { count: "exact", head: true })
        .in("status", ["new", "contacted"]),
      supabase
        .from("notifications")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .is("read_at", null),
    ]);

    const dbLatencyMs = Date.now() - t0;

    return success(c, {
      status: "ok",
      checked_at: new Date().toISOString(),
      db_latency_ms: dbLatencyMs,
      tenants: {
        total: totalTenants ?? 0,
        active: activeTenants ?? 0,
        pending_approval: pendingTenants ?? 0,
      },
      users: {
        total: totalUsers ?? 0,
        active: activeUsers ?? 0,
        pending_setup: pendingUsers ?? 0,
      },
      contacts: {
        total: totalContacts ?? 0,
        needs_action: pendingContacts ?? 0,
      },
      notifications: {
        total: totalNotifications ?? 0,
        unread: unreadNotifications ?? 0,
      },
    });
  });

  // ─── POST /v1/admin/ai/chat — admin AI yordamchisi (super_admin) ────────────
  app.post(`${prefix}/admin/ai/chat`, async (c) => {
    const auth = c.req.header("authorization");
    if (!auth?.startsWith("Bearer "))
      return failure(c, 401, "UNAUTHORIZED", "Token kerak.");
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser(auth.slice(7));
    if (authErr || !user)
      return failure(c, 401, "UNAUTHORIZED", "Token noto'g'ri.");
    const { data: ut } = await supabase
      .from("user_tenants")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["super_admin", "sub_admin"])
      .limit(1)
      .single();
    if (!ut)
      return failure(c, 403, "FORBIDDEN", "Faqat super_admin / sub_admin.");

    const body = await c.req.json().catch(() => ({}));
    const { message, locale: reqLocale = "uz" } = body as {
      message?: string;
      locale?: string;
    };
    if (!message || typeof message !== "string" || !message.trim()) {
      return failure(c, 422, "VALIDATION_ERROR", "message majburiy.");
    }

    // Platforma statistikasini kontekst sifatida olish
    let platformContext = "";
    try {
      const [
        { count: tenants },
        { count: users },
        { count: pendingTenants },
        { count: pendingUsers },
      ] = await Promise.all([
        supabase.from("tenants").select("*", { count: "exact", head: true }),
        supabase
          .from("user_tenants")
          .select("*", { count: "exact", head: true })
          .eq("status", "active"),
        supabase
          .from("tenants")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending_approval"),
        supabase
          .from("user_tenants")
          .select("*", { count: "exact", head: true })
          .eq("status", "password_pending"),
      ]);
      platformContext = `Platform stats: ${tenants} tenants total, ${users} active users, ${pendingTenants} tenants pending approval, ${pendingUsers} users pending setup.`;
    } catch {
      // Kontekst yuklanmasa ham ishlayveradi
    }

    const adminSystemPrompt = `You are the AI assistant for AI Business Concierge platform administrators (super admins).
You help monitor the platform, analyze issues, answer questions about companies, users, and system health.
You have access to platform statistics. Current platform context: ${platformContext}
Respond in ${reqLocale === "ru" ? "Russian" : reqLocale === "en" ? "English" : "Uzbek"}.
Be concise, professional, and data-driven. You can help with: user management, company onboarding, system monitoring, and platform strategy.`;

    let reply = "Kechirasiz, hozir javob bera olmayapman.";
    const adminStart = Date.now();
    let adminModel = "none";
    let adminProvider = "fallback";
    let adminInputTokens = 0;
    let adminOutputTokens = 0;
    let adminCostUsd = 0;
    let adminCached = false;
    const adminTraceId = c.req.header("x-trace-id") ?? crypto.randomUUID();

    if (ANTHROPIC_API_KEY) {
      try {
        const claudeRes = await callClaude(ANTHROPIC_API_KEY, {
          message,
          systemPrompt: adminSystemPrompt,
          context: undefined,
          locale: reqLocale,
          complexity: "analysis",
        });
        if (claudeRes.text) reply = claudeRes.text;
        adminModel = claudeRes.model;
        adminProvider = "claude";
        adminInputTokens = claudeRes.inputTokens;
        adminOutputTokens = claudeRes.outputTokens;
        adminCostUsd = claudeRes.costUsd;
        adminCached = claudeRes.cached;
      } catch {
        if (OPENAI_API_KEY) {
          try {
            const oaiRes = await callOpenAI({
              model: OPENAI_MODEL,
              input: [
                { role: "system", content: adminSystemPrompt },
                { role: "user", content: message },
              ],
            });
            const text = Array.isArray(oaiRes.output)
              ? oaiRes.output
                  .flatMap((i: any) => i.content || [])
                  .map((p: any) => p.text)
                  .filter(Boolean)
                  .join("\n")
              : "";
            if (text) reply = text;
            adminModel = OPENAI_MODEL;
            adminProvider = "openai";
          } catch {
            /* fallback */
          }
        }
      }
    } else if (OPENAI_API_KEY) {
      try {
        const oaiRes = await callOpenAI({
          model: OPENAI_MODEL,
          input: [
            { role: "system", content: adminSystemPrompt },
            { role: "user", content: message },
          ],
        });
        const text = Array.isArray(oaiRes.output)
          ? oaiRes.output
              .flatMap((i: any) => i.content || [])
              .map((p: any) => p.text)
              .filter(Boolean)
              .join("\n")
          : "";
        if (text) reply = text;
        adminModel = OPENAI_MODEL;
        adminProvider = "openai";
      } catch {
        /* fallback */
      }
    }

    // TODO: admin AI usage logging — ai_usage_logs.tenant_id FK bor (tenants.id),
    // admin chatda tenant yo'q. Kelajakda: alohida admin_ai_usage_logs yoki nullable tenant_id.
    // Hozircha: faqat console log.
    if (adminModel !== "none") {
      console.info(
        `[admin/ai/chat] model=${adminModel} provider=${adminProvider} tokens=${adminInputTokens}+${adminOutputTokens} cost=$${adminCostUsd.toFixed(6)} latency=${Date.now() - adminStart}ms trace=${adminTraceId}`,
      );
    }

    return success(c, { reply });
  });

  // ─── PATCH /v1/admin/contacts/:id/status ─────────────────────────────────
  app.patch(`${prefix}/admin/contacts/:id/status`, async (c) => {
    const auth = c.req.header("authorization");
    if (!auth?.startsWith("Bearer "))
      return failure(c, 401, "UNAUTHORIZED", "Token kerak.");

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser(auth.slice(7));
    if (authErr || !user)
      return failure(c, 401, "UNAUTHORIZED", "Token noto'g'ri.");

    const { data: ut } = await supabase
      .from("user_tenants")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["super_admin", "sub_admin"])
      .limit(1)
      .single();
    if (!ut)
      return failure(c, 403, "FORBIDDEN", "Faqat super_admin / sub_admin.");

    const id = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));
    const allowed = [
      "new",
      "contacted",
      "invite_sent",
      "registered",
      "rejected",
    ];
    if (!allowed.includes(body.status)) {
      return failure(c, 400, "VALIDATION_ERROR", "Status noto'g'ri.");
    }

    const update: Record<string, unknown> = {
      status: body.status,
      handled_by: user.id,
    };
    if (body.admin_note !== undefined) update.admin_note = body.admin_note;

    let inviteToken: string | null = null;
    if (body.status === "invite_sent") {
      const { data: existing } = await supabase
        .from("contact_requests")
        .select("email,full_name,invite_token")
        .eq("id", id)
        .single();

      // Har yuborishda yangi token — eski token bekor bo'ladi (M-003)
      inviteToken =
        crypto.randomUUID().replace(/-/g, "") +
        crypto.randomUUID().replace(/-/g, "");
      const expiresAt = new Date(
        Date.now() + 48 * 60 * 60 * 1000,
      ).toISOString();
      update.invite_token = inviteToken;
      update.invite_expires_at = expiresAt;

      if (existing?.email) {
        // Non-blocking email send
        sendCompanyInviteEmail(
          existing.email,
          existing.full_name ?? "Hurmatli mijoz",
          inviteToken,
        );
      }
    }

    if (body.status === "rejected") {
      const { data: contact } = await supabase
        .from("contact_requests")
        .select("email,full_name")
        .eq("id", id)
        .single();
      if (contact?.email) {
        sendCompanyRejectedEmail(
          contact.email,
          contact.full_name ?? "Hurmatli mijoz",
          body.admin_note as string | undefined,
        );
      }
    }

    const { data, error } = await supabase
      .from("contact_requests")
      .update(update)
      .eq("id", id)
      .select()
      .single();
    if (error) return failure(c, 500, "DB_ERROR", error.message);
    return success(c, data);
  });

  // ─── GET /v1/register/validate-token?token=... — public ──────────────────
  app.get(`${prefix}/register/validate-token`, async (c) => {
    const token = c.req.query("token");
    if (!token)
      return failure(c, 400, "VALIDATION_ERROR", "token parametri kerak.");

    const { data: contact, error } = await supabase
      .from("contact_requests")
      .select(
        "id,full_name,company_name,email,phone,business_type,employee_count,status,invite_expires_at",
      )
      .eq("invite_token", token)
      .single();

    if (error || !contact)
      return failure(c, 404, "NOT_FOUND", "Token topilmadi yoki yaroqsiz.");
    if (contact.status === "registered")
      return failure(
        c,
        410,
        "ALREADY_USED",
        "Bu havola allaqachon ishlatilgan.",
      );
    if (contact.status !== "invite_sent")
      return failure(c, 400, "INVALID_TOKEN", "Token noto'g'ri holatda.");
    if (new Date(contact.invite_expires_at) < new Date()) {
      return failure(
        c,
        410,
        "TOKEN_EXPIRED",
        "Token muddati o'tgan. Admin bilan bog'laning.",
      );
    }

    return success(c, {
      contact_request_id: contact.id,
      full_name: contact.full_name,
      company_name: contact.company_name,
      email: contact.email,
      phone: contact.phone,
      business_type: contact.business_type,
      employee_count: contact.employee_count,
    });
  });

  // ─── POST /v1/register/company — public ──────────────────────────────────
  app.post(`${prefix}/register/company`, async (c) => {
    let body: Record<string, unknown>;
    try {
      body = await c.req.json();
    } catch {
      return failure(c, 400, "INVALID_JSON", "JSON format xato.");
    }

    const token = String(body.token ?? "").trim();
    const password = String(body.password ?? "").trim();
    if (!token || !password) {
      return failure(c, 400, "VALIDATION_ERROR", "token va password majburiy.");
    }
    if (password.length < 12) {
      return failure(
        c,
        400,
        "VALIDATION_ERROR",
        "Parol kamida 8 belgi bo'lishi kerak.",
      );
    }

    // Token tekshirish
    const { data: contact, error: ctErr } = await supabase
      .from("contact_requests")
      .select("id,full_name,email,status,invite_expires_at")
      .eq("invite_token", token)
      .single();

    if (ctErr || !contact)
      return failure(c, 404, "NOT_FOUND", "Token topilmadi.");
    if (contact.status === "registered")
      return failure(
        c,
        410,
        "ALREADY_USED",
        "Bu havola allaqachon ishlatilgan.",
      );
    if (contact.status !== "invite_sent")
      return failure(c, 400, "INVALID_TOKEN", "Token noto'g'ri holatda.");
    if (new Date(contact.invite_expires_at) < new Date()) {
      return failure(c, 410, "TOKEN_EXPIRED", "Token muddati o'tgan.");
    }

    // Auth user yaratish
    const { data: authData, error: authErr } =
      await supabase.auth.admin.createUser({
        email: contact.email,
        password,
        email_confirm: true,
        user_metadata: { full_name: contact.full_name },
      });
    if (authErr) {
      if (authErr.message?.includes("already")) {
        return failure(
          c,
          409,
          "EMAIL_EXISTS",
          "Bu email allaqachon ro'yxatdan o'tgan. Login sahifasiga o'ting.",
        );
      }
      return failure(c, 500, "AUTH_ERROR", authErr.message);
    }
    const userId = authData.user.id;

    // Kompaniya nomi
    const companyName = String(body.company_name ?? contact.full_name).trim();
    const legalForm = String(body.legal_form ?? "").trim() || null;
    const stir = String(body.stir ?? "").trim() || null;
    const legalAddress = String(body.legal_address ?? "").trim() || null;

    // Tenant yaratish
    const tenantId = crypto.randomUUID();
    const { error: tenantErr } = await supabase.from("tenants").insert({
      id: tenantId,
      name: companyName,
      plan: "Pro",
      status: "pending_approval",
      legal_form: legalForm,
      stir,
      legal_address: legalAddress,
      contact_email: contact.email,
      contact_request_id: contact.id,
    });
    if (tenantErr) {
      await supabase.auth.admin.deleteUser(userId);
      return failure(c, 500, "DB_ERROR", tenantErr.message);
    }

    // company_admin sifatida bog'lash
    const { error: utErr } = await supabase.from("user_tenants").insert({
      user_id: userId,
      tenant_id: tenantId,
      role: "company_admin",
      full_name: contact.full_name,
      status: "active",
    });
    if (utErr) {
      await supabase.auth.admin.deleteUser(userId);
      await supabase.from("tenants").delete().eq("id", tenantId);
      return failure(c, 500, "DB_ERROR", utErr.message);
    }

    // Contact request → registered
    await supabase
      .from("contact_requests")
      .update({
        status: "registered",
        tenant_id: tenantId,
      })
      .eq("id", contact.id);

    console.info(
      `[register] company=${companyName} tenant=${tenantId} user=${userId}`,
    );

    // Non-blocking emails
    sendCompanyRegisteredEmail(
      contact.email,
      contact.full_name ?? "Hurmatli rahbar",
      companyName,
    );
    sendAdminNewRegistrationEmail(
      companyName,
      contact.full_name ?? "—",
      contact.email,
      tenantId,
    );

    return c.json(
      {
        data: {
          tenant_id: tenantId,
          message:
            "Ro'yxatdan o'tish muvaffaqiyatli. Admin tasdiqlashini kuting.",
        },
      },
      201,
    );
  });

  // ─── PATCH /v1/admin/tenants/:id/status — kompaniyani tasdiqlash/bloklash ──
  app.patch(`${prefix}/admin/tenants/:id/status`, async (c) => {
    const auth = c.req.header("authorization");
    if (!auth?.startsWith("Bearer "))
      return failure(c, 401, "UNAUTHORIZED", "Token kerak.");
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser(auth.slice(7));
    if (authErr || !user)
      return failure(c, 401, "UNAUTHORIZED", "Token noto'g'ri.");

    const { data: ut } = await supabase
      .from("user_tenants")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["super_admin", "sub_admin"])
      .limit(1)
      .single();
    if (!ut)
      return failure(c, 403, "FORBIDDEN", "Faqat super_admin / sub_admin.");

    const tenantId = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));
    const allowed = ["active", "suspended", "blocked"];
    if (!allowed.includes(body.status)) {
      return failure(
        c,
        400,
        "VALIDATION_ERROR",
        "Status: active | suspended | blocked.",
      );
    }

    const { data: tenantRow, error: fetchErr } = await supabase
      .from("tenants")
      .select("name, contact_email")
      .eq("id", tenantId)
      .single();
    if (fetchErr || !tenantRow)
      return failure(c, 404, "NOT_FOUND", "Tenant topilmadi.");

    const { error } = await supabase
      .from("tenants")
      .update({ status: body.status })
      .eq("id", tenantId);
    if (error) return failure(c, 500, "DB_ERROR", error.message);

    // company_approved email
    if (body.status === "active" && tenantRow.contact_email) {
      const { data: leaderRow } = await supabase
        .from("user_tenants")
        .select("full_name")
        .eq("tenant_id", tenantId)
        .in("role", ["leader", "company_admin"])
        .limit(1)
        .single();
      const leaderName = leaderRow?.full_name ?? "Hurmatli rahbar";
      sendCompanyApprovedEmail(
        tenantRow.contact_email,
        leaderName,
        tenantRow.name,
      );
    }

    return success(c, { tenant_id: tenantId, status: body.status });
  });

  // ─── GET /admin/audit — audit log viewer ───────────────────────────────────
  app.get(`${prefix}/admin/audit`, async (c) => {
    const auth = c.req.header("authorization");
    if (!auth?.startsWith("Bearer "))
      return failure(c, 401, "UNAUTHORIZED", "Token kerak.");
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser(auth.slice(7));
    if (authErr || !user)
      return failure(c, 401, "UNAUTHORIZED", "Token noto'g'ri.");
    const { data: ut } = await supabase
      .from("user_tenants")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["super_admin", "sub_admin"])
      .limit(1)
      .single();
    if (!ut)
      return failure(c, 403, "FORBIDDEN", "Faqat super_admin / sub_admin.");

    const tenant_id = c.req.query("tenant_id");
    const entity_type = c.req.query("entity_type");
    const action = c.req.query("action");
    const from_date = c.req.query("from");
    const to_date = c.req.query("to");
    const limit_str = c.req.query("limit") ?? "100";
    const limit = Math.min(parseInt(limit_str) || 100, 500);

    let q = supabase
      .from("audit_logs")
      .select(
        "id, tenant_id, user_id, action, event_type, entity_type, entity_id, payload, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (tenant_id) q = q.eq("tenant_id", tenant_id);
    if (entity_type) q = q.eq("entity_type", entity_type);
    if (action) q = q.eq("action", action);
    if (from_date) q = q.gte("created_at", from_date);
    if (to_date) q = q.lte("created_at", to_date);

    const { data, error } = await q;
    if (error) return failure(c, 500, "DB_ERROR", error.message);
    return success(c, data ?? []);
  });

  // ─── Knowledge Base CRUD (admin only) ──────────────────────────────────────

  async function requireSuperAdmin(
    c: ReturnType<typeof app.route extends never ? never : any>,
  ) {
    const auth = c.req.header("authorization");
    if (!auth?.startsWith("Bearer ")) return null;
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(auth.slice(7));
    if (error || !user) return null;
    const { data: ut } = await supabase
      .from("user_tenants")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["super_admin", "sub_admin"])
      .limit(1)
      .single();
    return ut ? user : null;
  }

  // GET /admin/kb — list articles
  app.get(`${prefix}/admin/kb`, async (c) => {
    const auth = c.req.header("authorization");
    if (!auth?.startsWith("Bearer "))
      return failure(c, 401, "UNAUTHORIZED", "Token kerak.");
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser(auth.slice(7));
    if (authErr || !user)
      return failure(c, 401, "UNAUTHORIZED", "Token noto'g'ri.");
    const { data: ut } = await supabase
      .from("user_tenants")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["super_admin", "sub_admin"])
      .limit(1)
      .single();
    if (!ut)
      return failure(c, 403, "FORBIDDEN", "Faqat super_admin / sub_admin.");

    const locale = c.req.query("locale");
    const category = c.req.query("category");
    const is_active = c.req.query("is_active");

    let q = supabase
      .from("knowledge_base")
      .select(
        "id, tenant_id, locale, category, question, answer, tags, version, is_active, created_at, updated_at",
      )
      .order("created_at", { ascending: false });
    if (locale) q = q.eq("locale", locale);
    if (category) q = q.eq("category", category);
    if (is_active !== undefined) q = q.eq("is_active", is_active === "true");

    const { data, error } = await q;
    if (error) return failure(c, 500, "DB_ERROR", error.message);
    return success(c, data ?? []);
  });

  // POST /admin/kb — create article
  app.post(`${prefix}/admin/kb`, async (c) => {
    const auth = c.req.header("authorization");
    if (!auth?.startsWith("Bearer "))
      return failure(c, 401, "UNAUTHORIZED", "Token kerak.");
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser(auth.slice(7));
    if (authErr || !user)
      return failure(c, 401, "UNAUTHORIZED", "Token noto'g'ri.");
    const { data: ut } = await supabase
      .from("user_tenants")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["super_admin", "sub_admin"])
      .limit(1)
      .single();
    if (!ut)
      return failure(c, 403, "FORBIDDEN", "Faqat super_admin / sub_admin.");

    const body = await c.req.json().catch(() => ({}));
    const { locale, category, question, answer, tags, is_active, tenant_id } =
      body;
    if (!locale || !category || !question || !answer) {
      return failure(
        c,
        400,
        "VALIDATION_ERROR",
        "locale, category, question, answer majburiy.",
      );
    }

    const { data, error } = await supabase
      .from("knowledge_base")
      .insert({
        locale,
        category,
        question,
        answer,
        tags: tags ?? [],
        is_active: is_active ?? true,
        tenant_id: tenant_id ?? null,
        version: 1,
      })
      .select()
      .single();
    if (error) return failure(c, 500, "DB_ERROR", error.message);
    return success(c, data, 201);
  });

  // PUT /admin/kb/:id — update article
  app.put(`${prefix}/admin/kb/:id`, async (c) => {
    const auth = c.req.header("authorization");
    if (!auth?.startsWith("Bearer "))
      return failure(c, 401, "UNAUTHORIZED", "Token kerak.");
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser(auth.slice(7));
    if (authErr || !user)
      return failure(c, 401, "UNAUTHORIZED", "Token noto'g'ri.");
    const { data: ut } = await supabase
      .from("user_tenants")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["super_admin", "sub_admin"])
      .limit(1)
      .single();
    if (!ut)
      return failure(c, 403, "FORBIDDEN", "Faqat super_admin / sub_admin.");

    const id = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));
    const updates: Record<string, unknown> = {};
    const allowed = [
      "locale",
      "category",
      "question",
      "answer",
      "tags",
      "is_active",
      "tenant_id",
    ];
    for (const k of allowed) {
      if (k in body) updates[k] = body[k];
    }
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("knowledge_base")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) return failure(c, 500, "DB_ERROR", error.message);
    if (!data) return failure(c, 404, "NOT_FOUND", "Maqola topilmadi.");
    return success(c, data);
  });

  // DELETE /admin/kb/:id — delete article
  app.delete(`${prefix}/admin/kb/:id`, async (c) => {
    const auth = c.req.header("authorization");
    if (!auth?.startsWith("Bearer "))
      return failure(c, 401, "UNAUTHORIZED", "Token kerak.");
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser(auth.slice(7));
    if (authErr || !user)
      return failure(c, 401, "UNAUTHORIZED", "Token noto'g'ri.");
    const { data: ut } = await supabase
      .from("user_tenants")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["super_admin", "sub_admin"])
      .limit(1)
      .single();
    if (!ut)
      return failure(c, 403, "FORBIDDEN", "Faqat super_admin / sub_admin.");

    const id = c.req.param("id");
    const { error } = await supabase
      .from("knowledge_base")
      .delete()
      .eq("id", id);
    if (error) return failure(c, 500, "DB_ERROR", error.message);
    return success(c, { deleted: id });
  });
  // ── Risk Scanner ──────────────────────────────────────────────────────
  app.post(`${prefix}/admin/risk/scan`, async (c) => {
    const req = new Request("http://localhost/scan", {
      method: "POST",
      headers: c.req.raw.headers,
      body: c.req.raw.body,
    });
    return riskScanRoutes.fetch(req);
  });
  app.get(`${prefix}/admin/risk/scans`, async (c) => {
    const req = new Request("http://localhost/scans", {
      headers: c.req.raw.headers,
    });
    return riskScanRoutes.fetch(req);
  });
  app.get(`${prefix}/admin/risk/scans/:id`, async (c) => {
    const id = c.req.param("id");
    const req = new Request(`http://localhost/scans/${id}`, {
      headers: c.req.raw.headers,
    });
    return riskScanRoutes.fetch(req);
  });
  app.patch(`${prefix}/admin/risk/findings/:id`, async (c) => {
    const id = c.req.param("id");
    const req = new Request(`http://localhost/findings/${id}`, {
      method: "PATCH",
      headers: c.req.raw.headers,
      body: c.req.raw.body,
    });
    return riskScanRoutes.fetch(req);
  });
  // B-013: OpenAPI spec + Scalar docs UI
  app.get(`${prefix}/docs/api`, (c) => c.json(OPENAPI_SPEC));
  app.get(`${prefix}/docs`, (c) => {
    const apiUrl = new URL(c.req.url);
    apiUrl.pathname = apiUrl.pathname.replace(/\/docs$/, "/docs/api");
    return c.html(renderScalarHtml(apiUrl.toString()));
  });
};

app.get("/", (c) => c.json({ status: "ok" }));
app.get("/health", (c) => c.json({ status: "ok" }));
app.get(`${GATEWAY_PREFIX}`, (c) => c.json({ status: "ok" }));
app.get(`${GATEWAY_PREFIX}/health`, (c) => c.json({ status: "ok" }));
registerRoutes(BASE_PATH);
registerRoutes(V1_PATH);
registerRoutes(`${GATEWAY_PREFIX}${BASE_PATH}`);
registerRoutes(`${GATEWAY_PREFIX}${V1_PATH}`);

Deno.serve(app.fetch);
