# HR Candidate Analysis — Frontend module

> Sub-module under `features/hr/candidates/`
> Status: PARTIAL (API contract tests plus backend GitHub/CV/request/quota/multipart/orchestrator boundaries are real; UI wiring and provider flow remain)
> Design doc: [/docs/HR_CANDIDATE_ANALYSIS.md](../../../../../docs/HR_CANDIDATE_ANALYSIS.md)

## Wiring instructions (App.tsx / navigation)

To make this module reachable, do these 3 small edits:

### 1. Add the route

In whichever file owns the in-app routes (currently inside `App.tsx` per
`ProtectedLayout` → `<App />`), add:

```tsx
import { CandidateAnalysisPage } from "./features/hr/candidates/pages/CandidateAnalysisPage";

// Inside your <Routes /> or switch:
<Route path="/hr/candidates" element={<CandidateAnalysisPage />} />
```

### 2. Add the sidebar / nav entry

```tsx
{
  path: "/hr/candidates",
  label: t("nav.hr_candidates"),    // "Nomzod tahlili" / "候補者分析" / "Candidate analysis"
  icon: UserSearch,                 // lucide-react
  requiredRoles: ["HR", "MANAGER", "TENANT_ADMIN", "SUPER_ADMIN"],
}
```

### 3. Register i18n bundle

If the project uses a single shared `i18n.ts` instead of per-feature
imports, merge the three locale files:

```ts
import hrCandidatesUz from "./features/hr/candidates/i18n/uz.json";
import hrCandidatesJa from "./features/hr/candidates/i18n/ja.json";
import hrCandidatesEn from "./features/hr/candidates/i18n/en.json";

// Add under each locale tree at "hr.candidates"
```

## Files in this module

```
candidates/
├── api/
│   └── candidatesApi.ts            POST /v1/hr/candidates/analyze
├── components/
│   ├── CandidateUploadForm.tsx     GitHub + CV + JD form
│   ├── CandidateScoreCard.tsx      Overall + 6 category bars
│   ├── CandidateSummaryCard.tsx    Strengths / weaknesses / recommendation
│   ├── InterviewQuestionsList.tsx  5–12 evidence-linked questions
│   ├── InconsistencyAlert.tsx      CV ↔ GitHub mismatch flags
│   └── GithubProfileBlock.tsx      Raw GitHub stats
├── hooks/
│   └── useCandidateAnalysis.ts     React Query mutation
├── pages/
│   └── CandidateAnalysisPage.tsx   /hr/candidates page
├── i18n/
│   ├── uz.json
│   ├── ja.json
│   └── en.json
└── types.ts                        Mirrors backend candidate-analysis schema
```

## Backend dependency

This module is wired to:

```
POST /v1/hr/candidates/analyze
```

which currently returns `501 NOT_IMPLEMENTED`. The backend skeleton is at
`supabase/functions/server/services/hr-candidate/`. Implementation gates:

- [x] `github-analyzer.ts` — bounded public REST fetch + aggregate + process cache
- [~] `cv-parser.ts`        — bounded pdfjs / mammoth extraction complete; Haiku structuring blocked on provider key
- [x] `quota.ts`            — DB plan mapping + service-role-only PostgreSQL minute/day/concurrency lease
- [x] `http-adapter.ts`     — duplicate-safe multipart parsing + 5 MiB CV / 64 KiB overhead stream bound
- [ ] `candidate-scorer.ts` — Sonnet structured output
- [ ] `report-generator.ts` — Sonnet narrative + interview questions
- [~] `index.ts`            — validation/parallel/timeout/failed-CV gates complete; LLM retry and usage logging remain

Once those land, flip the route handler in `index.ts` from the 501 stub to
call `analyzeCandidate(req)`.
