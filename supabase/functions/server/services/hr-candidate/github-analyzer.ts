/**
 * GitHub Analyzer (Tool 1)
 *
 * Status: SKELETON (TODO bloklari implementatsiya kutilmoqda).
 * Owner: backend agent (next session).
 *
 * Responsibilities:
 *   • Normalise input (username | URL) → username
 *   • Fetch profile + repos via public REST API (no OAuth in MVP)
 *   • Compute aggregates: language histogram, total stars, repo signals
 *   • Pinned repo quality scoring (README / tests / CI / freshness)
 *   • Return GithubSignals with fetch_status (complete / partial / failed)
 *
 * Constraints:
 *   • Anonymous GitHub rate limit: 60 req/h per IP — must cache aggressively
 *   • Timeout: 6 s hard (orchestrator level)
 *   • Pagination: max 3 pages × 100 = 300 most recent repos
 */

import type { GithubSignals, PinnedRepo } from "./types.ts";

const GITHUB_API = "https://api.github.com";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function fetchGithubSignals(input: string): Promise<GithubSignals> {
  const username = normaliseGithubInput(input);
  if (!username) {
    throw new Error("INVALID_GITHUB_INPUT");
  }

  // TODO: cache lookup — key = `gh:${username}`, TTL 10 min
  //       use Supabase KV or in-memory Map (process scope)

  try {
    // -----------------------------------------------------------------------
    // 1. Profile core
    // -----------------------------------------------------------------------
    const profile = await fetchJson(`${GITHUB_API}/users/${username}`);
    if (!profile) {
      return { fetch_status: "failed", error_reason: "GITHUB_USER_NOT_FOUND" };
    }

    // -----------------------------------------------------------------------
    // 2. Repos (paginated, max 3 pages)
    // -----------------------------------------------------------------------
    // TODO: implement paginated fetch — sort=pushed, per_page=100
    const repos: GithubRepo[] = [];

    // -----------------------------------------------------------------------
    // 3. Language histogram
    // -----------------------------------------------------------------------
    // TODO: aggregate repos[].language → percent histogram (top 5)
    const primary_languages: { name: string; percent: number }[] = [];

    // -----------------------------------------------------------------------
    // 4. Repo signals (README / tests / CI sampling)
    // -----------------------------------------------------------------------
    // TODO: for top 10 starred + 6 pinned, fetch /contents to detect
    //       README.md, test/, .github/workflows/. Store boolean flags.
    const repo_signals = {
      with_readme_pct: 0,
      with_tests_pct: 0,
      with_ci_cd_pct: 0,
      fork_to_original_ratio: 0,
    };

    // -----------------------------------------------------------------------
    // 5. Pinned repos (GraphQL preferred, REST fallback = top 6 by stars)
    // -----------------------------------------------------------------------
    // TODO: try POST /graphql with `pinnedItems(first: 6)`; on auth fallback
    //       compute top 6 by stargazers_count from REST result.
    const pinned_repos: PinnedRepo[] = [];

    // -----------------------------------------------------------------------
    // 6. Activity estimate (commits proxy)
    // -----------------------------------------------------------------------
    // TODO: aggregate repos[].pushed_at distribution last 12 months
    const activity = {
      commits_last_year_estimate: 0,
      active_months_last_12: 0,
      longest_streak_days: 0,
    };

    // -----------------------------------------------------------------------
    // 7. Assemble
    // -----------------------------------------------------------------------
    const accountAgeYears = yearsSince(profile.created_at);

    return {
      username: profile.login,
      profile_url: profile.html_url,
      account_age_years: accountAgeYears,
      followers: profile.followers ?? 0,
      following: profile.following ?? 0,
      public_repos: profile.public_repos ?? 0,
      total_stars_received: repos.reduce((s, r) => s + (r.stargazers_count ?? 0), 0),
      primary_languages,
      activity,
      repo_signals,
      pinned_repos,
      fetch_status: "complete",
    };
  } catch (err) {
    return {
      fetch_status: "failed",
      error_reason: err instanceof Error ? err.message : "UNKNOWN",
    };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Accepts:  "octocat", "https://github.com/octocat", "github.com/octocat",
 *           "@octocat" → returns "octocat"
 * Rejects:  empty, contains slash beyond username, invalid chars
 */
export function normaliseGithubInput(raw: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().replace(/^@/, "");

  // URL form
  const urlMatch = trimmed.match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9-]{1,39})(?:\/|$)/i);
  if (urlMatch) return urlMatch[1];

  // Bare username — GitHub allows alphanumerics + hyphen, max 39, no leading/trailing hyphen
  if (/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(trimmed)) return trimmed;

  return null;
}

/**
 * Quality score for a single repo (0–100). Used for pinned repo evaluation.
 */
export function scoreRepoQuality(repo: GithubRepo, hasReadme: boolean, hasTests: boolean, hasCi: boolean): number {
  let score = 0;
  if (hasReadme) score += 20;
  if (hasTests) score += 20;
  if (hasCi) score += 15;
  if ((repo.stargazers_count ?? 0) > 5) score += 15;
  if ((repo.description?.length ?? 0) > 30) score += 15;
  if (repo.pushed_at && (Date.now() - new Date(repo.pushed_at).getTime()) < 6 * 30 * 86_400_000) {
    score += 15;
  }
  return Math.min(100, score);
}

async function fetchJson<T = any>(url: string): Promise<T | null> {
  // TODO: add User-Agent header (GitHub requires), timeout via AbortController
  const res = await fetch(url, { headers: { "User-Agent": "ai-business-concierge/1.0" } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GITHUB_${res.status}`);
  return await res.json() as T;
}

function yearsSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / (365.25 * 86_400_000);
}

// ---------------------------------------------------------------------------
// GitHub API minimal types (subset)
// ---------------------------------------------------------------------------

type GithubRepo = {
  name: string;
  full_name: string;
  fork: boolean;
  stargazers_count: number;
  language: string | null;
  pushed_at: string;
  description: string | null;
  html_url: string;
};
