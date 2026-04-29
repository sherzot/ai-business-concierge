/**
 * API client — POST /v1/hr/candidates/analyze
 *
 * Status: SKELETON (backend hozircha 501 NOT_IMPLEMENTED qaytaradi).
 * Note: AbortController olib tashlandi (bug debug). Supabase Edge Function
 *       o'zining default 30s timeoutiga ega.
 */

import { API_BASE_URL, publicAnonKey } from "../../../../app/config";
import { supabase } from "../../../../shared/lib/supabase";
import type { AnalyzeFormInput, CandidateAnalysisResult } from "../types";

const ENDPOINT = `${API_BASE_URL}/hr/candidates/analyze`;

export async function analyzeCandidate(
  input: AnalyzeFormInput,
  tenantId?: string,
): Promise<CandidateAnalysisResult> {
  if (!input.cvFile) {
    throw new Error("CV file is required");
  }

  // Auth token (loyiha pattern: session yo'q bo'lsa anon key)
  let token = publicAnonKey;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) token = session.access_token;
  } catch (e) {
    // Session olishda xato — anon key bilan davom etamiz
    console.warn("[candidates] getSession failed, using anon key", e);
  }

  const form = new FormData();
  form.append("github_input", input.githubInput);
  form.append("cv_file", input.cvFile, input.cvFile.name);
  if (input.jobDescription) form.append("job_description", input.jobDescription);
  form.append("locale", input.locale);
  form.append("analysis_depth", input.analysisDepth);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Accept-Language": input.locale,
    // Note: Content-Type yozilmaydi — multipart boundary'ni browser belgilaydi
  };
  if (tenantId) headers["X-Tenant-Id"] = tenantId;

  // Diagnostic log (console'da Network bilan birga ko'rasiz)
  console.info("[candidates] POST", ENDPOINT, {
    tenantId,
    locale: input.locale,
    depth: input.analysisDepth,
    hasFile: !!input.cvFile,
    fileSize: input.cvFile.size,
  });

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers,
    body: form,
  });

  console.info("[candidates] response", res.status, res.statusText);

  // 501 ham JSON qaytaradi
  const json = (await res.json().catch(() => ({}))) as CandidateAnalysisResult;
  return json;
}
