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
import { parseHrCandidateMultipartRequest } from "../services/hr-candidate/http-adapter.ts";

const router = new Hono();

// ---------------------------------------------------------------------------
// POST /analyze  (multipart/form-data)
// ---------------------------------------------------------------------------

router.post("/analyze", async (c) => {
  // TODO: auth middleware — require role in {HR, MANAGER, TENANT_ADMIN}
  // TODO: rate limit middleware — based on subscription tier (see SPEC.md §6)
  // TODO: usage_tracking — increment counter for this tenant

  const parsed = await parseHrCandidateMultipartRequest(c.req.raw);
  if (!parsed.ok) {
    return c.json(
      {
        request_id: crypto.randomUUID(),
        status: "error" as const,
        duration_ms: 0,
        locale: "uz" as const,
        error: parsed.error,
      },
      parsed.status,
    );
  }

  const result = await analyzeCandidate(parsed.value);

  const status = result.status === "error"
    ? mapErrorToHttpStatus(result.error?.code)
    : 200;
  return c.json(result, status);
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapErrorToHttpStatus(
  code?: string,
): 400 | 401 | 403 | 404 | 429 | 500 | 502 | 504 {
  switch (code) {
    case "INVALID_GITHUB_INPUT":
    case "CV_PARSE_FAILED":
    case "CV_TOO_LARGE":
    case "UNSUPPORTED_FILE_TYPE":
      return 400;
    case "UNAUTHENTICATED":
      return 401;
    case "FORBIDDEN_ROLE":
      return 403;
    case "GITHUB_USER_NOT_FOUND":
      return 404;
    case "RATE_LIMITED":
      return 429;
    case "GITHUB_UNAVAILABLE":
      return 502;
    case "TIMEOUT":
      return 504;
    default:
      return 500;
  }
}

export default router;
