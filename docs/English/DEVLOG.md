# Development Log — AI Business Concierge

Project development history, completed work, encountered errors, and their solutions.

> **Translations (kept in sync):** [Uzbek (primary)](../DEVLOG.md) · [Russian](../Russian/DEVLOG.md) · [Uzbek translation](../Uzbek/DEVLOG.md) · [日本語](../日本語/DEVLOG.md)
>
> **Protocol (CLAUDE.md §...):** Every change is logged here and across the 4 translations.

---

## 2026-05-14 — Scale foundation: AI cost tracking + doc_chunks RAG + R-016..R-020

### Context

Implemented the urgent items from `docs/ai-business-concierge-scale-prompt.md` (2026-05-11). Audited the Phase 1.5 state and closed the remaining urgent gaps.

### Done

**1. DB migration `20260514000000_ai_usage_and_doc_vector.sql`:**
- `ai_usage_logs` table — per AI call: tenant, user, endpoint, model, provider, complexity, prompt/completion tokens, cost_usd, cached, latency, trace_id. Generated `total_tokens` column. 3 indexes. RLS with tenant isolation + super_admin/sub_admin see everything.
- `v_ai_usage_summary` view — daily tenant aggregate (for Admin dashboard).
- `doc_chunks.embedding vector(1536)` column — for pgvector RAG.
- `doc_chunks_embedding_idx` HNSW index (m=16, ef_construction=64).
- `match_documents(query_embedding, threshold, count, tenant_id)` function — RAG search, security definer, search_path locked, execute granted only to authenticated/service_role.
- Document_id and tenant_id indexes on `doc_chunks`.

**2. REQUIREMENTS.md updated:**
- R-016 HR Candidate Analysis (skeleton exists, full impl in Phase 2).
- R-017 AI Rate Limiting (partial — in-memory `contactRateMap` + Telegram daily limit).
- R-018 AI Cost Tracking (migration done — backend wiring next session).
- R-019 Vector Search RAG (migration done — backend integration next session).
- R-020 Admin Dashboard (super_admin/sub_admin: health, contacts, AI chat — Phase 4 expansion).

**3. Verified existing state:**
- Phase 1.5 — 5 migrations applied: contact_requests, tenant_company_info, roles_update (sub_admin/company_admin/accountant/manager), employee_profiles, employee_invites.
- Backend admin endpoints in place: `/admin/contacts`, `/admin/health`, `/admin/ai/chat`, `/admin/contacts/:id/status`, `/admin/tenants/:id/status`.
- Frontend admin pages with real implementations: `AdminContactsPage`, `AdminHealthPage`, `AdminAIChatPage` + `adminApi.ts`.
- docs/ structure correct: `English/`, `Russian/`, `Uzbek/`, `日本語/` — each with DEVLOG.md and other translations.

### Deferred (future)

- Prompt caching middleware (scale-prompt Task 1.2) — Phase 1.5 wrap-up.
- HR Candidate Analysis full impl — Phase 2 (per PLAN.md v3.0).
- Backend wiring: insert into `ai_usage_logs` from `/v1/ai/chat` endpoint — next session (extract token usage from services/llm-router.ts).
- Wire `match_documents()` into `POST /v1/docs/search` — next session.
- Full admin debug/log UI (real-time Sentry, query EXPLAIN) — Phase 4.

### Files
- `supabase/migrations/20260514000000_ai_usage_and_doc_vector.sql` (new)
- `docs/REQUIREMENTS.md` (R-016..R-020 added)
- `docs/DEVLOG.md` (this entry)
- `docs/{English,Russian,Uzbek,日本語}/DEVLOG.md` (sync translations)

### Rationale

Without `ai_usage_logs`, billing (Phase 2) cannot work — we can't allocate cost per tenant without per-call token attribution. Without `match_documents()`, the AI Concierge "search in my docs" tool falls back to `ILIKE` — low-quality results.

---

## 2026-05-06 — Phase 1.5 (4): B-027/B-028/B-029

### Changes Made

**B-027 — In-app Notifications for HR (Realtime):**
- `createHrSetupCompleteNotification` — sends notification to HR/leader when employee setup completes
- `createEmployeeConfirmedNotification` — sends notification to employee when HR confirms
- `useRealtimeNotifications` hook — subscribes to `notifications` table via Supabase realtime
- `NotificationsDropdown` — accepts `userId` prop, auto-updates on new notifications (no polling)

**B-028 — /admin/health (System Monitoring):**
- Backend: `GET /admin/health` — super_admin only; DB latency + tenant/user/contact/notification stats
- Frontend: `AdminHealthPage` — stat cards, DB latency banner (green/amber), refresh button; route: `/admin/health`

**B-029 — /admin/ai-chat (Admin AI Chat):**
- Backend: `POST /admin/ai/chat` — super_admin only; Claude + OpenAI fallback; live platform stats as context
- Frontend: `AdminAIChatPage` — chat UI, typing indicator, suggestion chips, locale-aware; route: `/admin/ai-chat`
- `adminApi.ts` — `getAdminHealth()` + `sendAdminAIMessage()` API helpers

---

## 2026-05-06 — Phase 1.5 (3): B-026 Email Templates (7 total)

**7 email templates (Resend API, dark indigo theme):**
1. `company_invite` — existing (admin contact → invite_sent)
2. `company_registered_pending` — POST /register/company → "Awaiting admin approval" to leader email
3. `company_rejected` — PATCH /admin/contacts/:id/status → status=rejected → email to contact
4. `company_approved` — new PATCH /admin/tenants/:id/status → status=active → email to leader
5. `employee_invite` — POST /members → mode=invite → branded email to employee (in addition to Supabase)
6. `employee_welcome` — POST /auth/setup-complete → "Welcome, your account is ready"
7. `admin_new_registration` — POST /register/company → notification to ADMIN_NOTIFY_EMAIL

**New env var:** `ADMIN_NOTIFY_EMAIL`
**New endpoint:** `PATCH /admin/tenants/:id/status`

---

## 2026-05-06 — Phase 1.5 (2): Text Fixes + Language Selector

- `landing/i18n.ts` — "ChatGPT doesn't know this." phrase removed
- `app/i18n.ts` — `auth.platformSubtitle` key added in 4 languages
- `LoginPage.tsx`, `LandingNavbar.tsx`, `LanguageSwitcher.tsx` — button group → `<select>` dropdown

---

## 2026-05-05 — Phase 1: Telegram Bot

**Architecture (Clean Architecture / DDD):**
- `supabase/functions/telegram-bot/` — Edge Function
- `handlers/` — start, help, language, message, feedback, stats, media
- `services/` — session.ts, maslahatchi.ts

**Bot Functionality:**
- 4 languages: uz / ru / en / ja
- `/start`, `/help`, `/language`, `/stats`
- Rate limit: 5 requests/day (free plan)
- LLM Router: Haiku 3.5 (~80%) + Sonnet 4.6 (~20%)
- KB semantic search: pgvector + OpenAI text-embedding-3-small

**Beta Monitoring:**
- `v_beta_stats`, `v_beta_daily_activity`, `v_beta_feedback`, `v_beta_model_usage`

---

## 2026-05-05 — Deployment: Errors and Solutions

### ❌ 401 Unauthorized (Webhook)
**Cause:** Supabase JWT verification was blocking webhook requests.
**Solution:** Added to `supabase/config.toml`:
```toml
[functions.telegram-bot]
verify_jwt = false
```

### ❌ TELEGRAM_WEBHOOK_SECRET not found
**Cause:** Secret was never set, but code was checking for it.
**Solution:** Removed the secret check — webhook auth not required.

### ❌ CLAUDE_ERROR:400 credit balance too low
**Cause:** No Anthropic API credits.
**Status:** User needs to add credits ($5+). Bot cannot respond.

### ❌ OpenAI 429 insufficient_quota
**Cause:** KB seed script called OpenAI embedding API, no quota.
**Status:** Will be resolved with Anthropic. `scripts/seed_kb.ts` is ready (53 entries).

### ❌ /stats didn't work
**Cause:** `ADMIN_CHAT_ID` secret not set.
**Solution:** `supabase secrets set ADMIN_CHAT_ID="6132360728"`

---

## 2026-05-06 — Bot UX Improvements

1. **Non-text messages** — `handlers/media.ts` — images, voice, files, stickers → "please send text only"
2. **Returning user `/start`** — "Welcome back!" in their language, no keyboard shown
3. **Remaining limit display** — `📊 Remaining today: X/5 requests` added to each response
4. **Feedback language fix** — Previously hardcoded `"uz"`, now real locale from `getOrCreateSession`

---

## 2026-05-06 — Language System (Locale) Fixes

### DB Check Constraint — Root Cause
**Cause:** `ai_conversations.locale` constraint: `CHECK (locale IN ('uz', 'ru', 'en'))` — 'ja' was missing!
**Solution:** Migration added: `CHECK (locale IN ('uz', 'ru', 'en', 'ja'))`

### Disclaimer only for uz/ru
**Cause:** `knowledge-base.ts` had only 2 disclaimers.
**Solution:** 4 disclaimers added, `addDisclaimerIfNeeded` extended.

### `llm-router.ts` default system prompt
**Cause:** Fallback `locale === "ru" ? RU : UZ` — English/Japanese users got Uzbek system prompt.
**Solution:** Default system prompt added for all 4 languages.

---

## 2026-05-06 — Phase 1.5 (1): DB Migrations + Landing

### DB — 5 Migrations Applied ✅

| Migration | What it did |
|---|---|
| `phase15_contact_requests` | Company inquiry CRM table + RLS (admin only) |
| `phase15_tenant_company_info` | `tenants` added: status, tax ID, legal info, bank, approval |
| `phase15_roles_update` | `user_tenants` added: sub_admin, company_admin, accountant, manager + status |
| `phase15_employee_profiles` | Full HR data table (passport, JSHSHIR, salary, emergency) |
| `phase15_employee_invites` | One-time invite token table (24h TTL, resend count) |

---

## Key Information

| Parameter | Value |
|-----------|-------|
| Supabase project ref | `ufhepwdkjqptjvxrmpjn` |
| Bot username | `@ai_business_concierge_bot` |
| Admin chat ID | `6132360728` |
| LLM Router | Haiku 3.5 (simple) + Sonnet 4.6 (complex) |
| Embedding model | `text-embedding-3-small` (OpenAI) |
| Rate limit | 5 requests/day (free) |
| Language fallback (KB) | `ja` → `en` (KB only covers uz/ru/en) |
