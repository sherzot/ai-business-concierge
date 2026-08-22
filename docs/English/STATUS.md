# AI Business Concierge — current status

> Last code/platform snapshot verified: **2026-08-22**
> Documentation normalized: **2026-08-07**
> The local runtime, production health/auth, and remote GitHub Actions baseline were re-verified on 2026-08-07. The P0 commits were pushed and the new CI run completed fully green.
> 2026-08-08: the publishable-key commit was pushed and passed CI/Netlify deploy, but the production bundle still uses the legacy fallback. Direct browser Data API access to risk-scanner tables was closed in production.
> 2026-08-08: Realtime tenant isolation was hardened in production; active membership/tenant checks and service-role Edge authorization were centralized.
> 2026-08-08: fresh local replay passed all 32 migrations, pgTAP passed 21/21, and real local Auth-token Edge acceptance passed 8/8.
> 2026-08-08: production migration history was aligned with local; local Storage/Auth pin drift was closed and enabled full-stack health was verified.
> 2026-08-08: Supabase CLI was upgraded to `v2.112.0`; fresh replay and all acceptance/regression gates passed under the new local key/grant contract.
> 2026-08-08: the Portfolio-inspired frontend redesign passed browser acceptance, commits `83bc7e0`/`509bc2d` were pushed, PR #2 is open, and CI is green.
> 2026-08-10: PR #3 was merged into `main` as `79be466`; Codex review hotfix `aee6692` was also pushed to `main`. Netlify production deploy `6a79d69c9aa5a6bcf326e83c` is ready and `bright-api` v75 is ACTIVE; authenticated two-role smoke tests remain.
> 2026-08-10: The user confirmed successful authenticated production checks for Leader Company Profile and the Super Admin dashboard. The landing Why Us fix from PR #4 and Company Dashboard fix from PR #5 are merged into `main` and shipped in Netlify production deploy `6a79e664a453161423131204`; an authenticated dashboard visual recheck remains.
> 2026-08-11: Netlify production moved to the modern `sb_publishable_...` key, Auth `200` and Realtime `OPEN` smoke tests passed, and the legacy frontend env was deleted. Source fallback removal was prepared on `agent/remove-legacy-supabase-anon-fallback`, and GitHub CLI auth was verified through the keyring.
> 2026-08-11: The no-fallback source was merged to `main` through PR #6 as `2b71a49`; GitHub CI is green and final Netlify deploy `6a7ab5474835d660f21249cd` is ready. Production bundle/Auth/Realtime rechecks passed; the publishable-key handoff is complete.
> 2026-08-11: The user opened an authenticated Leader production session; the Company Dashboard Business Status panel was fully checked in dark mode through computed contrast and visual screenshot review. Text is visible with no overlap, overflow, or browser errors; acceptance is complete.
> 2026-08-11: The raw npm production audit returned zero vulnerabilities; the temporary GHSA-qwww metadata exception was removed and the exception-free production audit gate passed.
> 2026-08-11: The GHSA exception removal was pushed directly to `main` as `1fb6c0c`; GitHub CI run `31466592524` completed green across every security-gate step.
> 2026-08-11: Netlify + Supabase was fixed as the only active delivery platform and the Vercel Git integration was disconnected. The `$0/month` staging Supabase project was created after two-step user confirmation; 32/32 migrations, `bright-api` v1, Auth hardening, and Netlify context isolation are green 4/4.
> 2026-08-11: Isolation PR #7 merged into `main` as `3fb1592`; PR and main CI are green. Netlify preview and production smoke tests confirmed the appropriate staging/production ref, Auth/health `200`, Realtime `OPEN`, CSP, and preview noindex/no-store; Vercel created no new deployment.
> 2026-08-11: The PR #7 Codex `.env`/CSP hotfix shipped through PR #8 as `e2b3e78` to main/production; CI `31479695709`/`31479985070` and preview/production smoke tests are green. PR #8 Codex mode/STATUS follow-ups are active on `agent/fix-security-check-build-mode`.
> 2026-08-11: The PR #9 Codex endpoint-drift P2 finding was fixed before merge; the security gate compares the generated CSP ref with every bundled Supabase HTTPS/WSS endpoint ref. Deployment/security environment tests are 14/14 and the mismatched fixture was blocked as expected.
> 2026-08-11: PR #9 merged as `c00362a` to main/production; PR and main CI are green. Preview and production CSP/bundle isolation, Auth/health, and production Realtime smoke tests passed.
> 2026-08-11: Staging moved to modern Edge key overrides and disabled legacy anon/service-role keys. Real synthetic authenticated Edge acceptance passed 8/8 with mandatory cleanup of two tenants/five Auth users and a final fixture count of 0/0.
> 2026-08-11: Acceptance changes were pushed as `cc31fe7` in draft PR #10; GitHub CI run `31485875838` and Netlify deploy-preview `6a7b047d3150bc00088fc18d` are green.
> 2026-08-11: Real AI Document Assistant PDF/DOCX, embedded Noto Sans JP, and the private Storage contract are complete in staging; 12/12 pgTAP and binary/frontend gates are green, and `bright-api` v5 is ACTIVE. Production was intentionally left unchanged.
> 2026-08-12: PR #11 CI is green at `7837778`; Codex re-review P2s for signed-URL compensation and concurrent export were fixed with DB-first cleanup, compare-and-swap, and a 120-second retained-version grace. Staging is at 35/35 migrations, `bright-api` v7, health `200`.
> 2026-08-12: Codex P2s after green `35fa078` replaced retained cleanup with a 65-second export lease and `documents.row_version` CAS. Staging is at 36/36 migrations, `bright-api` v8, health `200`.
> 2026-08-12: Codex P2s on `0532a74` were closed with post-signing final lease pinning and delete/export row-version CAS. Staging `bright-api` v9 is ACTIVE, health `200`.
> 2026-08-12: Codex P2s on `661401a` were closed with binary-before-DB publication and O(n) PDF wrapping. Staging `bright-api` v10 is ACTIVE, health `200`, Deno 7/7.
> 2026-08-12: PR #11 final head `6db478d` passed CI/Netlify gates and a Codex re-review with no major issues, then merged to `main` as `8f179da`. Production shipped 36/36 migrations, `bright-api` v76, and Netlify deploy `6a7bad961b16200007cfd88e`; public/protected smoke tests are green. Authenticated synthetic acceptance was blocked by Cloudflare `403` before fixture creation, with final residue 0/0/0/0/0/0.
> 2026-08-21: Tenant-scoped AI Document Assistant polishing preview is complete locally. Backend 9/9, frontend 24/24 files and 111/111 tests, type-check/build/security/deploy-env/audit gates are green; staging/production deploy and real-provider smoke remain pending.
> 2026-08-21: The landing hero TEAM/08 card and caption overlap was fixed locally; frontend 25/25 files and 112/112 tests plus type-check are green. At 2048×1080 browser acceptance measured a 12.73px gap and 0 overlap/overflow/console errors.
> 2026-08-21: Three P2 and one P3 AI polishing review findings were closed locally: chat/polish token budgets are separated, unusable outputs are usage/cost-accounted, raw instructions are removed from logs, and the four-locale error envelope is standardized. Backend 14/14 and frontend 26/26 files with 115/115 tests are green.
> 2026-08-21: The remaining five AI polishing review findings were closed locally: Telegram cache scope was restored, provider timeout now covers the complete body lifecycle, polishing quota is atomically reserved in PostgreSQL, stale AI output cannot overwrite the user draft, and the modal scrolls within short viewports. Backend 18/18, Telegram check, frontend 26/26 files and 117/117 tests, type-check/build, canonical fresh migration replay 37/37, and local database pgTAP 45/45 are green.
> 2026-08-21: `4b51fec` was pushed to main; CI `32461091448` and Netlify production deploy `6a88056075359300089b9fa5` are green. Staging moved to 37/37 migrations and `bright-api` v11; authenticated smoke is blocked at `503 AI_UNAVAILABLE` because staging lacks `ANTHROPIC_API_KEY`, with fixture residue 0/0/0/0.
> 2026-08-21: Production authenticated binary acceptance is green: DOCX/PDF signed downloads, direct Storage deny `400`, cross-tenant deny `404`, delete `200`; authoritative document/generated/object residue is 0/0/0 and final fixture residue is 0/0/0/0/0. A Smart CDN cached URL may remain `200` for up to 60 seconds after deletion.
> 2026-08-21: Telegram webhook v14 accepted invalid POST with `200` when the secret was absent. After a pure guard and 4/4 tests, production v15 has health `200`, invalid POST fail-closed `503`, PUT `405`. `67ac675` is on main and CI `32485618740` is green; secret setup plus Telegram `setWebhook` remain.
> 2026-08-21: HR Candidate now has a real public GitHub adapter with bounded REST/pagination/response, timeout, repository-tree aggregation, and a ten-minute cache; Deno 10/10 and a live `octocat` smoke are complete. `8496aae` is on main and CI `32487503062` is green. The route remains `501`; Supabase Free keeps Pro+ Leaked Password Protection BLOCKED.
> 2026-08-21: Secret-free PDF/DOCX parsing is implemented for HR Candidate with 5 MiB/file-magic/PDF 50-page/text bounds, DOCX ZIP-bomb defenses, and EN/UZ/RU/JA date/section signals. `2526d72` is on main and CI `32489478394` is green with Deno 22/22; Haiku semantic structuring and route `501` remain gated by the provider key.
> 2026-08-21: The HR request boundary/orchestrator is hardened fail-closed with pre-provider validation, tenant role guard, plan policy, failed-CV hard stop, timer cleanup, canonical ULID, and schema exclusivity. `2656e6a` is on main and CI `32491296828` is green with Deno 34/34; persistent quota/LLM/route wiring remain.
> 2026-08-22: HR tenant quota and multipart boundaries are complete without provider secrets: PostgreSQL minute/day/concurrency leases, database plan mapping, 5 MiB + 64 KiB bounded streaming, and safe disabled-route draining. Staging has 39 migrations and the remote 22-case pgTAP runner succeeded; Deno 47/47 and frontend 117/117 are green. Production DB/Edge is unchanged; local fresh replay is blocked by the Docker socket.

## Current phase

- Phase 0 Foundation: **done**.
- Phase 1 Telegram MVP: **functionality done; operational secret verification remains**.
- Phase 1.5 Company Auth & Management: **done**.
- Phase 2 AI Document Assistant + Landing: **active**.
- Phase 3 Sales Bot + Billing: **not started**.
- Phase 4 Advanced Admin AI: **foundations exist; full phase not started**.

## Last verified technical snapshot

| Check | Status |
|---|---|
| Git | Live GitHub `main` and local `main` are synchronized by this closeout; only three user-owned untracked copies remain |
| Runtime | Node.js `22.18.0`; `.nvmrc` and package engine pin `22.x` |
| Supabase CLI | Official Homebrew tap `v2.112.0`; verified with a fresh local volume |
| Backend | Production Supabase Edge Function `bright-api` v76, `ACTIVE`, `verify_jwt=false`; SHA matches staging v10 |
| Health | `200` |
| Staging Supabase | `piqsyfwrjtormrlenjix`, `ap-southeast-1`, `$0/month`, `ACTIVE_HEALTHY`; 39 migrations, `bright-api` v11 ACTIVE, health `200`, unauthenticated docs/polish `401 TENANT_REQUIRED` |
| Staging Auth/API keys | Netlify preview wildcard + local Vite redirect allow-list; email confirmation ON, 8-digit/1-minute OTP, TOTP ON; Auth settings HTTP `200`, autoconfirm false. Edge uses modern `SB_ANON_KEY`/`SB_SERVICE_ROLE_KEY` overrides; legacy anon/service-role API keys are disabled |
| Type-check | Passed in a clean temporary frontend install |
| Unit tests | Frontend 26/26 files, 117/117 tests; AI polish/router/usage Deno 18/18; HR GitHub 10 + CV 8 + boundary 5 + quota 7 + multipart 6 + orchestrator 6 + schema 1 = 43/43; current targeted backend Deno 47/47 with Telegram; prior document binary/lifecycle Deno 7/7 |
| Deployment environment guard | 14/14 Node tests: 10 isolation-contract checks, 2 Vite `.env` fallback/runtime-precedence regressions, and 2 bundled-endpoint extraction regressions |
| Production build/security check | Build passed with a synthetic non-production ref; CSP was generated from that ref; security checked 10 build/Netlify files |
| Production dependency audit | Raw audit: 0 total vulnerabilities; scoped gate: 0 high/critical with no exceptions |
| Frontend design system | Portfolio-inspired warm/ink/Sher-blue system; landing, public/auth, product core, and admin shell redesign completed locally |
| Visual browser acceptance | Landing Why Us 6/6 inverse text is green. Landing hero TEAM/caption has a 12.73px gap at 2048×1080 with 0 overlap/overflow/console errors. Authenticated Company Dashboard dark mode has title/percentage contrast `16.73:1`, muted text `7.5:1`, success signal `10.66:1`, and 12/12 text nodes inside the panel |
| Delivery platform | Netlify only. The repository has no Vercel config/dependency; the external Vercel project remains, with `gitRepositoryConnected=false` verified |
| Environment isolation | Authoritative Netlify CLI read-back 4/4: `production` -> production Supabase; `deploy-preview`/`branch-deploy`/`dev` -> staging. Optional URL envs are absent; on Personal only browser-public `VITE_*` values use `All` scope |
| Staging security advisor | Errors `0`; known `vector` public-schema warning `1`; server-only RLS/no-policy infos `11` |
| Remote GitHub Actions | Main run `32543760806` for commit `398e46e` succeeded in 1m15s: Deno 47/47 and quality checks, frontend 117/117, deploy-env 14/14, audit 0 high/critical, 3,701-module build, and 10-file security green |
| Netlify preview | No new deploy preview was created because this slice was pushed directly to `main`; Netlify used production context |
| Production frontend | Deploy `6a88056075359300089b9fa5` ready, build `6a88056075359300089b9fa3`, commit `4b51fec`, 34s, plugin success, 0 secret matches across 87,170 files; `/` and `/dashboard/docs` `200`, CSP and production-only bundle green |
| Frontend Supabase key contract | Code and production accept only the modern publishable key; bundle has 1 modern key, 0 JWT-like keys, no legacy env name, and the format guard; Auth settings `200`, Realtime `OPEN`; Netlify legacy frontend env deleted |
| DB/Edge security acceptance | Fresh migration replay 32/32; local pgTAP 21/21; local real Auth-token Edge tests 8/8; staging modern-key remote Edge 8/8, cleanup of two tenants/five Auth users, final fixture 0/0; Realtime tables are SELECT-only and require active membership/tenant |
| Document binary/Storage acceptance | Real PDF/DOCX lifecycle passes 7/7 Deno tests. Production authenticated DOCX/PDF signed downloads are green; direct Storage `400`, cross-tenant export `404`, delete `200`, document/generated/object residue 0/0/0, and final fixture residue 0/0/0/0/0. Smart CDN cached signed-URL deletion invalidation can take up to 60 seconds |
| Migration history | Previous canonical local fresh replay 37/37 and full database pgTAP 45/45 are green. Staging has 39 migrations; the new HR quota remote 22-case pgTAP runner succeeded, with 2/2 private-table RLS+FORCE and RPC grants read back green. Production remains 36/36 and unchanged. The user-owned duplicate migration copy remains unchanged |
| Local Supabase services | The Docker socket did not respond in this session, so fresh local 39-migration replay is BLOCKED. New SQL was verified on staging PostgreSQL 17.6 by dry-run/pgTAP; the previous local baseline remains 37/37 and pgTAP 45/45 green |

## Capability status

| Area | Status | Note |
|---|---|---|
| Auth, multi-tenant, RBAC and core web modules | Done | Main product foundation works |
| Realtime and task notifications | Done | Inbox, Tasks, Notifications, acknowledgement |
| Admin platform | Partial | Core management/monitoring exists; tenant-profile/AI-stats authenticated smoke tests and Company Dashboard dark-contrast visual acceptance were confirmed in a user session |
| Telegram | Partial / fail-closed operational block | Production v15 ACTIVE; health `200`, POST `503` while secret is absent. Secret setup, Telegram `setWebhook`, and bot smoke remain |
| Resend inbox | Partial | Code exists; receiving/delivery E2E is unverified |
| AI Concierge/RAG and cost tracking | Partial | Foundation exists; polishing request quota is race-safe through PostgreSQL atomic reservation/release, and provider usage is accounted before output validation. Migration rollout, citation UX, billing dashboard, unified endpoint enforcement, and full smoke tests remain |
| AI Document Assistant | Production binary + staged AI polish preview / provider blocked | 15 templates, 4 languages, and real PDF/DOCX/private Storage are live. The polishing frontend is in production and migration plus `bright-api` v11 are in staging; Auth/tenant/document boundaries and cleanup are green, but real-provider smoke returns `503 AI_UNAVAILABLE` because staging lacks `ANTHROPIC_API_KEY`. Production backend/migration rollout is intentionally pending |
| HR Candidate Analysis | Partial / route blocked | GitHub/cache, local PDF/DOCX, pre-provider validation, tenant role guard, database plan policy, PostgreSQL minute/day/concurrency leases, bounded multipart, and orchestrator failure semantics are real/tested; Haiku/Sonnet, usage log, frontend results, and route wiring remain; production `501` |
| Billing / Click / Payme and AI Sales Bot | Planned | Phase 3 |

## Immediate order

1. While `ANTHROPIC_API_KEY` is pending, complete HR Candidate usage/cost logging and the frontend upload/results flow; retain `501` until the full flow is ready.
2. Once the key arrives, set it securely in staging Edge secrets, wire semantic CV/scoring/reporting, and make authenticated real-provider smoke green.
3. After green staging smoke, remove `501` with quota-lease release/wiring; separately smoke the AI Document Assistant production `20260821000000` migration plus `bright-api` rollout.

Detailed tasks: [PLAN.md](PLAN.md). Canonical source: [Uzbek STATUS](../STATUS.md).
