/**
 * GithubProfileBlock — shows raw GitHub signals (stats, languages, pinned repos).
 *
 * Status: SKELETON.
 * Owner: frontend agent.
 *
 * When fetch_status === "failed":
 *   render a muted note ("GitHub ma'lumotlarini olib bo'lmadi") instead of the cards.
 *
 * When fetch_status === "partial":
 *   show a small amber chip near the heading.
 */

import type { GithubSignals } from "../types";

type Props = { github: GithubSignals; locale: "uz" | "ja" | "en" };

export function GithubProfileBlock({ github, locale }: Props) {
  if (github.fetch_status === "failed") {
    return (
      <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
        {locale === "uz"
          ? "GitHub ma'lumotlarini olib bo'lmadi — natija CV asosida."
          : locale === "ja"
            ? "GitHub データを取得できませんでした — 結果は CV のみに基づきます。"
            : "Could not fetch GitHub data — result is based on the CV only."}
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-baseline justify-between">
        <a href={github.profile_url} target="_blank" rel="noreferrer" className="text-base font-semibold text-indigo-700 hover:underline">
          @{github.username}
        </a>
        {github.fetch_status === "partial" && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
            partial
          </span>
        )}
      </div>

      {/* Top metrics */}
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <Stat label="Repos" value={github.public_repos} />
        <Stat label="Stars" value={github.total_stars_received} />
        <Stat label="Followers" value={github.followers} />
        <Stat label={locale === "uz" ? "Yosh (yil)" : locale === "ja" ? "年数" : "Account age"} value={fmtYears(github.account_age_years)} />
      </dl>

      {/* Languages */}
      {github.primary_languages && github.primary_languages.length > 0 && (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {locale === "uz" ? "Asosiy texnologiyalar" : locale === "ja" ? "主要技術" : "Top languages"}
          </p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {github.primary_languages.slice(0, 5).map((l) => (
              <li key={l.name} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
                {l.name} · {l.percent.toFixed(0)}%
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pinned repos */}
      {github.pinned_repos && github.pinned_repos.length > 0 && (
        <div className="mt-5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Pinned</p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {github.pinned_repos.map((r) => (
              <li key={r.name} className="rounded-lg border border-slate-200 px-3 py-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-slate-900">{r.name}</span>
                  <span className="text-xs text-slate-500">★ {r.stars}</span>
                </div>
                <div className="mt-1 flex gap-2 text-[11px] text-slate-500">
                  <span>{r.primary_language ?? "—"}</span>
                  {r.has_readme && <span title="README">📝</span>}
                  {r.has_tests && <span title="Tests">🧪</span>}
                  {r.has_ci && <span title="CI">⚙️</span>}
                  {r.is_fork && <span title="Fork">🍴</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string | undefined }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-base font-semibold text-slate-900">{value ?? "—"}</dd>
    </div>
  );
}

function fmtYears(v: number | undefined): string {
  if (v == null) return "—";
  return v.toFixed(1);
}
