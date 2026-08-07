# AI Business Concierge — current status

> Last code/platform snapshot verified: **2026-07-24**
> Documentation normalized: **2026-08-07**
> Production and CI were not re-verified on 2026-08-07; runtime claims below come from the latest DEVLOG evidence.

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
| Git | `730b3bd`, equal to `origin/main` in that session |
| Backend | Supabase Edge Function `bright-api` v72 |
| Health | `200` |
| Type-check | Passed |
| Unit tests | 19/19 files, 96/96 tests |
| Production build/security check | Passed |
| Production dependency audit | 0 vulnerabilities |
| Remote GitHub Actions | Must be confirmed in the next session |

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

1. Re-confirm Git, CI, tests, build, security gate and production health/auth baseline.
2. Safely migrate the frontend env contract to `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. Complete browser Supabase, RLS/grants and cross-tenant authorization audits.
4. Finish PDF/DOCX, fonts, private Storage and signed URLs for the Document Assistant.
5. Close Telegram secret and Resend delivery verification.
6. Then implement HR Candidate Analysis.

Detailed tasks: [PLAN.md](PLAN.md). Canonical source: [Uzbek STATUS](../STATUS.md).
