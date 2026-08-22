# HR_CANDIDATE_ANALYSIS.md

> **Holat: PARTIAL IMPLEMENTATION / DESIGN.** Public GitHub adapter/cache, bounded local PDF/DOCX extraction, pure request/role/tariff policy, PostgreSQL minute/day/concurrency lease va finally-release lifecycle, bounded multipart, atomic usage accounting, strict provider output/account-before-validation contracti, deterministic scorer/evidence report, orchestrator va frontend real/testlangan. Real semantic CV/Sonnet invocation va full HTTP wiring qolgan; canonical endpoint `501 NOT_IMPLEMENTED`. Joriy holat: [STATUS.md](STATUS.md).

> **AI Business Concierge — `hr_candidate_analysis` modul dizayn paketi**
> Version: 1.0 (MVP design) · Sana: 2026-04-29 · Til: O'zbekcha / 日本語 / English
> Owner: Sher · Modul joylashuvi: `features/hr/candidates/` (sub-module)

---

## 0. Hujjat haqida / 文書概要 / About this document

### 🇺🇿 O'zbekcha
Bu hujjat `hr_candidate_analysis` modulining **MVP dizayn spetsifikatsiyasi**. Ichida arxitektura, API contract, JSON schema, backend implementatsiya rejasi va v2 yo'nalishi bor. Kod yozmasdan, faqat dizayn — implementatsiya keyingi sessiyada 4 ta agent (frontend/backend/database/infrastructure) tomonidan amalga oshiriladi.

### 🇯🇵 日本語
本書は `hr_candidate_analysis` モジュールの **MVP 設計仕様書**です。アーキテクチャ、API 契約、JSON スキーマ、バックエンド実装計画、v2 ロードマップを含みます。実装は次のセッションで 4 つの専門エージェント（frontend / backend / database / infrastructure）が担当します。

### 🇬🇧 English
This document is the **MVP design specification** for the `hr_candidate_analysis` module. It covers architecture, folder structure, API contract, JSON schema, backend implementation plan, scaling strategy and v2 roadmap. No production code — implementation will be delegated to the four specialised engineering agents in a follow-up session.

---

## 1. Modul maqsadi / モジュールの目的 / Module Purpose

### 🇺🇿 O'zbekcha
HR menejer GitHub username + CV (PDF/DOCX) + (ixtiyoriy) lavozim ta'rifi yuboradi → AI nomzodni 6 ta o'lchovda baholaydi va strukturali hisobot, intervyu savollari va yollash tavsiyasini qaytaradi. Ma'lumotlar **session-only** (DB ga saqlanmaydi).

### 🇯🇵 日本語
HR 担当者が GitHub ユーザー名・CV（PDF/DOCX）・任意の求人説明を送信 → AI が候補者を 6 軸で評価し、構造化レポート、面接質問、採用推奨を返します。データは **セッション限定**（DB に永続化しない）。

### 🇬🇧 English
An HR manager submits a GitHub username (or URL), a CV (PDF/DOCX) and an optional job description. The system runs four analysers in parallel, scores the candidate across six dimensions, and returns a structured JSON report with strengths, weaknesses, inconsistency flags, an AI summary, tailored interview questions, and a hiring recommendation. **Session-only** — no persistence in MVP.

### Out of scope (MVP)
- GitHub OAuth / private repo access
- LinkedIn scraping
- ATS / calendar integration
- Persistent candidate database
- Bulk batch processing (>1 candidate per request)
- Video / audio interview analysis

---

## 2. Arxitektura / アーキテクチャ / Architecture

### 2.1 High-level oqim / フロー / Flow

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

### 2.2 Komponentlar / コンポーネント / Components

| Komponent | Mas'uliyat | Texnologiya |
|---|---|---|
| **github_analyzer** | Public profile → repo statistikasi, stack, faollik, README/CI/test signali, pinned repo sifati | `fetch` → GitHub REST v3 |
| **cv_parser** | PDF/DOCX → bounded local matn/signal; semantic rollar/ta'lim keyin | `pdfjs-dist` (PDF), `mammoth` (DOCX), regex + pending Claude Haiku post-processing |
| **candidate_scorer** | GitHub + CV ma'lumotlarini birlashtirib 6 ta kategoriya bo'yicha 0–100 ball | Claude Sonnet 4 (structured output) |
| **report_generator** | Skorlar + raw signal → narrativ summary + intervyu savollari + tavsiya | Claude Sonnet 4, locale-aware (uz/ja/en) |
| **orchestrator (`index.ts`)** | Tool larni parallel/sequential ishlatish, timeout, partial failure handling | Native Promise.all + AbortController |

### 2.3 Ma'lumot oqimi / データフロー / Data flow

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
7. (No persistence) — request_id qaytariladi log uchun
```

### 2.4 SLA va timeout strategiyasi

| Bosqich | Target | Hard timeout | Fallback |
|---|---|---|---|
| GitHub fetch | < 4 s | 6 s | Davom etamiz, `github_status: "partial"` |
| CV parse | < 3 s | 5 s | Xato qaytaramiz, scoring imkonsiz |
| Scoring (Sonnet) | < 8 s | 12 s | 3-marta retry, oxirida `degraded: true` |
| Report (Sonnet) | < 10 s | 14 s | Skorlarni qaytaramiz, `report_status: "failed"` |
| **Total** | **< 25 s** | **30 s (overall)** | 504 + `request_id` |

---

## 3. Folder structure / フォルダ構成 / Folder Structure

Mavjud `features/hr/` ichidagi sub-module va Supabase backend service. Hech qanday mavjud fayl o'zgarmaydi.

### 3.1 Backend

```
supabase/functions/server/
├── index.ts                              # mavjud — yangi route mount qilamiz
├── routes/
│   └── hr-candidate.ts                   # YANGI — POST /v1/hr/candidates/analyze
└── services/
    └── hr-candidate/                     # YANGI sub-papka
        ├── index.ts                      # Orchestrator
        ├── github-analyzer.ts            # Tool 1
        ├── cv-parser.ts                  # Tool 2
        ├── candidate-scorer.ts           # Tool 3
        ├── report-generator.ts           # Tool 4
        ├── types.ts                      # Shared TS types
        ├── prompts.ts                    # Sonnet system prompts (uz/ja/en)
        ├── schemas/
        │   └── candidate-analysis.schema.json   # JSON Schema (canonical)
        └── __tests__/
            ├── github-analyzer.test.ts
            ├── cv-parser.test.ts
            └── candidate-scorer.test.ts
```

### 3.2 Frontend

```
frontend/src/features/hr/
├── ... (mavjud HR fayllar — o'zgarmaydi)
└── candidates/                           # YANGI sub-modul
    ├── api/
    │   └── candidatesApi.ts              # POST /v1/hr/candidates/analyze
    ├── components/
    │   ├── CandidateUploadForm.tsx       # Asosiy forma
    │   ├── CandidateScoreCard.tsx        # 6 kategoriya score gauge
    │   ├── CandidateSummaryCard.tsx      # AI summary + recommendation
    │   ├── InconsistencyAlert.tsx        # CV ↔ GitHub farq belgisi
    │   ├── InterviewQuestionsList.tsx    # Intervyu savollari
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

### 3.3 Routing yangilash

Frontend `app/router.tsx` ga qo'shiladi:
```
/hr/candidates       → CandidateAnalysisPage  (rol: HR | TENANT_ADMIN | MANAGER)
```

Backend `supabase/functions/server/index.ts` ga qo'shiladi:
```
import hrCandidateRoutes from "./routes/hr-candidate.ts";
app.route(`${V1_PATH}/hr/candidates`, hrCandidateRoutes);
```

---

## 4. API Contract / API 契約 / API Contract

### 4.1 Endpoint

```
POST /v1/hr/candidates/analyze
Content-Type: multipart/form-data
Authorization: Bearer <jwt>
X-Tenant-Id: <tenant_uuid>
Accept-Language: uz | ja | en   (default: uz)
```

### 4.2 Request body (multipart)

| Field | Type | Required | Constraints |
|---|---|---|---|
| `github_input` | string | yes | username (`octocat`) yoki URL (`https://github.com/octocat`) |
| `cv_file` | file | yes | PDF or DOCX, ≤ 5 MB |
| `job_description` | string | no | ≤ 5,000 chars (plain text) |
| `locale` | string | no | `uz` \| `ja` \| `en`, default `uz` |
| `analysis_depth` | string | no | `fast` (Haiku scoring) \| `deep` (Sonnet scoring), default `deep` |

### 4.3 Success response — `200 OK`

`Content-Type: application/json` — to'liq JSON schema 5-bo'limda. Qisqa misol:

```json
{
  "request_id": "01JS9XK4ZE3R5NQ2H7P8M6V1WQ",
  "status": "ok",
  "duration_ms": 18432,
  "locale": "uz",
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
    "summary": "Nomzod 4 yillik backend tajribaga ega...",
    "interview_questions": [
      {"category": "tech_depth", "question": "Repository X da concurrency muammoni qanday yechgansiz?", "expected_signal": "..."}
    ],
    "hiring_recommendation": {
      "decision": "interview",
      "confidence": 0.78,
      "rationale": "..."
    },
    "raw_signals": { "github": {...}, "cv": {...} }
  }
}
```

### 4.4 Error responses

| Status | Code | Sabab |
|---|---|---|
| 400 | `INVALID_GITHUB_INPUT` | username/URL yaroqsiz |
| 400 | `CV_PARSE_FAILED` | PDF/DOCX o'qib bo'lmadi |
| 400 | `CV_TOO_LARGE` | > 5 MB |
| 400 | `UNSUPPORTED_FILE_TYPE` | PDF/DOCX dan boshqa |
| 401 | `UNAUTHENTICATED` | JWT yo'q yoki yaroqsiz |
| 403 | `FORBIDDEN_ROLE` | Foydalanuvchi rol HR/Manager/Admin emas |
| 404 | `GITHUB_USER_NOT_FOUND` | GitHub'da user yo'q |
| 429 | `RATE_LIMITED` | Tarif limiti yetdi |
| 502 | `GITHUB_UNAVAILABLE` | GitHub API ishlamayapti |
| 504 | `TIMEOUT` | 30 s overall hard timeout |
| 500 | `INTERNAL` | Boshqa xato (request_id bilan log da) |

Format:
```json
{
  "request_id": "01JS9XK...",
  "status": "error",
  "error": {
    "code": "GITHUB_USER_NOT_FOUND",
    "message_uz": "GitHub'da bunday foydalanuvchi topilmadi",
    "message_ja": "指定された GitHub ユーザーが見つかりません",
    "message_en": "GitHub user not found",
    "field": "github_input"
  }
}
```

### 4.5 Async variant (v2 candidate)

Agar deep scoring 25 s dan oshsa — `202 Accepted` + `job_id` qaytaramiz, polling `GET /v1/hr/candidates/jobs/:id`. **MVP da yo'q**, lekin schema joy qoldirib qo'yiladi.

---

## 5. JSON Schema / JSON スキーマ / JSON Schema

To'liq schema fayl: `supabase/functions/server/services/hr-candidate/schemas/candidate-analysis.schema.json` (alohida deliverable).

### 5.1 Top-level shape

```jsonc
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "title": "CandidateAnalysisResult",
  "type": "object",
  "required": ["request_id", "status", "duration_ms", "locale", "result"],
  "properties": {
    "request_id": {"type": "string", "description": "ULID"},
    "status": {"enum": ["ok", "degraded", "error"]},
    "duration_ms": {"type": "integer", "minimum": 0},
    "locale": {"enum": ["uz", "ja", "en"]},
    "result": {"$ref": "#/$defs/CandidateAnalysisPayload"}
  }
}
```

### 5.2 `CandidateAnalysisPayload`

```jsonc
{
  "type": "object",
  "required": [
    "overall_score", "grade", "category_scores",
    "strengths", "weaknesses", "inconsistency_flags",
    "summary", "interview_questions", "hiring_recommendation",
    "raw_signals"
  ],
  "properties": {
    "overall_score": {"type": "integer", "minimum": 0, "maximum": 100},
    "grade": {"enum": ["A+", "A", "B+", "B", "C+", "C", "D", "F"]},
    "category_scores": {
      "type": "object",
      "required": [
        "tech_depth", "project_quality", "activity",
        "communication_docs", "cv_github_consistency", "role_fit"
      ],
      "properties": {
        "tech_depth":            {"type": "integer", "minimum": 0, "maximum": 100},
        "project_quality":       {"type": "integer", "minimum": 0, "maximum": 100},
        "activity":              {"type": "integer", "minimum": 0, "maximum": 100},
        "communication_docs":    {"type": "integer", "minimum": 0, "maximum": 100},
        "cv_github_consistency": {"type": "integer", "minimum": 0, "maximum": 100},
        "role_fit":              {"type": "integer", "minimum": 0, "maximum": 100}
      }
    },
    "strengths":  {"type": "array", "items": {"type": "string"}, "maxItems": 8},
    "weaknesses": {"type": "array", "items": {"type": "string"}, "maxItems": 8},
    "inconsistency_flags": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["type", "severity", "explanation"],
        "properties": {
          "type":        {"enum": ["stack_mismatch", "experience_gap", "title_inflation", "education_unverified", "other"]},
          "severity":    {"enum": ["low", "medium", "high"]},
          "explanation": {"type": "string"}
        }
      }
    },
    "summary": {"type": "string", "maxLength": 1500},
    "interview_questions": {
      "type": "array",
      "minItems": 5,
      "maxItems": 12,
      "items": {
        "type": "object",
        "required": ["category", "question", "expected_signal"],
        "properties": {
          "category":        {"enum": ["tech_depth", "project_quality", "activity", "communication_docs", "consistency", "role_fit", "behavioral"]},
          "question":        {"type": "string"},
          "expected_signal": {"type": "string"}
        }
      }
    },
    "hiring_recommendation": {
      "type": "object",
      "required": ["decision", "confidence", "rationale"],
      "properties": {
        "decision":   {"enum": ["strong_hire", "interview", "borderline", "do_not_proceed"]},
        "confidence": {"type": "number", "minimum": 0, "maximum": 1},
        "rationale":  {"type": "string"}
      }
    },
    "raw_signals": {"$ref": "#/$defs/RawSignals"}
  }
}
```

### 5.3 `RawSignals.github`

```jsonc
{
  "username": "string",
  "profile_url": "string",
  "account_age_years": "number",
  "followers": "integer",
  "following": "integer",
  "public_repos": "integer",
  "total_stars_received": "integer",
  "primary_languages": [{"name": "TypeScript", "percent": 42.5}],
  "activity": {
    "commits_last_year_estimate": "integer",
    "active_months_last_12": "integer",
    "longest_streak_days": "integer"
  },
  "repo_signals": {
    "with_readme_pct": "number",
    "with_tests_pct": "number",
    "with_ci_cd_pct": "number",
    "fork_to_original_ratio": "number"
  },
  "pinned_repos": [
    {
      "name": "string",
      "stars": "integer",
      "primary_language": "string",
      "has_readme": "boolean",
      "has_tests": "boolean",
      "has_ci": "boolean",
      "last_commit_at": "string (ISO-8601)",
      "is_fork": "boolean",
      "quality_score": "integer (0-100)"
    }
  ],
  "fetch_status": {"enum": ["complete", "partial", "failed"]}
}
```

### 5.4 `RawSignals.cv`

```jsonc
{
  "filename": "string",
  "format": {"enum": ["pdf", "docx"]},
  "extracted_text_chars": "integer",
  "experience_years_total": "number",
  "roles": [
    {
      "title": "string",
      "company": "string",
      "start": "string (YYYY-MM)",
      "end": "string (YYYY-MM | null = current)",
      "duration_months": "integer"
    }
  ],
  "tech_skills": ["string"],
  "education": [
    {"degree": "string", "institution": "string", "year": "integer | null"}
  ],
  "languages": ["string"],
  "parse_status": {"enum": ["complete", "partial", "failed"]}
}
```

> **Eslatma:** Bu schema canonical. TypeScript types — schema dan generatsiya qilinadi (`json-schema-to-typescript` yoki Zod) — qo'lda yozilmaydi. Shu tariqa frontend ↔ backend bir xil shape ishlatadi.

---

## 6. Backend Implementation Plan / バックエンド実装計画 / Backend Implementation Plan

### 6.1 Tool 1 — `github_analyzer.ts`

```
Input:  { input: string }     // username yoki URL
Output: RawSignals.github

Steps:
  1. Normalise input → username (regex)
  2. fetch /users/:username                    → profile core
  3. fetch /users/:username/repos?per_page=100 → repos[]  (pagination max 3 sahifa = 300 repo)
  4. Compute aggregates:
        primary_languages   ← repos[].language histogram
        total_stars         ← sum(repos[].stargazers_count)
        repo_signals        ← README/test/CI flag har bir repo uchun (pinned va top 10 starred)
        fork_to_original    ← repos[].fork ratio
  5. Pinned repos: fetch /users/:username/pinned (GraphQL) yoki top 6 by stars (REST fallback)
  6. Quality score (har pinned uchun):
        +20 README, +20 tests, +15 CI, +15 last_commit < 6mo,
        +15 stars > 5, +15 description length > 30 chars
  7. Return { ...signals, fetch_status }

Rate limit: GitHub anonymous = 60 req/h. Server tarafida cache (10 min TTL, key = username).
```

### 6.2 Tool 2 — `cv-parser.ts`

```
Input:  { file: Uint8Array, mime: string }
Output: RawSignals.cv

Steps:
  1. mime === application/pdf       → pdfjs-dist text extraction
     mime === ...wordprocessingml   → docx (mammoth.js) text extraction
     else                           → throw UNSUPPORTED_FILE_TYPE
  2. Normalise text (whitespace, unicode NFKC)
  3. Heuristic regex extract:
        - emails, phones (sanity check)
        - date ranges (YYYY-MM, MM/YYYY, "Jan 2020 – Present")
        - section headers (Experience, Education, Skills)
  4. Claude Haiku post-process (cheap, 500 tokens):
        Input:  raw text
        Output: structured JSON (roles, education, skills) — Zod validated
  5. Compute experience_years_total from role durations
  6. Return { ...cv, parse_status }

Caveats:
  - Two-column PDFs may scramble — flag parse_status = "partial" if < 200 chars extracted
  - Non-Latin scripts (cyrillic, japanese) — pdfjs handles, validate UTF-8
```

### 6.3 Tool 3 — `candidate-scorer.ts`

> Joriy implementatsiya provider-independent rubrikani, bounded weighted overall/grade va faqat complete taqqoslanadigan GitHub dalilida conservative UZ/JA/EN inconsistency flaglarini beradi. Sonnet/Haiku structured refinement uchun exact JSON/exact-key/bounded-value validator va completed receipt'ni output parsingdan oldin hisoblaydigan fail-closed wrapper tayyor; real invocation key bilan keyingi qatlam sifatida qolgan.

```
Model:  Claude Sonnet 4 (deep) yoki Haiku (fast)
Mode:   Structured output (JSON mode)

System prompt (locale-aware, prompts.ts dan):
  "Sen texnik HR analitiksan. Sen GitHub va CV signal larini taqqoslab,
   nomzodni 6 kategoriyada 0–100 ball bilan baholaysan.
   Faqat ko'rsatilgan signallarga asoslan — taxmin qilma.
   JSON da javob qaytar (schema...)."

Scoring rubrikasi (qisqa):
  tech_depth:
    +30 GitHub primary_languages match CV skills
    +25 pinned repo quality_score average
    +20 stars per repo > 1 average
    +15 multi-language (>= 3)
    +10 modern stack (TS/Go/Rust/Python signals)

  project_quality:
    +35 % repos with README
    +30 % repos with tests
    +20 % repos with CI/CD
    +15 stars distribution (not all 0)

  activity:
    +40 active_months_last_12
    +30 commits_last_year_estimate (>= 100 = 30 ball)
    +30 account_age_years scaled (1–5y peak)

  communication_docs:
    +50 README quality (length, sections)
    +30 commit message quality (sample)
    +20 PR descriptions (if accessible)

  cv_github_consistency:
    +50 stack overlap (CV.skills ∩ GitHub.languages) / |CV.skills|
    +30 role timeline matches public activity timing
    +20 no title inflation flags

  role_fit:
    Requires job_description. If absent → null + warning.
    Sonnet semantic match → 0–100.

Inconsistency detection rules:
  stack_mismatch:    CV claims "Senior Go" but GitHub Go% < 5
  experience_gap:    CV says 5y but GitHub account age < 2y AND no "Private repos" hint
  title_inflation:   CV "Senior" but no leadership signals (PRs reviewed, contrib graph)
```

### 6.4 Tool 4 — `report-generator.ts`

> Joriy implementatsiya UZ/JA/EN evidence-linked strength/gap/summary, har non-null kategoriya va behavioral yo'nalish uchun 6–7 savol hamda deterministic recommendation beradi. Sonnet narrative refinement key bilan keyingi qatlam sifatida qolgan.

```
Model:  Claude Sonnet 4
Mode:   Structured JSON output

Input:  scores + signals + jobDescription? + locale
Output: { strengths, weaknesses, summary, interview_questions, hiring_recommendation }

Locale handling:
  uz → System prompt UZ (prompts.uz.ts)
  ja → System prompt JA (prompts.ja.ts)
  en → System prompt EN (prompts.en.ts)

Interview question rules:
  - 5–12 savol
  - Har category dan kamida 1 ta (oltita kategoriya + behavioral)
  - Har savol konkret repo/CV bandiga bog'lanadi (specific signal)
  - "expected_signal" — intervyuer nima eshitishi kerakligini tushuntiradi
  - Hech qanday yopiq (yes/no) savol yo'q

Hiring recommendation logic (deterministic post-AI):
  overall_score >= 85  → strong_hire
  70 <= score < 85     → interview
  55 <= score < 70     → borderline
  score < 55           → do_not_proceed
  high-severity inconsistency → bir bosqich pastga
```

### 6.5 Orchestrator — `index.ts`

```
async function analyzeCandidate(input): Promise<CandidateAnalysisResult> {
  const requestId = ulid();
  const t0 = Date.now();

  // 1. Validate (Zod) — schema mismatch → 400
  const parsed = AnalyzeRequestSchema.parse(input);

  // 2. Parallel signal collection (10s timeout)
  const [githubResult, cvResult] = await Promise.allSettled([
    withTimeout(githubAnalyzer.fetch(parsed.github_input), 6000),
    withTimeout(cvParser.parse(parsed.cv_file, parsed.cv_mime), 5000),
  ]);

  // 3. Hard fail if CV parse failed (no scoring possible)
  if (cvResult.status === 'rejected') throw err('CV_PARSE_FAILED', ...);

  const signals = {
    github: githubResult.status === 'fulfilled' ? githubResult.value : { fetch_status: 'failed' },
    cv: cvResult.value,
  };

  // 4. Score (12s timeout, 3 retries)
  const scores = await retryWithBackoff(
    () => candidateScorer.score(signals, parsed.job_description, parsed.locale, parsed.analysis_depth),
    { maxRetries: 3, timeoutMs: 12000 }
  );

  // 5. Generate report (14s timeout)
  const report = await withTimeout(
    reportGenerator.generate(signals, scores, parsed.job_description, parsed.locale),
    14000
  );

  // 6. Assemble + log + return
  const status = (githubResult.status === 'rejected') ? 'degraded' : 'ok';
  await logAI({ requestId, durationMs: Date.now() - t0, status, ... });
  return { request_id: requestId, status, duration_ms: Date.now() - t0, locale: parsed.locale, result: { ...scores, ...report, raw_signals: signals } };
}
```

### 6.6 Cost & latency budget (per 1 analysis)

| Bosqich | Token in | Token out | Model | Cost (USD) |
|---|---|---|---|---|
| CV parse Haiku post | ~2,000 | ~600 | Haiku 3.5 | $0.0040 |
| Candidate scorer (deep) | ~3,500 | ~800 | Sonnet 4 | $0.0225 |
| Report generator | ~3,000 | ~1,500 | Sonnet 4 | $0.0315 |
| **Total** | | | | **~$0.058** |

Tarif (SPEC.md): Tadbirkor (49,000 so'm/oy) → 20 candidate analiz/oy → $1.16 cost → 95% margin. ✅

---

## 7. MVP Scaling Strategy / MVP スケーリング戦略 / MVP Scaling Strategy

### 7.1 Asosiy printsiplar

1. **Stateless** — har so'rov mustaqil. Hech qanday user state DB da emas.
2. **Idempotent at request level** — bir xil GitHub username + CV hash → cache hit (10 min TTL).
3. **Graceful degradation** — GitHub yiqilsa CV bilan davom etamiz (`status: "degraded"`).
4. **No PII persistence** — CV faqat memory'da, parse'dan keyin darhol unsubscribe.
5. **Modular** — har tool alohida fayl, alohida test, alohida monitoring metric.

### 7.2 Performance budgets

| Metric | Target | Action point |
|---|---|---|
| p50 duration | < 18 s | OK |
| p95 duration | < 28 s | Alert |
| Error rate | < 2% | Page oncall |
| GitHub 404 rate | < 5% | UX hint "Check username" |
| CV parse fail rate | < 8% | Improve parser, surface error UI |

### 7.3 Cache strategy

- **GitHub fetch** — 10 min TTL, key = `gh:${username}`. Supabase KV yoki in-memory.
- **CV parse** — file_hash (sha256) → parsed JSON, 1 hour TTL. Privacy-safe (hash, not content).
- **Scoring** — kesh qilinmaydi (har savol unik kontekstga bog'liq).

### 7.4 Concurrency & rate limits

| Tarif | Concurrent | Per minute | Per day |
|---|---|---|---|
| Bepul | 1 | 1 | 2 |
| Tadbirkor | 2 | 5 | 20 |
| Biznes | 5 | 20 | 100 |
| Kompaniya | 10 | 60 | 500 |

Implementatsiya: service-role-only PostgreSQL RPC tenant state rowini lock qilib minute/day counterni va 45 soniyalik concurrency lease'ni atomik rezervatsiya qiladi. Pure lifecycle boundary denialda operationni boshlamaydi va accepted lease'ni success/error holatida `finally` orqali release qiladi; cleanup failure asl natijani bosmaydi, bounded DB expiry orphan lease'ni tozalaydi. Private jadvallar browser va direct service table access uchun yopiq; adapter DBdagi `free/starter/pro/company` planlarini yuqoridagi policyga map qiladi.

### 7.5 Observability

- **Sentry** — istisno + user_id (NOT cv content)
- **Custom metric** — `hr.candidate.analyze.duration_ms`, `hr.candidate.analyze.cost_usd`
- **Audit log** — kim tahlil qildi, qaysi GitHub username, qachon (CV content yo'q)

---

## 8. Error Handling / エラー処理 / Error Handling

### 8.1 Asosiy printsip

Har xato → `request_id` + 3 tilda message. Frontend xato kodiga qarab UX qaror qiladi (retry, upload qayta, upgrade tarif).

### 8.2 Tool darajasidagi handling

| Tool | Xato turi | Qayta urinish | Fallback |
|---|---|---|---|
| github_analyzer | 404 | yo'q | `INVALID_GITHUB_INPUT` |
| github_analyzer | 5xx / timeout | 2x exponential | partial signals, `status: "degraded"` |
| cv_parser | corrupt PDF | yo'q | `CV_PARSE_FAILED` |
| cv_parser | scanned PDF (image only) | yo'q | `CV_PARSE_FAILED` + hint "OCR yet supported" |
| candidate_scorer | Claude 5xx | 3x backoff | `INTERNAL` |
| candidate_scorer | invalid JSON output | 1 retry with stricter prompt | `INTERNAL` |
| report_generator | Claude 5xx | 2x backoff | scores qaytariladi, `report_status: "failed"` |

### 8.3 Frontend UX

- Xato kod → toast + ko'rsatma
- 504 timeout → "Tahlil 30 soniyadan oshdi. Iltimos, qisqaroq CV bilan urinib ko'ring yoki bizga xabar bering."
- Degraded → ko'k banner: "GitHub qisman olindi — natija to'liq emas"
- Inconsistency high → sariq banner: "Diqqat: 2 ta jiddiy mos kelmaslik aniqlandi"

---

## 9. V2 Roadmap / V2 ロードマップ / V2 Roadmap

| # | Feature | Sabab | Effort |
|---|---|---|---|
| V2.1 | **GitHub OAuth** | Private repo + contribution graph | M |
| V2.2 | **Persistence** (`candidates` jadvali) | Tarix, qayta ko'rish, ATS export | M |
| V2.3 | **Bulk import** (CSV with N usernames) | Recruiter mass-screen flow | L |
| V2.4 | **LinkedIn parser** (PDF export) | Ko'p talab, GitHub yo'qlarda | M |
| V2.5 | **OCR for scanned CVs** | "Old-school" CV format larini qoplash | L |
| V2.6 | **Calendar/ATS integration** (Google Calendar, Greenhouse) | Intervyu ni darhol bron qilish | L |
| V2.7 | **Async job queue** (job_id polling) | 30s+ chuqur tahlil | M |
| V2.8 | **Custom rubric** (per tenant) | Kompaniya tariflari uchun | M |
| V2.9 | **Pre-screening Telegram bot** | HR Telegram orqali yuboradi | S |
| V2.10 | **Bias audit dashboard** | Statistik bias detection (ism/jins) | XL |
| V2.11 | **Video CV / async interview** | Texnik intervyuni soddalashtirish | XL |
| V2.12 | **Comparative ranking** (5+ candidate side-by-side) | Final round qarori | M |

Effort: S (1–3 kun), M (1 hafta), L (2 hafta), XL (1 oy+).

---

## 10. Glossariy / 用語集 / Glossary

| UZ | JP | EN | Tushuncha |
|---|---|---|---|
| Nomzod | 候補者 | Candidate | CV yuborgan shaxs |
| Skor | スコア | Score | 0–100 raqam |
| Mos kelmaslik | 不一致 | Inconsistency | CV vs GitHub farqi |
| Yollash tavsiyasi | 採用推奨 | Hiring recommendation | strong_hire / interview / borderline / do_not_proceed |
| Stack mosligi | スタック整合性 | Stack consistency | CV skill ↔ GitHub language overlap |
| Faollik | 活動レベル | Activity | commitlar va active months |

---

## 11. Test Strategy

### 11.1 Unit tests

- `github-analyzer.test.ts` — fixture: octocat, torvalds, junior account, deleted user
- `cv-parser.test.ts` — fixture: 5 ta PDF (sof, two-column, scanned-fail, cyrillic, japanese), 3 ta DOCX
- `candidate-scorer.test.ts` — Claude mock, deterministic scoring inputs

### 11.2 Integration tests

- Full flow: real GitHub (octocat) + sample CV → assert `status === 'ok'`, `overall_score` integer in [0, 100]
- Timeout: simulate 7s GitHub delay → assert `status === 'degraded'`
- Bad CV: corrupt PDF → assert 400 `CV_PARSE_FAILED`

### 11.3 Acceptance tests (manual)

10 ta real nomzod → HR baholaydi → AI baho korrelyatsiyasi > 0.7

---

## 12. Implementation Checklist (keyingi sessiya uchun)

### Backend agent
- [x] `services/hr-candidate/` modular papkasi
- [x] GitHub fetch + cache wiring
- [x] Bounded local CV parser — pdfjs + mammoth
- [x] Request/role/tariff policy + orchestrator failure/schema tests
- [ ] Sonnet structured output integration (LLM Router orqali)
- [~] Runtime validator + JSON Schema sync tayyor; LLM output validation qolgan
- [ ] Route mount: `app.route('/v1/hr/candidates', hrCandidateRoutes)`
- [ ] Unit + integration tests

### Frontend agent
- [ ] `features/hr/candidates/` skeleton wiring
- [ ] Upload form + drag-drop + 5MB validation
- [ ] React Query mutation + locale switcher
- [ ] Score gauge component (Radix UI Progress)
- [ ] i18n (uz.json / ja.json / en.json)
- [ ] Route + role guard `/hr/candidates`

### Database agent
- [ ] **Hech narsa qilmaydi** (MVP — no persistence)
- [ ] V2.2 da: `candidates` migration tayyorlash

### Infrastructure agent
- [ ] Anthropic API key Supabase secret ga qo'shish
- [ ] (V2 da) GitHub OAuth client_id/secret
- [ ] Sentry tag: `module: hr_candidate`
- [ ] Rate limit middleware konfiguratsiyasi

---

## 13. Open Questions / 未解決事項 / Open Questions

1. **GitHub API quota** — anonymous 60/hour. MVP da OAuth sizga kerak emasmi?  Sher ning qarori kerak.
2. **Japanese CV format** — 履歴書 (rirekisho) PDF — alohida parser kerak bo'lishi mumkin (table-heavy). Alohida ticket?
3. **Bias guardrails** — ism/yosh/jins ma'lumotlari scoring ga ta'sir qilmasligi kerak. Prompt da explicit guard bormi?
4. **Storage** — CV faylni keyinchalik (V2.2) qayerda saqlaymiz? Supabase Storage bilan encryption-at-rest?
5. **Rate limit** — bepul tarifda 2/kun yoki 0/kun? (HR feature — pulli only?)

---

*HR_CANDIDATE_ANALYSIS.md v1.0 — Design only, no code yet*
*Keyingi qadam: Sher tasdiq beradi → 4 ta agent (frontend/backend/db/infra) bilan implementatsiya sessiyasi*
