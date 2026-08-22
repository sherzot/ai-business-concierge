/** Bounded multipart/form-data adapter for the HR Candidate HTTP boundary. */

import { HR_MAX_CV_BYTES, validateAnalyzeRequest } from "./request-boundary.ts";
import type { AnalyzeRequest, ErrorEnvelope, Locale } from "./types.ts";

const MULTIPART_OVERHEAD_BYTES = 64 * 1024;
export const HR_MAX_MULTIPART_BYTES = HR_MAX_CV_BYTES +
  MULTIPART_OVERHEAD_BYTES;

const ALLOWED_FIELDS = new Set([
  "github_input",
  "cv_file",
  "job_description",
  "locale",
  "analysis_depth",
]);

export type HrMultipartParseResult =
  | { ok: true; value: AnalyzeRequest }
  | { ok: false; status: 400 | 413; error: ErrorEnvelope };

export class HrMultipartBodyError extends Error {
  readonly status: 400 | 413;
  readonly envelope: ErrorEnvelope;

  constructor(status: 400 | 413, envelope: ErrorEnvelope) {
    super(envelope.code);
    this.name = "HrMultipartBodyError";
    this.status = status;
    this.envelope = envelope;
  }
}

export async function parseHrCandidateMultipartRequest(
  request: Request,
): Promise<HrMultipartParseResult> {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    validateMultipartContentType(contentType);

    const contentEncoding = request.headers.get("content-encoding");
    if (contentEncoding && contentEncoding.toLowerCase() !== "identity") {
      throw invalidMultipart("Compressed request bodies are not accepted.");
    }

    const body = await consumeBoundedBody(request, true);
    const formRequest = new Request("http://hr-candidate.local/analyze", {
      method: "POST",
      headers: { "content-type": contentType },
      body,
    });

    let form: FormData;
    try {
      form = await formRequest.formData();
    } catch {
      throw invalidMultipart("Malformed multipart/form-data body.");
    }

    for (const [field] of form.entries()) {
      if (!ALLOWED_FIELDS.has(field)) {
        throw invalidMultipart("Unexpected multipart field.", field);
      }
    }
    for (const field of ALLOWED_FIELDS) {
      if (form.getAll(field).length > 1) {
        throw invalidMultipart("Duplicate multipart field.", field);
      }
    }

    const githubInput = form.get("github_input");
    const cvFile = form.get("cv_file");
    const jobDescription = form.get("job_description");
    const locale = form.get("locale");
    const analysisDepth = form.get("analysis_depth");

    if (typeof githubInput !== "string") {
      return invalidResult("github_input");
    }
    if (!(cvFile instanceof File)) {
      return invalidResult("cv_file", "CV_PARSE_FAILED");
    }
    if (jobDescription !== null && typeof jobDescription !== "string") {
      return invalidResult("job_description");
    }
    if (locale !== null && typeof locale !== "string") {
      return invalidResult("locale");
    }
    if (analysisDepth !== null && typeof analysisDepth !== "string") {
      return invalidResult("analysis_depth");
    }

    const cvBytes = new Uint8Array(await cvFile.arrayBuffer());
    const validation = validateAnalyzeRequest({
      github_input: githubInput,
      cv_file: cvBytes,
      cv_mime: cvFile.type,
      cv_filename: cvFile.name,
      job_description: jobDescription || undefined,
      locale: locale ||
        localeFromHeader(request.headers.get("accept-language")),
      analysis_depth: analysisDepth || "deep",
    });
    if (!validation.ok) {
      return {
        ok: false,
        status: validation.error.code === "CV_TOO_LARGE" ? 413 : 400,
        error: validation.error,
      };
    }

    return { ok: true, value: validation.value };
  } catch (error) {
    if (error instanceof HrMultipartBodyError) {
      return { ok: false, status: error.status, error: error.envelope };
    }
    return {
      ok: false,
      status: 400,
      error: invalidEnvelope("Invalid multipart request."),
    };
  }
}

/**
 * Drain a disabled/stub route without buffering an attacker-controlled body.
 * The full parser above is used only once the production route is enabled.
 */
export async function drainBoundedHrCandidateBody(
  request: Request,
): Promise<void> {
  await consumeBoundedBody(request, false);
}

async function consumeBoundedBody(
  request: Request,
  collect: boolean,
): Promise<Uint8Array> {
  const declaredLength = parseDeclaredLength(
    request.headers.get("content-length"),
  );
  if (declaredLength !== null && declaredLength > HR_MAX_MULTIPART_BYTES) {
    throw oversizedMultipart();
  }

  if (!request.body) {
    if (declaredLength && declaredLength > 0) {
      throw invalidMultipart("Request body length does not match its header.");
    }
    return new Uint8Array();
  }

  const chunks: Uint8Array[] = [];
  const reader = request.body.getReader();
  let received = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > HR_MAX_MULTIPART_BYTES) {
        try {
          await reader.cancel("HR multipart body exceeded the limit");
        } catch {
          // The size error below remains authoritative.
        }
        throw oversizedMultipart();
      }
      if (collect) chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  if (declaredLength !== null && received !== declaredLength) {
    throw invalidMultipart("Request body length does not match its header.");
  }
  if (!collect) return new Uint8Array();

  const body = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

function validateMultipartContentType(contentType: string): void {
  const segments = contentType.split(";").map((segment) => segment.trim());
  if (segments.shift()?.toLowerCase() !== "multipart/form-data") {
    throw invalidMultipart("Expected multipart/form-data.");
  }

  const boundarySegments = segments.filter((segment) =>
    segment.toLowerCase().startsWith("boundary=")
  );
  if (boundarySegments.length !== 1) {
    throw invalidMultipart("A single multipart boundary is required.");
  }

  let boundary = boundarySegments[0].slice("boundary=".length).trim();
  if (boundary.startsWith('"') && boundary.endsWith('"')) {
    boundary = boundary.slice(1, -1);
  }
  if (!/^[0-9A-Za-z'()+_,./:=?-]{1,70}$/.test(boundary)) {
    throw invalidMultipart("Invalid multipart boundary.");
  }
}

function parseDeclaredLength(value: string | null): number | null {
  if (value === null) return null;
  if (!/^(0|[1-9][0-9]*)$/.test(value)) {
    throw invalidMultipart("Invalid Content-Length header.");
  }
  const length = Number(value);
  if (!Number.isSafeInteger(length)) {
    throw invalidMultipart("Invalid Content-Length header.");
  }
  return length;
}

function localeFromHeader(value: string | null): Locale {
  const first = (value ?? "").split(",", 1)[0].trim().toLowerCase();
  if (first === "ja" || first.startsWith("ja-")) return "ja";
  if (first === "en" || first.startsWith("en-")) return "en";
  return "uz";
}

function invalidResult(
  field: string,
  code: ErrorEnvelope["code"] = "INVALID_REQUEST",
): HrMultipartParseResult {
  return {
    ok: false,
    status: 400,
    error: invalidEnvelope("Invalid multipart field.", field, code),
  };
}

function invalidMultipart(
  messageEn: string,
  field?: string,
): HrMultipartBodyError {
  return new HrMultipartBodyError(
    400,
    invalidEnvelope(messageEn, field),
  );
}

function oversizedMultipart(): HrMultipartBodyError {
  return new HrMultipartBodyError(413, {
    code: "CV_TOO_LARGE",
    message_uz: "CV yuklash so'rovi ruxsat etilgan hajmdan katta.",
    message_ja: "CVアップロードリクエストが許可サイズを超えています。",
    message_en: "The CV upload request exceeds the allowed size.",
    field: "cv_file",
  });
}

function invalidEnvelope(
  messageEn: string,
  field?: string,
  code: ErrorEnvelope["code"] = "INVALID_REQUEST",
): ErrorEnvelope {
  return {
    code,
    message_uz: "Multipart so'rov yaroqsiz.",
    message_ja: "マルチパートリクエストが無効です。",
    message_en: messageEn,
    ...(field ? { field } : {}),
  };
}
