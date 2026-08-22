/**
 * Candidate report domain policy (Tool 4).
 *
 * Produces an evidence-linked deterministic report without a provider. Claude
 * refinement remains a later integration step and must preserve these output
 * bounds, decision rules, and bias constraints.
 */

import type { ScorerOutput } from "./candidate-scorer.ts";
import type {
  HiringRecommendation,
  InterviewQuestion,
  Locale,
  RawSignals,
} from "./types.ts";

export type ReportOutput = {
  strengths: string[];
  weaknesses: string[];
  summary: string;
  interview_questions: InterviewQuestion[];
  hiring_recommendation: HiringRecommendation;
};

type CategoryKey = keyof ScorerOutput["category_scores"];
type QuestionCategory = InterviewQuestion["category"];

const CATEGORY_LABELS: Record<Locale, Record<CategoryKey, string>> = {
  uz: {
    tech_depth: "texnik chuqurlik",
    project_quality: "loyiha sifati",
    activity: "public faollik",
    communication_docs: "hujjatlashtirish",
    cv_github_consistency: "CV va GitHub izchilligi",
    role_fit: "rolga moslik",
  },
  ja: {
    tech_depth: "技術的深さ",
    project_quality: "プロジェクト品質",
    activity: "公開活動",
    communication_docs: "ドキュメント",
    cv_github_consistency: "CV・GitHub整合性",
    role_fit: "職務適合度",
  },
  en: {
    tech_depth: "technical depth",
    project_quality: "project quality",
    activity: "public activity",
    communication_docs: "documentation",
    cv_github_consistency: "CV–GitHub consistency",
    role_fit: "role fit",
  },
};

export function generateReport(
  signals: RawSignals,
  scores: ScorerOutput,
  jobDescription: string | undefined,
  locale: Locale,
): Promise<ReportOutput> {
  const narrative = generateNarrativeBlock(
    signals,
    scores,
    jobDescription,
    locale,
  );
  return Promise.resolve({
    ...narrative,
    hiring_recommendation: computeHiringRecommendation(
      scores.overall_score,
      scores.inconsistency_flags,
      narrative.summary,
      locale,
    ),
  });
}

type NarrativeBlock = Omit<ReportOutput, "hiring_recommendation">;

function generateNarrativeBlock(
  signals: RawSignals,
  scores: ScorerOutput,
  jobDescription: string | undefined,
  locale: Locale,
): NarrativeBlock {
  return {
    strengths: buildStrengths(signals, scores, locale),
    weaknesses: buildEvidenceGaps(signals, scores, locale),
    summary: buildSummary(signals, scores, locale),
    interview_questions: buildInterviewQuestions(
      signals,
      scores,
      jobDescription,
      locale,
    ),
  };
}

export function computeHiringRecommendation(
  overall: number,
  flags: ScorerOutput["inconsistency_flags"],
  narrative: string,
  locale: Locale,
): HiringRecommendation {
  const normalizedOverall = score(overall);
  let bucket = decisionFromScore(normalizedOverall);
  if (flags.some((flag) => flag.severity === "high")) {
    bucket = stepDown(bucket);
  }

  const confidence = computeConfidence(normalizedOverall, flags);
  const rationale = boundedText(narrative, 500) ||
    rationaleFallback(bucket, locale);
  return { decision: bucket, confidence, rationale };
}

function buildStrengths(
  signals: RawSignals,
  scores: ScorerOutput,
  locale: Locale,
): string[] {
  const strengths = categoryEntries(scores)
    .filter(([, value]) => value >= 70)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([category, value]) =>
      localizedCategoryEvidence(locale, "strength", category, value)
    );

  const bestRepo = [...(signals.github.pinned_repos ?? [])]
    .slice(0, 10)
    .sort((left, right) =>
      score(right.quality_score) - score(left.quality_score)
    )[0];
  if (bestRepo && score(bestRepo.quality_score) >= 70) {
    strengths.push(repoEvidence(locale, bestRepo.name, bestRepo.quality_score));
  }
  return unique(strengths).slice(0, 6);
}

function buildEvidenceGaps(
  signals: RawSignals,
  scores: ScorerOutput,
  locale: Locale,
): string[] {
  const gaps = categoryEntries(scores)
    .filter(([, value]) => value < 55)
    .sort((left, right) => left[1] - right[1])
    .slice(0, 3)
    .map(([category, value]) =>
      localizedCategoryEvidence(locale, "gap", category, value)
    );

  if (signals.github.fetch_status !== "complete") {
    gaps.push(localized(locale, {
      uz:
        "GitHub dalillari to'liq olinmagan; public repository xulosalarini qayta tekshirish kerak.",
      ja:
        "GitHub の根拠取得が不完全です。公開リポジトリに関する結論は再確認が必要です。",
      en:
        "GitHub evidence is incomplete; conclusions about public repositories require re-checking.",
    }));
  }
  for (const flag of scores.inconsistency_flags.slice(0, 3)) {
    gaps.push(boundedText(flag.explanation, 300));
  }
  return unique(gaps).filter(Boolean).slice(0, 6);
}

function buildSummary(
  signals: RawSignals,
  scores: ScorerOutput,
  locale: Locale,
): string {
  const sorted = categoryEntries(scores).sort((left, right) =>
    right[1] - left[1]
  );
  const top = sorted[0];
  const flagCount = Math.min(10, scores.inconsistency_flags.length);
  const githubStatus = signals.github.fetch_status;
  const overall = score(scores.overall_score);

  const summary = localized(locale, {
    uz:
      `Deterministik tahlil ${overall}/100 (${scores.grade}) natija berdi. Eng kuchli o'lchov — ${
        CATEGORY_LABELS.uz[top[0]]
      } (${
        top[1]
      }/100). GitHub dalili: ${githubStatus}; tekshiriladigan flaglar: ${flagCount}. Natija faqat berilgan CV va public GitHub signallariga asoslangan, xususiy ishni taxmin qilmaydi.`,
    ja:
      `決定論的分析の結果は ${overall}/100（${scores.grade}）です。最も高い指標は${
        CATEGORY_LABELS.ja[top[0]]
      }（${
        top[1]
      }/100）です。GitHub 根拠: ${githubStatus}、確認対象フラグ: ${flagCount}件。結果は提供された CV と公開 GitHub シグナルのみに基づき、非公開の実績を推測しません。`,
    en:
      `Deterministic analysis produced ${overall}/100 (${scores.grade}). The highest category is ${
        CATEGORY_LABELS.en[top[0]]
      } (${
        top[1]
      }/100). GitHub evidence: ${githubStatus}; flags to verify: ${flagCount}. The result uses only the supplied CV and public GitHub signals and does not infer private work.`,
  });
  return boundedText(summary, 1_500);
}

function buildInterviewQuestions(
  signals: RawSignals,
  scores: ScorerOutput,
  jobDescription: string | undefined,
  locale: Locale,
): InterviewQuestion[] {
  const repoName = boundedText(
    signals.github.pinned_repos?.[0]?.name ?? "public repository",
    80,
  );
  const skill = boundedText(
    signals.cv.tech_skills?.[0] ?? "primary technology",
    80,
  );
  const role = boundedText(signals.cv.roles?.[0]?.title ?? "recent role", 80);
  const githubStatus = signals.github.fetch_status;
  const questions: InterviewQuestion[] = [
    question(locale, "tech_depth", "tech", skill, `cv_skill:${skill}`),
    question(
      locale,
      "project_quality",
      "project",
      repoName,
      `github_repo:${repoName}`,
    ),
    question(
      locale,
      "activity",
      "activity",
      githubStatus,
      `github_status:${githubStatus}`,
    ),
    question(
      locale,
      "communication_docs",
      "docs",
      repoName,
      `github_repo:${repoName}`,
    ),
    question(locale, "consistency", "consistency", role, `cv_role:${role}`),
  ];

  if (scores.category_scores.role_fit !== null && jobDescription?.trim()) {
    questions.push(
      question(locale, "role_fit", "role", skill, "job_description:provided"),
    );
  }
  questions.push(
    question(locale, "behavioral", "behavioral", role, `cv_role:${role}`),
  );
  return questions.slice(0, 12);
}

function question(
  locale: Locale,
  category: QuestionCategory,
  kind:
    | "tech"
    | "project"
    | "activity"
    | "docs"
    | "consistency"
    | "role"
    | "behavioral",
  evidence: string,
  linkedEvidence: string,
): InterviewQuestion {
  const templates: Record<Locale, Record<typeof kind, [string, string]>> = {
    uz: {
      tech: [
        `${evidence} bo'yicha eng murakkab texnik qaroringizni va rad etgan alternativalaringizni tushuntiring.`,
        "Chegaralar, trade-off, test va failure handlingni aniq dalil bilan tushuntiradi.",
      ],
      project: [
        `${evidence} loyihasida sifatni qanday o'lchadingiz va qaysi regressiyani testlar ushlagan?`,
        "O'lchanadigan sifat mezoni, real regressiya va test strategiyasini ko'rsatadi.",
      ],
      activity: [
        `Public GitHub holati “${evidence}”. Oxirgi 12 oydagi public yoki private engineering ishlaringizni vaqt chizig'i bilan tushuntiring.`,
        "Public signal chegarasini tan oladi va tekshiriladigan loyiha vaqt chizig'ini beradi.",
      ],
      docs: [
        `${evidence} uchun yangi maintainerga qaror va operatsion xavflarni qanday hujjatlashtirasiz?`,
        "Arxitektura qarori, setup, failure va recoveryni qamrab oladigan aniq struktura beradi.",
      ],
      consistency: [
        `CVdagi “${evidence}” roli bilan GitHub dalillari orasidagi farqni aniq loyihalar orqali tushuntiring.`,
        "Vaqt, rol va natijani tekshiriladigan misollar bilan bog'laydi.",
      ],
      role: [
        `Vakansiyadagi talablar uchun ${evidence} tajribangizni qaysi deliverable bilan isbotlaysiz?`,
        "Talabni konkret ish, mas'uliyat va natija bilan bog'laydi.",
      ],
      behavioral: [
        `${evidence} davrida muhim texnik kelishmovchilikni qanday hal qilgansiz?`,
        "Kontekst, qaror, hamkorlik, natija va o'rgangan saboqni izchil tushuntiradi.",
      ],
    },
    ja: {
      tech: [
        `${evidence}で最も難しかった技術判断と、採用しなかった選択肢を説明してください。`,
        "境界、トレードオフ、テスト、障害対応を具体的な根拠で説明できること。",
      ],
      project: [
        `${evidence}で品質をどう測定し、テストがどの回帰を検出しましたか。`,
        "測定可能な品質基準、実際の回帰、テスト戦略を示せること。",
      ],
      activity: [
        `公開 GitHub の状態は「${evidence}」です。直近12か月の公開・非公開の開発実績を時系列で説明してください。`,
        "公開情報の限界を認識し、確認可能なプロジェクト時系列を提示できること。",
      ],
      docs: [
        `${evidence}について、新しい保守担当者向けに意思決定と運用リスクをどう文書化しますか。`,
        "設計判断、セットアップ、障害、復旧を含む明確な構成を示せること。",
      ],
      consistency: [
        `CV の「${evidence}」と GitHub 根拠の差を、具体的なプロジェクトで説明してください。`,
        "時期、役割、成果を確認可能な例に結び付けられること。",
      ],
      role: [
        `求人要件に対する${evidence}の経験を、どの成果物で証明できますか。`,
        "要件を具体的な作業、責任、成果に結び付けられること。",
      ],
      behavioral: [
        `${evidence}の期間に、重要な技術的対立をどう解決しましたか。`,
        "状況、判断、協働、結果、学びを一貫して説明できること。",
      ],
    },
    en: {
      tech: [
        `Explain the hardest technical decision you made with ${evidence} and the alternatives you rejected.`,
        "Explains boundaries, trade-offs, tests, and failure handling with concrete evidence.",
      ],
      project: [
        `How did you measure quality in ${evidence}, and which regression did its tests catch?`,
        "Provides a measurable quality criterion, a real regression, and the test strategy.",
      ],
      activity: [
        `Public GitHub status is “${evidence}”. Walk through your public or private engineering work over the last 12 months.`,
        "Acknowledges the public-signal boundary and provides a verifiable project timeline.",
      ],
      docs: [
        `How would you document decisions and operational risks in ${evidence} for a new maintainer?`,
        "Provides a clear structure covering architecture decisions, setup, failure, and recovery.",
      ],
      consistency: [
        `Reconcile the “${evidence}” CV role with the available GitHub evidence using specific projects.`,
        "Connects dates, role, and outcomes to verifiable examples.",
      ],
      role: [
        `Which deliverable best demonstrates your ${evidence} experience against this job's requirements?`,
        "Connects a requirement to concrete work, responsibility, and outcome.",
      ],
      behavioral: [
        `Describe how you resolved a significant technical disagreement during your ${evidence} role.`,
        "Explains context, decision, collaboration, outcome, and learning coherently.",
      ],
    },
  };
  const [prompt, expectedSignal] = templates[locale][kind];
  return {
    category,
    question: boundedText(prompt, 500),
    expected_signal: boundedText(expectedSignal, 500),
    linked_evidence: boundedText(linkedEvidence, 200),
  };
}

function categoryEntries(scores: ScorerOutput): [CategoryKey, number][] {
  return (Object.entries(scores.category_scores) as [
    CategoryKey,
    number | null,
  ][])
    .flatMap(([category, value]) =>
      value === null ? [] : [[category, score(value)]]
    );
}

function localizedCategoryEvidence(
  locale: Locale,
  kind: "strength" | "gap",
  category: CategoryKey,
  value: number,
): string {
  const label = CATEGORY_LABELS[locale][category];
  if (kind === "strength") {
    return localized(locale, {
      uz: `${label} bo'yicha berilgan dalil kuchli: ${value}/100.`,
      ja: `${label}の提供済み根拠は強い水準です: ${value}/100。`,
      en: `Supplied evidence for ${label} is strong: ${value}/100.`,
    });
  }
  return localized(locale, {
    uz:
      `${label} bo'yicha mavjud dalil cheklangan: ${value}/100; suhbatda tekshiring.`,
    ja:
      `${label}の利用可能な根拠は限定的です: ${value}/100。面接で確認してください。`,
    en:
      `Available evidence for ${label} is limited: ${value}/100; verify it in the interview.`,
  });
}

function repoEvidence(
  locale: Locale,
  rawName: string,
  rawQuality: number,
): string {
  const name = boundedText(rawName, 80);
  const quality = score(rawQuality);
  return localized(locale, {
    uz: `${name} public repositorysi ${quality}/100 sifat signalini ko'rsatdi.`,
    ja: `公開リポジトリ ${name} の品質シグナルは ${quality}/100 です。`,
    en: `Public repository ${name} produced a ${quality}/100 quality signal.`,
  });
}

function decisionFromScore(value: number): HiringRecommendation["decision"] {
  if (value >= 85) return "strong_hire";
  if (value >= 70) return "interview";
  if (value >= 55) return "borderline";
  return "do_not_proceed";
}

function stepDown(
  decision: HiringRecommendation["decision"],
): HiringRecommendation["decision"] {
  switch (decision) {
    case "strong_hire":
      return "interview";
    case "interview":
      return "borderline";
    case "borderline":
    case "do_not_proceed":
      return "do_not_proceed";
  }
}

function computeConfidence(
  overall: number,
  flags: ScorerOutput["inconsistency_flags"],
): number {
  const nearestBoundary = Math.min(
    ...[85, 70, 55].map((boundary) => Math.abs(overall - boundary)),
  );
  const highFlagPenalty = Math.min(
    0.3,
    flags.filter((flag) => flag.severity === "high").length * 0.1,
  );
  const confidence = Math.min(0.95, 0.55 + nearestBoundary / 50) -
    highFlagPenalty;
  return Number(Math.max(0.2, confidence).toFixed(2));
}

function rationaleFallback(
  decision: HiringRecommendation["decision"],
  locale: Locale,
): string {
  const messages: Record<
    Locale,
    Record<HiringRecommendation["decision"], string>
  > = {
    uz: {
      strong_hire:
        "Berilgan dalil kuchli; strukturali texnik intervyuga tez o'tish tavsiya etiladi.",
      interview:
        "Berilgan dalil texnik intervyuga o'tish va asosiy signallarni tekshirishni qo'llab-quvvatlaydi.",
      borderline:
        "Dalillar aralash; qarordan oldin strukturali skrining orqali bo'shliqlarni tekshiring.",
      do_not_proceed:
        "Hozirgi dalil yetarli emas; yakuniy qarordan oldin qo'shimcha tekshiruv talab qilinadi.",
    },
    ja: {
      strong_hire:
        "提供された根拠は強く、構造化された技術面接へ速やかに進むことを推奨します。",
      interview:
        "提供された根拠は技術面接へ進み、主要シグナルを確認することを支持します。",
      borderline:
        "根拠は混在しています。判断前に構造化スクリーニングで不足点を確認してください。",
      do_not_proceed:
        "現時点の根拠は十分ではありません。最終判断前に追加確認が必要です。",
    },
    en: {
      strong_hire:
        "The supplied evidence is strong; move promptly to a structured technical interview.",
      interview:
        "The supplied evidence supports a technical interview to verify the key signals.",
      borderline:
        "Evidence is mixed; verify the gaps in a structured screening before deciding.",
      do_not_proceed:
        "Current evidence is insufficient; additional verification is required before a final decision.",
    },
  };
  return messages[locale][decision];
}

function localized<T>(locale: Locale, values: Record<Locale, T>): T {
  return values[locale];
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function boundedText(value: string, maximum: number): string {
  return value.trim().slice(0, maximum);
}

function score(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(Math.min(100, Math.max(0, value)));
}
