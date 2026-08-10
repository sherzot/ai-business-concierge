# AI Business Concierge — текущее состояние

> Последний подтверждённый snapshot кода/platform: **2026-08-10**
> Документация упорядочена: **2026-08-07**
> Local runtime, production health/auth и remote GitHub Actions baseline повторно проверены 2026-08-07. P0 commits отправлены, новый CI run завершён полностью green.
> 2026-08-08: commit publishable key отправлен и прошёл CI/Netlify deploy, но production bundle пока использует legacy fallback. Прямой browser Data API доступ к risk scanner tables закрыт в production.
> 2026-08-08: Realtime tenant isolation усилен в production; проверки active membership/tenant и service-role Edge authorization централизованы.
> 2026-08-08: fresh local replay прошёл 32/32 migrations, pgTAP 21/21, real local Auth-token Edge acceptance 8/8.
> 2026-08-08: production migration history выровнена с local; local Storage/Auth pin drift закрыт и enabled full-stack health подтверждён.
> 2026-08-08: Supabase CLI обновлён до `v2.112.0`; fresh replay и все acceptance/regression gates прошли с новым local key/grant contract.
> 2026-08-08: Portfolio-inspired frontend redesign прошёл browser acceptance, commits `83bc7e0`/`509bc2d` отправлены, PR #2 открыт, CI green.
> 2026-08-10: PR #3 merged в `main` как `79be466`; Codex review hotfix `aee6692` также pushed в `main`. Netlify production deploy `6a79d69c9aa5a6bcf326e83c` ready, `bright-api` v75 ACTIVE; остаются authenticated smoke-tests двух ролей.
> 2026-08-10: User подтвердил успешные authenticated production checks Leader Company Profile и Super Admin dashboard. Landing Why Us contrast fix уже в `main` через PR #4; Company Dashboard contrast fix и regression test green в PR #5, production rollout pending.

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
| Git | PR #4 squash-merged в `main` как `700483d`; Company Dashboard contrast fix `4184ddb` находится в PR #5 с green remote gates |
| Runtime | Node.js `22.18.0`; `.nvmrc` и package engine `22.x` |
| Supabase CLI | Official Homebrew tap `v2.112.0`; подтверждён на fresh local volume |
| Backend | Supabase Edge Function `bright-api` v75, `ACTIVE`, `verify_jwt=false` |
| Health | `200` |
| Type-check | Успешно |
| Unit tests | 23/23 файлов, 108/108 тестов |
| Production build/security check | Успешно |
| Production dependency audit | Scoped gate: 0 unexcepted high/critical; GHSA-qwww metadata exception до 2026-08-21 |
| Frontend design system | Portfolio-inspired warm/ink/Sher-blue; landing, public/auth, product core и admin shell redesign завершён локально |
| Visual browser acceptance | Все 6/6 причин Why Us отображаются inverse text в dark/light modes: title `rgb(244,243,239)`, background `rgb(17,19,24)`, overflow `0`, console/overlay errors нет; dashboard inverse markup закрыт regression test |
| Preview CI | PR #3 Netlify preview deploy `6a79d24ae3c42e00088b058f` ready; Vercel ready |
| Remote GitHub Actions | PR #3 run `31393176016`, commit `be047c4`: success; все шаги `frontend-security-gate` green |
| Production frontend | Netlify deploy `6a79d69c9aa5a6bcf326e83c` ready, published 2026-08-10T13:50:02.498Z |
| Frontend Supabase key contract | Code/deploy: publishable primary + temporary fallback; production bundle использует legacy anon fallback, Netlify env/login pending |
| DB/Edge security acceptance | Fresh migration replay 32/32; local pgTAP 21/21; real Auth-token Edge tests 8/8; Realtime tables SELECT-only и требуют active membership/tenant |
| Migration history | Local/remote 32/32 совпадают; production `db push --dry-run`: up to date |
| Local Supabase services | Storage `v1.68.1`, Auth `v2.195.0`; все enabled containers healthy; Storage/Auth/Studio HTTP `200`; `imgproxy` stopped, так как transformations выключены |

## Состояние возможностей

| Область | Статус | Примечание |
|---|---|---|
| Auth, multi-tenant, RBAC и основные web-модули | Done | Основной фундамент работает |
| Realtime и task notifications | Done | Inbox, Tasks, Notifications, acknowledge |
| Admin platform | Partial | Основное управление/monitoring есть; user подтвердил tenant-profile/AI-stats authenticated smoke tests, dashboard dark-contrast rollout pending |
| Telegram | Partial / operational block | Проверить `TELEGRAM_WEBHOOK_SECRET` и webhook |
| Resend inbox | Partial | Код есть; receiving/delivery E2E не подтверждён |
| AI Concierge/RAG и cost tracking | Partial | Основа есть; citation UX, plan enforcement и smoke-test остаются |
| AI Документолог | Partial — active | 15 templates/4 языка/draft pipeline есть; PDF/DOCX и Storage нет |
| HR Candidate Analysis | Skeleton | Scaffold есть; production endpoint возвращает `501 NOT_IMPLEMENTED` |
| Billing / Click / Payme и AI Sales Bot | Planned | Phase 3 |

## Ближайший порядок

1. Merge PR #5, deploy landing + Company Dashboard dark-contrast hotfixes в Netlify production и повторить smoke-test.
2. Восстановить Netlify CLI login, установить publishable env, redeploy и Auth/Realtime smoke-test до удаления legacy fallback.
3. До 2026-08-21 пересмотреть GHSA-qwww, затем продолжить PDF/DOCX/Storage Документолога.

Подробности: [PLAN.md](PLAN.md). Основной источник: [узбекский STATUS](../STATUS.md).
