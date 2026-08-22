# HR Candidate Analysis — Frontend module

> Sub-module under `features/hr/candidates/`
> Status: PARTIAL (production-ready upload/state/result boundary is wired; backend provider flow intentionally remains `501 NOT_IMPLEMENTED`)
> Design doc: [/docs/HR_CANDIDATE_ANALYSIS.md](../../../../../docs/HR_CANDIDATE_ANALYSIS.md)

The protected `/hr/candidates` route, role-aware sidebar entry, and four-locale
copy are registered in the application shell. The shared `app/i18n.ts` tree is
the runtime source of truth; the feature JSON files are reference copies only.

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
│   └── useCandidateAnalysis.ts     Abortable plain React request state
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

which currently returns `501 NOT_IMPLEMENTED`. The backend service boundary is at
`supabase/functions/server/services/hr-candidate/`. Implementation gates:

- [x] `github-analyzer.ts` — bounded public REST fetch + aggregate + process cache
- [~] `cv-parser.ts`        — bounded pdfjs / mammoth extraction complete; Haiku structuring blocked on provider key
- [x] `quota.ts`            — DB plan mapping + service-role-only PostgreSQL minute/day/concurrency lease
- [x] `http-adapter.ts`     — duplicate-safe multipart parsing + 5 MiB CV / 64 KiB overhead stream bound
- [ ] `candidate-scorer.ts` — Sonnet structured output
- [ ] `report-generator.ts` — Sonnet narrative + interview questions
- [~] `index.ts`            — validation/parallel/timeout/failed-CV gates complete; LLM retry and usage logging remain

The frontend validates bounded PDF/DOCX input, normalizes fields, sends an
authenticated tenant-scoped multipart request, rejects malformed success
payloads, cancels stale requests, and renders typed pending/error/result states.
Once provider wiring and usage logging land, flip the route handler from the
501 stub to `analyzeCandidate(req)` and run authenticated full-flow acceptance.
