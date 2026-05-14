# Журнал разработки — AI Business Concierge

История развития проекта, выполненные работы, обнаруженные ошибки и их решения.

> **Переводы (синхронизируются):** [Узбекский (основной)](../DEVLOG.md) · [English](../English/DEVLOG.md) · [Uzbek](../Uzbek/DEVLOG.md) · [日本語](../日本語/DEVLOG.md)
>
> **Протокол (CLAUDE.md §...):** Каждое изменение фиксируется здесь и во всех 4 переводах.

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
