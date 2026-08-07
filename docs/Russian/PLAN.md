# AI Business Concierge — активный план

> Версия 4.0 · Обновлено 2026-08-07
> Здесь только активные и следующие задачи. Старый master plan: [../archive/Russian/PLAN_LEGACY_2026-07-24.md](../archive/Russian/PLAN_LEGACY_2026-07-24.md).

## P0 — безопасное начало сессии

- [ ] Сохранить user changes и проверить Git/commit baseline.
- [ ] Подтвердить green remote `frontend-security-gate`.
- [ ] Запустить install, type-check, 96+ tests, production audit, build и security check.
- [ ] Проверить production health `200` и protected route без auth `401`.
- [ ] Записать доказательства в DEVLOG и STATUS.

## P1 — завершить Supabase/Netlify security handoff

- [ ] Безопасно перейти на env-контракт `VITE_SUPABASE_PUBLISHABLE_KEY`.
- [ ] Синхронизировать config, env example, Vitest, CI и Netlify names.
- [ ] Ограничить direct browser Supabase только Auth/Realtime и добавить regression gate.
- [ ] Проверить public RLS/grants/RPC и отказ cross-tenant CRUD.
- [ ] Проверить service-role и `SECURITY DEFINER` authorization boundaries.
- [ ] Решить разделение production/preview env и secrets.

## P1 — завершить Phase 2 AI Документолог

- [ ] Добавить LLM-вопросы и polishing.
- [ ] Генерировать реальные PDF/DOCX с Noto Sans.
- [ ] Добавить private Storage, tenant/user paths, RLS, file validation и signed URL.
- [ ] Добавить тесты и 4-language/theme smoke-tests.
- [ ] После стабильного web flow подключить Telegram wizard и отправку файла.

## P2 — operational integrations

- [ ] Проверить/установить `TELEGRAM_WEBHOOK_SECRET`, переподключить webhook и проверить bot flow.
- [ ] E2E проверить Resend receiving, signature, tenant mapping и delivery.
- [ ] Включить Leaked Password Protection и выбрать Netlify preview protection.

## P2 — HR Candidate Analysis

- [ ] Реализовать GitHub analysis/cache и PDF/DOCX parser.
- [ ] Подключить Sonnet structured scoring/reporting через LLM Router.
- [ ] Добавить auth, roles, rate limit, cost log и Zod validation.
- [ ] Завершить frontend, убрать `501` stub и протестировать полный flow.

## Последующие фазы

- Phase 3: AI Sales Bot, Click/Payme, subscriptions, usage billing и idempotency.
- Phase 4: billing/analytics agents, E2E, export/delete, push и performance.

Основной подробный план: [узбекский PLAN](../PLAN.md).
