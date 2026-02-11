const defaultProjectId = "ufhepwdkjqptjvxrmpjn";
const defaultAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmaGVwd2RranFwdGp2eHJtcGpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxODU3NzksImV4cCI6MjA4NTc2MTc3OX0.Z4mdxlMGUYSubbzNzSap7kBXLrPzxx5TB27r7rBmNJ8";

export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? defaultProjectId;
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? defaultAnonKey;
export const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? `https://${projectId}.supabase.co`;
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  `https://${projectId}.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1`;
export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN ?? "";
