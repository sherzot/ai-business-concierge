# AI Business Concierge — current status

> Last code/platform snapshot verified: **2026-08-10**
> Documentation normalized: **2026-08-07**
> The local runtime, production health/auth, and remote GitHub Actions baseline were re-verified on 2026-08-07. The P0 commits were pushed and the new CI run completed fully green.
> 2026-08-08: the publishable-key commit was pushed and passed CI/Netlify deploy, but the production bundle still uses the legacy fallback. Direct browser Data API access to risk-scanner tables was closed in production.
> 2026-08-08: Realtime tenant isolation was hardened in production; active membership/tenant checks and service-role Edge authorization were centralized.
> 2026-08-08: fresh local replay passed all 32 migrations, pgTAP passed 21/21, and real local Auth-token Edge acceptance passed 8/8.
> 2026-08-08: production migration history was aligned with local; local Storage/Auth pin drift was closed and enabled full-stack health was verified.
> 2026-08-08: Supabase CLI was upgraded to `v2.112.0`; fresh replay and all acceptance/regression gates passed under the new local key/grant contract.
> 2026-08-08: the Portfolio-inspired frontend redesign passed browser acceptance, commits `83bc7e0`/`509bc2d` were pushed, PR #2 is open, and CI is green.
> 2026-08-10: PR #2 was verified merged as `65abe2f`. Four-locale copy, global form/dark-hover, tenant-context, and Super Admin AI-stats crash fixes are locally complete on `agent/fix-landing-localization-copy`; deployment is pending.

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
| Git | PR #2 merged into `main` as `65abe2f`; current fixes are local on `agent/fix-landing-localization-copy`, not committed/pushed/deployed |
| Runtime | Node.js `22.18.0`; `.nvmrc` and package engine pin `22.x` |
| Supabase CLI | Official Homebrew tap `v2.112.0`; verified with a fresh local volume |
| Backend | Supabase Edge Function `bright-api` v74 |
| Health | `200` |
| Type-check | Passed |
| Unit tests | 22/22 files, 107/107 tests |
| Production build/security check | Passed |
| Production dependency audit | Scoped gate passed: 0 unexcepted high/critical; GHSA-qwww metadata exception expires 2026-08-21 |
| Frontend design system | Portfolio-inspired warm/ink/Sher-blue system; landing, public/auth, product core, and admin shell redesign completed locally |
| Visual browser acceptance | 4/4 landing locales on desktop, Uzbek landing at 390×844, and dark login input/hover computed checks; no page errors or horizontal overflow |
| Preview CI | GitHub run `31240118332` passed; Vercel passed; Netlify Deploy Preview ready |
| Remote GitHub Actions | Run `31193931735`, commit `3e383b1`: success; every `frontend-security-gate` step passed |
| Frontend Supabase key contract | Code/deploy: publishable primary + temporary fallback; production bundle uses legacy anon fallback, Netlify env/login pending |
| DB/Edge security acceptance | Fresh migration replay 32/32; local pgTAP 21/21; real Auth-token Edge tests 8/8; Realtime tables are SELECT-only and require active membership/tenant |
| Migration history | Local/remote 32/32 aligned; production `db push --dry-run`: up to date |
| Local Supabase services | Storage `v1.68.1`, Auth `v2.195.0`; all enabled containers healthy; Storage/Auth/Studio HTTP `200`; `imgproxy` stopped because transformations are disabled |

## Capability status

| Area | Status | Note |
|---|---|---|
| Auth, multi-tenant, RBAC and core web modules | Done | Main product foundation works |
| Realtime and task notifications | Done | Inbox, Tasks, Notifications, acknowledgement |
| Admin platform | Partial | Core management/monitoring exists; the AI-stats `cost/cost_usd` crash fix is local and pending deployment |
| Telegram | Partial / operational block | Verify `TELEGRAM_WEBHOOK_SECRET` and webhook |
| Resend inbox | Partial | Code exists; receiving/delivery E2E is unverified |
| AI Concierge/RAG and cost tracking | Partial | Foundation exists; citation UX, plan enforcement and full smoke tests remain |
| AI Document Assistant | Partial — active | 15 templates/4 languages/draft pipeline exist; PDF/DOCX and Storage do not |
| HR Candidate Analysis | Skeleton | Scaffold exists; production endpoint returns `501 NOT_IMPLEMENTED` |
| Billing / Click / Payme and AI Sales Bot | Planned | Phase 3 |

## Immediate order

1. Review/commit/push `agent/fix-landing-localization-copy`; after CI, deploy frontend and `bright-api`, then production-smoke Leader Company Profile and Super Admin login.
2. Restore Netlify CLI login, set the production publishable env, redeploy, and smoke-test Auth/Realtime before removing the legacy fallback.
3. Re-review GHSA-qwww by 2026-08-21, then continue Document Assistant PDF/DOCX/Storage work.

Detailed tasks: [PLAN.md](PLAN.md). Canonical source: [Uzbek STATUS](../STATUS.md).
