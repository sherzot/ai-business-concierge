# AI Business Concierge — current status

> Last code/platform snapshot verified: **2026-08-11**
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
| Git | `main` and `origin/main` align at `e2b3e78`; PR #8 is merged and the Codex mode/STATUS follow-up is active on `agent/fix-security-check-build-mode` |
| Runtime | Node.js `22.18.0`; `.nvmrc` and package engine pin `22.x` |
| Supabase CLI | Official Homebrew tap `v2.112.0`; verified with a fresh local volume |
| Backend | Supabase Edge Function `bright-api` v75, `ACTIVE`, `verify_jwt=false` |
| Health | `200` |
| Staging Supabase | `piqsyfwrjtormrlenjix`, `ap-southeast-1`, `$0/month`, `ACTIVE_HEALTHY`; 32/32 migrations, `bright-api` v1 ACTIVE, health `200` |
| Staging Auth | Netlify preview wildcard + local Vite redirect allow-list; email confirmation ON, 8-digit/1-minute OTP, TOTP ON; Auth settings HTTP `200`, autoconfirm false |
| Type-check | Passed |
| Unit tests | 23/23 files, 108/108 tests |
| Deployment environment guard | 12/12 Node tests: 10 isolation-contract checks plus 2 Vite `.env` fallback/runtime-precedence regressions |
| Production build/security check | Build passed with a synthetic non-production ref; CSP was generated from that ref; security checked 10 build/Netlify files |
| Production dependency audit | Raw audit: 0 total vulnerabilities; scoped gate: 0 high/critical with no exceptions |
| Frontend design system | Portfolio-inspired warm/ink/Sher-blue system; landing, public/auth, product core, and admin shell redesign completed locally |
| Visual browser acceptance | Landing Why Us 6/6 inverse text is green. Authenticated Company Dashboard dark mode: Business Status background `rgb(17,19,24)`; title/percentage contrast `16.73:1`, muted text `7.5:1`, success signal `10.66:1`; 12/12 text nodes inside the panel, overlap/overflow/console errors `0` |
| Delivery platform | Netlify only. The repository has no Vercel config/dependency; the external Vercel project remains, with `gitRepositoryConnected=false` verified |
| Environment isolation | Authoritative Netlify CLI read-back 4/4: `production` -> production Supabase; `deploy-preview`/`branch-deploy`/`dev` -> staging. Optional URL envs are absent; on Personal only browser-public `VITE_*` values use `All` scope |
| Staging security advisor | Errors `0`; known `vector` public-schema warning `1`; server-only RLS/no-policy infos `11` |
| Remote GitHub Actions | PR #8 run `31479695709` and main run `31479985070`, commit `e2b3e78`: success; 12 env tests, type-check, 108 tests, audit, build, and security steps green |
| Netlify preview | PR #8 deploy `6a7af0f72a34e60009692db9` ready; staging-only CSP/bundle, noindex/no-store, page/Auth/health `200`, 0 secret matches across 87,164 files |
| Production frontend | Deploy `6a7af1de285a110008fa6d31` ready, build `6a7af1de285a110008fa6d2f`, 41s, plugin success, 0 secret matches across 87,164 files; production-only CSP/bundle, page/Auth/health `200`, Realtime `OPEN` |
| Frontend Supabase key contract | Code and production accept only the modern publishable key; bundle has 1 modern key, 0 JWT-like keys, no legacy env name, and the format guard; Auth settings `200`, Realtime `OPEN`; Netlify legacy frontend env deleted |
| DB/Edge security acceptance | Fresh migration replay 32/32; local pgTAP 21/21; real Auth-token Edge tests 8/8; Realtime tables are SELECT-only and require active membership/tenant |
| Migration history | Local/remote 32/32 aligned; production `db push --dry-run`: up to date |
| Local Supabase services | Storage `v1.68.1`, Auth `v2.195.0`; all enabled containers healthy; Storage/Auth/Studio HTTP `200`; `imgproxy` stopped because transformations are disabled |

## Capability status

| Area | Status | Note |
|---|---|---|
| Auth, multi-tenant, RBAC and core web modules | Done | Main product foundation works |
| Realtime and task notifications | Done | Inbox, Tasks, Notifications, acknowledgement |
| Admin platform | Partial | Core management/monitoring exists; tenant-profile/AI-stats authenticated smoke tests and Company Dashboard dark-contrast visual acceptance were confirmed in a user session |
| Telegram | Partial / operational block | Verify `TELEGRAM_WEBHOOK_SECRET` and webhook |
| Resend inbox | Partial | Code exists; receiving/delivery E2E is unverified |
| AI Concierge/RAG and cost tracking | Partial | Foundation exists; citation UX, plan enforcement and full smoke tests remain |
| AI Document Assistant | Partial — active | 15 templates/4 languages/draft pipeline exist; PDF/DOCX and Storage do not |
| HR Candidate Analysis | Skeleton | Scaffold exists; production endpoint returns `501 NOT_IMPLEMENTED` |
| Billing / Click / Payme and AI Sales Bot | Planned | Phase 3 |

## Immediate order

1. Run authenticated Edge acceptance with an ephemeral synthetic Auth/tenant fixture in staging, then clean it up.
2. Continue Document Assistant PDF/DOCX/Storage work.

Detailed tasks: [PLAN.md](PLAN.md). Canonical source: [Uzbek STATUS](../STATUS.md).
