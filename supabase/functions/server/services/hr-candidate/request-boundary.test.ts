import {
  getHrRateLimitPolicy,
  isHrCandidateRoleAllowed,
  validateAnalyzeRequest,
} from "./request-boundary.ts";

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

function validRequest(): Record<string, unknown> {
  return {
    github_input: " https://github.com/Octocat/ ",
    cv_file: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]),
    cv_mime: PDF_MIME,
    cv_filename: "candidate.pdf",
    job_description: "  Senior TypeScript engineer  ",
    locale: "en",
    analysis_depth: "deep",
  };
}

Deno.test("request boundary normalizes a valid request and copies CV bytes", () => {
  const input = validRequest();
  const originalBytes = input.cv_file as Uint8Array;
  const result = validateAnalyzeRequest(input);

  assert(result.ok, "valid request");
  assertEquals(result.value.github_input, "Octocat", "normalized GitHub user");
  assertEquals(
    result.value.job_description,
    "Senior TypeScript engineer",
    "trimmed job description",
  );
  assert(result.value.cv_file !== originalBytes, "defensive CV byte copy");
});

Deno.test("request boundary rejects invalid GitHub input and file contracts", () => {
  const invalidGithub = validateAnalyzeRequest({
    ...validRequest(),
    github_input: "github.com/octocat/repository",
  });
  assert(!invalidGithub.ok, "repository URL rejected");
  assertEquals(
    invalidGithub.error.code,
    "INVALID_GITHUB_INPUT",
    "GitHub code",
  );

  const missingFile = validateAnalyzeRequest({
    ...validRequest(),
    cv_file: new Uint8Array(),
  });
  assert(!missingFile.ok, "empty file rejected");
  assertEquals(missingFile.error.code, "CV_PARSE_FAILED", "empty file code");

  const wrongMime = validateAnalyzeRequest({
    ...validRequest(),
    cv_mime: "text/plain",
  });
  assert(!wrongMime.ok, "wrong MIME rejected");
  assertEquals(
    wrongMime.error.code,
    "UNSUPPORTED_FILE_TYPE",
    "MIME code",
  );
});

Deno.test("request boundary enforces file, text, locale, and depth bounds", () => {
  const oversized = validateAnalyzeRequest({
    ...validRequest(),
    cv_file: new Uint8Array(5 * 1024 * 1024 + 1),
  });
  assert(!oversized.ok, "oversized file rejected");
  assertEquals(oversized.error.code, "CV_TOO_LARGE", "size code");

  for (
    const [field, value] of [
      ["job_description", "x".repeat(5_001)],
      ["locale", "ru"],
      ["analysis_depth", "auto"],
      ["cv_filename", "x".repeat(181)],
    ] as const
  ) {
    const result = validateAnalyzeRequest({
      ...validRequest(),
      [field]: value,
    });
    assert(!result.ok, `${field} rejected`);
    assertEquals(result.error.code, "INVALID_REQUEST", `${field} code`);
    assertEquals(result.error.field, field, `${field} pointer`);
  }
});

Deno.test("HR role guard allows only canonical HR analysis roles", () => {
  for (
    const role of [
      "hr",
      "manager",
      "company_admin",
      "leader",
      "super_admin",
    ]
  ) {
    assert(isHrCandidateRoleAllowed(role), `${role} allowed`);
  }
  for (const role of ["employee", "sub_admin", "tenant_admin", ""]) {
    assert(!isHrCandidateRoleAllowed(role), `${role} denied`);
  }
});

Deno.test("HR rate-limit policy resolves known plans and fails closed on unknown", () => {
  assertEquals(
    getHrRateLimitPolicy("bepul"),
    { concurrent: 1, per_minute: 1, per_day: 2 },
    "free alias",
  );
  const business = getHrRateLimitPolicy("Biznes");
  assertEquals(
    business,
    { concurrent: 5, per_minute: 20, per_day: 100 },
    "business alias",
  );
  assertEquals(
    getHrRateLimitPolicy("starter"),
    { concurrent: 2, per_minute: 5, per_day: 20 },
    "database starter plan maps to entrepreneur policy",
  );
  assertEquals(
    getHrRateLimitPolicy("Pro"),
    { concurrent: 5, per_minute: 20, per_day: 100 },
    "legacy tenant Pro plan maps to business policy",
  );
  assertEquals(
    getHrRateLimitPolicy("Kompaniya"),
    { concurrent: 10, per_minute: 60, per_day: 500 },
    "company alias",
  );
  assertEquals(getHrRateLimitPolicy("unknown"), null, "unknown plan denied");

  if (business) business.per_day = 0;
  assertEquals(
    getHrRateLimitPolicy("business")?.per_day,
    100,
    "policy returns defensive copies",
  );
});
