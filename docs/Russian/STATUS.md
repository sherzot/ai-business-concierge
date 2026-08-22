# AI Business Concierge — текущее состояние

> Последний подтверждённый snapshot кода/platform: **2026-08-22**
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
> 2026-08-21: Telegram webhook v14 принимал invalid POST с `200` без secret. После pure guard и tests 4/4 production v15: health `200`, invalid POST fail-closed `503`, PUT `405`. `67ac675` в main и CI `32485618740` green; остаются secret setup и Telegram `setWebhook`.
> 2026-08-21: HR Candidate получил real public GitHub adapter с bounded REST/pagination/response, timeout, repository-tree aggregation и 10-minute cache; Deno 10/10 и live `octocat` smoke complete. `8496aae` в main, CI `32487503062` green. Route остаётся `501`; Supabase Free блокирует Pro+ Leaked Password Protection.
> 2026-08-21: Для HR Candidate реализован secret-free PDF/DOCX parser с лимитами 5 MiB/file magic/PDF 50 pages/text, защитой DOCX ZIP-bomb и EN/UZ/RU/JA date/section signals. `2526d72` в main, CI `32489478394` green с Deno 22/22; Haiku semantic structuring и route `501` остаются gated до provider key.
> 2026-08-21: HR request boundary/orchestrator усилен fail-closed: pre-provider validation, tenant role guard, plan policy, failed-CV hard stop, timer cleanup, canonical ULID и schema exclusivity. `2656e6a` в main, CI `32491296828` green с Deno 34/34; остаются persistent quota/LLM/route wiring.
> 2026-08-22: HR tenant quota и multipart boundary завершены без provider secret: PostgreSQL minute/day/concurrency lease, DB plan mapping, bounded streaming 5 MiB + 64 KiB и safe drain disabled route. В staging 39 migrations, remote pgTAP runner 22 cases success; Deno 47/47 и frontend 117/117 green. Production DB/Edge не менялся; local fresh replay blocked из-за Docker socket.
> 2026-08-22: Frontend boundary upload/state/result HR Candidate доведён до production-grade: bounded client validation, tenant/session-first multipart, timeout/cancellation, защита stale response, runtime result validation и accessible responsive UX. Frontend 28/28 файлов, 127/127 tests и все build/security gates green; desktop/mobile browser acceptance без horizontal overflow. Backend route намеренно остаётся `501`.
> 2026-08-22: `f77dd9a` в main, GitHub CI `32545770532` green, Netlify production deploy `6a89065505b5600008dd0385` ready. `/` и `/dashboard/hr/candidates` возвращают `200`; CSP и production-only bundle green. Provider route остаётся `501`.
> 2026-08-22: HR provider usage/cost accounting atomic/idempotent; staging 40 migrations, remote transactional acceptance и Deno 51/51 green. Prompt/CV/output не сохраняются; production и `501` без изменений.
> 2026-08-22: Завершены deterministic six-category HR scoring и UZ/JA/EN evidence-linked report fallback. Scoring `5395da1` CI `32547412956` и final `b222cf9` CI `32547588906` green: Deno 60/60 и все quality/frontend/security gates прошли. Semantic provider refinement, accounting call-sites и production `501` без изменений.
> 2026-08-22: Готовы strict HR provider JSON/bounds и fail-closed account-before-validation boundary; raw output исключён из accounting type boundary, low-evidence report schema edge case исправлен. Final `550ca8b` CI `32552046675` green: Deno 69/69 и все quality/frontend/security gates прошли; live provider/route, staging/production runtime и `501` не изменились.
> 2026-08-22: Завершён HR quota reserve/execute/finally-release lifecycle для denial, success, provider failure и cleanup failure. `8b11515` CI `32552288887` green: Deno 74/74 и все gates прошли; active route и production `501` без изменений.
> 2026-08-22: Trusted-system/untrusted-data HR prompt contracts теперь обеспечивают exact output, injection escaping, bias/privacy guards и minimized evidence. `d07577f` CI `32552683005` green: Deno 80/80 и все gates прошли; live provider и production `501` без изменений.
> 2026-08-22: Injectable HR provider-stage pipeline теперь фиксирует model/budget/cache policy, metadata-only accounting, strict validation и deterministic merge. `deadcdc` CI `32553032864` green: Deno 88/88 и все gates прошли; live key/composition-root wiring и `501` остаются.
> 2026-08-22: Завершены 16k-bounded sanitized raw-CV in-memory seam и injectable provider-stage orchestration; private text не попадает в result/log/persistence и отсутствует при failed parse. `116c833` CI `32553502762` green: Deno 92/92 и все gates прошли; server composition, live smoke и `501` остаются.
> 2026-08-22: HR server composition factory связывает server-only key и canonical tenant/user/request context с tenant+request+stage cache и atomic accounting; invalid config fail-closed до provider. `2e4db5c` CI `32553827974` green: Deno 95/95 и все gates прошли; application execution/live smoke и `501` остаются.
> 2026-08-22: HR application boundary объединяет role/input precheck, один request ULID, provider composition и quota reserve/execute/finally-release с typed HTTP mapping. `eac2a3d` CI `32554187835` green: Deno 102/102 и все gates прошли; global 30s deadline, live smoke и `501` остаются.
> 2026-08-22: HR application execution теперь enforce maximum 30s global deadline и typed `504 TIMEOUT`; background provider accounting и quota cleanup завершаются после deadline. `11ab6af` CI `32554430334` green: Deno 103/103 и все gates прошли; typed provider-unavailable, live smoke и `501` остаются.
> 2026-08-22: Provider/config/accounting failure теперь map в localized `AI_UNAVAILABLE` и HTTP `503`; backend schema и four-locale frontend copy синхронны. `f184434` CI `32554684769` green: Deno 105/105 и все gates прошли; live smoke и `501` остаются.
> 2026-08-22: `36b9553` в main, GitHub CI `32546561166` green за 1m12s; Netlify skipped, поскольку frontend runtime не менялся.

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
| Staging Supabase | `piqsyfwrjtormrlenjix`, `ap-southeast-1`, `$0/month`, `ACTIVE_HEALTHY`; 40 migrations, `bright-api` v11 ACTIVE, health `200`, unauth docs/polish `401 TENANT_REQUIRED` |
| Staging Auth/API keys | Netlify preview wildcard + local Vite redirect allow-list; email confirmation ON, 8-digit/1-minute OTP, TOTP ON; Auth settings HTTP `200`, autoconfirm false. Edge использует modern overrides `SB_ANON_KEY`/`SB_SERVICE_ROLE_KEY`; legacy anon/service-role API keys disabled |
| Type-check | Успешно в clean temporary frontend install |
| Unit tests | Frontend 28/28 files, 127/127 tests, HR Candidate frontend 12/12; HR backend application 9 + orchestrator 9 и все остальные слои = 101/101; targeted с Telegram 105/105 |
| Deployment environment guard | 14/14 Node tests: 10 isolation-contract checks + 2 Vite `.env` fallback/runtime-precedence + 2 bundled-endpoint extraction regressions |
| Production build/security check | Build прошёл с synthetic non-production ref; CSP создан из этого ref; проверено 10 build/Netlify файлов |
| Production dependency audit | Raw audit: всего 0 vulnerabilities; scoped gate без исключений: high/critical 0 |
| Frontend design system | Portfolio-inspired warm/ink/Sher-blue; landing, public/auth, product core и admin shell redesign завершён локально |
| Visual browser acceptance | Landing Why Us 6/6 inverse text green. Landing hero TEAM/caption: gap 12.73px на 2048×1080, overlap/overflow/console errors `0`. Authenticated Company Dashboard dark mode: title/percentage contrast `16.73:1`, muted text `7.5:1`, success signal `10.66:1`, 12/12 text nodes внутри panel |
| Delivery platform | Только Netlify. В repository нет Vercel config/dependency; внешний Vercel project сохранён, `gitRepositoryConnected=false` подтверждён |
| Environment isolation | Authoritative Netlify CLI read-back 4/4: `production` -> production Supabase; `deploy-preview`/`branch-deploy`/`dev` -> staging. Optional URL envs отсутствуют; на Personal только browser-public `VITE_*` используют `All` scope |
| Staging security advisor | Errors `0`; известный `vector` public-schema warning `1`; server-only RLS/no-policy infos `11` |
| Remote GitHub Actions | Final code commit `f184434` main run `32554684769` success за 1m08s: Deno 105/105 и все backend/frontend/build/security gates green |
| Netlify preview | Новый deploy preview не создан, потому что slice pushed напрямую в `main`; Netlify использовал production context |
| Production frontend | Deploy `6a89065505b5600008dd0385` ready, build `6a89065505b5600008dd0383`, commit `f77dd9a`, 29s, plugin success, 0 secret matches в 87,145 files; `/` и `/dashboard/hr/candidates` `200`, CSP и production-only `index-DipHAHEa.js` green |
| Frontend Supabase key contract | Code и production принимают только modern publishable key; bundle: modern key 1, JWT-like keys 0, legacy env name отсутствует, format guard есть; Auth settings `200`, Realtime `OPEN`; legacy frontend env Netlify удалён |
| DB/Edge security acceptance | Fresh migration replay 32/32; local pgTAP 21/21; local real Auth-token Edge tests 8/8; staging modern-key remote Edge 8/8, cleanup двух tenants/пяти Auth users и final fixture 0/0; Realtime tables SELECT-only и требуют active membership/tenant |
| Document binary/Storage acceptance | Real PDF/DOCX lifecycle Deno 7/7. Production authenticated DOCX/PDF signed downloads green; direct Storage `400`, cross-tenant export `404`, delete `200`, residue document/generated/object 0/0/0 и final fixture 0/0/0/0/0. Invalidation cached signed URL в Smart CDN может занять до 60 секунд |
| Migration history | Предыдущий canonical local fresh replay 37/37 и full database pgTAP 45/45 green. В staging 39 migrations; новый HR quota remote pgTAP runner 22 cases success, read-back RLS+FORCE 2/2 private tables и RPC grants green. Production 36/36 и не изменён. User-owned duplicate migration copy не изменена |
| Local Supabase services | Docker socket не отвечал, поэтому fresh local 39-migration replay BLOCKED. Новый SQL проверен в staging PostgreSQL 17.6 через dry-run/pgTAP; предыдущий local baseline 37/37 и pgTAP 45/45 green |

## Состояние возможностей

| Область | Статус | Примечание |
|---|---|---|
| Auth, multi-tenant, RBAC и основные web-модули | Done | Основной фундамент работает |
| Realtime и task notifications | Done | Inbox, Tasks, Notifications, acknowledge |
| Admin platform | Partial | Основное управление/monitoring есть; tenant-profile/AI-stats authenticated smoke tests и Company Dashboard dark-contrast visual acceptance подтверждены в user session |
| Telegram | Partial / fail-closed operational block | Production v15 ACTIVE; health `200`, POST `503` без secret. Остаются secret setup, Telegram `setWebhook` и bot smoke |
| Resend inbox | Partial | Код есть; receiving/delivery E2E не подтверждён |
| AI Concierge/RAG и cost tracking | Partial | Основа есть; polishing request quota race-safe через PostgreSQL atomic reservation/release, provider usage учитывается до output validation. Остаются rollout migration, citation UX, billing dashboard, unified endpoint enforcement и smoke tests |
| AI Документолог | Production binary + staged AI polish preview / provider blocked | 15 templates, 4 языка и real PDF/DOCX/private Storage работают. Polishing frontend в production, migration и `bright-api` v11 в staging; Auth/tenant/document boundaries и cleanup green, но real-provider smoke возвращает `503 AI_UNAVAILABLE`, потому что в staging нет `ANTHROPIC_API_KEY`. Production backend/migration rollout намеренно ожидает |
| HR Candidate Analysis | Partial / provider blocked | Bounded adapters, local PDF/DOCX и sanitized raw-CV in-memory seam, request/role, PostgreSQL quota/finally-release, multipart, atomic usage/cost persistence, minimized prompts, injectable Haiku/Sonnet stages, strict output/account-before-validation, server composition, deterministic merge/scorer/report, provider-stage orchestrator, 30s-deadline application execution, typed `AI_UNAVAILABLE` и frontend boundary tested; остаются live smoke и active route; production `501` |
| Billing / Click / Payme и AI Sales Bot | Planned | Phase 3 |

## Ближайший порядок

1. После получения `ANTHROPIC_API_KEY` подключить semantic CV structuring и Sonnet refinement поверх deterministic scoring/report baseline, учитывать каждый response через готовый RPC до output validation и сохранить `501` до готовности full flow.
2. После получения key безопасно установить его в staging Edge secrets, подключить semantic CV/scoring/report и сделать authenticated real-provider smoke green.
3. После green staging smoke подключить готовую quota lifecycle boundary к canonical route и снять `501`; отдельно выполнить smoke production rollout AI Документолога migration `20260821000000` + `bright-api`.

Подробности: [PLAN.md](PLAN.md). Основной источник: [узбекский STATUS](../STATUS.md).
