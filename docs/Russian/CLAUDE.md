# CLAUDE.md — AI Business Concierge

> Контекст проекта и правила для Claude Code
> Читайте этот файл в начале каждой сессии
> Версия: 2.0 | Обновлено: 2026-04-16

---

## О ПРОЕКТЕ

AI Business Concierge — AI-помощник для **ежедневного операционного управления** малым бизнесом, **уже работающим** в Узбекистане.

**Ключевое позиционирование:** Банковские AI-решения (SQB и другие) помогают НАЧАТЬ бизнес. Мы помогаем его ВЕСТИ — 365 дней, каждый день.

**3 модуля:**
1. **AI Советник** — вопросы по налогам/бизнесу/кадрам (Knowledge Base + Claude)
2. **AI Документовед** — генерация договоров/заявлений/приказов (PDF/DOCX)
3. **AI Продавец** — создание и управление Telegram-ботом продаж

**Платформы:** Telegram-бот (70% трафика, основной) + Веб-дашборд (25%) + Админ-панель (5%)

---

## ТЕХНИЧЕСКИЙ СТЕК

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Radix UI
- **Backend:** Supabase Edge Functions (Deno) + Hono framework
- **База данных:** Supabase PostgreSQL + pgvector (knowledge base)
- **Авторизация:** Supabase Auth (мультитенант)
- **AI:** Claude Haiku 3.5 (простые, 80%) + Claude Sonnet 4 (сложные, 20%)
- **Telegram:** grammY framework (Deno)
- **Платежи:** Click API + Payme API
- **Документы:** pdf-lib (PDF) + docx (DOCX)
- **Хостинг:** Netlify (frontend) + Supabase (backend)
- **Мониторинг:** Sentry

---

## АРХИТЕКТУРА (с 2026-05-05)

> Полные правила и паттерны: `docs/ARCHITECTURE.md`

**Frontend — Feature Slice + Clean Architecture:**
```
features/{domain}/
  types.ts          ← Полная сущность + value objects
  api/*.ts          ← Типизировано (no 'any')
  hooks/use{D}.ts   ← Всё состояние + логика (ViewModel)
  components/       ← Чистый UI (dumb)
  pages/*Page.tsx   ← Thin: только hook + render (макс. ~100 строк)
  __tests__/        ← Минимум 3 теста
```

**Backend — Layered Hono:**
```
server/
  middleware/auth.ts, tenant.ts
  presentation/routes/            ← Thin handlers (макс. 20 строк)
  application/services/{domain}/  ← hr-candidate ЭТАЛОН
  domain/types.ts
```

**Стек для unit-тестов:** Vitest + @testing-library/react + @testing-library/jest-dom

---

## АРХИТЕКТУРА РОЛЕЙ

```
СИСТЕМНЫЙ УРОВЕНЬ:
  super_admin ≡ sub_admin  (одинаковые права)

УРОВЕНЬ КОМПАНИИ (внутри тенанта):
  company_admin  → полный контроль над своей компанией
  hr             → создание аккаунтов сотрудников + подтверждение
  accountant     → финансы + налоговые документы
  manager        → задачи и результаты своего отдела
  employee       → ограниченный доступ
```

---

## ВАЖНЫЕ ПРАВИЛА

### Общие
1. **TypeScript strict mode** — `strict: true` всегда
2. **Zod** — валидация всего API input/output
3. **RLS** — Row Level Security ОБЯЗАТЕЛЬНА для каждой новой таблицы
4. **Языки** — все UI-строки через i18n (uz, ru, en, ja)
5. **Не ломай существующий код** — при добавлении новых фич существующая функциональность продолжает работать

### Правила AI
1. **Предотвращение галлюцинаций** — AI использует только данные из knowledge base
2. **Уверенность (Confidence scoring)** — уровень уверенности в каждом AI-ответе
3. **Дисклеймер** — "Это AI-консультация, она не заменяет профессиональную"

### Логика LLM Router
- **simple** → Claude Haiku 3.5, 500 токенов
- **document** → Claude Sonnet 4, 2000 токенов
- **analysis** → Claude Sonnet 4, 1500 токенов
- **default** → Claude Haiku 3.5, 800 токенов

---

## ПРАВИЛА КОММИТОВ

```
type(scope): description
```
Scope: `telegram`, `ai`, `docs`, `sales-bot`, `billing`, `admin`, `auth`, `ui`, `db`, `api`

---

## ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ

### Frontend (.env)
```
VITE_SUPABASE_PROJECT_ID=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_API_BASE_URL=
VITE_SENTRY_DSN=
VITE_APP_URL=
```

### Backend (Supabase secrets)
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
TELEGRAM_BOT_TOKEN=
CLICK_MERCHANT_ID=
PAYME_MERCHANT_ID=
RESEND_API_KEY=
OPENAI_API_KEY=
```

---

## ОБЯЗАТЕЛЬНЫЙ SESSION LIFECYCLE

Перед изменением кода или документации в каждой сессии:

1. Прочитать `docs/README.md`.
2. Полностью прочитать `docs/STATUS.md`.
3. Прочитать последнюю верхнюю запись `docs/DEVLOG.md`.
4. Определить активную задачу scope в `docs/PLAN.md`.
5. Выполнить `git status --short` и сохранить user changes.

До объявления material change завершённым выполнить DEVLOG protocol и обновить STATUS/PLAN; при изменении capability, phase или architecture синхронизировать соответствующий документ. Полное repo-правило: `AGENTS.md`.

---

## ПРОТОКОЛ DEVLOG (§DEVLOG)

**Правило:** Каждое значимое изменение (новая фича, баг-фикс, миграция, архитектурное решение, ошибка деплоя) ДОЛЖНО быть записано в **4 файла одновременно**:

1. `docs/DEVLOG.md` — основной (узбекский, подробно)
2. `docs/English/DEVLOG.md` — на английском
3. `docs/Russian/DEVLOG.md` — на русском
4. `docs/日本語/DEVLOG.md` — на японском

**Формат:**
```
## YYYY-MM-DD — краткое описание

### Контекст
Какая проблема существовала или что было нужно.

### Сделано
- Список конкретных изменений

### Файлы
- `path/to/file` (новый/изменённый)
```

**Проверка синхронизации:** В конце каждой сессии последняя запись во всех 4 DEVLOG.md должна иметь одинаковую дату. Если есть расхождение — добавьте перевод немедленно.

---

## ПОСТОЯННЫЕ НАПОМИНАНИЯ

- **Migration** — изменения DB только через файлы миграций
- **Test** — новый API endpoint = новый тест
- **i18n** — новая UI-строка = uz + ru + en + ja перевод
- **Mobile** — каждое изменение UI проверяется на мобильных
- **DEVLOG** — каждое значимое изменение записывается во все 4 DEVLOG.md (см. §DEVLOG)
- **Конкуренция** — SQB не конкурент, а воронка. Мы — ежедневные операции, они — стартовая фаза.
