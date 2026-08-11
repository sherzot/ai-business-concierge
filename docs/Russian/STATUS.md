# AI Business Concierge — текущее состояние

> Последний подтверждённый snapshot кода/platform: **2026-08-11**
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
| Git | `main` и `origin/main` синхронизированы; latest application merge `c00362a`, final docs-only closeout в main, tracked tree clean |
| Runtime | Node.js `22.18.0`; `.nvmrc` и package engine `22.x` |
| Supabase CLI | Official Homebrew tap `v2.112.0`; подтверждён на fresh local volume |
| Backend | Supabase Edge Function `bright-api` v75, `ACTIVE`, `verify_jwt=false` |
| Health | `200` |
| Staging Supabase | `piqsyfwrjtormrlenjix`, `ap-southeast-1`, `$0/month`, `ACTIVE_HEALTHY`; 32/32 migrations, `bright-api` v1 ACTIVE, health `200` |
| Staging Auth | Netlify preview wildcard + local Vite redirect allow-list; email confirmation ON, 8-digit/1-minute OTP, TOTP ON; Auth settings HTTP `200`, autoconfirm false |
| Type-check | Успешно |
| Unit tests | 23/23 файлов, 108/108 тестов |
| Deployment environment guard | 14/14 Node tests: 10 isolation-contract checks + 2 Vite `.env` fallback/runtime-precedence + 2 bundled-endpoint extraction regressions |
| Production build/security check | Build прошёл с synthetic non-production ref; CSP создан из этого ref; проверено 10 build/Netlify файлов |
| Production dependency audit | Raw audit: всего 0 vulnerabilities; scoped gate без исключений: high/critical 0 |
| Frontend design system | Portfolio-inspired warm/ink/Sher-blue; landing, public/auth, product core и admin shell redesign завершён локально |
| Visual browser acceptance | Landing Why Us 6/6 inverse text green. Authenticated Company Dashboard dark mode: Business Status background `rgb(17,19,24)`; title/percentage contrast `16.73:1`, muted text `7.5:1`, success signal `10.66:1`; 12/12 text nodes внутри panel, overlap/overflow/console errors `0` |
| Delivery platform | Только Netlify. В repository нет Vercel config/dependency; внешний Vercel project сохранён, `gitRepositoryConnected=false` подтверждён |
| Environment isolation | Authoritative Netlify CLI read-back 4/4: `production` -> production Supabase; `deploy-preview`/`branch-deploy`/`dev` -> staging. Optional URL envs отсутствуют; на Personal только browser-public `VITE_*` используют `All` scope |
| Staging security advisor | Errors `0`; известный `vector` public-schema warning `1`; server-only RLS/no-policy infos `11` |
| Remote GitHub Actions | PR #9 run `31481174852` и main run `31481586911`, commit `c00362a`: success; 14 env/security tests, type-check, 108 tests, audit, build и security steps green |
| Netlify preview | PR #9 deploy `6a7af589fd49aa00082aa968` ready; staging-only CSP/bundle, noindex/no-store, 0 secret matches в 87,166 files |
| Production frontend | Deploy `6a7af6d8233dfa000954ac24` ready, build `6a7af6d8233dfa000954ac22`, 32s, plugin success, 0 secret matches в 87,166 files; production-only CSP/bundle, page/Auth/health `200`, Realtime `OPEN` |
| Frontend Supabase key contract | Code и production принимают только modern publishable key; bundle: modern key 1, JWT-like keys 0, legacy env name отсутствует, format guard есть; Auth settings `200`, Realtime `OPEN`; legacy frontend env Netlify удалён |
| DB/Edge security acceptance | Fresh migration replay 32/32; local pgTAP 21/21; real Auth-token Edge tests 8/8; Realtime tables SELECT-only и требуют active membership/tenant |
| Migration history | Local/remote 32/32 совпадают; production `db push --dry-run`: up to date |
| Local Supabase services | Storage `v1.68.1`, Auth `v2.195.0`; все enabled containers healthy; Storage/Auth/Studio HTTP `200`; `imgproxy` stopped, так как transformations выключены |

## Состояние возможностей

| Область | Статус | Примечание |
|---|---|---|
| Auth, multi-tenant, RBAC и основные web-модули | Done | Основной фундамент работает |
| Realtime и task notifications | Done | Inbox, Tasks, Notifications, acknowledge |
| Admin platform | Partial | Основное управление/monitoring есть; tenant-profile/AI-stats authenticated smoke tests и Company Dashboard dark-contrast visual acceptance подтверждены в user session |
| Telegram | Partial / operational block | Проверить `TELEGRAM_WEBHOOK_SECRET` и webhook |
| Resend inbox | Partial | Код есть; receiving/delivery E2E не подтверждён |
| AI Concierge/RAG и cost tracking | Partial | Основа есть; citation UX, plan enforcement и smoke-test остаются |
| AI Документолог | Partial — active | 15 templates/4 языка/draft pipeline есть; PDF/DOCX и Storage нет |
| HR Candidate Analysis | Skeleton | Scaffold есть; production endpoint возвращает `501 NOT_IMPLEMENTED` |
| Billing / Click / Payme и AI Sales Bot | Planned | Phase 3 |

## Ближайший порядок

1. Выполнить authenticated Edge acceptance с ephemeral synthetic Auth/tenant fixture в staging и очистить fixture.
2. Продолжить PDF/DOCX/Storage Документолога.

Подробности: [PLAN.md](PLAN.md). Основной источник: [узбекский STATUS](../STATUS.md).
