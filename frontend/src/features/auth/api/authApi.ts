import { apiRequest } from "../../../shared/lib/apiClient";
import type { AuthProfile } from "../types";

export async function fetchAuthProfile(): Promise<AuthProfile> {
  return apiRequest<AuthProfile>("/auth/me");
}

export async function logout() {
  const { supabase } = await import("../../../shared/lib/supabase");
  await supabase.auth.signOut();
}

export async function notifySetupComplete(): Promise<void> {
  await apiRequest("/auth/setup-complete", { method: "POST", body: JSON.stringify({}) });
}
