# PLAN.md — AI Business Concierge

> Пошаговый план реализации
> Версия: 3.0 | Обновлено: 2026-05-06
> ⚡ РЫНОЧНАЯ СРОЧНОСТЬ: SQB выпустил "AI Советник" — ускоренный график

---

## СТРАТЕГИЧЕСКИЙ КОНТЕКСТ

Государственный банк SQB в 2026 году выпустил продукт "AI Советник". Это:
- **Подтверждает рынок** — спрос есть, инвестиции оправданы
- **Ускоряет нас** — нужно первыми выйти на рынок с горизонтальным ежедневным решением
- **Не конкурент, а воронка** — SQB покрывает стартовый этап, мы — ежедневные операции

**Цель:** Выйти на рынок с Telegram MVP до 2026 Q2 (июнь).

---

## УСКОРЕННЫЙ TIMELINE

```
Phase 0:   Подготовка ................. Недели 1-2   ✅ ЗАВЕРШЁН
Phase 1:   Telegram MVP ............... Недели 3-5   ✅ ЗАВЕРШЁН
Phase 1.5: Company Auth & Management .. Недели 6-8   ✅ ЗАВЕРШЁН
Phase 2:   Документовед + Лендинг .... Недели 9-12  🚧 НАЧАТ
Phase 3:   Бот продаж + Платежи ...... Недели 13-16 (4 недели)
Phase 4:   Admin AI + Полировка ...... Недели 17-20 (4 недели)
Phase 5:   Масштабирование ............ Недели 21-27 (7 недель)
```

> **Почему Phase 1.5 СРОЧНО:** Для работы биллинга/платежей компании ДОЛЖНЫ быть правильно зарегистрированы, подтверждены и разделены по ролям. Цепочка регистрация → биллинг → доход лежит в этом фазе.

---

## PHASE 0: ПОДГОТОВКА (Недели 1-2) ✅ ЗАВЕРШЁН

**Цель:** Инфраструктура готова, AI работает, KB заполнен

### 0.1 Миграция LLM (OpenAI → Claude)
- [x] Установка Anthropic SDK (для Deno)
- [x] LLM Router service — авто-выбор Haiku/Sonnet, отслеживание стоимости, кэш
- [x] Миграция `/ai/chat` endpoint на Claude
- [x] OpenAI оставлен как fallback

### 0.2 Настройка Knowledge Base
- [x] Включение pgvector extension (Supabase)
- [x] Таблица `knowledge_base` + миграция
- [x] KB service — embedding (OpenAI text-embedding-3-small), семантический поиск
- [x] Начальный контент (50+ вопросов-ответов): налоговые правила, сроки, трудовой кодекс

### 0.3 Миграция БД (12 новых таблиц)
- [x] `subscriptions`, `payments`, `ai_conversations`, `ai_messages`, `ai_feedback`
- [x] `doc_templates`, `doc_generated`, `sales_bots`, `catalogs`, `orders`
- [x] `knowledge_base` (pgvector), `audit_log`, `usage_tracking`
- [x] RLS policies + индексы производительности

**Результат:** Claude API работает, KB отвечает на 50+ вопросов, БД готова

---

## PHASE 1: TELEGRAM MVP (Недели 3-5) ✅ ЗАВЕРШЁН

**Цель:** AI Советник работает в Telegram боте, 50 бета-пользователей

### 1.1 Настройка Telegram бота
- [x] Настройка grammY framework (Supabase Edge Function)
- [x] Команды: `/start`, `/help`, `/language`, `/stats`
- [x] Обработчик ошибок — бот НИКОГДА не падает

### 1.2 Онбординг
- [x] `/start` → выбор языка (UZ/RU/EN/JA)
- [x] Различие для вернувшихся пользователей
- [x] Ограничение: 5 запросов/день (бесплатно)

### 1.3 AI Советник (Модуль 1)
- [x] AI pipeline: сообщение → LLM Router → KB → Claude → ответ
- [x] Проверка уверенности → дисклеймер
- [x] Обратная связь: [👍] [👎]
- [x] Отображение остатка лимита

### 1.4 Бета-запуск
- [x] 50 бета-пользователей
- [x] Сбор обратной связи

**Результат:** Бот работает, 50 бета-пользователей, 90%+ точность, <3с ответ

---

## PHASE 1.5: COMPANY AUTH & MANAGEMENT (Недели 6-8) ✅ ЗАВЕРШЁН

**Цель:** Онбординг компаний, онбординг сотрудников, система ролей, основа для биллинга
**Почему сейчас:** Для работы биллинга компании ДОЛЖНЫ быть правильно зарегистрированы и иметь чёткие роли.

### 1.5.1 База данных — Новые таблицы

#### A. Таблица `contact_requests` (новая)
```sql
CREATE TABLE contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  company_name text,
  stir text,
  phone text NOT NULL,
  email text NOT NULL,
  business_type text,        -- ip, ooo, ao, other
  employee_count text,       -- 1-10, 11-50, 51-200, 200+
  message text,
  source text,               -- ads, referral, search, telegram
  status text DEFAULT 'new', -- new, contacted, invite_sent, registered, rejected
  admin_note text,
  invite_token text,
  invite_expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
-- RLS: только super_admin/sub_admin
```

#### B. Новые колонки в `tenants`
```sql
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS
  status text DEFAULT 'active',  -- pending_approval, active, suspended, blocked
  legal_form text,
  stir text,
  legal_address text,
  activity_type text,
  bank_name text,
  bank_account text,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  blocked_reason text;
```

#### C. Обновление ролей `user_tenants`
```sql
ALTER TABLE user_tenants ADD CONSTRAINT user_tenants_role_check
  CHECK (role IN ('super_admin','sub_admin','company_admin','hr','accountant','manager','employee'));
```

#### D. Таблица `employee_invites`
```sql
CREATE TABLE employee_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  tenant_id uuid REFERENCES tenants(id),
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  status text DEFAULT 'pending',  -- pending, used, expired
  created_at timestamptz DEFAULT now()
);
```

### 1.5.2 Backend API — Новые эндпоинты

```
POST /v1/contact                          — форма обращения (публичная)
GET  /v1/admin/contacts                   — список обращений
PATCH /v1/admin/contacts/:id/status       — смена статуса
POST /v1/admin/contacts/:id/invite        — отправка invite URL
GET  /v1/admin/companies                  — список компаний
PATCH /v1/admin/companies/:id/approve     — подтверждение
PATCH /v1/admin/companies/:id/block       — блокировка
GET  /v1/register/validate/:token         — проверка токена
POST /v1/register/company                 — регистрация компании
POST /v1/employees                        — новый сотрудник
PATCH /v1/employees/:id/confirm           — подтверждение сотрудника
POST /v1/employees/:id/resend-invite      — повторная отправка invite
GET  /v1/invite/validate/:token           — проверка токена сотрудника
POST /v1/invite/set-password              — установка пароля
```

### 1.5.3 Frontend — Новые страницы

**Публичные:**
- [x] `/contact` — Страница обращения
- [x] `/register?token=...` — Регистрация компании
- [x] `/set-password?token=...` — Установка пароля сотрудника
- [x] `/login` — Обновлённый (статусные сообщения)
- [x] `/forgot-password`, `/reset-password?token=...`

**Admin:**
- [x] `/admin/contacts` — Управление обращениями
- [x] `/admin/companies` — Список компаний
- [x] `/admin/health` — Состояние системы
- [x] `/admin/ai-chat` — Admin AI-помощник (базовый)

**Компания:**
- [x] `/app/employees` — Список сотрудников + управление
- [x] `/app/employees/:id` — Профиль сотрудника

### 1.5.4 Email-шаблоны (Resend)

```
1. company_invite.html       — Invite URL компании
2. company_pending.html      — После регистрации (ожидание подтверждения)
3. company_approved.html     — При подтверждении
4. company_rejected.html     — При отказе
5. employee_invite.html      — URL установки пароля сотруднику
6. employee_approved.html    — При подтверждении сотрудника
7. password_reset.html       — Сброс пароля
```

### 1.5.5 Требования безопасности

- Invite-токен: JWT, RS256, одноразовый
- Invite компании: TTL 48 часов
- Invite сотрудника: TTL 24 часа
- Надёжность пароля: мин. 8 символов, заглавная + строчная буква + цифра
- Защита от brute force: 5 неверных попыток → блок 15 минут

**Результат Phase 1.5:** Компании могут правильно регистрироваться, сотрудники получают безопасные аккаунты, основа для биллинга готова.

---

## PHASE 2: ДОКУМЕНТОВЕД + ЛЕНДИНГ (Недели 9-12)

**Цель:** Генерация документов, лендинговая страница

### 2.1 AI Документовед (Модуль 2)
- [x] 15 шаблонов: seed migration задеплоен в production
- [x] Pipeline черновика: шаблон → динамические поля → `documents` + `doc_generated`
- [ ] AI-вопросы/polish → настоящий PDF/DOCX binary
- [ ] Шрифт Noto Sans (узбекские/русские символы)
- [ ] Интеграция Supabase Storage

### 2.2 Документовед в Telegram
- [ ] Пошаговый Q&A-флоу
- [ ] Отправка документа (Telegram document message)

### 2.3 Лендинговая страница
- [ ] Hero, 3 модуля, Цены, FAQ
- [ ] Mobile-first, UZ/RU/EN/JA, SEO

**Результат:** 15 шаблонов, лендинг работает, генерация документа <10с

---

## PHASE 3: БОТ ПРОДАЖ + ПЛАТЕЖИ (Недели 13-16)

**Цель:** Монетизация, бот продаж

### 3.1 AI Продавец (Модуль 3)
- [ ] Флоу создания бота (токен → каталог → активация)
- [ ] Функционал для клиента: товары, оформление заказа
- [ ] Для предпринимателя: каталог, заказы, статистика

### 3.2 Платежи (Click + Payme)
- [ ] Click: Prepare + Complete + webhook (idempotent)
- [ ] Payme: CreateTransaction + PerformTransaction + webhook
- [ ] Управление подпиской (upgrade/downgrade, grace period 3 дня)

### 3.3 Ограничение использования
- [ ] Middleware ограничений по тарифу
- [ ] Upsell-сообщение (при достижении лимита)

**Результат:** Платежи работают, бот продаж работает, первая выручка
**Метрики:** 50+ платных пользователей, $200+ MRR

---

## PHASE 4: ADMIN AI + ПОЛИРОВКА (Недели 17-20)

**Цель:** Полная система Admin AI, 95%+ качество

### 4.1 Панель Super Admin — Полная
- [ ] `/admin` — Дашборд статистики
- [ ] `/admin/ai` — AI-мониторинг (точность, стоимость, пробелы KB)
- [ ] `/admin/knowledge-base` — Управление KB (CRUD, версионирование)
- [ ] `/admin/billing` — MRR, churn, LTV
- [ ] `/admin/audit` — Журнал аудита (глобальный)

### 4.2 Admin AI Агенты (`/admin/ai-chat`) — Полные
- [ ] KB Agent: пробелы, устаревшие ответы, предложения нового контента
- [ ] Support Agent: объяснение проблем компаний, решения
- [ ] Analytics Agent: причины MRR, анализ оттока, паттерны использования
- [ ] Health Agent: обнаружение аномалий, оповещения в реальном времени

### 4.3 Улучшение качества
- [ ] Точность AI 95%+
- [ ] API <200мс (не-AI), <3с (Haiku), <8с (Sonnet)
- [ ] Тестирование на мобильных (все страницы)

**Результат:** Полный Admin AI, 95%+ точность, стабильная система

---

## PHASE 5: МАСШТАБИРОВАНИЕ (Недели 21-27)

**Цель:** 5 000+ пользователей, $8 000+ MRR, IT Park

### 5.1 Маркетинг
- [ ] Telegram-канал (контент)
- [ ] YouTube: "Управление бизнесом с AI" (на узбекском)
- [ ] Ретаргетинг для клиентов SQB
- [ ] Реферальная программа (invite → 1 месяц Pro бесплатно)

### 5.2 IT Park
- [ ] Заявка на резидентство IT Park
- [ ] Программа Digital Startups (налоговые льготы 12%)

### 5.3 Расширение функционала
- [ ] Интеграция my.soliq.uz
- [ ] ЭСФ (Электронный счёт-фактура)
- [ ] Импорт банковских выписок
- [ ] API-доступ (тариф «Компания»)

### 5.4 Региональная экспансия
- [ ] Исследование рынков Казахстана и Кыргызстана
- [ ] Исследование японского рынка (локализация `ja` уже есть)

---

## МАТРИЦА БЭКЛОГА

| ID | Задача | Фаза | Усилие | Статус |
|---|---|---|---|---|
| B-018 | Contact requests (форма + admin CRM) | Phase 1.5 | M | DONE |
| B-019 | Company registration flow | Phase 1.5 | L | DONE |
| B-020 | Employee onboarding | Phase 1.5 | L | DONE |
| B-021 | Login page UX (статусные сообщения) | Phase 1.5 | S | DONE |
| B-022 | Forgot/Reset password pages | Phase 1.5 | S | DONE |
| B-023 | Обновление системы ролей | Phase 1.5 | M | DONE |
| B-024 | Admin company management | Phase 1.5 | M | DONE |
| B-025 | Employee management UI | Phase 1.5 | M | DONE |
| B-026 | Email-шаблоны (7 штук) | Phase 1.5 | S | DONE |
| B-027 | In-app уведомления для HR | Phase 1.5 | S | DONE |
| B-028 | /admin/health — мониторинг системы | Phase 1.5 | M | DONE |
| B-029 | Admin AI chat (базовый) | Phase 1.5 | M | DONE |
| B-030 | Admin AI Агенты (KB, Support, Analytics, Health) | Phase 4 | L | TODO |
| B-001 | Unit tests (Vitest) | Phase 2 | M | Частично (89 успешно) |
| B-002 | E2E tests (Playwright) | Phase 4 | L | TODO |
| B-003 | Async AI job pattern | Phase 3 | M | TODO |
| B-004 | Rate limiting (sliding window) | Phase 3 | M | Частично |
| B-005 | Оптимизация БД (deleted_at + индексы) | Phase 0 | S | DONE |
| B-006 | Триггеры audit log | Phase 0 | M | DONE |
| B-007 | Защита от prompt injection | Phase 1 | M | DONE |
| B-008 | Дашборд стоимости AI | Phase 1 | S | DONE |
| B-009 | PWA реализация | Phase 5 | L | Частично (manifest + offline shell) |
| B-010 | Биллинг на основе использования | Phase 3 | L | Частично |
| B-011 | Middleware структурированного логирования | Phase 0 | S | DONE |
| B-012 | Health check (расширенный) | Phase 2 | S | Частично |
| B-013 | Авто-генерация OpenAPI | Phase 2 | M | DONE |
| B-014 | Семантический поиск (RAG) | Phase 1 | S | DONE |
| B-015 | Multi-turn память AI | Phase 4 | M | TODO |
| B-016 | GDPR / экспорт данных | Phase 4 | M | TODO |
| B-017 | Idempotency вебхуков Resend | Phase 3 | S | TODO |

**Усилие:** S=1-3 дня · M=1 неделя · L=2 недели

---

## МЕТРИКИ УСПЕХА

| Метрика | Phase 1 | Phase 3 | Phase 5 |
|---|---|---|---|
| Всего пользователей | 50 | 500 | 5 000 |
| Платных пользователей | 0 | 50 | 2 000 |
| MRR | $0 | $200 | $8 000 |
| Точность AI | 90% | 93% | 95%+ |
| Время ответа (Haiku) | <5с | <3с | <2с |
| Шаблонов документов | 0 | 15 | 30+ |
| Статей KB | 50 | 200 | 500+ |

---

## CHANGELOG

| Дата | Версия | Изменение |
|---|---|---|
| 2026-07-24 | v3.2 | 15 шаблонов документов завершены на четырёх языках; исправлены контраст темы и общий слой локализации. |
| 2026-07-24 | v3.1 | Подтверждены завершение Phase 1.5 и старт Phase 2; бэклог синхронизирован с кодом и DEVLOG. |
| 2026-05-06 | v3.0 | Добавлен Phase 1.5 (Company Auth). Бэклог B-018..B-030. |
| 2026-04-30 | v2.1 | 17 стратегических требований распределены по фазам (B-001..B-017) |
| 2026-04-16 | v2.0 | Конкурентный анализ SQB + ускорение Telegram MVP |

---

*PLAN.md — AI Business Concierge v3.1 · 2026-07-24*
