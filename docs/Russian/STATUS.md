# AI Business Concierge — текущее состояние

> Последний подтверждённый snapshot кода/platform: **2026-08-08**
> Документация упорядочена: **2026-08-07**
> Local runtime, production health/auth и remote GitHub Actions baseline повторно проверены 2026-08-07. P0 commits отправлены, новый CI run завершён полностью green.
> 2026-08-08: commit publishable key отправлен и прошёл CI/Netlify deploy, но production bundle пока использует legacy fallback. Прямой browser Data API доступ к risk scanner tables закрыт в production.
> 2026-08-08: Realtime tenant isolation усилен в production; проверки active membership/tenant и service-role Edge authorization централизованы.
> 2026-08-08: fresh local replay прошёл 32/32 migrations, pgTAP 21/21, real local Auth-token Edge acceptance 8/8.
> 2026-08-08: production migration history выровнена с local; local Storage/Auth pin drift закрыт и enabled full-stack health подтверждён.
> 2026-08-08: Supabase CLI обновлён до `v2.112.0`; fresh replay и все acceptance/regression gates прошли с новым local key/grant contract.
> 2026-08-08: Portfolio-inspired frontend redesign локально завершён, все automated frontend gates прошли; browser acceptance и commit/push остаются pending.

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
| Git | `agent/portfolio-inspired-redesign` pushed at `83bc7e0`; draft PR #2 открыт в `main`; не merged/deployed |
| Runtime | Node.js `22.18.0`; `.nvmrc` и package engine `22.x` |
| Supabase CLI | Official Homebrew tap `v2.112.0`; подтверждён на fresh local volume |
| Backend | Supabase Edge Function `bright-api` v74 |
| Health | `200` |
| Type-check | Успешно |
| Unit tests | 21/21 файлов, 101/101 тестов |
| Production build/security check | Успешно |
| Production dependency audit | Scoped gate: 0 unexcepted high/critical; GHSA-qwww metadata exception до 2026-08-21 |
| Frontend design system | Portfolio-inspired warm/ink/Sher-blue; landing, public/auth, product core и admin shell redesign завершён локально |
| Visual browser acceptance | `agent-browser`: desktop/mobile landing, login, forgot-password и contact passed; overlay, browser errors и horizontal overflow не обнаружены |
| Preview CI | GitHub run `31240118332` passed; Vercel passed; Netlify Deploy Preview ready |
| Remote GitHub Actions | Run `31193931735`, commit `3e383b1`: success; все шаги `frontend-security-gate` green |
| Frontend Supabase key contract | Code/deploy: publishable primary + temporary fallback; production bundle использует legacy anon fallback, Netlify env/login pending |
| DB/Edge security acceptance | Fresh migration replay 32/32; local pgTAP 21/21; real Auth-token Edge tests 8/8; Realtime tables SELECT-only и требуют active membership/tenant |
| Migration history | Local/remote 32/32 совпадают; production `db push --dry-run`: up to date |
| Local Supabase services | Storage `v1.68.1`, Auth `v2.195.0`; все enabled containers healthy; Storage/Auth/Studio HTTP `200`; `imgproxy` stopped, так как transformations выключены |

## Состояние возможностей

| Область | Статус | Примечание |
|---|---|---|
| Auth, multi-tenant, RBAC и основные web-модули | Done | Основной фундамент работает |
| Realtime и task notifications | Done | Inbox, Tasks, Notifications, acknowledge |
| Admin platform | Partial | Основное управление/monitoring есть; advanced agents/billing нет |
| Telegram | Partial / operational block | Проверить `TELEGRAM_WEBHOOK_SECRET` и webhook |
| Resend inbox | Partial | Код есть; receiving/delivery E2E не подтверждён |
| AI Concierge/RAG и cost tracking | Partial | Основа есть; citation UX, plan enforcement и smoke-test остаются |
| AI Документолог | Partial — active | 15 templates/4 языка/draft pipeline есть; PDF/DOCX и Storage нет |
| HR Candidate Analysis | Skeleton | Scaffold есть; production endpoint возвращает `501 NOT_IMPLEMENTED` |
| Billing / Click / Payme и AI Sales Bot | Planned | Phase 3 |

## Ближайший порядок

1. Принять решение по review/merge draft PR #2; production deployment не выполнялся.
2. Восстановить Netlify CLI login, установить publishable env, redeploy и Auth/Realtime smoke-test до удаления legacy fallback.
3. До 2026-08-21 пересмотреть GHSA-qwww, затем продолжить PDF/DOCX/Storage Документолога.

Подробности: [PLAN.md](PLAN.md). Основной источник: [узбекский STATUS](../STATUS.md).
