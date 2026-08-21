# AI Business Concierge — текущее состояние

> Последний подтверждённый snapshot кода/platform: **2026-08-21**
> Документация упорядочена: **2026-08-07**
> Local runtime, production health/auth и remote GitHub Actions baseline повторно проверены 2026-08-07. P0 commits отправлены, новый CI run завершён полностью green.
> 2026-08-08: commit publishable key отправлен и прошёл CI/Netlify deploy, но production bundle пока использует legacy fallback. Прямой browser Data API доступ к risk scanner tables закрыт в production.
> 2026-08-08: Realtime tenant isolation усилен в production; проверки active membership/tenant и service-role Edge authorization централизованы.
> 2026-08-08: fresh local replay прошёл 32/32 migrations, pgTAP 21/21, real local Auth-token Edge acceptance 8/8.
> 2026-08-08: production migration history выровнена с local; local Storage/Auth pin drift закрыт и enabled full-stack health подтверждён.
> 2026-08-08: Supabase CLI обновлён до `v2.112.0`; fresh replay и все acceptance/regression gates прошли с новым local key/grant contract.
> 2026-08-08: Portfolio-inspired frontend redesign прошёл browser acceptance, commits `83bc7e0`/`509bc2d` отправлены, PR #2 открыт, CI green.
> 2026-08-10: PR #3 merged в `main` как `79be466`; Codex review hotfix `aee6692` также pushed в `main`. Netlify production deploy `6a79d69c9aa5a6bcf326e83c` ready, `bright-api` v75 ACTIVE; остаются authenticated smoke-tests двух ролей.
> 2026-08-10: User подтвердил успешные authenticated production checks Leader Company Profile и Super Admin dashboard. Landing Why Us fix из PR #4 и Company Dashboard fix из PR #5 merged в `main` и shipped в Netlify production deploy `6a79e664a453161423131204`; остаётся authenticated dashboard visual recheck.
> 2026-08-11: Netlify production переведён на modern `sb_publishable_...` key, smoke tests Auth `200` и Realtime `OPEN` прошли, legacy frontend env удалён. Source fallback removal подготовлен в `agent/remove-legacy-supabase-anon-fallback`, GitHub CLI auth подтверждён через keyring.
> 2026-08-11: No-fallback source merged в `main` через PR #6 как `2b71a49`; GitHub CI green и final Netlify deploy `6a7ab5474835d660f21249cd` ready. Production bundle/Auth/Realtime rechecks прошли; publishable-key handoff завершён.
> 2026-08-11: User открыл authenticated production session Leader; Company Dashboard Business Status panel полностью проверен в dark mode через computed contrast и visual screenshot. Текст виден, overlap/overflow/browser errors нет; acceptance завершён.
> 2026-08-11: Raw npm production audit вернул 0 vulnerabilities; временное metadata exception GHSA-qwww удалено, а production audit gate без исключений успешно пройден.
> 2026-08-11: GHSA exception removal напрямую push в `main` как `1fb6c0c`; GitHub CI run `31466592524` завершён green со всеми security-gate steps.
> 2026-08-11: Единственной активной delivery platform выбраны Netlify + Supabase; Vercel Git integration отключён. Staging Supabase project `$0/month` создан после двухэтапного user confirmation; 32/32 migrations, `bright-api` v1, Auth hardening и Netlify context isolation green 4/4.
> 2026-08-11: Isolation PR #7 merged в `main` как `3fb1592`; PR и main CI green. Netlify preview/production smoke tests подтвердили соответствующие staging/production refs, Auth/health `200`, Realtime `OPEN`, CSP и preview noindex/no-store; Vercel не создал новый deployment.
> 2026-08-11: Codex `.env`/CSP hotfix PR #7 shipped через PR #8 как `e2b3e78` в main/production; CI `31479695709`/`31479985070` и preview/production smoke green. Codex mode/STATUS follow-ups PR #8 active в `agent/fix-security-check-build-mode`.
> 2026-08-11: Codex endpoint-drift P2 finding PR #9 исправлен до merge; security gate сравнивает generated CSP ref со всеми bundled Supabase HTTPS/WSS endpoint refs. Deployment/security environment tests 14/14, mismatched fixture ожидаемо blocked.
> 2026-08-11: PR #9 merged как `c00362a` в main/production; PR/main CI green. Preview/production CSP/bundle isolation, Auth/health и production Realtime smoke tests прошли.
> 2026-08-11: Staging переведён на modern Edge key overrides, legacy anon/service-role keys отключены. Real synthetic authenticated Edge acceptance прошёл 8/8 с обязательным cleanup двух tenants/пяти Auth users и final fixture count 0/0.
> 2026-08-11: Acceptance changes push как `cc31fe7` в draft PR #10; GitHub CI run `31485875838` и Netlify deploy-preview `6a7b047d3150bc00088fc18d` green.
> 2026-08-11: Real PDF/DOCX AI Документолога, embedded Noto Sans JP и private Storage contract завершены в staging; pgTAP 12/12 и binary/frontend gates green, `bright-api` v5 ACTIVE. Production намеренно не изменён.
> 2026-08-12: CI PR #11 green на `7837778`; P2 Codex re-review по signed-URL compensation и concurrent export исправлены DB-first cleanup, compare-and-swap и 120-second retained-version grace. Staging 35/35 migrations, `bright-api` v7, health `200`.
> 2026-08-12: P2 Codex после green `35fa078` заменили retained cleanup на 65-second export lease и `documents.row_version` CAS. Staging 36/36 migrations, `bright-api` v8, health `200`.
> 2026-08-12: P2 Codex для `0532a74` закрыты post-signing final lease pin и delete/export row-version CAS. Staging `bright-api` v9 ACTIVE, health `200`.
> 2026-08-12: P2 Codex для `661401a` закрыты binary-before-DB publish и O(n) PDF wrapping. Staging `bright-api` v10 ACTIVE, health `200`, Deno 7/7.
> 2026-08-12: Final head PR #11 `6db478d` прошёл CI/Netlify gates и Codex re-review без major issues, затем merged в `main` как `8f179da`. В production выпущены 36/36 migrations, `bright-api` v76 и Netlify deploy `6a7bad961b16200007cfd88e`; public/protected smoke tests green. Authenticated synthetic acceptance заблокирован Cloudflare `403` до создания fixture, финальный residue 0/0/0/0/0/0.
> 2026-08-21: Tenant-scoped polishing preview AI Документолога локально готов. Backend 9/9, frontend 24/24 files и 111/111 tests, type-check/build/security/deploy-env/audit gates green; staging/production deploy и real-provider smoke остаются.
> 2026-08-21: Overlap landing hero TEAM/08 card и caption локально исправлен; frontend 25/25 files и 112/112 tests, type-check green. Browser acceptance 2048×1080: gap 12.73px, overlap/overflow/console errors 0.
> 2026-08-21: Локально закрыты 3 P2 и 1 P3 findings AI polishing: chat/polish token budgets разделены, unusable outputs учитываются в usage/cost, raw instructions удалены из logs, four-locale error envelope стандартизирован. Backend 14/14, frontend 26/26 files и 115/115 tests green.
> 2026-08-21: Локально закрыты оставшиеся 5 findings AI polishing: восстановлен Telegram cache scope, provider timeout покрывает полный body lifecycle, polishing quota atomically резервируется в PostgreSQL, stale AI output не перезаписывает user draft, modal scroll остаётся внутри короткого viewport. Backend 18/18, Telegram check, frontend 26/26 files и 117/117 tests, type-check/build, canonical fresh migration replay 37/37 и local database pgTAP 45/45 green.
> 2026-08-21: `4b51fec` pushed в main; CI `32461091448` и Netlify production deploy `6a88056075359300089b9fa5` green. Staging переведён на 37/37 migrations и `bright-api` v11; authenticated smoke заблокирован `503 AI_UNAVAILABLE`, потому что в staging нет `ANTHROPIC_API_KEY`, residue fixture 0/0/0/0.
> 2026-08-21: Production authenticated binary acceptance green: DOCX/PDF signed downloads, direct Storage deny `400`, cross-tenant deny `404`, delete `200`; authoritative residue document/generated/object 0/0/0 и final fixture 0/0/0/0/0. Smart CDN cached URL может оставаться `200` до 60 секунд после удаления.

## Текущая фаза

- Phase 0 Foundation: **завершена**.
- Phase 1 Telegram MVP: **функциональность готова, осталась проверка secret/webhook**.
- Phase 1.5 Company Auth & Management: **завершена**.
- Phase 2 AI Документолог + Landing: **активна**.
- Phase 3 Sales Bot + Billing: **не начата**.
- Phase 4 Advanced Admin AI: **есть основа, полная фаза не начата**.

## Последний подтверждённый технический snapshot

| Проверка | Состояние |
|---|---|
| Git | Live GitHub `main` и local `main` синхронизированы этим closeout; остаются только три user-owned untracked copies |
| Runtime | Node.js `22.18.0`; `.nvmrc` и package engine `22.x` |
| Supabase CLI | Official Homebrew tap `v2.112.0`; подтверждён на fresh local volume |
| Backend | Production Supabase Edge Function `bright-api` v76, `ACTIVE`, `verify_jwt=false`; SHA совпадает со staging v10 |
| Health | `200` |
| Staging Supabase | `piqsyfwrjtormrlenjix`, `ap-southeast-1`, `$0/month`, `ACTIVE_HEALTHY`; 37/37 migrations, `bright-api` v11 ACTIVE, health `200`, unauth docs/polish `401 TENANT_REQUIRED` |
| Staging Auth/API keys | Netlify preview wildcard + local Vite redirect allow-list; email confirmation ON, 8-digit/1-minute OTP, TOTP ON; Auth settings HTTP `200`, autoconfirm false. Edge использует modern overrides `SB_ANON_KEY`/`SB_SERVICE_ROLE_KEY`; legacy anon/service-role API keys disabled |
| Type-check | Успешно в clean temporary frontend install |
| Unit tests | Frontend 26/26 files, 117/117 tests; AI polish/router/usage Deno 18/18; прежний document binary/lifecycle Deno 7/7 |
| Deployment environment guard | 14/14 Node tests: 10 isolation-contract checks + 2 Vite `.env` fallback/runtime-precedence + 2 bundled-endpoint extraction regressions |
| Production build/security check | Build прошёл с synthetic non-production ref; CSP создан из этого ref; проверено 10 build/Netlify файлов |
| Production dependency audit | Raw audit: всего 0 vulnerabilities; scoped gate без исключений: high/critical 0 |
| Frontend design system | Portfolio-inspired warm/ink/Sher-blue; landing, public/auth, product core и admin shell redesign завершён локально |
| Visual browser acceptance | Landing Why Us 6/6 inverse text green. Landing hero TEAM/caption: gap 12.73px на 2048×1080, overlap/overflow/console errors `0`. Authenticated Company Dashboard dark mode: title/percentage contrast `16.73:1`, muted text `7.5:1`, success signal `10.66:1`, 12/12 text nodes внутри panel |
| Delivery platform | Только Netlify. В repository нет Vercel config/dependency; внешний Vercel project сохранён, `gitRepositoryConnected=false` подтверждён |
| Environment isolation | Authoritative Netlify CLI read-back 4/4: `production` -> production Supabase; `deploy-preview`/`branch-deploy`/`dev` -> staging. Optional URL envs отсутствуют; на Personal только browser-public `VITE_*` используют `All` scope |
| Staging security advisor | Errors `0`; известный `vector` public-schema warning `1`; server-only RLS/no-policy infos `11` |
| Remote GitHub Actions | Main run `32461091448` для commit `4b51fec` success: type-check, 117 tests, deploy-env, audit, build и security gate green |
| Netlify preview | Новый deploy preview не создан, потому что slice pushed напрямую в `main`; Netlify использовал production context |
| Production frontend | Deploy `6a88056075359300089b9fa5` ready, build `6a88056075359300089b9fa3`, commit `4b51fec`, 34s, plugin success, 0 secret matches в 87,170 files; `/` и `/dashboard/docs` `200`, CSP и production-only bundle green |
| Frontend Supabase key contract | Code и production принимают только modern publishable key; bundle: modern key 1, JWT-like keys 0, legacy env name отсутствует, format guard есть; Auth settings `200`, Realtime `OPEN`; legacy frontend env Netlify удалён |
| DB/Edge security acceptance | Fresh migration replay 32/32; local pgTAP 21/21; local real Auth-token Edge tests 8/8; staging modern-key remote Edge 8/8, cleanup двух tenants/пяти Auth users и final fixture 0/0; Realtime tables SELECT-only и требуют active membership/tenant |
| Document binary/Storage acceptance | Real PDF/DOCX lifecycle Deno 7/7. Production authenticated DOCX/PDF signed downloads green; direct Storage `400`, cross-tenant export `404`, delete `200`, residue document/generated/object 0/0/0 и final fixture 0/0/0/0/0. Invalidation cached signed URL в Smart CDN может занять до 60 секунд |
| Migration history | Canonical local fresh replay 37/37 и full database pgTAP 45/45 green, включая atomic quota 9/9; staging 37/37, production 36/36. User-owned duplicate migration copy не изменена |
| Local Supabase services | PostgreSQL-only stack healthy для fresh replay и pgTAP. Full-stack start завершился health timeout для analytics/vector/realtime/storage/studio; remote staging acceptance от него не зависел |

## Состояние возможностей

| Область | Статус | Примечание |
|---|---|---|
| Auth, multi-tenant, RBAC и основные web-модули | Done | Основной фундамент работает |
| Realtime и task notifications | Done | Inbox, Tasks, Notifications, acknowledge |
| Admin platform | Partial | Основное управление/monitoring есть; tenant-profile/AI-stats authenticated smoke tests и Company Dashboard dark-contrast visual acceptance подтверждены в user session |
| Telegram | Partial / operational block | Проверить `TELEGRAM_WEBHOOK_SECRET` и webhook |
| Resend inbox | Partial | Код есть; receiving/delivery E2E не подтверждён |
| AI Concierge/RAG и cost tracking | Partial | Основа есть; polishing request quota race-safe через PostgreSQL atomic reservation/release, provider usage учитывается до output validation. Остаются rollout migration, citation UX, billing dashboard, unified endpoint enforcement и smoke tests |
| AI Документолог | Production binary + staged AI polish preview / provider blocked | 15 templates, 4 языка и real PDF/DOCX/private Storage работают. Polishing frontend в production, migration и `bright-api` v11 в staging; Auth/tenant/document boundaries и cleanup green, но real-provider smoke возвращает `503 AI_UNAVAILABLE`, потому что в staging нет `ANTHROPIC_API_KEY`. Production backend/migration rollout намеренно ожидает |
| HR Candidate Analysis | Skeleton | Scaffold есть; production endpoint возвращает `501 NOT_IMPLEMENTED` |
| Billing / Click / Payme и AI Sales Bot | Planned | Phase 3 |

## Ближайший порядок

1. Безопасно установить `ANTHROPIC_API_KEY` в staging Edge secrets и повторить authenticated real-provider preview/save smoke до green.
2. После green staging smoke deploy production migration `20260821000000` + `bright-api` и выполнить smoke tests.
3. После стабилизации web flow добавить Telegram generation/delivery.

Подробности: [PLAN.md](PLAN.md). Основной источник: [узбекский STATUS](../STATUS.md).
