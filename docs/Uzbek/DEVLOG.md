# Development Log — AI Business Concierge

Loyiha rivojlanishi, qilingan ishlar, duch kelgan xatolar va ularning yechimlari.

> **Tarjimalar (sinxron yangilanadi):** [O'zbekcha (asosiy)](../DEVLOG.md) · [English](../English/DEVLOG.md) · [Russian](../Russian/DEVLOG.md) · [日本語](../日本語/DEVLOG.md)
>
> **Protokol (CLAUDE.md §...):** Har bir o'zgarish bu faylga va 4 til tarjimaga yoziladi.

---

## 2026-05-14 — Scale fundament: AI cost tracking + doc_chunks RAG + R-016..R-020

### Kontekst

`docs/ai-business-concierge-scale-prompt.md` (2026-05-11) talablari bo'yicha "darhol" qilinishi kerak bo'lganlari amalga oshirildi. Phase 1.5 holatini tekshirish va etib bormagan urgent ishlarni yopish.

### Bajarildi

**1. DB migration `20260514000000_ai_usage_and_doc_vector.sql`:**
- `ai_usage_logs` jadvali — har AI chaqiruv: tenant, user, endpoint, model, provider, complexity, prompt/completion tokens, cost_usd, cached, latency, trace_id. Generated `total_tokens`. 3 ta index. RLS + super_admin/sub_admin barchasini ko'radi.
- `v_ai_usage_summary` view — kunlik tenant agregat.
- `doc_chunks.embedding vector(1536)` ustun.
- HNSW index `doc_chunks_embedding_idx` (m=16, ef_construction=64).
- `match_documents()` funksiyasi — RAG search, security definer.

**2. REQUIREMENTS.md yangilandi:**
- R-016 HR Candidate Analysis
- R-017 AI Rate Limiting
- R-018 AI Cost Tracking (migration done)
- R-019 Vector Search RAG (migration done)
- R-020 Admin Dashboard

**3. Hozirgi holat tekshirildi:**
- Phase 1.5 — 5 ta migration applied
- Backend admin endpoints va frontend admin pages — to'liq

### Defer

- Prompt caching → Phase 1.5 yakuni
- HR Candidate Analysis full impl → Phase 2
- Backend wiring `ai_usage_logs` → keyingi sessiya
- `match_documents()` → search endpoint → keyingi sessiya
- Admin debug/log UI → Phase 4

### Sabab

Billing (Phase 2) ishlay olishi uchun `ai_usage_logs` shart. RAG search uchun `match_documents()` zarur.

---

## 2026-05-06 — Phase 1.5 (4): B-027/B-028/B-029

### Qilingan o'zgarishlar

**B-027 — In-app Notifications for HR (Realtime):**
- `createHrSetupCompleteNotification` — xodim setup tugaganda HR/leader larga bildirishnoma
- `createEmployeeConfirmedNotification` — HR xodimni tasdiqlaganda xodimga bildirishnoma
- `useRealtimeNotifications` hook — Supabase realtime orqali subscribe
- `NotificationsDropdown` — `userId` prop qabul qiladi, yangi bildirishnoma kelganda avtomatik yangilanadi

**B-028 — /admin/health (System Monitoring):**
- Backend: `GET /admin/health` — super_admin only; DB latency + statistika
- Frontend: `AdminHealthPage` — stat cards, DB latency banner, refresh button

**B-029 — /admin/ai-chat (Admin AI Chat):**
- Backend: `POST /admin/ai/chat` — super_admin only; Claude + OpenAI fallback
- Frontend: `AdminAIChatPage` — chat UI, typing indicator, suggestion chips
- `adminApi.ts` — `getAdminHealth()` + `sendAdminAIMessage()`

---

## 2026-05-06 — Phase 1.5 (3): B-026 Email Templates (7 ta)

**7 ta email template (Resend API, dark indigo theme):**
1. `company_invite` — admin contact → invite_sent
2. `company_registered_pending` — POST /register/company → leader emailiga
3. `company_rejected` — status=rejected → contact emailiga
4. `company_approved` — status=active → leader emailiga
5. `employee_invite` — POST /members → xodimga branded email
6. `employee_welcome` — POST /auth/setup-complete → "Xush kelibsiz"
7. `admin_new_registration` — POST /register/company → ADMIN_NOTIFY_EMAIL

**Yangi env var:** `ADMIN_NOTIFY_EMAIL`
**Yangi endpoint:** `PATCH /admin/tenants/:id/status`

---

## 2026-05-06 — Phase 1.5 (2): Matn Tuzatishlar + Language Selector

- `landing/i18n.ts` — "ChatGPT bu bilmaydi." iborasi olib tashlandi
- `app/i18n.ts` — `auth.platformSubtitle` kaliti 4 tilda qo'shildi
- `LoginPage.tsx`, `LandingNavbar.tsx`, `LanguageSwitcher.tsx` — button group → `<select>` dropdown

---

## 2026-05-05 — Phase 1: Telegram Bot

**Arxitektura (Clean Architecture / DDD):**
- `supabase/functions/telegram-bot/` — Edge Function
- `handlers/` — start, help, language, message, feedback, stats, media
- `services/` — session.ts, maslahatchi.ts

**Bot funksionalligi:**
- 4 til: uz / ru / en / ja
- `/start`, `/help`, `/til`, `/stats`
- Rate limit: 5 so'rov/kun
- LLM Router: Haiku 3.5 (~80%) + Sonnet 4.6 (~20%)
- KB semantic search: pgvector + OpenAI embedding

**Beta monitoring:**
- `v_beta_stats`, `v_beta_daily_activity`, `v_beta_feedback`, `v_beta_model_usage`

---

## 2026-05-05 — Deployment: Xatolar va Yechimlar

### ❌ 401 Unauthorized (Webhook)
**Sabab:** Supabase JWT verification webhook blokladi.
**Yechim:** `verify_jwt = false` qo'shildi `config.toml` ga.

### ❌ TELEGRAM_WEBHOOK_SECRET not found
**Sabab:** Secret set qilinmagan.
**Yechim:** Secret olib tashlandi.

### ❌ CLAUDE_ERROR:400 credit balance too low
**Sabab:** Anthropic API krediti yo'q.
**Holat:** Foydalanuvchi kredit qo'shishi kerak ($5+).

### ❌ OpenAI 429 insufficient_quota
**Sabab:** KB seed OpenAI embedding API ga murojaat qildi.
**Holat:** Anthropic bilan birga hal qilinadi.

---

## 2026-05-06 — Bot UX Yaxshilashlar

1. **Matn bo'lmagan xabarlar** — `handlers/media.ts` — rasm, ovoz, fayl → "faqat matn yuboring"
2. **Qaytuvchi foydalanuvchi `/start`** — "Xush kelibsiz qayta!" til bo'yicha
3. **Qolgan limit ko'rsatish** — `📊 Bugun qolgan: X/5 so'rov`
4. **Feedback tili** — oldin hardcoded "uz", endi real locale

---

## 2026-05-06 — Til Tizimi Tuzatishlar

### DB Check Constraint — Asosiy Xato
**Sabab:** `ai_conversations.locale` constraint da 'ja' yo'q edi.
**Yechim:** Migration qo'shildi — 4 ta til: `CHECK (locale IN ('uz', 'ru', 'en', 'ja'))`

### Disclaimer faqat uz/ru
**Sabab:** `knowledge-base.ts` da faqat 2 ta disclaimer.
**Yechim:** 4 ta disclaimer qo'shildi.

### `llm-router.ts` default system prompt
**Sabab:** Faqat uz/ru uchun — en/ja o'zbek prompt olgan.
**Yechim:** Barcha 4 til uchun qo'shildi.

---

## 2026-05-06 — Phase 1.5 (1): DB Migrations + Landing

### DB — 5 ta migration
| Migration | Nima qildi |
|---|---|
| `phase15_contact_requests` | Kompaniya murojaatlari CRM jadvali |
| `phase15_tenant_company_info` | `tenants` ga: status, STIR, yuridik ma'lumotlar |
| `phase15_roles_update` | Yangi rollar: sub_admin, company_admin, accountant, manager |
| `phase15_employee_profiles` | To'liq HR ma'lumotlari jadvali |
| `phase15_employee_invites` | Bir martalik invite token jadvali |

---

## Muhim Ma'lumotlar

| Parametr | Qiymat |
|----------|--------|
| Supabase project ref | `ufhepwdkjqptjvxrmpjn` |
| Bot username | `@ai_business_concierge_bot` |
| Admin chat ID | `6132360728` |
| LLM Router | Haiku 3.5 (simple) + Sonnet 4.6 (complex) |
| Embedding model | `text-embedding-3-small` (OpenAI) |
| Rate limit | 5 so'rov/kun (free) |
| Til fallback (KB) | `ja` → `en` |
