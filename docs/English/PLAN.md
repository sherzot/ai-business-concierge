# AI Business Concierge — active plan

> Version 6.4 · Updated 2026-08-22
> Only active and next work belongs here. The previous master plan is archived at [../archive/English/PLAN_LEGACY_2026-07-24.md](../archive/English/PLAN_LEGACY_2026-07-24.md).

## P0 — safe session start

- [x] Preserve user changes and commit the documentation workflow as `55ec941`.
- [x] Push the P0 commits to `origin/main` and confirm CI run `31188866507` for commit `06b5756` is fully green.
- [x] Run Node 22 install, type-check, 96 tests, build and security check.
- [x] Run the scoped production audit: 0 high/critical; the temporary GHSA-qwww metadata exception was removed on 2026-08-11.
- [x] Smoke-test production health `200` and unauthenticated protected route `401`.
- [x] Record evidence in DEVLOG and STATUS.

## P1 — deliver the Portfolio-inspired frontend redesign

- [x] Audit the Portfolio visual language and build warm-canvas, ink-type, Sher-blue, divider, and restrained-motion foundations.
- [x] Redesign landing/public forms, auth flows, product shell/dashboard, Inbox, Tasks, Docs, Settings, and admin shell.
- [x] Align remaining legacy modules through semantic compatibility while preserving light/dark, reduced motion, and focus-visible behavior.
- [x] Pass TypeScript, 101/101 tests, production build, security gate, and dependency audit.
- [x] Run browser acceptance for desktop/mobile landing, login, forgot-password, and contact routes; no overlay, browser errors, or horizontal overflow found.
- [x] Commit/push the finding-free redesign as `83bc7e0`, open PR #2, verify GitHub CI and the Netlify preview, and merge PR #2 into `main` as `65abe2f`.

## P1 — finish the Supabase/Netlify security handoff

- [x] Confirm a production publishable key exists; migrate config, env type/example and CI while keeping a temporary rollout fallback.
- [x] Push publishable-key commit `35d4b91`, confirm GitHub CI run `31192041119` green and Netlify production deploy ready; identify that the bundle uses the legacy fallback.
- [x] Set the Netlify production publishable env, redeploy, pass Auth `200`/Realtime `OPEN` smoke tests, and remove the legacy frontend env.
- [x] Keep direct browser Supabase access limited to Auth/Realtime and add a `from/rpc/storage/functions` regression gate.
- [x] Inventory public RLS/grants/views/functions: 32/32 tables use RLS, 8/8 views use `security_invoker`, and 6/6 `SECURITY DEFINER` functions deny browser EXECUTE.
- [x] Harden the server-only risk-scanner boundary by removing browser CRUD grants/policies and applying the production migration.
- [x] Unify the five-state membership lifecycle; add the active membership/tenant Realtime helper, read-only browser grants, and a 21-case rollback pgTAP fixture.
- [x] Verify cross-tenant SELECT and browser INSERT/UPDATE/DELETE denial under the real `authenticated` DB role: 4/21 failed before the fix and 21/21 passed after it.
- [x] Move tenant-protected service-role routes to DB-canonical context, close JWT role/tenant bypasses, and add active-admin middleware for every `/admin/*` route.
- [x] Run active/blocked/terminated, super-admin cross-tenant/admin, and role-`403` Edge integration tests with local non-production Auth fixtures/tokens: 8/8 passed, with no production users/data.
- [x] Repair and run a fresh local migration stack: after the core baseline and historical PL/pgSQL replay fix, 32/32 migrations and pgTAP 21/21 passed.
- [x] Upgrade Supabase CLI from `v2.101.0` to `v2.112.0` and rerun fresh/full-stack regression: 32/32 migrations, pgTAP 21/21, Edge 8/8, Storage/Auth/Studio `200`.
- [x] Decide delivery architecture: Netlify + Supabase only; production uses production Supabase, while preview/branch/dev use a separate staging project; remove Vercel from the active architecture.
- [x] Add the fail-closed `validate:deploy-env` guard, 10 Node tests, dynamic Supabase CSP, and CI/security-gate wiring.
- [x] Show the `$0/month` staging cost for `sherzot's Org` and create the project in `ap-southeast-1` after two-step user confirmation.
- [x] Apply 32/32 migrations to staging, deploy `bright-api` v1, and pass health/Auth-settings/security-advisor smoke tests.
- [x] Restrict staging Auth redirects to the Netlify preview wildcard/local Vite URLs; explicitly pin email confirmation, 8-digit/1-minute OTP, and TOTP.
- [x] Map Netlify production env to production and staging env to deploy-preview/branch-deploy/dev, remove optional URL envs, and pass authoritative CLI read-back for 4/4 contexts. On Personal, only browser-public `VITE_*` values use `All` scope.
- [x] Disconnect the external Vercel Git integration while preserving project/deployment history; immediately remove the CLI-created OIDC `.env.local` and `.vercel` metadata.

## P1 — complete Phase 2 AI Document Assistant

- [ ] Securely set `ANTHROPIC_API_KEY` in staging Edge secrets and make the authenticated real-provider preview/save smoke green.
- [ ] After green staging smoke, deploy production migration `20260821000000` plus `bright-api` and run public/protected smoke tests.
- [ ] After the web flow is stable, add Telegram step-by-step generation and file delivery.

## P2 — operational integrations

- [ ] After production v15 fail-closed `503`, set a new `TELEGRAM_WEBHOOK_SECRET` and reconnect Telegram `setWebhook` with the same value.
- [ ] End-to-end test Resend receiving, signature, tenant mapping and delivery.
- [ ] **BLOCKED — paid plan:** the Supabase organization is Free; enable Leaked Password Protection after an approved Pro+ upgrade.
- [ ] Select Netlify preview protection.

## P2 — HR Candidate Analysis

- [ ] **BLOCKED — `ANTHROPIC_API_KEY`:** connect real CV semantic structuring and Sonnet scoring/report LLM Router calls to the prepared strict-output and account-before-validation contract.
- [ ] After LLM integration, wire quota-lease release and the active route, remove `501`, and run full-flow integration/manual acceptance.

## Later phases

- Phase 3: AI Sales Bot, Click/Payme, subscriptions, usage billing and idempotency.
- Phase 4: billing/analytics agents, E2E, export/delete, push and performance.

Canonical detailed plan: [Uzbek PLAN](../PLAN.md).
