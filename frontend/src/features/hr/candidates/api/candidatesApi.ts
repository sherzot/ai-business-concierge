/**
 * API client — POST /v1/hr/candidates/analyze
 *
 * Status: SKELETON (backend hozircha 501 NOT_IMPLEMENTED qaytaradi).
 * Note: AbortController olib tashlandi (bug debug). Supabase Edge Function
 *       o'zining default 30s timeoutiga ega.
 */

import { API_BASE_URL } from "../../../../app/config";
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

  let accessToken: string | undefined;
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (!error) accessToken = session?.access_token;
  } catch {
    // Provider/session details are intentionally hidden from the caller.
  }

  if (!accessToken) {
    throw new Error("Authentication required");
  }

  const form = new FormData();
  form.append("github_input", input.githubInput);
  form.append("cv_file", input.cvFile, input.cvFile.name);
  if (input.jobDescription) form.append("job_description", input.jobDescription);
  form.append("locale", input.locale);
  form.append("analysis_depth", input.analysisDepth);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Accept-Language": input.locale,
    // Note: Content-Type yozilmaydi — multipart boundary'ni browser belgilaydi
  };
  if (tenantId) headers["X-Tenant-Id"] = tenantId;

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers,
    body: form,
  });

  // 501 ham JSON qaytaradi
  const json = (await res.json().catch(() => ({}))) as CandidateAnalysisResult;
  return json;
}
