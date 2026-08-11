const projectIdEnv = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const publishableKeyEnv = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!projectIdEnv || !publishableKeyEnv) {
  throw new Error(
    "VITE_SUPABASE_PROJECT_ID va VITE_SUPABASE_PUBLISHABLE_KEY muhit o'zgaruvchilari sozlanmagan. " +
    "frontend/.env faylini .env.example asosida yarating."
  );
}

if (!publishableKeyEnv.startsWith("sb_publishable_")) {
  throw new Error(
    "VITE_SUPABASE_PUBLISHABLE_KEY modern sb_publishable_... formatida bo'lishi kerak."
  );
}

export const projectId = projectIdEnv;
export const publicSupabaseKey = publishableKeyEnv;
export const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? `https://${projectId}.supabase.co`;
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  `https://${projectId}.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1`;
export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN ?? "";
