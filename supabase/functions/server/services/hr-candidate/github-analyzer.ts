/**
 * GitHub public-profile analyzer.
 *
 * The adapter intentionally uses only public REST endpoints. A bounded,
 * process-local cache protects GitHub's anonymous 60 requests/hour/IP quota;
 * it is an optimization only and never an authorization boundary.
 */

import type { GithubSignals, PinnedRepo } from "./types.ts";

const GITHUB_API = "https://api.github.com";
const GITHUB_API_VERSION = "2026-03-10";
const CACHE_TTL_MS = 10 * 60 * 1_000;
const MAX_CACHE_ENTRIES = 250;
const REQUEST_TIMEOUT_MS = 3_000;
const ANALYSIS_TIMEOUT_MS = 5_500;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const MAX_REPO_PAGES = 3;
const REPOS_PER_PAGE = 100;
const MAX_SAMPLED_REPOS = 6;

type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export type GithubAnalyzerOptions = {
  fetchImpl?: FetchLike;
  now?: () => number;
  cacheTtlMs?: number;
  maxCacheEntries?: number;
  requestTimeoutMs?: number;
  analysisTimeoutMs?: number;
};

type CacheEntry = {
  expiresAt: number;
  signals: GithubSignals;
};

type GithubProfile = {
  login: string;
  html_url: string;
  created_at: string;
  followers: number;
  following: number;
  public_repos: number;
};

type GithubRepo = {
  name: string;
  full_name: string;
  fork: boolean;
  stargazers_count: number;
  language: string | null;
  pushed_at: string | null;
  description: string | null;
  html_url: string;
  default_branch: string;
};

type RepoInspection = {
  hasReadme: boolean;
  hasTests: boolean;
  hasCi: boolean;
  complete: boolean;
};

class GithubHttpError extends Error {
  constructor(readonly status: number) {
    super(
      status === 403 || status === 429
        ? "GITHUB_RATE_LIMITED"
        : `GITHUB_${status}`,
    );
  }
}

class GithubResponseError extends Error {
  constructor(message = "GITHUB_INVALID_RESPONSE") {
    super(message);
  }
}

export function createGithubAnalyzer(options: GithubAnalyzerOptions = {}) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? Date.now;
  const cacheTtlMs = options.cacheTtlMs ?? CACHE_TTL_MS;
  const maxCacheEntries = options.maxCacheEntries ?? MAX_CACHE_ENTRIES;
  const requestTimeoutMs = options.requestTimeoutMs ?? REQUEST_TIMEOUT_MS;
  const analysisTimeoutMs = options.analysisTimeoutMs ?? ANALYSIS_TIMEOUT_MS;
  const cache = new Map<string, CacheEntry>();
  const inFlight = new Map<string, Promise<GithubSignals>>();

  async function fetchGithubSignals(input: string): Promise<GithubSignals> {
    const username = normaliseGithubInput(input);
    if (!username) throw new Error("INVALID_GITHUB_INPUT");

    const cacheKey = username.toLowerCase();
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > now()) {
      cache.delete(cacheKey);
      cache.set(cacheKey, cached);
      return cloneSignals(cached.signals);
    }
    if (cached) cache.delete(cacheKey);

    const activeRequest = inFlight.get(cacheKey);
    if (activeRequest) return cloneSignals(await activeRequest);

    const request = analyzeGithubUser(username, {
      fetchImpl,
      now,
      requestTimeoutMs,
      analysisTimeoutMs,
    });
    inFlight.set(cacheKey, request);

    try {
      const signals = await request;
      if (cacheTtlMs > 0) {
        const resultTtl = cacheTtlFor(signals, cacheTtlMs);
        writeCache(
          cache,
          cacheKey,
          signals,
          now(),
          resultTtl,
          maxCacheEntries,
        );
      }
      return cloneSignals(signals);
    } finally {
      inFlight.delete(cacheKey);
    }
  }

  return {
    fetchGithubSignals,
    clearCache: () => cache.clear(),
  };
}

const defaultAnalyzer = createGithubAnalyzer();

export function fetchGithubSignals(input: string): Promise<GithubSignals> {
  return defaultAnalyzer.fetchGithubSignals(input);
}

async function analyzeGithubUser(
  username: string,
  dependencies: {
    fetchImpl: FetchLike;
    now: () => number;
    requestTimeoutMs: number;
    analysisTimeoutMs: number;
  },
): Promise<GithubSignals> {
  const encodedUsername = encodeURIComponent(username);
  const firstReposUrl = reposUrl(encodedUsername, 1);
  const deadlineAt = Date.now() + dependencies.analysisTimeoutMs;

  try {
    const [profileResponse, firstReposResponse] = await Promise.allSettled([
      fetchJson(
        `${GITHUB_API}/users/${encodedUsername}`,
        dependencies.fetchImpl,
        requestTimeout(dependencies.requestTimeoutMs, deadlineAt),
      ),
      fetchJson(
        firstReposUrl,
        dependencies.fetchImpl,
        requestTimeout(dependencies.requestTimeoutMs, deadlineAt),
      ),
    ]);

    if (profileResponse.status === "rejected") {
      if (
        profileResponse.reason instanceof GithubHttpError &&
        profileResponse.reason.status === 404
      ) {
        return failedSignals("GITHUB_USER_NOT_FOUND");
      }
      return failedSignals(errorReason(profileResponse.reason));
    }

    const profile = parseProfile(profileResponse.value);
    if (!profile) return failedSignals("GITHUB_INVALID_RESPONSE");

    let reposComplete = firstReposResponse.status === "fulfilled";
    let repos: GithubRepo[] = [];
    let lastPageSize = 0;

    if (firstReposResponse.status === "fulfilled") {
      const firstPage = parseRepos(firstReposResponse.value);
      repos = firstPage.repos;
      reposComplete = firstPage.complete;
      lastPageSize = firstPage.sourceCount;
    }

    for (
      let page = 2;
      reposComplete && page <= MAX_REPO_PAGES &&
      lastPageSize === REPOS_PER_PAGE;
      page += 1
    ) {
      try {
        const parsed = parseRepos(
          await fetchJson(
            reposUrl(encodedUsername, page),
            dependencies.fetchImpl,
            requestTimeout(dependencies.requestTimeoutMs, deadlineAt),
          ),
        );
        repos.push(...parsed.repos);
        reposComplete = parsed.complete;
        lastPageSize = parsed.sourceCount;
      } catch {
        reposComplete = false;
      }
    }

    if (lastPageSize === REPOS_PER_PAGE && repos.length >= 300) {
      reposComplete = false;
    }

    repos = deduplicateRepos(repos);
    const sampledRepos = [...repos]
      .sort(compareRepoQualityCandidates)
      .slice(0, MAX_SAMPLED_REPOS);

    const inspectionResults = await Promise.all(
      sampledRepos.map(async (repo) => {
        try {
          return await inspectRepo(repo, { ...dependencies, deadlineAt });
        } catch {
          return {
            hasReadme: false,
            hasTests: false,
            hasCi: false,
            complete: false,
          } satisfies RepoInspection;
        }
      }),
    );

    const inspectionsComplete = inspectionResults.every((item) =>
      item.complete
    );
    const pinnedRepos = sampledRepos.map((repo, index) =>
      toPinnedRepo(repo, inspectionResults[index], dependencies.now())
    );

    return {
      username: profile.login,
      profile_url: profile.html_url,
      account_age_years: yearsSince(profile.created_at, dependencies.now()),
      followers: profile.followers,
      following: profile.following,
      public_repos: profile.public_repos,
      total_stars_received: repos.reduce(
        (total, repo) => total + repo.stargazers_count,
        0,
      ),
      primary_languages: buildLanguageHistogram(repos),
      activity: buildActivity(repos, dependencies.now()),
      repo_signals: buildRepoSignals(repos, inspectionResults),
      pinned_repos: pinnedRepos,
      fetch_status: reposComplete && inspectionsComplete
        ? "complete"
        : "partial",
      ...(reposComplete && inspectionsComplete
        ? {}
        : { error_reason: "GITHUB_PARTIAL_DATA" }),
    };
  } catch (error) {
    return failedSignals(errorReason(error));
  }
}

/**
 * Accepts a bare username, @username, or an exact github.com profile URL.
 * Repository URLs and any extra path segment are rejected.
 */
export function normaliseGithubInput(raw: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().replace(/^@/, "");

  if (/^(?:https?:\/\/)?(?:www\.)?github\.com\//i.test(trimmed)) {
    try {
      const url = new URL(
        /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
      );
      if (
        url.hostname.toLowerCase() !== "github.com" &&
        url.hostname.toLowerCase() !== "www.github.com"
      ) return null;
      if (url.username || url.password || url.port || url.search || url.hash) {
        return null;
      }
      const path = url.pathname.split("/").filter(Boolean);
      if (path.length !== 1) return null;
      return isGithubUsername(path[0]) ? path[0] : null;
    } catch {
      return null;
    }
  }

  return isGithubUsername(trimmed) ? trimmed : null;
}

/** Quality score for a sampled repository (0–100). */
export function scoreRepoQuality(
  repo: GithubRepo,
  hasReadme: boolean,
  hasTests: boolean,
  hasCi: boolean,
  now = Date.now(),
): number {
  let score = 0;
  if (hasReadme) score += 20;
  if (hasTests) score += 20;
  if (hasCi) score += 15;
  if (repo.stargazers_count > 5) score += 15;
  if ((repo.description?.length ?? 0) > 30) score += 15;
  if (
    repo.pushed_at &&
    now - Date.parse(repo.pushed_at) < 6 * 30 * 86_400_000
  ) score += 15;
  return Math.min(100, score);
}

async function inspectRepo(
  repo: GithubRepo,
  dependencies: {
    fetchImpl: FetchLike;
    requestTimeoutMs: number;
    deadlineAt?: number;
  },
): Promise<RepoInspection> {
  const [owner, name] = repo.full_name.split("/");
  if (!owner || !name) throw new GithubResponseError();
  const url = `${GITHUB_API}/repos/${encodeURIComponent(owner)}/${
    encodeURIComponent(name)
  }/git/trees/${encodeURIComponent(repo.default_branch)}?recursive=1`;
  const raw = await fetchJson(
    url,
    dependencies.fetchImpl,
    dependencies.deadlineAt === undefined
      ? dependencies.requestTimeoutMs
      : requestTimeout(dependencies.requestTimeoutMs, dependencies.deadlineAt),
  );
  if (!isRecord(raw) || !Array.isArray(raw.tree)) {
    throw new GithubResponseError();
  }

  const paths = raw.tree.flatMap((entry) => {
    if (!isRecord(entry) || typeof entry.path !== "string") return [];
    return [entry.path.toLowerCase()];
  });

  return {
    hasReadme: paths.some((path) => /(^|\/)readme(?:\.[^/]+)?$/.test(path)),
    hasTests: paths.some((path) =>
      /(^|\/)(?:test|tests|__tests__|spec)(?:\/|$)/.test(path)
    ),
    hasCi: paths.some((path) => /^\.github\/workflows\/[^/]+/.test(path)),
    complete: raw.truncated !== true,
  };
}

async function fetchJson(
  url: string,
  fetchImpl: FetchLike,
  timeoutMs: number,
): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "ai-business-concierge/1.0",
        "X-GitHub-Api-Version": GITHUB_API_VERSION,
      },
    });
    if (!response.ok) {
      await response.body?.cancel();
      throw new GithubHttpError(response.status);
    }
    return await readJsonWithLimit(response, MAX_RESPONSE_BYTES);
  } catch (error) {
    if (controller.signal.aborted) throw new Error("GITHUB_TIMEOUT");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function readJsonWithLimit(
  response: Response,
  maxBytes: number,
): Promise<unknown> {
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    await response.body?.cancel();
    throw new GithubResponseError("GITHUB_RESPONSE_TOO_LARGE");
  }
  if (!response.body) throw new GithubResponseError();

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new GithubResponseError("GITHUB_RESPONSE_TOO_LARGE");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder().decode(body));
  } catch {
    throw new GithubResponseError();
  }
}

function parseProfile(raw: unknown): GithubProfile | null {
  if (!isRecord(raw)) return null;
  if (
    typeof raw.login !== "string" ||
    typeof raw.html_url !== "string" ||
    typeof raw.created_at !== "string" ||
    !isGithubUsername(raw.login) ||
    !isGithubHtmlUrl(raw.html_url, [raw.login]) ||
    !Number.isFinite(Date.parse(raw.created_at))
  ) return null;
  return {
    login: raw.login,
    html_url: raw.html_url,
    created_at: raw.created_at,
    followers: nonNegativeNumber(raw.followers),
    following: nonNegativeNumber(raw.following),
    public_repos: nonNegativeNumber(raw.public_repos),
  };
}

function parseRepos(raw: unknown): {
  repos: GithubRepo[];
  complete: boolean;
  sourceCount: number;
} {
  if (!Array.isArray(raw)) throw new GithubResponseError();
  const repos = raw.flatMap((candidate) => {
    const repo = parseRepo(candidate);
    return repo ? [repo] : [];
  });
  return {
    repos,
    complete: repos.length === raw.length,
    sourceCount: raw.length,
  };
}

function parseRepo(raw: unknown): GithubRepo | null {
  if (!isRecord(raw)) return null;
  if (
    typeof raw.name !== "string" ||
    typeof raw.full_name !== "string" ||
    typeof raw.html_url !== "string" ||
    typeof raw.default_branch !== "string" ||
    !isRepoSegment(raw.name) ||
    !isRepoSegment(raw.default_branch)
  ) return null;
  const nameParts = raw.full_name.split("/");
  if (
    nameParts.length !== 2 ||
    !nameParts.every(isRepoSegment) ||
    nameParts[1].toLowerCase() !== raw.name.toLowerCase() ||
    !isGithubHtmlUrl(raw.html_url, nameParts)
  ) return null;
  return {
    name: raw.name,
    full_name: raw.full_name,
    fork: raw.fork === true,
    stargazers_count: nonNegativeNumber(raw.stargazers_count),
    language: typeof raw.language === "string" ? raw.language : null,
    pushed_at: typeof raw.pushed_at === "string" ? raw.pushed_at : null,
    description: typeof raw.description === "string" ? raw.description : null,
    html_url: raw.html_url,
    default_branch: raw.default_branch,
  };
}

function buildLanguageHistogram(
  repos: GithubRepo[],
): { name: string; percent: number }[] {
  const ownedRepos = repos.some((repo) => !repo.fork)
    ? repos.filter((repo) => !repo.fork)
    : repos;
  const counts = new Map<string, number>();
  for (const repo of ownedRepos) {
    if (!repo.language) continue;
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  }
  const topLanguages = [...counts.entries()]
    .sort(([nameA, countA], [nameB, countB]) =>
      countB - countA || nameA.localeCompare(nameB)
    )
    .slice(0, 5);
  const total = topLanguages.reduce((sum, [, count]) => sum + count, 0);
  if (!total) return [];

  const histogram = topLanguages
    .map(([name, count]) => ({
      name,
      percent: Math.round((count / total) * 100),
    }));
  const difference = 100 -
    histogram.reduce((sum, item) => sum + item.percent, 0);
  histogram[0].percent += difference;
  return histogram;
}

function buildActivity(repos: GithubRepo[], now: number) {
  const twelveMonthsAgo = now - 365.25 * 86_400_000;
  const recentlyPushed = repos.filter((repo) => {
    const pushedAt = repo.pushed_at ? Date.parse(repo.pushed_at) : Number.NaN;
    return !repo.fork && Number.isFinite(pushedAt) &&
      pushedAt >= twelveMonthsAgo &&
      pushedAt <= now;
  });
  const activeMonths = new Set(
    recentlyPushed.map((repo) => repo.pushed_at!.slice(0, 7)),
  );
  return {
    // Public repo metadata exposes only the latest push time. This is a
    // conservative activity proxy, not a claim about the true commit count.
    commits_last_year_estimate: recentlyPushed.length,
    active_months_last_12: activeMonths.size,
    longest_streak_days: 0,
  };
}

function buildRepoSignals(
  repos: GithubRepo[],
  inspections: RepoInspection[],
) {
  const denominator = inspections.length;
  const percentage = (count: number) =>
    denominator ? Math.round((count / denominator) * 100) : 0;
  return {
    with_readme_pct: percentage(
      inspections.filter((item) => item.hasReadme).length,
    ),
    with_tests_pct: percentage(
      inspections.filter((item) => item.hasTests).length,
    ),
    with_ci_cd_pct: percentage(
      inspections.filter((item) => item.hasCi).length,
    ),
    fork_to_original_ratio: repos.length
      ? repos.filter((repo) => repo.fork).length / repos.length
      : 0,
  };
}

function toPinnedRepo(
  repo: GithubRepo,
  inspection: RepoInspection,
  now: number,
): PinnedRepo {
  return {
    name: repo.name,
    url: repo.html_url,
    stars: repo.stargazers_count,
    primary_language: repo.language,
    has_readme: inspection.hasReadme,
    has_tests: inspection.hasTests,
    has_ci: inspection.hasCi,
    last_commit_at: repo.pushed_at,
    is_fork: repo.fork,
    quality_score: scoreRepoQuality(
      repo,
      inspection.hasReadme,
      inspection.hasTests,
      inspection.hasCi,
      now,
    ),
    description: repo.description,
  };
}

function reposUrl(encodedUsername: string, page: number): string {
  return `${GITHUB_API}/users/${encodedUsername}/repos?type=owner&sort=pushed&direction=desc&per_page=${REPOS_PER_PAGE}&page=${page}`;
}

function compareRepoQualityCandidates(a: GithubRepo, b: GithubRepo): number {
  return b.stargazers_count - a.stargazers_count ||
    timestamp(b.pushed_at) - timestamp(a.pushed_at) ||
    a.full_name.localeCompare(b.full_name);
}

function deduplicateRepos(repos: GithubRepo[]): GithubRepo[] {
  const byName = new Map<string, GithubRepo>();
  for (const repo of repos) byName.set(repo.full_name.toLowerCase(), repo);
  return [...byName.values()];
}

function writeCache(
  cache: Map<string, CacheEntry>,
  key: string,
  signals: GithubSignals,
  now: number,
  ttlMs: number,
  maxEntries: number,
): void {
  for (const [cacheKey, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(cacheKey);
  }
  while (cache.size >= Math.max(1, maxEntries)) {
    const oldestKey = cache.keys().next().value;
    if (typeof oldestKey !== "string") break;
    cache.delete(oldestKey);
  }
  cache.set(key, {
    expiresAt: now + ttlMs,
    signals: cloneSignals(signals),
  });
}

function cacheTtlFor(signals: GithubSignals, configuredTtlMs: number): number {
  if (signals.error_reason === "GITHUB_USER_NOT_FOUND") return configuredTtlMs;
  if (signals.fetch_status === "failed") {
    return Math.min(configuredTtlMs, 30_000);
  }
  if (signals.fetch_status === "partial") {
    return Math.min(configuredTtlMs, 60_000);
  }
  return configuredTtlMs;
}

function cloneSignals(signals: GithubSignals): GithubSignals {
  return structuredClone(signals);
}

function failedSignals(errorReasonValue: string): GithubSignals {
  return { fetch_status: "failed", error_reason: errorReasonValue };
}

function errorReason(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "GITHUB_UNAVAILABLE";
}

function yearsSince(iso: string, now: number): number {
  const createdAt = Date.parse(iso);
  if (!Number.isFinite(createdAt) || createdAt > now) return 0;
  return (now - createdAt) / (365.25 * 86_400_000);
}

function timestamp(value: string | null): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function requestTimeout(perRequestMs: number, deadlineAt: number): number {
  return Math.max(1, Math.min(perRequestMs, deadlineAt - Date.now()));
}

function nonNegativeNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : 0;
}

function isGithubUsername(value: string): boolean {
  return /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(value);
}

function isRepoSegment(value: string): boolean {
  return /^[A-Za-z0-9_.-]{1,100}$/.test(value);
}

function isGithubHtmlUrl(value: string, expectedPath: string[]): boolean {
  try {
    const url = new URL(value);
    const actualPath = url.pathname.split("/").filter(Boolean);
    return url.protocol === "https:" &&
      url.hostname.toLowerCase() === "github.com" &&
      !url.username && !url.password && !url.port && !url.search && !url.hash &&
      actualPath.length === expectedPath.length &&
      actualPath.every((part, index) =>
        part.toLowerCase() === expectedPath[index].toLowerCase()
      );
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
