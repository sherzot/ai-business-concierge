# Журнал разработки — AI Business Concierge

История развития проекта, выполненные работы, обнаруженные ошибки и их решения.

> **Переводы (синхронизируются):** [Узбекский (основной)](../DEVLOG.md) · [English](../English/DEVLOG.md) · [日本語](../日本語/DEVLOG.md)

## 2026-08-11 — PR #6 merge, Codex P1 closeout и final no-fallback deploy завершены

- No-fallback code и синхронизированные four-language docs pushed как commit `85cb241` в `agent/remove-legacy-supabase-anon-fallback`. Draft PR #6 переведён ready; GitHub `frontend-security-gate` run `31461980468` прошёл за 48s, Netlify preview `6a7ab3ed99861d0008a32837` ready, Vercel deployment `EPxGDaLxfNeKnHPKfwsUzxp7sZfd` ready. PR #6 squash-merged в `main` как `2b71a4990e6cdba5c822379821c27816b6854185`.
- Post-merge Codex review сообщил один unresolved P1 thread: canonical PLAN/STATUS/DEVLOG продолжал указывать commit как next action после его создания и не записывал identifier. Finding корректен; этот append-only entry и синхронизированный STATUS/PLAN closeout записывают commit/PR/CI/deploy IDs и удаляют completed item из active plan. Reply/resolve не выполнялись, так как user не запросил этот GitHub write.
- Clean tracked snapshot merge commit вручную deployed в production. Первая sandboxed попытка завершилась npm-registry DNS `ENOTFOUND`; та же команда успешно прошла с approved network access. Netlify deploy `6a7ab5474835d660f21249cd`, build `6a7ab5464835d660f21249cb`, ready, published `2026-08-11T05:39:38.297Z`, 82s, plugin success; normal/enhanced secret matches 0 в 87,160 files.
- Production browser acceptance: 2 scripts, modern publishable key 1, JWT-like legacy keys 0, имя `VITE_SUPABASE_ANON_KEY` отсутствует, format guard `sb_publishable_...` есть; Auth settings HTTP `200`, Realtime WebSocket `OPEN`. Login отобразил содержимое, console errors/Vite overlay/horizontal overflow 0.
- Next active work: authenticated production dark-mode visual recheck Company Dashboard Business Status panel; re-review GHSA-qwww metadata exception до 2026-08-21; затем AI Документолог PDF/DOCX/Storage.

Files/state: PR #6, `frontend/src/app/config.ts`, `frontend/src/app/__tests__/config.test.ts`, `frontend/src/env.d.ts`, синхронизированные four-language STATUS/PLAN/DEVLOG/FIRST_PUSH, Netlify production env/deploy.

## 2026-08-11 — Production handoff Supabase publishable key выполнен; source publish подготовлен

- Ранее frontend предпочитал publishable key, но modern env отсутствовал в Netlify и production использовал legacy anon fallback. Наличие active modern `sb_publishable_...` key в production подтверждено без вывода значения; `VITE_SUPABASE_PUBLISHABLE_KEY` настроен как public build env для всех scopes/context Personal plan.
- Clean tracked snapshot `main` deployed в Netlify production: deploy `6a7a9c1ec552d009a42c6f97`, build `6a7a9c1ec552d009a42c6f95`, `ready`, published `2026-08-11T03:51:28.742Z`, 33s, plugin `success`, secret matches 0 в 87,160 files. В bundle найден один modern-key prefix и 0 project legacy JWT; Auth settings вернул HTTP `200`, Realtime WebSocket достиг `OPEN`, login имел 0 console/Vite-overlay errors и horizontal overflow 0.
- После проверки rollout удалён только Netlify frontend env `VITE_SUPABASE_ANON_KEY`; modern publishable env сохранён. Сам Supabase legacy API key не revoke. `config.ts` теперь принимает только `VITE_SUPABASE_PUBLISHABLE_KEY` и fail-fast проверяет формат `sb_publishable_`; legacy env type/fallback и fallback test удалены, добавлен negative contract test. Инструкция `FIRST_PUSH` на четырёх языках переведена на modern key.
- Проверки: targeted config 3/3 tests PASS; TypeScript PASS; Vitest 23/23 files и 108/108 tests PASS с non-secret modern test env; production build 3700 modules PASS; security gate 9 files PASS; `git diff --check` PASS. Первый full run без modern local env прошёл 13 suites/56 tests и остановил 10 suites на ожидаемом config fail-fast; private local env не менялся.
- Source и docs находятся в local branch `agent/remove-legacy-supabase-anon-fallback`. Первый sandboxed `gh auth status` сообщил invalid token; после login пользователя проверка через system keyring подтвердила account `sherzot` и scopes `repo/workflow`. Первый следующий шаг: explicit stage/commit/push/PR, CI и final bundle/Auth/Realtime recheck.

Files/state: `frontend/src/app/config.ts`, `frontend/src/app/__tests__/config.test.ts`, `frontend/src/env.d.ts`, `docs/FIRST_PUSH.md`, синхронизированные four-language STATUS/PLAN/DEVLOG/FIRST_PUSH, Netlify env и production deploy.

## 2026-08-10 — Inverse contrast hotfixes выпущены в production

- Codex finding PR #4 по DEVLOG closeout закрыт four-language docs commit в PR #5. Единственный P1 Codex finding PR #5 требовал конкретные green-gate IDs; GitHub run, Netlify preview и Vercel deployment identifiers добавлены в STATUS/DEVLOG и pushed в `main` как `67ab618`. GitHub threads не получили reply/resolve.
- Landing fix squash-merged как PR #4 `700483d`, Company Dashboard fix/test/docs как PR #5 `2466200`. Netlify production deploy `6a79e664a453161423131204` ready, build `6a79e664a453161423131202`, published `2026-08-10T14:56:55.975Z`, deploy time 81s, plugin success; 0 secret matches в 87,160 scanned files.
- Production browser dark mode нашёл 6/6 Why Us reasons: title `rgb(244,243,239)`, descriptions 65% inverse foreground, background `rgb(17,19,24)`, overflow 0, console/Vite-overlay errors нет, page content meaningful.
- Company Dashboard code находится в production bundle, baseline 23/23 files и 108/108 tests green. Без credentials agent browser не открыл authenticated Business Status panel. Первый next action: user visual recheck в production dark mode, затем publishable-key handoff.

Files/state: PR #4/PR #5 frontend fixes, frontend deploy source `67ab618`, Netlify production deploy и synchronized four-language STATUS/PLAN/DEVLOG.

## 2026-08-10 — Исправлен inverse contrast Landing и Company Dashboard

- User подтвердил успешное прохождение предыдущих authenticated production smoke-tests Leader Company Profile и Super Admin dashboard.
- Шесть title/description в Why Us использовали theme-dependent token `background` внутри fixed dark inverse panel, поэтому в dark mode текст сливался с фоном. Titles переведены на `--editorial-inverse-fg`, descriptions — на `editorial-inverse-muted`; `c59ed82`/PR #4 merged в `main` как `700483d`.
- Тот же pattern затрагивал Company Dashboard Business Status: heading, timestamp, status, department labels/percentages и SVG track. Все переведены на inverse foreground/muted contract; добавлен `DashboardPage` regression test, запрещающий `text-background` внутри panel (`4184ddb`, PR #5).
- Единственный unresolved P1 Codex thread PR #4 потребовал обязательный DEVLOG closeout; эта синхронная four-language правка DEVLOG/STATUS/PLAN закрывает feedback без изменения behavior.
- Проверки: Node `22.18.0` TypeScript PASS; Vitest 23/23 files и 108/108 tests PASS; production build PASS (3700 modules); 9-file security gate и `git diff --check` PASS. Browser dark/light checks: 6/6 причин, title `rgb(244,243,239)`, descriptions 65% inverse-muted, background `rgb(17,19,24)`, overflow 0, console/Vite-overlay errors нет. Screenshot: `/private/tmp/abc-why-us-dark.png`.
- Authenticated dashboard browser flow без credentials повторно не запускался; общий token подтверждён в browser, dashboard markup закрыт новым test. PR #5 code-only GitHub run `31399285836` и final docs run `31399751738` success; Netlify code preview `6a79e27ae3c42e00088ffd45` ready, latest docs-only deploy `6a79e3b03648850008d64852` canceled, Vercel final deployment `Cg6Bt5HG1JJrGvwzDYaJqokQQU2q` ready. PR #5 merged в `main` как `2466200`. Далее: Netlify production deploy и user dark-mode smoke-test.

Files: WhyUsSection, DashboardPage и regression test, синхронные four-language STATUS/PLAN/DEVLOG.

## 2026-08-10 — Завершены PR #3 review hotfix и production rollout

- Изменения `agent/fix-landing-localization-copy` committed/pushed как `be047c4`; после успешного GitHub Actions run `31393176016` PR #3 squash-merged в `main` как `79be466`.
- Проверены обе P2 находки Codex review. Global form-padding rule перезаписывал левый inset icon-bearing `pl-8` inputs и прижимал search placeholders в Admin Audit и Knowledge Base к иконкам; добавлен `32px` override для `pl-8`, pushed прямо в `main` как `aee6692`. Этот closeout также заменяет устаревший статус “local/deploy pending” в STATUS/PLAN.
- Supabase `bright-api` deployed как version 75 (`ACTIVE`, `verify_jwt=false`). Netlify production hotfix deploy `6a79d69c9aa5a6bcf326e83c` стал ready и published 2026-08-10T13:50:02.498Z.
- Проверки: Node `22.18.0` TypeScript PASS; Vitest 22/22 files и 107/107 tests PASS; production build PASS (3700 modules); 9-file build/Netlify security gate и `git diff --check` PASS. Local browser computed padding `input.pl-8`: 32px слева, 16px справа, 12px сверху; overlay/page error/overflow нет. Production показал исправленный Uzbek copy, отсутствие Chinese/Turkish/Korean copy, overflow 0, left padding `pl-8` 32px и отсутствие console/page errors. Unauthenticated `/admin` безопасно redirected на `/login`.
- Production Edge health вернул HTTP `200` и `{"status":"ok"}`. Authenticated flows Leader Company Profile и Super Admin dashboard не запускались без user credentials; первый следующий шаг — production smoke-test с двумя ролями.

Files: `frontend/src/styles/editorial.css` и синхронные four-language STATUS/PLAN/DEVLOG.

## 2026-08-10 — Исправлены локализация, form/hover contrast и dashboard regressions

- Подтверждён merge PR #2 в `main` как `65abe2f`; работа выполнена в локальной ветке `agent/fix-landing-localization-copy`, три существующих untracked user files сохранены без изменений.
- Проверены четыре landing locale. Исправлено смешанное написание `Nimalар avtomatlashadi?`; international-company copy, stat и pricing приведены к реально поддерживаемым языкам: узбекскому, русскому, английскому и японскому. Упоминания китайского/турецкого/корейского удалены.
- Централизованы form insets: 16 px по горизонтали, 12 px по вертикали, 8 px между label/control и 44 px shared controls с сохранением icon offsets. Solid light hover utilities в dark mode переведены на neutral/brand/status tokens.
- Company Profile GET/PATCH не передавали `tenantId`, поэтому отсутствовал `X-Tenant-Id` и backend отвечал `Tenant context topilmadi.`. Оба вызова и аналогичный Employee Detail pattern исправлены.
- Причиной Super Admin crash было несоответствие `cost` от Edge и ожидаемого UI `cost_usd`. Edge теперь возвращает canonical field, а frontend нормализует legacy/partial responses до finite values. Для `/admin` добавлен route error fallback без раскрытия production stack.
- Проверки: Node `22.18.0`, TypeScript PASS; Vitest 22/22 files и 107/107 tests PASS; production build (3700 modules), 9-file security gate и `git diff --check` PASS. Browser acceptance: 4/4 desktop locale и Uzbek mobile 390×844 без page errors/horizontal overflow; dark login padding `12/16/12/16` и `12/44/12/16`, hover contrast читаемый.
- Local `deno` отсутствует, отдельный Edge Deno typecheck не выполнен. Изменения ещё не committed/pushed/deployed. Далее: review/commit/push, CI, frontend + `bright-api` deploy, затем production smoke-test Company Profile для Leader и Super Admin login.

Files: landing i18n/tests; editorial/theme/shared controls; tenant/employee API и tests; admin API/tests/route fallback; canonical Edge server; синхронные STATUS/PLAN/DEVLOG на четырёх языках.

## 2026-08-08 — Точная настройка hero typography и form spacing

- Ещё раз уменьшен max-size LP hero headline, tracking приближен к normal, line-height увеличен; длинный Uzbek headline теперь выглядит мягче и читается в три строки.
- Добавлен 6px breathing gap между global labels и соседними input/select/textarea; computed browser check contact form не выявил overlap.
- Agent-browser visual smoke check: landing и contact routes отрендерились без Vite overlay.

## 2026-08-08 — Visual consolidation и уменьшение масштаба заголовков

- Усилено единое Portfolio-inspired правило для product/admin/HR surfaces: декоративные purple/pink цвета сведены к semantic blue/neutral palette, emoji в notifications/templates/HR signals заменены на Lucide icons.
- Уменьшен размер hero headline и editorial titles landing, чтобы длинный Uzbek hero copy легче сканировался в первом viewport.
- Увеличены tracking и line-height, чтобы title и paragraph text не слипались.
- TypeScript и targeted landing/docs tests: `PASS`.

## 2026-08-08 — Review comments PR #2 закрыты

- Исправлен dark-system contrast feedback: editorial inverse surfaces и headers используют theme-independent tokens `#111318`/`#f4f3ef`, content contact/register/auth остаётся читаемым.
- CTA `Explore system` добавлен в `landingI18n` для Uzbek, Russian, English и Japanese.
- Исправлено противоречие browser/commit pending в canonical `STATUS.md`, синхронизированы четыре языка.
- Browser regression прошёл для dark contact inverse background/header, form content и no overflow; проверены CTA после Russian и Japanese locale switch.
- Full regression прошёл: 21/21 test files, 101/101 tests, production build, 9-file security gate и `git diff --check`.

---

## 2026-08-08 — Commit, push и preview CI redesign завершены

- Portfolio-inspired redesign закоммичен как `83bc7e0` (`feat: redesign frontend in portfolio style`) и branch `agent/portfolio-inspired-redesign` отправлен в `origin`.
- Открыт PR #2: https://github.com/sherzot/ai-business-concierge/pull/2
- GitHub `frontend-security-gate` run `31240118332` прошёл; Vercel preview прошёл; Netlify Deploy Preview `https://deploy-preview-2--ai-business-concierge1.netlify.app` готов.
- PR ещё не merged в `main`, production deployment не выполнялся. Далее: Netlify publishable-key handoff, затем PDF/DOCX/Storage Документолога.

---

## 2026-08-08 — Portfolio-inspired полный frontend redesign завершён локально

- В продукт адаптированы warm canvas, чёрная типографика, единый Sher-blue accent, divider-композиция и сдержанный motion из `sherzot/Portfolio`, без копирования его кода.
- Добавлены global editorial tokens/primitives, reusable brand mark/lockup и SVG operational-system продукта. Сохранены light/dark theme, reduced motion и focus-visible.
- Переработаны landing, contact/company registration, все auth flows, product shell/dashboard, Inbox, Tasks, Docs, Settings и admin shell. Compatibility layer приводит оставшиеся legacy surfaces к единой warm/ink/blue системе.
- Повторяющиеся auth layouts объединены в `AuthShell`; улучшены связи label/input и aria labels password toggles.
- Проверки прошли: `git diff --check`, TypeScript, 21/21 test files и 101/101 tests, production build, 9-file security gate, dependency audit high/critical `0`.
- Остались известные non-blocking warnings: main chunk ~1.76 MB, mixed imports `supabase.ts`, устаревшие Browserslist data.
- Установлен Chrome runtime для `agent-browser` и выполнен browser acceptance: desktop landing, mobile landing, login, forgot-password и contact routes отрендерили содержимое; error overlay, browser errors и horizontal overflow не обнаружены. Annotated screenshots сохранены в `/private/tmp/abc-landing.png`, `/private/tmp/abc-mobile.png`, `/private/tmp/abc-login.png`.
- Повторный Vite route smoke-check вернул `200` и SPA shell для `/`, `/login`, `/forgot-password`, `/contact`, `/app` и `/admin`; сервер корректно остановлен.
- Работа локальна в branch `agent/portfolio-inspired-redesign` от `df42ecf`; commit/push/deploy ещё не выполнялись.

Далее: commit/push redesign без находок и проверка GitHub CI/Netlify preview, затем возврат к publishable-key handoff и Document Assistant.

---

## 2026-08-08 — Supabase CLI v2.112.0 и fresh local-infra regression

- Official Supabase Homebrew formula выбрана с узким разрешением `brew trust --formula supabase/tap/supabase`. После промежуточной установки core formula `v2.111.0` official tap обновил CLI до `v2.112.0`; broad tap trust не выдавался.
- По official upgrade guidance прежний local-only data volume удалён без backup. Production schema/data и linked migration history не затронуты.
- В CLI `v2.112.0` команда `functions serve` больше не принимает имя function как positional argument; local acceptance запускает все functions через `supabase functions serve --no-verify-jwt`.
- Fresh Postgres image выявил зависимость от implicit grants. Core baseline теперь явно выдаёт `service_role` доступ к backend-managed baseline tables.
- pgTAP теперь проверяет, что direct read `user_tenants` завершается PostgreSQL `42501`, а не пустым результатом. Edge fixture разделяет новый `sb_secret_...` API key и legacy service-role JWT; значения не логировались и не документировались.
- Проверки: fresh replay 32/32 migrations; pgTAP 21/21; real local Auth-token Edge acceptance 8/8; после warm-up все enabled containers healthy; Storage/Auth/Studio HTTP `200`.
- Node `22.18.0`: type-check, 21/21 test files и 101/101 tests, production build, 9-file security gate и production audit с 0 high/critical прошли. Local services корректно остановлены.

Файлы: core baseline grant repair, deterministic pgTAP/Edge fixtures и синхронизированные STATUS/PLAN/DEVLOG на четырёх языках.

---

## 2026-08-08 — Закрыты migration-history и local Storage drift

- Проверены current Supabase changelog/CLI docs. Dry-run показал, что remote отсутствует только backdated `20250212000000_core_schema_baseline.sql`. Production metadata подтвердили наличие всех 10 tables, 13 indexes, `pgcrypto` и RLS, ожидаемых baseline.
- `20250212000000` отмечена applied через official migration-history repair без повторного SQL. Schema/business data не изменялись. Повторный migration list полностью совпал, `db push --linked --dry-run` сообщил, что remote database up to date.
- Relink обновил stale local Storage/Auth pins с `v1.58.1/v2.189.0` до production-aligned `v1.68.1/v2.195.0` без tracked file changes.
- Local stack запущен без exclusions. Первые 2-second warm-up probes дали timeout, затем все enabled Supabase containers стали healthy. Storage, Auth и Studio HTTP smoke-tests вернули `200`.
- `imgproxy` намеренно stopped, поскольку image transformations не включены; unused infrastructure не добавляется. Local services после проверки остановлены. Installed CLI `v2.101.0`, доступна `v2.112.0`, но validation не блокировалась.

Files/state: production migration history выровнена, ignored local linked metadata обновлена, four-language STATUS/PLAN/DEVLOG синхронизированы.

---

## 2026-08-08 — Закрыты оставшиеся acceptance-проверки

- Fresh local DB выявила две проблемы replay: core tables создавались только через `supabase/schema.sql` вне migration history, а trigger loop в `20260417134151_phase0_new_tables.sql` содержал неверный блок `EXCEPTION`.
- Из Supabase CLI scaffold добавлена идемпотентная `20250212000000_core_schema_baseline.sql` без demo seeds и дублирующих policies; historical PL/pgSQL block исправлен. После этого пустая local DB успешно применила все 32 migrations.
- Backdated baseline не отправлялась в production, поэтому version `20250212000000` ещё нет в remote migration history. Перед следующей production DB migration нужен dry-run и выбор между idempotent no-op apply и history repair.
- Local DB verification: один pgTAP file, 21/21 tests PASS. Из-за drift версий linked/local Storage его health-check был unhealthy, поэтому DB/Auth/Realtime/Edge acceptance stack запущен без `storage-api,imgproxy`; file storage не входил в scope.
- Добавлен `supabase/tests/integration/edge_tenant_authorization.test.mjs`. С временными local Auth users и реальными tokens прошли 8/8 случаев: active own-tenant; cross-tenant denial; blocked/terminated denial; super-admin cross-tenant/admin access; blocked-admin `403`; employee role `403`.
- Production Auth users/data не создавались. Fixtures очищены, local services остановлены.

Files: core baseline migration, replay fix Phase 0 migration, Edge integration fixture и синхронные STATUS/PLAN/DEVLOG на четырёх языках.

---

## 2026-08-08 — Усилены Realtime tenant isolation и Edge authorization

- Production reproducer показал, что active members не видят свои `tasks/inbox_items`, потому что policies читают default-deny `user_tenants`; notifications не проверяли membership status. Historical migrations также оставили в production только `active/terminated`, хотя код пишет `password_pending/password_set/blocked`.
- Применён `20260808014845_harden_realtime_tenant_authorization.sql`: объединены пять statuses, создан `private.is_active_tenant_member()`, browser доступ к tasks/inbox/notifications ограничен SELECT, policies требуют active membership и active tenant.
- Добавлен transactional pgTAP fixture из 21 проверки с реальной DB role `authenticated` и JWT settings: cross-tenant SELECT, запрет INSERT/UPDATE/DELETE, blocked membership и status contract; в конце ROLLBACK.
- Tenant context теперь повторно проверяет выбранный header/JWT tenant в DB и использует canonical role из active assignment, сохраняя active super-admin cross-tenant access. `/auth/me` фильтрует inactive доступ, а общий middleware требует active platform-admin assignment и active source tenant для всех `/admin/*` routes.
- `bright-api` v74 deployed. До fix pgTAP: 4/21 fail; после: `ok 21`. Metadata подтверждает private security-definer helper с empty search path, без anon EXECUTE и только SELECT browser grants. Health `200`, tenant route без auth `401`, admin route без auth `401`.
- Type-check, 21/21 files и 101/101 tests, build, 9-file security gate и dependency audit с 0 high/critical прошли. Новых Security Advisor errors нет; известны warnings `vector` in public и disabled Leaked Password Protection.
- Граница проверки: Docker недоступен для fresh local migration run. Реальные active/blocked/terminated и role-`403` Edge token tests требуют non-production Auth fixtures; временные production Auth users не создавались. Netlify publishable-key rollout остаётся отдельной задачей.

Files: `supabase/migrations/20260808014845_harden_realtime_tenant_authorization.sql`, `supabase/tests/database/realtime_tenant_isolation.test.sql`, `supabase/functions/server/index.ts`, synchronized STATUS/PLAN/DEVLOG на четырёх языках.

---

## 2026-08-08 — Закрыт прямой Data API доступ к данным risk scanner

- Production inventory подтвердил RLS на 32/32 public tables, `security_invoker` на 8/8 views и fixed `search_path` без `anon/authenticated` EXECUTE у всех 6 `SECURITY DEFINER` functions.
- `risk_scans` и `risk_findings` используются только через service-role client `bright-api` после проверки `super_admin/sub_admin`. Старые SELECT policies с `auth.role() = 'authenticated'` позволяли любому вошедшему пользователю читать их напрямую через Data API.
- Без изменения migration history устранён drift имени: SQL production `20260724132314_harden_internal_functions_and_rpc_grants` точно совпал с local `20260724130852_...`, после чего local file переименован в реальный production timestamp.
- Создан и применён `20260807153154_lock_down_risk_scanner_tables.sql`: old policies удалены, все privileges для `anon/authenticated` отозваны, CRUD для service role сохранён, RLS оставлен включённым.
- Security changes отправлены как commit `3e383b1`; GitHub CI run `31193931735` полностью завершён со статусом `success`.
- Production verification: обе risk tables имеют RLS, 0 policies, 0 browser CRUD grants и service-role CRUD. Migration histories совпадают; Security Advisor: 0 errors. Известные warnings — `vector` в `public` и отключённая Leaked Password Protection; tables без policies остаются default-deny INFO.
- Smoke tests: production health `200`, risk endpoint без authentication `401`, а anonymous Data API SELECT `risk_scans` с publishable key также вернул `401`.
- Regression verification: type-check; 21/21 test files и 101/101 tests; production build; security gate на 9 files; 0 unexcepted high/critical advisories.
- Publishable-key commit `35d4b91` имеет green GitHub run `31192041119` и ready Netlify production deploy, но bundle пока использует legacy fallback. Нужен Netlify CLI login/env rollout; old env/fallback не удалён.

Далее: завершить Netlify publishable env/Auth/Realtime rollout, затем добавить cross-tenant fixtures для RLS/Realtime на основе `user_tenants` и проверить каждый service-role Edge route.

Files: переименован `supabase/migrations/20260724132314_harden_internal_functions_and_rpc_grants.sql`; добавлен `supabase/migrations/20260807153154_lock_down_risk_scanner_tables.sql`; синхронизированы STATUS/PLAN/DEVLOG на четырёх языках.

---

## 2026-08-08 — Локально реализован frontend contract publishable key

- Проверены актуальные Supabase changelog/migration guidance и наличие production `default` publishable key без раскрытия значения.
- Реализован zero-downtime contract: `VITE_SUPABASE_PUBLISHABLE_KEY` основной, legacy anon временно остаётся local/rollback fallback. Edge Function JWT/server legacy variables не менялись.
- Netlify сообщил успешный additive env upsert, но последующий metadata list не показал key; состояние Netlify остаётся `UNKNOWN` до проверки production bundle, legacy env не удалён.
- Обновлены config, env types/example, CI, Supabase client, operational docs и security regression gate; удалён неиспользуемый файл с hardcoded legacy public key.
- HR Candidate теперь требует реальный user access token и не отправляет public key как Bearer authorization.
- Проверка успешна: targeted 5/5 tests; type-check; 21/21 files и 101/101 tests; production build; security check; production audit без unexcepted high/critical advisory.
- Далее: commit/push, GitHub CI и Netlify deploy, безопасная проверка production bundle, Auth/Realtime smoke-test, затем удаление legacy frontend env/fallback.

---

## 2026-08-07 — P0 commits отправлены, новый CI green

- Local commits `55ec941`, `a088fef` и `06b5756` отправлены в `origin/main` (`730b3bd..06b5756`).
- GitHub Actions `CI` run `31188866507` для commit `06b5756` завершился успешно за 42 секунды.
- Все шаги `frontend-security-gate` успешны: checkout, Node setup, clean install, type-check, unit tests, production dependency audit, production build и bundle/hosting security checks.
- Local и remote P0 baseline завершён. Далее: контролировать срок React Router metadata exception, затем перейти к publishable-key contract и Supabase/RLS authorization audit.

---

## 2026-08-07 — Проверены GitHub CLI authentication и remote CI

- GitHub CLI authentication для `sherzot` успешно восстановлена через browser login и system keyring; значение token не записывалось в документацию или логи.
- `gh auth status` подтвердил активную HTTPS authentication с необходимыми repository/workflow scopes.
- Remote workflow `CI` активен. Run `30099108015` для последнего remote commit `main` `730b3bd` завершился успешно.
- Local commits `55ec941` и `a088fef` ещё не отправлены, поэтому нового remote CI run для dependency audit gate пока нет.
- Следующий шаг: отдельно подтвердить push, затем следить за новым run до green.

---

## 2026-08-07 — Усилен локальный P0 baseline и dependency audit

### Контекст и выполненная работа

- Перед следующим этапом безопасности повторно подтверждён runtime baseline от 2026-07-24. Изначально shell использовал неподдерживаемый Node.js 21.4.0, тогда как CI ожидает Node.js 22.
- Документация и session lifecycle оформлены отдельным локальным commit `55ec941` (`docs: establish project status and session workflow`); он ещё не отправлен в remote.
- Frontend закреплён на Node.js 22 через `.nvmrc` и `package.json` `engines`.
- `react-router-dom` и `react-router` обновлены до `7.18.2`; upstream advisory React Router отмечает эту версию исправленной для линейки v7.
- Из-за устаревших npm/global advisory metadata добавлен узкий gate `audit:production`. Он падает при network/API/JSON ошибках audit и на любом другом high/critical advisory; единственное исключение требует exact `react-router@7.18.2` и истекает 2026-08-21.
- Шаг production audit в GitHub Actions переведён на этот gate.

### Проверка

- Node.js `22.18.0`, npm `11.5.2`: `npm ci` успешен.
- Type-check успешен; 19/19 test files и 96/96 tests успешны.
- `npm run audit:production` успешен: 0 high/critical advisory вне исключения, временное metadata exception показано явно.
- Отдельная проверка недоступного endpoint подтвердила fail-closed поведение; после восстановления registry access audit прошёл успешно.
- Raw `npm audit --omit=dev --audit-level=high` всё ещё показывает 2 high из-за stale global metadata; ограничение записано и должно быть пересмотрено до 2026-08-21.
- Production build успешен с прежними неблокирующими warning'ами: большой main chunk, mixed import и Browserslist data.
- Security check успешно проверил 9 build/Netlify файлов.
- Production smoke-tests: health `bright-api` вернул `200`, endpoint с tenant-защитой без auth вернул `401 TENANT_REQUIRED`.
- Проверка remote GitHub Actions заблокирована невалидным локальным `gh` token. После `gh auth login -h github.com` нужно проверить remote run.

### Следующие шаги

1. Восстановить GitHub CLI authentication и проверить remote Actions.
2. Отдельно принять решение о push локальных commit'ов.
3. До 2026-08-21 перепроверить и по возможности удалить React Router metadata exception.
4. Продолжить с frontend contract `sb_publishable_...` и аудитом browser Supabase/RLS/grants/tenant isolation.

Изменённые файлы: `.github/workflows/ci.yml`, `frontend/.nvmrc`, `frontend/package.json`, `frontend/package-lock.json`, `frontend/scripts/audit-production.mjs` и четырёхъязычный набор STATUS/PLAN/DEVLOG.

---

## 2026-08-07 — Обязательный documentation lifecycle для каждой agent-сессии

- Создан корневой `AGENTS.md`: каждая сессия начинается с `README → STATUS → newest DEVLOG → PLAN → git status`.
- Material changes завершаются новой записью DEVLOG, обновлением STATUS/PLAN, при необходимости Requirements/Roadmap/Architecture и синхронизацией четырёх языков.
- Read-only reporting не создаёт лишние DEVLOG entries; secrets/private data запрещено писать в docs/logs.
- Нельзя объявлять задачу полностью завершённой, пока обязательная документация не синхронизирована.
- Правило связано из `docs/README.md` и продублировано во всех четырёх вариантах `CLAUDE.md`.

Изменены только documentation/agent rules; application runtime не менялся.

---

## 2026-08-07 — Документация приведена к явной системе source of truth

- Добавлены `README.md` с ролями документов и `STATUS.md` как основной текущий handoff.
- Старый master PLAN перенесён в архив и заменён активным планом P0/P1/P2.
- ROADMAP и REQUIREMENTS обновлены статусами Done/Partial/Skeleton/Planned; добавлен R-021 для binary output Документоведа.
- Исправлено описание архитектуры: HR Candidate — modular scaffold с TODO/stub logic, а не production-ready эталон.
- Phase 0/setup документы получили historical/operational предупреждения.
- STATUS/PLAN/ROADMAP/REQUIREMENTS синхронизированы на English, Russian и Japanese.

Изменялась только документация. Код, DB, Functions и hosting config не менялись; production, CI, tests и build повторно не запускались. STATUS явно использует последний подтверждённый runtime snapshot от 2026-07-24.

---

## 2026-07-24 — Завершение сессии и передача контекста

### Итоговое состояние
- Завершены четыре языка для библиотеки шаблонов/UI и production migration для всех 15 активных шаблонов документов.
- Исправлены контраст light/dark theme, оставшиеся hardcoded-строки, locale race condition, устаревшее состояние modal, keyboard focus и accessibility icon-кнопок.
- Усилены границы Netlify/Supabase: CSP/HSTS/cache/preview, PWA private-response cache, CORS, PostgreSQL-backed AI rate limit, RPC grants и внутренние `SECURITY DEFINER` helpers.
- Не принадлежащий проекту домен `aibizconcierge.uz` удалён из всей runtime-конфигурации.
- Production migration применена, `bright-api` v72 задеплоен, health smoke-test вернул `200`.
- Создан frontend security CI gate; его ошибка на clean runner исправлена commit'ом `730b3bd`.

Причиной CI failure было отсутствие public Supabase test config при инициализации модулей, а не отсутствие production secret. В CI добавлены non-production placeholders, `actions/checkout@v5` и `actions/setup-node@v6`.

Локальная проверка в конце сессии:
- type-check успешен;
- 19/19 test files и 96/96 tests успешны;
- production build успешен;
- security check проверил 9 build/Netlify файлов;
- локальные `HEAD` и `origin/main` указывали на `730b3bd`.

Следующую сессию нужно начать с проверки, что remote GitHub Actions run имеет статус green. Неблокирующий technical debt: основной JS chunk около 1.76 MB, смешанный static/dynamic import `supabase.ts`, устаревшая база Browserslist.

---

## 2026-07-24 — Целевая архитектура: Netlify только для frontend, Supabase как backend platform

### Решение
- В Netlify остаётся статический React/Vite frontend и browser-delivery security: HTTPS/CDN, CSP/HSTS, cache rules и preview protection.
- Supabase отвечает за Auth, PostgreSQL, Edge Functions/backend API, Realtime, будущий Storage, RLS, authorization, server secrets, rate limiting и audit log.
- Прямой browser-to-Supabase доступ остаётся только для Auth и Realtime.
- Все business/admin/AI/Telegram/email и sensitive операции проходят через Supabase Edge Function `bright-api`.

Допустимая public browser-конфигурация:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_API_BASE_URL
```

Во frontend никогда не должны попадать raw PostgreSQL URL/password, `service_role`, `sb_secret_...`, AI, Telegram, email, payment и webhook secrets. Они хранятся только в Supabase Project/Edge Function Secrets.

Проверка frontend не нашла прямых business-data вызовов `supabase.from`, `rpc` или Storage. Прямой Supabase используется только для Auth, Realtime subscriptions и получения user access token для `bright-api`. Полный cookie/BFF proxy не выбран: он потребует переписать token refresh, reset/OAuth callbacks, CSRF, cookies, CORS и Realtime, не скрывая public endpoint.

### Порядок следующей сессии
1. Подтвердить clean Git/CI baseline и production health/auth поведение `bright-api`.
2. Проверить наличие современного `sb_publishable_...` и безопасно перейти с legacy anon naming без раскрытия server secrets.
3. Повторно проверить browser Supabase calls и оставить все операции кроме Auth/Realtime за `bright-api`.
4. Провести инвентаризацию RLS, grants, views, RPC, tenant isolation и всех service-role authorization boundaries.
5. Добавлять Storage только с private buckets, tenant/user policies, file validation и short-lived signed/authenticated access.
6. Усилить CORS, private response caching, endpoint-specific quota/rate limit, audit redaction и разделение production/preview.
7. Выполнить type-check, tests, production audit/build/security gate, Auth/Realtime/locale/theme/template smoke tests и cross-tenant authorization tests.
8. Применить проверенные migrations, задеплоить и проверить `bright-api`, затем Netlify frontend и записать точные версии/результаты.

Полный file-by-file checklist, критерии приёмки и ограничения безопасности находятся в основном [узбекском DEVLOG](../DEVLOG.md).

Оставшиеся ручные/platform задачи: включить Supabase Leaked Password Protection, выбрать preview protection в рамках Netlify plan, отдельно спланировать перенос `vector`, проверить `TELEGRAM_WEBHOOK_SECRET`, а key rotation/revoke выполнять только после deploy и smoke-test новой конфигурации.

---

## 2026-07-24 — Усиление безопасности Netlify + Supabase

### Сделано
- Из CSP Netlify удалён `script-src 'unsafe-inline'`; inline script окна печати заменён безопасным JS callback
- Усилены HSTS, Permissions Policy, COOP/CORP, защита MIME/frame/referrer и cache-правила assets/PWA
- Authenticated API responses больше не кэшируются PWA; preview build получает `noindex` и `no-store`
- Не принадлежащий проекту домен `aibizconcierge.uz` удалён из runtime CORS/CSP/canonical и email fallback
- AI rate limit перенесён из памяти Edge в атомарный PostgreSQL `check_rate_limit()`; IP/user keys хешируются SHA-256
- Internal `SECURITY DEFINER` RPC и trigger helpers закрыты для `anon`/`authenticated`, `search_path` зафиксирован
- Production migration применена, `bright-api` v72 задеплоен; health smoke-test вернул `200`
- Обновлены React Router, Vite, Vitest и transitive dependencies; полный `npm audit` — 0 уязвимостей
- В CI добавлены type-check, 96 unit tests, production audit, build и bundle/security gate
- Старый `frontend/dist.zip` удалён, будущие `*.zip` добавлены в ignore

### Оставшиеся ручные настройки платформ
- Non-production Team Login вернул `422` на Netlify Personal
- Supabase Leaked Password Protection нужно включить через Dashboard
- Перенос extension `vector` из `public` требует отдельной осторожной migration

---

## 2026-07-24 — Аудит возобновления проекта и восстановление тестов

### Контекст
Сопоставлены документация, история Git и текущий код. `DEVLOG.md` заканчивался 2026-06-04, а последний commit кода был сделан 2026-06-12.

### Сделано
- В landing-тестах добавлен mock auth-контекста для `LandingNavbar` и `HeroSection`
- `npm run test:run`: успешно 16/16 файлов и 89/89 тестов
- `npm run build`: production build успешен
- Подтверждено: Phase 1.5 завершён, landing-часть Phase 2 начата, HR Candidate Analysis остаётся 501 skeleton
- Production Supabase имеет статус `ACTIVE_HEALTHY`; secrets Anthropic/OpenAI/Resend присутствуют
- Обнаружен отсутствующий `TELEGRAM_WEBHOOK_SECRET`; поэтому Telegram POST webhook возвращает 503
- Frontend API fallback исправлен с нерабочего `server/...` на canonical `bright-api/...`
- Начат Phase 2 AI Документовед: seed migration на 15 шаблонов, template/generate API, динамическая frontend-форма и месячный usage limit
- Migration drift безопасно выровнен: timestamps локальных файлов `h003`/`m002` синхронизированы с production history
- В production Supabase задеплоены `h005_match_knowledge_tenant` и seed migration на 15 шаблонов
- `bright-api` v69 задеплоен; health smoke-test вернул `200`, защищённый template endpoint без auth вернул `401`
- Финальная проверка: 17/17 test files, 92/92 tests и production build успешны

### Файлы
- `frontend/src/features/landing/__tests__/LandingPage.test.tsx`
- `frontend/src/features/docs/`
- `frontend/src/app/config.ts`
- `supabase/functions/server/services/document-generator.ts`
- `supabase/migrations/20260724051655_seed_phase2_document_templates.sql`
- `docs/{DEVLOG,PLAN,ROADMAP,REQUIREMENTS}.md` и переводы

---

## 2026-06-12 — Улучшение frontend UI, layout и theme

### Контекст
После миграции на Light/Clean SaaS улучшена визуальная согласованность landing, auth, admin и company dashboard. Работа находилась в commit `2ae377a`, но отсутствовала в DEVLOG.

### Сделано
- Обновлены landing sections и общие theme tokens
- Улучшены admin/company layouts, sidebar/topbar и dashboard pages
- Доработаны UI и навигационные состояния login/protected routes

### Файлы
- `frontend/src/features/landing/`
- `frontend/src/features/admin/components/AdminLayout.tsx`
- `frontend/src/features/reports/`
- `frontend/src/features/auth/`
- `frontend/src/styles/theme-indigo-slate.css`

---

## 2026-06-04 — Миграция на светлую тему завершена — push & deploy

### Контекст
В предыдущей сессии начата миграция на Light/Clean SaaS тему, но grep-проверка обнаружила оставшиеся `text-white`, `bg-slate-700/800/900` в: AdminDashboardPage, AdminKnowledgeBasePage, AdminRiskPage, AdminCompaniesPage, AdminContactsPage.

### Выполнено
- `AdminDashboardPage.tsx`: Полная перезапись — значения StatCard `text-white` → `text-slate-900`, SEV_CONFIG значки с opacity-вариантов на сплошные светлые (`bg-red-100 text-red-700`), контейнеры иконок `bg-*-500/15` → `bg-*-100`, все dark:-варианты убраны, кнопка обновления `bg-slate-700` → `bg-white border`, баннер статуса БД `text-emerald-300` → `text-emerald-700`, скелеты `bg-slate-200`
- `AdminKnowledgeBasePage.tsx`: Значки категорий/тегов `bg-slate-700 text-slate-300` → `bg-slate-100 text-slate-600`, текст вопроса `text-white` → `text-slate-900`, модальное окно удаления `bg-slate-900` → `bg-white`
- `AdminRiskPage.tsx`: Пустое состояние h2 и текст сканирования `text-white` → `text-slate-900`, "Нет находок" `text-white` → `text-slate-900`, активная кнопка фильтра статуса `bg-slate-700` → `bg-indigo-600`
- `AdminCompaniesPage.tsx` + `AdminContactsPage.tsx`: Все заголовки, счётчики, вкладки фильтров, поля поиска, скелеты, элементы списков, модальные окна — полностью переведены на светлую палитру
- Проверка сборки: `✓ built in 3.14s` — ошибок нет
- Git push запустил Netlify deploy

### Файлы
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (полная перезапись)
- `frontend/src/features/admin/pages/AdminKnowledgeBasePage.tsx` (изменён)
- `frontend/src/features/admin/pages/AdminRiskPage.tsx` (изменён)
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (изменён)
- `frontend/src/features/admin/pages/AdminContactsPage.tsx` (изменён)

---

## 2026-06-04 — Полный переход на Light/Clean Modern SaaS тему

### Контекст
Приложение было зафиксировано на `forcedTheme="dark"`, все компоненты были написаны с жёсткими тёмными цветами. Пользователь попросил перейти на светлый стиль (в духе Notion/Linear/Vercel).

### Выполнено
- `AppProviders.tsx`: `forcedTheme="dark"` → `forcedTheme="light"` — все `dark:` классы Tailwind деактивированы
- `LoginPage.tsx`: Полная перепись — белый фон, индиго-градиент на левой панели, белая карточка формы
- `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`, `SetupAccountPage.tsx`: Светлый дизайн, `bg-slate-50`, белые карточки и инпуты
- `AdminHealthPage.tsx`: Карточки `bg-slate-800/50` → `bg-white shadow-sm`, тексты `text-white` → `text-slate-900`
- `AdminAIChatPage.tsx`: Область чата, пузыри, инпут — всё переведено в светлую палитру
- `AdminAuditPage.tsx`: Бейджи действий `text-emerald-300` → `text-emerald-700`, инпуты → `bg-white`, область payload → `bg-slate-100`
- `AdminRiskPage.tsx`: SVG `stroke="#1e293b"` → `stroke="#e2e8f0"`, заголовки `text-white` → `text-slate-900`
- `AdminKnowledgeBasePage.tsx`: Все инпуты `bg-slate-800 text-white` → `bg-white text-slate-900`, модал → `bg-white`
- `AdminDashboardPage.tsx`: SVG — треки `#e2e8f0`, центр донута белый, тексты тёмные, пустые бары `#e2e8f0`

### Файлы
- `frontend/src/app/providers/AppProviders.tsx`
- `frontend/src/features/auth/pages/` (4 файла)
- `frontend/src/features/admin/pages/` (6 файлов)

## 2026-06-04 — Исправление Dark Mode и редиректа при входе

### Контекст
1. Страницы админ-панели и дашборда отображались с мешаниной цветов — `dark:` классы Tailwind не работают без родительского элемента с классом `.dark`. `ThemeProvider` никогда не был добавлен.
2. Когда super_admin переходил на LP будучи авторизованным и нажимал "Войти", его редиректило на `/app` вместо `/admin` — навбар отправлял на `/login`, где `currentTenant` мог быть null.

### Сделано
- `AppProviders.tsx` — Добавлен `ThemeProvider` из `next-themes` (`attribute="class"`, `defaultTheme="dark"`) — автоматически устанавливает `<html class="dark">`, все `dark:` классы Tailwind работают корректно
- `LandingNavbar.tsx` — Кнопка "Войти" теперь проверяет состояние авторизации: если залогинен → `/admin` или `/app`, если нет → `/login`
- `HeroSection.tsx` — Аналогичное исправление

### Файлы
- `frontend/src/app/providers/AppProviders.tsx` (изменён)
- `frontend/src/features/landing/components/LandingNavbar.tsx` (изменён)
- `frontend/src/features/landing/components/HeroSection.tsx` (изменён)

---

## 2026-06-03 — Исправление бага с мок-данными задач (PATCH 500)

### Контекст
`PATCH /tasks/t-2` → ошибка 500. Когда у тенанта не было реальных задач, `GET /tasks` возвращал `getMockTasks()` — поддельные ID вида `t-1`, `t-2`. При попытке обновить такую "задачу" PostgreSQL выдавал ошибку типа (500), так как `t-2` не является UUID.

### Сделано
- `server/index.ts` — Удалена функция `getMockTasks()`; `GET /tasks` теперь возвращает пустой массив `[]`
- `bright-api` перезапущен (версия 68)

### Файлы
- `supabase/functions/server/index.ts` (изменён)

---

## 2026-06-03 — Исправление ошибок форм Contact и Register (два бага)

### Контекст
Исправлена ошибка "Server error" на `/contact` (двойной путь `/v1`) и на `/register?token=...` (валидация пароля + несоответствие формата ошибок). Оба исправления протестированы в продакшене.

### Сделано

**Баг 1: `/contact` → "Server error" (предыдущая сессия):**
- `ContactPage.tsx` — локальная `API_BASE` + `/v1/contact` создавала двойной путь `/v1/v1/contact`. Переключено на общий `API_BASE_URL`
- `config.ts` — fallback URL обновлён
- `config.toml` — добавлен `[functions.server] verify_jwt = false`
- `bright-api` переразвёрнут

**Баг 2: `/register` → "Server error" (текущая сессия):**
- **Первопричина:** Backend проверка `password.length < 12` отклоняла пароли 8-11 символов; frontend читал `json?.error?.message`, но `failure()` возвращает `json.meta.errors[0].message` → все ошибки показывались как "Server error"
- `server/index.ts:4543` — `< 12` исправлено на `< 8`
- `RegisterCompanyPage.tsx` — оба формата ошибок теперь поддерживаются
- `RegisterCompanyPage.tsx` — добавлен `minLength={8}` для поля пароля
- `bright-api` переразвёрнут

**Invite-email не приходит (не решено):**
- Причина: `RESEND_API_KEY` не задан в Supabase Secrets
- Требуемое действие: `supabase secrets set RESEND_API_KEY=re_xxx` + верификация домена `aibizconcierge.uz` в Resend

### Файлы
- `frontend/src/features/landing/pages/ContactPage.tsx` (изменён)
- `frontend/src/features/landing/pages/RegisterCompanyPage.tsx` (изменён)
- `frontend/src/app/config.ts` (изменён)
- `supabase/config.toml` (изменён)
- `supabase/functions/server/index.ts` (изменён)

---

## 2026-06-03 — Тёмная/светлая тема, расширение боковой панели, страницы Users и AI Stats

### Контекст
Полная поддержка тёмной/светлой темы во всех дашбордах (super_admin и компании); боковая панель Admin реорганизована с группированной навигацией; super admin теперь видит всех пользователей компаний; новая страница AI-статистики.

### Сделано

**Тёмная/светлая тема — все дашборды:**
- `AdminLayout.tsx` — полностью переписан: новая структура `NAV_GROUPS`, полные `dark:` варианты (sidebar, topbar, nav, tooltips, avatar, logout)
- `App.tsx` — компании sidebar, topbar, все ссылки и `NavItem` обновлены с `dark:` вариантами
- Все 8 admin-страниц — массовая замена классов на `dark:` варианты

**Расширение боковой панели:**
- Навигация разбита на группы: Главная, Управление, Мониторинг, Контент
- Новые пункты: **Пользователи** (`/admin/users`), **AI Статистика** (`/admin/ai-stats`)
- Иконка `Globe` для «Основной сайт», `PanelLeftOpen/Close` для сворачивания
- Тултипы в свёрнутом режиме корректно отображаются в тёмной теме

**Новые admin-страницы:**
- `AdminUsersPage.tsx` — просмотр всех пользователей платформы: email, имя, компания, роль (цветной badge), статус, дата; фильтры ролей, поиск, пагинация
- `AdminAiStatsPage.tsx` — аналитика AI: KPI-карточки, дневной bar chart, разбивка по моделям, топ-компании; выбор периода 7/14/30/60/90 дней

**Новый backend-эндпоинт:**
- `GET /admin/users` — join `user_tenants` + `profiles` + `tenants`; только super_admin/sub_admin; лимит 500

**Обновление роутера:**
- `router.tsx` — добавлены `/admin/users` и `/admin/ai-stats`

**API:**
- `adminApi.ts` — добавлены тип `AdminUser` и функция `getAdminUsers()`

### Файлы
- `frontend/src/features/admin/components/AdminLayout.tsx` (изменён — полная перезапись)
- `frontend/src/App.tsx` (изменён — тёмная тема + NavItem)
- `frontend/src/features/admin/pages/AdminUsersPage.tsx` (новый)
- `frontend/src/features/admin/pages/AdminAiStatsPage.tsx` (новый)
- `frontend/src/features/admin/api/adminApi.ts` (изменён)
- `frontend/src/app/router.tsx` (изменён)
- `supabase/functions/server/index.ts` (изменён — GET /admin/users)
- `frontend/src/features/admin/pages/*.tsx` (8 файлов — dark mode)

---

## 2026-06-02 — RBAC, Дашборд администратора и продолжение ULTRA-аудита (H-008..H-010)

### Контекст
Продолжение предыдущей сессии: исправление редиректа при входе, права ролей, новые панели в дашборде администратора, продолжение ULTRA-аудита безопасности.

### Сделано

**Исправлен редирект при входе:**
- `LoginPage.tsx` — `super_admin`/`sub_admin` перенаправляются в `/admin`, остальные — в `/app`
- `ProtectedLayout.tsx` — если роль администратора переходит напрямую на `/app`, происходит редирект в `/admin`

**Расширены роли RBAC:**
- `types.ts` — добавлены роли `sub_admin`, `company_admin`, `manager`
- `index.ts` — карта `ROLE_ACCESS` полностью определена для 9 ролей

**Новые панели дашборда администратора:**
- `GET /admin/ai-stats` — эндпоинт статистики использования AI (запросы, токены, расходы, разбивка по моделям, топ-тенанты)
- `AdminDashboardPage.tsx` — 2 новые панели:
  - **Состояние безопасности** — визуальный список 18 выполненных исправлений (критические/высокие/средние)
  - **AI Бизнес-аналитика** — график дневных расходов + разбивка по моделям + топ-компании

**Продолжение ULTRA-аудита безопасности:**
- **H-008** — Заголовки безопасности на все API-ответы: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Content-Security-Policy: default-src 'none'`, `Permissions-Policy`
- **H-009** — Аудит-логи для чувствительных мутаций администратора:
  - `PATCH /admin/tenants/:id/status` → записывает `admin.tenant.status_changed`
  - `PATCH /admin/contacts/:id/status` → записывает `admin.contact.status_changed`
- **H-010** — Заголовки безопасности для Netlify SPA через `netlify.toml` `[[headers]]`:
  - CSP: разрешены Supabase и WSS в `connect-src`
  - HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy

**Деплой:** Edge Function задеплоена через `supabase functions deploy server`.

### Файлы
- `frontend/src/features/auth/pages/LoginPage.tsx` (изменён)
- `frontend/src/features/auth/components/ProtectedLayout.tsx` (изменён)
- `frontend/src/features/auth/types.ts` (изменён)
- `supabase/functions/server/index.ts` (изменён — ROLE_ACCESS, ai-stats, H-008, H-009)
- `frontend/src/features/admin/api/adminApi.ts` (изменён)
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (изменён)
- `netlify.toml` (изменён — H-010)

---

## 2026-06-02 — Усиление безопасности: 14 исправлений (коммит `fb5bde5`)

### Контекст
Проведён всесторонний аудит безопасности системы. Выявлено и устранено 14 критических и среднеуровневых уязвимостей.

### Сделано

**Критические (K):**
- **K-001** `getTenantContext()` — убран ненадёжный fallback на заголовок `x-tenant-id` без аутентификации; заменён на JWT + проверку членства в БД
- **K-002** `/ai/chat` — параметр `system_prompt` отклоняется (вектор prompt injection закрыт)
- **K-004** `frontend/config.ts` — убраны захардкоженные Supabase-credentials; при отсутствии env vars приложение не запускается
- **K-005** `telegram-bot/index.ts` — `TELEGRAM_WEBHOOK_SECRET` стал обязательным; при отсутствии возвращает 503
- **K-006** `docs/DEMO_USERS.md` — пароли демо-пользователей удалены из документации

**Высокие (H):**
- **H-001** CORS — wildcard `*` заменён явным списком доменов: `aibizconcierge.uz`, `netlify.app`, `localhost`
- **H-002** AI-квота — `guardUsage()` + `recordUsage()` подключены к `/ai/chat`
- **H-004** `RequireRole.tsx` — новый компонент; маршрут `/admin` защищён проверкой роли через БД
- **H-005** `match_knowledge()` — добавлен параметр `match_tenant_id`; изоляция тенантов обеспечена на уровне БД
- **H-006** Resend webhook — верификация подписи стала обязательной; при отсутствии `RESEND_WEBHOOK_SECRET` возвращает 503
- **H-007** `apiClient.ts` — fallback на anon key убран; при отсутствии токена выбрасывается ошибка

**Средние (M):**
- **M-003** Invite token — новый токен генерируется при каждом повторном отправлении (старый инвалидируется)
- **M-005** Hard-delete — роль `hr` исключена; жёсткое удаление доступно только `leader/company_admin/super_admin`
- **M-006** Notifications mark-read — добавлен фильтр по `tenant_id`
- **M-008** Минимальная длина пароля повышена с 8 до 12 символов (в 3 местах)

**Ручные действия (выполнены пользователем ✅):**
- Anon key Supabase ротирован
- Env vars в Netlify обновлены (`VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_ANON_KEY`)
- Пароли демо-пользователей обновлены в Supabase Auth

### Файлы
- `supabase/functions/server/index.ts` (изменён)
- `supabase/functions/server/services/knowledge-base.ts` (изменён — H-005)
- `supabase/functions/telegram-bot/index.ts` (изменён — K-005)
- `frontend/src/app/config.ts` (изменён — K-004)
- `frontend/src/shared/lib/apiClient.ts` (изменён — H-007)
- `frontend/src/app/router.tsx` (изменён — H-004)
- `frontend/src/features/auth/components/RequireRole.tsx` (новый — H-004)
- `docs/DEMO_USERS.md` (изменён — K-006)
- `supabase/migrations/20260602000000_h005_match_knowledge_tenant.sql` (новый — H-005)

---

## 2026-06-02 — Исправления: AdminRiskPage `color` crash, statusFilter, Netlify Node.js

### Контекст
После запуска страницы Risk Scanner обнаружено несколько runtime-ошибок. Также выявлено расхождение хешей между Netlify и локальной сборкой.

### Сделано
- **AdminRiskPage `TypeError: Cannot read properties of undefined (reading 'color')`** — причина: в массиве `findings` бэкенда отсутствовало поле `status` → `STATUS_CONFIG[undefined]` падал. Исправление:
  - `risk-scan.ts`: во все вызовы `findings.push()` добавлено `status: "open"`
  - `AdminRiskPage.tsx`: добавлен fallback `STATUS_CONFIG[finding.status] ?? STATUS_CONFIG["open"]`
- **Ошибка `statusFilter`** — `AdminContactsPage` и `AdminCompaniesPage` отправляли `statusFilter`, тогда как API ожидает `filter`. Исправлено.
- **Расхождение хешей Netlify** — локальный Node 22 против Netlify Node 18 давал разные хеши сборки. В `netlify.toml` добавлено `NODE_VERSION = "22"`.
- **`frontend/.gitignore`** — добавлен в репозиторий впервые, с записью `dist/`.

### Файлы
- `supabase/functions/server/routes/risk-scan.ts` (изменён)
- `frontend/src/features/admin/pages/AdminRiskPage.tsx` (изменён)
- `frontend/src/features/admin/pages/AdminContactsPage.tsx` (изменён)
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (изменён)
- `netlify.toml` (изменён)
- `frontend/.gitignore` (новый)

---

## 2026-05-30 — B-014 Сканер безопасности: AdminRiskPage + `POST /risk/scan`

### Контекст
Super Admin / Sub Admin требовалась возможность проверять безопасность системы в реальном времени и визуализировать результаты.

### Сделано
- **DB миграция** `20260530000000_risk_scanner.sql`:
  - Таблица `risk_scans` — каждая сессия сканирования: `status`, `score`, `critical/high/medium/low_count`, `duration_ms`, `source`
  - Таблица `risk_findings` — конкретные находки: `severity`, `title`, `description`, `location`, `remediation`, `status`
  - RLS: только `super_admin/sub_admin` могут читать
- **Бэкенд** `POST /v1/risk/scan` (`routes/risk-scan.ts`):
  - Гибридный режим: статические проверки + Supabase Advisor API
  - Статические проверки: конфиг CORS, наличие env vars, статус RLS по таблицам
  - Находки Advisor: рекомендации по безопасности БД (таблицы без RLS, FK без индексов и т.д.)
  - Результат сохраняется в `risk_scans` + `risk_findings`; вычисляется `score` (0–100)
- **Фронтенд** `AdminRiskPage.tsx` (новый):
  - Кнопка «Начать сканирование» с состоянием загрузки
  - Бейджи по критичности: `critical` (красный), `high` (оранжевый), `medium` (жёлтый), `low` (синий)
  - Список находок: title, description, location, remediation
  - Индикатор score
- **Router**: добавлен маршрут `/admin/risk`
- **AdminLayout**: добавлена ссылка «Risk Scanner» в sidebar

### Файлы
- `supabase/migrations/20260530000000_risk_scanner.sql` (новый)
- `supabase/functions/server/routes/risk-scan.ts` (новый)
- `supabase/functions/server/index.ts` (изменён — маршрут зарегистрирован)
- `frontend/src/features/admin/pages/AdminRiskPage.tsx` (новый)
- `frontend/src/app/router.tsx` (изменён)
- `frontend/src/features/admin/components/AdminLayout.tsx` (изменён)

---

## 2026-05-27 — B-005/B-006 Оптимизация БД: индексы производительности + аудит-триггеры

### Контекст
В таблицах `tasks`, `inbox_items` и `documents` не было мягкого удаления. Также отсутствовали частичные индексы и аудит-триггеры.

### Сделано
- **Колонка `deleted_at`** добавлена в `tasks`, `inbox_items`, `documents`
- **Partial indexes** (`WHERE deleted_at IS NULL`) для `tasks`, `inbox_items`, `documents`, `notifications`, `audit_logs`, `request_logs` — быстрее запросы по активным записям
- **Аудит-триггеры** для `company_info`, `employee_profiles`, `documents`, `tasks` — ключевые изменения автоматически пишутся в `audit_logs`

### Файлы
- `supabase/migrations/20260527105554_b005_b006_optimization.sql` (новый)

---

## 2026-05-27 — #8 B-013 OpenAPI/Scalar docs — `GET /docs/api` + `GET /docs`

### Контекст
API не был задокументирован. Нужна была интерактивная документация для внешних интеграций и frontend-разработчиков.

### Сделано
- `supabase/functions/server/openapi.ts` (новый): полная спецификация OpenAPI 3.1 (`OPENAPI_SPEC` const) — все ключевые эндпоинты (health, contact, tasks, inbox, employees, KB, audit, analytics) + компоненты схем (Error, Task, InboxItem, Employee, KbArticle, AuditLog, AnalyticsData)
- `renderScalarHtml(apiJsonUrl)` — возвращает HTML-страницу Scalar CDN (тема purple/modern)
- `server/index.ts`: добавлен импорт `openapi.ts`; внутри `registerRoutes(prefix)` 2 маршрута:
  - `GET ${prefix}/docs/api` → `c.json(OPENAPI_SPEC)` — raw JSON спецификация
  - `GET ${prefix}/docs` → Scalar HTML UI (динамический URL, замена pathname)
- Работает во всех 4 зарегистрированных префиксах

### Файлы
- `supabase/functions/server/openapi.ts` (новый)
- `supabase/functions/server/index.ts` (изменён — импорт + 2 маршрута)

## 2026-05-27 — #7 Аналитика и графики — реальные данные из БД

### Контекст
ReportsPage использовала мок-данные. Нужны были реальные агрегации из БД и визуализация.

### Сделано
- Backend `GET /analytics`: task stats (total/todo/in_progress/done/overdue), 7-дневный тренд, inbox по категориям (30д), статистика сотрудников
- `analyticsApi.ts` (новый), `AnalyticsPage.tsx` (новый): KPI-ряд со stagger, AreaChart тренда, PieChart статусов, BarChart inbox, grid статистики сотрудников
- `App.tsx`: добавлен `case "analytics"`; `CommandPalette.tsx`: добавлен элемент "Analytics"

### Файлы
- `analyticsApi.ts`, `AnalyticsPage.tsx` (новые); `server/index.ts`, `App.tsx`, `CommandPalette.tsx` (изменены)

## 2026-05-27 — #6 PWA манифест — офлайн-оболочка, установка на главный экран

### Контекст
Приложение было доступно только в браузере. На мобильных устройствах нужна была возможность установки на главный экран и офлайн-работы.

### Сделано
- Установлен `vite-plugin-pwa@1.3.0` (devDependency)
- `vite.config.ts`: добавлен плагин `VitePWA()`, `registerType: 'autoUpdate'`
  - Web App Manifest: name/short_name, theme_color `#4f46e5`, display standalone, start_url `/app`
  - Иконки: `icon.svg` (any/maskable) + `favicon.ico`
  - Workbox: прекэш JS/CSS/HTML/ICO/SVG/WOFF2; рантайм-кэш API (StaleWhileRevalidate, 5 мин)
- `icon.svg` (новый) — SVG-иконка приложения (indigo-шестигранник)
- `index.html`: theme-color → `#4f46e5`, apple-touch-icon, PWA мета-теги
- Результат сборки: `dist/sw.js` + `dist/workbox-*.js`

### Файлы
- `vite.config.ts` (изменён), `public/icon.svg` (новый), `index.html` (изменён), `package.json` (изменён)

## 2026-05-27 — #5 Просмотрщик Audit Log + бэкенд

### Контекст
Триггер B-006 автоматически заполняет таблицу audit_logs. Супер-администраторам нужна была возможность просматривать, фильтровать и изучать эти данные.

### Сделано
- Эндпоинт `GET /admin/audit` (server/index.ts): проверка super_admin/sub_admin, фильтры tenant_id/entity_type/action/from/to/limit, возвращает audit_logs по created_at desc
- `auditApi.ts` — типизированный API-клиент
- `AdminAuditPage.tsx`: заголовок с подсчётом, фильтры (поиск + selects + даты), stagger-список с аккордеоном, action-бейджи (create/update/delete в цвете), развёртывание payload в JSON
- Router: маршрут `/admin/audit`; AdminLayout: иконка Shield + «Audit Log» в nav

### Файлы
- `auditApi.ts` (новый), `AdminAuditPage.tsx` (новый), `router.tsx`, `AdminLayout.tsx`, `server/index.ts` (изменены)

## 2026-05-27 — #4 Admin Knowledge Base CRUD UI + бэкенд

### Контекст
Таблица `knowledge_base` (pgvector + семантический поиск) уже существовала, но не было ни admin UI, ни CRUD API для управления ею. Супер-администраторам нужно добавлять, редактировать, удалять и переключать статус статей.

### Сделано

**Бэкенд (server/index.ts):**
- `GET /admin/kb` — список статей (фильтры: locale, category, is_active)
- `POST /admin/kb` — создание статьи (locale+category+question+answer обязательны)
- `PUT /admin/kb/:id` — обновление статьи (разрешённые поля)
- `DELETE /admin/kb/:id` — удаление статьи
- Все эндпоинты проверяют роль super_admin / sub_admin

**Фронтенд:**
- `frontend/src/features/admin/api/kbApi.ts` (новый) — типизированный API-клиент
- `frontend/src/features/admin/pages/AdminKnowledgeBasePage.tsx` (новый):
  - Заголовок: кол-во статей/активных + обновить + кнопка «Новая статья»
  - Фильтры: поиск + выбор языка + выбор категории
  - Список аккордеон с stagger-анимацией
  - Каждая строка: бейджи locale/category, усечённый вопрос, теги, переключатель
  - При раскрытии: полный ответ + кнопки редактирования/удаления
  - `FormModal` — 2-колоночная форма (locale+category), поле вопроса, textarea ответа, теги, toggle is_active
  - Модал подтверждения удаления
- `frontend/src/app/router.tsx` — добавлен маршрут `/admin/knowledge-base`
- `frontend/src/features/admin/components/AdminLayout.tsx` — иконка BookOpen + пункт «Knowledge Base» в nav

### Файлы
- `frontend/src/features/admin/api/kbApi.ts` (новый)
- `frontend/src/features/admin/pages/AdminKnowledgeBasePage.tsx` (новый)
- `frontend/src/app/router.tsx` (изменён)
- `frontend/src/features/admin/components/AdminLayout.tsx` (изменён)
- `supabase/functions/server/index.ts` (изменён)

## 2026-05-27 — #3 Framer-motion микро-анимации

### Контекст
Framer-motion был уже установлен, но использовался только для page transition. KPI-карточки, строки таблицы сотрудников и карточки компаний нуждались в hover/stagger-анимациях.

### Сделано
- `shared/lib/motionVariants.ts` — новый файл с переиспользуемыми вариантами:
  - `fadeInUp` — плавное появление секции страницы
  - `staggerContainer` + `staggerItem` — stagger-анимация списка (интервал 55ms)
  - `cardHover` — scale 1.02 + indigo box-shadow при наведении
  - `rowHover` — тонкий hover для строк таблицы
- `DashboardPage.tsx`: KPI-сетка → `motion.div` (staggerContainer); каждый `KpiCard` → `motion.div` (staggerItem + cardHover)
- `EmployeesPage.tsx`: `<tbody>` → `<motion.tbody>` (staggerContainer); каждый `<tr>` → `<motion.tr>` (staggerItem, stagger 55ms)
- `AdminCompaniesPage.tsx`: обёртка карточек → `motion.div` (staggerContainer); каждая карточка → `motion.div` (staggerItem + hover с indigo-рамкой)

### Файлы
- `frontend/src/shared/lib/motionVariants.ts` (новый)
- `frontend/src/features/reports/pages/DashboardPage.tsx` (изменён)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (изменён)
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (изменён)

## 2026-05-27 — #2 CommandPalette: глобальный модальный поиск ⌘K

### Контекст
Предыдущий ⌘K лишь фокусировал поле поиска. Нужна была полноценная CommandPalette — модальное окно с fuzzy-поиском и навигацией с клавиатуры.

### Сделано
- Создан компонент `CommandPalette.tsx` (`shared/components/`)
- Framer-motion: анимация backdrop + scale/fade модального окна
- 13 пунктов страниц (Dashboard → Notifications), 1 быстрое действие (Add Employee)
- Сотрудники: `listEmployees(tenantId, "active")` — ленивая загрузка при открытии
- Fuzzy-поиск: `includes()` + посимвольный fallback; подсветка совпадений через `<span>`
- Клавиатура: ArrowUp/Down для навигации курсором, Enter → выбор, Escape → закрытие
- Сгруппированные секции: Pages / Quick Actions / Employees + scroll-into-view
- Подсказки в футере: `↑↓`, `↵`, `ESC`
- Изменения `App.tsx`: состояние `paletteOpen`, ⌘K открывает палитру (toggle),
  поле поиска → кнопка с бейджем ⌘K, `<CommandPalette>` в конце разметки (portal),
  префикс `employee-detail:` → навигация на страницу сотрудника

### Файлы
- `frontend/src/shared/components/CommandPalette.tsx` (новый)
- `frontend/src/App.tsx` (изменён)

## 2026-05-27 — B-005 + B-006 + B-011: индексы БД, audit-триггеры, структурированное логирование

### Контекст
Бизнес-таблицы не имели составных индексов — тенант-скоупные запросы работали медленно при больших объёмах. Audit-лог записывался только вручную (без триггеров). Стандартный логгер Hono выводил plain text — неудобно для наблюдаемости в Supabase.

### Сделано

**B-005 — Индексы производительности + мягкое удаление:**
- Добавлен столбец `deleted_at timestamptz` в таблицы `tasks`, `inbox_items`, `documents`
- `idx_tasks_tenant_status_del` — `(tenant_id, status, deleted_at)` partial-индекс where deleted_at IS NULL
- `idx_tasks_tenant_due` — `(tenant_id, due_date)` partial, для определения просроченных задач
- `idx_inbox_tenant_created_del` — `(tenant_id, created_at desc, deleted_at)` partial
- `idx_notifications_user_unread` — `(user_id, created_at desc)` where read_at IS NULL
- `idx_notifications_tenant_created` — `(tenant_id, created_at desc)`
- `idx_documents_tenant_created_del` — `(tenant_id, created_at desc)` partial
- `idx_audit_logs_tenant_created` — `(tenant_id, created_at desc)` для просмотрщика аудита
- `idx_audit_logs_entity` — `(entity_type, entity_id, created_at desc)` для поиска по сущности
- `idx_request_logs_tenant_created` — `(tenant_id, created_at desc)`

**B-006 — Audit-триггеры:**
- Создана функция `fn_audit_log_change()` на PL/pgSQL (SECURITY DEFINER)
- INSERT → `event_type = 'table.create'`, payload = NEW строка в JSON
- UPDATE → `event_type = 'table.update'`, payload = `{before: OLD, after: NEW}`
- DELETE → `event_type = 'table.delete'`, payload = OLD строка в JSON
- Триггеры подключены: `trg_audit_tasks`, `trg_audit_inbox_items`, `trg_audit_documents` (+ hr_cases если существует)

**B-011 — Структурированное JSON-логирование (Hono middleware):**
- Удалены `import { logger } from "npm:hono/logger"` и `app.use('*', logger(console.log))`
- Новый `app.use('*', async (c, next) => {...})` middleware:
  - Читает заголовок `X-Trace-Id` или генерирует новый UUID
  - Измеряет время ответа через `Date.now()` до/после
  - Присваивает уровень лога: status ≥ 500 → `error`, ≥ 400 → `warn`, duration > 2000ms → `warn`, иначе `info`
  - Выводит структурированный JSON через `logRequest()`: `{level, message, traceId, tenantId, userId, data: {method, path, status, duration_ms}}`
  - Добавляет флаг `slow_query: true` для запросов дольше 2000ms

### Файлы
- `supabase/migrations/20260527000000_b005_b006_optimization.sql` (новый)
- `supabase/functions/server/index.ts` (изменён — удалён импорт logger, добавлен structured middleware)
>
> **Протокол (CLAUDE.md §...):** Каждое изменение фиксируется здесь и во всех 4 переводах.

---

## 2026-05-27 — UI/UX #10: Онбординговые тултипы (TourProvider, TourOverlay)

### Сделано

- `OnboardingTour.tsx`: `TourProvider` + хук `useTour` + компонент `TourOverlay` (без внешних библиотек)
  - Spotlight: тёмный оверлей с вырезом через `box-shadow` вокруг целевого элемента
  - Позиция цели отслеживается через `requestAnimationFrame` (работает со скроллом)
  - `placement: "top"|"bottom"|"left"|"right"` — с ограничением по вьюпорту
  - Прогресс-бар, счётчик шагов (1/4), кнопки «Пропустить» и «Далее»
  - Клавиатура: `Escape` → закрыть, `ArrowRight`/`Enter` → следующий шаг
- `AppProviders.tsx`: добавлен `<TourProvider>`
- `App.tsx`: `DASHBOARD_TOUR` (4 шага: nav, поиск, уведомления, тема) + кнопка `HelpCircle` → `startTour()`
- Search input: добавлен атрибут `data-tour="search"`

### Файлы

- `frontend/src/shared/components/OnboardingTour.tsx` (новый)
- `frontend/src/app/providers/AppProviders.tsx` (изменён)
- `frontend/src/App.tsx` (изменён)

---

## 2026-05-27 — UI/UX #9: Горячие клавиши (⌘K поиск, ⌘N новый сотрудник)

### Сделано

- Слушатель `keydown` в `App.tsx`: `Cmd/Ctrl+K` → фокус + выделение поисковой строки; `Cmd/Ctrl+N` → переход на `hr-add-employee` (только при наличии HR-прав)
- Определение мод-клавиши Mac/Windows через `navigator.platform`
- Плейсхолдер поиска обновлён: добавлена подсказка `"... (⌘K)"`

### Файлы

- `frontend/src/App.tsx` (изменён)

---

## 2026-05-27 — UI/UX #8: Пагинация таблиц (EmployeesPage, AdminCompaniesPage)

### Сделано

- Компонент `Pagination`: кнопки страниц с ellipsis, `ChevronLeft/Right`, счётчик "N–M / всего"; хелпер `paginateArray`
- **EmployeesPage**: `PAGE_SIZE=20`, сброс страницы при смене tab/search/statusFilter, `paginateArray(filtered, page, PAGE_SIZE).map(...)`
- **AdminCompaniesPage**: `PAGE_SIZE=15`, сброс страницы при смене filter/search, пагинация под списком

### Файлы

- `frontend/src/shared/components/Pagination.tsx` (новый)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (изменён)
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (изменён)

---

## 2026-05-27 — UI/UX #7: Переключатель тёмного/светлого режима

### Сделано

- Хук `useTheme`: сохранение в localStorage (`ai-bc-theme`), fallback на OS-предпочтение, добавление/удаление `.dark` на `<html>`
- Компонент `ThemeToggle`: иконки `Sun`/`Moon`, `aria-label`, `dark:` hover-цвета
- `<ThemeToggle />` добавлен в топбар App.tsx (слева от LocaleSelect)
- `<ThemeToggle />` добавлен в топбар AdminLayout
- CSS-переменные `.dark` в `theme.css` уже были полностью определены

### Файлы

- `frontend/src/shared/hooks/useTheme.ts` (новый)
- `frontend/src/shared/components/ThemeToggle.tsx` (новый)
- `frontend/src/App.tsx` (изменён)
- `frontend/src/features/admin/components/AdminLayout.tsx` (изменён)

---

## 2026-05-27 — UI/UX #6: Пошаговый визард онбординга сотрудников

### Сделано

- `AddEmployeePage` переведена на 3-шаговый визард:
  - **Шаг 1**: Выбор метода — крупные визуальные карточки (`Send`/`Lock`, бейдж выбранного)
  - **Шаг 2**: Форма данных — инпуты с иконками, индикатор метода с ссылкой «Изменить», спиннер при отправке
  - **Шаг 3**: Успех — большой зелёный `CheckCircle2`, кнопки «Добавить ещё» и «Список сотрудников»
- Компонент `StepIndicator`: нумерованные кружки (active/done/future), соединяющие линии (меняют цвет), метки шагов
- Добавлен проп `onSuccess?` — внешний callback на шаге 3

### Файлы

- `frontend/src/features/hr/pages/AddEmployeePage.tsx` (полная перепись)

---

## 2026-05-27 — UI/UX #5: Полировка UI уведомлений

### Сделано

- **Бейдж**: кольцо `animate-ping` (пульсирующий ореол вокруг красной точки) + внутренний бейдж с числом
- **Кнопка "Отметить все прочитанными"**: в шапке с иконкой `CheckCheck`, параллельная отметка через `Promise.allSettled`
- **Пустое состояние**: иконка `BellOff` + текст (раньше был только текст)
- **Каждое уведомление**: иконка типа (emoji), синяя точка для непрочитанных, фон `bg-indigo-50`
- **Добавлена шапка**: заголовок + кнопка "Прочитать всё" при наличии непрочитанных
- `CheckSquare` заменён на контекстные emoji-иконки

### Файлы

- `frontend/src/features/notifications/components/NotificationsDropdown.tsx` (полная перепись)

---

## 2026-05-27 — UI/UX #4: Мобильная адаптивность (3 страницы)

### Сделано

- **AdminCompaniesPage** шапка: `flex-wrap gap-3 + shrink-0` — кнопка переносится на следующую строку на маленьких экранах
- **AdminContactsPage** шапка: аналогичный `flex-wrap` фикс
- **EmployeeDetailPage**: загрузка → полный скелетон (шапка + 5 строк полей); состояние ошибки → иконка + сообщение (ранее был просто текст)
- Карточки-сводки `grid-cols-2 sm:grid-cols-4` — уже были адаптивными, сохранены

### Файлы

- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (изменён)
- `frontend/src/features/admin/pages/AdminContactsPage.tsx` (изменён)
- `frontend/src/features/hr/pages/EmployeeDetailPage.tsx` (изменён)

---

## 2026-05-27 — UI/UX #3: Скелетон-лоадеры + Пустые состояния (4 страницы)

### Сделано

- **AdminCompaniesPage**: спиннер → 5 скелетон-карточек (`animate-pulse`); пустое состояние → иконка `Building2` + контекстное сообщение (подсказка очистить фильтры)
- **AdminContactsPage**: спиннер → 5 скелетон-карточек; пустое состояние → иконка `Users` + контекстное сообщение; добавлен импорт `Users`
- **AdminHealthPage**: одна строка текста → скелетон шапки + баннера + 4 карточек статистики
- **EmployeesPage**: обычный текст → скелетон таблицы (thead + 6 строк); пустое состояние → иконка `UserPlus` + контекстное сообщение

### Файлы

- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (изменён)
- `frontend/src/features/admin/pages/AdminContactsPage.tsx` (изменён)
- `frontend/src/features/admin/pages/AdminHealthPage.tsx` (изменён)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (изменён)

---

## 2026-05-27 — UI/UX #1-2: Сайдбар AdminLayout + SVG-графики AdminDashboard

### Сделано

**#1 — Перепись AdminLayout sidebar:**
- Desktop: режим только иконок (w-16) ↔ расширенный (w-56) через кнопку `PanelLeftClose/Open`
- Mobile: drawer (`-translate-x-full` → `translate-x-0`) + overlay; отдельное состояние `mobileOpen`
- `NavItem`: тултип (fixed-позиция в свёрнутом режиме), левая активная полоска (анимация высоты), scale иконки при hover
- Бейдж: пульсирующая красная точка (свёрнуто) / число (развёрнуто) для контактов
- `Avatar`: инициалы из имени, разбитого по `[\s@._-]`
- Topbar: счётчик новых обращений, аватар справа вверху

**#2 — SVG-графики AdminDashboardPage (без внешних библиотек):**
- `DonutChart`: чистый SVG, дуги через тригонометрию, центральное отверстие, центральный текст
- `MiniBarChart`: SVG-барчарт, 7-дневные корзины по `created_at` компаний
- `LatencyGauge`: SVG-дуговой gauge, цветовая кодировка (зелёный ≤50ms, жёлтый ≤200ms, красный >200ms)
- `StatCard`: индикатор тренда за неделю (↑/↓), hover `scale-[1.01]`
- Скелетон-лоадеры: `animate-pulse` divs во время загрузки
- Авто-обновление каждые 30 секунд; новый тип `getDashboardStats` в adminDashboardApi

### Файлы

- `frontend/src/features/admin/components/AdminLayout.tsx` (полная перепись)
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (полная перепись)

---

## 2026-05-27 — Задача 4: B-001 Unit-тесты (модуль inbox)

### Контекст

Согласно B-001, написаны дополнительные unit-тесты для `features/inbox/`. Количество тестов выросло с 76 до 89 (+13 новых тестов, 16 тестовых файлов).

### Сделано

**`inbox/__tests__/inboxApi.test.ts` (6 новых тестов):**
- Нормализация `snake_case is_read` → `camelCase isRead`
- `is_read` отсутствует → принимается как `false`
- Правильный endpoint и `tenantId`
- Пустой массив → пустой список
- Нормализация `isRead` для нескольких элементов
- Выброс исключения при ошибке API

**`inbox/__tests__/useInbox.test.ts` (7 новых тестов):**
- Загрузка элементов при монтировании
- `filter=all` — все элементы отображаются
- `filter=HR` — фильтрация только HR-элементов
- `filter=Sales` — фильтрация только Sales-элементов
- Изоляция тенанта — отдельный API-запрос для разных `tenantId`
- Ошибка API → состояние `error`, `items=[]`
- `selectedItem` автоматически устанавливается на первый элемент

### Статус: 89 тестов, все прошли (16 тестовых файлов)

### Файлы

- `frontend/src/features/inbox/__tests__/inboxApi.test.ts` (новый)
- `frontend/src/features/inbox/__tests__/useInbox.test.ts` (новый)

---

## 2026-05-27 — Задача 3: B-007 Защита от prompt injection + санитизация ввода

### Контекст

Эндпоинты AI чата передавали пользовательский ввод напрямую в Claude/OpenAI без какой-либо проверки безопасности. Это создаёт риск инъекций: пользователи могут пытаться переопределить системный промпт или манипулировать AI. Согласно B-007, создан `services/ai-safety.ts` и подключён к `/v1/ai/chat`.

### Сделано

**`services/ai-safety.ts` (новый файл):**
- `checkAiSafety(rawInput, userId)` — основная функция:
  - 25 паттернов инъекций (EN/RU/UZ/JA + системные маркеры: `<system>`, `[INST]`, `<|user|>` и др.)
  - Удаление HTML/script тегов (DoS-безопасно: regex `{0,200}`)
  - Ограничение: макс. 16 000 символов (~4 000 токенов)
  - Rate limit на пользователя: 10 сообщений/минуту (in-memory скользящее окно)
  - Тип `SafetyResult`: `{ safe: true, sanitized }` или `{ safe: false, code, message, messageRu }`
- `wrapUserMessage(sanitized)` — helper для prompt layering:
  - Оборачивает сообщение в блок `"User message:\n..."`
  - Чётко отделяет ввод от системного контекста → снижает эффективность инъекций

**Эндпоинт `/v1/ai/chat` обновлён:**
- `checkAiSafety()` выполняется до KB-поиска и вызовов AI
- 422 → `INJECTION_DETECTED` или `INPUT_TOO_LONG`
- 429 → `RATE_LIMITED` (сообщение на нужном языке: uz или ru)
- `safeMessage` используется во всём handler вместо сырого ввода
- `wrapUserMessage()` применяется в вызовах Claude и OpenAI fallback

### Файлы

- `supabase/functions/server/services/ai-safety.ts` (новый)
- `supabase/functions/server/index.ts` (изменён: import + handler `/v1/ai/chat`)

---

## 2026-05-27 — Задача 1: подключение ai_usage_logs (отслеживание затрат для биллинга)

### Контекст

Пока ожидаем API-кредиты, начали backend-работы, не требующие кредитов. Первая задача: таблица `ai_usage_logs` была создана 2026-05-14, но эндпоинты `/v1/ai/chat` и `/v1/admin/ai/chat` ещё не писали в неё данные. Это критично для биллинга — без понимания того, сколько AI-кредитов тратит каждый тенант, платёжная система Phase 3 не сможет работать.

### Сделано

**Вспомогательная функция `insertAiUsageLog` (новая, non-blocking):**
- `supabase.from("ai_usage_logs").insert(...)` — использует service_role клиент (обход RLS)
- Нормализация `provider`: `"openai_fallback"` → `"openai"` (ограничение DB: `('claude','openai','fallback')`)
- Non-blocking: `.then(({ error }) => ...)` — основной запрос не замедляется
- Тип `AiUsageLogEntry` — типизированный интерфейс

**Эндпоинт `/v1/ai/chat` обновлён:**
- `insertAiUsageLog()` вызывается после каждого AI-ответа
- Сохраняемые данные: `tenant_id`, `user_id`, `endpoint`, `model`, `provider`, `complexity`, `prompt_tokens`, `completion_tokens`, `cost_usd`, `cached`, `latency_ms`, `trace_id`

**Эндпоинт `/v1/admin/ai/chat` обновлён:**
- Добавлены переменные отслеживания токенов: `adminModel`, `adminProvider`, `adminInputTokens`, `adminOutputTokens`, `adminCostUsd`, `adminCached`
- Данные ответов `callClaude()` и `callOpenAI()` теперь собираются
- Admin chat НЕ пишет в `ai_usage_logs` (FK-ограничение — у admin нет tenant) — логируется через `console.info()`
- TODO: в будущем nullable `tenant_id` или отдельная `admin_ai_usage_logs`

**Уточнение:**
- Эндпоинт `/v1/docs/search` уже существовал (строка 2916) — работает через `ILIKE`
- Функция `match_documents()` есть, но требует OpenAI embedding — подключим при поступлении кредитов
- Задача 2 (подключение `match_documents()`) зависит от кредитов, отложена

### Файлы

- `supabase/functions/server/index.ts` (изменён: helper `insertAiUsageLog` + 2 эндпоинта подключены)

---

## 2026-05-15 — Улучшения веб-части (завершено): 8 крупных изменений UI/UX

### Контекст

В ожидании AI-кредитов выполнили 8 задач по улучшению веб-части по порядку.

### Сделано

**1. ProfileForm — подключён к реальным данным авторизации:**
- Хук `useUserSettings` переписан — читает `fullName` и `email` из AuthContext
- Создан endpoint `PATCH /v1/settings/profile` (full_name, phone)
- После сохранения вызывается `refetchProfile()` — сайдбар обновляется сразу

**2. EmployeeDetailPage — добавлен режим редактирования:**
- Все 23 поля employee_profiles отображаются как форма
- 5 разделов: Личные, Работа, Контакты, Экстренные, Заметки
- `PATCH /v1/tenants/:id/members/:userId/profile` — HR делает upsert сотрудника

**3. Unit-тесты (B-001):**
- 9 тестов: `adminApi.test.ts`
- 12 тестов: `settingsDomain.test.ts`
- 7 тестов: `useUserSettings.test.ts`
- LandingPage.test.tsx исправлен: добавлена обёртка I18nProvider
- Итого: 76 тестов, все проходят

**4. EmployeesPage — фильтр + поиск + блокировка:**
- Чипы фильтра по статусу: all/active/password_pending/password_set/blocked
- Поле поиска (по имени/email)
- Кнопки Block/Unblock на каждой строке

**5. Страница документов — библиотека шаблонов:**
- 15 шаблонов (договоры, заявления, приказы)
- Фильтр по категории + поиск
- Значок "скоро" — ожидаем AI-кредиты

**6. Admin dashboard — авто-обновление 30с + бейдж в сайдбаре:**
- `setInterval(30_000)` — AdminDashboardPage обновляется автоматически
- Навигация "Обращения" в сайдбаре показывает красный бейдж

**7. Страница отчётов — AI-аудит отключён:**
- Кнопка "AI Audit" переведена в disabled — метка "скоро"

**8. Страница уведомлений — полная история:**
- `NotificationsPage.tsx` — фильтр (all/unread/read), массовое прочтение
- В `NotificationsDropdown` добавлена ссылка "Посмотреть все" (prop `onViewAll`)
- В App.tsx подключён `case "notifications"`

### Файлы

- `supabase/functions/server/index.ts` (изменён — 4 новых endpoint)
- `frontend/src/features/settings/hooks/useUserSettings.ts` (переписан)
- `frontend/src/features/settings/components/ProfileForm.tsx` (переписан)
- `frontend/src/features/hr/pages/EmployeeDetailPage.tsx` (переписан)
- `frontend/src/features/hr/api/employeesApi.ts` (изменён)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (изменён)
- `frontend/src/features/admin/__tests__/adminApi.test.ts` (новый)
- `frontend/src/features/settings/__tests__/settingsDomain.test.ts` (новый)
- `frontend/src/features/settings/__tests__/useUserSettings.test.ts` (новый)
- `frontend/src/features/landing/__tests__/LandingPage.test.tsx` (исправлен)
- `frontend/src/features/docs/components/TemplatesLibrary.tsx` (новый)
- `frontend/src/features/docs/pages/DocsPage.tsx` (переписан)
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (изменён)
- `frontend/src/features/admin/components/AdminLayout.tsx` (изменён)
- `frontend/src/features/reports/pages/ReportsPage.tsx` (изменён)
- `frontend/src/features/notifications/pages/NotificationsPage.tsx` (новый)
- `frontend/src/features/notifications/components/NotificationsDropdown.tsx` (изменён)
- `frontend/src/App.tsx` (изменён)

---

## 2026-05-15 — Улучшения веб-части (продолжение): TenantSettings, EmployeeDetail, Пароль, Landing nav/footer

### Контекст

Продолжение веб-улучшений в ожидании API-кредитов — пункты 3–6 из 6 запланированных улучшений.

### Сделано

**3. TenantSettingsPage (полная перезапись):**
- Эндпоинты `GET /v1/tenants/:id/profile` и `PATCH /v1/tenants/:id/profile`
- Форма: name, legal_form, stir, employee_count_range, activity_type, reg_date, legal_address, website, description, contact_phone, contact_email, bank_name, bank_account
- Заменил заглушку `<div>Tenant settings</div>`

**4. EmployeeDetailPage (новый):**
- Эндпоинт `GET /v1/tenants/:id/members/:userId` — JOIN user_tenant + employee_profiles
- Компонент `EmployeeDetailPage`: 5 разделов (Личные, Трудовые, Контакты, Экстренные, Заметки)
- Добавлен коллбэк `onViewEmployee` в EmployeesPage
- В App.tsx добавлен state `selectedEmployeeId` и пункт навигации "Профиль компании"

**5. PasswordChangeForm (новый):**
- Смена пароля через `supabase.auth.updateUser({ password })`
- Eye/EyeOff-переключатель, валидация (мин. 8 символов, совпадение), состояния успех/ошибка
- Добавлен в SettingsPage

**6. Landing nav + footer (обновлены):**
- LandingNavbar: якорные ссылки features/pricing/faq (видны на md+), плавная прокрутка
- LandingFooter: строка ссылок навигации (Функции, Цены, FAQ, Связаться)
- `id="features"` на FeaturesSection, `id="pricing"` на PricingSection
- i18n обновлён для всех 4 локалей: nav (features/pricing/faq), footer.links (4 ссылки)

### Файлы

- `supabase/functions/server/index.ts` (изменён: новые эндпоинты)
- `frontend/src/features/tenants/pages/TenantSettingsPage.tsx` (перезаписан)
- `frontend/src/features/hr/pages/EmployeeDetailPage.tsx` (новый)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (изменён: onViewEmployee)
- `frontend/src/features/settings/components/PasswordChangeForm.tsx` (новый)
- `frontend/src/features/settings/pages/SettingsPage.tsx` (изменён)
- `frontend/src/features/landing/components/LandingNavbar.tsx` (изменён)
- `frontend/src/features/landing/components/LandingFooter.tsx` (изменён)
- `frontend/src/features/landing/components/FeaturesSection.tsx` (добавлен id)
- `frontend/src/features/landing/components/PricingSection.tsx` (добавлен id)
- `frontend/src/features/landing/i18n.ts` (изменён: nav + footer.links)
- `frontend/src/App.tsx` (изменён: EmployeeDetail, TenantSettings, navigate helper)

---

## 2026-05-15 — Завершение Phase 1.5 + начало Phase 2.3: AdminCompaniesPage, FAQ, SEO

### Контекст

Пока ожидаются API-кредиты (Anthropic/OpenAI), улучшена веб-часть. Добавлена недостающая страница `/admin/companies` из Phase 1.5, а лендинг получил раздел FAQ и SEO-мета-теги из Phase 2.3.

### Сделано

**1. Backend — эндпоинт `GET /v1/admin/companies` (новый):**
- Возвращает все тенанты с полным набором полей: id, name, status, legal_form, stir, контактная информация, банк, blocked_reason, временны́е метки
- `member_count` на тенант (из user_tenants, без terminated)
- Фильтр по статусу: `?status=pending_approval|active|suspended|blocked`
- Только для super_admin / sub_admin

**2. Frontend — `adminApi.ts` расширен:**
- Тип `Company` + тип `CompanyStatus`
- Функция `getAdminCompanies(status?)`
- Функция `updateCompanyStatus(id, status, blocked_reason?)` → `PATCH /admin/tenants/:id/status`

**3. Frontend — `AdminCompaniesPage.tsx` (новый):**
- 4 карточки статусов (pending/active/suspended/blocked)
- Вкладки фильтрации + поиск (название, ИНН/СТИР, email, телефон)
- Раскрываемые строки: юридические данные, банк, причина блокировки
- Действия: Подтвердить, Приостановить, Разблокировать, Заблокировать (с модальным окном причины)
- Маршрут `/admin/companies` с `RequireAuth`

**4. Frontend — раздел FAQ на лендинге:**
- `FaqSection.tsx` — аккордеон, доступный (aria-expanded), анимация
- 6 вопросов на 4 языках (uz/ru/en/ja) добавлены в `i18n.ts`
- Тип `LandingDict` расширен: `faq: { title, items: FaqItem[] }`
- Порядок на странице: PricingSection → FaqSection → LandingCtaBanner

**5. SEO — обновлён `index.html`:**
- `<title>` с названием и описанием продукта
- `<meta name="description">`, keywords, author, robots
- Мета-теги Open Graph
- Мета-теги Twitter Card
- `<link rel="canonical">`
- `<meta name="theme-color" content="#0f172a">`
- `<html lang="uz">`

### Файлы
- `supabase/functions/server/index.ts`
- `frontend/src/features/admin/api/adminApi.ts`
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (новый)
- `frontend/src/app/router.tsx`
- `frontend/src/features/landing/i18n.ts`
- `frontend/src/features/landing/components/FaqSection.tsx` (новый)
- `frontend/src/features/landing/pages/LandingPage.tsx`
- `frontend/index.html`

---

## 2026-05-14 — security: 5 view переведены на SECURITY INVOKER

### Контекст

Supabase Security Advisor сообщил о 5 ошибках "Security Definer View":
`employee_invite_stats`, `v_beta_stats`, `v_beta_daily_activity`, `v_beta_model_usage`, `v_beta_feedback`.

SECURITY DEFINER view выполняется с правами создателя — может обойти RLS и нарушить изоляцию тенантов.

### Сделано

**Миграция `20260514120000_views_security_invoker.sql`:**
- Все 5 view пересозданы с `with (security_invoker = true)` (PG15+).
- `v_beta_*` view — SELECT только для `service_role` (admin dashboard через backend).
- `employee_invite_stats` — для `authenticated` и `service_role` (HR видит внутри своего тенанта, RLS управляет доступом).
- В каждом view комментарий: "SECURITY INVOKER — применяются RLS-правила вызывающего".

### Причина

Тот же паттерн уже применялся (`20260304_fix_tenant_daily_stats_security.sql`, `20260429120000_security_hardening.sql`). Для multi-tenant SaaS SECURITY DEFINER view — серьёзный риск безопасности.

### Проверка

После push: Dashboard → Advisors → Security → **Refresh** → 5 errors → 0.

### Файлы
- `supabase/migrations/20260514120000_views_security_invoker.sql` (новый)
- `docs/{DEVLOG,English/DEVLOG,Russian/DEVLOG,Uzbek/DEVLOG,日本語/DEVLOG}.md` (синхронизированы)

---

## 2026-05-14 — Фундамент масштабирования: учёт стоимости AI + RAG для doc_chunks + R-016..R-020

### Контекст

Реализованы срочные пункты из `docs/ai-business-concierge-scale-prompt.md` (2026-05-11). Проверено состояние Phase 1.5 и закрыты оставшиеся срочные пробелы.

### Сделано

**1. DB миграция `20260514000000_ai_usage_and_doc_vector.sql`:**
- Таблица `ai_usage_logs` — для каждого AI-вызова: tenant, user, endpoint, model, provider, complexity, prompt/completion токены, cost_usd, cached, latency, trace_id. Generated-колонка `total_tokens`. 3 индекса. RLS с tenant-изоляцией + super_admin/sub_admin видят всё.
- View `v_ai_usage_summary` — дневной агрегат по тенантам (для Admin dashboard).
- `doc_chunks.embedding vector(1536)` — для pgvector RAG.
- HNSW индекс `doc_chunks_embedding_idx` (m=16, ef_construction=64).
- Функция `match_documents(query_embedding, threshold, count, tenant_id)` — RAG-поиск, security definer, search_path зафиксирован, execute только для authenticated/service_role.
- Индексы document_id и tenant_id на `doc_chunks`.

**2. REQUIREMENTS.md обновлён:**
- R-016 HR Candidate Analysis (скелет есть, полная реализация в Phase 2).
- R-017 AI Rate Limiting (частично — in-memory `contactRateMap` + дневной лимит Telegram).
- R-018 AI Cost Tracking (миграция готова — backend-связка в следующей сессии).
- R-019 Vector Search RAG (миграция готова — backend-интеграция в следующей сессии).
- R-020 Admin Dashboard (super_admin/sub_admin: health, contacts, AI chat — расширение в Phase 4).

**3. Проверено текущее состояние:**
- Phase 1.5 — 5 миграций применены: contact_requests, tenant_company_info, roles_update (sub_admin/company_admin/accountant/manager), employee_profiles, employee_invites.
- Backend admin endpoints на месте: `/admin/contacts`, `/admin/health`, `/admin/ai/chat`, `/admin/contacts/:id/status`, `/admin/tenants/:id/status`.
- Frontend admin страницы реализованы: `AdminContactsPage`, `AdminHealthPage`, `AdminAIChatPage` + `adminApi.ts`.
- Структура docs/ верна: `English/`, `Russian/`, `Uzbek/`, `日本語/` — каждая папка содержит DEVLOG.md и остальные переводы.

### Отложено

- Prompt caching middleware (scale-prompt Задача 1.2) — завершение Phase 1.5.
- HR Candidate Analysis — полная реализация в Phase 2 (по PLAN.md v3.0).
- Backend-связка: запись в `ai_usage_logs` из `/v1/ai/chat` — следующая сессия (извлечь usage из services/llm-router.ts).
- Подключить `match_documents()` к `POST /v1/docs/search` — следующая сессия.
- Полный admin debug/log UI (Sentry real-time, query EXPLAIN) — Phase 4.

### Файлы
- `supabase/migrations/20260514000000_ai_usage_and_doc_vector.sql` (новый)
- `docs/REQUIREMENTS.md` (добавлены R-016..R-020)
- `docs/DEVLOG.md` (эта запись)
- `docs/{English,Russian,Uzbek,日本語}/DEVLOG.md` (синхронные переводы)

### Обоснование

Без `ai_usage_logs` биллинг (Phase 2) невозможен — нельзя распределить стоимость по тенантам без атрибуции токенов на каждый вызов. Без `match_documents()` инструмент AI Concierge "поиск по моим документам" работает на `ILIKE` — низкое качество результатов.

---

## 2026-05-06 — Phase 1.5 (4): B-027/B-028/B-029

### Внесённые изменения

**B-027 — In-app уведомления для HR (Realtime):**
- `createHrSetupCompleteNotification` — уведомление HR/руководителю при завершении setup сотрудника
- `createEmployeeConfirmedNotification` — уведомление сотруднику при подтверждении HR
- Хук `useRealtimeNotifications` — подписка на таблицу `notifications` через Supabase realtime
- `NotificationsDropdown` — принимает `userId`, автоматически обновляется при новом уведомлении

**B-028 — /admin/health (Мониторинг системы):**
- Backend: `GET /admin/health` — только super_admin; задержка DB + статистика тенантов/пользователей
- Frontend: `AdminHealthPage` — карточки статистики, баннер задержки DB, кнопка обновления

**B-029 — /admin/ai-chat (Чат AI для администратора):**
- Backend: `POST /admin/ai/chat` — только super_admin; Claude + fallback OpenAI; статистика платформы в контексте
- Frontend: `AdminAIChatPage` — UI чата, индикатор печати, подсказки; роут: `/admin/ai-chat`
- `adminApi.ts` — API-хелперы `getAdminHealth()` и `sendAdminAIMessage()`

---

## 2026-05-06 — Phase 1.5 (3): B-026 Email-шаблоны (7 штук)

**7 email-шаблонов (Resend API, тёмная индиговая тема):**
1. `company_invite` — admin contact → invite_sent
2. `company_registered_pending` — POST /register/company → "Ожидайте подтверждения"
3. `company_rejected` — статус=rejected → письмо контакту
4. `company_approved` — статус=active → письмо руководителю
5. `employee_invite` — POST /members → брендированное письмо сотруднику
6. `employee_welcome` — POST /auth/setup-complete → "Добро пожаловать"
7. `admin_new_registration` — уведомление на ADMIN_NOTIFY_EMAIL

**Новая переменная:** `ADMIN_NOTIFY_EMAIL`
**Новый эндпоинт:** `PATCH /admin/tenants/:id/status`

---

## 2026-05-06 — Phase 1.5 (2): Исправления текстов + Выбор языка

- `landing/i18n.ts` — удалена фраза "ChatGPT этого не знает."
- `app/i18n.ts` — ключ `auth.platformSubtitle` добавлен на 4 языках
- `LoginPage.tsx`, `LandingNavbar.tsx`, `LanguageSwitcher.tsx` — button group → `<select>` dropdown

---

## 2026-05-05 — Phase 1: Telegram-бот

**Архитектура (Clean Architecture / DDD):**
- `supabase/functions/telegram-bot/` — Edge Function
- `handlers/` — start, help, language, message, feedback, stats, media
- `services/` — session.ts, maslahatchi.ts

**Функциональность бота:**
- 4 языка: uz / ru / en / ja
- `/start`, `/help`, `/language`, `/stats`
- Rate limit: 5 запросов/день (бесплатный план)
- LLM Router: Haiku 3.5 (~80%) + Sonnet 4.6 (~20%)
- KB семантический поиск: pgvector + OpenAI embedding

**Beta-мониторинг:**
- `v_beta_stats`, `v_beta_daily_activity`, `v_beta_feedback`, `v_beta_model_usage`

---

## 2026-05-05 — Деплой: Ошибки и решения

### ❌ 401 Unauthorized (Webhook)
**Причина:** JWT-верификация Supabase блокировала webhook-запросы.
**Решение:** Добавлено в `supabase/config.toml`: `verify_jwt = false`

### ❌ TELEGRAM_WEBHOOK_SECRET not found
**Причина:** Секрет никогда не был установлен.
**Решение:** Проверка секрета удалена.

### ❌ CLAUDE_ERROR:400 credit balance too low
**Причина:** Нет кредитов Anthropic API.
**Статус:** Пользователь должен пополнить баланс ($5+).

### ❌ OpenAI 429 insufficient_quota
**Причина:** Скрипт seed KB обратился к OpenAI embedding API — квоты нет.
**Статус:** Решится вместе с Anthropic.

---

## 2026-05-06 — Улучшения UX бота

1. **Не-текстовые сообщения** — изображения, голос, файлы → "отправьте только текст"
2. **Вернувшийся пользователь `/start`** — "Добро пожаловать снова!" на языке пользователя
3. **Отображение лимита** — `📊 Осталось сегодня: X/5 запросов`
4. **Исправление языка feedback** — ранее hardcoded "uz", теперь реальный locale

---

## 2026-05-06 — Исправления языковой системы

### DB Check Constraint — Основная ошибка
**Причина:** Ограничение в `ai_conversations.locale` не включало 'ja'.
**Решение:** Миграция: `CHECK (locale IN ('uz', 'ru', 'en', 'ja'))`

### Дисклеймер только для uz/ru
**Причина:** В `knowledge-base.ts` было только 2 дисклеймера.
**Решение:** Добавлено 4 дисклеймера.

### System prompt по умолчанию в `llm-router.ts`
**Причина:** Для en/ja использовался узбекский system prompt.
**Решение:** Добавлены дефолтные system prompt для всех 4 языков.

---

## 2026-05-06 — Phase 1.5 (1): DB Миграции + Landing

### DB — 5 миграций применено ✅

| Миграция | Что сделала |
|---|---|
| `phase15_contact_requests` | Таблица CRM заявок компаний + RLS |
| `phase15_tenant_company_info` | В `tenants`: статус, ИНН, юр. данные, банк, подтверждение |
| `phase15_roles_update` | В `user_tenants`: sub_admin, company_admin, accountant, manager |
| `phase15_employee_profiles` | Полная таблица HR-данных (паспорт, ПИНФЛ, зарплата) |
| `phase15_employee_invites` | Таблица одноразовых токенов приглашений (TTL 24ч) |

---

## Ключевые параметры

| Параметр | Значение |
|----------|----------|
| Supabase project ref | `ufhepwdkjqptjvxrmpjn` |
| Username бота | `@ai_business_concierge_bot` |
| Admin chat ID | `6132360728` |
| LLM Router | Haiku 3.5 (простые) + Sonnet 4.6 (сложные) |
| Модель embedding | `text-embedding-3-small` (OpenAI) |
| Rate limit | 5 запросов/день (бесплатно) |
| Fallback языка (KB) | `ja` → `en` (KB покрывает только uz/ru/en) |

---

## 2026-07-24 — Завершение локализации на 4 языка и темы

- Библиотека шаблонов, вкладки, поиск, категории, модальное окно, валидация и подписи форматов переведены на общий контракт `uz`, `ru`, `en`, `ja`.
- Все 15 активных production-шаблонов получили локализованные заголовки, описания, подписи полей и тексты документов (`20260724065619_localize_document_templates_four_languages.sql`).
- API документов и OpenAPI enum принимают все четыре языка; frontend больше не заменяет `en` и `ja` на `uz`.
- `next-themes` стал единственным источником темы, принудительная светлая тема удалена, добавлен слой совместимости для контраста старых utility-цветов.
- Общая навигация, уведомления, настройки, профиль компании, аналитика, AI-чат и command palette подключены к locale-системе.
- Проверка: frontend build успешен, 95/95 тестов пройдены, backend bundle успешен; production DB показывает `15/15` заполненных title, body и field locale.

## 2026-07-24 — Исправления по результатам code review

- Типы уведомлений, навигация администратора, ошибки конфигурации auth и все детали профиля сотрудника переведены на ключи `uz`, `ru`, `en`, `ja`.
- Слой совместимости dark mode больше не переопределяет явные классы компонентов `dark:*`; контраст фона, текста, границ и placeholder сохраняется.
- Устранена гонка запросов библиотеки шаблонов при быстрой смене языка: устаревший ответ не заменяет новый, а открытый шаблон предыдущего языка закрывается.
- Кнопка показа пароля снова доступна с клавиатуры, icon-only кнопки получили локализованные `aria-label`.
- Добавлен регрессионный тест; итоговая проверка: 19/19 файлов тестов, 96/96 тестов и production build успешно.
