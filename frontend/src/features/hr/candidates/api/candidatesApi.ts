/**
 * API client — POST /v1/hr/candidates/analyze
 *
 * Status: SKELETON (TODO bloklari implementatsiya kutilmoqda).
 * Owner: frontend agent (next session).
 *
 * Notes:
 *   • multipart/form-data — never JSON.
 *   • Locale sent both via Accept-Language header and form field for safety.
 *   • Long timeout (35s) because backend hard-stops at 30s.
 */

import type {
  AnalyzeFormInput,
  CandidateAnalysisResult,
} from "../types.ts";

// TODO: replace with real config from app/config (e.g. VITE_API_BASE_URL)
const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? "/api";
const ENDPOINT = `${API_BASE}/v1/hr/candidates/analyze`;
const REQUEST_TIMEOUT_MS = 35_000;

export async function analyzeCandidate(
  input: AnalyzeFormInput,
  authToken: string,
): Promise<CandidateAnalysisResult> {
  if (!input.cvFile) {
    throw new Error("CV file is required");
  }

  const form = new FormData();
  form.append("github_input", input.githubInput);
  form.append("cv_file", input.cvFile, input.cvFile.name);
  if (input.jobDescription) form.append("job_description", input.jobDescription);
  form.append("locale", input.locale);
  form.append("analysis_depth", input.analysisDepth);

  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Accept-Language": input.locale,
        // Note: do NOT set Content-Type — browser sets the multipart boundary
      },
      body: form,
      signal: controller.signal,
    });

    const json = (await res.json()) as CandidateAnalysisResult;
    return json;
  } finally {
    clearTimeout(timeoutHandle);
  }
}
