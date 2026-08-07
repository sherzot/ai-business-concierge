# AI Business Concierge — current status

> Last code/platform snapshot verified: **2026-08-07**
> Documentation normalized: **2026-08-07**
> Local runtime and production health/auth smoke tests were re-verified on 2026-08-07. GitHub CLI authentication was restored and the latest existing remote CI run was confirmed green; the new local commits remain unpushed.

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
| Git | Local docs commit `55ec941`; local `main` is ahead of unpushed `origin/main` |
| Runtime | Node.js `22.18.0`; `.nvmrc` and package engine pin `22.x` |
| Backend | Supabase Edge Function `bright-api` v72 |
| Health | `200` |
| Type-check | Passed |
| Unit tests | 19/19 files, 96/96 tests |
| Production build/security check | Passed |
| Production dependency audit | Scoped gate passed: 0 unexcepted high/critical; GHSA-qwww metadata exception expires 2026-08-21 |
| Remote GitHub Actions | Latest run for `730b3bd` succeeded; local `55ec941` and `a088fef` are unpushed, so no new run exists for them |

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

1. Decide whether to push local commits `55ec941` and `a088fef`; after push, verify the new CI run until green.
2. Re-review/remove the GHSA-qwww metadata exception by 2026-08-21.
3. Safely migrate the frontend env contract to `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Complete browser Supabase, RLS/grants and cross-tenant authorization audits.
5. Finish PDF/DOCX, private Storage and signed URLs for the Document Assistant.
6. Close Telegram/Resend operational verification, then implement HR Candidate Analysis.

Detailed tasks: [PLAN.md](PLAN.md). Canonical source: [Uzbek STATUS](../STATUS.md).
