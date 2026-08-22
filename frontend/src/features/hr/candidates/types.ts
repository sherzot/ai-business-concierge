/**
 * Frontend mirror of the backend candidate-analysis types.
 *
 * SOURCE OF TRUTH:
 *   supabase/functions/server/services/hr-candidate/schemas/candidate-analysis.schema.json
 *
 * Implementation note:
 *   Keep this file in sync via `npx json-schema-to-typescript` or hand-edit.
 *   These types MUST match the backend `types.ts` shape one-to-one.
 */

export type Locale = "uz" | "ja" | "en";
export type AnalysisDepth = "fast" | "deep";
export type AnalysisStatus = "ok" | "degraded" | "error";

export type CandidateAnalysisResult = {
  request_id: string;
  status: AnalysisStatus;
  duration_ms: number;
  locale: Locale;
  result?: CandidateAnalysisPayload;
  error?: {
    code: string;
    message_uz: string;
    message_ja: string;
    message_en: string;
    field?: string;
  };
};

export type CandidateAnalysisPayload = {
  overall_score: number;
  grade: "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F";
  category_scores: CategoryScores;
  strengths: string[];
  weaknesses: string[];
  inconsistency_flags: InconsistencyFlag[];
  summary: string;
  interview_questions: InterviewQuestion[];
  hiring_recommendation: HiringRecommendation;
  raw_signals: RawSignals;
};

export type CategoryScores = {
  tech_depth: number;
  project_quality: number;
  activity: number;
  communication_docs: number;
  cv_github_consistency: number;
  role_fit: number | null;
};

export type CategoryKey = keyof CategoryScores;

export type InconsistencyFlag = {
  type:
    | "stack_mismatch"
    | "experience_gap"
    | "title_inflation"
    | "education_unverified"
    | "timeline_conflict"
    | "other";
  severity: "low" | "medium" | "high";
  explanation: string;
};

export type InterviewQuestion = {
  category:
    | "tech_depth"
    | "project_quality"
    | "activity"
    | "communication_docs"
    | "consistency"
    | "role_fit"
    | "behavioral";
  question: string;
  expected_signal: string;
  linked_evidence?: string;
};

export type HiringRecommendation = {
  decision: "strong_hire" | "interview" | "borderline" | "do_not_proceed";
  confidence: number;
  rationale: string;
};

export type RawSignals = {
  github: GithubSignals;
  cv: CvSignals;
};

export type GithubSignals = {
  username?: string;
  profile_url?: string;
  account_age_years?: number;
  followers?: number;
  following?: number;
  public_repos?: number;
  total_stars_received?: number;
  primary_languages?: { name: string; percent: number }[];
  pinned_repos?: PinnedRepo[];
  fetch_status: "complete" | "partial" | "failed";
};

export type PinnedRepo = {
  name: string;
  url?: string;
  stars: number;
  primary_language: string | null;
  has_readme: boolean;
  has_tests: boolean;
  has_ci: boolean;
  is_fork: boolean;
  quality_score: number;
};

export type CvSignals = {
  filename: string;
  format: "pdf" | "docx";
  experience_years_total?: number;
  roles?: {
    title: string;
    company: string;
    start: string;
    end?: string | null;
  }[];
  tech_skills?: string[];
  parse_status: "complete" | "partial" | "failed";
};

// ---------------------------------------------------------------------------
// Form input
// ---------------------------------------------------------------------------

export type AnalyzeFormInput = {
  githubInput: string;
  cvFile: File;
  jobDescription: string;
  locale: Locale;
  analysisDepth: AnalysisDepth;
};
