# HR_CANDIDATE_ANALYSIS.md

> **AI Business Concierge — `hr_candidate_analysis` modul dizayn paketi**
> Version: 1.0 (MVP design) · Sana: 2026-04-29
> Owner: Sher · Modul joylashuvi: `features/hr/candidates/` (sub-module)

---

## 0. Hujjat haqida

Bu hujjat `hr_candidate_analysis` modulining **MVP dizayn spetsifikatsiyasi**. Ichida arxitektura, API contract, JSON schema, backend implementatsiya rejasi va v2 yo'nalishi bor. Kod yozmasdan, faqat dizayn — implementatsiya keyingi sessiyada 4 ta agent (frontend/backend/database/infrastructure) tomonidan amalga oshiriladi.

---

## 1. Modul maqsadi

HR menejer GitHub username + CV (PDF/DOCX) + (ixtiyoriy) lavozim ta'rifi yuboradi → AI nomzodni 6 ta o'lchovda baholaydi va strukturali hisobot, intervyu savollari va yollash tavsiyasini qaytaradi. Ma'lumotlar **session-only** (DB ga saqlanmaydi).

**MVP dan tashqarida:**
- GitHub OAuth / private repo kirish
- LinkedIn scraping
- ATS / calendar integratsiya
- Persistent candidate database
- Bulk batch processing (>1 nomzod/so'rov)
- Video / audio interview tahlil

---

## 2. Arxitektura

### 2.1 High-level oqim

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

### 2.2 Komponentlar

| Komponent | Mas'uliyat | Texnologiya |
|---|---|---|
| **github_analyzer** | Public profile → repo statistikasi, stack, faollik | `fetch` → GitHub REST v3 |
| **cv_parser** | PDF/DOCX → tuzilgan matn → tajriba yillari, rollar, stack | `pdfjs-dist`, `docx`, Claude Haiku |
| **candidate_scorer** | GitHub + CV → 6 kategoriya bo'yicha 0–100 ball | Claude Sonnet 4 (structured output) |
| **report_generator** | Skorlar → narrativ summary + intervyu savollari + tavsiya | Claude Sonnet 4, locale-aware |
| **orchestrator** | Tool larni parallel/sequential ishlatish, timeout | Promise.all + AbortController |

### 2.3 Ma'lumot oqimi

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
| GitHub fetch | < 4 s | 6 s | `github_status: "partial"` |
| CV parse | < 3 s | 5 s | Xato qaytaramiz |
| Scoring (Sonnet) | < 8 s | 12 s | 3-marta retry, `degraded: true` |
| Report (Sonnet) | < 10 s | 14 s | `report_status: "failed"` |
| **Total** | **< 25 s** | **30 s** | 504 + `request_id` |

---

## 3. Folder structure

### 3.1 Backend

```
supabase/functions/server/
├── index.ts
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
        │   └── candidate-analysis.schema.json
        └── __tests__/
            ├── github-analyzer.test.ts
            ├── cv-parser.test.ts
            └── candidate-scorer.test.ts
```

### 3.2 Frontend

```
frontend/src/features/hr/
└── candidates/                           # YANGI sub-modul
    ├── api/
    │   └── candidatesApi.ts
    ├── components/
    │   ├── CandidateUploadForm.tsx
    │   ├── CandidateScoreCard.tsx
    │   ├── CandidateSummaryCard.tsx
    │   ├── InconsistencyAlert.tsx
    │   ├── InterviewQuestionsList.tsx
    │   └── GithubProfileBlock.tsx
    ├── hooks/
    │   ├── useCandidateAnalysis.ts
    │   └── useCandidateLocale.ts
    ├── pages/
    │   └── CandidateAnalysisPage.tsx
    ├── types.ts
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

### 4.2 Request body (multipart)

| Field | Type | Required | Constraints |
|---|---|---|---|
| `github_input` | string | yes | username yoki URL |
| `cv_file` | file | yes | PDF or DOCX, ≤ 5 MB |
| `job_description` | string | no | ≤ 5,000 chars |
| `locale` | string | no | `uz` \| `ja` \| `en`, default `uz` |
| `analysis_depth` | string | no | `fast` (Haiku) \| `deep` (Sonnet), default `deep` |

### 4.3 Success response — `200 OK`

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
      {
        "category": "tech_depth",
        "question": "Repository X da concurrency muammoni qanday yechgansiz?",
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

### 4.4 Error responses

| Status | Code | Sabab |
|---|---|---|
| 400 | `INVALID_GITHUB_INPUT` | username/URL yaroqsiz |
| 400 | `CV_PARSE_FAILED` | PDF/DOCX o'qib bo'lmadi |
| 400 | `CV_TOO_LARGE` | > 5 MB |
| 400 | `UNSUPPORTED_FILE_TYPE` | PDF/DOCX dan boshqa |
| 401 | `UNAUTHENTICATED` | JWT yaroqsiz |
| 403 | `FORBIDDEN_ROLE` | Rol HR/Manager/Admin emas |
| 404 | `GITHUB_USER_NOT_FOUND` | GitHub'da user yo'q |
| 429 | `RATE_LIMITED` | Tarif limiti yetdi |
| 504 | `TIMEOUT` | 30 s overall timeout |

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
  "strengths": ["string", ...],         // max 8
  "weaknesses": ["string", ...],        // max 8
  "inconsistency_flags": [
    {
      "type": "stack_mismatch" | "experience_gap" | "title_inflation" | "education_unverified" | "other",
      "severity": "low" | "medium" | "high",
      "explanation": "string"
    }
  ],
  "summary": "string",                  // max 1500 chars
  "interview_questions": [              // 5-12 ta
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
Input:  { input: string }     // username yoki URL
Output: RawSignals.github

Steps:
  1. Normalise input → username (regex)
  2. fetch /users/:username → profile core
  3. fetch /users/:username/repos?per_page=100 → repos[]
  4. Compute aggregates: primary_languages, total_stars, repo_signals
  5. Pinned repos: GraphQL yoki top 6 by stars (REST fallback)
  6. Quality score (har pinned uchun):
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
  1. mime === application/pdf       → pdfjs-dist text extraction
     mime === ...wordprocessingml   → mammoth.js text extraction
     else                           → throw UNSUPPORTED_FILE_TYPE
  2. Normalise text (whitespace, unicode NFKC)
  3. Heuristic regex extract: date ranges, section headers
  4. Claude Haiku post-process (500 tokens):
        Input:  raw text
        Output: structured JSON (roles, education, skills) — Zod validated
  5. Compute experience_years_total from role durations
  6. Return { ...cv, parse_status }
```

### 6.3 Tool 3 — `candidate-scorer.ts`

```
Model:  Claude Sonnet 4 (deep) yoki Haiku (fast)

Scoring rubrikasi:
  tech_depth:
    +30 GitHub primary_languages match CV skills
    +25 pinned repo quality_score average
    +20 stars per repo > 1
    +15 multi-language (>= 3)
    +10 modern stack (TS/Go/Rust/Python)

  project_quality:
    +35 % repos with README
    +30 % repos with tests
    +20 % repos with CI/CD
    +15 stars distribution

  activity:
    +40 active_months_last_12
    +30 commits_last_year_estimate (>= 100 = 30 ball)
    +30 account_age_years scaled

  communication_docs:
    +50 README quality
    +30 commit message quality
    +20 PR descriptions

  cv_github_consistency:
    +50 stack overlap
    +30 role timeline matches activity
    +20 no title inflation

  role_fit:
    Requires job_description. Sonnet semantic match → 0–100.

Inconsistency detection:
  stack_mismatch:    CV claims "Senior Go" but GitHub Go% < 5
  experience_gap:    CV says 5y but GitHub age < 2y
  title_inflation:   CV "Senior" but no leadership signals
```

### 6.4 Tool 4 — `report-generator.ts`

```
Model:  Claude Sonnet 4

Locale handling:
  uz → System prompt UZ
  ja → System prompt JA
  en → System prompt EN

Interview question rules:
  - 5–12 savol
  - Har category dan kamida 1 ta
  - Har savol konkret repo/CV bandiga bog'lanadi
  - Hech qanday yopiq (yes/no) savol yo'q

Hiring recommendation logic:
  overall_score >= 85  → strong_hire
  70 <= score < 85     → interview
  55 <= score < 70     → borderline
  score < 55           → do_not_proceed
  high-severity inconsistency → bir bosqich pastga
```

### 6.5 Cost va latency budget (1 tahlil uchun)

| Bosqich | Token in | Token out | Model | Cost (USD) |
|---|---|---|---|---|
| CV parse Haiku | ~2,000 | ~600 | Haiku 3.5 | $0.0040 |
| Candidate scorer | ~3,500 | ~800 | Sonnet 4 | $0.0225 |
| Report generator | ~3,000 | ~1,500 | Sonnet 4 | $0.0315 |
| **Total** | | | | **~$0.058** |

---

## 7. MVP Scaling Strategy

### 7.1 Asosiy printsiplar

1. **Stateless** — har so'rov mustaqil
2. **Idempotent** — bir xil GitHub + CV hash → cache hit (10 min TTL)
3. **Graceful degradation** — GitHub yiqilsa CV bilan davom etamiz
4. **No PII persistence** — CV faqat memory'da
5. **Modular** — har tool alohida fayl, test, monitoring

### 7.2 Performance budgets

| Metric | Target | Action point |
|---|---|---|
| p50 duration | < 18 s | OK |
| p95 duration | < 28 s | Alert |
| Error rate | < 2% | Page oncall |
| GitHub 404 rate | < 5% | UX hint |
| CV parse fail rate | < 8% | Improve parser |

### 7.3 Concurrency va rate limits

| Tarif | Concurrent | Per minute | Per day |
|---|---|---|---|
| Bepul | 1 | 1 | 2 |
| Tadbirkor | 2 | 5 | 20 |
| Biznes | 5 | 20 | 100 |
| Kompaniya | 10 | 60 | 500 |

---

## 8. Error Handling

### 8.1 Tool darajasidagi handling

| Tool | Xato turi | Fallback |
|---|---|---|
| github_analyzer | 404 | `INVALID_GITHUB_INPUT` |
| github_analyzer | 5xx / timeout | partial signals, `degraded` |
| cv_parser | corrupt PDF | `CV_PARSE_FAILED` |
| cv_parser | scanned PDF | `CV_PARSE_FAILED` + hint |
| candidate_scorer | Claude 5xx | 3x backoff, `INTERNAL` |
| report_generator | Claude 5xx | scores qaytariladi |

### 8.2 Frontend UX

- 504 timeout → "Tahlil 30 soniyadan oshdi. Qisqaroq CV bilan urinib ko'ring."
- Degraded → ko'k banner: "GitHub qisman olindi — natija to'liq emas"
- Inconsistency high → sariq banner: "Diqqat: jiddiy mos kelmasliklar aniqlandi"

---

## 9. V2 Roadmap

| # | Feature | Effort |
|---|---|---|
| V2.1 | **GitHub OAuth** — Private repo + contribution graph | M |
| V2.2 | **Persistence** (`candidates` jadvali) | M |
| V2.3 | **Bulk import** (CSV with N usernames) | L |
| V2.4 | **LinkedIn parser** (PDF export) | M |
| V2.5 | **OCR for scanned CVs** | L |
| V2.6 | **Calendar/ATS integration** | L |
| V2.7 | **Async job queue** (job_id polling) | M |
| V2.8 | **Custom rubric** (per tenant) | M |
| V2.9 | **Pre-screening Telegram bot** | S |
| V2.10 | **Bias audit dashboard** | XL |
| V2.11 | **Video CV / async interview** | XL |
| V2.12 | **Comparative ranking** (5+ candidate) | M |

Effort: S (1-3 kun), M (1 hafta), L (2 hafta), XL (1 oy+).

---

## 10. Glossariy

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

- Full flow: real GitHub (octocat) + sample CV → `status === 'ok'`, `overall_score` integer in [0, 100]
- Timeout: 7s GitHub delay → `status === 'degraded'`
- Bad CV: corrupt PDF → 400 `CV_PARSE_FAILED`

### 11.3 Acceptance tests (qo'lda)

10 ta real nomzod → HR baholaydi → AI baho korrelyatsiyasi > 0.7

---

## 12. Implementation Checklist (keyingi sessiya)

### Backend agent
- [ ] `services/hr-candidate/` yaratish
- [ ] GitHub fetch + cache wiring
- [ ] CV parser — pdfjs + mammoth
- [ ] Sonnet structured output (LLM Router orqali)
- [ ] Zod schemas + JSON Schema sync
- [ ] Unit + integration tests

### Frontend agent
- [ ] `features/hr/candidates/` skeleton
- [ ] Upload form + drag-drop + 5MB validation
- [ ] React Query mutation + locale switcher
- [ ] Score gauge component (Radix UI Progress)
- [ ] i18n (uz.json / ja.json / en.json)

### Database agent
- [ ] **Hech narsa qilmaydi** (MVP — no persistence)
- [ ] V2.2 da: `candidates` migration

### Infrastructure agent
- [ ] Anthropic API key Supabase secret ga
- [ ] Sentry tag: `module: hr_candidate`
- [ ] Rate limit middleware

---

## 13. Open Questions

1. **GitHub API quota** — anonymous 60/hour. OAuth kerakmi?
2. **Japanese CV format** — 履歴書 (rirekisho) PDF — alohida parser kerak?
3. **Bias guardrails** — ism/yosh/jins scoring ga ta'sir qilmasligi kerak?
4. **Storage** — CV V2.2 da qayerda saqlanadi? Supabase Storage?
5. **Rate limit** — bepul tarifda 2/kun yoki 0/kun?

---

*HR_CANDIDATE_ANALYSIS.md v1.0 — Design only, no code yet*
*Keyingi qadam: Sher tasdiq beradi → 4 ta agent (frontend/backend/db/infra) implementatsiya*
