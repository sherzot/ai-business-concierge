# AI Business Concierge — текущее состояние

> Последний подтверждённый snapshot кода/platform: **2026-08-08**
> Документация упорядочена: **2026-08-07**
> Local runtime, production health/auth и remote GitHub Actions baseline повторно проверены 2026-08-07. P0 commits отправлены, новый CI run завершён полностью green.
> 2026-08-08: commit publishable key отправлен и прошёл CI/Netlify deploy, но production bundle пока использует legacy fallback. Прямой browser Data API доступ к risk scanner tables закрыт в production.

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
| Git | Risk-scanner hardening commit `3e383b1` отправлен в `origin/main` |
| Runtime | Node.js `22.18.0`; `.nvmrc` и package engine `22.x` |
| Backend | Supabase Edge Function `bright-api` v72 |
| Health | `200` |
| Type-check | Успешно |
| Unit tests | 21/21 файлов, 101/101 тестов |
| Production build/security check | Успешно |
| Production dependency audit | Scoped gate: 0 unexcepted high/critical; GHSA-qwww metadata exception до 2026-08-21 |
| Remote GitHub Actions | Run `31193931735`, commit `3e383b1`: success; все шаги `frontend-security-gate` green |
| Frontend Supabase key contract | Code/deploy: publishable primary + temporary fallback; production bundle использует legacy anon fallback, Netlify env/login pending |
| DB security | RLS на 32/32 public tables; 8/8 views используют `security_invoker`; 6/6 `SECURITY DEFINER` functions закрыты для browser EXECUTE; risk tables закрыты от `anon/authenticated` CRUD |

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

1. Восстановить Netlify CLI login, установить production `VITE_SUPABASE_PUBLISHABLE_KEY`, redeploy и Auth/Realtime smoke-test; только затем удалить legacy frontend env/fallback.
2. Добавить cross-tenant CRUD/role fixtures; проверить RLS на основе `user_tenants` и authorization каждого service-role route.
3. До 2026-08-21 пересмотреть/удалить GHSA-qwww metadata exception.
4. Завершить PDF/DOCX, private Storage и signed URL для Документолога.
5. Закрыть Telegram/Resend verification, затем реализовать HR Candidate Analysis.

Подробности: [PLAN.md](PLAN.md). Основной источник: [узбекский STATUS](../STATUS.md).
