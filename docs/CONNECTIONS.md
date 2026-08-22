# CONNECTIONS.md — Tashqi xizmatlar va integratsiyalar

> AI Business Concierge — barcha tashqi connectionlarni sozlash bo'yicha qo'llanma
> Version: 1.1 · Yangilandi: 2026-07-24 (production audit)
> Owner: Sher (PM/PL)
>
> **Status eslatmasi (2026-08-07):** Joriy snapshot [STATUS.md](STATUS.md)da. Quyidagi ayrim buyruqlarda legacy `anon`/`server` nomlari qolgan; publishable-key migratsiyasi tugamaguncha keyni ko'r-ko'rona rotate/revoke qilmang.

---

## Mundarija

1. [Holatlar matritsasi](#1-holatlar-matritsasi)
2. [Supabase (Database + Auth + Edge Functions + Storage)](#2-supabase)
3. [Anthropic Claude (asosiy AI)](#3-anthropic-claude)
4. [OpenAI (KB embedding + fallback)](#4-openai)
5. [Telegram bot (Phase 1+)](#5-telegram-bot)
6. [Click & Payme (to'lov, Phase 3)](#6-click--payme)
7. [Resend (email, Phase 1)](#7-resend)
8. [Sentry (monitoring)](#8-sentry)
9. [Netlify (frontend hosting)](#9-netlify)
10. [Connection health check (smoke test)](#10-connection-health-check)

---

## 1. Holatlar matritsasi

| Servis | Phase | Holati (2026-07-24) | Kerakli secrets | Foydalanuvchi qadam |
|---|---|---|---|---|
| Supabase | 0 | ✅ ACTIVE_HEALTHY | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET` | — |
| Anthropic Claude | 0 | ✅ Secret mavjud | `ANTHROPIC_API_KEY` | Smoke test kerak |
| OpenAI (embedding) | 0 | ✅ Secret mavjud | `OPENAI_API_KEY` | KB seed/search smoke test kerak |
| Telegram bot | 1 | ⚠️ v15 ACTIVE, secret yo'qligida fail-closed `503` | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET` | Secret o'rnatish va webhookni yangilash |
| Sentry | 0 | ⚠️ ixtiyoriy | `SENTRY_DSN` (frontend + backend alohida) | §8 ga qarang |
| Resend | 1 | ⚠️ Secretlar mavjud, delivery tasdiqlanmagan | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_WEBHOOK_SECRET` | Domain/email smoke test |
| Click | 3 | ❌ keyinroq | `CLICK_MERCHANT_ID`, `CLICK_SERVICE_ID`, `CLICK_SECRET_KEY` | §6 ga qarang |
| Payme | 3 | ❌ keyinroq | `PAYME_MERCHANT_ID`, `PAYME_KEY` | §6 ga qarang |
| Netlify | 0 | ✅ avval sozlangan | — | §9 ga qarang |

**Bugun tezkor priorit:** `TELEGRAM_WEBHOOK_SECRET` o'rnatish, Telegram webhookni shu secret bilan qayta ulash va Resend domain/delivery smoke test.

---

## 2. Supabase

### 2.1 Project ma'lumotlari olish

1. https://supabase.com → Dashboard → Projects → loyihangiz
2. **Settings → API Keys / Connect** sahifasi:
   - `Project URL` → `SUPABASE_URL` ga
   - `Publishable key` (`sb_publishable_...`) → frontend uchun `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Legacy `anon` → faqat o'tish davridagi backend/Edge Function JWT compatibility uchun `SUPABASE_ANON_KEY`; frontendga yangi contract bilan berilmaydi
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (backend only, **maxfiy!**)
   - `JWT Secret` → `JWT_SECRET`

### 2.2 Migration push qilish

```bash
# Supabase CLI ulanish
supabase link --project-ref <your-project-ref>

# Phase 0 migrationlarni push qilish
supabase db push

# Verify (RLS health check)
supabase db remote sql --query "select * from phase0_rls_health;"
```

`phase0_rls_health` view 12 jadval uchun har birida 4 ta RLS policy borligini ko'rsatishi kerak (select/insert/update/delete).

### 2.3 Edge Functions deploy

```bash
supabase functions deploy server --project-ref <ref>
supabase functions deploy telegram-bot --project-ref <ref>   # Phase 1+ da
```

### 2.4 Secrets sozlash

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-... --project-ref <ref>
supabase secrets set OPENAI_API_KEY=sk-... --project-ref <ref>
supabase secrets set JWT_SECRET=... --project-ref <ref>
# ...va boshqalar (supabase/.env.example dagi barcha kerakli secret lar)
```

---

## 3. Anthropic Claude

### 3.1 Key yaratish

1. https://console.anthropic.com → ro'yxatdan o'ting (kreditkartani ulang — minimal $5 deposit)
2. **Settings → API Keys → Create Key**
3. Key turi: `Production` (Phase 0 dev uchun ham bu yaxshi)
4. Key nomi: `ai-business-concierge-prod`
5. Yaratilgan `sk-ant-api03-...` keyni nusxalang — qaytadan ko'rinmaydi!

### 3.2 Sozlash

```bash
# Lokal dev (.env)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Supabase production
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

Javobda `llm_provider: "claude"` va `llm_model: "claude-3-5-haiku-..."` bo'lishi kerak.

### 3.4 Cost monitoring

- Anthropic Console → Usage → kunlik cost
- Bizning sistemada: `ai_messages.cost_usd` ustunida har so'rov saqlanadi
- Alert: kunlik $50+ bo'lsa Sentry'ga signal (Phase 1 da sozlanadi)

---

## 4. OpenAI

Faqat **embedding** (text-embedding-3-small) uchun kerak. Claude inference'ga ishlatilmaydi.

### 4.1 Key

1. https://platform.openai.com/api-keys → **Create new secret key**
2. Permissions: `Restricted` → faqat `Model capabilities → embeddings` ga ruxsat bering
3. Nom: `aibc-embedding-only`

### 4.2 Sozlash

```bash
supabase secrets set OPENAI_API_KEY=sk-... --project-ref <ref>
```

### 4.3 Smoke test

KB ga bitta savol qo'shish bilan tekshiriladi (embedding avtomatik yaratiladi):

```sql
insert into knowledge_base (locale, category, question, answer, tags)
values ('uz', 'soliq', 'YaTT QQS qaysi yili joriy etilgan?', '...', '{"yatt", "qqs"}');
```

So'ng `services/knowledge-base.ts.searchKnowledgeBase()` chaqirilganda
`bestSimilarity > 0.75` bo'lishi kerak.

---

## 5. Telegram bot

> 2026-08-21 production: `telegram-bot` v15 ACTIVE. `TELEGRAM_BOT_TOKEN` nomi bor, `TELEGRAM_WEBHOOK_SECRET` yo'q; GET `200`, POST ataylab `503`. Secret set va `setWebhook` bajarilmaguncha bot update qabul qilmaydi.

### 5.1 Bot yaratish

1. Telegram'da [@BotFather](https://t.me/BotFather) ga yozing
2. `/newbot` → bot nom va username bering (masalan: `ai_business_concierge_bot`)
3. BotFather token beradi (`123456789:ABC-DEF...`)
4. Tavsiya etilgan sozlash:
   ```
   /setdescription   AI Business Concierge — kichik biznes uchun kundalik AI yordamchi
   /setabouttext     Soliq, hujjat, savdo bot — Telegram'da, 24/7
   /setuserpic       (logo yuboring)
   /setcommands      ↓ quyidagilarni yuboring
   ```
   ```
   start - Botni ishga tushirish
   help - Yordam
   language - Tilni o'zgartirish
   account - Hisobim
   history - Suhbatlar tarixi
   ```

### 5.2 Webhook secret va ulanishni xavfsiz rollout qilish

`scripts/telegram-webhook-rollout.ts` random secret yaratadi, uni temp `0600` env-file orqali Supabase'ga o'rnatadi, Telegram `setWebhook`ni bajaradi va exact URL/health/unauthorized POSTni tekshiradi. Telegram commitdan oldin xato bo'lsa secret avtomatik unset qilinadi. Mavjud secret bo'lsa tasodifiy rotationni oldini olish uchun helper ishlamaydi.

Bot tokenni shell historyga yozmasdan kiriting va production project refni aniq bering:

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

Helper secret yoki token qiymatini outputga chiqarmaydi. `TELEGRAM_WEBHOOK_SECRET`ni qo'lda berish shart emas; default 96-belgili random hex ishlatiladi.

---

## 6. Click & Payme

> ⚠️ Phase 3 (Hafta 10-13). Hozir setup shart emas, lekin akkountni oldindan ochish foydali (KYC vaqt oladi).

### 6.1 Click

1. https://merchant.click.uz → ro'yxatdan o'ting
2. Yuridik shaxs ma'lumotlari + bank rekvizitlar
3. Tasdiqlangach: **Sozlamalar → Texnik integratsiya**
4. Production sozlash:
   - Prepare URL: `https://<project>.supabase.co/functions/v1/server/v1/billing/webhook/click/prepare`
   - Complete URL: `https://<project>.supabase.co/functions/v1/server/v1/billing/webhook/click/complete`
5. Kalitlarni `CLICK_MERCHANT_ID`, `CLICK_SERVICE_ID`, `CLICK_SECRET_KEY` ga.

### 6.2 Payme

1. https://merchant.payme.uz → ariza
2. Webhook URL: `https://<project>.supabase.co/functions/v1/server/v1/billing/webhook/payme`
3. Kalitlarni `PAYME_MERCHANT_ID`, `PAYME_KEY` ga.

**Idempotency:** ikkala provider ham bir transaction'ni qayta yuborishi mumkin. Backend `payments.provider_payment_id` ustunida unique constraint orqali himoyalangan.

---

## 7. Resend

> Phase 1 (Hafta 3-5). Resend orqali email bildirishnoma (parolni tiklash, hisobot xulosa, hisob-faktura).

1. https://resend.com → Sign up
2. **API Keys → Create API Key** → `aibc-prod`
3. Domen: `mail.your-domain.uz` ni Resend'ga qo'shing (DNS verifikatsiya)
4. Webhook secret: Resend Dashboard → Webhooks → Add endpoint
   - URL: `https://<project>.supabase.co/functions/v1/server/v1/inbox/webhook/resend`

```bash
supabase secrets set RESEND_API_KEY=re_... --project-ref <ref>
supabase secrets set RESEND_WEBHOOK_SECRET=whsec_... --project-ref <ref>
```

---

## 8. Sentry

### 8.1 Project yaratish

1. https://sentry.io → New Project
2. **Browser/React** uchun: `ai-business-concierge-frontend` → DSN ni `VITE_SENTRY_DSN` ga
3. **Node/Deno** uchun: `ai-business-concierge-backend` → DSN ni `SENTRY_DSN` ga
4. Tag suggested:
   - `module` (auth, ai, hr_candidate, billing, telegram)
   - `tenant_id` (ehtiyot bo'lish — PII emas, lekin tenant ID bilan filterlash qulay)
   - `locale`

### 8.2 Sozlash

```bash
# Frontend (.env)
VITE_SENTRY_DSN=https://...@o123.ingest.sentry.io/456
VITE_SENTRY_ENVIRONMENT=production

# Backend (Supabase secrets)
supabase secrets set SENTRY_DSN=https://...@o123.ingest.sentry.io/789 --project-ref <ref>
```

### 8.3 PII himoyasi

- CV content NEVER Sentry'ga yuborilmaydi (HR_CANDIDATE_ANALYSIS.md §7.5)
- AI message content faqat truncated excerpt (500 belgi) saqlanadi
- User email Sentry'da default `false` — `setUser({ id })` faqat anonymous ID

---

## 9. Netlify

### 9.1 Frontend deploy

1. https://app.netlify.com → New site from Git
2. Repo: `sherzot/ai-business-concierge`
3. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run validate:deploy-env && npm run build`
   - Publish directory: `frontend/dist`
4. **Site settings → Environment variables** ga `VITE_*` qiymatlarni qo'shing
5. **Domain settings → Add custom domain**: `app.your-domain.uz`

### 9.2 Redirect (SPA fallback)

`frontend/public/_redirects` faylida:
```
/*    /index.html   200
```

### 9.3 Branch previews

Har PR uchun Netlify avtomatik preview chiqaradi (`https://deploy-preview-<n>--<site>.netlify.app`).

Preview/branch/dev contextlari faqat alohida staging Supabase projectiga ulanadi. Production project-ref yoki publishable keyni `All` contextga bermang; `validate:deploy-env` noto'g'ri context/project juftligini build vaqtida bloklaydi. Stagingga real production ma'lumotini ko'chirmang.

---

## 10. Connection health check

Phase 0 hammasini sozlangach, quyidagi smoke testni o'tkazing:

```bash
# 1. Health
curl https://<project>.supabase.co/functions/v1/server/health
# → { "status": "ok" }

# 2. RLS health (admin DB query)
supabase db remote sql --query "select * from phase0_rls_health;"
# → 12 jadval, har biri 4 policy

# 3. AI chat (Claude + KB)
curl -X POST https://<project>.supabase.co/functions/v1/server/v1/ai/chat \
  -H "Authorization: Bearer <jwt>" \
  -H "X-Tenant-Id: <tid>" \
  -H "Content-Type: application/json" \
  -d '{"message":"YaTT 2026 da soliq qancha?","locale":"uz"}'
# → reply, llm_model: claude-..., kb_found: true

# 4. AI feedback
curl -X POST https://<project>.supabase.co/functions/v1/server/v1/ai/feedback \
  -H "Authorization: Bearer <jwt>" \
  -H "X-Tenant-Id: <tid>" \
  -H "Content-Type: application/json" \
  -d '{"message_id":"<ai_messages.id>","rating":1}'
# → { "ok": true, "data": { "saved": true } }

# 5. HR candidate (501 placeholder hozircha)
curl -X POST https://<project>.supabase.co/functions/v1/server/v1/hr/candidates/analyze
# → 501 NOT_IMPLEMENTED  ✅ (skeleton mounted)
```

---

## Eslatmalar

- **Hech qachon** real secret'larni `.env.example` ga yozmang — faqat placeholder.
- `.env` fayllar `.gitignore` da bo'lishi shart (loyihada allaqachon).
- Production secret rotatsiyasi: har 90 kunda Anthropic/OpenAI/Telegram tokenlarini yangilang.
- Yangi connector qo'shilganda: bu hujjatga yozing, `.env.example` ni yangilang, smoke test qo'shing.

---

*CONNECTIONS.md v1.0 — barcha integratsiyalarni bir joyda*
*Phase 0 yakunlash uchun zarur: Anthropic key + OpenAI key (faqat embedding uchun)*
