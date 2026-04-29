/**
 * HTTP route — POST /v1/hr/candidates/analyze
 *
 * Status: SKELETON.
 * Owner: backend agent (next session).
 *
 * Wiring:
 *   In supabase/functions/server/index.ts add:
 *     import hrCandidateRoutes from "./routes/hr-candidate.ts";
 *     app.route(`${V1_PATH}/hr/candidates`, hrCandidateRoutes);
 */

import { Hono } from "npm:hono";
import { analyzeCandidate } from "../services/hr-candidate/index.ts";
import type { AnalyzeRequest, Locale, AnalysisDepth } from "../services/hr-candidate/types.ts";

const router = new Hono();

const MAX_CV_BYTES = 5 * 1024 * 1024; // 5 MB
const PDF_MIME = "application/pdf";
const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// ---------------------------------------------------------------------------
// POST /analyze  (multipart/form-data)
// ---------------------------------------------------------------------------

router.post("/analyze", async (c) => {
  // TODO: auth middleware — require role in {HR, MANAGER, TENANT_ADMIN}
  // TODO: rate limit middleware — based on subscription tier (see SPEC.md §6)
  // TODO: usage_tracking — increment counter for this tenant

  let form: FormData;
  try {
    form = await c.req.formData();
  } catch {
    return c.json({ error: { code: "INVALID_REQUEST", message_en: "Expected multipart/form-data" } }, 400);
  }

  const githubInput = String(form.get("github_input") ?? "").trim();
  const cvFile = form.get("cv_file");
  const jobDescription = (form.get("job_description") ?? "").toString() || undefined;
  const locale = parseLocale(c.req.header("Accept-Language") ?? form.get("locale")?.toString());
  const analysisDepth = parseDepth(form.get("analysis_depth")?.toString());

  // ---------------------------------------------------------------------------
  // Validate
  // ---------------------------------------------------------------------------
  if (!githubInput) {
    return c.json({ error: { code: "INVALID_GITHUB_INPUT", message_en: "github_input is required" } }, 400);
  }
  if (!(cvFile instanceof File)) {
    return c.json({ error: { code: "CV_PARSE_FAILED", message_en: "cv_file is required" } }, 400);
  }
  if (cvFile.size > MAX_CV_BYTES) {
    return c.json({ error: { code: "CV_TOO_LARGE", message_en: "CV must be <= 5 MB" } }, 400);
  }
  if (cvFile.type !== PDF_MIME && cvFile.type !== DOCX_MIME) {
    return c.json({ error: { code: "UNSUPPORTED_FILE_TYPE", message_en: "Only PDF / DOCX accepted" } }, 400);
  }

  // ---------------------------------------------------------------------------
  // Build request, call orchestrator
  // ---------------------------------------------------------------------------
  const cvBytes = new Uint8Array(await cvFile.arrayBuffer());

  const req: AnalyzeRequest = {
    github_input: githubInput,
    cv_file: cvBytes,
    cv_mime: cvFile.type as AnalyzeRequest["cv_mime"],
    cv_filename: cvFile.name,
    job_description: jobDescription,
    locale,
    analysis_depth: analysisDepth,
  };

  const result = await analyzeCandidate(req);

  const status = result.status === "error" ? mapErrorToHttpStatus(result.error?.code) : 200;
  return c.json(result, status);
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseLocale(input: string | undefined | null): Locale {
  const v = (input ?? "").toLowerCase();
  if (v.startsWith("ja")) return "ja";
  if (v.startsWith("en")) return "en";
  return "uz";
}

function parseDepth(input: string | undefined): AnalysisDepth {
  return input === "fast" ? "fast" : "deep";
}

function mapErrorToHttpStatus(code?: string): 400 | 401 | 403 | 404 | 429 | 500 | 502 | 504 {
  switch (code) {
    case "INVALID_GITHUB_INPUT":
    case "CV_PARSE_FAILED":
    case "CV_TOO_LARGE":
    case "UNSUPPORTED_FILE_TYPE":
      return 400;
    case "UNAUTHENTICATED": return 401;
    case "FORBIDDEN_ROLE":  return 403;
    case "GITHUB_USER_NOT_FOUND": return 404;
    case "RATE_LIMITED":    return 429;
    case "GITHUB_UNAVAILABLE": return 502;
    case "TIMEOUT":         return 504;
    default:                return 500;
  }
}

export default router;
