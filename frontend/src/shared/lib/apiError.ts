export function resolveApiErrorMessage(
  result: unknown,
  statusText: string,
): string {
  if (!result || typeof result !== "object") {
    return `API Error: ${statusText}`;
  }

  const body = result as {
    meta?: { errors?: Array<{ message?: unknown }> };
    error?: { message?: unknown };
    message?: unknown;
  };
  const candidates = [
    body.meta?.errors?.[0]?.message,
    body.error?.message,
    body.message,
  ];
  const message = candidates.find(
    (candidate): candidate is string =>
      typeof candidate === "string" && candidate.trim().length > 0,
  );

  return message ?? `API Error: ${statusText}`;
}
