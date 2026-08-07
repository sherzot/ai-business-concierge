const projectIdEnv = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const publishableKeyEnv = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const legacyAnonKeyEnv = import.meta.env.VITE_SUPABASE_ANON_KEY;
const publicApiKeyEnv = publishableKeyEnv || legacyAnonKeyEnv;

if (!projectIdEnv || !publicApiKeyEnv) {
  throw new Error(
    "VITE_SUPABASE_PROJECT_ID va VITE_SUPABASE_PUBLISHABLE_KEY muhit o'zgaruvchilari sozlanmagan. " +
    "frontend/.env faylini .env.example asosida yarating."
  );
}

export const projectId = projectIdEnv;
export const publicSupabaseKey = publicApiKeyEnv;
export const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? `https://${projectId}.supabase.co`;
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  `https://${projectId}.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1`;
export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN ?? "";
