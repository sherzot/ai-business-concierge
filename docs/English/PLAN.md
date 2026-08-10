# AI Business Concierge — active plan

> Version 4.9 · Updated 2026-08-10
> Only active and next work belongs here. The previous master plan is archived at [../archive/English/PLAN_LEGACY_2026-07-24.md](../archive/English/PLAN_LEGACY_2026-07-24.md).

## P0 — safe session start

- [x] Preserve user changes and commit the documentation workflow as `55ec941`.
- [x] Push the P0 commits to `origin/main` and confirm CI run `31188866507` for commit `06b5756` is fully green.
- [x] Run Node 22 install, type-check, 96 tests, build and security check.
- [x] Run scoped production audit: 0 unexcepted high/critical; GHSA-qwww metadata exception expires 2026-08-21.
- [x] Smoke-test production health `200` and unauthenticated protected route `401`.
- [x] Record evidence in DEVLOG and STATUS.

## P1 — deliver the Portfolio-inspired frontend redesign

- [x] Audit the Portfolio visual language and build warm-canvas, ink-type, Sher-blue, divider, and restrained-motion foundations.
- [x] Redesign landing/public forms, auth flows, product shell/dashboard, Inbox, Tasks, Docs, Settings, and admin shell.
- [x] Align remaining legacy modules through semantic compatibility while preserving light/dark, reduced motion, and focus-visible behavior.
- [x] Pass TypeScript, 101/101 tests, production build, security gate, and dependency audit.
- [x] Run browser acceptance for desktop/mobile landing, login, forgot-password, and contact routes; no overlay, browser errors, or horizontal overflow found.
- [x] Commit/push the finding-free redesign as `83bc7e0`, open PR #2, verify GitHub CI/Vercel/Netlify preview, and merge PR #2 into `main` as `65abe2f`.
- [ ] Merge the Company Dashboard inverse-contrast fix and regression test from PR #5; deploy it with the PR #4 landing fix to Netlify production and run a dark-mode smoke test.

## P1 — finish the Supabase/Netlify security handoff

- [ ] Re-review/remove the GHSA-qwww metadata exception by 2026-08-21.
- [x] Confirm a production publishable key exists; migrate config, env type/example and CI while keeping a temporary rollout fallback.
- [x] Push publishable-key commit `35d4b91`, confirm GitHub CI run `31192041119` green and Netlify production deploy ready; identify that the bundle uses the legacy fallback.
- [ ] After Netlify CLI login, set the production publishable env, redeploy, smoke-test Auth/Realtime, then remove the legacy frontend env/fallback.
- [x] Keep direct browser Supabase access limited to Auth/Realtime and add a `from/rpc/storage/functions` regression gate.
- [x] Inventory public RLS/grants/views/functions: 32/32 tables use RLS, 8/8 views use `security_invoker`, and 6/6 `SECURITY DEFINER` functions deny browser EXECUTE.
- [x] Harden the server-only risk-scanner boundary by removing browser CRUD grants/policies and applying the production migration.
- [x] Unify the five-state membership lifecycle; add the active membership/tenant Realtime helper, read-only browser grants, and a 21-case rollback pgTAP fixture.
- [x] Verify cross-tenant SELECT and browser INSERT/UPDATE/DELETE denial under the real `authenticated` DB role: 4/21 failed before the fix and 21/21 passed after it.
- [x] Move tenant-protected service-role routes to DB-canonical context, close JWT role/tenant bypasses, and add active-admin middleware for every `/admin/*` route.
- [x] Run active/blocked/terminated, super-admin cross-tenant/admin, and role-`403` Edge integration tests with local non-production Auth fixtures/tokens: 8/8 passed, with no production users/data.
- [x] Repair and run a fresh local migration stack: after the core baseline and historical PL/pgSQL replay fix, 32/32 migrations and pgTAP 21/21 passed.
- [x] Upgrade Supabase CLI from `v2.101.0` to `v2.112.0` and rerun fresh/full-stack regression: 32/32 migrations, pgTAP 21/21, Edge 8/8, Storage/Auth/Studio `200`.
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
