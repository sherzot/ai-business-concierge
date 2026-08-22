# Development Log — AI Business Concierge

Project development history, completed work, encountered errors, and their solutions.

> **Translations (kept in sync):** [Uzbek (primary)](../DEVLOG.md) · [Russian](../Russian/DEVLOG.md) · [日本語](../日本語/DEVLOG.md)

## 2026-08-22 — Telegram webhook rollout made secret-safe and transactional

- Production `telegram-bot` v15 was fail-closed at `503`: the remote project has the `TELEGRAM_BOT_TOKEN` name, but local secure token access and `TELEGRAM_WEBHOOK_SECRET` are absent. The new operations helper validates the exact Supabase project/HTTPS endpoint, refuses accidental rotation of an existing secret, creates a 96-character random secret, and sets it through a `0600` temporary env file without putting it in process arguments or logs.
- Supabase secret setup and Telegram `setWebhook` now run as one flow: a pre-commit Telegram failure unsets the new secret and restores fail-closed state; after success, `getWebhookInfo` exact URL, health `200`, and unauthenticated POST `401` are verified. Token/secret values are redacted from all errors. The contract was checked against the official Telegram `secret_token` charset/length rules.
- New contract 6/6, Telegram with guard 10/10, and targeted Deno with HR 111/111 passed; format/check/lint are green. Final `67381df` is on main; GitHub CI `32555376998` passed in 53s with Deno 111/111, frontend 28/28 files and 127/127 tests, deploy-env 14/14, audit 0 high/critical, a 3,701-module build, and 10-file security. Netlify was skipped; no secret was read or set, runtime is unchanged, and production POST remains `503`.

Remaining: provide `TELEGRAM_BOT_TOKEN` securely from BotFather/password manager to the local session, run the helper once, then smoke `/start`, locale, AI, rate limit, and feedback. Staging `ANTHROPIC_API_KEY` blockers remain separate.

Files: `.github/workflows/ci.yml`, `scripts/telegram-webhook-rollout{,.test}.ts`, and four-language `DEVLOG/STATUS/PLAN/CONNECTIONS/REQUIREMENTS`.

## 2026-08-22 — HR provider failures closed with typed `AI_UNAVAILABLE`

- Provider contract/accounting/config failures now normalize to a localized `AI_UNAVAILABLE` envelope without raw details; the application maps it to HTTP `503` while preserving quota cleanup. Backend type/schema and frontend UZ/RU/EN/JA copy share one contract.
- Orchestrator 9/9, application 9/9, HR backend 101/101, and Deno with Telegram 105/105 passed; frontend typecheck is green. `f184434` is on main; GitHub CI `32554684769` passed in 1m08s with all backend/frontend/build/security gates. Runtime, live provider, and `501` are unchanged.

Remaining: authenticated staging live smoke after the key arrives, then explicit route activation/full flow and `501` removal.

## 2026-08-22 — HR global 30-second analysis deadline hardened

- Application execution now has a maximum 30,000 ms global response deadline. If quota/analyzer execution exceeds it, the public result is typed `TIMEOUT` with HTTP `504`; configurable test timeouts are fail-safe clamped to 1–30,000 ms. The backend therefore returns a deterministic envelope before the frontend's 40-second transport timeout.
- The deadline does not abandon an already-started provider promise: completed work continues through accounting and quota `finally-release` in the background. A fast `504` therefore creates neither untracked AI cost nor early lease release; individual stage timeouts and the DB 45-second expiry remain cleanup backstops.
- Application 8/8, HR backend 99/99, and targeted Deno with Telegram 103/103 passed; format/check/lint are green. `11ab6af` was pushed to `main`; GitHub CI `32554430334` passed in 1m15s with Deno 103/103, backend quality, frontend 28/28 files and 127/127 tests, deploy-env 14/14, audit 0 high/critical, a 3,701-module build, and 10-file security. Netlify was skipped; staging/production runtime, live provider, and `501` were unchanged.

Remaining: map provider/config/accounting failures from generic `INTERNAL` to typed `AI_UNAVAILABLE`/`503` and synchronize frontend locale copy; perform staging live smoke after the key arrives; then activate the route.

Files: `supabase/functions/server/services/hr-candidate/application{,.test}.ts` and synchronized four-language project documentation.

## 2026-08-22 — Key-independent HR application execution boundary completed

- New `application.ts` combines canonical tenant/user/role context, pre-provider request validation, request-scoped provider composition, persistent quota reserve/execute/finally-release, and the analyzer behind one application boundary. One ULID is shared by the public result, provider cache, and atomic usage accounting; role/input denial precedes composition/quota, and missing provider configuration fails closed without consuming quota.
- Application output separates HTTP status from typed `CandidateAnalysisResult`: role `403`, invalid input `400`, minute/day/concurrency denial `429`, quota infrastructure `503`, GitHub `502`, and timeout `504`; raw DB/provider details never enter the public envelope. Existing quota cleanup remains guaranteed after an accepted execution whether the analyzer succeeds or returns an error. The canonical HTTP route is intentionally not wired and remains `501`.
- Application 7/7, HR backend 98/98, and targeted Deno with Telegram 102/102 passed; format/check/lint are green. `eac2a3d` was pushed to `main`; GitHub CI `32554187835` passed in 1m14s with Deno 102/102, backend quality, frontend 28/28 files and 127/127 tests, deploy-env 14/14, audit 0 high/critical, a 3,701-module build, and 10-file security. Netlify was skipped; staging/production DB/Edge and the live provider were unchanged.

Remaining: enforce the documented 30-second global analysis deadline over sequential provider-stage budgets; perform staging live smoke after the key arrives; then explicitly activate the route/full flow and remove `501`.

Files: `.github/workflows/ci.yml`, `supabase/functions/server/services/hr-candidate/application{,.test}.ts`, and synchronized four-language project documentation.

## 2026-08-22 — HR server provider composition and accounting binding completed

- New `provider-composition.ts` binds a server-only key, service-role client, and canonical tenant/user/request context to injectable provider stages. Cache scope is isolated by tenant+request+stage; completed-response metadata is passed to the existing atomic `record_hr_candidate_ai_usage` RPC closure before strict output parsing. CV text and the API key never enter accounting arguments.
- Tenant/user UUIDs, request ULID, and the service client's `rpc` capability are checked fail-closed before any provider request; a missing key returns the same safe `PROVIDER_CONFIGURATION_UNAVAILABLE` error. `HrUsageContext` validation is shared with the accounting adapter, so malformed tenant IDs no longer reach the DB. Untracked provider output is rejected when accounting is unavailable.
- Composition 3/3, HR backend 91/91, and targeted Deno with Telegram 95/95 passed; format/check/lint are green. `2e4db5c` was pushed to `main`; GitHub CI `32553827974` passed in 1m06s with Deno 95/95, backend quality, frontend 28/28 files and 127/127 tests, deploy-env 14/14, audit 0 high/critical, a 3,701-module build, and 10-file security. Netlify was skipped; staging/production DB/Edge, live provider, and `501` were unchanged.

Remaining: combine quota lifecycle, provider composition, and the analyzer behind one key-independent application execution boundary; perform a staging live smoke after the key arrives; then activate the canonical route/full flow and remove `501`.

Files: `.github/workflows/ci.yml`, `supabase/functions/server/services/hr-candidate/{provider-composition{,.test},provider-stages,usage-accounting{,.test}}.ts`, and synchronized four-language project documentation.

## 2026-08-22 — HR raw-CV in-memory provider orchestration seam completed

- `cv-parser.ts` now exposes explicit `parseCvForAnalysis()` beside backward-compatible `parseCv()`. Public `CvSignals` are separated from `semanticText`, which is bounded to 16,000 characters, NFKC-normalized, and stripped of injection tokens. Text is never included in signals/results, logged, or persisted, and failed/scanned CVs omit the private field entirely.
- When injectable provider stages are supplied, the orchestrator runs semantic CV -> local evidence merge -> deterministic baseline scoring -> provider refinement/finalization -> deterministic baseline report -> provider narrative/finalization. Semantic text exists only as the `structureCv` argument; the final JSON envelope contains only merged bounded signals. The default path without stages preserves deterministic behavior, and a broken semantic-input invariant fails closed before any provider call.
- Parser 10/10, orchestrator 8/8, HR backend 88/88, and targeted Deno with Telegram 92/92 passed; the four changed files passed format/check/lint. `116c833` was pushed to `main`; GitHub CI `32553502762` passed in 1m15s with Deno 92/92, backend quality, frontend 28/28 files and 127/127 tests, deploy-env 14/14, audit 0 high/critical, a 3,701-module build, and 10-file security. Netlify was skipped; staging/production DB/Edge, live provider, and `501` were unchanged.

Remaining: a server composition-root factory that binds the server-only key, tenant/request cache scope, and atomic accounting closure to provider stages; a real staging smoke after the key arrives; then active-route/full-flow wiring through quota lifecycle and removal of `501`.

Files: `supabase/functions/server/services/hr-candidate/{cv-parser,index}{,.test}.ts` and synchronized four-language `DEVLOG/STATUS/PLAN/REQUIREMENTS/ARCHITECTURE/HR_CANDIDATE_ANALYSIS` documentation.

## 2026-08-22 — Mocked HR provider-stage pipeline completed end to end

- New `provider-stages.ts` composes CV semantics, scoring refinement, and report narrative as prompt -> LLM Router -> metadata-only accounting -> strict validation behind one injectable boundary. The module reads neither secrets nor a DB client; the composition root supplies the server-only key, tenant cache scope, and accounting closure. The default router is dynamically loaded only for a real invocation.
- Model and budget policy is fixed: CV uses `simple/Haiku`, scoring uses `fast=simple/Haiku` or `deep=analysis/Sonnet`, and report uses `document/Sonnet`, with 1,200/1,800/2,400 max output tokens and 10/12/14-second timeouts. Cache scopes are isolated by tenant and stage; a missing key or scope fails safely before reaching the provider.
- Merge policy preserves local evidence: canonical local skills/languages precede provider variants, while semantic roles/education complete the parse. Overall/grade are deterministically recomputed from refined categories, conservative local flags remain, and the hiring recommendation stays deterministic rather than provider-controlled.
- Provider stages passed 8/8, HR backend 84/84, and targeted Deno with Telegram 88/88. `deadcdc` was pushed to `main`; GitHub CI `32553032864` passed in 1m18s with Deno 88/88, backend quality, frontend 28/28 files and 127/127 tests, deploy-env 14/14, audit 0 high/critical, a 3,701-module build, and 10-file security. Netlify was skipped; live provider, staging/production DB/Edge, and `501` were unchanged.

Remaining: pass sanitized raw CV semantic input through an in-memory orchestrator seam, wire the provider stages at the server composition root with key/accounting closures, and perform a real staging smoke. The route remains `501` without the key.

Files: `.github/workflows/ci.yml`, `supabase/functions/server/services/hr-candidate/provider-stages{,.test}.ts`, and synchronized four-language `DEVLOG/STATUS/PLAN/REQUIREMENTS/ARCHITECTURE/HR_CANDIDATE_ANALYSIS` documentation.

## 2026-08-22 — HR provider prompts hardened against injection and bias

- The three prompt skeleton/TODOs are now production contracts. CV semantic, scoring, and report system prompts specify exact JSON/key/enum/string/array/date/category bounds aligned with runtime validators, forbid guessing missing/private work, and exclude protected traits from scoring/reporting.
- User-controlled CV/JD/signal values are not interpolated into system instructions. After NFKC/bounds, they enter escaped JSON data blocks; CV is capped at 16k chars, JD at 5k, and serialized provider data at 96 KiB. Embedded delimiters/instructions remain data.
- Scoring/report evidence is minimized: username, profile URL, CV filename, company/institution names, repo URL/description, and follower/following are excluded while technical repo/role/date/skill/status evidence remains. JD and role-fit presence are explicit flags.
- Prompt contract 6/6, HR backend 76/76, and targeted Deno with Telegram 80/80 passed. `d07577f` was pushed to `main`; GitHub CI `32552683005` passed in 1m11s with Deno 80/80, backend quality, frontend 28/28 files and 127/127 tests, deploy-env 14/14, audit 0 high/critical, a 3,701-module build, and 10-file security. Netlify was skipped; live provider, staging/production DB/Edge, and `501` were unchanged.

Remaining: after the key arrives, connect real Haiku/Sonnet calls to the prepared prompt -> account-before-validation -> strict-output pipeline, then enable the canonical route after authenticated staging full flow succeeds.

Files: `.github/workflows/ci.yml`, `supabase/functions/server/services/hr-candidate/prompts{,.test}.ts`, and synchronized four-language project documentation.

## 2026-08-22 — HR quota-lease lifecycle completed without the provider key

- The persistent quota reserve/release adapters are now joined by one `executeWithHrCandidateQuota` lifecycle boundary. A denial starts neither analysis nor release; after an accepted lease, success, provider rejection, and timeout-shaped failures all call release exactly once in `finally`.
- Cleanup returning `false` or throwing cannot replace the original analysis success/error; the PostgreSQL 45-second bounded expiry remains the orphan-lease backstop. Minute/day counters stay consumed for an accepted request, while only the concurrency lease is released. The route remains disabled and production stays `501`.
- Five new lifecycle regressions passed, quota is 12/12, HR backend 70/70, and targeted Deno with Telegram 74/74. `8b11515` was pushed to `main`; GitHub CI `32552288887` passed in 58s with Deno 74/74, backend quality, frontend 28/28 files and 127/127 tests, deploy-env 14/14, audit 0 high/critical, a 3,701-module build, and 10-file security. Netlify was intentionally skipped; staging/production DB and Edge were unchanged.

Remaining: connect real semantic/scoring/report LLM calls to the prepared strict-output/accounting contract after the key arrives; once authenticated staging full flow is green, wire this lifecycle boundary into the canonical HTTP route and remove `501`.

Files: `supabase/functions/server/services/hr-candidate/quota{,.test}.ts` and synchronized four-language project documentation.

## 2026-08-22 — HR provider-output contract and report schema edge case hardened

- A key-independent safety boundary now surrounds future live provider calls. `provider-contract.ts` accepts CV semantic, scoring-refinement, and report-narrative responses only as exact JSON or an exact `json` fence, then fail-closed validates exact keys, bounded Unicode strings/arrays/numbers/dates, role-fit policy, and interview-category coverage. Raw model output and private CV values are never placed in public errors or logs.
- Every completed provider receipt is sent to the atomic usage adapter **before** output parsing/validation. Invalid output is still billed; unavailable/throwing accounting blocks untracked AI output. A provider failure before a response creates no receipt. This is the prepared boundary for real Haiku/Sonnet invocation; no live call ran without the key and the route remains `501`.
- The deterministic report now satisfies the schema when every category/repository score is below 70: it emits a factual highest-available-signal fallback without calling it strong evidence. Interview question and expected-signal limits now match the schema at 400 characters.
- Deno 2.1.14 passed the new provider contract 8/8, report 6/6, and the full targeted backend with Telegram 69/69; changed files passed format/check/lint. Local Node 22 frontend typecheck was cancelled after the filesystem stayed asleep without a failure. Main commit `a904632` and raw-output accounting type-boundary follow-up `550ca8b` were pushed to `main`; final authoritative GitHub CI `32552046675` passed in 1m15s with Deno 69/69, backend quality, frontend 28/28 files and 127/127 tests, deploy-env 14/14, audit 0 high/critical, a 3,701-module build, and 10-file security. Staging/production DB, Edge, Netlify, and runtime were unchanged; Netlify was intentionally skipped by `[skip netlify]`.

Remaining: once the key arrives, connect the real CV/scoring/report LLM Router calls to this account-before-validation contract, release the quota lease in `finally`, pass full-flow smoke, and only then remove `501`.

Files: `.github/workflows/ci.yml`, `supabase/functions/server/services/hr-candidate/provider-contract{,.test}.ts`, `report-generator{,.test}.ts`, and synchronized four-language project documentation.

## 2026-08-22 — Deterministic HR scoring and evidence-linked reporting completed

- While `ANTHROPIC_API_KEY` remains unavailable, the provider-independent candidate scoring/report domain was implemented. The scorer previously returned zero for every category and the report generator returned empty arrays and summary.
- The scorer now applies the six-category 0–100 rubric, returns `role_fit=null` without a job description, clamps invalid/unbounded values, and emits conservative UZ/JA/EN inconsistency flags only from complete comparable GitHub evidence. Partial/failed GitHub data cannot create a flag.
- The report generator now returns bounded UZ/JA/EN strengths, evidence gaps, a summary, 6–7 evidence-linked category/behavioral interview questions, and a deterministic hiring recommendation. Private work is not inferred. Semantic Sonnet refinement, provider-accounting call-sites, and route activation remain blocked; production stays `501`, with no DB or frontend runtime change.
- Scoring commit `5395da1` passed GitHub CI `32547412956` in 1m03s. Final report commit `b222cf9` passed CI `32547588906` in 1m06s with Deno 60/60, backend quality, frontend 127/127, deploy-env 14/14, audit 0 high/critical, a 3,701-module build, and 10-file security. Netlify was intentionally skipped because frontend runtime did not change.

Remaining: once the key arrives, wire semantic CV structuring and Sonnet refinement with validated structured output, account for every provider response through the atomic usage RPC, release quota leases in `finally`, and remove `501` only after a green full-flow smoke.

Files: `.github/workflows/ci.yml`, `supabase/functions/server/services/hr-candidate/{candidate-scorer,report-generator}{,.test}.ts`, `index.ts`, and four-language DEVLOG/STATUS/PLAN/REQUIREMENTS/ARCHITECTURE/HR_CANDIDATE_ANALYSIS.

## 2026-08-22 — HR provider usage/cost accounting hardened atomically in staging

- A service-role-only `record_hr_candidate_ai_usage` RPC now records bounded model/complexity/token/cost/cache/latency metadata for semantic CV, scoring, and reporting. Tenant+endpoint+request idempotency and the daily token counter share one transaction; active membership, ULID, numeric/cache bounds, and browser EXECUTE denial fail closed. Prompt, CV, and output content is never stored, and the TypeScript adapter hides raw DB errors.
- Accounting Deno 4/4 and targeted backend 51/51 passed. Staging applied `20260822022702`, reaching 40 migrations. Transactional acceptance verified first/duplicate/second-stage, two logs, 240/90 tokens, $0.002070, exactly-once 330-token aggregation, request counter 0, and grants; rollback residue was user/tenant 0/0. No new security-advisor errors appeared. Production and `501` were unchanged.
- `36b9553` was pushed to main; GitHub CI `32546561166` completed green in 1m12s with Deno 51/51 and quality, frontend 127/127, deploy-env 14/14, audit 0 high/critical, a 3,701-module build, and 10-file security. Netlify was intentionally skipped because frontend runtime did not change.

Remaining: wire each real provider response through this boundary before output validation, then release quota leases and remove `501` only after full-flow smoke.

## 2026-08-22 — HR Candidate frontend upload/state/result boundary completed

- While `ANTHROPIC_API_KEY` remains pending, the secret-free frontend slice was completed. The former UI skeleton lacked client-side input bounds, stale-request cancellation, safe transport errors, runtime success-envelope validation, and accessible pending/error/empty states.
- `/hr/candidates` now validates PDF/DOCX up to 5 MiB, filenames up to 180 characters, and job descriptions up to 5,000 Unicode characters before submit; it normalizes GitHub/job values and provides drag/drop, file summary/removal, locale/depth radio groups, and disabled states. The API validates tenant/session before network access, preserves the browser multipart boundary, applies a 40-second timeout and caller cancellation, maps HTTP/network failures to typed codes without raw backend text, and rejects incomplete success payloads. The hook aborts prior calls, blocks stale or unmounted updates, and resets on tenant changes.
- The results workspace uses a responsive cardless editorial layout with accessible live status/error/empty states and the existing score, summary, questions, and GitHub components. Four-locale copy is synchronized in the shared runtime i18n source. The canonical backend route intentionally remains `501 NOT_IMPLEMENTED`; provider, production DB, and Edge were unchanged.
- Verification passed targeted API/form/hook 12/12, full frontend 28/28 files and 127/127 tests, TypeScript, deploy-env 14/14, production dependency audit with 0 high/critical, a 3,701-module Node 22.18.0 build, and the 10-file security gate. Authenticated in-app-browser acceptance covered 1440×1000 desktop and 390×844 mobile dark layouts, the light-theme toggle, required validation, and zero horizontal overflow. Browser file-chooser automation timed out twice, so real file selection is covered by unit drop/upload tests. Final synthetic staging fixture read-back was Auth/identity/membership/tenant `0/0/0/0`; the temporary PDF and browser tabs were removed.
- `f77dd9a` was pushed to `main`. GitHub CI `32545770532` completed green in 57 seconds: frontend 28/28 and 127/127, deploy-env 14/14, audit 0 high/critical, Deno quality, 3,701-module build, and 10-file security PASS. Netlify production deploy `6a89065505b5600008dd0385` / build `6a89065505b5600008dd0383` was `ready` in 29 seconds with plugin success and 0 secret matches across 87,145 files. `/` and `/dashboard/hr/candidates` returned `200` with CSP; `index-DipHAHEa.js` contains the production ref once, the staging ref zero times, and the new Candidate copy once.

Remaining: finish HR provider usage/cost logging independently of the provider key. After `ANTHROPIC_API_KEY` arrives, make semantic CV, Sonnet scoring/reporting, quota release, and authenticated full-flow smoke green before removing `501`.

Files: `frontend/src/app/i18n.ts`, `frontend/src/features/hr/{__tests__,candidates}`, `frontend/src/features/hr/candidates/README.md`, repository `README.md`, and four-language `DEVLOG/STATUS/PLAN/REQUIREMENTS`.

## 2026-08-22 — HR persistent quota and bounded multipart boundary completed in staging

- While `ANTHROPIC_API_KEY` remains pending, the next secret-free HR Candidate slice was completed. Database `starter/pro/company` plans now map to the tariff policy, while PostgreSQL owns tenant-scoped minute/day counters and 45-second expiring concurrency leases through service-role-only reserve/release RPCs. Browser EXECUTE and service-role direct table access are denied; the user FK has a covering index.
- The multipart adapter validates boundary, field multiplicity/allowlist, encoding, MIME, file/text/locale/depth contracts and caps declared or chunked bodies at a 5 MiB CV plus 64 KiB overhead. The disabled canonical route now drains with the same bound and still returns `501 NOT_IMPLEMENTED` for a valid authorized request; provider and production Edge were not deployed.
- Backend Deno passed 47/47 plus 17-file format, 12-file check, and lint. The monolith retains the same 21 pre-existing logging/Hono/risk type errors, with none on new HR lines. Under Node 22.23.2, frontend 26/26 files and 117/117 tests, type-check, deploy-env 14/14, production audit 0 high/critical, 3,701-module build, and 10-file security gate passed.
- Staging applied migrations `20260822010759` and `20260822011030`, reaching 39 migrations. The remote 22-case transactional pgTAP runner reached `ok 22` and rolled back; read-back confirmed 2/2 private tables use RLS+FORCE, service reserve/release is allowed, browser reserve/release is denied, and direct service table SELECT is denied. The new unindexed-FK advisor finding is closed; only expected unused-index INFO remains before workload. Production DB/Edge was unchanged. Fresh local 39-migration replay is BLOCKED because the local Docker socket did not respond; staging PostgreSQL 17.6 dry-run/pgTAP provided database verification.
- `398e46e` was pushed to `main`; GitHub CI `32543760806` was green in 1m15s: Deno 47/47, format/check/lint, frontend 26/26 files and 117/117 tests, deploy-env 14/14, audit 0 high/critical, 3,701-module build, and 10-file security gate PASS. Netlify was intentionally skipped because runtime frontend code did not change.

Remaining: complete secret-free HR usage/cost logging and frontend upload/results; once the key arrives, run real semantic CV/scoring/report smoke, release the quota lease in route `finally`, then remove `501`.

## 2026-08-21 — HR request boundary and orchestrator hardened fail-closed

- The provider-independent HR request/orchestrator path was audited. Runtime validation was TODO; a fulfilled CV with `parse_status: failed` could continue into scoring; successful `Promise.race` calls left timeout timers alive; the base36 request-ID shim did not guarantee the schema's ULID alphabet; and the schema required `result` even for error responses.
- A pure request boundary normalizes exact GitHub profiles and validates CV bytes/MIME/5 MiB, filename 180, job description 5,000, locale, and depth before providers, returning a defensive byte copy. Canonical HR/manager/company_admin/super_admin plus legacy leader policy and Free/Entrepreneur/Business concurrent/minute/day policies were added. The main `501` stub now fail-closes on tenant role after authentication; persistent quota reservation is not yet wired.
- The dependency-injected orchestrator now proves parallel bounded GitHub/CV collection, GitHub degradation, failed-CV hard stop, zero provider calls on invalid input, public timeout envelopes, timer cleanup, and canonical 26-character Crockford ULIDs. JSON Schema now enforces error/success `result`/`error` exclusivity and includes invalid-request/rate-unavailable/not-implemented codes.
- New boundary 5/5, orchestrator 6/6, and schema 1/1 tests pass: HR 30/30 and targeted Deno 34/34 with Telegram. Format/check/lint, AJV schema compile, and YAML pass. Full monolith `server/index.ts` check still reports 21 pre-existing logging/Hono/risk typing errors, with none on new HR lines. The route stays `501`; no provider, deploy, or remote smoke changed.
- `2656e6a` was pushed to `main`; GitHub CI `32491296828` finished green in 1m9s: Deno 34/34, frontend 26/26 files and 117/117 tests, deploy-env 14/14, audit 0 high/critical, a 3,701-module build, and the 10-file security gate passed. Netlify was intentionally skipped because this slice does not enable the runtime endpoint.

Files: `.github/workflows/ci.yml`, `supabase/functions/server/index.ts`, `supabase/functions/server/services/hr-candidate/{index,index.test,request-boundary,request-boundary.test,schema.test,types}.ts`, `schemas/candidate-analysis.schema.json`, `frontend/src/features/hr/candidates/README.md`, `docs/HR_CANDIDATE_ANALYSIS.md`, and four-language `DEVLOG/STATUS/PLAN/REQUIREMENTS/ARCHITECTURE`.

## 2026-08-21 — Secret-free HR PDF/DOCX CV parsing implemented

- While waiting for `ANTHROPIC_API_KEY`, the next provider-independent HR Candidate slice was completed. The prior `cv-parser.ts` contained only TODO/`NOT_IMPLEMENTED` paths for PDF/DOCX extraction, dates/sections, and semantic structure.
- The parser now validates the 5 MiB limit, MIME, and file magic; it extracts PDF locally with `pdfjs-dist` under 50-page/64,000-raw-character bounds and DOCX with `mammoth`. DOCX preflight rejects ZIP64, encryption, path traversal, over 2,048 entries, a 16 MiB entry, 32 MiB total expansion, or a 250× compression ratio. Filenames are sanitized to a basename without control characters; raw CV text is neither persisted nor logged.
- EN/UZ/RU/JA date ranges and section headings, overlap-safe experience years, and bounded tech-skill/language hints are extracted deterministically. Prompt-injection sanitation remains. Haiku role/education structuring is intentionally not called; output stays `partial / SEMANTIC_STRUCTURING_PENDING`, while scanned/image-only PDF fails.
- With Deno `v2.1.14`, 8/8 new tests using real `pdf-lib` PDF and `docx` DOCX fixtures, format/check, and the combined targeted backend 22/22 passed. Coverage includes invalid magic, oversize, 51-page PDF, scanned PDF, DOCX expansion bomb, and localized dates/sections. The PDF path uses standards polyfills without a native canvas dependency. The route and production `501` are unchanged; no deploy or remote smoke was performed.
- `2526d72` was pushed to `main`; GitHub CI `32489478394` finished green in 59 seconds: Deno 22/22, frontend 26/26 files and 117/117 tests, deploy-env 14/14, audit 0 high/critical, a 3,701-module build, and the 10-file security gate passed. Netlify was intentionally skipped because frontend/runtime routing did not change.

Files: `.github/workflows/ci.yml`, `supabase/functions/server/services/hr-candidate/cv-parser{,.test}.ts`, `frontend/src/features/hr/candidates/README.md`, and four-language `DEVLOG/STATUS/PLAN/REQUIREMENTS/ARCHITECTURE`.

## 2026-08-21 — Real HR GitHub analyzer and cache implemented

- While waiting for `ANTHROPIC_API_KEY`, the secret-free HR Candidate P2 started. The previous analyzer fetched only the profile; repository pagination, aggregation, quality signals, and caching were TODO, and repository URLs were incorrectly accepted as profile input.
- The public REST adapter now validates an exact profile, fetches profile plus first repository page in parallel, caps pagination at 3×100, and bounds each request to three seconds, the full analysis to 5.5 seconds, and each response to 2 MiB. It inspects the top six repository trees in parallel and aggregates README/test/CI, language/stars/activity proxy, and quality signals; incomplete provider data stays `partial`. A case-insensitive 10-minute, 250-entry process cache coalesces stampedes and returns defensive copies; it is neither authorization nor a source of truth.
- Deno format/check and 10/10 deterministic tests passed, including unsafe provider URL rejection. A live public `octocat` smoke returned `complete`, eight public repositories, six sampled repositories, and two aggregated languages. The route, CV parser, scoring/report, auth/rate-limit, and production `501` intentionally remain unchanged. CI now runs these ten HR tests alongside the four Telegram tests.
- Supabase organization read-back is `free`; current Supabase documentation limits Leaked Password Protection to Pro+. Production/staging Auth configuration was unchanged, and PLAN now records this as a paid-upgrade blocker.
- `8496aae` was pushed to `main`; GitHub CI `32487503062` finished green in 58 seconds: Deno 14/14, frontend 26/26 files and 117/117 tests, deploy-env 14/14, audit 0 high/critical, a 3,701-module build, and the 10-file security gate passed.

Files: `.github/workflows/ci.yml`, `supabase/functions/server/services/hr-candidate/github-analyzer{,.test}.ts`, `frontend/src/features/hr/candidates/README.md`, and four-language `DEVLOG/STATUS/PLAN/REQUIREMENTS/ARCHITECTURE`.

## 2026-08-21 — Production Telegram webhook bypass made fail-closed

- Production had `TELEGRAM_BOT_TOKEN`, lacked `TELEGRAM_WEBHOOK_SECRET`, and ran `telegram-bot` v14 ACTIVE; staging had no Telegram secrets/function. GET health returned `200`, but an invalid-secret `{}` POST returned `200` instead of expected `503`.
- Deployed v14 used `if (SECRET && secretHeader !== SECRET)`, bypassing validation when the secret was absent. The fail-closed decision was extracted into a pure helper: missing/empty config `503`, missing/wrong header `401`, exact-secret allow. GitHub CI now runs these four regression tests, the three-file format gate, and entrypoint check with pinned Deno `v2.1.14`; local YAML parse, tests 4/4, format 3/3, entrypoint check, and diff-check passed. No secret/token value was read or logged.
- Only `telegram-bot` was deployed to production: v15 ACTIVE, health `200`, invalid POST `503 Service Unavailable`, PUT `405`. The bot is intentionally fail-closed; setting a new secret, calling Telegram `setWebhook` with the same value, and bot smoke remain.
- `67ac675` was pushed to `main`. GitHub CI run `32485618740` finished green in 1m5s: Telegram 4/4, frontend 26/26 files and 117/117 tests, deploy-env 14/14, audit 0 high/critical, a 3,701-module build, and the 10-file security gate passed. The commit used the Netlify skip marker because the frontend was unchanged.

Files/state: `.github/workflows/ci.yml`, `supabase/functions/telegram-bot/{index.ts,webhook-security.ts,webhook-security.test.ts}`, production `telegram-bot` v15, four-language `DEVLOG/STATUS/PLAN/CONNECTIONS`.

## 2026-08-21 — Production authenticated PDF/DOCX acceptance is green

- While waiting for the staging `ANTHROPIC_API_KEY`, an independent P1 debt item was closed: production `ufhepwdkjqptjvxrmpjn` was reconfirmed at 36/36 migrations with `bright-api` v76 ACTIVE. A phased acceptance client now creates synthetic Auth fixtures through SQL and uses normal password sign-in without the blocked Auth Admin endpoint; it accepts only `doc-acceptance-*` tenants and `@example.test` users, never logs tokens/keys/passwords, and has HTTP timeouts.
- The production authenticated flow passed a real DOCX signed download (`3,894,448` bytes) and an edited PDF signed download (`3,961,631` bytes). Direct authenticated Storage returned `400`, cross-tenant export returned `404`, document delete returned `200`, and the immutable tenant/user/document path contract was verified.
- The same signed URL returned `200` immediately after deletion because of Smart CDN caching. Current Supabase Smart CDN documentation allows deletion invalidation to propagate for up to 60 seconds, so the incorrect immediate `400/404` assertion was removed. Authoritative SQL read-back confirmed document/generated/object residue `0/0/0` and final Auth-user/tenant/template/document/object fixture residue `0/0/0/0/0`.
- `node --check`, `git diff --check`, and production acceptance passed. Changes were pushed to `main` as `a2b4419`; GitHub CI run `32484224203` finished fully green in 49 seconds across type-check, 117 tests, deploy-env, audit, build, and security gate. Application schema, Edge Function, and frontend deployment were unchanged. The first next action remains securely setting staging `ANTHROPIC_API_KEY` and making the real-provider polishing smoke green.

Files: `supabase/tests/integration/document_binary_storage.client.mjs` and four-language `DEVLOG/STATUS/PLAN/REQUIREMENTS`.

## 2026-08-21 — GitHub/Netlify green and AI polishing deployed to staging

- `4b51fec` was fast-forward pushed directly to `main`. GitHub Actions run `32461091448` completed fully green across type-check, 117 frontend tests, deploy-env, dependency audit, production build, and hosting security gate.
- The main push triggered a Netlify production deploy rather than a preview: deploy `6a88056075359300089b9fa5`, build `6a88056075359300089b9fa3`, 34 seconds, plugin success, and zero secret matches across 87,170 files. `/` and `/dashboard/docs` returned `200`, CSP was present, and the bundle contained the production Supabase ref once and the staging ref zero times. Production Supabase intentionally remains at backend v76 and 36 migrations.
- Canonical migration `20260821000000_atomic_ai_usage_reservations` was applied to staging `piqsyfwrjtormrlenjix`: history is 37/37, both RPCs exist, `service_role` has EXECUTE, and `anon`/`authenticated` are denied. `bright-api` v11 is ACTIVE; health returned `200`, while unauthenticated `/docs` and `/docs/:id/polish` returned `401 TENANT_REQUIRED`. Security advisor has no new error; the known 11 RLS/no-policy infos and `vector` warning remain.
- The authenticated synthetic preview/save smoke passed Auth, tenant, and document boundaries but stopped at the real provider call with `503 AI_UNAVAILABLE`: staging Edge secrets do not include `ANTHROPIC_API_KEY`, while production contains that secret name. Synthetic tenant/document/membership/Auth-user residue is `0/0/0/0`; no secret value was read, copied, or logged.
- First next action: securely set `ANTHROPIC_API_KEY` in staging and rerun the authenticated real-provider preview/save smoke to green. Only then deploy the production migration plus `bright-api`. The three user-owned untracked copies remain untouched.

Files/state: GitHub `main`/CI, Netlify production deploy, staging Supabase migration/`bright-api` v11, and four-language `DEVLOG/STATUS/PLAN/REQUIREMENTS`.

## 2026-08-21 — Remaining five AI polishing review findings closed locally

- The follow-up review confirmed five issues: Telegram Maslahatchi omitted the newly required `cacheScope`, so its entrypoint no longer type-checked; the Anthropic timeout was cleared after response headers and did not cover a delayed body; concurrent requests could exceed plan quota between check and increment; an AI result could overwrite edits made while polishing was in flight; and the edit modal could leave a short viewport.
- The Telegram caller now uses tenant-scoped caching. The LLM timeout covers fetch, error-body consumption, and JSON-body parsing. The authoritative polishing quota decision moved to service-role-only PostgreSQL `reserve_ai_request`: limit check and increment occur in one atomic statement, while `release_ai_request` returns a reservation when the provider call does not complete. Token accounting remains separate and the request is not double-counted.
- The React modal compares the current draft revision with the revision captured at request start. If the user edits during the request, the stale result is not applied and a localized retry message is shown in all four languages. The dialog is bounded by `100dvh` with internal vertical scrolling. No ceremonial layers were added: the use case remains a vertical slice; PostgreSQL owns the quota invariant, React owns the draft invariant, and the provider adapter owns timeout lifecycle.
- Verification: before the fix, the timeout regression failed 6/7 and the reservation test failed on missing exports. Afterward, polish/router/usage Deno tests passed 18/18, and the Telegram entrypoint `deno check` and `git diff --check` passed. In a secret-free clean temporary frontend install, the modal tests passed 3/3, the full suite passed 26/26 files and 117/117 tests, TypeScript passed, and the 3,701-module production build passed. Docker Desktop was started; the user-owned duplicate migration was temporarily excluded under a restore trap, then restored unchanged. Canonical fresh migration replay passed 37/37, the new quota pgTAP passed 9/9, and the full local database suite passed 3/3 files with 45/45 tests. Final production review found no new verified finding that blocks the commit, and no secret signature was found in intended files. Full `server/index.ts` check remains on 22 known monolith type errors, with none on the new lines. Real Anthropic, staging/production deploys, and authenticated remote smoke were not run.
- Remaining and next: push the local closeout commit to GitHub, pass CI/Netlify preview, deploy the staging migration plus `bright-api`, and run an authenticated real-provider preview/save smoke. The three user-owned untracked copies remain unchanged and are excluded from the commit.

Files: `supabase/functions/{server/index.ts,server/services/llm-router.ts,server/services/llm-router.test.ts,server/services/usage-tracking.ts,server/services/usage-tracking.test.ts,telegram-bot/services/maslahatchi.ts}`, `supabase/migrations/20260821000000_atomic_ai_usage_reservations.sql`, `supabase/tests/database/ai_usage_reservation.test.sql`, `frontend/src/features/docs/{components/DocEditModal.tsx,__tests__/DocEditModal.test.tsx}`, `frontend/src/app/i18n.ts`, and four-language `DEVLOG/STATUS/PLAN/REQUIREMENTS/ARCHITECTURE`.

## 2026-08-21 — AI polishing review findings closed locally

- The local polishing review confirmed four defects: the shared `document` chat budget had also expanded to 8,000 tokens; provider usage/cost was skipped for unusable model output; a raw user-instruction excerpt was retained in `ai_interactions`; and quota/rate-limit errors did not match the frontend envelope or all four locale contracts.
- The LLM Router now keeps the shared `document` default at 2,000 tokens while polishing explicitly requests 8,000; the effective output budget is also part of the cache key. Provider usage/cost is recorded before output validation, with an empty-output regression proving the order. AI interactions retain only `instruction_length`, never the raw instruction.
- Polish document-not-found, minute rate-limit, guard-unavailable, and plan-quota failures now use the standard `failure()` envelope with UZ/RU/EN/JA messages. The frontend parser preserves standard-envelope priority and supports legacy `error.message`. No database schema, migration, RLS, or tenant-authorization boundary changed.
- Verification: Deno polish/router tests 14/14 and focused service `deno check` passed. Full `index.ts` check returned the same 23 pre-existing monolith type errors, with none on the new polishing path. In a secret-free clean `/tmp` frontend install, 26/26 files and 115/115 tests, TypeScript, the 3,701-module production build, 10-file security gate, deploy-env 14/14, and production audit with 0 total vulnerabilities passed. Real Anthropic, staging/production deployment, and authenticated remote smoke were not run.
- Remaining and next: inspect the final diff, commit, pass CI/Netlify preview, deploy staging `bright-api`, and run the authenticated real-provider preview/save smoke test. The three user-owned untracked copies remain unchanged.

Files: `supabase/functions/server/{index.ts,services/llm-router.ts,services/llm-router.test.ts,services/document-polisher.ts,services/document-polisher.test.ts}`, `frontend/src/shared/lib/{apiClient.ts,apiError.ts,apiError.test.ts}`, and four-language `DEVLOG/STATUS/PLAN/REQUIREMENTS/ARCHITECTURE`.

## 2026-08-21 — Landing hero TEAM/caption overlap closed

- The supplied 2048×1080 production screenshot confirmed that the `TEAM / 08` card in `LandingSystemVisual` overlapped the `ONE TENANT · ONE OPERATIONAL VIEW` caption. SVG geometry placed TEAM at `y=274` with height `58`, extending to `332`, while the caption baseline was `y=322`.
- TEAM was moved to `y=244`. A DOM-geometry regression test now requires at least 16 SVG units of clearance between the card bottom and caption baseline.
- In the clean temporary install, targeted landing tests passed 2/2 files and 6/6 tests; the full frontend suite passed 25/25 files and 112/112 tests; TypeScript passed. In-app browser acceptance at 2048×1080 measured a `12.73px` real gap with overlap `false`, horizontal overflow `false`, and console errors `0`. Hero copy, CTA, and motion are unchanged.
- Remaining: review/commit this fix with the AI polishing slice, then pass CI and Netlify preview. It has not been deployed to production, and the active P1 order is unchanged.

Files: `frontend/src/features/landing/components/LandingSystemVisual.tsx`, `frontend/src/features/landing/__tests__/LandingSystemVisual.test.tsx`, and four-language `DEVLOG/STATUS`.

## 2026-08-21 — AI Document Assistant polishing preview completed locally

- The production assistant already generated real PDF/DOCX files in private Storage, but users could not ask AI to revise an existing editable document. At audit start, local `main` matched `origin/main` at `5e33f094`; the three existing untracked user files were preserved.
- Added tenant-protected `POST /v1/docs/:id/polish`, Anthropic LLM Router integration, and a four-locale edit-modal flow. The model result is only a review preview in the textarea; the stored document changes only after the user explicitly selects **Save**. The endpoint authorizes the document by tenant, applies safety/rate/usage guards, and records audit/usage metadata without logging document content.
- Hardened the router with current Claude Haiku 4.5/Sonnet 4.6 defaults, tenant-scoped full-prompt SHA-256 cache keys, a bounded 250-entry TTL cache, bounded timeout, and an 8,000-token document output budget. The prompt treats title/content as untrusted data and forbids invented facts, citations, or legal guarantees. Input/output limits and UZ/RU/EN/JA errors were added.
- Verification: backend tests 9/9; frontend 24/24 files and 111/111 tests plus TypeScript passed in a clean `/tmp` install; the 3,700-module production build, 10-file security gate, deploy-env 14/14, and production dependency high/critical 0 passed. Workspace `node_modules` was blocked by an iCloud read hang, so frontend gates ran in the clean copy. Full `index.ts` Deno check still fails only on 23 pre-existing monolith typing errors; none point to this endpoint/service. No real Anthropic call, browser visual acceptance, staging/production deploy, or remote smoke test was performed.
- Next action: review/commit, pass CI and Netlify preview, deploy `bright-api` to staging, and run an authenticated real-provider preview/save smoke test before considering production rollout.

Files: `supabase/functions/server/{index.ts,openapi.ts,services/llm-router.ts,services/llm-router.test.ts,services/document-polisher.ts,services/document-polisher.test.ts}`, `frontend/src/features/docs/{api/docsApi.ts,components/DocEditModal.tsx,__tests__/docsApi.test.ts,__tests__/DocEditModal.test.tsx}`, `frontend/src/app/i18n.ts`, and four-language `DEVLOG/STATUS/PLAN/REQUIREMENTS/ARCHITECTURE`.

## 2026-08-12 — AI Document Assistant production rollout completed

- PR #10 merged as `55d1468`. PR #11 final head `6db478d` passed CI run `31545572719`, a backend-only Netlify PASS, and a Codex re-review with no major issues, then squash-merged to `main` as `8f179da`. GitHub Actions run `31545917894` passed for the merge commit.
- The four document migrations were applied to production Supabase `ufhepwdkjqptjvxrmpjn` exactly as preflighted, bringing local/staging/production history to 36/36. Read-back verified both private document buckets, `documents.row_version`, `doc_generated.download_expires_at`, and removal of the old retained column. `bright-api` v76 is ACTIVE with the same SHA as staging v10; health is `200`, unauthenticated docs return `401`, and the last production pgTAP assertion is `ok 15`. The security advisor reported no new document Storage finding.
- Netlify production deploy `6a7bad961b16200007cfd88e` / build `6a7bad961b16200007cfd88c` became ready for commit `8f179da` in 32 seconds; plugin success and 0 secret matches across 87,166 files. `/` and `/dashboard/docs` return `200`; CSP and bundle `index-DRUqHIdd.js` contain only the production Supabase ref, with 0 staging refs or legacy env names.
- Production authenticated synthetic acceptance was blocked by Cloudflare `403` in front of Supabase Auth Admin before the first user fixture was created, so it was not retried. Final SQL read-back confirms 0/0/0/0/0/0 residual Auth users, tenants, templates, documents, generated metadata, and Storage objects. Production rollout is complete, while authenticated signed-download/cross-tenant/direct-Storage/delete-cleanup recheck remains an operational follow-up.
- Next product work: connect AI questions/polishing through the LLM Router, followed by Telegram step-by-step document generation and delivery. Three existing user-owned untracked files remain untouched.

Files/state: PR #10/#11, production Supabase migrations/`bright-api` v76, Netlify deploy `6a7bad961b16200007cfd88e`, `docs/{DEVLOG,STATUS,PLAN,REQUIREMENTS}.md`, and their `English`/`Russian`/`日本語` equivalents.

## 2026-08-12 — Generate publication order and PDF wrapping hardened

- `661401a` CI run `31544880764` passed in 40 seconds; Netlify `6a7ba9f3a8c5ab0009f8474f` was canceled/PASS. Codex review `4911510535` found two P2s: failed cleanup after a binary error could leave a file-less duplicate document, and long newline-free PDF paragraphs were measured in O(n²).
- Generate now preassigns the UUID document ID, prepares the binary at its immutable private path, and only then publishes the `documents` row. Binary/font/upload failure occurs before any DB row; document insert failure cleans only the orphan object.
- PDF wrapping measures each glyph once in O(n); a 20,000-character regression asserts exactly 20,000 measurements. Delete storage snapshot now reads the unique `doc_generated` row, making the old race thread outdated. Staging `bright-api` v10 is ACTIVE, health `200`; Deno 7/7 and focused/syntax/diff gates pass, with only the known 22 full-API typing errors.
- Remaining: commit/push, pass fresh CI/Netlify/Codex, merge PR #11, and deploy production. Three user-owned untracked files remain untouched.

Files: `supabase/functions/server/{index.ts,services/document-binary.ts,services/document-binary.test.ts}` and synchronized four-language DEVLOG/STATUS/PLAN/REQUIREMENTS/ARCHITECTURE.

## 2026-08-12 — PR #11 URL-lease and delete/export races closed

- For `0532a74`, CI run `31543616548` passed in 50 seconds and Netlify `6a7ba58c7a91150008320965` was canceled/PASS. Codex review `4911406530` found two P2s: the URL lease began before signing and delete was not serialized with an in-flight export.
- Binary metadata publication now takes a five-minute provisional lease, then pins the final 65-second lease after successful URL signing. A failed final lease write compensates DB metadata/object state and never returns the URL.
- Delete uses `documents.row_version` CAS: an export winner makes delete return `409 DOCUMENT_CONFLICT`; when delete wins, the stale export detects the absent document and removes its immutable new upload. Staging `bright-api` v9 is ACTIVE, health `200`; Deno 6/6 and focused/syntax/diff gates pass, with only the known 22 full-API typing errors.
- Remaining: commit/push, pass fresh CI/Netlify/Codex, merge PR #11, and roll out production. The three user-owned untracked files remain untouched.

Files: `supabase/functions/server/{index.ts,services/document-binary.ts,services/document-binary.test.ts}` and synchronized four-language DEVLOG/STATUS/PLAN/REQUIREMENTS/ARCHITECTURE.

## 2026-08-12 — Third PR #11 Codex concurrency findings closed with serialization

- For `35fa078`, CI run `31542246103` passed in 55 seconds and backend/docs-only Netlify preview `6a7ba1042a94de0008d79759` was canceled/PASS. Codex review `4911297037` found two P2s on that commit: retained cleanup depended on a future request, and a parallel document edit could let export republish stale metadata/binary as current.
- The retained-path model was replaced before production. `doc_generated.download_expires_at` provides the 60-second signed URL plus a five-second safety lease; re-export returns `409 EXPORT_DOWNLOAD_ACTIVE` while active, then removes the superseded immutable object after the new metadata/document commit. `documents.row_version` serializes edit and export publication with optimistic compare-and-swap; stale export upload/metadata is rolled back with `409 DOCUMENT_CONFLICT`.
- Migration `20260811223321_serialize_document_exports.sql` is applied to staging: 36/36 migrations, `bright-api` v8 ACTIVE, health `200`, unauthenticated docs `401`; column/removal read-back is green, active-lease residue is zero, and the last pgTAP assertion is `ok 15`. Deno binary/lifecycle tests pass 6/6, focused check, integration syntax and diff check pass; the full API check retains only the known 22 typing errors.
- Remaining: push this follow-up, pass fresh CI/Netlify/Codex, merge, and deploy production Supabase/Netlify. Remote authenticated fixtures remain BLOCKED by Cloudflare Auth Admin IP `403`; the three user-owned untracked files remain untouched.

Files/state: `supabase/functions/server/{index.ts,services/document-binary.ts}`, unit/database/integration tests, `supabase/migrations/20260811223321_serialize_document_exports.sql`, synchronized four-language DEVLOG/STATUS/PLAN/REQUIREMENTS/ARCHITECTURE.

## 2026-08-12 — PR #11 Codex re-review concurrency and compensation findings closed

- After follow-up `7837778`, CI run `31540938092` passed in 52 seconds. Netlify canceled incremental preview `6a7b9cd2d9412e000833a5c8` with a passing status because the frontend was unchanged; the same frontend artifact remains ready at `6a7b2e774d8b4a00084583b0`. Codex re-review `4911171318` on `7837778` found two more P2 issues: initial signed-URL compensation was Storage-first, and concurrent export could immediately delete an object still covered by a 60-second signed URL.
- Generate signed-URL compensation now verifies tenant-scoped document deletion before binary cleanup. Export replacement uses a `storage_path` compare-and-swap to serialize metadata commits; a stale parallel request cleans its new upload and returns `409 EXPORT_CONFLICT`.
- Superseded binaries are tracked in `retained_storage_paths` with `path/delete_after` and retained for 120 seconds: the 60-second URL TTL plus a 60-second safety window. Expired objects are cleaned only after the new URL is signed, and cleanup metadata uses a compare-and-swap. Document delete remains DB-first and then removes active plus all retained paths. Migration `20260811221503_retain_document_storage_versions.sql` adds the JSONB-array contract.
- Staging is at 35/35 migrations, `bright-api` v7 ACTIVE, health `200`; retained column/constraint read-back is green, the last pgTAP assertion is `ok 14`, and retained/acceptance residue is zero. Security advisors show only pre-existing debt and no new document Storage finding. Deno binary/lifecycle tests are `7/7`; focused service check, integration syntax, and diff check pass. The full API check remains at the same 22 pre-existing typing errors. Remote authenticated fixture creation remains BLOCKED by the Cloudflare Auth Admin IP `403`.
- Remaining: commit/push the second follow-up, rerun CI/Netlify/Codex, then merge and roll out production migrations, Edge, and Netlify. The three pre-existing untracked user files remain untouched.

Files/state: `supabase/functions/server/{index.ts,services/document-binary.ts}`, `supabase/functions/server/services/document-binary.test.ts`, `supabase/migrations/20260811221503_retain_document_storage_versions.sql`, `supabase/tests/{database/document_storage_contract.test.sql,integration/document_binary_storage.test.mjs}`, synchronized four-language STATUS/PLAN/REQUIREMENTS/ARCHITECTURE/DEVLOG.

## 2026-08-11 — PR #11 Codex transactional Storage findings fixed

- PR #10 was re-verified green at `adab3fe` and squash-merged to `main` as `55d1468`. PR #11 was retargeted to `main`; the squash-history conflict was removed by replaying only its two commits. On head `50a46c2`, CI run `31500547178` passed in 53 seconds and Netlify preview `6a7b2e774d8b4a00084583b0` was ready. `/` and `/dashboard/docs` returned `200` with staging-only CSP and `noindex`.
- Codex review `4907243544` on `50a46c2` found two P2 partial-failure bugs: same-format re-export overwrote the active object before the DB metadata commit, and delete removed the binary before the database row. Exports now create immutable UUID-versioned paths `<tenant>/<user>/documents/<document-id>/document-<storage-version>.<pdf|docx>` with `upsert:false`, then remove the old object only after metadata succeeds. Delete now removes the tenant-scoped document row first and performs binary cleanup afterward.
- Follow-up migration `20260811142919_version_document_storage_objects.sql` adds `storage_version` and the exact versioned-path constraint while retaining read compatibility for legacy unversioned rows. Staging is at 34/34 migrations, `bright-api` v6 ACTIVE, health `200`; schema/constraint/private-bucket read-back is green and synthetic fixture residue is zero. Advisors reported only pre-existing linter debt and no new document Storage finding.
- Verification: Deno binary/service tests `5/5`, focused service `deno check`, integration `node --check`, and `git diff --check` passed. The full `bright-api` check still reports the same 22 pre-existing logging/Hono/risk/usage typing errors. Remote staging Auth acceptance was blocked before fixture creation by the known Cloudflare IP-level `403`; final residue is zero, so the new authenticated remote path remains BLOCKED. Remaining: push the fix to PR #11, rerun CI/Netlify/Codex, merge, then production Supabase/Netlify rollout and the strongest available smoke test.

Files/state: PR #10 merge `55d1468`, PR #11, `supabase/functions/server/{index.ts,services/document-binary.ts}`, `supabase/functions/server/services/document-binary.test.ts`, `supabase/migrations/20260811142919_version_document_storage_objects.sql`, `supabase/tests/{database/document_storage_contract.test.sql,integration/document_binary_storage.test.mjs}`, synchronized four-language STATUS/PLAN/REQUIREMENTS/ARCHITECTURE/DEVLOG.

## 2026-08-11 — Real AI Document Assistant PDF/DOCX and private Storage completed in staging

- Previously, 15 templates, four languages, the dynamic form, and editable drafts existed, but “PDF” used the browser print dialog and download produced `.txt`; there was no private Storage, binary metadata, signed URL, or tenant/user path contract. Work is on `agent/ai-document-binary-storage`, stacked on draft PR #10. The three existing untracked user files were preserved and not staged.
- Added real generation with pinned `pdf-lib@1.17.1`, `@pdf-lib/fontkit@1.1.1`, and `docx@9.7.1`. The pinned Noto Sans JP asset is exact-SHA-256 verified, privately cached, fully embedded in PDF, and embedded as `word/fonts/font1.odttf` in DOCX. Visual review exposed broken CFF glyph maps with PDF subsetting, fixed by full-font embedding; all four languages render in both files.
- Added private `generated-documents`/`document-assets` buckets, 10/5 MiB limits, MIME allow-lists, `doc_generated` binary metadata/checksum/FK/unique/canonical-path constraints, and a restrictive direct-access deny policy for `anon`/`authenticated`. The path is `<tenant>/<user>/documents/<document-id>/document.<pdf|docx>` and downloads use 60-second signed URLs. Generate/export/edit-stale/delete are tenant-scoped with compensation cleanup and audit logs.
- Replaced frontend print/`.txt` pseudo-export with real PDF/DOCX downloads, file status in list/detail, four-locale copy, and the documented OpenAPI generate/export contract.
- Applied migration `20260811131308` to staging `piqsyfwrjtormrlenjix`; `bright-api` v5 is ACTIVE and health is `ok`. Storage/RLS pgTAP passed 12/12. Earlier v3 remote E2E passed real DOCX/PDF download, direct authenticated Storage deny `400`, cross-tenant export `404`, edit/regenerate, and delete cleanup. Re-running embedded-font v4/v5 acceptance was blocked before fixture creation by an IP-level Cloudflare `403` on Supabase Auth Admin; final residue is 0 acceptance users/tenants/documents/templates/generated rows/objects and one verified private font cache. Production intentionally remains unchanged: 0 new buckets and 0 new columns; preflight confirmed neither of its two legacy generated rows has `storage_path`.
- Verification: Deno binary 4/4; DOCX ZIP integrity green, embedded `.odttf` `4,533,028` bytes, final DOCX `3,894,424` bytes; PDF `3,961,665` bytes and Quick Look visual green. Frontend Vitest 23/23 files and 109/109 tests, TypeScript, 3700-module production build, raw audit total 0, production high/critical 0, focused docs API 5/5, new service `deno check`, integration `node --check`, and `git diff --check` passed. Full `bright-api` Deno check still reports 22 pre-existing logging/Hono/risk/usage type debts; local Supabase was unavailable because Docker was stopped.
- Application/docs were committed and pushed as `d8bec96` on `agent/ai-document-binary-storage`; draft PR #11 is OPEN/DRAFT/MERGEABLE and stacked on PR #10's head branch. The CI workflow runs only for pull requests targeting `main`, so #11 has no checks yet; this is not a failure. Remaining: review/merge PR #10, retarget #11 to `main`, pass CI/Netlify/Codex, and only then roll out migration/Edge to production and run authenticated smoke tests. The next product slice is LLM Router questions/polishing.

Files: `supabase/migrations/20260811131308_ai_document_binary_storage.sql`, `supabase/functions/bright-api/deno.json`, `supabase/functions/server/{index.ts,openapi.ts}`, `supabase/functions/server/services/document-binary{,.test}.ts`, `supabase/tests/{database/document_storage_contract.test.sql,integration/document_binary_storage.test.mjs}`, `frontend/src/features/docs/**`, `frontend/src/app/i18n.ts`, synchronized four-language STATUS/PLAN/REQUIREMENTS/ARCHITECTURE/DEVLOG.

## 2026-08-11 — Staging authenticated Edge acceptance and legacy-key cleanup completed

- Previously, staging migrations and `bright-api` health were green, but remote Auth/tenant acceptance was blocked by the Supabase CLI `v2.112.0` API-key timestamp parser. The integration script was local-stack-only and did not assert cleanup responses.
- `edge_tenant_authorization.test.mjs` now accepts explicit remote URL and modern publishable/secret keys through process environment, sends `apikey` on signed-user Edge requests, avoids treating a non-JWT secret as a Bearer token, and strictly verifies cleanup of two tenants and five Auth users. The local fallback remains.
- When CLI `v2.102.0` unexpectedly printed the staging legacy `service_role` value despite the intended masked read, the value was not written to Git/docs and was invalidated immediately. Staging Edge received modern-key `SB_ANON_KEY`/`SB_SERVICE_ROLE_KEY` overrides and legacy anon/service-role API keys were disabled. Production was untouched; the Edge secret reload produced `bright-api` v2.
- Remote synthetic acceptance passed 8/8 with modern keys. Cleanup passed for 2/2 tenants and 5/5 users; final SQL read-back was `acceptance_tenants=0`, `acceptance_users=0`, with five Auth delete `200` logs and matching Edge statuses.
- `node --check` passed. The local regression could not start because the local Supabase stack was stopped at closeout; the same script's remote path passed completely. Next work: AI Document Assistant PDF/DOCX binary generation and private Storage contract.
- The changes were pushed to `agent/staging-authenticated-edge-acceptance` as `cc31fe7` and draft PR #10 was opened. GitHub CI run `31485875838` succeeded: every `frontend-security-gate` type-check, unit-test, deploy-environment, production audit/build, and bundle/hosting security step was green. Netlify deploy-preview `6a7b047d3150bc00088fc18d` reported `success`; no new browser smoke was required because frontend behavior did not change.

Files/state: `supabase/tests/integration/edge_tenant_authorization.test.mjs`, staging Supabase `piqsyfwrjtormrlenjix` Edge v2 and modern-key overrides/legacy-key disable, synchronized four-language STATUS/PLAN/DEVLOG.

## 2026-08-11 — Completed the PR #9 endpoint-drift hardening main/production closeout

- Pushed PR #9 follow-up `57d4dbc`; GitHub CI run `31481174852` succeeded. Netlify preview `6a7af589fd49aa00082aa968` was ready with build `6a7af589fd49aa00082aa966`, 29 seconds, plugin success, zero secret matches across 87,166 files, staging-only CSP/bundle, and correct noindex/no-store.
- Squash-merged PR #9 as `c00362a`. Main CI run `31481586911` succeeded. Netlify production deploy `6a7af6d8233dfa000954ac24` was ready with build `6a7af6d8233dfa000954ac22`, 32 seconds, plugin success, and zero secret matches across 87,166 files. Production page/Auth/health returned HTTP `200`, Realtime was `OPEN`, and CSP/bundle contained only the production ref with no staging ref.
- Codex re-review was awaited for more than five minutes on the new commit, but GitHub retained only the old `c7a489a` review; no reply/resolve was posted because the user did not separately request it. The finding is covered by 14/14 regressions, mismatch-FAIL/aligned-PASS integration acceptance, remote CI, and preview. The three existing untracked user files were not committed.
- Pushed the final four-language closeout to main as `a648f73`; `[skip netlify]` created no new deployment, so latest production remains `6a7af6d8233dfa000954ac24`. STATUS Git handoff now records main/origin synchronization plus the latest application merge instead of relying on a self-referential HEAD hash.
- Remaining active work: staging ephemeral synthetic Auth/tenant authenticated Edge acceptance and cleanup, then AI Document Assistant PDF/DOCX/Storage.

Files/state: PR #9, merge `c00362a`, CI `31481174852`/`31481586911`, Netlify preview `6a7af589fd49aa00082aa968`, production `6a7af6d8233dfa000954ac24`, synchronized four-language STATUS/PLAN/DEVLOG.

## 2026-08-11 — Closed the PR #9 Codex bundled-endpoint drift finding

- Waiting for Codex before merging PR #9 exposed one more P2 drift case: mere presence of the CSP ref somewhere in the bundle was insufficient because optional `VITE_SUPABASE_URL`/`VITE_API_BASE_URL` could point to another Supabase project endpoint.
- `security-artifacts.mjs` extracts every 20-character project ref from bundled HTTPS/WSS Supabase endpoints, including escaped URL strings. The security gate verifies that the generated CSP ref exists in the bundle and that every detected runtime endpoint ref equals that CSP ref. Two regression tests bring deployment/security environment tests to 14/14.
- Node 22.18 acceptance: with a mismatched synthetic API project, the non-default-mode 3700-module build passed and the security gate failed as expected; after aligning the fixture with the CSP project, the 3700-module build and 10-file security gate passed. TypeScript passed and the Vitest baseline remains 23/23 files and 108/108 tests. The temporary env fixture was deleted. Remaining work: push the follow-up commit to PR #9, rerun CI/preview, wait for Codex re-review, then merge and production-smoke.

Files: `frontend/scripts/security-artifacts.mjs`, `frontend/scripts/security-artifacts.node.mjs`, `frontend/scripts/security-check.mjs`, `frontend/package.json`, synchronized four-language STATUS/DEVLOG.

## 2026-08-11 — Fixed the PR #8 Codex mode and STATUS follow-ups

- After PR #8 merged as `e2b3e78` and shipped to production, Codex reported two valid findings: a non-default `vite build --mode ...` value is not propagated automatically to standalone `security:check`, and canonical STATUS still described the hotfix as uncommitted.
- The security gate no longer guesses env/mode again. It extracts one matching HTTPS/WSS 20-character Supabase ref from generated `_headers` CSP and verifies that the same ref exists in the build bundle, comparing generated artifacts for every Vite mode. STATUS no longer uses the transient “uncommitted” statement and now records the PR #8 merge state.
- Node 22.18 verification: custom `.env.codex-mode-regression` with shell `VITE_*` unset drove a 3700-module non-default-mode build PASS; standalone security gate with `MODE` unset checked 10 files and PASS; environment tests 12/12, TypeScript PASS, Vitest 23/23 files and 108/108 tests PASS. The first gate run showed that minification did not preserve the full URL contiguously; comparison was corrected to the exact 20-character ref and rerun green. The temporary env file was deleted. Remaining work: follow-up branch/PR CI, preview, merge, and production smoke test.

Files: `frontend/scripts/security-check.mjs`, synchronized four-language STATUS/PLAN/DEVLOG.

## 2026-08-11 — Fixed the Vite `.env` CSP finding from the PR #7 Codex review

- The post-merge Codex review on PR #7 identified one P2 issue: Vite loaded application `.env` values into `import.meta.env`, while the build-time CSP plugin and standalone security gate read only `process.env`. The documented local `frontend/.env` workflow could therefore fail the build even with valid application config. Netlify production/preview were unaffected because they provide shell environment variables.
- A shared `vite-environment.mjs` now reads mode-aware Vite env files through `loadEnv` while preserving runtime environment precedence. Both `vite.config.ts` and `security-check.mjs` use the same resolved project ref. Two regression tests cover local `.env` fallback and runtime precedence, bringing environment tests to 12/12.
- Verification: TypeScript PASS; Vitest 23/23 files and 108/108 tests PASS; with shell `VITE_*` values unset, a temporary `.env.codex-review-test` alone drove a 3700-module build PASS and the 10-file build/Netlify security gate PASS. The temporary env file was deleted after the test and no credential was logged. Remaining work: ship the hotfix through branch/PR CI and Netlify preview.

Files: `frontend/vite.config.ts`, `frontend/scripts/security-check.mjs`, `frontend/scripts/vite-environment.mjs`, `frontend/scripts/vite-environment.node.mjs`, `frontend/package.json`, synchronized four-language STATUS/PLAN/DEVLOG.

## 2026-08-11 — Shipped Netlify/Supabase isolation to production through PR #7

- Committed and pushed the isolation work as `4a29773` on `agent/netlify-supabase-environment-isolation` and opened PR #7. GitHub Actions PR run `31478289472` succeeded. Netlify deploy-preview `6a7aec950715d300093248d8` was ready with build `6a7aec950715d300093248d6`, plugin success, and zero normal/enhanced secret matches across 87,162 scanned files.
- Preview smoke test: page/Auth/health HTTP `200`, Realtime `OPEN`; CSP and JavaScript bundle contained the staging ref and not the production ref; `noindex/no-store` headers were correct. PR #7 was squash-merged into `main` as `3fb1592`.
- Main CI run `31478554989` succeeded. Netlify production deploy `6a7aed68abe8a70008108596` was ready with build `6a7aed68abe8a70008108594`, 43 seconds, plugin success, and zero secret matches across 87,162 files. Production page/Auth/health returned HTTP `200`, Realtime was `OPEN`, and CSP/bundle contained only the production ref with no staging ref. Vercel created zero deployments during the merge window, confirming that the disconnected Git integration did not restart.
- Remaining work: Supabase CLI v2.112 cannot parse the `projects api-keys` metadata timestamp, so ephemeral synthetic Auth/tenant authenticated Edge acceptance and cleanup in staging remain a separate active item. The three existing untracked user files were not committed.

Files/state: PR #7, commit `3fb1592`, GitHub CI `31478289472`/`31478554989`, Netlify preview `6a7aec950715d300093248d8`, production `6a7aed68abe8a70008108596`, synchronized four-language STATUS/PLAN/DEVLOG.

## 2026-08-11 — Netlify/Supabase environment isolation decision and fail-closed guard prepared

- The audit confirmed that the repository has no Vercel config/dependency, while an external Vercel project still has a Git integration. Netlify frontend Supabase values for `production`, `deploy-preview`, `branch-deploy`, and `dev` all pointed to the same production project, so a PR preview could reach the production Auth/API/Realtime/data boundary. The Supabase organization is on Free with no Branching; production was healthy and no separate staging project existed. No credential was written to documentation or logs.
- The delivery boundary is now explicit: GitHub -> Netlify is the only active hosting path and Vercel is not an active runtime/preview/deployment platform. Netlify `production` accepts only the approved production Supabase ref; `deploy-preview`/`branch-deploy`/`dev` must use a separate non-production ref. A separate staging project, versioned migrations, and synthetic-only test data replace Supabase Branching on Free.
- `validate-deploy-environment.mjs` fails closed on Netlify context, 20-character project ref, modern publishable-key format, optional Supabase URL, and `bright-api` endpoint mismatch without logging values. Ten Node regression tests were added. Netlify runs the guard before the build. Vite generates CSP from the selected project ref while preserving preview `noindex/no-store`; CI and the security gate enforce the contract.
- Verification: deployment guard `10/10` PASS; Vitest `23/23` files and `108/108` tests PASS; TypeScript PASS; production build with a synthetic 20-character non-production ref passed across `3700` modules; security gate checked `10` build/Netlify files and passed. The first run exposed a Node-test/Vitest glob collision and an invalid-length CI fixture; both were corrected before the full green run. Remote GitHub CI/Netlify deployment has not run yet.
- The user received the `$0/month` Supabase project cost and gave separate two-step confirmation. `AI Business Concierge Staging` (`piqsyfwrjtormrlenjix`) was created in `ap-southeast-1`: `ACTIVE_HEALTHY`, 32/32 tracked migrations applied, `bright-api` v1 ACTIVE, real health `200`. Security advisor errors `0`, known `vector` public-schema warning `1`, server-only RLS/no-policy infos `11`; Auth settings returned `200` with email autoconfirm false.
- The Netlify connector reported delete/upsert success but returned inventory `[]`; authenticated Netlify CLI showed the envs were absent. Granular builds-only scope is unavailable on Personal, so only browser-public project refs/publishable keys were stored at `All` scope with strict contexts. Authoritative read-back passed 4/4: production -> production and deploy-preview/branch-deploy/dev -> staging; optional URL envs are absent. Raw keys were not logged.
- Staging Auth redirects were restricted to the production Netlify URL, Netlify preview wildcard, and local Vite URLs. The first `config push` exposed CLI local defaults that disabled email confirmation/TOTP and weakened OTP to 6 digits/1 second; explicit config pins immediately restored email confirmation ON, TOTP ON, and 8-digit/1-minute OTP in a second push. Production was untouched.
- After Vercel CLI OAuth, the existing project was linked and its Git integration disconnected with explicit confirmation; read-back reported `gitRepositoryConnected=false`. Project/deployment history was preserved. The CLI-created OIDC `.env.local` and `.vercel` metadata were immediately deleted without reading values; local `.netlify`/`.vercel` metadata paths were added to `.gitignore`.
- Remaining work: authenticated Edge acceptance and cleanup with an ephemeral synthetic Auth/tenant fixture in staging; run GitHub CI and Netlify production/preview smoke tests through a branch/PR. Delete Vercel project/history only after separate destructive confirmation.

Files: `.gitignore`, `.github/workflows/ci.yml`, `netlify.toml`, `supabase/config.toml`, `frontend/package.json`, `frontend/vite.config.ts`, `frontend/scripts/validate-deploy-environment.mjs`, `frontend/scripts/validate-deploy-environment.node.mjs`, `frontend/scripts/security-check.mjs`, four-language `ARCHITECTURE/CONNECTIONS/DEPLOY_SETUP/STATUS/PLAN/DEVLOG`.

## 2026-08-11 — Completed the main push and remote CI closeout for the GHSA exception removal

- Committed and pushed the verified audit gate and synchronized four-language documentation directly to `main` as `1fb6c0c` (`chore: remove obsolete GHSA audit exception [skip netlify]`). Local `main` and `origin/main` align at that commit; the three existing untracked user files were not staged or committed.
- GitHub Actions CI run `31466592524` completed successfully in 57 seconds: install, type-check, unit tests, exception-free production dependency audit, production build, and bundle/hosting security steps all passed. `[skip netlify]` prevented an unnecessary production frontend deploy for the audit/CI script and documentation change.
- The active order is unchanged: decide production/preview environment, secret, and data separation; then continue AI Document Assistant PDF/DOCX/Storage.

Files/state: commit `1fb6c0c`, GitHub CI `31466592524`, synchronized four-language STATUS/DEVLOG.

## 2026-08-11 — Removed the temporary GHSA-qwww metadata exception

- Previously the production audit gate carried an exact-version GHSA-qwww exception through 2026-08-21 because npm/global and upstream React Router advisories disagreed on whether `react-router@7.18.2` was patched. The user and agent independently ran raw `npm audit --omit=dev --json` checks and both received zero total vulnerabilities; the scoped gate also passed without an exception warning, proving that the exception was no longer filtering an advisory.
- Removed the GHSA-qwww allowlist, exact lockfile-version check, review deadline/evidence metadata, and exception-warning path from `frontend/scripts/audit-production.mjs`. The gate remains fail-closed on network/API/JSON failures and now blocks every high/critical advisory without exceptions. Dependencies and the lockfile were unchanged.
- Verification: raw production audit — zero info/low/moderate/high/critical vulnerabilities and 233 production dependencies; after removal, `npm run audit:production` PASS — zero high/critical; `npm run typecheck` PASS; Vitest with synthetic non-secret publishable env PASS — 23/23 files and 108/108 tests; production build PASS — 3700 modules; security gate PASS — 9 build/Netlify files; `git diff --check` PASS. The first test run without env values stopped after 13 files/56 passing tests with 10 suites failing on the intended config fail-fast; the complete run was repeated with the synthetic env.
- Remaining active order: decide production/preview environment, secret, and data separation; then continue AI Document Assistant PDF/DOCX/Storage.

Files: `frontend/scripts/audit-production.mjs`, `docs/STATUS.md`, `docs/PLAN.md`, and synchronized four-language `DEVLOG/STATUS/PLAN`.

## 2026-08-11 — Company Dashboard authenticated dark-mode visual acceptance completed

- Previously the Business Status inverse markup was protected by a unit test and shared-token browser acceptance on the landing page, but the authenticated Company Dashboard visual recheck remained open because the agent had no production credential. The user signed into a visible agent-browser window with a Leader account; credential values were never given to or logged by the agent.
- Production `/app` opened the authenticated Leader dashboard; the HTML class and computed `color-scheme` were `dark`, and the theme toggle offered Light mode. The Business Status section background was `rgb(17,19,24)`; title/percentage text was `rgb(244,243,239)` at `16.73:1`; all 6 muted items used 65% inverse foreground at `7.5:1`; the green success signal was `rgb(74,222,128)` at `10.66:1`. The SVG background track is decorative at 20% inverse; the green arc and numeric/status text independently convey state.
- All 12 direct text nodes stayed inside the section: out-of-bounds 0, overlaps 0. The section fit the viewport, page horizontal overflow was 0, and browser console errors were 0. Targeted screenshot review confirmed every title, update, status, department label, and percentage is readable.
- After verification, the test browser session was signed out through the UI and the `/login` redirect was confirmed. Screenshots containing private dashboard data were not committed and were deleted from local temp storage. No application code changed; the completed dashboard visual item was removed from the active PLAN.
- Next active work: re-review the GHSA-qwww metadata exception by 2026-08-21, decide production/preview environment separation, then AI Document Assistant PDF/DOCX/Storage.

Files/state: synchronized four-language STATUS/PLAN/DEVLOG; authenticated production browser runtime. Application code unchanged.

## 2026-08-11 — Main closeout CI and docs-only production state verified

- The Codex P1 closeout and final rollout evidence were pushed directly to `main` in docs-only commit `f9152c6`. Main GitHub CI run `31462960098` passed in 58s; type-check, 108/108 unit tests, production dependency audit, build, and bundle/hosting security steps were green.
- The push created an automatic docs-only Netlify production deploy: deploy `6a7ab804ea3f550008240f11`, build `6a7ab804ea3f550008240f0f`, ready, commit `f9152c6`, published `2026-08-11T05:50:30.225Z`, 32s, plugin success; 0 normal/enhanced secret matches across 87,160 files.
- The latest production bundle was rechecked: 1 modern publishable key, 0 JWT-like legacy keys, no legacy env name, format guard present; Auth `200`, Realtime `OPEN`, and zero console errors/Vite overlay/overflow. The next documentation commit uses Netlify's `[skip netlify]` commit marker to avoid another unnecessary production rebuild cycle.

Files/state: `f9152c6`, GitHub CI `31462960098`, Netlify `6a7ab804ea3f550008240f11`, synchronized four-language STATUS/DEVLOG.

## 2026-08-11 — PR #6 merge, Codex P1 closeout, and final no-fallback deploy completed

- No-fallback code and synchronized four-language docs were pushed as commit `85cb241` on `agent/remove-legacy-supabase-anon-fallback`. Draft PR #6 was marked ready; GitHub `frontend-security-gate` run `31461980468` passed in 48s, Netlify preview `6a7ab3ed99861d0008a32837` was ready, and Vercel deployment `EPxGDaLxfNeKnHPKfwsUzxp7sZfd` was ready. PR #6 was squash-merged into `main` as `2b71a4990e6cdba5c822379821c27816b6854185`.
- A post-merge Codex review reported one unresolved P1 thread: canonical PLAN/STATUS/DEVLOG still listed commit as a next step after the commit existed and omitted its identifier. The finding is valid; this append-only entry and synchronized STATUS/PLAN closeout record commit/PR/CI/deploy IDs and remove the completed item from the active plan. No reply or resolution was written because the user did not request that GitHub write.
- A clean tracked snapshot of the merge commit was manually deployed to production. The first sandboxed attempt failed with npm-registry DNS `ENOTFOUND`; the same command succeeded with approved network access. Netlify deploy `6a7ab5474835d660f21249cd`, build `6a7ab5464835d660f21249cb`, ready, published `2026-08-11T05:39:38.297Z`, 82s, plugin success; 0 normal/enhanced secret matches across 87,160 files.
- Production browser acceptance: 2 scripts, 1 modern publishable key, 0 JWT-like legacy keys, no `VITE_SUPABASE_ANON_KEY` name, and the `sb_publishable_...` format guard present; Auth settings HTTP `200`, Realtime WebSocket `OPEN`. Login rendered meaningful content with zero console errors, Vite overlay, or horizontal overflow.
- Next active work: authenticated production dark-mode visual recheck of the Company Dashboard Business Status panel; re-review the GHSA-qwww metadata exception by 2026-08-21; then AI Document Assistant PDF/DOCX/Storage.

Files/state: PR #6, `frontend/src/app/config.ts`, `frontend/src/app/__tests__/config.test.ts`, `frontend/src/env.d.ts`, synchronized four-language STATUS/PLAN/DEVLOG/FIRST_PUSH, Netlify production env/deploy.

## 2026-08-11 — Supabase publishable-key production handoff completed; source publish prepared

- Previously the frontend preferred the publishable key but Netlify had no modern env and production used the legacy anon fallback. An active modern `sb_publishable_...` production key was verified without logging its value, then `VITE_SUPABASE_PUBLISHABLE_KEY` was configured as a public build variable across the Personal-plan scopes/context.
- A clean tracked `main` snapshot was deployed to Netlify production: deploy `6a7a9c1ec552d009a42c6f97`, build `6a7a9c1ec552d009a42c6f95`, `ready`, published `2026-08-11T03:51:28.742Z`, 33s, plugin `success`, 0 secret matches across 87,160 files. The bundle contained one modern-key prefix and zero project legacy JWTs; Auth settings returned HTTP `200`, Realtime WebSocket reached `OPEN`, and login had zero console/Vite-overlay errors and zero horizontal overflow.
- After rollout verification, only Netlify's `VITE_SUPABASE_ANON_KEY` frontend env was deleted and the modern publishable env remained. The Supabase legacy API key itself was not revoked. `config.ts` now accepts only `VITE_SUPABASE_PUBLISHABLE_KEY` and fail-fast validates the `sb_publishable_` format; the legacy env type/fallback and fallback test were removed, with a negative contract test added. Four-language `FIRST_PUSH` guidance now names the modern key.
- Verification: targeted config 3/3 tests PASS; TypeScript PASS; Vitest 23/23 files and 108/108 tests PASS with a non-secret modern test env; production build of 3700 modules PASS; 9-file security gate PASS; `git diff --check` PASS. The first full run, without a modern local env, passed 13 suites/56 tests and stopped 10 suites at the intended config fail-fast; the private local env was not changed.
- Source and docs are on local branch `agent/remove-legacy-supabase-anon-fallback`. The first sandboxed `gh auth status` reported an invalid token; after the user's login, a system-keyring check verified the `sherzot` account and `repo/workflow` scopes. First next action: explicit stage/commit/push/PR, CI, and final bundle/Auth/Realtime recheck.

Files/state: `frontend/src/app/config.ts`, `frontend/src/app/__tests__/config.test.ts`, `frontend/src/env.d.ts`, `docs/FIRST_PUSH.md`, synchronized four-language STATUS/PLAN/DEVLOG/FIRST_PUSH, Netlify env and production deploy.

## 2026-08-10 — Inverse contrast hotfixes shipped to production

- PR #4's DEVLOG-closeout Codex finding was addressed by the four-language docs commit in PR #5. PR #5's only P1 Codex finding requested concrete green-gate identifiers; the GitHub run, Netlify preview, and Vercel deployment IDs were added to STATUS/DEVLOG and pushed to `main` as `67ab618`. No GitHub threads were replied to or resolved.
- The landing fix was squash-merged as PR #4 `700483d`; the Company Dashboard fix/test/docs as PR #5 `2466200`. Netlify production deploy `6a79e664a453161423131204` is ready, build `6a79e664a453161423131202`, published at `2026-08-10T14:56:55.975Z`, deploy time 81s, plugin state success; 0 secret matches in 87,160 scanned files.
- Production browser dark mode found all 6/6 Why Us reasons with title `rgb(244,243,239)`, 65% inverse-foreground descriptions, background `rgb(17,19,24)`, overflow 0, no console/Vite-overlay errors, and meaningful page content.
- Company Dashboard code is in the production bundle and the 23/23-file, 108/108-test baseline is green. Without credentials, the authenticated Business Status panel was not opened by the agent browser. First next action: user visual recheck in production dark mode, then continue the publishable-key handoff.

Files/state: PR #4/PR #5 frontend fixes, frontend deploy source `67ab618`, Netlify production deploy, and synchronized four-language STATUS/PLAN/DEVLOG.

## 2026-08-10 — Landing and Company Dashboard inverse contrast fixed

- The user confirmed the previous authenticated production smoke tests for Leader Company Profile and the Super Admin dashboard passed.
- The six Why Us reason titles/descriptions used the theme-dependent `background` token inside a fixed dark inverse panel, so dark mode made the copy blend into the surface. Titles now use `--editorial-inverse-fg` and descriptions use `editorial-inverse-muted`; `c59ed82`/PR #4 was merged into `main` as `700483d`.
- The same pattern affected the Company Dashboard Business Status heading, timestamp, status, department labels/percentages, and SVG track. They now follow the inverse foreground/muted contract, with a new `DashboardPage` regression test rejecting `text-background` inside the panel (`4184ddb`, PR #5).
- The only unresolved P1 Codex thread on PR #4 requested the mandatory DEVLOG closeout; this synchronized four-language DEVLOG/STATUS/PLAN update addresses it without another behavior change.
- Verification: Node `22.18.0` TypeScript PASS; Vitest 23/23 files and 108/108 tests PASS; production build PASS (3700 modules); 9-file security gate and `git diff --check` PASS. Browser dark/light checks found all 6/6 reasons with title `rgb(244,243,239)`, 65% inverse-muted descriptions, background `rgb(17,19,24)`, overflow 0, and no console/Vite-overlay errors. Screenshot: `/private/tmp/abc-why-us-dark.png`.
- The authenticated dashboard browser flow was not repeated without credentials; the shared token is verified in the browser and dashboard markup is covered by the new test. PR #5 code-only GitHub run `31399285836` and final docs run `31399751738` succeeded; Netlify code preview `6a79e27ae3c42e00088ffd45` was ready, latest docs-only deploy `6a79e3b03648850008d64852` was canceled, and final Vercel deployment `Cg6Bt5HG1JJrGvwzDYaJqokQQU2q` was ready. PR #5 merged into `main` as `2466200`. Next: Netlify production deploy and user dark-mode smoke test.

Files: WhyUsSection, DashboardPage and its regression test, plus synchronized four-language STATUS/PLAN/DEVLOG.

## 2026-08-10 — PR #3 review hotfix and production rollout completed

- The `agent/fix-landing-localization-copy` changes were committed/pushed as `be047c4`; after GitHub Actions run `31393176016` passed, PR #3 was squash-merged into `main` as `79be466`.
- Both Codex P2 review findings were verified. The global form-padding rule overrode the left inset of icon-bearing `pl-8` inputs, crowding Admin Audit and Knowledge Base search placeholders; a `32px` `pl-8` override was added and pushed directly to `main` as `aee6692`. This closeout also replaces the stale STATUS/PLAN “local/deploy pending” state.
- Supabase `bright-api` was deployed as version 75 (`ACTIVE`, `verify_jwt=false`). Netlify production hotfix deploy `6a79d69c9aa5a6bcf326e83c` became ready and was published at 2026-08-10T13:50:02.498Z.
- Verification: Node `22.18.0` TypeScript PASS; Vitest 22/22 files and 107/107 tests PASS; production build PASS (3700 modules); 9-file build/Netlify security gate PASS; `git diff --check` PASS. Local browser computed `input.pl-8` padding was 32px left, 16px right, 12px top, with no overlay/page error/overflow. Production showed the corrected Uzbek copy, no obsolete Chinese/Turkish/Korean copy, zero overflow, 32px `pl-8` left padding, and no console/page errors. Unauthenticated `/admin` safely redirected to `/login`.
- Production Edge health returned HTTP `200` with `{"status":"ok"}`. Leader Company Profile and Super Admin dashboard authenticated flows were not exercised because user credentials were unavailable; the first next action is a two-role production smoke test.

Files: `frontend/src/styles/editorial.css` and synchronized four-language STATUS/PLAN/DEVLOG files.

## 2026-08-10 — Localization, form/hover contrast, and dashboard regressions fixed

- Verified PR #2 merged into `main` as `65abe2f`; work was completed on local branch `agent/fix-landing-localization-copy` while preserving the three pre-existing untracked user files.
- Proofread all four landing locales. Fixed mixed-script Uzbek `Nimalар avtomatlashadi?`, aligned international-company copy/stat/pricing labels to the only supported languages—Uzbek, Russian, English, and Japanese—and removed Chinese/Turkish/Korean language claims.
- Centralized form insets (16 px horizontal, 12 px vertical), 8 px label spacing, and 44 px shared controls while retaining icon offsets. Mapped solid light hover utilities to dark neutral/brand/status tokens.
- Fixed Company Profile GET/PATCH calls that omitted `tenantId`, and therefore `X-Tenant-Id`, causing `Tenant context topilmadi.`; the same Employee Detail pattern was repaired.
- Fixed the Super Admin crash: Edge returned nested AI costs as `cost`, while the UI read `cost_usd`. Edge now emits the canonical name and the frontend normalizes legacy/partial responses to finite values. Added an `/admin` route error fallback without production stack disclosure.
- Verification: Node `22.18.0` TypeScript passed; Vitest 22/22 files and 107/107 tests passed; production build passed (3700 modules); the 9-file security gate and `git diff --check` passed. Browser acceptance covered 4/4 desktop locales and 390×844 Uzbek mobile with zero horizontal overflow/page errors; dark login padding measured `12/16/12/16` and `12/44/12/16`, with readable dark hover colors.
- Local `deno` is unavailable, so a separate Edge Deno typecheck was not run. Changes remain uncommitted/unpushed/undeployed. Next: review/commit/push, pass CI, deploy frontend and `bright-api`, then production-smoke Company Profile as Leader and Super Admin login.

Files: landing i18n/tests; editorial/theme and shared controls; tenant/employee APIs and tests; admin API/tests and route fallback; canonical Edge server; synchronized four-language STATUS/PLAN/DEVLOG.

## 2026-08-08 — Hero typography and form spacing refined

- Lowered the LP hero headline max-size again, relaxed tracking toward normal, and increased line-height; the long Uzbek headline now renders as a softer, readable three-line composition in the browser screenshot.
- Added a 6px breathing gap between global labels and adjacent inputs/selects/textareas; contact-form computed styles showed no label/control overlap.
- Agent-browser visual smoke check: landing and contact routes rendered meaningful content with no Vite overlay.

## 2026-08-08 — Visual consolidation and title-scale refinement

- Strengthened the Portfolio-inspired visual rule across product/admin/HR surfaces: decorative purple/pink colors now resolve to the semantic blue/neutral palette, and notification/template/HR signal emoji were replaced with Lucide icons.
- Reduced the landing hero headline and editorial title scale so long Uzbek hero copy is lighter and easier to scan in the first viewport.
- Relaxed global tracking and line-height so title and paragraph text no longer feels cramped.
- TypeScript and targeted landing/docs tests: `PASS`.

## 2026-08-08 — PR #2 review comments addressed

- Fixed dark-system contrast feedback: editorial inverse surfaces and headers now use theme-independent `#111318`/`#f4f3ef` tokens, preserving readable contact/register/auth content.
- Added the landing `Explore system` CTA to `landingI18n` for Uzbek, Russian, English, and Japanese.
- Corrected the canonical `STATUS.md` browser/commit pending contradiction and synchronized all four translations.
- Browser regression passed for dark contact inverse background/header, form content, and no overflow; Russian and Japanese locale-switch CTA text was verified.
- Full regression passed: 21/21 test files, 101/101 tests, production build, 9-file security gate, and `git diff --check`.

---

## 2026-08-08 — Redesign commit, push, and preview CI completed

- Committed the Portfolio-inspired redesign as `83bc7e0` (`feat: redesign frontend in portfolio style`) and pushed `agent/portfolio-inspired-redesign` to `origin`.
- Opened PR #2: https://github.com/sherzot/ai-business-concierge/pull/2
- GitHub `frontend-security-gate` run `31240118332` passed; Vercel preview passed; Netlify Deploy Preview `https://deploy-preview-2--ai-business-concierge1.netlify.app` is ready.
- The PR is not merged to `main` and no production deployment was performed. Next active work: the Netlify publishable-key handoff, then Document Assistant PDF/DOCX/Storage.

---

## 2026-08-08 — Portfolio-inspired full frontend redesign completed locally

- Adapted the warm canvas, black typography, single Sher-blue accent, divider-led composition, and restrained motion language of `sherzot/Portfolio` to the product without copying its code.
- Added global editorial tokens/primitives, a reusable brand mark/lockup, and a product operational-system SVG. Light/dark themes, reduced motion, and focus-visible behavior remain supported.
- Redesigned landing, contact/company registration, all auth flows, product shell/dashboard, Inbox, Tasks, Docs, Settings, and admin shell. A compatibility layer aligns remaining legacy feature surfaces with the warm/ink/blue system.
- Consolidated repeated auth layouts into `AuthShell` and improved public-form label associations and password-toggle aria labels.
- Verification passed: `git diff --check`, TypeScript, 21/21 test files and 101/101 tests, production build, 9-file security gate, and production dependency audit with 0 high/critical findings.
- Known non-blocking build warnings remain: ~1.76 MB main chunk, mixed `supabase.ts` imports, and stale Browserslist data.
- Installed the `agent-browser` Chrome runtime and completed browser acceptance: desktop landing, mobile landing, login, forgot-password, and contact routes rendered meaningful content with no error overlay, browser errors, or horizontal overflow. Annotated screenshots are saved at `/private/tmp/abc-landing.png`, `/private/tmp/abc-mobile.png`, and `/private/tmp/abc-login.png`.
- A follow-up Vite route smoke check returned `200` with the SPA shell for `/`, `/login`, `/forgot-password`, `/contact`, `/app`, and `/admin`; the server was stopped cleanly.
- Work is local on `agent/portfolio-inspired-redesign`, based on `df42ecf`; it is not committed, pushed, or deployed.

Next: commit/push the finding-free redesign and verify GitHub CI plus Netlify preview, then return to the active publishable-key handoff and Document Assistant work.

---

## 2026-08-08 — Supabase CLI v2.112.0 and fresh local-infra regression

- Selected the official Supabase Homebrew formula with narrowly scoped `brew trust --formula supabase/tap/supabase`. After core Homebrew temporarily installed `v2.111.0`, the official tap upgraded the CLI to `v2.112.0`; no broad tap trust was granted.
- Following official upgrade guidance, deleted the previous local-only data volume without backup. Production schema/data and linked migration history were untouched.
- CLI `v2.112.0` no longer accepts a function name as a positional argument to `functions serve`; local acceptance now serves all functions with `supabase functions serve --no-verify-jwt`.
- The fresh Postgres image exposed an implicit-grant dependency. The core baseline now explicitly grants `service_role` access to backend-managed baseline tables.
- pgTAP now asserts direct `user_tenants` reads fail with PostgreSQL `42501` instead of expecting an empty result. The Edge fixture separates the new `sb_secret_...` API key from the legacy service-role JWT; no values were logged or documented.
- Verification: fresh replay 32/32 migrations; pgTAP 21/21; real local Auth-token Edge acceptance 8/8; all enabled containers healthy after warm-up; Storage/Auth/Studio HTTP `200`.
- Node `22.18.0`: type-check, 21/21 test files and 101/101 tests, production build, 9-file security gate, and production audit with 0 high/critical all passed. Local services were stopped cleanly.

Files: core baseline grant repair, deterministic pgTAP/Edge fixtures, and synchronized four-language STATUS/PLAN/DEVLOG.

---

## 2026-08-08 — Closed migration-history and local Storage drift

- Current Supabase changelog/CLI docs were checked. Dry runs showed that only the backdated `20250212000000_core_schema_baseline.sql` was missing remotely. Production metadata confirmed all 10 tables, 13 indexes, `pgcrypto`, and RLS expected by the baseline already existed.
- Marked `20250212000000` applied with official migration-history repair instead of rerunning SQL. No schema or business data changed. A follow-up migration list was fully aligned and `db push --linked --dry-run` reported the remote database up to date.
- Relinking refreshed stale local Storage/Auth pins from `v1.58.1/v2.189.0` to the production-aligned `v1.68.1/v2.195.0`, without tracked file changes.
- Started the local stack without exclusions. Initial two-second warm-up probes timed out, but all enabled Supabase containers then became healthy. Storage, Auth, and Studio HTTP smoke tests each returned `200`.
- `imgproxy` remains intentionally stopped because image transformations are not enabled; it will not be added as unused infrastructure. Local services were stopped after verification. Installed CLI is `v2.101.0`; `v2.112.0` is available but did not block validation.

Files/state: production migration history aligned, ignored local linked metadata refreshed, and four-language STATUS/PLAN/DEVLOG synchronized.

---

## 2026-08-08 — Closed the remaining acceptance checks

- A fresh local DB exposed two replay defects: the core tables had only been bootstrapped through `supabase/schema.sql`, outside migration history, and the trigger loop in `20260417134151_phase0_new_tables.sql` had an invalid `EXCEPTION` block.
- Added the idempotent `20250212000000_core_schema_baseline.sql` from a Supabase CLI scaffold, without demo seeds or duplicate policies, and corrected the historical PL/pgSQL block. An empty local DB then replayed all 32 migrations.
- The backdated baseline was not sent to production, so version `20250212000000` is not yet in remote migration history. Before the next production DB migration, use a dry run to choose an idempotent no-op apply or history repair.
- Local DB verification passed: one pgTAP file, 21/21 tests. Because linked/local Storage service versions drifted and its health-check failed, the DB/Auth/Realtime/Edge acceptance stack was started without `storage-api,imgproxy`; file storage was not in this acceptance scope.
- Added `supabase/tests/integration/edge_tenant_authorization.test.mjs`. Using temporary local Auth users and real tokens, all 8 cases passed: active own-tenant; cross-tenant denial; blocked and terminated denial; super-admin cross-tenant/admin access; blocked-admin `403`; employee role `403`.
- No production Auth users or data were created. Fixtures were cleaned up and local services were stopped after the run.

Files: core baseline migration, replay fix in the Phase 0 migration, Edge integration fixture, and synchronized four-language STATUS/PLAN/DEVLOG.

---

## 2026-08-08 — Hardened Realtime tenant isolation and Edge authorization

- A production reproducer found that active members could not read their own `tasks`/`inbox_items` because their policies queried default-deny `user_tenants`; notifications did not check membership status. Historical migrations also left production accepting only `active/terminated` while the application writes `password_pending/password_set/blocked`.
- Applied `20260808014845_harden_realtime_tenant_authorization.sql`: unified all five membership statuses, added `private.is_active_tenant_member()`, limited browser access on tasks/inbox/notifications to SELECT, and required active membership plus an active tenant in every Realtime policy.
- Added a 21-case transactional pgTAP fixture using the real `authenticated` DB role/JWT settings. It checks cross-tenant SELECT, denied INSERT/UPDATE/DELETE, blocked membership, and status compatibility, then rolls back.
- Tenant context now revalidates header/JWT tenant selection in the DB, derives the canonical role from active assignments, preserves active super-admin cross-tenant access, and rejects inactive tenants/members. `/auth/me` filters inactive access, and a shared middleware now requires an active platform-admin assignment and active source tenant for all `/admin/*` routes.
- Deployed `bright-api` v74. Verification: pre-fix pgTAP 4/21 failed, post-fix `ok 21`; metadata confirms a private security-definer helper with empty search path, no anon EXECUTE, and SELECT-only browser grants; health `200`, unauthenticated tenant route `401`, unauthenticated admin route `401`.
- Regression checks passed: type-check, 21/21 files and 101/101 tests, production build, 9-file security gate, and 0 high/critical dependency advisories. Security Advisor added no new errors; known warnings remain for `vector` in `public` and disabled Leaked Password Protection.
- Verification boundary: Docker was unavailable for a fresh local migration run. Real active/blocked/terminated and role-`403` Edge token tests require dedicated non-production Auth fixtures; no temporary production Auth users were created. Netlify publishable-key rollout remains separate.

Files: `supabase/migrations/20260808014845_harden_realtime_tenant_authorization.sql`, `supabase/tests/database/realtime_tenant_isolation.test.sql`, `supabase/functions/server/index.ts`, and synchronized STATUS/PLAN/DEVLOG in four languages.

---

## 2026-08-08 — Closed direct Data API access to risk-scanner data

- Production inventory confirmed RLS on 32/32 public tables, `security_invoker` on 8/8 views, and fixed `search_path` plus no `anon/authenticated` EXECUTE on all 6 `SECURITY DEFINER` functions.
- `risk_scans` and `risk_findings` are used only through the `bright-api` service-role client after a `super_admin/sub_admin` check. Their old `auth.role() = 'authenticated'` SELECT policies nevertheless allowed any signed-in user to read them directly through the Data API.
- Reconciled a harmless migration-name drift by verifying that production `20260724132314_harden_internal_functions_and_rpc_grants` exactly matched local `20260724130852_...`, then renaming the local file to the real production timestamp without altering migration history.
- Created and applied `20260807153154_lock_down_risk_scanner_tables.sql`: removed old policies, revoked all `anon/authenticated` table privileges, retained service-role CRUD, and kept RLS enabled.
- Pushed the security changes as commit `3e383b1`; GitHub CI run `31193931735` completed successfully with every gate green.
- Production verification: both risk tables have RLS enabled, zero policies, no browser-role CRUD grants, and service-role CRUD. Migration histories match; Security Advisor has 0 errors. Known warnings remain for `vector` in `public` and disabled Leaked Password Protection; no-policy tables remain default-deny INFO findings.
- Smoke tests: production health `200`; unauthenticated risk endpoint `401`; anonymous `risk_scans` Data API SELECT with the publishable key also returned `401`.
- Regression verification passed: type-check; 21/21 test files and 101/101 tests; production build; 9-file security gate; 0 unexcepted high/critical dependency advisories.
- Publishable-key commit `35d4b91` has green GitHub run `31192041119` and a ready Netlify production deploy, but the bundle still uses the legacy fallback. Netlify CLI login/env rollout remains; the old env/fallback was not removed.

Next: authenticate Netlify CLI and finish the publishable env/Auth/Realtime rollout; then add cross-tenant fixtures for `user_tenants`-dependent RLS/Realtime and audit every service-role Edge route.

Files: renamed `supabase/migrations/20260724132314_harden_internal_functions_and_rpc_grants.sql`; added `supabase/migrations/20260807153154_lock_down_risk_scanner_tables.sql`; synchronized STATUS/PLAN/DEVLOG in four languages.

---

## 2026-08-08 — Publishable-key frontend contract implemented locally

- Verified current Supabase changelog/migration guidance and the existence of a production `default` publishable key without exposing its value.
- Implemented a zero-downtime frontend contract: `VITE_SUPABASE_PUBLISHABLE_KEY` is primary and legacy anon remains a temporary local/rollback fallback. Edge Function JWT/legacy server variables were intentionally unchanged.
- Netlify reported the additive env upsert as successful, but its subsequent metadata list did not show the key; Netlify state remains `UNKNOWN` until production-bundle verification, and the legacy env was not removed.
- Updated config, env types/example, CI, Supabase client, operational docs, and security regression checks. Removed an unused hardcoded legacy public-key file.
- HR Candidate now requires a real user access token instead of sending a public key as Bearer authorization.
- Verification passed: targeted 5/5 tests; type-check; 21/21 files and 101/101 tests; production build; security check; production audit with zero unexcepted high/critical advisories.
- Next: commit/push, verify GitHub CI and Netlify deploy, inspect the production bundle without emitting credentials, smoke-test Auth/Realtime, then remove the legacy frontend env/fallback.

---

## 2026-08-07 — P0 commits pushed and new CI green

- Pushed local commits `55ec941`, `a088fef`, and `06b5756` to `origin/main` (`730b3bd..06b5756`).
- GitHub Actions `CI` run `31188866507` for commit `06b5756` completed successfully in 42 seconds.
- Every `frontend-security-gate` step passed: checkout, Node setup, clean install, type-check, unit tests, production dependency audit, production build, and bundle/hosting security checks.
- The local and remote P0 baseline is complete. Next: monitor the React Router metadata-exception deadline, then continue with the publishable-key contract and Supabase/RLS authorization audit.

---

## 2026-08-07 — GitHub CLI authentication and remote CI verified

- Restored GitHub CLI authentication for `sherzot` through browser login and the system keyring; no token value was recorded in documentation or logs.
- `gh auth status` confirmed active HTTPS authentication with the required repository/workflow scopes.
- The remote `CI` workflow is active. Run `30099108015` for the latest remote `main` commit `730b3bd` completed successfully.
- Local commits `55ec941` and `a088fef` remain unpushed, so the new dependency audit gate has no remote CI run yet.
- Next: approve the push separately, then monitor the new run until green.

---

## 2026-08-07 — P0 local baseline and dependency audit hardened

### Context and completed work

- Re-established the 2026-07-24 runtime baseline before starting the next security work. The initial shell was using unsupported Node.js 21.4.0 while CI expects Node.js 22.
- Committed the documentation/session lifecycle separately as local commit `55ec941` (`docs: establish project status and session workflow`); it has not been pushed.
- Pinned the frontend to Node.js 22 with `.nvmrc` and `package.json` `engines`.
- Updated `react-router-dom` and `react-router` to `7.18.2`, which the upstream React Router advisory marks patched for the v7 line.
- Added a narrowly scoped `audit:production` gate because npm/global advisory metadata still reports the older range. It fails on audit network/API/JSON errors and every other high/critical advisory; its only exception requires exact `react-router@7.18.2` and expires on 2026-08-21.
- Updated the GitHub Actions production-audit step to use this gate.

### Verification

- Node.js `22.18.0`, npm `11.5.2`: `npm ci` passed.
- Type-check passed; 19/19 test files and 96/96 tests passed.
- `npm run audit:production` passed with zero unexcepted high/critical advisories and explicitly reported the temporary metadata exception.
- A separate unavailable-endpoint check confirmed fail-closed behavior; the audit passed when registry access was restored.
- Raw `npm audit --omit=dev --audit-level=high` still reports two high findings because of stale global metadata; this limitation is recorded and must be reviewed by 2026-08-21.
- Production build passed with the existing non-blocking main-chunk, mixed-import, and Browserslist warnings.
- Security check passed across 9 build/Netlify files.
- Production smoke tests returned `200` for `bright-api` health and `401 TENANT_REQUIRED` for an unauthenticated tenant-protected endpoint.
- Remote GitHub Actions verification is blocked by an invalid local `gh` token. Run `gh auth login -h github.com`, then inspect the remote run.

### Next steps

1. Restore GitHub CLI authentication and verify remote Actions.
2. Decide separately whether to push the local commits.
3. Re-check and remove the React Router metadata exception by 2026-08-21 if upstream metadata is corrected.
4. Continue with the `sb_publishable_...` frontend contract and the browser Supabase/RLS/grant/tenant-isolation audit.

Changed files: `.github/workflows/ci.yml`, `frontend/.nvmrc`, `frontend/package.json`, `frontend/package-lock.json`, `frontend/scripts/audit-production.mjs`, and the four-language STATUS/PLAN/DEVLOG set.

---

## 2026-08-07 — Mandatory documentation lifecycle for every agent session

- Added root `AGENTS.md`, which requires every agent session to start with `README → STATUS → newest DEVLOG → PLAN → git status`.
- Material changes must close with a new DEVLOG entry, STATUS/PLAN updates, conditional Requirements/Roadmap/Architecture updates, and four-language synchronization.
- Read-only reporting does not create unnecessary DEVLOG entries; secrets/private data must never enter docs or logs.
- A task cannot be claimed fully complete while required documentation remains unsynchronized.
- Linked the rule from `docs/README.md` and mirrored the lifecycle in all four `CLAUDE.md` variants.

Documentation/agent rules only; application runtime did not change.

---

## 2026-08-07 — Documentation normalized around explicit sources of truth

- Added `README.md` for document ownership/order and `STATUS.md` as the canonical current handoff.
- Archived the legacy master PLAN and replaced it with a focused P0/P1/P2 active plan.
- Updated ROADMAP and REQUIREMENTS with Done/Partial/Skeleton/Planned states and R-021 for Document Maker binary output.
- Corrected the architecture claim: HR Candidate is a modular scaffold with TODO/stub logic, not a production-ready reference implementation.
- Marked Phase 0/setup documents with historical or operational status warnings.
- Synchronized English, Russian, and Japanese STATUS/PLAN/ROADMAP/REQUIREMENTS documents.

Documentation only: no application, database, function, or hosting configuration changed. Production, CI, tests, and build were not re-run; STATUS explicitly retains the last verified 2026-07-24 runtime snapshot.

---

## 2026-07-24 — Session closeout and next-session handoff

### Completed state
- Completed four-language template/UI coverage and the production migration for all 15 active document templates.
- Fixed light/dark theme contrast, remaining hardcoded strings, locale race conditions, stale modal state, keyboard focus, and icon-button accessibility.
- Hardened Netlify/Supabase boundaries: CSP/HSTS/cache/preview rules, PWA private-response handling, CORS, PostgreSQL-backed AI rate limiting, RPC grants, and internal `SECURITY DEFINER` helpers.
- Removed the unowned `aibizconcierge.uz` domain from all runtime configuration.
- Applied the production migration, deployed `bright-api` v72, and received `200` from the health smoke test.
- Added the frontend security CI gate and fixed its clean-runner failure in commit `730b3bd`.

The CI failure was caused by missing public Supabase test configuration during module initialization, not by a missing production secret. CI now uses non-production placeholders, `actions/checkout@v5`, and `actions/setup-node@v6`.

End-of-session local verification:
- type-check passed;
- 19/19 test files and 96/96 tests passed;
- production build passed;
- security check passed across 9 build/Netlify files;
- local `HEAD` and `origin/main` both pointed to `730b3bd`.

The next session must first confirm that the remote GitHub Actions run is green. Non-blocking build debt remains: a roughly 1.76 MB main JS chunk, mixed static/dynamic import of `supabase.ts`, and stale Browserslist data.

---

## 2026-07-24 — Target architecture: Netlify frontend only, Supabase backend platform

### Decision
- Netlify retains the static React/Vite frontend plus browser-delivery security: HTTPS/CDN, CSP/HSTS, cache rules, and preview protection.
- Supabase owns Auth, PostgreSQL, Edge Functions/backend API, Realtime, future Storage, RLS, authorization, server secrets, rate limiting, and audit logging.
- Browser-to-Supabase direct access remains only for Auth and Realtime.
- All business, admin, AI, Telegram, email, and sensitive operations go through the `bright-api` Supabase Edge Function.

Public browser configuration is expected:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_API_BASE_URL
```

It must never include raw PostgreSQL URLs/passwords, `service_role`, `sb_secret_...`, AI, Telegram, email, payment, or webhook secrets. Those belong only in Supabase project/Edge Function secrets.

Current frontend inspection found no direct `supabase.from`, `rpc`, or Storage business-data calls. Direct Supabase use is limited to Auth, Realtime subscriptions, and retrieving the user access token sent to `bright-api`. A full cookie/BFF proxy is intentionally not selected because it would require rewriting token refresh, reset/OAuth callbacks, CSRF, cookies, CORS, and Realtime without hiding the public endpoint.

### Ordered work for the next session
1. Confirm clean Git/CI baseline and production `bright-api` health/auth behavior.
2. Verify availability of a modern `sb_publishable_...` key and migrate the frontend env contract from legacy anon naming without exposing any server secret.
3. Re-audit browser Supabase calls and keep every non-Auth/Realtime operation behind `bright-api`.
4. Inventory RLS, grants, views, RPCs, tenant isolation, and every service-role authorization boundary.
5. Introduce Storage only with private buckets, tenant/user policies, file validation, and short-lived signed or authenticated access.
6. Tighten CORS, private response caching, per-endpoint quotas/rate limits, audit redaction, and production/preview separation.
7. Run type-check, all tests, production audit/build/security gate, auth/Realtime/locale/theme/template smoke tests, and cross-tenant authorization tests.
8. Apply reviewed migrations, deploy `bright-api`, smoke-test it, deploy the Netlify frontend, and record exact versions/results.

The full file-by-file checklist, acceptance criteria, and safety constraints are maintained in the canonical [Uzbek DEVLOG](../DEVLOG.md).

Manual/platform follow-ups remain: enable Supabase Leaked Password Protection, choose preview protection compatible with the Netlify plan, plan the `vector` extension move separately, verify `TELEGRAM_WEBHOOK_SECRET`, and rotate/revoke keys only after the replacement configuration is deployed and smoke-tested.

---

## 2026-07-24 — Netlify + Supabase security hardening

### Done
- Removed `script-src 'unsafe-inline'` from Netlify CSP and replaced the print popup's inline script with a safe JS callback
- Strengthened HSTS, Permissions Policy, COOP/CORP, MIME/frame/referrer protection, and asset/PWA cache rules
- Stopped caching authenticated API responses in the PWA; preview builds now emit `noindex` and `no-store`
- Removed the unowned `aibizconcierge.uz` domain from runtime CORS/CSP/canonical and email fallbacks
- Moved AI rate limiting from Edge memory to atomic PostgreSQL `check_rate_limit()`; IP/user keys are SHA-256 hashed
- Closed internal `SECURITY DEFINER` RPCs and trigger helpers to `anon`/`authenticated`, and fixed their `search_path`
- Applied the production migration and deployed `bright-api` v72; health smoke test returned `200`
- Updated React Router, Vite, Vitest, and transitive dependencies; full `npm audit` reports 0 vulnerabilities
- Added type-check, 96 unit tests, production audit, build, and bundle/security checks to CI
- Removed stale `frontend/dist.zip` and ignored future `*.zip` artifacts

### Remaining manual platform settings
- Non-production Team Login returned `422` on the Netlify Personal plan
- Supabase Leaked Password Protection must be enabled in the Dashboard
- Moving the `vector` extension out of `public` requires a separate careful migration

---

## 2026-07-24 — Project resumption audit and test suite restored

### Context
The documentation, Git history, and current code were compared. `DEVLOG.md` ended on 2026-06-04, while the latest code commit was from 2026-06-12.

### Done
- Mocked the auth context used by `LandingNavbar` and `HeroSection` in landing tests
- `npm run test:run`: 16/16 test files and 89/89 tests passing
- `npm run build`: production build passing
- Confirmed Phase 1.5 completion, Phase 2 landing work started, and HR Candidate Analysis remains a 501 skeleton
- Confirmed production Supabase `ACTIVE_HEALTHY` and Anthropic/OpenAI/Resend secrets present
- Found missing `TELEGRAM_WEBHOOK_SECRET`; Telegram POST webhook therefore returns 503
- Fixed frontend API fallback from the invalid `server/...` URL to canonical `bright-api/...`
- Started Phase 2 AI Document Maker: 15-template seed migration, template/generate API, dynamic frontend form, and monthly usage limit
- Safely reconciled migration drift by matching local `h003`/`m002` filenames to production history timestamps
- Deployed `h005_match_knowledge_tenant` and the 15-template seed migration to production Supabase
- Deployed `bright-api` v69; health smoke test returned `200`, while the protected template endpoint returned `401` without auth
- Final verification: 17/17 test files, 92/92 tests, and production build passing

### Files
- `frontend/src/features/landing/__tests__/LandingPage.test.tsx`
- `frontend/src/features/docs/`
- `frontend/src/app/config.ts`
- `supabase/functions/server/services/document-generator.ts`
- `supabase/migrations/20260724051655_seed_phase2_document_templates.sql`
- `docs/{DEVLOG,PLAN,ROADMAP,REQUIREMENTS}.md` and translations

---

## 2026-06-12 — Frontend UI, layout, and theme polish

### Context
After the Light/Clean SaaS migration, visual consistency across landing, auth, admin, and company dashboards was refined. This work was committed as `2ae377a` but was missing from the DEVLOG.

### Done
- Updated landing sections and shared theme tokens
- Improved admin/company layouts, sidebar/topbar, and dashboard pages
- Refined login and protected-route UI/navigation states

### Files
- `frontend/src/features/landing/`
- `frontend/src/features/admin/components/AdminLayout.tsx`
- `frontend/src/features/reports/`
- `frontend/src/features/auth/`
- `frontend/src/styles/theme-indigo-slate.css`

---

## 2026-06-04 — Light theme migration completed — push & deploy

### Context
The previous session started the Light/Clean SaaS theme migration but a grep verification found remaining `text-white`, `bg-slate-700/800/900` in: AdminDashboardPage, AdminKnowledgeBasePage, AdminRiskPage, AdminCompaniesPage, AdminContactsPage.

### Done
- `AdminDashboardPage.tsx`: Full rewrite — StatCard values `text-white` → `text-slate-900`, SEV_CONFIG badges from opacity variants to solid light (`bg-red-100 text-red-700`), icon containers `bg-*-500/15` → `bg-*-100`, all dark: variants removed, Refresh button `bg-slate-700` → `bg-white border`, DB status banner `text-emerald-300` → `text-emerald-700`, skeleton bars `bg-slate-200`
- `AdminKnowledgeBasePage.tsx`: Article category/tag badges `bg-slate-700 text-slate-300` → `bg-slate-100 text-slate-600`, question text `text-white` → `text-slate-900`, delete modal `bg-slate-900` → `bg-white`
- `AdminRiskPage.tsx`: Empty state h2 and scanning text `text-white` → `text-slate-900`, "No findings" `text-white` → `text-slate-900`, status filter active button `bg-slate-700` → `bg-indigo-600`
- `AdminCompaniesPage.tsx` + `AdminContactsPage.tsx`: All headings, stat counts, filter tabs, search inputs, skeletons, list items, modals — fully migrated to light palette
- Build check: `✓ built in 3.14s` — no errors
- Git push triggered Netlify deploy

### Files
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (full rewrite)
- `frontend/src/features/admin/pages/AdminKnowledgeBasePage.tsx` (changed)
- `frontend/src/features/admin/pages/AdminRiskPage.tsx` (changed)
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (changed)
- `frontend/src/features/admin/pages/AdminContactsPage.tsx` (changed)

---

## 2026-06-04 — Full migration to Light/Clean Modern SaaS theme

### Context
The app was previously locked to `forcedTheme="dark"`, with all components hand-coded in dark colors. The user requested a full switch to a Light/Clean SaaS aesthetic (Notion/Linear/Vercel style).

### Done
- `AppProviders.tsx`: `forcedTheme="dark"` → `forcedTheme="light"` — all `dark:` Tailwind variants now deactivate
- `LoginPage.tsx`: Complete rewrite — white background, indigo gradient branding panel on left (split layout), white form card
- `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`: Full light rewrites — `bg-slate-50` outer, white card, light inputs
- `SetupAccountPage.tsx`: Outer bg from dark gradient → `bg-slate-50`, LocaleSelect `variant="dark"` → `variant="light"`
- `AdminHealthPage.tsx`: All dark card colors (`bg-slate-800/50`, `border-white/8`, `text-white`) → light (`bg-white`, `border-slate-200`, `text-slate-900`, `shadow-sm`)
- `AdminAIChatPage.tsx`: Chat area, bubbles, input — all converted to light palette
- `AdminAuditPage.tsx`: Action badge colors (`text-emerald-300` → `text-emerald-700`), inputs → `bg-white`, payload area → `bg-slate-100`
- `AdminRiskPage.tsx`: ScoreRing SVG `stroke="#1e293b"` → `stroke="#e2e8f0"`, `text-white` → `text-slate-900`, filter tabs → `bg-slate-100`
- `AdminKnowledgeBasePage.tsx`: All `bg-slate-800 text-white` inputs/selects → `bg-white text-slate-900`, modal → `bg-white`
- `AdminDashboardPage.tsx`: SVG track strokes `#1e293b`/`#334155` → `#e2e8f0`, donut center fill → `white`, SVG text `fill="white"` → `fill="#0f172a"`, empty bars → `#e2e8f0`

### Files
- `frontend/src/app/providers/AppProviders.tsx`
- `frontend/src/features/auth/pages/LoginPage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`, `SetupAccountPage.tsx`
- `frontend/src/features/admin/pages/AdminHealthPage.tsx`, `AdminAIChatPage.tsx`, `AdminAuditPage.tsx`, `AdminRiskPage.tsx`, `AdminKnowledgeBasePage.tsx`, `AdminDashboardPage.tsx`

## 2026-06-04 — Dark Mode & Login Redirect Bug Fixes

### Context
1. Admin panel and dashboard pages appeared with confusing mixed colors — `dark:` Tailwind classes don't apply without a `.dark` parent element. `ThemeProvider` was never added to the app.
2. When a super_admin navigated to LP while logged in and clicked "Login", they were redirected to `/app` instead of `/admin` — the navbar sent them to `/login`, where `currentTenant` could be null.

### Done
- `AppProviders.tsx` — Added `ThemeProvider` from `next-themes` (`attribute="class"`, `defaultTheme="dark"`) — automatically sets `<html class="dark">`, all `dark:` Tailwind classes work correctly
- `LandingNavbar.tsx` — "Login" button now checks auth state: if logged in → `/admin` or `/app`, if not → `/login`
- `HeroSection.tsx` — Same fix applied

### Files
- `frontend/src/app/providers/AppProviders.tsx` (changed)
- `frontend/src/features/landing/components/LandingNavbar.tsx` (changed)
- `frontend/src/features/landing/components/HeroSection.tsx` (changed)

---

## 2026-06-03 — Tasks Mock Data Bug Fix (PATCH 500 error)

### Context
`PATCH /tasks/t-2` → 500 error. When a tenant had no real tasks, `GET /tasks` returned `getMockTasks()` — fake IDs like `t-1`, `t-2`. When the user tried to update one of these "tasks", the non-UUID ID caused a PostgreSQL type error (500).

### Done
- `server/index.ts` — Removed `getMockTasks()` function; `GET /tasks` now returns empty array `[]`
- `bright-api` redeployed (version 68)

### Files
- `supabase/functions/server/index.ts` (changed)

---

## 2026-06-03 — Contact Form & Register Form Bug Fixes (two issues)

### Context
Fixed "Server error" on `/contact` (double `/v1` path bug) and on `/register?token=...` (password validation + error format mismatch). Both tested in production.

### Done

**Bug 1: `/contact` → "Server error" (previous session):**
- `ContactPage.tsx` — local `API_BASE = VITE_API_BASE_URL ?? ""` + `/v1/contact` created double `/v1/contact`. Switched to shared `API_BASE_URL`
- `config.ts` — fallback URL updated to use `server` function name
- `config.toml` — added `[functions.server] verify_jwt = false`
- `bright-api` redeployed

**Bug 2: `/register` → "Server error" (this session):**
- **Root cause:** Backend `password.length < 12` check rejected 8-11 char passwords; frontend read `json?.error?.message` but backend `failure()` returns `json.meta.errors[0].message` → all errors showed as "Server error"
- `server/index.ts:4543` — `password.length < 12` → `< 8`
- `RegisterCompanyPage.tsx` — both error formats now supported
- `RegisterCompanyPage.tsx` — `minLength={8}` added to password input
- `bright-api` redeployed

**Invite email not arriving (unresolved):**
- Cause: `RESEND_API_KEY` not set in Supabase Secrets
- Action needed: `supabase secrets set RESEND_API_KEY=re_xxx` + verify `aibizconcierge.uz` domain in Resend

### Files
- `frontend/src/features/landing/pages/ContactPage.tsx` (changed)
- `frontend/src/features/landing/pages/RegisterCompanyPage.tsx` (changed)
- `frontend/src/app/config.ts` (changed)
- `supabase/config.toml` (changed)
- `supabase/functions/server/index.ts` (changed)

---

## 2026-06-03 — Dark/Light Theme, Admin Sidebar Expansion, Users & AI Stats Pages

### Context
Full dark/light theme support across all dashboards (super_admin and company); admin sidebar reorganized with grouped navigation; super admin can now view all company users; new AI statistics page.

### Done

**Dark/light theme — all dashboards:**
- `AdminLayout.tsx` — fully rewritten: new `NAV_GROUPS` grouped nav structure, full `dark:` variants (sidebar, topbar, nav items, tooltips, avatar, logout)
- `App.tsx` — company dashboard sidebar, topbar, all links, and `NavItem` component updated with `dark:` variants
- All 8 admin pages — mass `dark:` variant replacement applied

**Admin sidebar expansion:**
- Navigation split into groups: Main, Management, Monitoring, Content
- New menu items: **Users** (`/admin/users`), **AI Statistics** (`/admin/ai-stats`)
- `Globe` icon for "Main site", `PanelLeftOpen/Close` for collapse/expand
- Collapsed-mode tooltips render correctly in dark mode

**New admin pages:**
- `AdminUsersPage.tsx` — view all platform users: email, name, company, role (colored badge), status, date; role filters, search, pagination
- `AdminAiStatsPage.tsx` — AI usage analytics: KPI cards, daily bar chart, model breakdown (progress bars), top companies; 7/14/30/60/90 day period selector

**Backend new endpoint:**
- `GET /admin/users` — all `user_tenants` + `profiles` + `tenants` join; super_admin/sub_admin only; limit 500

**Router update:**
- `router.tsx` — added `/admin/users` → `AdminUsersPage`, `/admin/ai-stats` → `AdminAiStatsPage`

**API layer:**
- `adminApi.ts` — added `AdminUser` type and `getAdminUsers()` function

### Files
- `frontend/src/features/admin/components/AdminLayout.tsx` (changed — full rewrite)
- `frontend/src/App.tsx` (changed — dark mode + NavItem)
- `frontend/src/features/admin/pages/AdminUsersPage.tsx` (new)
- `frontend/src/features/admin/pages/AdminAiStatsPage.tsx` (new)
- `frontend/src/features/admin/api/adminApi.ts` (changed — AdminUser + getAdminUsers)
- `frontend/src/app/router.tsx` (changed — new admin routes)
- `supabase/functions/server/index.ts` (changed — GET /admin/users)
- `frontend/src/features/admin/pages/*.tsx` (8 files — dark mode variants)

---

## 2026-06-02 — RBAC, Admin Dashboard, and ULTRA Security Continuation (H-008..H-010)

### Context
Continued from previous session: login redirect bug, role permissions, new admin dashboard panels, and continuation of the ULTRA security audit.

### Done

**Login redirect fixed:**
- `LoginPage.tsx` — `super_admin`/`sub_admin` now redirect to `/admin`, others to `/app`
- `ProtectedLayout.tsx` — admin roles navigating directly to `/app` are redirected back to `/admin`

**RBAC roles expanded:**
- `types.ts` — added `sub_admin`, `company_admin`, `manager` roles
- `index.ts` — `ROLE_ACCESS` map fully defined for all 9 roles:
  - `super_admin`/`sub_admin` — all modules
  - `company_admin` — billing, hr, ai, kb, settings
  - `leader` — reports, inbox, tasks, hr, docs, integrations, settings
  - `hr` — reports, inbox, tasks, hr, docs, settings
  - `accounting` — reports, docs, integrations, billing, settings
  - `department_head`/`manager` — reports, inbox, tasks, docs, settings
  - `employee` — inbox, tasks, settings

**Admin dashboard new panels:**
- `GET /admin/ai-stats` — AI usage statistics endpoint (requests, tokens, cost, by-model, top tenants)
- `AdminDashboardPage.tsx` — 2 new panels:
  - **Security Posture** — visual list of 18 completed fixes (critical/high/medium)
  - **AI Business Analysis** — daily cost chart + model breakdown + top companies

**ULTRA security (continued):**
- **H-008** — Security headers on all API responses: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Content-Security-Policy: default-src 'none'`, `Permissions-Policy`
- **H-009** — Audit logging for admin mutations:
  - `PATCH /admin/tenants/:id/status` → writes `admin.tenant.status_changed`
  - `PATCH /admin/contacts/:id/status` → writes `admin.contact.status_changed`
- **H-010** — Netlify SPA security headers via `netlify.toml` `[[headers]]`:
  - CSP: Supabase and WSS allowed in `connect-src`
  - HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy

**Deployment:** Edge Function deployed via `supabase functions deploy server`.

### Files
- `frontend/src/features/auth/pages/LoginPage.tsx` (changed — login redirect)
- `frontend/src/features/auth/components/ProtectedLayout.tsx` (changed — admin guard)
- `frontend/src/features/auth/types.ts` (changed — new roles)
- `supabase/functions/server/index.ts` (changed — ROLE_ACCESS, ai-stats, H-008, H-009)
- `frontend/src/features/admin/api/adminApi.ts` (changed — AiStats type + getAdminAiStats)
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (changed — 2 new panels)
- `netlify.toml` (changed — H-010 security headers)

---

## 2026-06-02 — Security Hardening: 14 Fixes (commit `fb5bde5`)

### Context
A comprehensive security audit was performed on the system. A total of 14 critical and medium-severity vulnerabilities were identified and resolved.

### Done

**Critical (K):**
- **K-001** `getTenantContext()` — removed unauthenticated `x-tenant-id` header fallback; replaced with JWT + DB membership verification
- **K-002** `/ai/chat` — `system_prompt` parameter rejected (closes prompt injection vector)
- **K-004** `frontend/config.ts` — hardcoded Supabase credentials removed; app throws on startup if env vars are missing
- **K-005** `telegram-bot/index.ts` — `TELEGRAM_WEBHOOK_SECRET` is now mandatory; returns 503 if not set
- **K-006** `docs/DEMO_USERS.md` — demo user passwords removed from documentation

**High (H):**
- **H-001** CORS — wildcard `*` replaced with explicit domains: `aibizconcierge.uz`, `netlify.app`, `localhost`
- **H-002** AI quota — `guardUsage()` + `recordUsage()` wired into `/ai/chat`
- **H-004** `RequireRole.tsx` — new component; `/admin` route now protected with DB-backed role check
- **H-005** `match_knowledge()` — `match_tenant_id` parameter added; tenant isolation enforced at DB level
- **H-006** Resend webhook — signature verification made mandatory; returns 503 if `RESEND_WEBHOOK_SECRET` not set
- **H-007** `apiClient.ts` — anon key fallback removed; throws if no valid auth token

**Medium (M):**
- **M-003** Invite token — new token generated on every resend (previous token invalidated)
- **M-005** Hard-delete — `hr` role removed; only `leader/company_admin/super_admin` may hard-delete
- **M-006** Notifications mark-read — `tenant_id` filter added
- **M-008** Password minimum length raised from 8 → 12 characters (3 locations)

**Manual steps (completed by user ✅):**
- Supabase anon key rotated
- Netlify env vars updated (`VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_ANON_KEY`)
- Demo user passwords updated in Supabase Auth

### Files
- `supabase/functions/server/index.ts` (changed)
- `supabase/functions/server/services/knowledge-base.ts` (changed — H-005)
- `supabase/functions/telegram-bot/index.ts` (changed — K-005)
- `frontend/src/app/config.ts` (changed — K-004)
- `frontend/src/shared/lib/apiClient.ts` (changed — H-007)
- `frontend/src/app/router.tsx` (changed — H-004)
- `frontend/src/features/auth/components/RequireRole.tsx` (new — H-004)
- `docs/DEMO_USERS.md` (changed — K-006)
- `supabase/migrations/20260602000000_h005_match_knowledge_tenant.sql` (new — H-005)

---

## 2026-06-02 — Bug Fixes: AdminRiskPage `color` crash, statusFilter, Netlify Node.js

### Context
After the Risk Scanner page went live, several runtime errors were discovered. Netlify and local builds also produced different asset hashes.

### Done
- **AdminRiskPage `TypeError: Cannot read properties of undefined (reading 'color')`** — root cause: backend `findings` array was missing the `status` field → `STATUS_CONFIG[undefined]` crashed. Fixed:
  - `risk-scan.ts`: added `status: "open"` to every `findings.push()` call
  - `AdminRiskPage.tsx`: added `STATUS_CONFIG[finding.status] ?? STATUS_CONFIG["open"]` fallback
- **`statusFilter` error** — `AdminContactsPage` and `AdminCompaniesPage` were sending `statusFilter` but the API expects `filter`. Fixed.
- **Netlify hash mismatch** — local Node 22 vs Netlify default Node 18 produced different build hashes. Added `NODE_VERSION = "22"` to `netlify.toml`.
- **`frontend/.gitignore`** — committed for the first time, with `dist/` entry.

### Files
- `supabase/functions/server/routes/risk-scan.ts` (changed)
- `frontend/src/features/admin/pages/AdminRiskPage.tsx` (changed)
- `frontend/src/features/admin/pages/AdminContactsPage.tsx` (changed)
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (changed)
- `netlify.toml` (changed)
- `frontend/.gitignore` (new)

---

## 2026-05-30 — B-014 Security Risk Scanner: AdminRiskPage + `POST /risk/scan`

### Context
Super Admin / Sub Admin needed a way to scan the system for security issues in real time and visualize the results.

### Done
- **DB migration** `20260530000000_risk_scanner.sql`:
  - `risk_scans` table — each scan session: `status`, `score`, `critical/high/medium/low_count`, `duration_ms`, `source`
  - `risk_findings` table — individual findings: `severity`, `title`, `description`, `location`, `remediation`, `status`
  - RLS: only `super_admin/sub_admin` can read
- **Backend** `POST /v1/risk/scan` (`routes/risk-scan.ts`):
  - Hybrid mode: static checks + Supabase Advisor API
  - Static checks: CORS config, required env vars, RLS status per table
  - Advisor findings: DB security advisories (missing RLS, un-indexed FKs, etc.)
  - Result saved to `risk_scans` + `risk_findings`; `score` calculated (0–100)
- **Frontend** `AdminRiskPage.tsx` (new):
  - "Start Scan" button with loading state
  - Severity badges: `critical` (red), `high` (orange), `medium` (yellow), `low` (blue)
  - Findings list: title, description, location, remediation
  - Score indicator
- **Router**: `/admin/risk` route added
- **AdminLayout**: "Risk Scanner" sidebar link added

### Files
- `supabase/migrations/20260530000000_risk_scanner.sql` (new)
- `supabase/functions/server/routes/risk-scan.ts` (new)
- `supabase/functions/server/index.ts` (changed — route registered)
- `frontend/src/features/admin/pages/AdminRiskPage.tsx` (new)
- `frontend/src/app/router.tsx` (changed)
- `frontend/src/features/admin/components/AdminLayout.tsx` (changed)

---

## 2026-05-27 — B-005/B-006 DB Performance Indexes + Audit Triggers

### Context
The `tasks`, `inbox_items`, and `documents` tables lacked soft-delete support. Performance indexes were missing for frequently queried tables. Audit log triggers were also absent.

### Done
- **`deleted_at`** column added to `tasks`, `inbox_items`, `documents`
- **Partial indexes** (`WHERE deleted_at IS NULL`) on `tasks`, `inbox_items`, `documents`, `notifications`, `audit_logs`, `request_logs` — active records queried faster
- **Audit log triggers** on `company_info`, `employee_profiles`, `documents`, `tasks` — key mutations automatically written to `audit_logs`

### Files
- `supabase/migrations/20260527105554_b005_b006_optimization.sql` (new)

---

## 2026-05-27 — #8 B-013 OpenAPI/Scalar docs — `GET /docs/api` + `GET /docs`

### Context
The API had no documentation. Interactive API docs were needed for external integrations and frontend developers.

### Done
- `supabase/functions/server/openapi.ts` (new): full OpenAPI 3.1 spec (`OPENAPI_SPEC` const) covering all key endpoints (health, contact, tasks, inbox, employees, KB, audit, analytics) with component schemas (Error, Task, InboxItem, Employee, KbArticle, AuditLog, AnalyticsData)
- `renderScalarHtml(apiJsonUrl)` — returns Scalar CDN HTML page (purple/modern theme)
- `server/index.ts`: added `openapi.ts` import; two routes inside `registerRoutes(prefix)`:
  - `GET ${prefix}/docs/api` → `c.json(OPENAPI_SPEC)` — raw OpenAPI 3.1 JSON
  - `GET ${prefix}/docs` → Scalar HTML UI (dynamic URL, pathname replace)
- Works across all 4 registered prefixes (`BASE_PATH`, `V1_PATH`, `GATEWAY_PREFIX` combinations)

### Files
- `supabase/functions/server/openapi.ts` (new)
- `supabase/functions/server/index.ts` (changed — import + 2 routes)

## 2026-05-27 — #7 Reports/Analytics charts — real DB data

### Context
ReportsPage was using mock data. Real DB aggregation and visualization was needed: task status, 7-day trend, inbox categories, employee stats.

### Done
**Backend (server/index.ts) — `GET /analytics`:**
- Task stats: total, todo, in_progress, done, overdue (with deleted_at IS NULL filter)
- Task trend (7 days): created and done counts per day
- Inbox by category (30 days): JS-side aggregation by category
- Employee stats: total, active, pending, recent_joins (7 days)

**Frontend:**
- `analyticsApi.ts` (new) — typed API client
- `AnalyticsPage.tsx` (new):
  - KPI row: total tasks, overdue, inbox (30d), employees (stagger animation)
  - Task trend → Recharts AreaChart (2 areas: created/done, gradient fill)
  - Task status → Recharts PieChart (donut, 4 colors)
  - Inbox categories → Recharts BarChart (colored bars)
  - Employee stats → 4-box grid
  - Refresh button + loading/error states
- `App.tsx`: `case "analytics"` → `<AnalyticsPage>` added
- `CommandPalette.tsx`: "Analytics" page item added

### Files
- `frontend/src/features/reports/api/analyticsApi.ts` (new)
- `frontend/src/features/reports/pages/AnalyticsPage.tsx` (new)
- `supabase/functions/server/index.ts` (changed)
- `frontend/src/App.tsx` (changed)
- `frontend/src/shared/components/CommandPalette.tsx` (changed)

## 2026-05-27 — #6 PWA manifest — offline shell, home screen install

### Context
The app was only accessible as a browser tab. Mobile devices needed home screen installation and offline shell capability.

### Done
- Installed `vite-plugin-pwa@1.3.0` (devDependency)
- Updated `vite.config.ts`: added `VitePWA()` plugin with `registerType: 'autoUpdate'`
  - Web App Manifest: name/short_name, theme_color `#4f46e5`, standalone display, start_url `/app`
  - Icons: `icon.svg` (any/maskable) + `favicon.ico`
  - Workbox: precache JS/CSS/HTML/ICO/SVG/WOFF2; runtime cache for API URLs (StaleWhileRevalidate, 5min)
- `frontend/public/icon.svg` (new) — indigo hexagon SVG app icon
- `frontend/index.html`: theme-color updated, apple-touch-icon, apple PWA meta tags
- Build output: `dist/sw.js` + `dist/workbox-*.js` (9 precache entries, 1.7MB)

### Files
- `frontend/vite.config.ts` (changed)
- `frontend/public/icon.svg` (new)
- `frontend/index.html` (changed)
- `frontend/package.json` (changed — vite-plugin-pwa devDep)

## 2026-05-27 — #5 Admin Audit Log viewer + backend

### Context
The B-006 trigger fills the audit_logs table automatically. Super admins needed a way to view, filter, and inspect this data.

### Done
- `GET /admin/audit` backend endpoint (server/index.ts):
  - super_admin / sub_admin role check
  - Query params: tenant_id, entity_type, action, from, to, limit (max 500)
  - Returns audit_logs ordered by created_at desc
- `frontend/src/features/admin/api/auditApi.ts` (new) — typed API client
- `frontend/src/features/admin/pages/AdminAuditPage.tsx` (new):
  - Header: total/displayed count + refresh button
  - Filters: search, entity_type select, action select, from/to date
  - Stagger-animated accordion list
  - Each row: action badge (create/update/delete colored), entity_type, event_type, short user_id, timestamp
  - Expanded: full payload JSON (pre formatted)
- Router: `/admin/audit` route added
- AdminLayout: `Shield` icon + "Audit Log" nav item (between Knowledge Base and Health)

### Files
- `frontend/src/features/admin/api/auditApi.ts` (new)
- `frontend/src/features/admin/pages/AdminAuditPage.tsx` (new)
- `frontend/src/app/router.tsx` (changed)
- `frontend/src/features/admin/components/AdminLayout.tsx` (changed)
- `supabase/functions/server/index.ts` (changed)

## 2026-05-27 — #4 Admin Knowledge Base CRUD UI + backend

### Context
The `knowledge_base` table (pgvector + semantic search) already existed, but there was no admin UI or CRUD API to manage it. Super admins needed to add, edit, delete, and toggle articles.

### Done

**Backend (server/index.ts):**
- `GET /admin/kb` — list articles (locale, category, is_active filters)
- `POST /admin/kb` — create article (locale+category+question+answer required)
- `PUT /admin/kb/:id` — update article (allowed fields)
- `DELETE /admin/kb/:id` — delete article
- All endpoints verify super_admin / sub_admin role

**Frontend:**
- `frontend/src/features/admin/api/kbApi.ts` (new) — typed API client
- `frontend/src/features/admin/pages/AdminKnowledgeBasePage.tsx` (new):
  - Header: article/active count + refresh + "New article" button
  - Filters: search input + locale select + category select
  - Stagger-animated accordion list
  - Each row: locale/category badge, truncated question, tags, toggle switch
  - Expanded: full answer + Edit/Delete buttons
  - `FormModal` — 2-col locale+category, question input, answer textarea, tags, is_active toggle
  - Delete confirm modal
- `frontend/src/app/router.tsx` — added `/admin/knowledge-base` route
- `frontend/src/features/admin/components/AdminLayout.tsx` — BookOpen icon + "Knowledge Base" nav item

### Files
- `frontend/src/features/admin/api/kbApi.ts` (new)
- `frontend/src/features/admin/pages/AdminKnowledgeBasePage.tsx` (new)
- `frontend/src/app/router.tsx` (changed)
- `frontend/src/features/admin/components/AdminLayout.tsx` (changed)
- `supabase/functions/server/index.ts` (changed)

## 2026-05-27 — #3 Framer-motion micro-animations

### Context
Framer-motion was already installed but only used for page transitions. KPI cards, employee table rows, and company cards needed hover/stagger animations.

### Done
- `shared/lib/motionVariants.ts` new file — shared variants:
  - `fadeInUp` — page section entrance
  - `staggerContainer` + `staggerItem` — list stagger (55ms interval)
  - `cardHover` — scale 1.02 + indigo box-shadow on hover
  - `rowHover` — subtle table row hover
- `DashboardPage.tsx`: KPI grid → `motion.div` (staggerContainer); each `KpiCard` → `motion.div` (staggerItem + cardHover)
- `EmployeesPage.tsx`: `<tbody>` → `<motion.tbody>` (staggerContainer); each `<tr>` → `<motion.tr>` (staggerItem, 55ms stagger)
- `AdminCompaniesPage.tsx`: cards wrapper → `motion.div` (staggerContainer); each card → `motion.div` (staggerItem + indigo border hover)

### Files
- `frontend/src/shared/lib/motionVariants.ts` (new)
- `frontend/src/features/reports/pages/DashboardPage.tsx` (changed)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (changed)
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (changed)

## 2026-05-27 — #2 CommandPalette: ⌘K global modal search

### Context
The previous ⌘K shortcut only focused the search input. A proper CommandPalette — modal, fuzzy search, keyboard navigation — was needed.

### Done
- Created `CommandPalette.tsx` new component (`shared/components/`)
- Framer-motion: backdrop + modal scale/fade animation
- 13 page items (Dashboard → Notifications), 1 quick action (Add Employee)
- Employees: `listEmployees(tenantId, "active")` — lazy loaded when palette opens
- Fuzzy match: `includes()` + char-by-char fallback; match substring `<span>` highlight
- Keyboard: ArrowUp/Down cursor movement, Enter → select, Escape → close
- Grouped sections: Pages / Quick Actions / Employees + scroll-into-view
- Footer hint: `↑↓ navigate`, `↵ open`, `ESC close`
- `App.tsx` changes:
  - Added `paletteOpen` state
  - ⌘K handler: `setPaletteOpen(prev => !prev)` (toggle)
  - Search input → click-to-open button (shows ⌘K badge)
  - `<CommandPalette>` rendered at layout bottom (via portal to `document.body`)
  - `employee-detail:` prefix navigates to employee detail page

### Files
- `frontend/src/shared/components/CommandPalette.tsx` (new)
- `frontend/src/App.tsx` (changed)

## 2026-05-27 — B-005 + B-006 + B-011: DB indexes, audit triggers, structured logging

### Context
Business tables had no composite indexes — tenant-scoped queries were slow at scale. Audit log was written manually only (no triggers). Hono's default logger output plain text — poor observability in Supabase log viewer.

### Done

**B-005 — Performance indexes + soft-delete:**
- Added `deleted_at timestamptz` column to `tasks`, `inbox_items`, `documents`
- `idx_tasks_tenant_status_del` — `(tenant_id, status, deleted_at)` partial index where deleted_at IS NULL
- `idx_tasks_tenant_due` — `(tenant_id, due_date)` partial, for overdue detection
- `idx_inbox_tenant_created_del` — `(tenant_id, created_at desc, deleted_at)` partial
- `idx_notifications_user_unread` — `(user_id, created_at desc)` where read_at IS NULL
- `idx_notifications_tenant_created` — `(tenant_id, created_at desc)`
- `idx_documents_tenant_created_del` — `(tenant_id, created_at desc)` partial
- `idx_audit_logs_tenant_created` — `(tenant_id, created_at desc)` for audit viewer
- `idx_audit_logs_entity` — `(entity_type, entity_id, created_at desc)` for entity lookup
- `idx_request_logs_tenant_created` — `(tenant_id, created_at desc)`

**B-006 — Audit log triggers:**
- Created `fn_audit_log_change()` PL/pgSQL function (SECURITY DEFINER)
- INSERT → `event_type = 'table.create'`, payload = NEW row as JSON
- UPDATE → `event_type = 'table.update'`, payload = `{before: OLD, after: NEW}`
- DELETE → `event_type = 'table.delete'`, payload = OLD row as JSON
- Triggers attached: `trg_audit_tasks`, `trg_audit_inbox_items`, `trg_audit_documents` (+ hr_cases if exists)

**B-011 — Structured JSON logging middleware (Hono):**
- Removed `import { logger } from "npm:hono/logger"` and `app.use('*', logger(console.log))`
- New `app.use('*', async (c, next) => {...})` middleware:
  - Reads `X-Trace-Id` header or generates a new UUID
  - Measures response time with `Date.now()` before/after
  - Assigns log level: status ≥ 500 → `error`, ≥ 400 → `warn`, duration > 2000ms → `warn`, else `info`
  - Outputs structured JSON via `logRequest()`: `{level, message, traceId, tenantId, userId, data: {method, path, status, duration_ms}}`
  - Adds `slow_query: true` flag for requests exceeding 2000ms

### Files
- `supabase/migrations/20260527000000_b005_b006_optimization.sql` (new)
- `supabase/functions/server/index.ts` (changed — logger import removed, structured middleware added)
>
> **Protocol (CLAUDE.md §...):** Every change is logged here and across the 4 translations.

---

## 2026-05-27 — UI/UX #10: Onboarding tooltips (TourProvider, TourOverlay)

### Done

- `OnboardingTour.tsx`: `TourProvider` + `useTour` hook + `TourOverlay` component (no external library)
  - Spotlight: dark overlay with `box-shadow` cutout around target element
  - Target position tracked via `requestAnimationFrame` (works with scroll)
  - `placement: "top"|"bottom"|"left"|"right"` — viewport clamped
  - Progress bar, step counter (1/4), "Skip" + "Next" buttons
  - Keyboard: `Escape` → close, `ArrowRight`/`Enter` → advance
- `AppProviders.tsx`: added `<TourProvider>`
- `App.tsx`: `DASHBOARD_TOUR` (4 steps: nav, search, notifications, theme) + `HelpCircle` button → `startTour()`
- Search input: added `data-tour="search"` attribute

### Files

- `frontend/src/shared/components/OnboardingTour.tsx` (new)
- `frontend/src/app/providers/AppProviders.tsx` (changed)
- `frontend/src/App.tsx` (changed)

---

## 2026-05-27 — UI/UX #9: Keyboard shortcuts (⌘K search, ⌘N new employee)

### Done

- `keydown` listener in `App.tsx`: `Cmd/Ctrl+K` → focuses + selects search input; `Cmd/Ctrl+N` → navigates to `hr-add-employee` (only when HR permission granted)
- Mac/Windows mod key detection via `navigator.platform`
- Search input placeholder updated: `"... (⌘K)"` hint added

### Files

- `frontend/src/App.tsx` (changed)

---

## 2026-05-27 — UI/UX #8: Table pagination (EmployeesPage, AdminCompaniesPage)

### Done

- `Pagination` component: page buttons with ellipsis, `ChevronLeft/Right`, "N–M / total" info; `paginateArray` helper
- **EmployeesPage**: `PAGE_SIZE=20`, page resets on tab/search/statusFilter change, `paginateArray(filtered, page, PAGE_SIZE).map(...)`
- **AdminCompaniesPage**: `PAGE_SIZE=15`, page resets on filter/search change, pagination below list

### Files

- `frontend/src/shared/components/Pagination.tsx` (new)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (changed)
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (changed)

---

## 2026-05-27 — UI/UX #7: Dark/Light mode toggle

### Done

- `useTheme` hook: localStorage persistence (`ai-bc-theme`), OS preference fallback, adds/removes `.dark` class on `<html>`
- `ThemeToggle` component: `Sun`/`Moon` icons, `aria-label`, `dark:` hover colors
- Added `<ThemeToggle />` to App.tsx topbar (left of LocaleSelect)
- Added `<ThemeToggle />` to AdminLayout topbar
- `.dark` CSS variables in `theme.css` were already fully defined

### Files

- `frontend/src/shared/hooks/useTheme.ts` (new)
- `frontend/src/shared/components/ThemeToggle.tsx` (new)
- `frontend/src/App.tsx` (changed)
- `frontend/src/features/admin/components/AdminLayout.tsx` (changed)

---

## 2026-05-27 — UI/UX #6: Employee onboarding step wizard

### Done

- `AddEmployeePage` converted to 3-step wizard:
  - **Step 1**: Mode selection — large visual cards (`Send`/`Lock` icons, selected badge)
  - **Step 2**: Info form — icon-prefixed inputs, mode indicator with "Change" link, spinner during submit
  - **Step 3**: Success — large `CheckCircle2` green circle, "Add another" and "Employee list" buttons
- `StepIndicator` component: numbered circles (active/done/future), connector lines (color changes), step labels
- Added `onSuccess?` prop — external callback option on step 3

### Files

- `frontend/src/features/hr/pages/AddEmployeePage.tsx` (complete rewrite)

---

## 2026-05-27 — UI/UX #5: Notifications UI polish

### Done

- **Badge**: `animate-ping` ring (pulsing halo around the red dot) + inner count badge
- **"Mark all as read"** button: header area with `CheckCheck` icon + `Promise.allSettled` parallel marking
- **Empty state**: `BellOff` icon + text (was text only before)
- **Per-notification**: type emoji icon (task/hr/invoice/system/🔔 default), indigo dot for unread, `bg-indigo-50` background
- **Header row** added: "Bildirishnomalar" title + "Mark all" button when unread count > 0
- Replaced `CheckSquare` with contextual type emojis

### Files

- `frontend/src/features/notifications/components/NotificationsDropdown.tsx` (complete rewrite)

---

## 2026-05-27 — UI/UX #4: Mobile responsive fixes (3 pages)

### Done

- **AdminCompaniesPage** header: `flex-wrap gap-3 + shrink-0` — button wraps to next row on small screens
- **AdminContactsPage** header: same `flex-wrap` fix
- **EmployeeDetailPage**: loading → full skeleton (header + 5 field rows); error state → icon + message (was plain text before)
- Summary cards `grid-cols-2 sm:grid-cols-4` — already responsive, preserved

### Files

- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (changed)
- `frontend/src/features/admin/pages/AdminContactsPage.tsx` (changed)
- `frontend/src/features/hr/pages/EmployeeDetailPage.tsx` (changed)

---

## 2026-05-27 — UI/UX #3: Skeleton loaders + Empty states (4 pages)

### Done

- **AdminCompaniesPage**: spinner → 5 card skeletons (`animate-pulse`); empty state → `Building2` icon + contextual message (hint to clear filters when active)
- **AdminContactsPage**: spinner → 5 card skeletons; empty state → `Users` icon + contextual message; added `Users` to imports
- **AdminHealthPage**: single text line → header + banner + 4 stat card skeletons
- **EmployeesPage**: plain text → table skeleton (thead + 6 rows); empty state → `UserPlus` icon + contextual message

### Files

- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (changed)
- `frontend/src/features/admin/pages/AdminContactsPage.tsx` (changed)
- `frontend/src/features/admin/pages/AdminHealthPage.tsx` (changed)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (changed)

---

## 2026-05-27 — UI/UX #1-2: AdminLayout sidebar + AdminDashboard SVG charts

### Done

**#1 — AdminLayout sidebar rewrite:**
- Desktop: icon-only mode (w-16) ↔ expanded (w-56) via `PanelLeftClose/Open` toggle
- Mobile: drawer (`-translate-x-full` → `translate-x-0`) + overlay; separate `mobileOpen` state
- `NavItem`: tooltip (fixed position when collapsed), left active bar (animated height), icon scale on hover
- Badge: pulsing red dot (collapsed) / count number (expanded) for contacts
- `Avatar`: initials from name split by `[\s@._-]`
- Topbar: new contacts count, avatar top-right

**#2 — AdminDashboardPage SVG charts (no external library):**
- `DonutChart`: pure SVG, arc paths via trigonometry, center hole, center text
- `MiniBarChart`: SVG bar chart, 7-day buckets from companies `created_at`
- `LatencyGauge`: SVG arc gauge, color-coded (green ≤50ms, yellow ≤200ms, red >200ms)
- `StatCard`: weekly trend indicator (↑/↓), hover `scale-[1.01]`
- Skeleton loaders: `animate-pulse` divs while loading
- 30s auto-refresh; new `getDashboardStats` type in adminDashboardApi

### Files

- `frontend/src/features/admin/components/AdminLayout.tsx` (complete rewrite)
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (complete rewrite)

---

## 2026-05-27 — Task 4: B-001 Unit tests (inbox module)

### Context

Per B-001, additional unit tests were written for the `features/inbox/` module. Total tests grew from 76 to 89 (+13 new tests, 16 test files).

### Done

**`inbox/__tests__/inboxApi.test.ts` (6 new tests):**
- `snake_case is_read` → `camelCase isRead` normalization
- Accepting `false` when `is_read` is absent
- Correct endpoint and `tenantId` usage
- Empty array → empty list
- Multi-item `isRead` normalization
- Throwing exception on API error

**`inbox/__tests__/useInbox.test.ts` (7 new tests):**
- Items loaded on mount
- `filter=all` — all items shown
- `filter=HR` — only HR items filtered
- `filter=Sales` — only Sales items filtered
- Tenant isolation — separate API call for different `tenantId`
- API error → `error` state, `items=[]`
- `selectedItem` auto-set to first item

### Status: 89 tests, all passing (16 test files)

### Files

- `frontend/src/features/inbox/__tests__/inboxApi.test.ts` (new)
- `frontend/src/features/inbox/__tests__/useInbox.test.ts` (new)

---

## 2026-05-27 — Task 3: B-007 Prompt injection protection + input sanitization

### Context

AI chat endpoints were passing user input directly to Claude/OpenAI without any safety checks. This creates injection risk: users could attempt to override system prompts or manipulate the AI. Per B-007, `services/ai-safety.ts` was created and wired into `/v1/ai/chat`.

### Done

**`services/ai-safety.ts` (new file):**
- `checkAiSafety(rawInput, userId)` — main function:
  - 25 injection patterns (EN/RU/UZ/JA + system markers: `<system>`, `[INST]`, `<|user|>`, etc.)
  - HTML/script tag stripping (DoS-safe: `{0,200}` regex)
  - Max 16,000 chars (~4,000 tokens) limit
  - Per-user rate limit: 10 messages/minute (in-memory sliding window)
  - `SafetyResult` type: `{ safe: true, sanitized }` or `{ safe: false, code, message, messageRu }`
- `wrapUserMessage(sanitized)` — prompt layering helper:
  - Wraps user message in `"User message:\n..."` block
  - Clearly separates user input from system context → reduces injection effectiveness

**`/v1/ai/chat` endpoint updated:**
- `checkAiSafety()` — runs before KB search and AI calls
- 422 → `INJECTION_DETECTED` or `INPUT_TOO_LONG`
- 429 → `RATE_LIMITED` (locale-aware message: uz or ru)
- `safeMessage` — sanitized message used throughout the handler
- `wrapUserMessage()` — applied in Claude + OpenAI fallback calls

### Files

- `supabase/functions/server/services/ai-safety.ts` (new)
- `supabase/functions/server/index.ts` (changed: import + `/v1/ai/chat` handler)

---

## 2026-05-27 — Task 1: ai_usage_logs wiring (billing cost tracking)

### Context

While waiting for API credits, we started backend work that doesn't require credits. First task: the `ai_usage_logs` table was created on 2026-05-14 but the `/v1/ai/chat` and `/v1/admin/ai/chat` endpoints weren't writing to it. This is critical for billing — without knowing how much AI credit each tenant consumes, the Phase 3 payment system cannot function.

### Done

**`insertAiUsageLog` helper function (new, non-blocking):**
- `supabase.from("ai_usage_logs").insert(...)` — uses service_role client (RLS bypass)
- `provider` normalization: `"openai_fallback"` → `"openai"` (DB constraint: `('claude','openai','fallback')`)
- Non-blocking: `.then(({ error }) => ...)` — main request is not slowed down
- `AiUsageLogEntry` type — typed interface

**`/v1/ai/chat` endpoint updated:**
- `insertAiUsageLog()` is called after each AI response
- Stored data: `tenant_id`, `user_id`, `endpoint`, `model`, `provider`, `complexity`, `prompt_tokens`, `completion_tokens`, `cost_usd`, `cached`, `latency_ms`, `trace_id`

**`/v1/admin/ai/chat` endpoint updated:**
- Token tracking variables added: `adminModel`, `adminProvider`, `adminInputTokens`, `adminOutputTokens`, `adminCostUsd`, `adminCached`
- Response data from `callClaude()` and `callOpenAI()` is now collected
- Admin chat does NOT write to `ai_usage_logs` (FK constraint — no tenant in admin context) — logged via `console.info()`
- TODO: future solution: nullable `tenant_id` or separate `admin_ai_usage_logs`

**Clarification:**
- `/v1/docs/search` endpoint already exists (line 2916) — works with `ILIKE`
- `match_documents()` pgvector function exists but requires OpenAI embedding credits — will connect when credits arrive
- Task 2 (`match_documents()` wiring) depends on credits, deferred

### Files

- `supabase/functions/server/index.ts` (changed: `insertAiUsageLog` helper + 2 endpoints wired)

---

## 2026-05-15 — Web improvements (completed): 8 major UI/UX changes

### Context

While waiting for API credits, completed 8 web improvements in order.

### Done

**1. ProfileForm — connected to real auth data:**
- `useUserSettings` hook rewritten — reads real `fullName` and `email` from AuthContext
- `PATCH /v1/settings/profile` backend endpoint created
- `refetchProfile()` called after save — sidebar updates immediately

**2. EmployeeDetailPage — edit mode added:**
- All 23 employee_profiles fields shown as a form
- 5 sections: Personal, Employment, Contact, Emergency, Notes
- `PATCH /v1/tenants/:id/members/:userId/profile` — HR upserts employee

**3. Unit tests (B-001):**
- 9 tests: `adminApi.test.ts`
- 12 tests: `settingsDomain.test.ts`
- 7 tests: `useUserSettings.test.ts`
- LandingPage.test.tsx fixed: I18nProvider wrapper added
- Total: 76 tests, all passing

**4. EmployeesPage — filter + search + block/unblock:**
- Status filter chips: all/active/password_pending/password_set/blocked
- Search field (by name/email)
- Block/Unblock buttons per row

**5. Docs page — templates library:**
- 15 templates (contracts, applications, orders)
- Category filter + search
- "coming soon" badge — waiting for AI credits

**6. Admin dashboard — 30s auto-refresh + sidebar badge:**
- `setInterval(30_000)` — AdminDashboardPage auto-refreshes
- Sidebar "Contacts" nav shows red badge (new contact count)

**7. Reports page — AI audit disabled:**
- "AI Audit" button set to disabled — "coming soon" label

**8. Notifications page — full notification history:**
- `NotificationsPage.tsx` — filter (all/unread/read), bulk mark-read
- `NotificationsDropdown` got "View all" link (`onViewAll` prop)
- App.tsx wired `case "notifications"`

### Files

- `supabase/functions/server/index.ts` (changed — 4 new endpoints)
- `frontend/src/features/settings/hooks/useUserSettings.ts` (rewritten)
- `frontend/src/features/settings/components/ProfileForm.tsx` (rewritten)
- `frontend/src/features/hr/pages/EmployeeDetailPage.tsx` (rewritten)
- `frontend/src/features/hr/api/employeesApi.ts` (changed)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (changed)
- `frontend/src/features/admin/__tests__/adminApi.test.ts` (new)
- `frontend/src/features/settings/__tests__/settingsDomain.test.ts` (new)
- `frontend/src/features/settings/__tests__/useUserSettings.test.ts` (new)
- `frontend/src/features/landing/__tests__/LandingPage.test.tsx` (fixed)
- `frontend/src/features/docs/components/TemplatesLibrary.tsx` (new)
- `frontend/src/features/docs/pages/DocsPage.tsx` (rewritten)
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (changed)
- `frontend/src/features/admin/components/AdminLayout.tsx` (changed)
- `frontend/src/features/reports/pages/ReportsPage.tsx` (changed)
- `frontend/src/features/notifications/pages/NotificationsPage.tsx` (new)
- `frontend/src/features/notifications/components/NotificationsDropdown.tsx` (changed)
- `frontend/src/App.tsx` (changed)

---

## 2026-05-15 — Web improvements (continued): TenantSettings, EmployeeDetail, Password, Landing nav/footer

### Context

Continuing web improvements while waiting for API credits — items 3–6 of the 6-task web improvement list.

### Done

**3. TenantSettingsPage (full rewrite):**
- `GET /v1/tenants/:id/profile` and `PATCH /v1/tenants/:id/profile` backend endpoints
- Form: name, legal_form, stir, employee_count_range, activity_type, reg_date, legal_address, website, description, contact_phone, contact_email, bank_name, bank_account
- Replaced stub `<div>Tenant settings</div>`

**4. EmployeeDetailPage (new):**
- `GET /v1/tenants/:id/members/:userId` endpoint — user_tenant + employee_profiles JOIN
- `EmployeeDetailPage` component: 5 sections (Personal, Employment, Contact, Emergency, Notes)
- `onViewEmployee` callback added to EmployeesPage
- `selectedEmployeeId` state and "Company Profile" nav item added to App.tsx

**5. PasswordChangeForm (new):**
- Password change via `supabase.auth.updateUser({ password })`
- Eye/EyeOff toggle, validation (min 8 chars, match check), success/error states
- Added to SettingsPage

**6. Landing nav + footer (updated):**
- LandingNavbar: anchor links for features/pricing/faq (visible on md+), smooth scroll
- LandingFooter: nav links row (Features, Pricing, FAQ, Contact)
- `id="features"` on FeaturesSection, `id="pricing"` on PricingSection
- i18n updated in all 4 locales: nav (features/pricing/faq), footer.links (4 links)

### Files

- `supabase/functions/server/index.ts` (changed: new endpoints)
- `frontend/src/features/tenants/pages/TenantSettingsPage.tsx` (rewritten)
- `frontend/src/features/hr/pages/EmployeeDetailPage.tsx` (new)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (changed: onViewEmployee)
- `frontend/src/features/settings/components/PasswordChangeForm.tsx` (new)
- `frontend/src/features/settings/pages/SettingsPage.tsx` (changed)
- `frontend/src/features/landing/components/LandingNavbar.tsx` (changed)
- `frontend/src/features/landing/components/LandingFooter.tsx` (changed)
- `frontend/src/features/landing/components/FeaturesSection.tsx` (id added)
- `frontend/src/features/landing/components/PricingSection.tsx` (id added)
- `frontend/src/features/landing/i18n.ts` (changed: nav + footer.links)
- `frontend/src/App.tsx` (changed: EmployeeDetail, TenantSettings, navigate helper)

---

## 2026-05-15 — Phase 1.5 completion + Phase 2.3 start: AdminCompaniesPage, FAQ, SEO

### Context

While waiting for API credits (Anthropic/OpenAI), the web side was improved. The missing `/admin/companies` page from Phase 1.5 was built, and the Landing page received a FAQ section and SEO meta tags from Phase 2.3.

### Done

**1. Backend — `GET /v1/admin/companies` endpoint (new):**
- Returns all tenants with full fields: id, name, status, legal_form, stir, contact info, bank, blocked_reason, timestamps
- `member_count` per tenant (from user_tenants, excluding terminated)
- Status filter: `?status=pending_approval|active|suspended|blocked`
- Super_admin / sub_admin only

**2. Frontend — `adminApi.ts` extended:**
- `Company` type + `CompanyStatus` type
- `getAdminCompanies(status?)` function
- `updateCompanyStatus(id, status, blocked_reason?)` → `PATCH /admin/tenants/:id/status`

**3. Frontend — `AdminCompaniesPage.tsx` (new):**
- 4 status summary cards (pending/active/suspended/blocked)
- Filter tabs + search (name, STIR, email, phone)
- Expandable rows: legal info, bank details, blocked reason
- Actions: Approve, Suspend, Unblock, Block (with reason modal)
- Route: `/admin/companies` with `RequireAuth` wrapper

**4. Frontend — Landing FAQ section:**
- `FaqSection.tsx` — accordion, accessible (aria-expanded), animation
- 6 FAQ items in 4 languages (uz/ru/en/ja) added to `i18n.ts`
- `LandingDict` type extended with `faq: { title, items: FaqItem[] }`
- Page order: PricingSection → FaqSection → LandingCtaBanner

**5. SEO — `index.html` updated:**
- `<title>` with product name + description
- `<meta name="description">`, keywords, author, robots
- Open Graph meta tags
- Twitter Card meta tags
- `<link rel="canonical">`
- `<meta name="theme-color" content="#0f172a">`
- `<html lang="uz">`

### Files
- `supabase/functions/server/index.ts` (GET /admin/companies added)
- `frontend/src/features/admin/api/adminApi.ts`
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (new)
- `frontend/src/app/router.tsx` (/admin/companies route)
- `frontend/src/features/landing/i18n.ts` (FAQ in 4 locales)
- `frontend/src/features/landing/components/FaqSection.tsx` (new)
- `frontend/src/features/landing/pages/LandingPage.tsx`
- `frontend/index.html` (SEO meta tags)

---

## 2026-05-14 — security: 5 views switched to SECURITY INVOKER

### Context

Supabase Security Advisor reported 5 "Security Definer View" errors:
`employee_invite_stats`, `v_beta_stats`, `v_beta_daily_activity`, `v_beta_model_usage`, `v_beta_feedback`.

SECURITY DEFINER views run with the creator's privileges — bypassing RLS and potentially breaking tenant isolation.

### Done

**Migration `20260514120000_views_security_invoker.sql`:**
- Recreated all 5 views with `with (security_invoker = true)` (PG15+).
- `v_beta_*` views — SELECT only for `service_role` (admin dashboard via backend).
- `employee_invite_stats` — granted to `authenticated` and `service_role` (HR sees within their tenant, RLS handles it).
- Every view has a comment: "SECURITY INVOKER — caller RLS rules apply".

### Reason

Same pattern was used before (`20260304_fix_tenant_daily_stats_security.sql`, `20260429120000_security_hardening.sql`). For multi-tenant SaaS, SECURITY DEFINER view is a serious security risk.

### Verification

After push: Dashboard → Advisors → Security → **Refresh** → 5 errors → 0.

### Files
- `supabase/migrations/20260514120000_views_security_invoker.sql` (new)
- `docs/{DEVLOG,English/DEVLOG,Russian/DEVLOG,Uzbek/DEVLOG,日本語/DEVLOG}.md` (synced)

---

## 2026-05-14 — Scale foundation: AI cost tracking + doc_chunks RAG + R-016..R-020

### Context

Implemented the urgent items from `docs/ai-business-concierge-scale-prompt.md` (2026-05-11). Audited the Phase 1.5 state and closed the remaining urgent gaps.

### Done

**1. DB migration `20260514000000_ai_usage_and_doc_vector.sql`:**
- `ai_usage_logs` table — per AI call: tenant, user, endpoint, model, provider, complexity, prompt/completion tokens, cost_usd, cached, latency, trace_id. Generated `total_tokens` column. 3 indexes. RLS with tenant isolation + super_admin/sub_admin see everything.
- `v_ai_usage_summary` view — daily tenant aggregate (for Admin dashboard).
- `doc_chunks.embedding vector(1536)` column — for pgvector RAG.
- `doc_chunks_embedding_idx` HNSW index (m=16, ef_construction=64).
- `match_documents(query_embedding, threshold, count, tenant_id)` function — RAG search, security definer, search_path locked, execute granted only to authenticated/service_role.
- Document_id and tenant_id indexes on `doc_chunks`.

**2. REQUIREMENTS.md updated:**
- R-016 HR Candidate Analysis (skeleton exists, full impl in Phase 2).
- R-017 AI Rate Limiting (partial — in-memory `contactRateMap` + Telegram daily limit).
- R-018 AI Cost Tracking (migration done — backend wiring next session).
- R-019 Vector Search RAG (migration done — backend integration next session).
- R-020 Admin Dashboard (super_admin/sub_admin: health, contacts, AI chat — Phase 4 expansion).

**3. Verified existing state:**
- Phase 1.5 — 5 migrations applied: contact_requests, tenant_company_info, roles_update (sub_admin/company_admin/accountant/manager), employee_profiles, employee_invites.
- Backend admin endpoints in place: `/admin/contacts`, `/admin/health`, `/admin/ai/chat`, `/admin/contacts/:id/status`, `/admin/tenants/:id/status`.
- Frontend admin pages with real implementations: `AdminContactsPage`, `AdminHealthPage`, `AdminAIChatPage` + `adminApi.ts`.
- docs/ structure correct: `English/`, `Russian/`, `Uzbek/`, `日本語/` — each with DEVLOG.md and other translations.

### Deferred (future)

- Prompt caching middleware (scale-prompt Task 1.2) — Phase 1.5 wrap-up.
- HR Candidate Analysis full impl — Phase 2 (per PLAN.md v3.0).
- Backend wiring: insert into `ai_usage_logs` from `/v1/ai/chat` endpoint — next session (extract token usage from services/llm-router.ts).
- Wire `match_documents()` into `POST /v1/docs/search` — next session.
- Full admin debug/log UI (real-time Sentry, query EXPLAIN) — Phase 4.

### Files
- `supabase/migrations/20260514000000_ai_usage_and_doc_vector.sql` (new)
- `docs/REQUIREMENTS.md` (R-016..R-020 added)
- `docs/DEVLOG.md` (this entry)
- `docs/{English,Russian,Uzbek,日本語}/DEVLOG.md` (sync translations)

### Rationale

Without `ai_usage_logs`, billing (Phase 2) cannot work — we can't allocate cost per tenant without per-call token attribution. Without `match_documents()`, the AI Concierge "search in my docs" tool falls back to `ILIKE` — low-quality results.

---

## 2026-05-06 — Phase 1.5 (4): B-027/B-028/B-029

### Changes Made

**B-027 — In-app Notifications for HR (Realtime):**
- `createHrSetupCompleteNotification` — sends notification to HR/leader when employee setup completes
- `createEmployeeConfirmedNotification` — sends notification to employee when HR confirms
- `useRealtimeNotifications` hook — subscribes to `notifications` table via Supabase realtime
- `NotificationsDropdown` — accepts `userId` prop, auto-updates on new notifications (no polling)

**B-028 — /admin/health (System Monitoring):**
- Backend: `GET /admin/health` — super_admin only; DB latency + tenant/user/contact/notification stats
- Frontend: `AdminHealthPage` — stat cards, DB latency banner (green/amber), refresh button; route: `/admin/health`

**B-029 — /admin/ai-chat (Admin AI Chat):**
- Backend: `POST /admin/ai/chat` — super_admin only; Claude + OpenAI fallback; live platform stats as context
- Frontend: `AdminAIChatPage` — chat UI, typing indicator, suggestion chips, locale-aware; route: `/admin/ai-chat`
- `adminApi.ts` — `getAdminHealth()` + `sendAdminAIMessage()` API helpers

---

## 2026-05-06 — Phase 1.5 (3): B-026 Email Templates (7 total)

**7 email templates (Resend API, dark indigo theme):**
1. `company_invite` — existing (admin contact → invite_sent)
2. `company_registered_pending` — POST /register/company → "Awaiting admin approval" to leader email
3. `company_rejected` — PATCH /admin/contacts/:id/status → status=rejected → email to contact
4. `company_approved` — new PATCH /admin/tenants/:id/status → status=active → email to leader
5. `employee_invite` — POST /members → mode=invite → branded email to employee (in addition to Supabase)
6. `employee_welcome` — POST /auth/setup-complete → "Welcome, your account is ready"
7. `admin_new_registration` — POST /register/company → notification to ADMIN_NOTIFY_EMAIL

**New env var:** `ADMIN_NOTIFY_EMAIL`
**New endpoint:** `PATCH /admin/tenants/:id/status`

---

## 2026-05-06 — Phase 1.5 (2): Text Fixes + Language Selector

- `landing/i18n.ts` — "ChatGPT doesn't know this." phrase removed
- `app/i18n.ts` — `auth.platformSubtitle` key added in 4 languages
- `LoginPage.tsx`, `LandingNavbar.tsx`, `LanguageSwitcher.tsx` — button group → `<select>` dropdown

---

## 2026-05-05 — Phase 1: Telegram Bot

**Architecture (Clean Architecture / DDD):**
- `supabase/functions/telegram-bot/` — Edge Function
- `handlers/` — start, help, language, message, feedback, stats, media
- `services/` — session.ts, maslahatchi.ts

**Bot Functionality:**
- 4 languages: uz / ru / en / ja
- `/start`, `/help`, `/language`, `/stats`
- Rate limit: 5 requests/day (free plan)
- LLM Router: Haiku 3.5 (~80%) + Sonnet 4.6 (~20%)
- KB semantic search: pgvector + OpenAI text-embedding-3-small

**Beta Monitoring:**
- `v_beta_stats`, `v_beta_daily_activity`, `v_beta_feedback`, `v_beta_model_usage`

---

## 2026-05-05 — Deployment: Errors and Solutions

### ❌ 401 Unauthorized (Webhook)
**Cause:** Supabase JWT verification was blocking webhook requests.
**Solution:** Added to `supabase/config.toml`:
```toml
[functions.telegram-bot]
verify_jwt = false
```

### ❌ TELEGRAM_WEBHOOK_SECRET not found
**Cause:** Secret was never set, but code was checking for it.
**Solution:** Removed the secret check — webhook auth not required.

### ❌ CLAUDE_ERROR:400 credit balance too low
**Cause:** No Anthropic API credits.
**Status:** User needs to add credits ($5+). Bot cannot respond.

### ❌ OpenAI 429 insufficient_quota
**Cause:** KB seed script called OpenAI embedding API, no quota.
**Status:** Will be resolved with Anthropic. `scripts/seed_kb.ts` is ready (53 entries).

### ❌ /stats didn't work
**Cause:** `ADMIN_CHAT_ID` secret not set.
**Solution:** `supabase secrets set ADMIN_CHAT_ID="6132360728"`

---

## 2026-05-06 — Bot UX Improvements

1. **Non-text messages** — `handlers/media.ts` — images, voice, files, stickers → "please send text only"
2. **Returning user `/start`** — "Welcome back!" in their language, no keyboard shown
3. **Remaining limit display** — `📊 Remaining today: X/5 requests` added to each response
4. **Feedback language fix** — Previously hardcoded `"uz"`, now real locale from `getOrCreateSession`

---

## 2026-05-06 — Language System (Locale) Fixes

### DB Check Constraint — Root Cause
**Cause:** `ai_conversations.locale` constraint: `CHECK (locale IN ('uz', 'ru', 'en'))` — 'ja' was missing!
**Solution:** Migration added: `CHECK (locale IN ('uz', 'ru', 'en', 'ja'))`

### Disclaimer only for uz/ru
**Cause:** `knowledge-base.ts` had only 2 disclaimers.
**Solution:** 4 disclaimers added, `addDisclaimerIfNeeded` extended.

### `llm-router.ts` default system prompt
**Cause:** Fallback `locale === "ru" ? RU : UZ` — English/Japanese users got Uzbek system prompt.
**Solution:** Default system prompt added for all 4 languages.

---

## 2026-05-06 — Phase 1.5 (1): DB Migrations + Landing

### DB — 5 Migrations Applied ✅

| Migration | What it did |
|---|---|
| `phase15_contact_requests` | Company inquiry CRM table + RLS (admin only) |
| `phase15_tenant_company_info` | `tenants` added: status, tax ID, legal info, bank, approval |
| `phase15_roles_update` | `user_tenants` added: sub_admin, company_admin, accountant, manager + status |
| `phase15_employee_profiles` | Full HR data table (passport, JSHSHIR, salary, emergency) |
| `phase15_employee_invites` | One-time invite token table (24h TTL, resend count) |

---

## Key Information

| Parameter | Value |
|-----------|-------|
| Supabase project ref | `ufhepwdkjqptjvxrmpjn` |
| Bot username | `@ai_business_concierge_bot` |
| Admin chat ID | `6132360728` |
| LLM Router | Haiku 3.5 (simple) + Sonnet 4.6 (complex) |
| Embedding model | `text-embedding-3-small` (OpenAI) |
| Rate limit | 5 requests/day (free) |
| Language fallback (KB) | `ja` → `en` (KB only covers uz/ru/en) |

---

## 2026-07-24 — Four-language and theme completion

- The Templates Library, tabs, search, categories, modal, validation, and format labels now use the shared `uz`, `ru`, `en`, `ja` locale contract.
- All 15 active production templates now have localized titles, descriptions, field labels, and document bodies (`20260724065619_localize_document_templates_four_languages.sql`).
- The document API and OpenAPI locale enums accept all four locales; the frontend no longer collapses `en` and `ja` to `uz`.
- `next-themes` is now the single theme source, forced light mode was removed, and a dark-mode compatibility layer keeps legacy utility colors readable.
- Shared navigation, notifications, settings, company profile, analytics, AI chat, and command palette details were moved into the locale system.
- Verification: frontend build passed, 95/95 tests passed, backend bundle passed, and production DB checks report `15/15` complete titles, bodies, and field locales.

## 2026-07-24 — Code review fixes

- Notification types, admin navigation, auth configuration errors, and all employee-profile interface details now use `uz`, `ru`, `en`, and `ja` translation keys.
- The dark-mode compatibility layer no longer overrides explicit component `dark:*` classes, preserving background, text, border, and placeholder contrast.
- The Templates Library locale race is fixed: stale responses cannot replace the newest locale result, and an open template from the previous locale is closed.
- Password visibility is keyboard-focusable again, and icon-only controls received localized `aria-label` values.
- Added regression coverage; final verification passed 19/19 test files, 96/96 tests, and the production build.
