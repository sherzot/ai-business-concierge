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

import { API_BASE_URL } from "../../../../app/config";
import type {
  AnalyzeFormInput,
  CandidateAnalysisResult,
} from "../types";

// API_BASE_URL = ".../bright-api/make-server-6c2837d6/v1"  (config.ts dan)
const ENDPOINT = `${API_BASE_URL}/hr/candidates/analyze`;
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
