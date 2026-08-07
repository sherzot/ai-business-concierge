# AI Business Concierge — current status

> Last code/platform snapshot verified: **2026-08-08**
> Documentation normalized: **2026-08-07**
> The local runtime, production health/auth, and remote GitHub Actions baseline were re-verified on 2026-08-07. The P0 commits were pushed and the new CI run completed fully green.
> 2026-08-08: the publishable-key commit was pushed and passed CI/Netlify deploy, but the production bundle still uses the legacy fallback. Direct browser Data API access to risk-scanner tables was closed in production.

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
| Git | Risk-scanner hardening commit `3e383b1` pushed to `origin/main` |
| Runtime | Node.js `22.18.0`; `.nvmrc` and package engine pin `22.x` |
| Backend | Supabase Edge Function `bright-api` v72 |
| Health | `200` |
| Type-check | Passed |
| Unit tests | 21/21 files, 101/101 tests |
| Production build/security check | Passed |
| Production dependency audit | Scoped gate passed: 0 unexcepted high/critical; GHSA-qwww metadata exception expires 2026-08-21 |
| Remote GitHub Actions | Run `31193931735`, commit `3e383b1`: success; every `frontend-security-gate` step passed |
| Frontend Supabase key contract | Code/deploy: publishable primary + temporary fallback; production bundle uses legacy anon fallback, Netlify env/login pending |
| DB security | RLS on 32/32 public tables; 8/8 views use `security_invoker`; 6/6 `SECURITY DEFINER` functions deny browser EXECUTE; risk tables deny `anon/authenticated` CRUD |

## Capability status

| Area | Status | Note |
|---|---|---|
| Auth, multi-tenant, RBAC and core web modules | Done | Main product foundation works |
| Realtime and task notifications | Done | Inbox, Tasks, Notifications, acknowledgement |
| Admin platform | Partial | Core management/monitoring exists; advanced agents and billing do not |
| Telegram | Partial / operational block | Verify `TELEGRAM_WEBHOOK_SECRET` and webhook |
| Resend inbox | Partial | Code exists; receiving/delivery E2E is unverified |
| AI Concierge/RAG and cost tracking | Partial | Foundation exists; citation UX, plan enforcement and full smoke tests remain |
| AI Document Assistant | Partial — active | 15 templates/4 languages/draft pipeline exist; PDF/DOCX and Storage do not |
| HR Candidate Analysis | Skeleton | Scaffold exists; production endpoint returns `501 NOT_IMPLEMENTED` |
| Billing / Click / Payme and AI Sales Bot | Planned | Phase 3 |

## Immediate order

1. Restore Netlify CLI login, set production `VITE_SUPABASE_PUBLISHABLE_KEY`, redeploy and smoke-test Auth/Realtime; only then remove the legacy frontend env/fallback.
2. Add cross-tenant CRUD/role fixtures; test `user_tenants`-dependent RLS and every service-role route authorization boundary.
3. Re-review/remove the GHSA-qwww metadata exception by 2026-08-21.
4. Finish PDF/DOCX, private Storage and signed URLs for the Document Assistant.
5. Close Telegram/Resend operational verification, then implement HR Candidate Analysis.

Detailed tasks: [PLAN.md](PLAN.md). Canonical source: [Uzbek STATUS](../STATUS.md).
