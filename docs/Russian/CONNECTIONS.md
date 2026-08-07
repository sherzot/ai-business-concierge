# CONNECTIONS.md — Внешние сервисы и интеграции

> AI Business Concierge — руководство по настройке всех внешних соединений
> Версия: 1.1 · Обновлено: 2026-07-24 (production audit)
> Владелец: Sher (PM/PL)

---

## Содержание

1. [Матрица статусов](#1-матрица-статусов)
2. [Supabase](#2-supabase)
3. [Anthropic Claude](#3-anthropic-claude)
4. [OpenAI](#4-openai)
5. [Telegram bot](#5-telegram-bot)
6. [Click & Payme](#6-click--payme)
7. [Resend](#7-resend)
8. [Sentry](#8-sentry)
9. [Netlify](#9-netlify)
10. [Проверка соединений](#10-проверка-соединений)

---

## 1. Матрица статусов

| Сервис | Фаза | Статус (2026-07-24) | Необходимые секреты |
|---|---|---|---|
| Supabase | 0 | ✅ ACTIVE_HEALTHY | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET` |
| Anthropic Claude | 0 | ✅ Secret есть; smoke test не выполнен | `ANTHROPIC_API_KEY` |
| OpenAI (embedding) | 0 | ✅ Secret есть; KB smoke test не выполнен | `OPENAI_API_KEY` |
| Telegram bot | 1 | ⚠️ Function ACTIVE; webhook secret отсутствует | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET` |
| Sentry | 0 | ⚠️ опционально | `SENTRY_DSN` |
| Resend | 1 | ⚠️ Secrets есть; delivery не подтверждён | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_WEBHOOK_SECRET` |
| Click | 3 | ❌ позже | `CLICK_MERCHANT_ID`, `CLICK_SERVICE_ID`, `CLICK_SECRET_KEY` |
| Payme | 3 | ❌ позже | `PAYME_MERCHANT_ID`, `PAYME_KEY` |
| Netlify | 0 | ✅ уже настроен | — |

---

## 2. Supabase

### 2.1 Получение данных проекта

1. https://supabase.com → Dashboard → Projects → ваш проект
2. Страница **Settings → API Keys / Connect**:
   - `Project URL` → `SUPABASE_URL`
   - Publishable key (`sb_publishable_...`) → frontend `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Legacy `anon` → `SUPABASE_ANON_KEY` только для переходной JWT compatibility backend/Edge Functions
   - Ключ `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (**секретный!**)
   - `JWT Secret` → `JWT_SECRET`

### 2.2 Push миграций

```bash
supabase link --project-ref <your-project-ref>
supabase db push
supabase db remote sql --query "select * from phase0_rls_health;"
```

### 2.3 Деплой Edge Functions

```bash
supabase functions deploy server --project-ref <ref>
supabase functions deploy telegram-bot --project-ref <ref>
```

### 2.4 Установка секретов

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-... --project-ref <ref>
supabase secrets set OPENAI_API_KEY=sk-... --project-ref <ref>
supabase secrets set JWT_SECRET=... --project-ref <ref>
```

---

## 3. Anthropic Claude

### 3.1 Создание ключа

1. https://console.anthropic.com → регистрация
2. **Settings → API Keys → Create Key**
3. Тип ключа: `Production`
4. Имя ключа: `ai-business-concierge-prod`
5. Скопируйте `sk-ant-api03-...` — он больше не будет показан!

### 3.2 Настройка

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-... --project-ref <ref>
```

### 3.3 Smoke test

```bash
curl -X POST "https://<your-project>.supabase.co/functions/v1/server/v1/ai/chat" \
  -H "Authorization: Bearer <user-jwt>" \
  -H "X-Tenant-Id: <tenant-id>" \
  -H "Content-Type: application/json" \
  -d '{"message": "Привет! Кто ты?", "locale": "ru"}'
```

---

## 4. OpenAI

Нужен только для **эмбеддингов** (text-embedding-3-small). Не используется для инференса Claude.

### 4.1 Ключ

1. https://platform.openai.com/api-keys → **Create new secret key**
2. Права: `Restricted` → только embeddings
3. Название: `aibc-embedding-only`

### 4.2 Настройка

```bash
supabase secrets set OPENAI_API_KEY=sk-... --project-ref <ref>
```

---

## 5. Telegram bot

### 5.1 Создание бота

1. Напишите [@BotFather](https://t.me/BotFather)
2. `/newbot` → дайте имя и username боту
3. BotFather выдаст токен (`123456789:ABC-DEF...`)

### 5.2 Webhook secret

```bash
openssl rand -hex 32
```

### 5.3 Настройка

```bash
supabase secrets set TELEGRAM_BOT_TOKEN=123456789:ABC... --project-ref <ref>
supabase secrets set TELEGRAM_WEBHOOK_SECRET=<random-hex> --project-ref <ref>
```

### 5.4 Подключение webhook (Фаза 1)

```bash
curl -F "url=https://<your-project>.supabase.co/functions/v1/telegram-bot" \
     -F "secret_token=<TELEGRAM_WEBHOOK_SECRET>" \
     "https://api.telegram.org/bot<TOKEN>/setWebhook"
```

---

## 6. Click & Payme

> ⚠️ Фаза 3 (Неделя 10-13). Настройка сейчас не обязательна, но аккаунт лучше открыть заранее (KYC занимает время).

### 6.1 Click

1. https://merchant.click.uz → регистрация
2. Prepare URL: `.../billing/webhook/click/prepare`
3. Complete URL: `.../billing/webhook/click/complete`

### 6.2 Payme

1. https://merchant.payme.uz → заявка
2. Webhook URL: `.../billing/webhook/payme`

---

## 7. Resend

> Фаза 1 (Неделя 3-5). Email-уведомления через Resend.

1. https://resend.com → Sign up
2. **API Keys → Create API Key** → `aibc-prod`

```bash
supabase secrets set RESEND_API_KEY=re_... --project-ref <ref>
supabase secrets set RESEND_WEBHOOK_SECRET=whsec_... --project-ref <ref>
```

---

## 8. Sentry

### 8.1 Создание проекта

1. https://sentry.io → New Project
2. Для **Browser/React**: `ai-business-concierge-frontend` → DSN → `VITE_SENTRY_DSN`
3. Для **Node/Deno**: `ai-business-concierge-backend` → DSN → `SENTRY_DSN`

### 8.2 Настройка

```bash
# Frontend (.env)
VITE_SENTRY_DSN=https://...@o123.ingest.sentry.io/456
VITE_SENTRY_ENVIRONMENT=production

# Backend
supabase secrets set SENTRY_DSN=https://...@o123.ingest.sentry.io/789 --project-ref <ref>
```

---

## 9. Netlify

### 9.1 Деплой фронтенда

1. https://app.netlify.com → New site from Git
2. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

### 9.2 Redirect (SPA fallback)

В `frontend/public/_redirects`:
```
/*    /index.html   200
```

---

## 10. Проверка соединений

```bash
# Health
curl https://<project>.supabase.co/functions/v1/server/health
# → { "status": "ok" }

# AI чат
curl -X POST https://<project>.supabase.co/functions/v1/server/v1/ai/chat \
  -H "Authorization: Bearer <jwt>" \
  -H "X-Tenant-Id: <tid>" \
  -H "Content-Type: application/json" \
  -d '{"message":"Какой НДС в 2026 году?","locale":"ru"}'
# → ответ, llm_model: claude-..., kb_found: true
```

---

## Примечания

- **Никогда** не вписывайте реальные секреты в `.env.example`
- Ротация production секретов: обновляйте токены каждые 90 дней

---

*CONNECTIONS.md v1.0 — все интеграции в одном месте*
