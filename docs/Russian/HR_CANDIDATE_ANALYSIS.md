# HR_CANDIDATE_ANALYSIS.md

> **Статус: PARTIAL IMPLEMENTATION / DESIGN.** Public GitHub/cache, bounded local PDF/DOCX и sanitized raw-CV in-memory seam, request/role/plan policy, PostgreSQL quota/finally-release, bounded multipart, atomic usage accounting, minimized prompts, injectable Haiku/Sonnet provider stages со strict output/account-before-validation, deterministic merge/scoring/report, provider-stage orchestrator и frontend real/tested. Остаются server key/accounting composition, live smoke и full HTTP wiring; canonical endpoint возвращает `501 NOT_IMPLEMENTED`. Текущее состояние: [STATUS.md](STATUS.md).

> **AI Business Concierge — Пакет проектирования модуля `hr_candidate_analysis`**
> Версия: 1.0 (MVP дизайн) · Дата: 2026-04-29
> Владелец: Sher · Расположение модуля: `features/hr/candidates/` (подмодуль)

---

## 0. О данном документе

Данный документ является **MVP-спецификацией** модуля `hr_candidate_analysis`. Охватывает архитектуру, структуру папок, API-контракт, JSON-схему, план реализации бэкенда, стратегию масштабирования и дорожную карту v2. Без производственного кода — реализация будет делегирована четырём специализированным инженерным агентам в следующей сессии.

---

## 1. Цель модуля

HR-менеджер отправляет GitHub-имя пользователя (или URL), резюме (PDF/DOCX) и опциональное описание вакансии. Система запускает четыре анализатора параллельно, оценивает кандидата по шести измерениям и возвращает структурированный JSON-отчёт с сильными сторонами, слабыми сторонами, флагами несоответствий, AI-резюме, адаптированными вопросами для интервью и рекомендацией по найму. **Только в рамках сессии** — без сохранения данных в MVP.

**Вне области (MVP):**
- GitHub OAuth / доступ к приватным репозиториям
- Парсинг LinkedIn
- Интеграция с ATS / календарём
- Постоянная база данных кандидатов
- Массовая пакетная обработка (>1 кандидата за запрос)
- Анализ видео- / аудиоинтервью

---

## 2. Архитектура

### 2.1 Высокоуровневый поток

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend — features/hr/candidates/                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ CandidateUploadForm                                      │   │
│  │   • Поле ввода GitHub-имени/URL                         │   │
│  │   • Выбор файла резюме (PDF/DOCX, ≤ 5 МБ)               │   │
│  │   • Необязательное текстовое поле описания вакансии     │   │
│  │   • Выбор локали (uz / ja / en)                          │   │
│  └────────────────────────┬─────────────────────────────────┘   │
└───────────────────────────┼─────────────────────────────────────┘
                            │ POST multipart/form-data
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend — supabase/functions/server                            │
│  routes/hr-candidate.ts → POST /v1/hr/candidates/analyze        │
│                            ↓                                    │
│  services/hr-candidate/index.ts  (Оркестратор)                  │
│  ┌────────────┬────────────┬───────────────┬────────────────┐   │
│  │ github-    │ cv-parser  │ candidate-    │ report-        │   │
│  │ analyzer   │            │ scorer        │ generator      │   │
│  │ (REST API) │ (PDF/DOCX) │ (Claude       │ (Claude        │   │
│  │            │            │  Sonnet 4)    │  Sonnet 4)     │   │
│  └────────────┴────────────┴───────────────┴────────────────┘   │
│        │            │             │                  │          │
│        └─Promise.all┘             └─sequential──────┘           │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
                      JSON-ответ
                  (CandidateAnalysisResult)
```

### 2.2 Компоненты

| Компонент | Ответственность | Технология |
|---|---|---|
| **github_analyzer** | Публичный профиль → статистика репозиториев, стек, активность, сигналы README/CI/тесты | `fetch` → GitHub REST v3 |
| **cv_parser** | PDF/DOCX → структурированный текст → годы опыта, роли, стек, образование | `pdfjs-dist`, `docx`, Claude Haiku |
| **candidate_scorer** | Сигналы GitHub + резюме → оценка 0–100 по 6 категориям | Claude Sonnet 4 (структурированный вывод) |
| **report_generator** | Оценки + сигналы → нарративное резюме + вопросы для интервью + рекомендация | Claude Sonnet 4, с поддержкой локалей |
| **orchestrator** | Параллельное/последовательное выполнение инструментов, таймаут, обработка частичных сбоев | Promise.all + AbortController |

### 2.3 Поток данных

```
1. Валидация входных данных (Zod)
2. Параллельная загрузка (макс. 10 с, AbortController):
     ├── github_analyzer.fetch(username)
     └── cv_parser.parse(file)
3. Сбор сырых сигналов → CandidateRawSignals
4. candidate_scorer.score(signals, jobDescription?, locale)
   → CategoryScores + inconsistency_flags
5. report_generator.generate(signals, scores, locale)
   → AI-резюме + interview_questions + hiring_recommendation
6. Формирование CandidateAnalysisResult → возврат JSON
7. (Без сохранения) — request_id возвращается для логирования
```

### 2.4 SLA и стратегия таймаутов

| Этап | Цель | Жёсткий таймаут | Fallback |
|---|---|---|---|
| Загрузка GitHub | < 4 с | 6 с | Продолжить, `github_status: "partial"` |
| Парсинг резюме | < 3 с | 5 с | Вернуть ошибку, скоринг невозможен |
| Скоринг (Sonnet) | < 8 с | 12 с | 3 попытки, затем `degraded: true` |
| Отчёт (Sonnet) | < 10 с | 14 с | Вернуть оценки, `report_status: "failed"` |
| **Итого** | **< 25 с** | **30 с (общий)** | 504 + `request_id` |

---

## 3. Структура папок

### 3.1 Бэкенд

```
supabase/functions/server/
├── index.ts                              # существующий — подключить новый маршрут
├── routes/
│   └── hr-candidate.ts                   # НОВЫЙ — POST /v1/hr/candidates/analyze
└── services/
    └── hr-candidate/                     # НОВАЯ подпапка
        ├── index.ts                      # Оркестратор
        ├── github-analyzer.ts            # Инструмент 1
        ├── cv-parser.ts                  # Инструмент 2
        ├── candidate-scorer.ts           # Инструмент 3
        ├── report-generator.ts           # Инструмент 4
        ├── types.ts                      # Общие TS-типы
        ├── prompts.ts                    # Системные промпты Sonnet (uz/ja/en)
        ├── schemas/
        │   └── candidate-analysis.schema.json
        └── __tests__/
            ├── github-analyzer.test.ts
            ├── cv-parser.test.ts
            └── candidate-scorer.test.ts
```

### 3.2 Фронтенд

```
frontend/src/features/hr/
└── candidates/                           # НОВЫЙ подмодуль
    ├── api/
    │   └── candidatesApi.ts              # POST /v1/hr/candidates/analyze
    ├── components/
    │   ├── CandidateUploadForm.tsx       # Главная форма
    │   ├── CandidateScoreCard.tsx        # Шкалы оценок по 6 категориям
    │   ├── CandidateSummaryCard.tsx      # AI-резюме + рекомендация
    │   ├── InconsistencyAlert.tsx        # Флаг несоответствия резюме ↔ GitHub
    │   ├── InterviewQuestionsList.tsx    # Вопросы для интервью
    │   └── GithubProfileBlock.tsx        # Сырые сигналы GitHub
    ├── hooks/
    │   ├── useCandidateAnalysis.ts       # React Query mutation
    │   └── useCandidateLocale.ts         # Переключатель uz/ja/en
    ├── pages/
    │   └── CandidateAnalysisPage.tsx     # /hr/candidates
    ├── types.ts                          # Зеркало схемы
    └── i18n/
        ├── uz.json
        ├── ja.json
        └── en.json
```

---

## 4. API-контракт

### 4.1 Эндпоинт

```
POST /v1/hr/candidates/analyze
Content-Type: multipart/form-data
Authorization: Bearer <jwt>
X-Tenant-Id: <tenant_uuid>
Accept-Language: uz | ja | en   (по умолчанию: uz)
```

### 4.2 Тело запроса (multipart)

| Поле | Тип | Обязательное | Ограничения |
|---|---|---|---|
| `github_input` | string | да | имя пользователя (`octocat`) или URL (`https://github.com/octocat`) |
| `cv_file` | file | да | PDF или DOCX, ≤ 5 МБ |
| `job_description` | string | нет | ≤ 5 000 символов (обычный текст) |
| `locale` | string | нет | `uz` \| `ja` \| `en`, по умолчанию `uz` |
| `analysis_depth` | string | нет | `fast` (скоринг Haiku) \| `deep` (скоринг Sonnet), по умолчанию `deep` |

### 4.3 Успешный ответ — `200 OK`

```json
{
  "request_id": "01JS9XK4ZE3R5NQ2H7P8M6V1WQ",
  "status": "ok",
  "duration_ms": 18432,
  "locale": "en",
  "result": {
    "overall_score": 78,
    "grade": "B+",
    "category_scores": {
      "tech_depth": 82,
      "project_quality": 74,
      "activity": 70,
      "communication_docs": 68,
      "cv_github_consistency": 90,
      "role_fit": 76
    },
    "strengths": ["..."],
    "weaknesses": ["..."],
    "inconsistency_flags": [],
    "summary": "Кандидат имеет 4 года опыта в бэкенд-разработке...",
    "interview_questions": [
      {
        "category": "tech_depth",
        "question": "Как вы решили проблему конкурентности в репозитории X?",
        "expected_signal": "..."
      }
    ],
    "hiring_recommendation": {
      "decision": "interview",
      "confidence": 0.78,
      "rationale": "..."
    },
    "raw_signals": { "github": {}, "cv": {} }
  }
}
```

### 4.4 Ответы с ошибками

| Статус | Код | Причина |
|---|---|---|
| 400 | `INVALID_GITHUB_INPUT` | Некорректный username/URL |
| 400 | `CV_PARSE_FAILED` | Не удалось прочитать PDF/DOCX |
| 400 | `CV_TOO_LARGE` | > 5 МБ |
| 400 | `UNSUPPORTED_FILE_TYPE` | Не PDF и не DOCX |
| 401 | `UNAUTHENTICATED` | JWT отсутствует или недействителен |
| 403 | `FORBIDDEN_ROLE` | Роль пользователя не HR/Менеджер/Администратор |
| 404 | `GITHUB_USER_NOT_FOUND` | Пользователь GitHub не существует |
| 429 | `RATE_LIMITED` | Достигнут лимит тарифного плана |
| 504 | `TIMEOUT` | Превышен общий жёсткий таймаут 30 с |

---

## 5. JSON-схема

### 5.1 `CandidateAnalysisPayload`

```jsonc
{
  "overall_score": 0-100,
  "grade": "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F",
  "category_scores": {
    "tech_depth": 0-100,
    "project_quality": 0-100,
    "activity": 0-100,
    "communication_docs": 0-100,
    "cv_github_consistency": 0-100,
    "role_fit": 0-100
  },
  "strengths": ["string"],           // макс. 8
  "weaknesses": ["string"],          // макс. 8
  "inconsistency_flags": [
    {
      "type": "stack_mismatch" | "experience_gap" | "title_inflation" | "education_unverified" | "other",
      "severity": "low" | "medium" | "high",
      "explanation": "string"
    }
  ],
  "summary": "string",               // макс. 1500 символов
  "interview_questions": [           // 5-12 элементов
    {
      "category": "tech_depth" | "project_quality" | "activity" | "communication_docs" | "consistency" | "role_fit" | "behavioral",
      "question": "string",
      "expected_signal": "string"
    }
  ],
  "hiring_recommendation": {
    "decision": "strong_hire" | "interview" | "borderline" | "do_not_proceed",
    "confidence": 0.0-1.0,
    "rationale": "string"
  }
}
```

---

## 6. План реализации бэкенда

### 6.1 Инструмент 1 — `github_analyzer.ts`

```
Вход:  { input: string }     // имя пользователя или URL
Выход: RawSignals.github

Шаги:
  1. Нормализация входных данных → имя пользователя (regex)
  2. fetch /users/:username → основной профиль
  3. fetch /users/:username/repos?per_page=100 → repos[]
  4. Вычисление агрегатов: primary_languages, total_stars, repo_signals, fork ratio
  5. Закреплённые репозитории: GraphQL или топ-6 по звёздам (REST fallback)
  6. Качественная оценка закреплённого репозитория:
        +20 README, +20 тесты, +15 CI, +15 последний коммит < 6 мес.,
        +15 звёзды > 5, +15 описание > 30 символов
  7. Вернуть { ...signals, fetch_status }

Лимит запросов: GitHub анонимный = 60 запросов/час.
Кэш: TTL 10 мин, ключ = username.
```

### 6.2 Инструмент 2 — `cv-parser.ts`

```
Вход:  { file: Uint8Array, mime: string }
Выход: RawSignals.cv

Шаги:
  1. PDF       → извлечение текста pdfjs-dist
     DOCX      → извлечение текста mammoth.js
     иное      → выброс UNSUPPORTED_FILE_TYPE
  2. Нормализация текста (пробелы, unicode NFKC)
  3. Эвристическое regex-извлечение: диапазоны дат, заголовки разделов
  4. Постобработка Claude Haiku (~500 токенов):
        Вход:  сырой текст
        Выход: структурированный JSON (роли, образование, навыки) — валидация Zod
  5. Вычисление experience_years_total из продолжительности ролей
  6. Вернуть { ...cv, parse_status }

Примечания:
  - Двухколоночные PDF могут давать искажения — флаг parse_status = "partial" если < 200 символов
  - Нелатинские скрипты (кириллица, японский) — pdfjs обрабатывает, проверить UTF-8
```

### 6.3 Инструмент 3 — `candidate-scorer.ts`

> Текущая реализация даёт provider-independent rubric, bounded weighted overall/grade и conservative UZ/JA/EN flags только по complete сопоставимым GitHub evidence. Injectable Sonnet/Haiku stage объединяет model/budget/cache policy, private sanitized-CV seam, minimized prompts, account-before-validation и strict validation; deterministic finalize сохраняет пересчитанные overall/grade и local flags. Остаются server key/accounting composition и live smoke.

```
Модель:  Claude Sonnet 4 (глубокий) или Haiku (быстрый)
Режим:   Структурированный вывод (JSON mode)

Рубрика оценки:
  tech_depth:           +30 совпадение языков, +25 качество закреплённых, +20 звёзды/репо, +15 мультиязычность, +10 современный стек
  project_quality:      +35 README%, +30 тесты%, +20 CI%, +15 распределение звёзд
  activity:             +40 активные месяцы, +30 коммиты/год, +30 возраст аккаунта
  communication_docs:   +50 качество README, +30 сообщения коммитов, +20 описания PR
  cv_github_consistency: +50 пересечение стека, +30 совпадение временных шкал, +20 без инфляции
  role_fit:             Семантическое совпадение Sonnet (требует job_description)

Обнаружение несоответствий:
  stack_mismatch:    В резюме «Senior Go», но Go% в GitHub < 5
  experience_gap:    В резюме 5 лет, но возраст GitHub < 2 года
  title_inflation:   В резюме «Senior», но нет сигналов лидерства
```

### 6.4 Инструмент 4 — `report-generator.ts`

> Текущая реализация даёт bounded UZ/JA/EN evidence-linked strengths/gaps/summary, 6–7 вопросов по всем non-null категориям и behavioral evidence, а также deterministic recommendation. Sonnet narrative refinement остаётся key-dependent слоем.

```
Модель:  Claude Sonnet 4
Режим:   Структурированный JSON-вывод

Вход:  оценки + сигналы + jobDescription? + locale
Выход: { strengths, weaknesses, summary, interview_questions, hiring_recommendation }

Правила вопросов для интервью:
  - 5–12 вопросов
  - Минимум 1 на категорию (6 категорий + поведенческий)
  - Каждый привязан к конкретному репозиторию/записи резюме
  - Без закрытых (да/нет) вопросов

Логика рекомендации по найму:
  overall_score >= 85  → strong_hire
  70 <= score < 85     → interview
  55 <= score < 70     → borderline
  score < 55           → do_not_proceed
  несоответствие высокой серьёзности → понизить на один уровень
```

### 6.5 Бюджет стоимости и задержки (на 1 анализ)

| Этап | Токены вход | Токены выход | Модель | Стоимость (USD) |
|---|---|---|---|---|
| Парсинг резюме Haiku | ~2 000 | ~600 | Haiku 3.5 | $0,0040 |
| Скоринг кандидата (глубокий) | ~3 500 | ~800 | Sonnet 4 | $0,0225 |
| Генерация отчёта | ~3 000 | ~1 500 | Sonnet 4 | $0,0315 |
| **Итого** | | | | **~$0,058** |

---

## 7. Стратегия масштабирования MVP

### 7.1 Основные принципы

1. **Без состояния** — каждый запрос независим
2. **Идемпотентность** — одинаковый GitHub + хеш резюме → попадание в кэш (TTL 10 мин)
3. **Graceful degradation** — если GitHub недоступен, продолжить только с резюме
4. **Без сохранения ПДн** — резюме только в памяти, очищается после парсинга
5. **Модульность** — каждый инструмент в своём файле, тестах, метрике мониторинга

### 7.2 Бюджеты производительности

| Метрика | Цель | Точка действия |
|---|---|---|
| p50 длительность | < 18 с | OK |
| p95 длительность | < 28 с | Алерт |
| Частота ошибок | < 2% | Вызов дежурного |
| Частота GitHub 404 | < 5% | UX-подсказка «Проверьте имя пользователя» |
| Частота сбоев парсинга резюме | < 8% | Улучшить парсер, показать UI ошибки |

### 7.3 Конкурентность и лимиты запросов

| Тарифный план | Конкурентных | В минуту | В день |
|---|---|---|---|
| Бесплатный | 1 | 1 | 2 |
| Предприниматель | 2 | 5 | 20 |
| Бизнес | 5 | 20 | 100 |
| Компания | 10 | 60 | 500 |

Реализация: service-role-only PostgreSQL RPC атомарно резервирует minute/day counters и 45-секундный concurrency lease. Pure lifecycle boundary не запускает operation при denial и освобождает accepted lease через `finally` после success/error; cleanup failure не заменяет исходный outcome, bounded DB expiry очищает orphan lease.

---

## 8. Обработка ошибок

### 8.1 Обработка на уровне инструмента

| Инструмент | Тип ошибки | Fallback |
|---|---|---|
| github_analyzer | 404 | `INVALID_GITHUB_INPUT` |
| github_analyzer | 5xx / таймаут | частичные сигналы, `degraded` |
| cv_parser | повреждённый PDF | `CV_PARSE_FAILED` |
| cv_parser | отсканированный PDF (только изображение) | `CV_PARSE_FAILED` + подсказка |
| candidate_scorer | Claude 5xx | 3x backoff, `INTERNAL` |
| report_generator | Claude 5xx | вернуть оценки, `report_status: "failed"` |

### 8.2 UX фронтенда

- Таймаут 504 → «Анализ занял более 30 секунд. Попробуйте с более коротким резюме или обратитесь в поддержку.»
- Degraded → синий баннер: «Данные GitHub получены частично — результаты могут быть неполными»
- Высокое несоответствие → жёлтый баннер: «Внимание: обнаружены значительные несоответствия»

---

## 9. Дорожная карта V2

| # | Функция | Сложность |
|---|---|---|
| V2.1 | **GitHub OAuth** — приватные репозитории + граф вкладов | M |
| V2.2 | **Постоянное хранение** (таблица `candidates`) | M |
| V2.3 | **Массовый импорт** (CSV с N именами) | L |
| V2.4 | **Парсер LinkedIn** (экспорт PDF) | M |
| V2.5 | **OCR для отсканированных резюме** | L |
| V2.6 | **Интеграция с календарём/ATS** (Google Calendar, Greenhouse) | L |
| V2.7 | **Асинхронная очередь задач** (опрос по job_id) | M |
| V2.8 | **Пользовательская рубрика** (на tenant) | M |
| V2.9 | **Telegram-бот для предварительного отбора** | S |
| V2.10 | **Дашборд аудита предвзятости** | XL |
| V2.11 | **Видеорезюме / асинхронное интервью** | XL |
| V2.12 | **Сравнительное ранжирование** (5+ кандидатов рядом) | M |

Сложность: S (1-3 дня), M (1 неделя), L (2 недели), XL (1 месяц+).

---

## 10. Глоссарий

| UZ | RU | EN | Значение |
|---|---|---|---|
| Nomzod | Кандидат | Candidate | Человек, подавший резюме |
| Skor | Оценка | Score | Число от 0 до 100 |
| Mos kelmaslik | Несоответствие | Inconsistency | Расхождение между резюме и GitHub |
| Yollash tavsiyasi | Рекомендация по найму | Hiring recommendation | strong_hire / interview / borderline / do_not_proceed |
| Stack mosligi | Соответствие стека | Stack consistency | Пересечение навыков резюме ↔ языков GitHub |
| Faollik | Активность | Activity | Коммиты и активные месяцы |

---

## 11. Стратегия тестирования

### 11.1 Юнит-тесты

- `github-analyzer.test.ts` — фикстуры: octocat, torvalds, аккаунт джуниора, удалённый пользователь
- `cv-parser.test.ts` — фикстуры: 5 PDF (чистый, двухколоночный, отсканированный-fail, кириллица, японский), 3 DOCX
- `candidate-scorer.test.ts` — мок Claude, детерминированные входные данные скоринга

### 11.2 Интеграционные тесты

- Полный поток: реальный GitHub (octocat) + образцовое резюме → assert `status === 'ok'`, `overall_score` целое в [0, 100]
- Таймаут: симулировать задержку GitHub 7 с → assert `status === 'degraded'`
- Плохое резюме: повреждённый PDF → assert 400 `CV_PARSE_FAILED`

### 11.3 Приёмочные тесты (ручные)

10 реальных кандидатов → HR их оценивает → корреляция AI-оценок > 0,7

---

## 12. Чеклист реализации (следующая сессия)

### Агент бэкенда
- [ ] Создать папку `services/hr-candidate/`
- [ ] GitHub fetch + настройка кэша
- [ ] Парсер резюме — интеграция pdfjs + mammoth
- [ ] Структурированный вывод Sonnet (через LLM Router)
- [ ] Схемы Zod + синхронизация JSON Schema
- [ ] Юнит- + интеграционные тесты

### Агент фронтенда
- [ ] Скелет `features/hr/candidates/`
- [ ] Форма загрузки + drag-drop + валидация 5 МБ
- [ ] React Query mutation + переключатель локали
- [ ] Компонент шкалы оценок (Radix UI Progress)
- [ ] i18n (uz.json / ja.json / en.json)

### Агент базы данных
- [ ] **Ничего не делать** (MVP — без постоянного хранения)
- [ ] V2.2: подготовить миграцию `candidates`

### Агент инфраструктуры
- [ ] Добавить ключ Anthropic API в секреты Supabase
- [ ] Тег Sentry: `module: hr_candidate`
- [ ] Настройка middleware ограничения запросов

---

## 13. Открытые вопросы

1. **Квота GitHub API** — анонимно 60/час. Нужен ли OAuth для MVP? Решение за Sher.
2. **Японский формат резюме** — 履歴書 (rirekisho) PDF — может потребовать отдельный парсер (много таблиц). Отдельный тикет?
3. **Защита от предвзятости** — данные об имени/возрасте/поле не должны влиять на оценку. Явная защита в промпте?
4. **Хранение** — где хранить резюме позже (V2.2)? Supabase Storage с шифрованием в покое?
5. **Лимит запросов** — бесплатный план: 2/день или 0/день? (Функция HR — только для платных?)

---

*HR_CANDIDATE_ANALYSIS.md v1.0 — Только дизайн, кода ещё нет*
*Следующий шаг: Sher одобряет → сессия реализации с 4 агентами (frontend/backend/db/infra)*
