import type { ApiError } from "./apiClient";

export function normalizeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Xatolik yuz berdi.";
}

export function getTraceIdFromError(error: unknown): string | undefined {
  const e = error as ApiError;
  return e?.traceId;
}
