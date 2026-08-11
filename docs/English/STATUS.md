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
| Git | PR #6 squash-merged into `main` as `2b71a49`; source commit `85cb241` |
| Runtime | Node.js `22.18.0`; `.nvmrc` and package engine pin `22.x` |
| Supabase CLI | Official Homebrew tap `v2.112.0`; verified with a fresh local volume |
| Backend | Supabase Edge Function `bright-api` v75, `ACTIVE`, `verify_jwt=false` |
| Health | `200` |
| Type-check | Passed |
| Unit tests | 23/23 files, 108/108 tests |
| Production build/security check | Passed |
| Production dependency audit | Scoped gate passed: 0 unexcepted high/critical; GHSA-qwww metadata exception expires 2026-08-21 |
| Frontend design system | Portfolio-inspired warm/ink/Sher-blue system; landing, public/auth, product core, and admin shell redesign completed locally |
| Visual browser acceptance | All 6/6 Why Us reasons render with inverse text in dark/light modes: title `rgb(244,243,239)`, background `rgb(17,19,24)`, overflow `0`, no console/overlay errors; dashboard inverse markup is covered by a regression test |
| Preview CI | PR #6 Netlify preview deploy `6a7ab3ed99861d0008a32837` ready; Vercel deployment `EPxGDaLxfNeKnHPKfwsUzxp7sZfd` ready |
| Remote GitHub Actions | Main closeout run `31462960098`, commit `f9152c6`: success (58s); PR #6 run `31461980468`, commit `85cb241`: success (48s) |
| Production frontend | Latest docs-only Netlify deploy `6a7ab804ea3f550008240f11` ready, build `6a7ab804ea3f550008240f0f`, published at 2026-08-11T05:50:30.225Z; 32s, plugin success, 0 secret matches across 87,160 files. No-fallback app rollout artifact: `6a7ab5474835d660f21249cd` |
| Frontend Supabase key contract | Code and production accept only the modern publishable key; bundle has 1 modern key, 0 JWT-like keys, no legacy env name, and the format guard; Auth settings `200`, Realtime `OPEN`; Netlify legacy frontend env deleted |
| DB/Edge security acceptance | Fresh migration replay 32/32; local pgTAP 21/21; real Auth-token Edge tests 8/8; Realtime tables are SELECT-only and require active membership/tenant |
| Migration history | Local/remote 32/32 aligned; production `db push --dry-run`: up to date |
| Local Supabase services | Storage `v1.68.1`, Auth `v2.195.0`; all enabled containers healthy; Storage/Auth/Studio HTTP `200`; `imgproxy` stopped because transformations are disabled |

## Capability status

| Area | Status | Note |
|---|---|---|
| Auth, multi-tenant, RBAC and core web modules | Done | Main product foundation works |
| Realtime and task notifications | Done | Inbox, Tasks, Notifications, acknowledgement |
| Admin platform | Partial | Core management/monitoring exists; the user confirmed tenant-profile/AI-stats authenticated smoke tests, dashboard dark contrast is in production, and a user visual recheck remains |
| Telegram | Partial / operational block | Verify `TELEGRAM_WEBHOOK_SECRET` and webhook |
| Resend inbox | Partial | Code exists; receiving/delivery E2E is unverified |
| AI Concierge/RAG and cost tracking | Partial | Foundation exists; citation UX, plan enforcement and full smoke tests remain |
| AI Document Assistant | Partial — active | 15 templates/4 languages/draft pipeline exist; PDF/DOCX and Storage do not |
| HR Candidate Analysis | Skeleton | Scaffold exists; production endpoint returns `501 NOT_IMPLEMENTED` |
| Billing / Click / Payme and AI Sales Bot | Planned | Phase 3 |

## Immediate order

1. Visually recheck the Company Dashboard Business Status panel in authenticated production dark mode.
2. Re-review GHSA-qwww by 2026-08-21.
3. Continue Document Assistant PDF/DOCX/Storage work.

Detailed tasks: [PLAN.md](PLAN.md). Canonical source: [Uzbek STATUS](../STATUS.md).
