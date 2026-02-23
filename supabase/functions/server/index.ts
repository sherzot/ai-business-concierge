import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2.49.8";
import { Webhook } from "npm:svix@1.17.0";
import { logRequest, logAudit, logAI, truncate } from "../_shared/logging.ts";

const app = new Hono();
const BASE_PATH = "/make-server-6c2837d6";
const V1_PATH = `${BASE_PATH}/v1`;
const GATEWAY_PREFIX = "/bright-api";

app.use('*', logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Tenant-Id", "X-User-Id", "X-Trace-Id"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
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
const RESEND_WEBHOOK_SECRET = Deno.env.get("RESEND_WEBHOOK_SECRET") ?? "";

const supabase = createClient(SB_URL, SB_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const TOOL_REGISTRY = [
  {
    tool_name: "classify_inbox",
    description: "Classify inbox item into HR/Docs/Sales/Support/Billing/General",
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
    summary: "Marketing bo'limida stress yuqori, so'rovnoma natijalari diqqat talab qiladi.",
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
const getTenantId = (c: any) => c.get(TENANT_ID_KEY) ?? c.get(TENANT_CTX_KEY)?.tenantId;

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
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return atob(padded);
};

const decodeBase64UrlBytes = (input: string) => {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
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
const verifyTokenViaSupabaseAuth = async (token: string): Promise<{ sub: string; email?: string } | null> => {
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
      const tenantId = payload.tenant_id ?? c.req.header("x-tenant-id");
      const userId = payload.sub ?? payload.user_id ?? c.req.header("x-user-id");
      if (tenantId) {
        const ctx: TenantContext = {
          tenantId,
          userId,
          roles: payload.roles ?? payload.app_metadata?.roles ?? [],
          permissions: payload.permissions ?? [],
        };
        c.set(TENANT_CTX_KEY, ctx);
        c.set(TENANT_ID_KEY, tenantId);
        return ctx;
      }
      if (userId) {
        const headerTenantId = c.req.header("x-tenant-id") ?? "";
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

  const tenantId = c.req.header("x-tenant-id");
  if (tenantId) {
    const ctx = {
      tenantId,
      userId: c.req.header("x-user-id") ?? undefined,
    };
    c.set(TENANT_CTX_KEY, ctx);
    c.set(TENANT_ID_KEY, tenantId);
    return ctx;
  }

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
    logError({ message: "audit_log insert failed", traceId: entry.trace_id, data: { err: String(e) } });
  }
};

/** Vazifa biriktirilganda mas'ulga bildirishnoma yaratish */
const createTaskAssignmentNotification = async (
  tenantId: string,
  assigneeId: string,
  taskId: string,
  taskTitle: string
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

const writeAiInteraction = async (ctx: TenantContext, entry: AiInteractionEntry) => {
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
    logError({ message: "ai_interaction insert failed", traceId: entry.trace_id, data: { err: String(e) } });
  }
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
      logError({ message: "request_log insert failed", traceId, data: { err: String(e) } });
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
    id: 't-1',
    title: 'Q4 Moliyaviy hisobotni tayyorlash',
    status: 'in_progress',
    priority: 'high',
    assignee: { name: 'Aziza M.' },
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    tags: ['Finance', 'Report'],
    comments: 3
  },
  {
    id: 't-2',
    title: 'Yangi ofis menejerini ishga olish',
    status: 'todo',
    priority: 'medium',
    assignee: { name: 'Jasur A.' },
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    tags: ['HR', 'Hiring'],
    comments: 0
  }
];

const getMockInbox = () => [
  {
    id: "1",
    source: "telegram",
    sender: { name: "Aziz Rakhimov (HR Lead)" },
    subject: "Yangi ofis menejeri vakansiyasi",
    preview: "Assalomu alaykum. Yangi ofis menejeri uchun e'lon matnini tasdiqlashingiz kerak.",
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
  documents: { metadata?: { expiry_date?: string } }[] = []
) => {
  const dueDate = (t: any) => t.due_date ?? t.dueDate;
  const overdue = tasks.filter(
    (task) => {
      const d = dueDate(task);
      return d && new Date(d) < new Date() && task.status !== "done";
    }
  ).length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const pendingApprovals = inboxItems.filter(
    (item) => item.category === "HR" || item.category === "Billing",
  ).length;
  const healthScore = Math.max(60, Math.min(100, 100 - overdue * 5 - pendingApprovals * 3));
  const monthlyRevenue = 40000 + doneCount * 500 - overdue * 200;

  const now = new Date();
  const chartData = DAY_LABELS.map((day, i) => {
    const dayScore = Math.max(60, Math.min(100, healthScore - (6 - i) * 2 + (i % 2)));
    return { day, score: dayScore };
  });

  const insights: { type: "danger" | "warning" | "info"; title: string; desc: string }[] = [];

  if (overdue > 0 || inboxItems.some((i) => i.category === "Billing")) {
    insights.push({
      type: "danger",
      title: "Kassadagi yetishmovchilik xavfi",
      desc: overdue > 0
        ? `${overdue} ta muddati o'tgan vazifa. Joriy xarajatlar sur'ati bilan 15-sana uchun kutilayotgan balans manfiy bo'lishi mumkin.`
        : "Billing xabarlari kutilmoqda. Joriy xarajatlar sur'ati bilan 15-sana uchun kutilayotgan balans manfiy bo'lishi mumkin.",
    });
  }

  const hrCount = inboxItems.filter((i) => i.category === "HR").length;
  if (hrCount >= 2 || pendingApprovals > 0) {
    insights.push({
      type: "warning",
      title: "HR: Diqqat talab qiladi",
      desc: hrCount >= 2
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
    const daysLeft = exp ? Math.ceil((new Date(exp).getTime() - now.getTime()) / 86400000) : 0;
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
  const trendHealth = healthScore >= 95 ? "+2%" : healthScore >= 85 ? "+1%" : "0%";
  const trendRevenue = doneCount > 0 ? `+${Math.min(15, doneCount * 2)}%` : "0%";

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
  leader: ["reports", "inbox", "tasks", "hr", "docs", "integrations", "settings"],
  hr: ["reports", "inbox", "tasks", "hr", "docs", "settings"],
  accounting: ["reports", "docs", "integrations", "settings"],
  department_head: ["reports", "inbox", "tasks", "docs", "settings"],
  employee: ["inbox", "tasks", "settings"],
};

const registerRoutes = (prefix: string) => {
  app.get(`${prefix}/health`, (c) => c.json({ status: "ok" }));

  app.get(`${prefix}/auth/me`, async (c) => {
    const auth = c.req.header("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return failure(c, 401, "UNAUTHORIZED", "Token talab qilinadi.");
    }
    const token = auth.replace("Bearer ", "").trim();
    // Supabase Auth API orqali tokenni tekshirish (JWT_SECRET talab qilmaydi)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return failure(c, 401, "INVALID_TOKEN", "Token noto'g'ri yoki muddati tugagan.");
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

    const { data: tenantRows } = await supabase
      .from("tenants")
      .select("id, name, plan")
      .in("id", tenants.map((t) => t.id));

    const tenantMap = Object.fromEntries(
      (tenantRows ?? []).map((t) => [t.id, t])
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
      .select("total_tasks, open_tasks, overdue_tasks, done_tasks, inbox_unread_count, pending_approvals")
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
    const healthScore = Math.max(60, Math.min(100, 100 - overdue * 5 - pendingApprovals * 3));
    const monthlyRevenue = 40000 + doneCount * 500 - overdue * 200;

    const chartData = DAY_LABELS.map((day, i) => ({
      day,
      score: Math.max(60, Math.min(100, healthScore - (6 - i) * 2 + (i % 2))),
    }));

    const insights: { type: "danger" | "warning" | "info"; title: string; desc: string }[] = [];
    if (overdue > 0 || pendingApprovals > 0) {
      insights.push({
        type: "danger",
        title: "Kassadagi yetishmovchilik xavfi",
        desc: overdue > 0
          ? `${overdue} ta muddati o'tgan vazifa. Joriy xarajatlar sur'ati bilan 15-sana uchun kutilayotgan balans manfiy bo'lishi mumkin.`
          : "Billing xabarlari kutilmoqda. Joriy xarajatlar sur'ati bilan 15-sana uchun kutilayotgan balans manfiy bo'lishi mumkin.",
      });
    }
    const hrCount = viewRow?.inbox_unread_count ?? 0;
    if (hrCount >= 2 || pendingApprovals > 0) {
      insights.push({
        type: "warning",
        title: "HR: Diqqat talab qiladi",
        desc: hrCount >= 2
          ? `Oxirgi so'rovnomalarda Marketing bo'limida stress darajasi oshgan. ${hrCount} ta HR xabari kutilmoqda.`
          : `${pendingApprovals} ta tasdiqlash kutilmoqda. Oxirgi so'rovnomalarda stress darajasi oshgan bo'lishi mumkin.`,
      });
    }
    const now = new Date();
    const expiringDocs = safeDocs.filter((d: any) => {
      const exp = d.metadata?.expiry_date;
      if (!exp) return false;
      const daysLeft = Math.ceil((new Date(exp).getTime() - now.getTime()) / 86400000);
      return daysLeft > 0 && daysLeft <= 14;
    });
    if (expiringDocs.length > 0) {
      const d = expiringDocs[0];
      const exp = d.metadata?.expiry_date;
      const daysLeft = exp ? Math.ceil((new Date(exp).getTime() - now.getTime()) / 86400000) : 0;
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
    const trendHealth = healthScore >= 95 ? "+2%" : healthScore >= 85 ? "+1%" : "0%";
    const trendRevenue = doneCount > 0 ? `+${Math.min(15, doneCount * 2)}%` : "0%";

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

  app.get(`${prefix}/inbox`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const { data, error } = await supabase.from("inbox_items").select("*").eq("tenant_id", ctx.tenantId).order("timestamp", { ascending: false });
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
      return failure(c, 400, "INVALID_PAYLOAD", "source_message_id talab qilinadi.");
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

    const { data, error } = await supabase.from("inbox_items").insert(newItem).select("*").single();
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

    if (RESEND_WEBHOOK_SECRET) {
      try {
        const wh = new Webhook(RESEND_WEBHOOK_SECRET);
        const headers = {
          "svix-id": c.req.header("svix-id") ?? "",
          "svix-timestamp": c.req.header("svix-timestamp") ?? "",
          "svix-signature": c.req.header("svix-signature") ?? "",
        };
        wh.verify(rawBody, headers);
      } catch {
        return failure(c, 401, "INVALID_SIGNATURE", "Webhook imzosi noto'g'ri.");
      }
    }

    let payload: { type?: string; data?: { email_id?: string; from?: string; to?: string[]; subject?: string; created_at?: string } };
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
    const toAddrs = toRaw.map((e) => {
      const s = String(e).trim();
      const match = s.match(/<([^>]+)>/);
      return (match ? match[1] : s).toLowerCase();
    }).filter(Boolean);
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
      const { data: defaultTenant } = await supabase.from("tenants").select("id").limit(1).single();
      if (defaultTenant?.id) {
        mapping = { tenant_id: defaultTenant.id };
        console.warn("Resend webhook: mapping yo'q, default tenant ishlatildi, to=", toAddrs);
      } else {
        console.warn("Resend webhook: tenant topilmadi, to=", toAddrs, "mapErr=", mapErr);
        return c.json({ received: true }, 200);
      }
    }

    const senderMatch = String(from || "").match(/^([^<]*)<?([^>]*)>?$/);
    const senderName = (senderMatch?.[1]?.trim() || "Unknown").replace(/^["']|["']$/g, "");
    const senderEmail = senderMatch?.[2]?.trim() || "";
    const sender = { name: senderName || "Unknown", email: senderEmail };

    const sourceMessageId = email_id || `resend-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
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

  app.get(`${prefix}/tenants/:id/members`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const tenantId = c.req.param("id");
    if (tenantId !== ctx.tenantId) {
      return failure(c, 403, "FORBIDDEN", "Boshqa tenant a'zolariga kirish mumkin emas.");
    }

    const { data, error } = await supabase
      .from("user_tenants")
      .select("user_id, full_name")
      .eq("tenant_id", tenantId);

    if (error) {
      return failure(c, 500, "DB_ERROR", "A'zolar yuklashda xatolik.");
    }

    const members = (data ?? []).map((r) => ({ id: r.user_id, name: r.full_name }));
    return success(c, members);
  });

  app.get(`${prefix}/tasks`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const { data, error } = await supabase.from("tasks").select("*").eq("tenant_id", ctx.tenantId).order("created_at", { ascending: false });
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
      status: body.status || "todo",
      priority: body.priority || "medium",
      assignee: body.assignee ?? null,
      due_date: body.dueDate ?? null,
      tags: body.tags || [],
      comments: 0,
    };

    const { data, error } = await supabase.from("tasks").insert(newTask).select("*").single();
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
      await createTaskAssignmentNotification(ctx.tenantId, assignee.id, data.id, newTask.title);
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
      await createTaskAssignmentNotification(ctx.tenantId, assignee.id, data.id, data.title);
    }

    return success(c, data);
  });

  app.post(`${prefix}/tasks/:id/acknowledge`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;

    const taskId = c.req.param("id");
    const userId = (ctx as any).userId;
    if (!userId) {
      return failure(c, 401, "AUTH_REQUIRED", "Tasdiqlash uchun tizimga kirish kerak.");
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

    const assigneeId = (task.assignee as { id?: string })?.id ?? (task.assignee as { user_id?: string })?.user_id;
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
    const { message, context, locale: reqLocale } = body;
    if (!message || typeof message !== "string") {
      return failure(c, 422, "VALIDATION_ERROR", "message majburiy.");
    }

    const locale = (reqLocale ?? "uz") as string;
    const promptName = "ai_coo";
    const promptVersion = "v1";
    const inputExcerpt = truncate(message, 500);
    const aiStart = Date.now();

    const buildFallbackReply = (input: string) => {
      const lowerMsg = input.toLowerCase();
      if (lowerMsg.includes("xarajat") || lowerMsg.includes("expense") || lowerMsg.includes("budget")) {
        return {
          reply: "Yanvar oyi xarajatlari $12,400 ni tashkil etdi. Bu o'tgan oyga nisbatan 15% kamroq.",
          toolUsed: { name: "ShadowCFO.check_budget", success: true },
        };
      }
      if (lowerMsg.includes("task") || lowerMsg.includes("vazifa")) {
        return {
          reply: "Sizda bugun 3 ta muhim vazifa bor. Eng asosiysi: 'Q4 Moliyaviy hisobot'.",
          toolUsed: { name: "TaskPlanner.list_priorities", success: true },
        };
      }
      if (lowerMsg.includes("report") || lowerMsg.includes("hisobot")) {
        return {
          reply: "Men oylik hisobotni shakllantirishni boshladim. Tayyor bo'lgach xabar beraman.",
          toolUsed: { name: "ReportGenerator.generate", success: true },
        };
      }
      return {
        reply: "Tushunarli. Buni o'rganib chiqaman.",
        toolUsed: null,
      };
    };

    const fallback = buildFallbackReply(message);
    let reply = fallback.reply;
    let toolUsed: { name: string; success: boolean; error_code?: string } | null = fallback.toolUsed
      ? { name: fallback.toolUsed.name, success: fallback.toolUsed.success ?? true }
      : null;

    let openaiError: string | null = null;

    if (OPENAI_API_KEY) {
      try {
        const aiResponse = await callOpenAI({
          model: OPENAI_MODEL,
          input: [
            {
              role: "system",
              content: "Sen AI Business Concierge. Javoblar qisqa, amaliy va foydali bo'lsin.",
            },
            {
              role: "user",
              content: message,
            },
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
        const tc = aiResponse?.tool_calls?.[0];
        toolUsed = tc
          ? { name: tc.name ?? "unknown", success: tc.status === "success", error_code: tc.error }
          : toolUsed;
      } catch (err) {
        openaiError = err instanceof Error ? err.message : "OPENAI_ERROR";
        toolUsed = { name: "OpenAI", success: false, error_code: openaiError };
      }
    }

    const latencyMs = Date.now() - aiStart;
    const toolsUsedArr = toolUsed
      ? [{ name: toolUsed.name, success: toolUsed.success, error_code: toolUsed.error_code }]
      : [];

    await writeAiInteraction(ctx as TenantContext, {
      role: "AI_COO",
      prompt_name: promptName,
      prompt_version: promptVersion,
      locale,
      input_excerpt: inputExcerpt,
      output_excerpt: truncate(reply, 500),
      tools_used: toolsUsedArr,
      success_flag: !openaiError,
      error_code: openaiError ?? null,
      latency_ms: latencyMs,
      trace_id: getTraceId(c),
    });

    const payload = openaiError ? { reply, toolUsed, warning: "OPENAI_ERROR" } : { reply, toolUsed };
    return success(c, payload);
  });

  app.get(`${prefix}/ai/tools`, async (c) => {
    const ctx = await requireTenant(c);
    if (!(ctx as any).tenantId) return ctx;
    return success(c, TOOL_REGISTRY);
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
      return failure(c, 422, "VALIDATION_ERROR", "title/content/metadata dan biri majburiy.");
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
      .update({ title: nextTitle, content: nextContent, metadata: nextMetadata })
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
      await supabase.from("doc_chunks").delete().eq("tenant_id", ctx.tenantId).eq("document_id", id);

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
      .insert({ tenant_id: ctx.tenantId, title, content, metadata: metadata ?? {} })
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
