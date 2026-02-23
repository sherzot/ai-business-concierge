/**
 * Unified logging helper for observability.
 * JSON output for Supabase logs; optional DB writes.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogPayload = {
  level: LogLevel;
  message: string;
  traceId?: string;
  tenantId?: string;
  userId?: string;
  category?: string;
  data?: Record<string, unknown>;
};

function formatLog(p: LogPayload): string {
  return JSON.stringify({
    level: p.level,
    message: p.message,
    traceId: p.traceId,
    tenantId: p.tenantId,
    userId: p.userId,
    category: p.category,
    ...(p.data && Object.keys(p.data).length > 0 ? { data: p.data } : {}),
    timestamp: new Date().toISOString(),
  });
}

export function logRequest(p: LogPayload): void {
  console.log(formatLog({ ...p, category: p.category ?? "request" }));
}

export function logAudit(p: LogPayload): void {
  console.log(formatLog({ ...p, category: p.category ?? "audit" }));
}

export function logAI(p: LogPayload): void {
  console.log(formatLog({ ...p, category: p.category ?? "ai" }));
}

export function logError(p: LogPayload): void {
  console.error(formatLog({ ...p, level: "error", category: p.category ?? "error" }));
}

export function truncate(str: string, maxLen: number): string {
  if (!str || typeof str !== "string") return "";
  return str.length <= maxLen ? str : str.slice(0, maxLen);
}
