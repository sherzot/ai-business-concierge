# Журнал разработки — AI Business Concierge

История развития проекта, выполненные работы, обнаруженные ошибки и их решения.

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
