# AI Business Concierge — текущее состояние

> Последний подтверждённый snapshot кода/platform: **2026-08-07**
> Документация упорядочена: **2026-08-07**
> Local runtime, production health/auth и remote GitHub Actions baseline повторно проверены 2026-08-07. P0 commits отправлены, новый CI run завершён полностью green.

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
| Git | P0 commit set `55ec941` → `a088fef` → `06b5756` отправлен в `origin/main` |
| Runtime | Node.js `22.18.0`; `.nvmrc` и package engine `22.x` |
| Backend | Supabase Edge Function `bright-api` v72 |
| Health | `200` |
| Type-check | Успешно |
| Unit tests | 19/19 файлов, 96/96 тестов |
| Production build/security check | Успешно |
| Production dependency audit | Scoped gate: 0 unexcepted high/critical; GHSA-qwww metadata exception до 2026-08-21 |
| Remote GitHub Actions | Run `31188866507`, commit `06b5756`: success; все шаги `frontend-security-gate` green |

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

1. До 2026-08-21 пересмотреть/удалить GHSA-qwww metadata exception.
2. Безопасно перейти на `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. Завершить browser Supabase, RLS/grants и cross-tenant authorization audit.
4. Завершить PDF/DOCX, private Storage и signed URL для Документолога.
5. Закрыть Telegram/Resend verification, затем реализовать HR Candidate Analysis.

Подробности: [PLAN.md](PLAN.md). Основной источник: [узбекский STATUS](../STATUS.md).
