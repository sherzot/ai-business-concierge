/**
 * Candidate scoring domain policy (Tool 3).
 *
 * The deterministic baseline is intentionally limited to observable CV and
 * public GitHub signals. Provider refinement may adjust it later, but must
 * preserve the same output bounds and evidence-only bias rules.
 */

import type {
  AnalysisDepth,
  CategoryScores,
  InconsistencyFlag,
  Locale,
  RawSignals,
} from "./types.ts";

export type ScorerOutput = {
  overall_score: number;
  grade: "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F";
  category_scores: CategoryScores;
  inconsistency_flags: InconsistencyFlag[];
};

type TechnologyFamily =
  | "cpp"
  | "dotnet"
  | "go"
  | "javascript"
  | "jvm"
  | "php"
  | "python"
  | "ruby"
  | "rust"
  | "swift";

const TECHNOLOGY_PATTERNS: ReadonlyArray<
  readonly [TechnologyFamily, RegExp]
> = [
  [
    "javascript",
    /\b(?:javascript|typescript|node(?:\.js)?|nodejs|react(?:\.js)?|next(?:\.js)?|vue(?:\.js)?|angular)\b/i,
  ],
  ["python", /\b(?:python|django|flask|fastapi)\b/i],
  [
    "go",
    /(?:\bgolang\b|\bgo\b(?=\s+(?:backend|developer|engineer|language|programming)))/i,
  ],
  ["rust", /\brust\b/i],
  ["jvm", /\b(?:java|kotlin|spring(?: boot)?)\b/i],
  ["dotnet", /(?:\bc\s*#|\bcsharp\b|\.net\b|\bdotnet\b)/i],
  ["php", /\b(?:php|laravel|symfony)\b/i],
  ["ruby", /\b(?:ruby|rails)\b/i],
  ["swift", /\bswift\b/i],
  ["cpp", /(?:\bc\+\+|\bcpp\b)/i],
];

const SENIOR_TITLE =
  /\b(?:senior|sr\.?|lead|principal|staff|architect|head)\b/i;

export function scoreCandidate(
  signals: RawSignals,
  jobDescription: string | undefined,
  locale: Locale,
  _depth: AnalysisDepth,
): Promise<ScorerOutput> {
  const inconsistencyFlags = detectInconsistencies(signals, locale);
  const categoryScores = computeBaselineScores(
    signals,
    jobDescription,
    inconsistencyFlags,
  );

  // Provider refinement remains disabled until its key, schema validation,
  // accounting, and failure handling are wired through the orchestrator.
  const overall = weightedOverall(categoryScores);
  return Promise.resolve({
    overall_score: overall,
    grade: toGrade(overall),
    category_scores: categoryScores,
    inconsistency_flags: inconsistencyFlags,
  });
}

export function computeBaselineScores(
  signals: RawSignals,
  jobDescription?: string,
  inconsistencyFlags: InconsistencyFlag[] = detectInconsistencies(signals),
): CategoryScores {
  const githubLanguages = technologyFamilies(
    signals.github.primary_languages?.map((item) => item.name) ?? [],
  );
  const cvTechnologies = technologyFamilies(signals.cv.tech_skills ?? []);
  const stackOverlap = overlapRatio(cvTechnologies, githubLanguages);
  const pinnedRepos = (signals.github.pinned_repos ?? []).slice(0, 10);
  const repoSignals = signals.github.repo_signals;
  const activity = signals.github.activity;

  const averageQuality = average(
    pinnedRepos.map((repo) => bounded(repo.quality_score, 100)),
  );
  const averageStars = average(
    pinnedRepos.map((repo) => bounded(repo.stars, 1_000_000)),
  );
  const languageCount = Math.min(
    5,
    signals.github.primary_languages?.length ?? 0,
  );
  const hasModernStack = [...githubLanguages, ...cvTechnologies].some((item) =>
    item === "javascript" || item === "python" || item === "go" ||
    item === "rust"
  );

  const techDepth = stackOverlap * 30 +
    (averageQuality / 100) * 25 +
    Math.min(1, averageStars / 2) * 20 +
    Math.min(1, languageCount / 3) * 15 +
    (hasModernStack ? 10 : 0);

  const projectQuality = percentage(repoSignals?.with_readme_pct) * 0.35 +
    percentage(repoSignals?.with_tests_pct) * 0.30 +
    percentage(repoSignals?.with_ci_cd_pct) * 0.20 +
    (bounded(signals.github.total_stars_received, 1_000_000) > 0 ? 15 : 0);

  const activityScore =
    (bounded(activity?.active_months_last_12, 12) / 12) * 40 +
    (bounded(activity?.commits_last_year_estimate, 100) / 100) * 30 +
    (bounded(signals.github.account_age_years, 5) / 5) * 30;

  // Current GitHub adapter exposes README coverage, but not README length,
  // commit-message quality, or PR descriptions. Unobserved evidence earns no
  // points instead of being guessed.
  const communicationDocs = percentage(repoSignals?.with_readme_pct) * 0.50;

  const timelineMatch = timelineMatchRatio(
    signals.cv.experience_years_total,
    signals.github.account_age_years,
  );
  const hasStackMismatchFlag = inconsistencyFlags.some((flag) =>
    flag.type === "stack_mismatch"
  );
  const hasTitleInflationFlag = inconsistencyFlags.some((flag) =>
    flag.type === "title_inflation"
  );
  const consistency = (hasStackMismatchFlag ? 0 : stackOverlap * 50) +
    timelineMatch * 30 +
    (hasTitleInflationFlag ? 0 : 20);

  return {
    tech_depth: score(techDepth),
    project_quality: score(projectQuality),
    activity: score(activityScore),
    communication_docs: score(communicationDocs),
    cv_github_consistency: score(consistency),
    role_fit: deterministicRoleFit(
      jobDescription,
      cvTechnologies,
      githubLanguages,
    ),
  };
}

export function detectInconsistencies(
  signals: RawSignals,
  locale: Locale = "en",
): InconsistencyFlag[] {
  if (signals.github.fetch_status !== "complete") return [];

  const flags: InconsistencyFlag[] = [];
  const cvTechnologies = technologyFamilies(signals.cv.tech_skills ?? []);
  const githubLanguages = technologyFamilies(
    signals.github.primary_languages?.map((item) => item.name) ?? [],
  );
  const githubLanguageShares = technologyShares(
    signals.github.primary_languages ?? [],
  );
  const hasSeniorTitle = (signals.cv.roles ?? []).some((role) =>
    SENIOR_TITLE.test(role.title)
  );

  if (
    hasSeniorTitle && cvTechnologies.size >= 1 && githubLanguages.size >= 1 &&
    maximumMatchingShare(cvTechnologies, githubLanguageShares) < 5
  ) {
    flags.push({
      type: "stack_mismatch",
      severity: "medium",
      explanation: message(locale, "stack_mismatch"),
    });
  }

  const cvYears = bounded(signals.cv.experience_years_total, 80);
  const accountYears = bounded(signals.github.account_age_years, 80);
  if (
    cvYears >= 5 && accountYears > 0 && accountYears < 2 &&
    cvYears - accountYears >= 3
  ) {
    flags.push({
      type: "experience_gap",
      severity: "low",
      explanation: message(locale, "experience_gap"),
    });
  }

  const pinnedRepos = (signals.github.pinned_repos ?? []).slice(0, 10);
  const activeMonths = bounded(
    signals.github.activity?.active_months_last_12,
    12,
  );
  const publicEvidenceQuality = average(
    pinnedRepos.map((repo) => bounded(repo.quality_score, 100)),
  );
  if (
    hasSeniorTitle && pinnedRepos.length >= 3 && publicEvidenceQuality < 25 &&
    activeMonths < 2
  ) {
    flags.push({
      type: "title_inflation",
      severity: "low",
      explanation: message(locale, "title_inflation"),
    });
  }

  return flags;
}

const WEIGHTS = {
  tech_depth: 0.25,
  project_quality: 0.20,
  activity: 0.15,
  communication_docs: 0.10,
  cv_github_consistency: 0.20,
  role_fit: 0.10,
} as const;

export function weightedOverall(scores: CategoryScores): number {
  let total = 0;
  let weight = 0;
  for (
    const [key, categoryWeight] of Object.entries(WEIGHTS) as [
      keyof CategoryScores,
      number,
    ][]
  ) {
    const value = scores[key];
    if (value == null) continue;
    total += score(value) * categoryWeight;
    weight += categoryWeight;
  }
  return score(total / (weight || 1));
}

export function toGrade(rawScore: number): ScorerOutput["grade"] {
  const value = score(rawScore);
  if (value >= 92) return "A+";
  if (value >= 85) return "A";
  if (value >= 78) return "B+";
  if (value >= 70) return "B";
  if (value >= 63) return "C+";
  if (value >= 55) return "C";
  if (value >= 45) return "D";
  return "F";
}

function deterministicRoleFit(
  jobDescription: string | undefined,
  cvTechnologies: ReadonlySet<TechnologyFamily>,
  githubLanguages: ReadonlySet<TechnologyFamily>,
): number | null {
  if (!jobDescription?.trim()) return null;
  const required = technologyFamilies([jobDescription]);
  if (required.size === 0) return 50;

  const candidate = new Set([...cvTechnologies, ...githubLanguages]);
  return score(overlapCount(required, candidate) / required.size * 100);
}

function technologyFamilies(values: readonly string[]): Set<TechnologyFamily> {
  const families = new Set<TechnologyFamily>();
  for (const value of values.slice(0, 100)) {
    if (typeof value !== "string") continue;
    if (value.trim().toLowerCase() === "go") families.add("go");
    for (const [family, pattern] of TECHNOLOGY_PATTERNS) {
      if (pattern.test(value)) families.add(family);
    }
  }
  return families;
}

function technologyShares(
  languages: readonly { name: string; percent: number }[],
): Map<TechnologyFamily, number> {
  const shares = new Map<TechnologyFamily, number>();
  for (const language of languages.slice(0, 5)) {
    for (const family of technologyFamilies([language.name])) {
      shares.set(
        family,
        Math.min(100, (shares.get(family) ?? 0) + percentage(language.percent)),
      );
    }
  }
  return shares;
}

function maximumMatchingShare(
  expected: ReadonlySet<TechnologyFamily>,
  observed: ReadonlyMap<TechnologyFamily, number>,
): number {
  let maximum = 0;
  for (const family of expected) {
    maximum = Math.max(maximum, observed.get(family) ?? 0);
  }
  return maximum;
}

function overlapRatio(
  expected: ReadonlySet<TechnologyFamily>,
  observed: ReadonlySet<TechnologyFamily>,
): number {
  if (expected.size === 0 || observed.size === 0) return 0;
  return overlapCount(expected, observed) / expected.size;
}

function overlapCount<T>(left: ReadonlySet<T>, right: ReadonlySet<T>): number {
  let count = 0;
  for (const value of left) if (right.has(value)) count += 1;
  return count;
}

function timelineMatchRatio(
  experienceYears: number | undefined,
  accountAgeYears: number | undefined,
): number {
  const experience = bounded(experienceYears, 80);
  const accountAge = bounded(accountAgeYears, 80);
  if (experience === 0 || accountAge === 0) return 0;
  return Math.min(1, accountAge / experience);
}

function percentage(value: number | undefined): number {
  return bounded(value, 100);
}

function bounded(value: number | undefined, maximum: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.min(maximum, Math.max(0, value));
}

function average(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function score(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(Math.min(100, Math.max(0, value)));
}

function message(
  locale: Locale,
  type: "stack_mismatch" | "experience_gap" | "title_inflation",
): string {
  const messages: Record<Locale, Record<typeof type, string>> = {
    uz: {
      stack_mismatch:
        "CVdagi senior texnologiya yo'nalishi public GitHub tillari bilan mos kelmadi; suhbatda xususiy yoki ish loyihalari dalilini tekshiring.",
      experience_gap:
        "CVdagi tajriba muddati public GitHub akkaunti tarixidan ancha uzun; bu nomuvofiqlik emas, suhbatda oldingi yoki xususiy ish dalilini tekshiring.",
      title_inflation:
        "Senior unvonini tasdiqlash uchun mavjud public repository sifati va faollik dalili yetarli emas; leadership tajribasini suhbatda tekshiring.",
    },
    ja: {
      stack_mismatch:
        "CV のシニア技術領域と公開 GitHub の言語が一致しません。面接で非公開または業務プロジェクトの根拠を確認してください。",
      experience_gap:
        "CV の経験年数が公開 GitHub アカウントの履歴より大幅に長い状態です。不一致とは断定せず、過去または非公開の実績を面接で確認してください。",
      title_inflation:
        "シニア職位を裏付ける公開リポジトリの品質・活動データが十分ではありません。リーダーシップ経験を面接で確認してください。",
    },
    en: {
      stack_mismatch:
        "The senior technology focus in the CV does not overlap with public GitHub languages; verify private or work-project evidence in the interview.",
      experience_gap:
        "The CV experience period is much longer than the public GitHub account history; this is not proof of inconsistency, so verify earlier or private work evidence.",
      title_inflation:
        "Available public repository quality and activity do not substantiate the senior title; verify leadership evidence in the interview.",
    },
  };
  return messages[locale][type];
}
