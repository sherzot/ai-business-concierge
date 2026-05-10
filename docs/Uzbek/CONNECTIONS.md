# CONNECTIONS.md — Tashqi xizmatlar va integratsiyalar

> AI Business Concierge — barcha tashqi connectionlarni sozlash bo'yicha qo'llanma
> Version: 1.0 · Yangilandi: 2026-04-29
> Owner: Sher (PM/PL)

---

## Mundarija

1. [Holatlar matritsasi](#1-holatlar-matritsasi)
2. [Supabase](#2-supabase)
3. [Anthropic Claude](#3-anthropic-claude)
4. [OpenAI](#4-openai)
5. [Telegram bot](#5-telegram-bot)
6. [Click & Payme](#6-click--payme)
7. [Resend](#7-resend)
8. [Sentry](#8-sentry)
9. [Netlify](#9-netlify)
10. [Connection health check](#10-connection-health-check)

---

## 1. Holatlar matritsasi

| Servis | Phase | Holati (2026-04-29) | Kerakli secrets |
|---|---|---|---|
| Supabase | 0 | ✅ Sozlangan | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET` |
| Anthropic Claude | 0 | ❌ Key kerak | `ANTHROPIC_API_KEY` |
| OpenAI (embedding) | 0 | ❌ Key kerak | `OPENAI_API_KEY` |
| Telegram bot | 1 | ❌ Bot kerak | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET` |
| Sentry | 0 | ⚠️ ixtiyoriy | `SENTRY_DSN` |
| Resend | 1 | ❌ keyinroq | `RESEND_API_KEY` |
| Click | 3 | ❌ keyinroq | `CLICK_MERCHANT_ID`, `CLICK_SERVICE_ID`, `CLICK_SECRET_KEY` |
| Payme | 3 | ❌ keyinroq | `PAYME_MERCHANT_ID`, `PAYME_KEY` |
| Netlify | 0 | ✅ avval sozlangan | — |

---

## 2. Supabase

### 2.1 Project ma'lumotlari olish

1. https://supabase.com → Dashboard → Projects → loyihangiz
2. **Settings → API** sahifasi:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY` (frontend uchun)
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**maxfiy!**)
   - `JWT Secret` → `JWT_SECRET`

### 2.2 Migration push qilish

```bash
supabase link --project-ref <your-project-ref>
supabase db push
supabase db remote sql --query "select * from phase0_rls_health;"
```

### 2.3 Edge Functions deploy

```bash
supabase functions deploy server --project-ref <ref>
supabase functions deploy telegram-bot --project-ref <ref>
```

### 2.4 Secrets sozlash

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-... --project-ref <ref>
supabase secrets set OPENAI_API_KEY=sk-... --project-ref <ref>
supabase secrets set JWT_SECRET=... --project-ref <ref>
```

---

## 3. Anthropic Claude

### 3.1 Key yaratish

1. https://console.anthropic.com → ro'yxatdan o'ting
2. **Settings → API Keys → Create Key**
3. Key turi: `Production`
4. Key nomi: `ai-business-concierge-prod`
5. `sk-ant-api03-...` keyni nusxalang

### 3.2 Sozlash

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
  -d '{"message": "Salom! Sen kimsan?", "locale": "uz"}'
```

---

## 4. OpenAI

Faqat **embedding** (text-embedding-3-small) uchun kerak.

### 4.1 Key

1. https://platform.openai.com/api-keys → **Create new secret key**
2. Permissions: `Restricted` → faqat embeddings
3. Nom: `aibc-embedding-only`

### 4.2 Sozlash

```bash
supabase secrets set OPENAI_API_KEY=sk-... --project-ref <ref>
```

---

## 5. Telegram bot

### 5.1 Bot yaratish

1. [@BotFather](https://t.me/BotFather) ga yozing
2. `/newbot` → bot nom va username bering
3. Token: `123456789:ABC-DEF...`

### 5.2 Webhook secret

```bash
openssl rand -hex 32
```

### 5.3 Sozlash

```bash
supabase secrets set TELEGRAM_BOT_TOKEN=123456789:ABC... --project-ref <ref>
supabase secrets set TELEGRAM_WEBHOOK_SECRET=<random-hex> --project-ref <ref>
```

### 5.4 Webhook ulash

```bash
curl -F "url=https://<your-project>.supabase.co/functions/v1/telegram-bot" \
     -F "secret_token=<TELEGRAM_WEBHOOK_SECRET>" \
     "https://api.telegram.org/bot<TOKEN>/setWebhook"
```

---

## 6. Click & Payme

> ⚠️ Phase 3 (Hafta 10-13). Hozir setup shart emas.

### 6.1 Click

1. https://merchant.click.uz → ro'yxatdan o'ting
2. Prepare URL: `.../billing/webhook/click/prepare`
3. Complete URL: `.../billing/webhook/click/complete`

### 6.2 Payme

1. https://merchant.payme.uz → ariza
2. Webhook URL: `.../billing/webhook/payme`

---

## 7. Resend

> Phase 1 (Hafta 3-5).

1. https://resend.com → Sign up
2. **API Keys → Create API Key** → `aibc-prod`

```bash
supabase secrets set RESEND_API_KEY=re_... --project-ref <ref>
supabase secrets set RESEND_WEBHOOK_SECRET=whsec_... --project-ref <ref>
```

---

## 8. Sentry

### 8.1 Project yaratish

1. https://sentry.io → New Project
2. Frontend: `ai-business-concierge-frontend` → DSN → `VITE_SENTRY_DSN`
3. Backend: `ai-business-concierge-backend` → DSN → `SENTRY_DSN`

### 8.2 Sozlash

```bash
# Frontend (.env)
VITE_SENTRY_DSN=https://...@o123.ingest.sentry.io/456

# Backend
supabase secrets set SENTRY_DSN=https://...@o123.ingest.sentry.io/789 --project-ref <ref>
```

---

## 9. Netlify

### 9.1 Frontend deploy

1. https://app.netlify.com → New site from Git
2. Build settings:
   - Base: `frontend`
   - Command: `npm run build`
   - Publish: `frontend/dist`

### 9.2 Redirect (SPA fallback)

`frontend/public/_redirects`:
```
/*    /index.html   200
```

---

## 10. Connection health check

```bash
# Health
curl https://<project>.supabase.co/functions/v1/server/health
# → { "status": "ok" }

# AI chat
curl -X POST https://<project>.supabase.co/functions/v1/server/v1/ai/chat \
  -H "Authorization: Bearer <jwt>" \
  -H "X-Tenant-Id: <tid>" \
  -H "Content-Type: application/json" \
  -d '{"message":"YaTT 2026 da soliq qancha?","locale":"uz"}'
# → reply, llm_model: claude-..., kb_found: true
```

---

## Eslatmalar

- **Hech qachon** real secret'larni `.env.example` ga yozmang
- Production secret rotatsiyasi: har 90 kunda tokenlarni yangilang

---

*CONNECTIONS.md v1.0 — barcha integratsiyalarni bir joyda*
