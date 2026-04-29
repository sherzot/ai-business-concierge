/**
 * API client — POST /v1/hr/candidates/analyze
 *
 * Status: SKELETON (backend hozircha 501 NOT_IMPLEMENTED qaytaradi).
 * Owner: frontend agent (next session).
 *
 * Auth strategy (mavjud apiClient.ts pattern):
 *   • supabase.auth.getSession() dan access_token oladi
 *   • Agar session yo'q bo'lsa — publicAnonKey fallback (Edge Function gateway uchun)
 *   • Authorization: Bearer + X-Tenant-Id header'lar
 *
 * Multipart/form-data — JSON emas (Content-Type'ni browser o'zi belgilaydi).
 */

import { API_BASE_URL, publicAnonKey } from "../../../../app/config";
import { supabase } from "../../../../shared/lib/supabase";
import type { AnalyzeFormInput, CandidateAnalysisResult } from "../types";

const ENDPOINT = `${API_BASE_URL}/hr/candidates/analyze`;
const REQUEST_TIMEOUT_MS = 35_000;

export async function analyzeCandidate(
  input: AnalyzeFormInput,
  tenantId?: string,
): Promise<CandidateAnalysisResult> {
  if (!input.cvFile) {
    throw new Error("CV file is required");
  }

  // Auth token (loyiha pattern: session yo'q bo'lsa anon key)
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? publicAnonKey;

  const form = new FormData();
  form.append("github_input", input.githubInput);
  form.append("cv_file", input.cvFile, input.cvFile.name);
  if (input.jobDescription) form.append("job_description", input.jobDescription);
  form.append("locale", input.locale);
  form.append("analysis_depth", input.analysisDepth);

  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Accept-Language": input.locale,
      // Note: do NOT set Content-Type — browser sets the multipart boundary
    };
    if (tenantId) headers["X-Tenant-Id"] = tenantId;
    if (session?.user?.id) headers["X-User-Id"] = session.user.id;

    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers,
      body: form,
      signal: controller.signal,
    });

    const json = (await res.json().catch(() => ({}))) as CandidateAnalysisResult;
    return json;
  } finally {
    clearTimeout(timeoutHandle);
  }
}
