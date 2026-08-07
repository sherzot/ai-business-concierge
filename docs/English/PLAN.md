# AI Business Concierge — active plan

> Version 4.0 · Updated 2026-08-07
> Only active and next work belongs here. The previous master plan is archived at [../archive/English/PLAN_LEGACY_2026-07-24.md](../archive/English/PLAN_LEGACY_2026-07-24.md).

## P0 — safe session start

- [x] Preserve user changes and commit the documentation workflow as `55ec941`.
- [x] Confirm the latest existing remote CI run for `730b3bd` is green.
- [ ] After pushing local `55ec941` and `a088fef`, verify the new CI run until green.
- [x] Run Node 22 install, type-check, 96 tests, build and security check.
- [x] Run scoped production audit: 0 unexcepted high/critical; GHSA-qwww metadata exception expires 2026-08-21.
- [x] Smoke-test production health `200` and unauthenticated protected route `401`.
- [x] Record evidence in DEVLOG and STATUS.

## P1 — finish the Supabase/Netlify security handoff

- [ ] Re-review/remove the GHSA-qwww metadata exception by 2026-08-21.
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
