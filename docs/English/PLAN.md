# AI Business Concierge — active plan

> Version 4.0 · Updated 2026-08-07
> Only active and next work belongs here. The previous master plan is archived at [../archive/English/PLAN_LEGACY_2026-07-24.md](../archive/English/PLAN_LEGACY_2026-07-24.md).

## P0 — safe session start

- [ ] Preserve existing user changes and inspect Git/commit baseline.
- [ ] Confirm remote `frontend-security-gate` is green.
- [ ] Run install, type-check, 96+ tests, production audit, build and security check.
- [ ] Smoke-test production health `200` and unauthenticated protected route `401`.
- [ ] Record evidence in DEVLOG and STATUS.

## P1 — finish the Supabase/Netlify security handoff

- [ ] Migrate safely to the `VITE_SUPABASE_PUBLISHABLE_KEY` env contract.
- [ ] Align config, env example, Vitest, CI and Netlify names.
- [ ] Keep direct browser Supabase access limited to Auth/Realtime and add a regression gate.
- [ ] Audit public RLS/grants/RPCs and cross-tenant CRUD denial.
- [ ] Verify every service-role and `SECURITY DEFINER` authorization boundary.
- [ ] Decide production/preview environment and secret separation.

## P1 — complete Phase 2 AI Document Assistant

- [ ] Add LLM-guided questions and polishing.
- [ ] Generate real PDF/DOCX with Noto Sans support.
- [ ] Add private Storage, tenant/user paths, RLS, file validation and signed URLs.
- [ ] Add tests and four-language/theme regression smoke tests.
- [ ] After the web flow is stable, add Telegram step-by-step generation and file delivery.

## P2 — operational integrations

- [ ] Verify/set `TELEGRAM_WEBHOOK_SECRET`, reconnect webhook and smoke-test bot flows.
- [ ] End-to-end test Resend receiving, signature, tenant mapping and delivery.
- [ ] Enable Supabase Leaked Password Protection and select Netlify preview protection.

## P2 — HR Candidate Analysis

- [ ] Implement GitHub analysis/cache and PDF/DOCX parsing.
- [ ] Wire Sonnet structured scoring/reporting through the LLM Router.
- [ ] Add auth, roles, rate limit, cost log and Zod validation.
- [ ] Complete frontend results, remove the `501` stub, and test the full flow.

## Later phases

- Phase 3: AI Sales Bot, Click/Payme, subscriptions, usage billing and idempotency.
- Phase 4: billing/analytics agents, E2E, export/delete, push and performance.

Canonical detailed plan: [Uzbek PLAN](../PLAN.md).
