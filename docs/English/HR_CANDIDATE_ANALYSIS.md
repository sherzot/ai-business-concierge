# HR_CANDIDATE_ANALYSIS.md

> **AI Business Concierge — `hr_candidate_analysis` Module Design Package**
> Version: 1.0 (MVP design) · Date: 2026-04-29
> Owner: Sher · Module location: `features/hr/candidates/` (sub-module)

---

## 0. About this Document

This document is the **MVP design specification** for the `hr_candidate_analysis` module. It covers architecture, folder structure, API contract, JSON schema, backend implementation plan, scaling strategy and v2 roadmap. No production code — implementation will be delegated to the four specialised engineering agents in a follow-up session.

---

## 1. Module Purpose

An HR manager submits a GitHub username (or URL), a CV (PDF/DOCX) and an optional job description. The system runs four analysers in parallel, scores the candidate across six dimensions, and returns a structured JSON report with strengths, weaknesses, inconsistency flags, an AI summary, tailored interview questions, and a hiring recommendation. **Session-only** — no persistence in MVP.

**Out of scope (MVP):**
- GitHub OAuth / private repo access
- LinkedIn scraping
- ATS / calendar integration
- Persistent candidate database
- Bulk batch processing (>1 candidate per request)
- Video / audio interview analysis

---

## 2. Architecture

### 2.1 High-level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend — features/hr/candidates/                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ CandidateUploadForm                                      │   │
│  │   • GitHub username/URL input                            │   │
│  │   • CV file picker (PDF/DOCX, ≤ 5 MB)                    │   │
│  │   • Optional job description textarea                    │   │
│  │   • Locale selector (uz / ja / en)                       │   │
│  └────────────────────────┬─────────────────────────────────┘   │
└───────────────────────────┼─────────────────────────────────────┘
                            │ POST multipart/form-data
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend — supabase/functions/server                            │
│  routes/hr-candidate.ts → POST /v1/hr/candidates/analyze        │
│                            ↓                                    │
│  services/hr-candidate/index.ts  (Orchestrator)                 │
│  ┌────────────┬────────────┬───────────────┬────────────────┐   │
│  │ github-    │ cv-parser  │ candidate-    │ report-        │   │
│  │ analyzer   │            │ scorer        │ generator      │   │
│  │ (REST API) │ (PDF/DOCX) │ (Claude       │ (Claude        │   │
│  │            │            │  Sonnet 4)    │  Sonnet 4)     │   │
│  └────────────┴────────────┴───────────────┴────────────────┘   │
│        │            │             │                  │          │
│        └─Promise.all┘             └─sequential──────┘           │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
                      JSON response
                  (CandidateAnalysisResult)
```

### 2.2 Components

| Component | Responsibility | Technology |
|---|---|---|
| **github_analyzer** | Public profile → repo stats, stack, activity, README/CI/test signals | `fetch` → GitHub REST v3 |
| **cv_parser** | PDF/DOCX → structured text → experience years, roles, stack, education | `pdfjs-dist`, `docx`, Claude Haiku |
| **candidate_scorer** | GitHub + CV signals → 0–100 score across 6 categories | Claude Sonnet 4 (structured output) |
| **report_generator** | Scores + signals → narrative summary + interview questions + recommendation | Claude Sonnet 4, locale-aware |
| **orchestrator** | Parallel/sequential tool execution, timeout, partial failure handling | Promise.all + AbortController |

### 2.3 Data Flow

```
1. Validate input (Zod)
2. Parallel fetch (max 10s, AbortController):
     ├── github_analyzer.fetch(username)
     └── cv_parser.parse(file)
3. Collect raw signals → CandidateRawSignals
4. candidate_scorer.score(signals, jobDescription?, locale)
   → CategoryScores + inconsistency_flags
5. report_generator.generate(signals, scores, locale)
   → AI summary + interview_questions + hiring_recommendation
6. Assemble CandidateAnalysisResult → return JSON
7. (No persistence) — request_id returned for logging
```

### 2.4 SLA and Timeout Strategy

| Stage | Target | Hard timeout | Fallback |
|---|---|---|---|
| GitHub fetch | < 4 s | 6 s | Continue, `github_status: "partial"` |
| CV parse | < 3 s | 5 s | Return error, scoring impossible |
| Scoring (Sonnet) | < 8 s | 12 s | 3 retries, then `degraded: true` |
| Report (Sonnet) | < 10 s | 14 s | Return scores, `report_status: "failed"` |
| **Total** | **< 25 s** | **30 s (overall)** | 504 + `request_id` |

---

## 3. Folder Structure

### 3.1 Backend

```
supabase/functions/server/
├── index.ts                              # existing — mount new route
├── routes/
│   └── hr-candidate.ts                   # NEW — POST /v1/hr/candidates/analyze
└── services/
    └── hr-candidate/                     # NEW sub-folder
        ├── index.ts                      # Orchestrator
        ├── github-analyzer.ts            # Tool 1
        ├── cv-parser.ts                  # Tool 2
        ├── candidate-scorer.ts           # Tool 3
        ├── report-generator.ts           # Tool 4
        ├── types.ts                      # Shared TS types
        ├── prompts.ts                    # Sonnet system prompts (uz/ja/en)
        ├── schemas/
        │   └── candidate-analysis.schema.json
        └── __tests__/
            ├── github-analyzer.test.ts
            ├── cv-parser.test.ts
            └── candidate-scorer.test.ts
```

### 3.2 Frontend

```
frontend/src/features/hr/
└── candidates/                           # NEW sub-module
    ├── api/
    │   └── candidatesApi.ts              # POST /v1/hr/candidates/analyze
    ├── components/
    │   ├── CandidateUploadForm.tsx       # Main form
    │   ├── CandidateScoreCard.tsx        # 6-category score gauges
    │   ├── CandidateSummaryCard.tsx      # AI summary + recommendation
    │   ├── InconsistencyAlert.tsx        # CV ↔ GitHub mismatch flag
    │   ├── InterviewQuestionsList.tsx    # Interview questions
    │   └── GithubProfileBlock.tsx        # GitHub raw signals
    ├── hooks/
    │   ├── useCandidateAnalysis.ts       # React Query mutation
    │   └── useCandidateLocale.ts         # uz/ja/en switcher
    ├── pages/
    │   └── CandidateAnalysisPage.tsx     # /hr/candidates
    ├── types.ts                          # Schema mirror
    └── i18n/
        ├── uz.json
        ├── ja.json
        └── en.json
```

---

## 4. API Contract

### 4.1 Endpoint

```
POST /v1/hr/candidates/analyze
Content-Type: multipart/form-data
Authorization: Bearer <jwt>
X-Tenant-Id: <tenant_uuid>
Accept-Language: uz | ja | en   (default: uz)
```

### 4.2 Request Body (multipart)

| Field | Type | Required | Constraints |
|---|---|---|---|
| `github_input` | string | yes | username (`octocat`) or URL (`https://github.com/octocat`) |
| `cv_file` | file | yes | PDF or DOCX, ≤ 5 MB |
| `job_description` | string | no | ≤ 5,000 chars (plain text) |
| `locale` | string | no | `uz` \| `ja` \| `en`, default `uz` |
| `analysis_depth` | string | no | `fast` (Haiku scoring) \| `deep` (Sonnet scoring), default `deep` |

### 4.3 Success Response — `200 OK`

```json
{
  "request_id": "01JS9XK4ZE3R5NQ2H7P8M6V1WQ",
  "status": "ok",
  "duration_ms": 18432,
  "locale": "en",
  "result": {
    "overall_score": 78,
    "grade": "B+",
    "category_scores": {
      "tech_depth": 82,
      "project_quality": 74,
      "activity": 70,
      "communication_docs": 68,
      "cv_github_consistency": 90,
      "role_fit": 76
    },
    "strengths": ["..."],
    "weaknesses": ["..."],
    "inconsistency_flags": [],
    "summary": "The candidate has 4 years of backend experience...",
    "interview_questions": [
      {
        "category": "tech_depth",
        "question": "How did you solve the concurrency issue in Repository X?",
        "expected_signal": "..."
      }
    ],
    "hiring_recommendation": {
      "decision": "interview",
      "confidence": 0.78,
      "rationale": "..."
    },
    "raw_signals": { "github": {}, "cv": {} }
  }
}
```

### 4.4 Error Responses

| Status | Code | Cause |
|---|---|---|
| 400 | `INVALID_GITHUB_INPUT` | username/URL invalid |
| 400 | `CV_PARSE_FAILED` | PDF/DOCX could not be read |
| 400 | `CV_TOO_LARGE` | > 5 MB |
| 400 | `UNSUPPORTED_FILE_TYPE` | Not PDF or DOCX |
| 401 | `UNAUTHENTICATED` | JWT missing or invalid |
| 403 | `FORBIDDEN_ROLE` | User role is not HR/Manager/Admin |
| 404 | `GITHUB_USER_NOT_FOUND` | GitHub user doesn't exist |
| 429 | `RATE_LIMITED` | Plan limit reached |
| 504 | `TIMEOUT` | 30s overall hard timeout |

---

## 5. JSON Schema

### 5.1 `CandidateAnalysisPayload`

```jsonc
{
  "overall_score": 0-100,
  "grade": "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F",
  "category_scores": {
    "tech_depth": 0-100,
    "project_quality": 0-100,
    "activity": 0-100,
    "communication_docs": 0-100,
    "cv_github_consistency": 0-100,
    "role_fit": 0-100
  },
  "strengths": ["string"],           // max 8
  "weaknesses": ["string"],          // max 8
  "inconsistency_flags": [
    {
      "type": "stack_mismatch" | "experience_gap" | "title_inflation" | "education_unverified" | "other",
      "severity": "low" | "medium" | "high",
      "explanation": "string"
    }
  ],
  "summary": "string",               // max 1500 chars
  "interview_questions": [           // 5-12 items
    {
      "category": "tech_depth" | "project_quality" | "activity" | "communication_docs" | "consistency" | "role_fit" | "behavioral",
      "question": "string",
      "expected_signal": "string"
    }
  ],
  "hiring_recommendation": {
    "decision": "strong_hire" | "interview" | "borderline" | "do_not_proceed",
    "confidence": 0.0-1.0,
    "rationale": "string"
  }
}
```

---

## 6. Backend Implementation Plan

### 6.1 Tool 1 — `github_analyzer.ts`

```
Input:  { input: string }     // username or URL
Output: RawSignals.github

Steps:
  1. Normalise input → username (regex)
  2. fetch /users/:username → profile core
  3. fetch /users/:username/repos?per_page=100 → repos[]
  4. Compute aggregates: primary_languages, total_stars, repo_signals, fork ratio
  5. Pinned repos: GraphQL or top 6 by stars (REST fallback)
  6. Quality score per pinned repo:
        +20 README, +20 tests, +15 CI, +15 last_commit < 6mo,
        +15 stars > 5, +15 description > 30 chars
  7. Return { ...signals, fetch_status }

Rate limit: GitHub anonymous = 60 req/h.
Cache: 10 min TTL, key = username.
```

### 6.2 Tool 2 — `cv-parser.ts`

```
Input:  { file: Uint8Array, mime: string }
Output: RawSignals.cv

Steps:
  1. PDF       → pdfjs-dist text extraction
     DOCX      → mammoth.js text extraction
     else       → throw UNSUPPORTED_FILE_TYPE
  2. Normalise text (whitespace, unicode NFKC)
  3. Heuristic regex extract: date ranges, section headers
  4. Claude Haiku post-process (~500 tokens):
        Input:  raw text
        Output: structured JSON (roles, education, skills) — Zod validated
  5. Compute experience_years_total from role durations
  6. Return { ...cv, parse_status }

Notes:
  - Two-column PDFs may scramble — flag parse_status = "partial" if < 200 chars
  - Non-Latin scripts (Cyrillic, Japanese) — pdfjs handles, validate UTF-8
```

### 6.3 Tool 3 — `candidate-scorer.ts`

```
Model:  Claude Sonnet 4 (deep) or Haiku (fast)
Mode:   Structured output (JSON mode)

Scoring rubric:
  tech_depth:           +30 language match, +25 pinned quality, +20 stars/repo, +15 multi-lang, +10 modern stack
  project_quality:      +35 README%, +30 tests%, +20 CI%, +15 stars distribution
  activity:             +40 active months, +30 commits/year, +30 account age
  communication_docs:   +50 README quality, +30 commit messages, +20 PR descriptions
  cv_github_consistency: +50 stack overlap, +30 timeline match, +20 no inflation
  role_fit:             Sonnet semantic match (requires job_description)

Inconsistency detection:
  stack_mismatch:    CV claims "Senior Go" but GitHub Go% < 5
  experience_gap:    CV says 5y but GitHub age < 2y
  title_inflation:   CV "Senior" but no leadership signals
```

### 6.4 Tool 4 — `report-generator.ts`

```
Model:  Claude Sonnet 4
Mode:   Structured JSON output

Input:  scores + signals + jobDescription? + locale
Output: { strengths, weaknesses, summary, interview_questions, hiring_recommendation }

Interview question rules:
  - 5–12 questions
  - At least 1 per category (6 categories + behavioral)
  - Each tied to a specific repo/CV entry
  - No closed (yes/no) questions

Hiring recommendation logic:
  overall_score >= 85  → strong_hire
  70 <= score < 85     → interview
  55 <= score < 70     → borderline
  score < 55           → do_not_proceed
  high-severity inconsistency → downgrade one level
```

### 6.5 Cost & Latency Budget (per 1 analysis)

| Stage | Tokens in | Tokens out | Model | Cost (USD) |
|---|---|---|---|---|
| CV parse Haiku | ~2,000 | ~600 | Haiku 3.5 | $0.0040 |
| Candidate scorer (deep) | ~3,500 | ~800 | Sonnet 4 | $0.0225 |
| Report generator | ~3,000 | ~1,500 | Sonnet 4 | $0.0315 |
| **Total** | | | | **~$0.058** |

---

## 7. MVP Scaling Strategy

### 7.1 Core Principles

1. **Stateless** — each request is independent
2. **Idempotent** — same GitHub + CV hash → cache hit (10 min TTL)
3. **Graceful degradation** — if GitHub fails, continue with CV only
4. **No PII persistence** — CV only in memory, cleared after parse
5. **Modular** — each tool in its own file, test, monitoring metric

### 7.2 Performance Budgets

| Metric | Target | Action Point |
|---|---|---|
| p50 duration | < 18 s | OK |
| p95 duration | < 28 s | Alert |
| Error rate | < 2% | Page oncall |
| GitHub 404 rate | < 5% | UX hint "Check username" |
| CV parse fail rate | < 8% | Improve parser, show error UI |

### 7.3 Concurrency & Rate Limits

| Plan | Concurrent | Per minute | Per day |
|---|---|---|---|
| Free | 1 | 1 | 2 |
| Entrepreneur | 2 | 5 | 20 |
| Business | 5 | 20 | 100 |
| Company | 10 | 60 | 500 |

---

## 8. Error Handling

### 8.1 Tool-level Handling

| Tool | Error Type | Fallback |
|---|---|---|
| github_analyzer | 404 | `INVALID_GITHUB_INPUT` |
| github_analyzer | 5xx / timeout | partial signals, `degraded` |
| cv_parser | corrupt PDF | `CV_PARSE_FAILED` |
| cv_parser | scanned PDF (image-only) | `CV_PARSE_FAILED` + hint |
| candidate_scorer | Claude 5xx | 3x backoff, `INTERNAL` |
| report_generator | Claude 5xx | return scores, `report_status: "failed"` |

### 8.2 Frontend UX

- 504 timeout → "Analysis exceeded 30 seconds. Try with a shorter CV or contact support."
- Degraded → blue banner: "GitHub data partially retrieved — results may be incomplete"
- High inconsistency → yellow banner: "Warning: significant inconsistencies detected"

---

## 9. V2 Roadmap

| # | Feature | Effort |
|---|---|---|
| V2.1 | **GitHub OAuth** — private repos + contribution graph | M |
| V2.2 | **Persistence** (`candidates` table) | M |
| V2.3 | **Bulk import** (CSV with N usernames) | L |
| V2.4 | **LinkedIn parser** (PDF export) | M |
| V2.5 | **OCR for scanned CVs** | L |
| V2.6 | **Calendar/ATS integration** (Google Calendar, Greenhouse) | L |
| V2.7 | **Async job queue** (job_id polling) | M |
| V2.8 | **Custom rubric** (per tenant) | M |
| V2.9 | **Pre-screening Telegram bot** | S |
| V2.10 | **Bias audit dashboard** | XL |
| V2.11 | **Video CV / async interview** | XL |
| V2.12 | **Comparative ranking** (5+ candidates side-by-side) | M |

Effort: S (1-3 days), M (1 week), L (2 weeks), XL (1 month+).

---

## 10. Glossary

| UZ | JP | EN | Meaning |
|---|---|---|---|
| Nomzod | 候補者 | Candidate | Person who submitted a CV |
| Skor | スコア | Score | Number from 0-100 |
| Mos kelmaslik | 不一致 | Inconsistency | Discrepancy between CV and GitHub |
| Yollash tavsiyasi | 採用推奨 | Hiring recommendation | strong_hire / interview / borderline / do_not_proceed |
| Stack mosligi | スタック整合性 | Stack consistency | CV skills ↔ GitHub language overlap |
| Faollik | 活動レベル | Activity | Commits and active months |

---

## 11. Test Strategy

### 11.1 Unit Tests

- `github-analyzer.test.ts` — fixtures: octocat, torvalds, junior account, deleted user
- `cv-parser.test.ts` — fixtures: 5 PDFs (clean, two-column, scanned-fail, Cyrillic, Japanese), 3 DOCX
- `candidate-scorer.test.ts` — Claude mock, deterministic scoring inputs

### 11.2 Integration Tests

- Full flow: real GitHub (octocat) + sample CV → assert `status === 'ok'`, `overall_score` integer in [0, 100]
- Timeout: simulate 7s GitHub delay → assert `status === 'degraded'`
- Bad CV: corrupt PDF → assert 400 `CV_PARSE_FAILED`

### 11.3 Acceptance Tests (manual)

10 real candidates → HR rates them → AI score correlation > 0.7

---

## 12. Implementation Checklist (next session)

### Backend agent
- [ ] Create `services/hr-candidate/` folder
- [ ] GitHub fetch + cache wiring
- [ ] CV parser — pdfjs + mammoth integration
- [ ] Sonnet structured output (via LLM Router)
- [ ] Zod schemas + JSON Schema sync
- [ ] Unit + integration tests

### Frontend agent
- [ ] `features/hr/candidates/` skeleton
- [ ] Upload form + drag-drop + 5MB validation
- [ ] React Query mutation + locale switcher
- [ ] Score gauge component (Radix UI Progress)
- [ ] i18n (uz.json / ja.json / en.json)

### Database agent
- [ ] **Nothing to do** (MVP — no persistence)
- [ ] V2.2: prepare `candidates` migration

### Infrastructure agent
- [ ] Add Anthropic API key to Supabase secrets
- [ ] Sentry tag: `module: hr_candidate`
- [ ] Rate limit middleware configuration

---

## 13. Open Questions

1. **GitHub API quota** — anonymous 60/hour. Do we need OAuth for MVP? Sher's call.
2. **Japanese CV format** — 履歴書 (rirekisho) PDF — may need a separate parser (table-heavy). Separate ticket?
3. **Bias guardrails** — name/age/gender data should not affect scoring. Explicit guard in prompt?
4. **Storage** — where do we store CVs later (V2.2)? Supabase Storage with encryption-at-rest?
5. **Rate limit** — free plan: 2/day or 0/day? (HR feature — paid only?)

---

*HR_CANDIDATE_ANALYSIS.md v1.0 — Design only, no code yet*
*Next step: Sher approves → implementation session with 4 agents (frontend/backend/db/infra)*
