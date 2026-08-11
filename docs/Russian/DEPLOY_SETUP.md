# AI Business Concierge – Руководство по push и deploy

Данный документ содержит пошаговые инструкции по push и deploy проекта на GitHub, Supabase и Netlify.

---

## 1. Предварительные требования

- **Node.js** 18+ (рекомендуется 20)
- **Git** – система контроля версий
- **Supabase CLI** – `npm i -g supabase` или `brew install supabase/tap/supabase`
- Аккаунт **GitHub**
- Аккаунт **Supabase** – [supabase.com](https://supabase.com)
- Аккаунт **Netlify** – [netlify.com](https://netlify.com)

---

## 2. Клонирование проекта и установка зависимостей

```bash
# Клонирование проекта
git clone git@github.com:sherzot/ai-business-concierge.git
cd ai-business-concierge

# Зависимости фронтенда
cd frontend && npm install && cd ..
```

---

## 3. Вход в GitHub и push

### 3.1 Вход в GitHub

1. Перейдите на [github.com](https://github.com)
2. Войдите в свой аккаунт
3. Подключитесь к репозиторию через SSH или HTTPS:
   - SSH: `git@github.com:sherzot/ai-business-concierge.git`
   - HTTPS: `https://github.com/sherzot/ai-business-concierge.git`

### 3.2 Push изменений

```bash
git status
git add .
git commit -m "Подготовка деплоя: .env.example, DEPLOY_SETUP.md"
git push origin main
```

---

## 4. Настройка Supabase

### 4.1 Вход в Supabase

1. Перейдите на [supabase.com/dashboard](https://supabase.com/dashboard)
2. Войдите или создайте новый проект

### 4.2 Создание или подключение к существующему проекту

**Существующий проект:**
- Project ID: `ufhepwdkjqptjvxrmpjn`
- Dashboard: `https://supabase.com/dashboard/project/ufhepwdkjqptjvxrmpjn`

### 4.3 Подключение через Supabase CLI

```bash
supabase login
supabase link --project-ref ufhepwdkjqptjvxrmpjn
```

### 4.4 База данных (схема и миграции)

```bash
supabase db push
# или
supabase migration up
```

### 4.5 Деплой Edge Function

```bash
supabase functions deploy bright-api
```

### 4.6 Секреты Edge Function

| Название секрета | Значение | Обязательно |
|-----------------|----------|-------------|
| `SUPABASE_URL` | `https://ufhepwdkjqptjvxrmpjn.supabase.co` | Да |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role | Да |
| `OPENAI_API_KEY` | OpenAI API ключ | Да (для AI) |
| `RESEND_WEBHOOK_SECRET` | Signing secret вебхука Resend | Нет |

### 4.7 Демо-пользователи

Создайте аккаунты из [DEMO_USERS.md](DEMO_USERS.md) и добавьте их в `user_tenants`.

---

## 5. Настройка Netlify

### 5.1 Вход в Netlify

1. Перейдите на [app.netlify.com](https://app.netlify.com)
2. Войдите через GitHub

### 5.2 Новый сайт – импорт с GitHub

1. **Add new site** → **Import an existing project**
2. Выберите **GitHub**
3. Репозиторий: `sherzot/ai-business-concierge`
4. **Build settings:**
   - Base directory: `frontend`
   - Build command: `npm run validate:deploy-env && npm run build`
   - Publish directory: `dist`

### 5.3 Переменные окружения

| Netlify context | `VITE_SUPABASE_PROJECT_ID` | `VITE_SUPABASE_PUBLISHABLE_KEY` | Scope |
|---|---|---|---|
| `production` | production ref `ufhepwdkjqptjvxrmpjn` | production `sb_publishable_...` | All (Personal plan) |
| `deploy-preview` | ref отдельного staging project | staging `sb_publishable_...` | All (Personal plan) |
| `branch-deploy` | ref отдельного staging project | staging `sb_publishable_...` | All (Personal plan) |
| `dev` | ref отдельного staging project | staging `sb_publishable_...` | All (Personal plan) |

С префиксом `VITE_` допустим только publishable key. `sb_secret_...` и `service_role` запрещены во frontend environment. В Netlify Personal нет granular build-only scope, поэтому только browser-public project ref/publishable key используют `All` scope; изоляция обеспечивается разделением contexts.

`VITE_SUPABASE_URL` и `VITE_API_BASE_URL` необязательны и выводятся из project ref. Если они остаются в Netlify, они должны совпадать с выбранным project в каждом context. Не назначайте production values контексту `All`. Build guard блокирует смешение production/non-production.

### 5.4 Требования к staging Supabase

- В Supabase Free нет Branching; previews используют отдельный staging project.
- Все migrations применяются по порядку, а `bright-api` отдельно deploy'ится в staging.
- Edge Function secrets staging отделены от production. Реальные production data не копируются; используются только synthetic fixtures/seeds.
- Handoff previews не завершён, пока Auth redirects staging и CORS/CSP не прошли smoke tests в Netlify contexts.

### 5.5 Деплой

- Нажатие кнопки **Deploy** или push в ветку `main` запускает автоматический деплой

---

## 6. Краткий чеклист

| # | Шаг | Статус |
|---|-----|--------|
| 1 | `cd frontend && npm install` | ✅ |
| 2 | Вход в GitHub, `git push origin main` | Вы делаете |
| 3 | Supabase Dashboard – schema.sql, миграции | Вы делаете |
| 4 | `supabase login` и `supabase link` | Вы делаете |
| 5 | `supabase functions deploy bright-api` | Вы делаете |
| 6 | Supabase → bright-api → Добавить секреты | Вы делаете |
| 7 | Netlify – Импорт репозитория GitHub | Вы делаете |
| 8 | Netlify → Переменные окружения | Вы делаете |
| 9 | Деплой | Автоматически или вручную |

---

## 7. Быстрые проверки

### Локальная сборка

```bash
cd frontend
npm run build
```

### Supabase Edge Function

```bash
curl "https://ufhepwdkjqptjvxrmpjn.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1/health"
```

Ответ вида `{"data":{"ok":true},...}` означает, что Edge Function работает.

---

## 8. Дополнительная документация

- [R001_EMAIL_SETUP.md](R001_EMAIL_SETUP.md) – Resend email inbox
- [R002_REALTIME_SETUP.md](R002_REALTIME_SETUP.md) – Supabase Realtime
- [R015_TASK_NOTIFICATIONS.md](R015_TASK_NOTIFICATIONS.md) – Уведомления о задачах
- [DEMO_USERS.md](DEMO_USERS.md) – Демо-аккаунты
