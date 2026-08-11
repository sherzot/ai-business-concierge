# AI Business Concierge — активный план

> Версия 6.0 · Обновлено 2026-08-12
> Здесь только активные и следующие задачи. Старый master plan: [../archive/Russian/PLAN_LEGACY_2026-07-24.md](../archive/Russian/PLAN_LEGACY_2026-07-24.md).

## P0 — безопасное начало сессии

- [x] Сохранить user changes и commit documentation workflow как `55ec941`.
- [x] Отправить P0 commits в `origin/main` и подтвердить полностью green CI run `31188866507` для commit `06b5756`.
- [x] Запустить Node 22 install, type-check, 96 tests, build и security check.
- [x] Scoped production audit: high/critical 0; временное GHSA-qwww metadata exception удалено 2026-08-11.
- [x] Проверить production health `200` и protected route без auth `401`.
- [x] Записать доказательства в DEVLOG и STATUS.

## P1 — доставить Portfolio-inspired frontend redesign

- [x] Проанализировать visual language Portfolio и создать warm canvas, ink typography, Sher-blue, dividers и restrained-motion foundation.
- [x] Переработать landing/public forms, auth flows, product shell/dashboard, Inbox, Tasks, Docs, Settings и admin shell.
- [x] Выровнять оставшиеся legacy modules через semantic compatibility с сохранением light/dark, reduced motion и focus-visible.
- [x] Пройти TypeScript, 101/101 tests, production build, security gate и dependency audit.
- [x] Выполнить browser acceptance desktop/mobile landing, login, forgot-password и contact routes; overlay, browser errors и horizontal overflow не обнаружены.
- [x] Commit/push redesign без находок как `83bc7e0`, открыть PR #2, проверить GitHub CI и Netlify preview и merge PR #2 в `main` как `65abe2f`.

## P1 — завершить Supabase/Netlify security handoff

- [x] Подтвердить production publishable key; перевести config, env type/example и CI, сохранив temporary rollout fallback.
- [x] Отправить publishable-key commit `35d4b91`, подтвердить green GitHub CI run `31192041119` и ready Netlify production deploy; определить, что bundle использует legacy fallback.
- [x] Установить Netlify production publishable env, redeploy, пройти Auth `200`/Realtime `OPEN` smoke tests и удалить legacy frontend env.
- [x] Ограничить direct browser Supabase только Auth/Realtime и добавить `from/rpc/storage/functions` regression gate.
- [x] Инвентаризировать public RLS/grants/views/functions: RLS на 32/32 tables, `security_invoker` на 8/8 views, browser EXECUTE закрыт для 6/6 `SECURITY DEFINER` functions.
- [x] Усилить server-only границу risk scanner: удалить browser CRUD grants/policies и применить production migration.
- [x] Объединить lifecycle membership из пяти статусов; добавить active membership/tenant helper, read-only browser grants и rollback pgTAP fixture из 21 проверки.
- [x] Проверить cross-tenant SELECT и запрет browser INSERT/UPDATE/DELETE под реальной DB role `authenticated`: до исправления 4/21 fail, после — 21/21 pass.
- [x] Перевести tenant-protected service-role routes на DB-canonical context, закрыть JWT role/tenant bypass и добавить active-admin middleware для всех `/admin/*` routes.
- [x] Запустить active/blocked/terminated, super-admin cross-tenant/admin и role-`403` Edge integration tests с local non-production Auth fixtures/tokens: 8/8 pass, без production users/data.
- [x] Исправить и запустить fresh local migration stack: после core baseline и historical PL/pgSQL replay fix прошли 32/32 migrations и pgTAP 21/21.
- [x] Обновить Supabase CLI с `v2.101.0` до `v2.112.0` и повторить fresh/full-stack regression: 32/32 migrations, pgTAP 21/21, Edge 8/8, Storage/Auth/Studio `200`.
- [x] Принять delivery architecture: только Netlify + Supabase; production использует production Supabase, preview/branch/dev — отдельный staging project; исключить Vercel из active architecture.
- [x] Добавить fail-closed guard `validate:deploy-env`, 10 Node tests, dynamic Supabase CSP и wiring CI/security gate.
- [x] Показать `$0/month` cost staging project для `sherzot's Org` и после двухэтапного подтверждения user создать его в `ap-southeast-1`.
- [x] Применить 32/32 migrations в staging, deploy `bright-api` v1 и пройти health/Auth-settings/security-advisor smoke tests.
- [x] Ограничить staging Auth redirects Netlify preview wildcard/local Vite URLs; явно pin email confirmation, 8-digit/1-minute OTP и TOTP.
- [x] Разделить Netlify production и deploy-preview/branch-deploy/dev env, удалить optional URL envs и пройти authoritative CLI read-back 4/4 contexts. На Personal только browser-public `VITE_*` используют `All` scope.
- [x] Отключить external Vercel Git integration, сохранив project/deployment history; сразу удалить созданные CLI OIDC `.env.local` и `.vercel` metadata.

## P1 — завершить Phase 2 AI Документолог

- [ ] Добавить LLM-вопросы и polishing.
- [ ] После стабильного web flow подключить Telegram wizard и отправку файла.
- [ ] После безопасного решения Cloudflare Auth Admin `403` повторить production authenticated PDF/DOCX signed-download, cross-tenant deny, direct Storage deny и delete-cleanup synthetic acceptance.

## P2 — operational integrations

- [ ] Проверить/установить `TELEGRAM_WEBHOOK_SECRET`, переподключить webhook и проверить bot flow.
- [ ] E2E проверить Resend receiving, signature, tenant mapping и delivery.
- [ ] Включить Leaked Password Protection и выбрать Netlify preview protection.

## P2 — HR Candidate Analysis

- [ ] Реализовать GitHub analysis/cache и PDF/DOCX parser.
- [ ] Подключить Sonnet structured scoring/reporting через LLM Router.
- [ ] Добавить auth, roles, rate limit, cost log и Zod validation.
- [ ] Завершить frontend, убрать `501` stub и протестировать полный flow.

## Последующие фазы

- Phase 3: AI Sales Bot, Click/Payme, subscriptions, usage billing и idempotency.
- Phase 4: billing/analytics agents, E2E, export/delete, push и performance.

Основной подробный план: [узбекский PLAN](../PLAN.md).
