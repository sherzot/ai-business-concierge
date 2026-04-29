/**
 * HR Candidate Analysis — shared TypeScript types
 *
 * SOURCE OF TRUTH: ./schemas/candidate-analysis.schema.json
 * In implementation phase, regenerate via: `npx json-schema-to-typescript`
 * to keep this file in sync with the JSON Schema.
 *
 * For MVP skeleton these are hand-written and MUST match the JSON schema.
 */

export type Locale = "uz" | "ja" | "en";
export type AnalysisDepth = "fast" | "deep";
export type AnalysisStatus = "ok" | "degraded" | "error";
export type FetchStatus = "complete" | "partial" | "failed";

export type ErrorCode =
  | "INVALID_GITHUB_INPUT"
  | "GITHUB_USER_NOT_FOUND"
  | "GITHUB_UNAVAILABLE"
  | "CV_PARSE_FAILED"
  | "CV_TOO_LARGE"
  | "UNSUPPORTED_FILE_TYPE"
  | "UNAUTHENTICATED"
  | "FORBIDDEN_ROLE"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "INTERNAL";

// ---------------------------------------------------------------------------
// Request
// ---------------------------------------------------------------------------

export type AnalyzeRequest = {
  github_input: string;          // username or full GitHub URL
  cv_file: Uint8Array;           // raw bytes
  cv_mime: "application/pdf" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  cv_filename: string;
  job_description?: string;
  locale: Locale;
  analysis_depth: AnalysisDepth;
};

// ---------------------------------------------------------------------------
// Result envelope
// ---------------------------------------------------------------------------

export type CandidateAnalysisResult = {
  request_id: string;
  status: AnalysisStatus;
  duration_ms: number;
  locale: Locale;
  result?: CandidateAnalysisPayload;
  error?: ErrorEnvelope;
};

export type CandidateAnalysisPayload = {
  overall_score: number;       // 0–100
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
  role_fit: number | null;     // null when no job_description provided
};

export type InconsistencyFlag = {
  type: "stack_mismatch" | "experience_gap" | "title_inflation" | "education_unverified" | "timeline_conflict" | "other";
  severity: "low" | "medium" | "high";
  explanation: string;
};

export type InterviewQuestion = {
  category: "tech_depth" | "project_quality" | "activity" | "communication_docs" | "consistency" | "role_fit" | "behavioral";
  question: string;
  expected_signal: string;
  linked_evidence?: string;
};

export type HiringRecommendation = {
  decision: "strong_hire" | "interview" | "borderline" | "do_not_proceed";
  confidence: number;          // 0–1
  rationale: string;
};

// ---------------------------------------------------------------------------
// Raw signals (output of analyzers, input of scorer)
// ---------------------------------------------------------------------------

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
  activity?: {
    commits_last_year_estimate: number;
    active_months_last_12: number;
    longest_streak_days: number;
  };
  repo_signals?: {
    with_readme_pct: number;
    with_tests_pct: number;
    with_ci_cd_pct: number;
    fork_to_original_ratio: number;
  };
  pinned_repos?: PinnedRepo[];
  fetch_status: FetchStatus;
  error_reason?: string;
};

export type PinnedRepo = {
  name: string;
  url?: string;
  stars: number;
  primary_language: string | null;
  has_readme: boolean;
  has_tests: boolean;
  has_ci: boolean;
  last_commit_at: string | null;
  is_fork: boolean;
  quality_score: number;       // 0–100
  description?: string | null;
};

export type CvSignals = {
  filename: string;
  format: "pdf" | "docx";
  extracted_text_chars: number;
  experience_years_total?: number;
  roles?: CvRole[];
  tech_skills?: string[];
  education?: { degree: string; institution: string; year: number | null }[];
  languages?: string[];
  parse_status: FetchStatus;
  error_reason?: string;
};

export type CvRole = {
  title: string;
  company: string;
  start: string;               // YYYY-MM
  end?: string | null;         // YYYY-MM | null = current
  duration_months?: number;
};

export type ErrorEnvelope = {
  code: ErrorCode;
  message_uz: string;
  message_ja: string;
  message_en: string;
  field?: string;
};
