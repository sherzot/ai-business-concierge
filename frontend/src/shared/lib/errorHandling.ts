export function normalizeError(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Xatolik yuz berdi.";
}
