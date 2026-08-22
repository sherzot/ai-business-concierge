import {
  drainBoundedHrCandidateBody,
  HR_MAX_MULTIPART_BYTES,
  parseHrCandidateMultipartRequest,
} from "./http-adapter.ts";

const PDF_MIME = "application/pdf";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEquals<T>(actual: T, expected: T, message: string): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${message}: expected ${JSON.stringify(expected)}, got ${
        JSON.stringify(actual)
      }`,
    );
  }
}

function validForm(): FormData {
  const form = new FormData();
  form.set("github_input", "https://github.com/Octocat/");
  form.set(
    "cv_file",
    new File(
      [new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])],
      "candidate.pdf",
      { type: PDF_MIME },
    ),
  );
  form.set("job_description", "  Senior TypeScript engineer  ");
  return form;
}

Deno.test("HR multipart adapter parses a bounded request and applies defaults", async () => {
  const request = new Request("http://localhost/analyze", {
    method: "POST",
    headers: { "accept-language": "ja-JP,ja;q=0.9" },
    body: validForm(),
  });

  const result = await parseHrCandidateMultipartRequest(request);

  assert(result.ok, "valid multipart request");
  assertEquals(result.value.github_input, "Octocat", "normalized GitHub user");
  assertEquals(result.value.locale, "ja", "locale header fallback");
  assertEquals(result.value.analysis_depth, "deep", "depth default");
  assertEquals(
    result.value.job_description,
    "Senior TypeScript engineer",
    "normalized job description",
  );
  assertEquals(result.value.cv_file.byteLength, 5, "CV bytes");
});

Deno.test("HR multipart adapter rejects duplicate and unknown fields", async () => {
  const duplicate = validForm();
  duplicate.append("github_input", "second-user");
  const duplicateResult = await parseHrCandidateMultipartRequest(
    new Request(
      "http://localhost/analyze",
      { method: "POST", body: duplicate },
    ),
  );
  assert(!duplicateResult.ok, "duplicate field rejected");
  assertEquals(duplicateResult.error.code, "INVALID_REQUEST", "duplicate code");
  assertEquals(duplicateResult.error.field, "github_input", "duplicate field");

  const unknown = validForm();
  unknown.set("admin", "true");
  const unknownResult = await parseHrCandidateMultipartRequest(
    new Request(
      "http://localhost/analyze",
      { method: "POST", body: unknown },
    ),
  );
  assert(!unknownResult.ok, "unknown field rejected");
  assertEquals(unknownResult.error.field, "admin", "unknown field pointer");
});

Deno.test("HR multipart adapter rejects non-multipart and encoded bodies", async () => {
  const jsonResult = await parseHrCandidateMultipartRequest(
    new Request(
      "http://localhost/analyze",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      },
    ),
  );
  assert(!jsonResult.ok, "JSON body rejected");
  assertEquals(jsonResult.status, 400, "JSON status");

  const encodedResult = await parseHrCandidateMultipartRequest(
    new Request(
      "http://localhost/analyze",
      {
        method: "POST",
        headers: {
          "content-type": "multipart/form-data; boundary=valid-boundary",
          "content-encoding": "gzip",
        },
        body: "compressed",
      },
    ),
  );
  assert(!encodedResult.ok, "encoded body rejected");
  assertEquals(encodedResult.error.code, "INVALID_REQUEST", "encoding code");
});

Deno.test("HR multipart adapter rejects invalid explicit locale and MIME", async () => {
  const localeForm = validForm();
  localeForm.set("locale", "ru");
  const localeResult = await parseHrCandidateMultipartRequest(
    new Request(
      "http://localhost/analyze",
      { method: "POST", body: localeForm },
    ),
  );
  assert(!localeResult.ok, "unsupported locale rejected");
  assertEquals(localeResult.error.field, "locale", "locale pointer");

  const mimeForm = validForm();
  mimeForm.set(
    "cv_file",
    new File(["plain text"], "candidate.txt", { type: "text/plain" }),
  );
  const mimeResult = await parseHrCandidateMultipartRequest(
    new Request(
      "http://localhost/analyze",
      { method: "POST", body: mimeForm },
    ),
  );
  assert(!mimeResult.ok, "unsupported MIME rejected");
  assertEquals(
    mimeResult.error.code,
    "UNSUPPORTED_FILE_TYPE",
    "MIME code",
  );
});

Deno.test("HR multipart adapter rejects an oversized declared body before parsing", async () => {
  const result = await parseHrCandidateMultipartRequest(
    new Request(
      "http://localhost/analyze",
      {
        method: "POST",
        headers: {
          "content-type": "multipart/form-data; boundary=valid-boundary",
          "content-length": String(HR_MAX_MULTIPART_BYTES + 1),
        },
        body: "x",
      },
    ),
  );

  assert(!result.ok, "oversized declared request rejected");
  assertEquals(result.status, 413, "oversized status");
  assertEquals(result.error.code, "CV_TOO_LARGE", "oversized code");
});

Deno.test("HR stub drain caps chunked bodies without buffering the full request", async () => {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(HR_MAX_MULTIPART_BYTES));
      controller.enqueue(new Uint8Array([1]));
      controller.close();
    },
  });
  const request = new Request("http://localhost/analyze", {
    method: "POST",
    body,
  });

  let error: unknown;
  try {
    await drainBoundedHrCandidateBody(request);
  } catch (caught) {
    error = caught;
  }

  assert(error instanceof Error, "oversized stream must reject");
  assertEquals(error.message, "CV_TOO_LARGE", "bounded drain error");
});
