# FIRST_PUSH.md — Руководство по деплою завершения Phase 0

> **Цель:** Задеплоить файлы Phase 0, созданные 2026-04-29, в GitHub → Supabase → Netlify.
> **Время:** ~30-45 минут (если CLI готов).
> **Аудитория:** Шер (PM/PL) — пошаговое руководство с командами для копирования.

---

## 0. Что пушим сегодня? (Sanity Check)

| # | Файл | Тип | Назначение |
|---|---|---|---|
| 1 | `supabase/migrations/20260429_phase0_rls_complete.sql` | DB migration | Supabase DB |
| 2 | `supabase/functions/server/services/usage-tracking.ts` | Edge Function | Supabase Functions |
| 3 | `supabase/functions/server/services/hr-candidate/*` (8 файлов) | Edge Function | Supabase Functions |
| 4 | `supabase/functions/server/routes/hr-candidate.ts` | Edge Function | Supabase Functions |
| 5 | `supabase/functions/server/index.ts` (обновлён) | Edge Function | Supabase Functions |
| 6 | `supabase/.env.example` | документация | GitHub only |
| 7 | `frontend/.env.example` (обновлён) | документация | GitHub only |
| 8 | `frontend/src/styles/theme-indigo-slate.css` | CSS | Netlify build |
| 9 | `frontend/src/shared/lib/aiFeedbackApi.ts` | TypeScript | Netlify build |
| 10 | `frontend/src/shared/components/AIFeedbackButtons.tsx` | React | Netlify build |
| 11 | `frontend/src/features/hr/candidates/*` (12 файлов) | React | Netlify build |
| 12 | `docs/CONNECTIONS.md`, `docs/HR_CANDIDATE_ANALYSIS.md`, `docs/FIRST_PUSH.md` | документация | GitHub only |

**Проверка безопасности:** Ни в одном файле нет реальных API-ключей — только `*.env.example` плейсхолдеры.

---

## 1. Pre-flight (предварительная проверка)

### 1.1 В локальном терминале — перейдите в папку проекта

```bash
cd ~/Documents/GitHub/Projects/ai-business-concierge
```

### 1.2 Запустите следующее и проверьте состояние:

```bash
# Состояние git — какие файлы новые/изменённые
git status

# Ветка и remote
git branch
git remote -v

# Версия Supabase CLI (v2.75 достаточна, v2.95+ рекомендуется)
supabase --version

# Node + npm
node --version    # должно быть v20+
npm --version
```

**Ожидаемые результаты:**
- `git status` → "modified: supabase/functions/server/index.ts" + 30+ "Untracked files"
- `git remote -v` → показывает `github.com/sherzot/ai-business-concierge.git`
- `supabase --version` → `2.75.0` (или выше)

### 1.3 (Опционально) Обновить Supabase CLI

```bash
# macOS
brew upgrade supabase
# или
brew install supabase/tap/supabase
```

> Примечание: v2.75.0 справляется со всем. Обновление не обязательно, но рекомендуется.

### 1.4 Локальная сборка frontend (тест)

Перед пушем убедитесь, что frontend работает:

```bash
cd frontend
npm install        # если были добавлены новые пакеты
npm run build
cd ..
```

**Ожидаемый результат:** Нет ошибок. Если появляются ошибки TypeScript — исправьте их, не пушьте.

---

## 2. Push на GitHub

### 2.1 Стейджинг новых/изменённых файлов

```bash
# Просмотр всего (аудит)
git status

# Стейджинг всего
git add .

# Ещё раз проверьте — какие файлы войдут в коммит
git status
```

**Обратите внимание:**
- `frontend/.env` (с реальными ключами) НЕ должен попасть в коммит — должен быть в `.gitignore`
- `node_modules/` тоже не должен быть включён

Если `.env` виден:

```bash
git rm --cached frontend/.env
echo "frontend/.env" >> .gitignore
git add .gitignore
```

### 2.2 Коммит

Используем формат `type(scope): description` из правил коммитов CLAUDE.md:

```bash
git commit -m "feat(phase0): завершение — полный RLS, тема Indigo, AI feedback, скелет HR candidates

- db: 20260429_phase0_rls_complete.sql (12 таблиц × 4 RLS policy + 5 индексов)
- backend: services/usage-tracking.ts, services/hr-candidate/* skeleton
- backend: POST /v1/ai/feedback и /v1/hr/candidates/analyze (501 stub)
- frontend: theme-indigo-slate.css, AIFeedbackButtons, hr/candidates UI skeleton
- docs: HR_CANDIDATE_ANALYSIS.md (UZ+JP+EN), CONNECTIONS.md, FIRST_PUSH.md
- infra: .env.example полный (frontend + supabase)"
```

### 2.3 Push

```bash
# Узнать имя ветки
git branch --show-current

# Push (обычно main или master)
git push origin main
```

**Если запрашивается авторизация:**
- HTTPS: имя пользователя GitHub + Personal Access Token (НЕ пароль!)
- SSH: парольная фраза SSH-ключа

**Если push успешен**, перейдите на `https://github.com/sherzot/ai-business-concierge` и увидите новый коммит.

---

## 3. Деплой на Supabase

### 3.1 Логин (если не сделали ранее)

```bash
supabase login
```

Открывается браузер → вход в Supabase → возврат в терминал с сохранённым токеном.

### 3.2 Подключение к проекту

```bash
supabase link --project-ref ufhepwdkjqptjvxrmpjn
```

Если запрашивается `Database password` — возьмите его из Dashboard → Project Settings → Database → "Reset database password".

### 3.3 Push миграций

```bash
supabase db push
```

**Это делает:** Запускает все SQL-файлы из `supabase/migrations/` последовательно. Наш новый `20260429_phase0_rls_complete.sql` пушится здесь.

**Если появляется конфликт** (ошибка "migration already applied"):

```bash
supabase migration list
# Если локальная версия опережает remote — push пройдёт успешно
```

### 3.4 Проверка выполнения миграции

```bash
supabase db remote sql --query "select * from phase0_rls_health;"
```

**Ожидаемый результат:** 12-строчная таблица, в каждой строке:
- `select_policies` ≥ 1
- `insert_policies` ≥ 1
- `update_policies` ≥ 1
- `delete_policies` ≥ 1
- `rls_enabled` = `true`

Если в какой-то строке 0 — RLS не полностью покрыт, проверьте ещё раз.

### 3.5 Деплой Edge Function

```bash
supabase functions deploy server --project-ref ufhepwdkjqptjvxrmpjn
```

```bash
# Чтобы уточнить точное имя функции:
supabase functions list --project-ref ufhepwdkjqptjvxrmpjn
```

### 3.6 Настройка Secrets (самый важный шаг!)

Получите реальные значения для каждой записи в `supabase/.env.example`, затем:

```bash
# Anthropic Claude (ОБЯЗАТЕЛЬНО для Phase 0)
supabase secrets set ANTHROPIC_API_KEY="sk-ant-api03-XXXXXX" --project-ref ufhepwdkjqptjvxrmpjn

# OpenAI embedding (ОБЯЗАТЕЛЬНО для KB)
supabase secrets set OPENAI_API_KEY="sk-proj-XXXXXX" --project-ref ufhepwdkjqptjvxrmpjn

# JWT (если ещё не настроен)
supabase secrets set JWT_SECRET="your-jwt-secret-from-dashboard" --project-ref ufhepwdkjqptjvxrmpjn
```

**Telegram, Click, Payme, Resend** — настраиваются по необходимости (Phase 1+), сейчас можно пропустить.

### 3.7 Проверка Secrets

```bash
supabase secrets list --project-ref ufhepwdkjqptjvxrmpjn
```

Реальные значения никогда не показываются (безопасность), только список. `ANTHROPIC_API_KEY` и `OPENAI_API_KEY` должны присутствовать.

### 3.8 Smoke test Edge Function

```bash
curl "https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1/health"
```

**Ожидается:** `{"data":{"ok":true}}` или `{"status":"ok"}`.

---

## 4. Обновление Netlify

### 4.1 Автоматический деплой

После пуша на GitHub **Netlify собирает автоматически** (если подключён к ветке `main`).

Проверка:
1. https://app.netlify.com → откройте ваш проект
2. Страница **Deploys**
3. Вверху показывается "Deploy in progress" или "Published"

### 4.2 Обновление переменных окружения (если добавлены новые)

| Key | Value | Статус |
|---|---|---|
| `VITE_SUPABASE_PROJECT_ID` | `ufhepwdkjqptjvxrmpjn` | ✅ уже есть |
| `VITE_SUPABASE_ANON_KEY` | Dashboard → Settings → API → anon | ✅ уже есть |
| `VITE_FEATURE_HR_CANDIDATES` | `true` | новое (для отображения скелета) |
| `VITE_SENTRY_DSN` | (Phase 1) | оставьте пустым |
| `VITE_TELEGRAM_BOT_USERNAME` | (Phase 1) | оставьте пустым |

### 4.3 Ручной re-deploy (если переменные обновлены)

```bash
git commit --allow-empty -m "chore: trigger netlify rebuild"
git push
```

### 4.4 Мониторинг лога деплоя

**Deploys** → последняя сборка → откройте **Deploy log**:
- "Build script completed" → ✅
- "Site is live" → ✅

Типичные ошибки:
- `Module not found` → запустите `npm install` локально, запушьте package-lock.json
- `TypeScript error` → исправьте локально с `npm run build`

---

## 5. Финальный smoke test (5 минут)

### 5.1 Backend health

```bash
curl https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1/health
# ожидается: {"status":"ok"}
```

### 5.2 RLS health

```bash
supabase db remote sql --query "select count(*) from phase0_rls_health where insert_policies > 0;"
# ожидается: 12
```

### 5.3 AI chat (с Claude)

Получите JWT из Supabase Auth, затем:

```bash
curl -X POST https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1/ai/chat \
  -H "Authorization: Bearer <USER_JWT>" \
  -H "X-Tenant-Id: <TENANT_ID>" \
  -H "Content-Type: application/json" \
  -d '{"message":"Привет! Кто ты?","locale":"ru"}'
```

**Ожидается:** `llm_provider: "claude"`, `llm_model: "claude-3-5-haiku-..."`, текст ответа.

### 5.4 AI feedback

```bash
curl -X POST https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1/ai/feedback \
  -H "Authorization: Bearer <USER_JWT>" \
  -H "X-Tenant-Id: <TENANT_ID>" \
  -H "Content-Type: application/json" \
  -d '{"message_id":"<from-previous-call>","rating":1}'
```

**Ожидается:** `{"data":{"saved":true}}`.

### 5.5 HR candidate stub

```bash
curl -X POST https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1/hr/candidates/analyze
```

**Ожидается:** ошибка `501 NOT_IMPLEMENTED` — это **правильный** результат (скелет подключён, реализация позже).

---

## 6. Устранение неполадок

### 6.1 `git push` rejected — "non-fast-forward"

На remote есть новые коммиты (запушены из другого места).

```bash
git pull --rebase origin main
git push origin main
```

### 6.2 `supabase db push` — "migration already applied"

```bash
supabase migration repair --status applied <migration_version>
```

### 6.3 Edge Function ошибка 500

```bash
supabase functions logs server --project-ref ufhepwdkjqptjvxrmpjn --tail
```

Самая частая причина — `ANTHROPIC_API_KEY` или `JWT_SECRET` не настроены. Вернитесь к §3.6.

### 6.4 Netlify build "Module not found"

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
git add package-lock.json
git commit -m "chore: refresh package-lock.json"
git push
```

### 6.5 В RLS health видны 0 политик

Миграция не выполнилась. Перезапустите:

```bash
supabase db push
```

---

## 7. Чеклист — завершить сегодня

- [ ] **GitHub:** `git status` чистый, `git push origin main` успешен
- [ ] **Supabase DB:** view `phase0_rls_health` показывает 12 таблиц (каждая с 4 политиками)
- [ ] **Supabase Functions:** `server` задеплоен, `/health` отвечает
- [ ] **Supabase Secrets:** `ANTHROPIC_API_KEY` и `OPENAI_API_KEY` установлены
- [ ] **AI chat smoke test:** Claude отвечает
- [ ] **AI feedback smoke test:** возвращает `{"saved":true}`
- [ ] **Netlify:** Deploy "Published", URL открывается
- [ ] **Тема frontend:** виден акцент indigo

Всё зелёное — **Phase 0 в LIVE!** 🎉

---

## 8. Следующий шаг — Phase 1

`docs/PLAN.md §1` (Telegram MVP) — начинаем в новой сессии:
- grammY framework + bot webhook
- `/start` выбор языка
- AI Советник через Telegram
- 50 бета-пользователей

Отметьте успех Phase 0 ☕️

---

*FIRST_PUSH.md — деплой-путешествие для сегодняшних изменений*
*DEPLOY_SETUP.md (основной документ) также полезен для нюансов R001/R002*
