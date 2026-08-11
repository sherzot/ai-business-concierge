# AI Business Concierge – Требования

Данный документ определяет требования к проекту и направления развития. Обращайтесь к этому документу при добавлении новых функций.

> Обновлено 2026-08-11. Текущий snapshot: [STATUS.md](STATUS.md). Статусы: Done, Partial, Skeleton, Planned.

---

## 1. Текущий статус (MVP)

### 1.1 Авторизация и роли
- [x] Supabase Auth (email/password)
- [x] Мультитенантность: `tenants`, `user_tenants`
- [x] Роли: super_admin, sub_admin, company_admin, leader, hr, accounting/accountant, department_head/manager, employee
- [x] Ролевой доступ: `canAccess(module)`
- [x] Переключатель тенантов

### 1.2 Модули
- [x] Reports – KPI, health score, daily report
- [x] Inbox – единый inbox (email/telegram)
- [x] Tasks – board/list, CRUD
- [x] HR – кейсы, опросы
- [x] Docs – список, поиск, индекс
- [x] Integrations – Telegram, Email, AmoCRM
- [x] AI Concierge – чат, инструменты
- [x] Settings – профиль, язык

### 1.3 Технический стек
- Frontend: React + Vite + TypeScript
- Backend: Supabase Edge Function (Hono)
- DB: Supabase Postgres
- Деплой: Netlify + Supabase

---

## 2. Будущие требования (по приоритету)

### 2.1 Высокий приоритет
| ID | Требование | Описание | Модуль |
|----|------------|----------|--------|
| R-001 | Интеграция реального inbox | Email (Resend) webhook – частично ✅ | Inbox |
| R-002 | Обновления в реальном времени | Supabase Realtime – inbox, tasks ✅ | Inbox, Tasks |
| R-015 | Уведомления о назначении задач | Уведомление ответственному при назначении, подтверждение, прозрачность статусов ✅ | Tasks |
| R-016 | HR Candidate Analysis | Skeleton; остаются GitHub/CV/LLM business logic и тесты | HR |
| R-017 | AI rate limiting | Partial; DB-backed AI limit есть, unified plan/endpoint policy остаётся | Backend |
| R-018 | AI cost tracking | Partial; logging есть, tenant dashboard/enforcement остаётся | Backend |
| R-019 | Vector Search (RAG) | Partial; vector/embedding основа есть, explicit tool/citations остаются | Docs |
| R-020 | Admin Dashboard | Partial; core pages есть, billing/advanced agents остаются | Admin |
| R-021 | AI Документовед binary output | Staging verified / production pending; real PDF/DOCX, embedded Noto Sans JP, private Storage, immutable UUID-versioned paths, 65s active-download lease, export/document row-version CAS, DB-first compensation/delete, restrictive RLS и 60s signed URL green | Docs |
| R-003 | Биллинг/Платежи | Подписка, планы, история платежей | Новый |
| R-004 | Просмотр журнала аудита | Admin audit log страница и backend endpoint ✅ | Settings |
| R-005 | Экспорт/Импорт | Excel, CSV экспорт; массовый импорт | Reports, Tasks |

### 2.2 Средний приоритет
| ID | Требование | Описание | Модуль |
|----|------------|----------|--------|
| R-006 | Push/уведомления | Push-уведомления браузера, email-уведомления | Всё |
| R-007 | Мобильные устройства | Partial PWA shell; deep offline sync/push остаются | Всё |
| R-008 | Расширение многоязычности | Done: uz, ru, en, ja | Settings |
| R-009 | Кастомный брендинг | Логотип, цвета по тенанту | Settings |
| R-010 | Rate limiting API | Partial: AI protection есть; unified API policy остаётся | Backend |

### 2.3 Низкий приоритет
| ID | Требование | Описание | Модуль |
|----|------------|----------|--------|
| R-011 | SSO / OAuth | Вход через Google, Microsoft | Auth |
| R-012 | 2FA | Двухфакторная аутентификация | Auth |
| R-013 | Расширенная аналитика | Кастомные отчёты, графики | Reports |
| R-014 | Исходящие вебхуки | Отправка событий во внешние системы | Integrations |

---

## 3. Правила добавления требований

При добавлении нового требования:
1. **ID** – в формате `R-XXX` (следующий номер)
2. **Описание** – краткое, чёткое
3. **Модуль** – к какому модулю относится
4. **Приоритет** – высокий / средний / низкий
5. **Зависимости** – зависимость от других требований

---

## 4. Архитектурные принципы

- **Feature-based** – каждый модуль в собственной папке `features/`
- **API-first** – сначала endpoint'ы бэкенда, затем фронтенд
- **Ролевой доступ** – каждый модуль проверяет `canAccess`
- **Изоляция тенантов** – все данные разделены через `tenant_id`
