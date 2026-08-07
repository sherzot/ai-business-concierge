# AI Business Concierge – Дорожная карта

Требования и дорожная карта взаимосвязаны. В `docs/REQUIREMENTS.md` находятся требования, здесь — этапы и планы.

> Обновлено 2026-08-07. Текущий статус: [STATUS.md](STATUS.md). Активные задачи: [PLAN.md](PLAN.md).

---

## Текущая точка работ (snapshot документации 2026-08-07)

- Phase 0, Phase 1 и Phase 1.5 завершены
- Phase 2 активен: landing, 15 шаблонов на четырёх языках и draft pipeline готовы
- Текущая задача: завершить AI Документовед — AI polishing, реальные PDF/DOCX и private Storage
- HR Candidate Analysis остаётся skeleton; endpoint возвращает `501 NOT_IMPLEMENTED`
- Phase 3 billing/payments и Phase 4 advanced Admin AI ещё не начаты

---

## Этап 1: Основа (завершён) ✅

- Авторизация, роли, тенант
- Все основные модули (Reports, Inbox, Tasks, HR, Docs, Integrations)
- AI Concierge
- Settings

---

## Этап 2: AI Документовед + Landing (активен)

| Slice | Статус | ID требования |
|-------|--------|---------------|
| Landing, FAQ, SEO и responsive UI | Done | — |
| 15 шаблонов, четыре языка и draft pipeline | Done | R-021 |
| AI polishing, PDF/DOCX, private Storage и signed URL | Active | R-021 |
| Telegram wizard/отправка документа | Next | R-021 |
| Полная реализация HR Candidate Analysis | После Документоведа | R-016 |

---

## Этап 3: Sales Bot + Монетизация

| Slice | ID требования |
|-------|---------------|
| AI Sales Bot, каталог и заказы | — |
| Click/Payme и subscription lifecycle | R-003 |
| Plan limits, usage billing и grace period | R-018 |
| Resend idempotency и retry queue | R-001 |

---

## Этап 4: Advanced Admin AI + Качество

| Slice | ID требования |
|-------|---------------|
| Billing/MRR/churn и AI cost monitoring | R-020 |
| KB, Support, Analytics и Health agents | R-020 |
| Playwright E2E и расширенные tenant-isolation tests | — |
| Export/delete, SSO/2FA, branding и advanced analytics по приоритету | R-005, R-011–R-013 |

## Этап 5: Scale

- Performance/code splitting и observability.
- Web Push и расширенные PWA/offline flows.
- Региональное расширение и внешние business integrations.

---

## Как использовать

### 1. При добавлении нового требования
1. Добавьте новую строку в `docs/REQUIREMENTS.md` (ID, описание, модуль, приоритет)
2. Добавьте его в соответствующий этап в `docs/ROADMAP.md`
3. Если приоритет изменится – обновите дорожную карту

### 2. При планировании спринта
1. Выберите этап из дорожной карты
2. Возьмите соответствующие ID из Requirements
3. Работайте в порядке Backend → Frontend

### 3. Изменения
- Requirements и Roadmap — только документация
- Основной код находится в `frontend/` и `supabase/`
- При появлении нового требования – сначала запишите его в Requirements, затем переходите к коду

---

## Журнал изменений

| Дата | Изменение |
|------|-----------|
| 2026-08-07 | Разделены готовые и оставшиеся работы Phase 2; уточнены Candidate skeleton и active plan |
| 2026-07-24 | Завершение Phase 1.5 и стартовая точка Phase 2 синхронизированы с кодом и DEVLOG |
| 2026-02-05 | Начальная дорожная карта, Этап 1 завершён |
