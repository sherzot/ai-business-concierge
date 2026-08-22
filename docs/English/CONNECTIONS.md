# CONNECTIONS.md — External Services and Integrations

> AI Business Concierge — guide to setting up all external connections
> Version: 1.1 · Updated: 2026-07-24 (production audit)
> Owner: Sher (PM/PL)

---

## Table of Contents

1. [Status Matrix](#1-status-matrix)
2. [Supabase](#2-supabase)
3. [Anthropic Claude](#3-anthropic-claude)
4. [OpenAI](#4-openai)
5. [Telegram Bot](#5-telegram-bot)
6. [Click & Payme](#6-click--payme)
7. [Resend](#7-resend)
8. [Sentry](#8-sentry)
9. [Netlify](#9-netlify)
10. [Connection Health Check](#10-connection-health-check)

---

## 1. Status Matrix

| Service | Phase | Status (2026-07-24) | Required Secrets |
|---|---|---|---|
| Supabase | 0 | ✅ ACTIVE_HEALTHY | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET` |
| Anthropic Claude | 0 | ✅ Secret present; smoke test pending | `ANTHROPIC_API_KEY` |
| OpenAI (embedding) | 0 | ✅ Secret present; KB smoke test pending | `OPENAI_API_KEY` |
| Telegram bot | 1 | ⚠️ v15 ACTIVE; fail-closed `503` while secret is missing | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET` |
| Sentry | 0 | ⚠️ optional | `SENTRY_DSN` |
| Resend | 1 | ⚠️ Secrets present; delivery unverified | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_WEBHOOK_SECRET` |
| Click | 3 | ❌ later | `CLICK_MERCHANT_ID`, `CLICK_SERVICE_ID`, `CLICK_SECRET_KEY` |
| Payme | 3 | ❌ later | `PAYME_MERCHANT_ID`, `PAYME_KEY` |
| Netlify | 0 | ✅ already configured | — |

---

## 2. Supabase

### 2.1 Getting Project Credentials

1. https://supabase.com → Dashboard → Projects → your project
2. **Settings → API Keys / Connect** page:
   - `Project URL` → `SUPABASE_URL`
   - Publishable key (`sb_publishable_...`) → frontend `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Legacy `anon` → `SUPABASE_ANON_KEY` only for transition-time backend/Edge Function JWT compatibility
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**secret!**)
   - `JWT Secret` → `JWT_SECRET`

### 2.2 Push Migrations

```bash
supabase link --project-ref <your-project-ref>
supabase db push
supabase db remote sql --query "select * from phase0_rls_health;"
```

### 2.3 Deploy Edge Functions

```bash
supabase functions deploy server --project-ref <ref>
supabase functions deploy telegram-bot --project-ref <ref>
```

### 2.4 Set Secrets

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-... --project-ref <ref>
supabase secrets set OPENAI_API_KEY=sk-... --project-ref <ref>
supabase secrets set JWT_SECRET=... --project-ref <ref>
```

---

## 3. Anthropic Claude

### 3.1 Create Key

1. https://console.anthropic.com → sign up
2. **Settings → API Keys → Create Key**
3. Key type: `Production`
4. Key name: `ai-business-concierge-prod`
5. Copy the `sk-ant-api03-...` key — it won't be shown again!

### 3.2 Configure

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-... --project-ref <ref>
```

### 3.3 Smoke Test

```bash
curl -X POST "https://<your-project>.supabase.co/functions/v1/server/v1/ai/chat" \
  -H "Authorization: Bearer <user-jwt>" \
  -H "X-Tenant-Id: <tenant-id>" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello! Who are you?", "locale": "en"}'
```

Response should contain `llm_provider: "claude"` and `llm_model: "claude-3-5-haiku-..."`.

---

## 4. OpenAI

Only needed for **embedding** (text-embedding-3-small). Not used for Claude inference.

### 4.1 Key

1. https://platform.openai.com/api-keys → **Create new secret key**
2. Permissions: `Restricted` → only embeddings
3. Name: `aibc-embedding-only`

### 4.2 Configure

```bash
supabase secrets set OPENAI_API_KEY=sk-... --project-ref <ref>
```

---

## 5. Telegram Bot

> Production 2026-08-21: `telegram-bot` v15 is ACTIVE. `TELEGRAM_BOT_TOKEN` exists, `TELEGRAM_WEBHOOK_SECRET` is absent; GET is `200`, POST intentionally `503`. No updates are accepted until secret setup and `setWebhook` are complete.

### 5.1 Create Bot

1. Write to [@BotFather](https://t.me/BotFather)
2. `/newbot` → give the bot a name and username
3. BotFather will give a token (`123456789:ABC-DEF...`)

### 5.2 Safely roll out the webhook secret and connection

`scripts/telegram-webhook-rollout.ts` creates a random secret, sets it in Supabase through a temporary `0600` env file, calls Telegram `setWebhook`, and verifies the exact URL, health, and unauthorized POST. A failure before Telegram commit automatically unsets the new secret. The helper refuses to rotate an existing secret accidentally.

Enter the bot token without putting it in shell history and provide the exact production project ref:

```bash
read -rs "TELEGRAM_BOT_TOKEN?Bot token: " && echo
export TELEGRAM_BOT_TOKEN
export SUPABASE_PROJECT_REF="<production-project-ref>"
export TELEGRAM_WEBHOOK_URL="https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/telegram-bot"

npx -y deno@2.1.14 run \
  --allow-env=TELEGRAM_BOT_TOKEN,SUPABASE_PROJECT_REF,TELEGRAM_WEBHOOK_URL,TELEGRAM_WEBHOOK_SECRET \
  --allow-write \
  --allow-run=npx \
  --allow-net="api.telegram.org,${SUPABASE_PROJECT_REF}.supabase.co" \
  scripts/telegram-webhook-rollout.ts

unset TELEGRAM_BOT_TOKEN
```

The helper never prints the token or secret. Supplying `TELEGRAM_WEBHOOK_SECRET` manually is optional; the default is a random 96-character hexadecimal value.

---

## 6. Click & Payme

> ⚠️ Phase 3 (Week 10-13). No setup required now, but opening accounts in advance is useful (KYC takes time).

### 6.1 Click

1. https://merchant.click.uz → register
2. Prepare URL: `.../billing/webhook/click/prepare`
3. Complete URL: `.../billing/webhook/click/complete`

### 6.2 Payme

1. https://merchant.payme.uz → apply
2. Webhook URL: `.../billing/webhook/payme`

**Idempotency:** Both providers can resend the same transaction. The backend is protected via a unique constraint on `payments.provider_payment_id`.

---

## 7. Resend

> Phase 1 (Week 3-5). Email notifications via Resend.

1. https://resend.com → Sign up
2. **API Keys → Create API Key** → `aibc-prod`
3. Domain: add `mail.your-domain.uz` to Resend (DNS verification)

```bash
supabase secrets set RESEND_API_KEY=re_... --project-ref <ref>
supabase secrets set RESEND_WEBHOOK_SECRET=whsec_... --project-ref <ref>
```

---

## 8. Sentry

### 8.1 Create Project

1. https://sentry.io → New Project
2. For **Browser/React**: `ai-business-concierge-frontend` → DSN to `VITE_SENTRY_DSN`
3. For **Node/Deno**: `ai-business-concierge-backend` → DSN to `SENTRY_DSN`

### 8.2 Configure

```bash
# Frontend (.env)
VITE_SENTRY_DSN=https://...@o123.ingest.sentry.io/456
VITE_SENTRY_ENVIRONMENT=production

# Backend
supabase secrets set SENTRY_DSN=https://...@o123.ingest.sentry.io/789 --project-ref <ref>
```

### 8.3 PII Protection

- CV content is NEVER sent to Sentry
- AI message content is only stored as a truncated excerpt (500 chars)
- User email is `false` by default in Sentry — `setUser({ id })` uses anonymous ID only

---

## 9. Netlify

### 9.1 Deploy Frontend

1. https://app.netlify.com → New site from Git
2. Repo: `sherzot/ai-business-concierge`
3. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run validate:deploy-env && npm run build`
   - Publish directory: `frontend/dist`
4. Add `VITE_*` values to **Site settings → Environment variables**

### 9.2 Redirect (SPA fallback)

In `frontend/public/_redirects`:
```
/*    /index.html   200
```

### 9.3 Branch Previews

Netlify automatically creates a preview for each PR.

Preview/branch/dev contexts connect only to a separate staging Supabase project. Never assign the production project ref or publishable key to `All` contexts; `validate:deploy-env` blocks an invalid context/project pair during the build. Never copy real production data into staging.

---

## 10. Connection Health Check

After setting up everything in Phase 0, run this smoke test:

```bash
# 1. Health
curl https://<project>.supabase.co/functions/v1/server/health
# → { "status": "ok" }

# 2. RLS health
supabase db remote sql --query "select * from phase0_rls_health;"
# → 12 tables, each with 4 policies

# 3. AI chat
curl -X POST https://<project>.supabase.co/functions/v1/server/v1/ai/chat \
  -H "Authorization: Bearer <jwt>" \
  -H "X-Tenant-Id: <tid>" \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the VAT rate in 2026?","locale":"en"}'
# → reply, llm_model: claude-..., kb_found: true
```

---

## Notes

- **Never** put real secrets in `.env.example` — only placeholders
- `.env` files must be in `.gitignore`
- Production secret rotation: update Anthropic/OpenAI/Telegram tokens every 90 days

---

*CONNECTIONS.md v1.0 — all integrations in one place*
