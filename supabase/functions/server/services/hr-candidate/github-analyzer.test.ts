import {
  createGithubAnalyzer,
  normaliseGithubInput,
} from "./github-analyzer.ts";

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

const FIXED_NOW = Date.parse("2026-08-21T00:00:00Z");

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function profile(overrides: Record<string, unknown> = {}) {
  return {
    login: "octocat",
    html_url: "https://github.com/octocat",
    created_at: "2020-08-21T00:00:00Z",
    followers: 7,
    following: 3,
    public_repos: 2,
    ...overrides,
  };
}

function repo(
  name: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    name,
    full_name: `octocat/${name}`,
    fork: false,
    stargazers_count: 0,
    language: "TypeScript",
    pushed_at: "2026-08-01T00:00:00Z",
    description: null,
    html_url: `https://github.com/octocat/${name}`,
    default_branch: "main",
    ...overrides,
  };
}

Deno.test("GitHub input normalization accepts profiles and rejects repository paths", () => {
  assertEquals(normaliseGithubInput("octocat"), "octocat", "bare username");
  assertEquals(normaliseGithubInput("@octocat"), "octocat", "at username");
  assertEquals(
    normaliseGithubInput("https://github.com/octocat/"),
    "octocat",
    "profile URL",
  );
  assertEquals(
    normaliseGithubInput("github.com/octocat/repository"),
    null,
    "repository URL rejected",
  );
  assertEquals(
    normaliseGithubInput("https://github.com/octocat?tab=repositories"),
    null,
    "query URL rejected",
  );
  assertEquals(normaliseGithubInput("-octocat"), null, "leading hyphen");
  assertEquals(normaliseGithubInput("octo/cat"), null, "slash rejected");
});

Deno.test("GitHub analyzer aggregates bounded public profile and repository signals", async () => {
  const urls: string[] = [];
  const fetchImpl = async (
    input: string | URL | Request,
  ): Promise<Response> => {
    const url = String(input);
    urls.push(url);
    if (url === "https://api.github.com/users/octocat") {
      return jsonResponse(profile());
    }
    if (url.includes("/users/octocat/repos?")) {
      return jsonResponse([
        repo("alpha", {
          stargazers_count: 10,
          description: "A sufficiently descriptive public repository summary",
        }),
        repo("beta", { language: "Rust", stargazers_count: 2 }),
      ]);
    }
    if (url.includes("/repos/octocat/alpha/git/trees/main")) {
      return jsonResponse({
        truncated: false,
        tree: [
          { path: "README.md" },
          { path: "src/index.ts" },
          { path: "tests/index.test.ts" },
          { path: ".github/workflows/ci.yml" },
        ],
      });
    }
    if (url.includes("/repos/octocat/beta/git/trees/main")) {
      return jsonResponse({
        truncated: false,
        tree: [{ path: "src/main.rs" }],
      });
    }
    return jsonResponse({ message: "not found" }, 404);
  };
  const analyzer = createGithubAnalyzer({ fetchImpl, now: () => FIXED_NOW });

  const result = await analyzer.fetchGithubSignals("octocat");

  assertEquals(result.fetch_status, "complete", "complete status");
  assertEquals(result.total_stars_received, 12, "star aggregate");
  assertEquals(result.primary_languages, [
    { name: "Rust", percent: 50 },
    { name: "TypeScript", percent: 50 },
  ], "language histogram");
  assertEquals(result.activity, {
    commits_last_year_estimate: 2,
    active_months_last_12: 1,
    longest_streak_days: 0,
  }, "bounded activity proxy");
  assertEquals(result.repo_signals, {
    with_readme_pct: 50,
    with_tests_pct: 50,
    with_ci_cd_pct: 50,
    fork_to_original_ratio: 0,
  }, "repository signal aggregate");
  assertEquals(result.pinned_repos?.[0].name, "alpha", "top repository order");
  assertEquals(result.pinned_repos?.[0].quality_score, 100, "quality score");
  assertEquals(urls.length, 4, "profile, one repo page, and two tree requests");
});

Deno.test("GitHub analyzer cache is case-insensitive and returns defensive copies", async () => {
  let fetchCount = 0;
  const analyzer = createGithubAnalyzer({
    now: () => FIXED_NOW,
    fetchImpl: async (input) => {
      fetchCount += 1;
      const url = String(input);
      if (url.includes("/repos?")) return jsonResponse([]);
      return jsonResponse(profile({ public_repos: 0 }));
    },
  });

  const first = await analyzer.fetchGithubSignals("octocat");
  first.followers = 999;
  const second = await analyzer.fetchGithubSignals(
    "https://github.com/OCTOCAT/",
  );

  assertEquals(
    fetchCount,
    2,
    "second analysis must use cached profile and repos",
  );
  assertEquals(
    second.followers,
    7,
    "cached result must not expose shared mutation",
  );
});

Deno.test("GitHub analyzer coalesces concurrent cache misses", async () => {
  let fetchCount = 0;
  const analyzer = createGithubAnalyzer({
    now: () => FIXED_NOW,
    fetchImpl: async (input) => {
      fetchCount += 1;
      await Promise.resolve();
      return String(input).includes("/repos?")
        ? jsonResponse([])
        : jsonResponse(profile({ public_repos: 0 }));
    },
  });

  const [first, second] = await Promise.all([
    analyzer.fetchGithubSignals("octocat"),
    analyzer.fetchGithubSignals("@OCTOCAT"),
  ]);

  assertEquals(
    fetchCount,
    2,
    "concurrent callers must share one provider flow",
  );
  assertEquals(first, second, "coalesced callers receive the same data");
});

Deno.test("GitHub analyzer expires cache entries after the configured TTL", async () => {
  let now = FIXED_NOW;
  let fetchCount = 0;
  const analyzer = createGithubAnalyzer({
    now: () => now,
    cacheTtlMs: 10,
    fetchImpl: async (input) => {
      fetchCount += 1;
      return String(input).includes("/repos?")
        ? jsonResponse([])
        : jsonResponse(profile({ public_repos: 0 }));
    },
  });

  await analyzer.fetchGithubSignals("octocat");
  now += 11;
  await analyzer.fetchGithubSignals("octocat");

  assertEquals(
    fetchCount,
    4,
    "expired cache must refresh both public endpoints",
  );
});

Deno.test("GitHub analyzer limits repository pagination to three pages", async () => {
  const requestedPages: number[] = [];
  const fetchImpl = async (input: string | URL | Request) => {
    const url = String(input);
    if (url === "https://api.github.com/users/octocat") {
      return jsonResponse(profile({ public_repos: 400 }));
    }
    const pageMatch = url.match(/[?&]page=(\d+)/);
    if (url.includes("/users/octocat/repos?") && pageMatch) {
      const page = Number(pageMatch[1]);
      requestedPages.push(page);
      return jsonResponse(
        Array.from(
          { length: 100 },
          (_, index) =>
            repo(`repo-${page}-${index}`, { stargazers_count: page }),
        ),
      );
    }
    if (url.includes("/git/trees/")) {
      return jsonResponse({ truncated: false, tree: [] });
    }
    return jsonResponse({ message: "not found" }, 404);
  };
  const analyzer = createGithubAnalyzer({ fetchImpl, now: () => FIXED_NOW });

  const result = await analyzer.fetchGithubSignals("octocat");

  assertEquals(requestedPages, [1, 2, 3], "pagination cap");
  assertEquals(result.fetch_status, "partial", "capped result is partial");
  assertEquals(result.error_reason, "GITHUB_PARTIAL_DATA", "partial reason");
});

Deno.test("GitHub analyzer degrades when a sampled repository tree fails", async () => {
  const fetchImpl = async (input: string | URL | Request) => {
    const url = String(input);
    if (url === "https://api.github.com/users/octocat") {
      return jsonResponse(profile({ public_repos: 1 }));
    }
    if (url.includes("/users/octocat/repos?")) {
      return jsonResponse([repo("alpha")]);
    }
    return jsonResponse({ message: "unavailable" }, 503);
  };
  const analyzer = createGithubAnalyzer({ fetchImpl, now: () => FIXED_NOW });

  const result = await analyzer.fetchGithubSignals("octocat");

  assertEquals(result.fetch_status, "partial", "tree failure must degrade");
  assertEquals(result.public_repos, 1, "profile data remains available");
  assertEquals(
    result.pinned_repos?.length,
    1,
    "repo metadata remains available",
  );
});

Deno.test("GitHub analyzer maps profile 404 and request timeout without throwing", async () => {
  const notFound = createGithubAnalyzer({
    fetchImpl: async () => jsonResponse({ message: "not found" }, 404),
  });
  const missing = await notFound.fetchGithubSignals("missing-user");
  assertEquals(missing, {
    fetch_status: "failed",
    error_reason: "GITHUB_USER_NOT_FOUND",
  }, "missing user envelope");

  const timeout = createGithubAnalyzer({
    requestTimeoutMs: 5,
    fetchImpl: (_input, init) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(new DOMException("Aborted", "AbortError")), { once: true });
      }),
  });
  const timedOut = await timeout.fetchGithubSignals("octocat");
  assertEquals(timedOut, {
    fetch_status: "failed",
    error_reason: "GITHUB_TIMEOUT",
  }, "timeout envelope");
});

Deno.test("GitHub analyzer rejects unsafe provider URLs", async () => {
  const analyzer = createGithubAnalyzer({
    fetchImpl: async (input) =>
      String(input).includes("/repos?")
        ? jsonResponse([])
        : jsonResponse(profile({ html_url: "javascript:alert(1)" })),
  });

  const result = await analyzer.fetchGithubSignals("octocat");

  assertEquals(result, {
    fetch_status: "failed",
    error_reason: "GITHUB_INVALID_RESPONSE",
  }, "unsafe profile URL must not reach the result contract");
});

Deno.test("GitHub analyzer rejects invalid input before making a request", async () => {
  let called = false;
  const analyzer = createGithubAnalyzer({
    fetchImpl: async () => {
      called = true;
      return jsonResponse({});
    },
  });

  try {
    await analyzer.fetchGithubSignals("github.com/octocat/repository");
    throw new Error("Expected INVALID_GITHUB_INPUT");
  } catch (error) {
    assert(error instanceof Error, "error expected");
    assertEquals(error.message, "INVALID_GITHUB_INPUT", "input error code");
  }
  assert(!called, "invalid input must not cross the network boundary");
});
