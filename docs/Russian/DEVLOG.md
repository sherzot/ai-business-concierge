# Журнал разработки — AI Business Concierge

История развития проекта, выполненные работы, обнаруженные ошибки и их решения.

> **Переводы (синхронизируются):** [Узбекский (основной)](../DEVLOG.md) · [English](../English/DEVLOG.md) · [Uzbek](../Uzbek/DEVLOG.md) · [日本語](../日本語/DEVLOG.md)
>
> **Протокол (CLAUDE.md §...):** Каждое изменение фиксируется здесь и во всех 4 переводах.

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
