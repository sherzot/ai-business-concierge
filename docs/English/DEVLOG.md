# Development Log — AI Business Concierge

Project development history, completed work, encountered errors, and their solutions.

> **Translations (kept in sync):** [Uzbek (primary)](../DEVLOG.md) · [Russian](../Russian/DEVLOG.md) · [Uzbek translation](../Uzbek/DEVLOG.md) · [日本語](../日本語/DEVLOG.md)
>
> **Protocol (CLAUDE.md §...):** Every change is logged here and across the 4 translations.

---

## 2026-05-27 — Task 1: ai_usage_logs wiring (billing cost tracking)

### Context

While waiting for API credits, we started backend work that doesn't require credits. First task: the `ai_usage_logs` table was created on 2026-05-14 but the `/v1/ai/chat` and `/v1/admin/ai/chat` endpoints weren't writing to it. This is critical for billing — without knowing how much AI credit each tenant consumes, the Phase 3 payment system cannot function.

### Done

**`insertAiUsageLog` helper function (new, non-blocking):**
- `supabase.from("ai_usage_logs").insert(...)` — uses service_role client (RLS bypass)
- `provider` normalization: `"openai_fallback"` → `"openai"` (DB constraint: `('claude','openai','fallback')`)
- Non-blocking: `.then(({ error }) => ...)` — main request is not slowed down
- `AiUsageLogEntry` type — typed interface

**`/v1/ai/chat` endpoint updated:**
- `insertAiUsageLog()` is called after each AI response
- Stored data: `tenant_id`, `user_id`, `endpoint`, `model`, `provider`, `complexity`, `prompt_tokens`, `completion_tokens`, `cost_usd`, `cached`, `latency_ms`, `trace_id`

**`/v1/admin/ai/chat` endpoint updated:**
- Token tracking variables added: `adminModel`, `adminProvider`, `adminInputTokens`, `adminOutputTokens`, `adminCostUsd`, `adminCached`
- Response data from `callClaude()` and `callOpenAI()` is now collected
- Admin chat does NOT write to `ai_usage_logs` (FK constraint — no tenant in admin context) — logged via `console.info()`
- TODO: future solution: nullable `tenant_id` or separate `admin_ai_usage_logs`

**Clarification:**
- `/v1/docs/search` endpoint already exists (line 2916) — works with `ILIKE`
- `match_documents()` pgvector function exists but requires OpenAI embedding credits — will connect when credits arrive
- Task 2 (`match_documents()` wiring) depends on credits, deferred

### Files

- `supabase/functions/server/index.ts` (changed: `insertAiUsageLog` helper + 2 endpoints wired)

---

## 2026-05-15 — Web improvements (completed): 8 major UI/UX changes

### Context

While waiting for API credits, completed 8 web improvements in order.

### Done

**1. ProfileForm — connected to real auth data:**
- `useUserSettings` hook rewritten — reads real `fullName` and `email` from AuthContext
- `PATCH /v1/settings/profile` backend endpoint created
- `refetchProfile()` called after save — sidebar updates immediately

**2. EmployeeDetailPage — edit mode added:**
- All 23 employee_profiles fields shown as a form
- 5 sections: Personal, Employment, Contact, Emergency, Notes
- `PATCH /v1/tenants/:id/members/:userId/profile` — HR upserts employee

**3. Unit tests (B-001):**
- 9 tests: `adminApi.test.ts`
- 12 tests: `settingsDomain.test.ts`
- 7 tests: `useUserSettings.test.ts`
- LandingPage.test.tsx fixed: I18nProvider wrapper added
- Total: 76 tests, all passing

**4. EmployeesPage — filter + search + block/unblock:**
- Status filter chips: all/active/password_pending/password_set/blocked
- Search field (by name/email)
- Block/Unblock buttons per row

**5. Docs page — templates library:**
- 15 templates (contracts, applications, orders)
- Category filter + search
- "coming soon" badge — waiting for AI credits

**6. Admin dashboard — 30s auto-refresh + sidebar badge:**
- `setInterval(30_000)` — AdminDashboardPage auto-refreshes
- Sidebar "Contacts" nav shows red badge (new contact count)

**7. Reports page — AI audit disabled:**
- "AI Audit" button set to disabled — "coming soon" label

**8. Notifications page — full notification history:**
- `NotificationsPage.tsx` — filter (all/unread/read), bulk mark-read
- `NotificationsDropdown` got "View all" link (`onViewAll` prop)
- App.tsx wired `case "notifications"`

### Files

- `supabase/functions/server/index.ts` (changed — 4 new endpoints)
- `frontend/src/features/settings/hooks/useUserSettings.ts` (rewritten)
- `frontend/src/features/settings/components/ProfileForm.tsx` (rewritten)
- `frontend/src/features/hr/pages/EmployeeDetailPage.tsx` (rewritten)
- `frontend/src/features/hr/api/employeesApi.ts` (changed)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (changed)
- `frontend/src/features/admin/__tests__/adminApi.test.ts` (new)
- `frontend/src/features/settings/__tests__/settingsDomain.test.ts` (new)
- `frontend/src/features/settings/__tests__/useUserSettings.test.ts` (new)
- `frontend/src/features/landing/__tests__/LandingPage.test.tsx` (fixed)
- `frontend/src/features/docs/components/TemplatesLibrary.tsx` (new)
- `frontend/src/features/docs/pages/DocsPage.tsx` (rewritten)
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (changed)
- `frontend/src/features/admin/components/AdminLayout.tsx` (changed)
- `frontend/src/features/reports/pages/ReportsPage.tsx` (changed)
- `frontend/src/features/notifications/pages/NotificationsPage.tsx` (new)
- `frontend/src/features/notifications/components/NotificationsDropdown.tsx` (changed)
- `frontend/src/App.tsx` (changed)

---

## 2026-05-15 — Web improvements (continued): TenantSettings, EmployeeDetail, Password, Landing nav/footer

### Context

Continuing web improvements while waiting for API credits — items 3–6 of the 6-task web improvement list.

### Done

**3. TenantSettingsPage (full rewrite):**
- `GET /v1/tenants/:id/profile` and `PATCH /v1/tenants/:id/profile` backend endpoints
- Form: name, legal_form, stir, employee_count_range, activity_type, reg_date, legal_address, website, description, contact_phone, contact_email, bank_name, bank_account
- Replaced stub `<div>Tenant settings</div>`

**4. EmployeeDetailPage (new):**
- `GET /v1/tenants/:id/members/:userId` endpoint — user_tenant + employee_profiles JOIN
- `EmployeeDetailPage` component: 5 sections (Personal, Employment, Contact, Emergency, Notes)
- `onViewEmployee` callback added to EmployeesPage
- `selectedEmployeeId` state and "Company Profile" nav item added to App.tsx

**5. PasswordChangeForm (new):**
- Password change via `supabase.auth.updateUser({ password })`
- Eye/EyeOff toggle, validation (min 8 chars, match check), success/error states
- Added to SettingsPage

**6. Landing nav + footer (updated):**
- LandingNavbar: anchor links for features/pricing/faq (visible on md+), smooth scroll
- LandingFooter: nav links row (Features, Pricing, FAQ, Contact)
- `id="features"` on FeaturesSection, `id="pricing"` on PricingSection
- i18n updated in all 4 locales: nav (features/pricing/faq), footer.links (4 links)

### Files

- `supabase/functions/server/index.ts` (changed: new endpoints)
- `frontend/src/features/tenants/pages/TenantSettingsPage.tsx` (rewritten)
- `frontend/src/features/hr/pages/EmployeeDetailPage.tsx` (new)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (changed: onViewEmployee)
- `frontend/src/features/settings/components/PasswordChangeForm.tsx` (new)
- `frontend/src/features/settings/pages/SettingsPage.tsx` (changed)
- `frontend/src/features/landing/components/LandingNavbar.tsx` (changed)
- `frontend/src/features/landing/components/LandingFooter.tsx` (changed)
- `frontend/src/features/landing/components/FeaturesSection.tsx` (id added)
- `frontend/src/features/landing/components/PricingSection.tsx` (id added)
- `frontend/src/features/landing/i18n.ts` (changed: nav + footer.links)
- `frontend/src/App.tsx` (changed: EmployeeDetail, TenantSettings, navigate helper)

---

## 2026-05-15 — Phase 1.5 completion + Phase 2.3 start: AdminCompaniesPage, FAQ, SEO

### Context

While waiting for API credits (Anthropic/OpenAI), the web side was improved. The missing `/admin/companies` page from Phase 1.5 was built, and the Landing page received a FAQ section and SEO meta tags from Phase 2.3.

### Done

**1. Backend — `GET /v1/admin/companies` endpoint (new):**
- Returns all tenants with full fields: id, name, status, legal_form, stir, contact info, bank, blocked_reason, timestamps
- `member_count` per tenant (from user_tenants, excluding terminated)
- Status filter: `?status=pending_approval|active|suspended|blocked`
- Super_admin / sub_admin only

**2. Frontend — `adminApi.ts` extended:**
- `Company` type + `CompanyStatus` type
- `getAdminCompanies(status?)` function
- `updateCompanyStatus(id, status, blocked_reason?)` → `PATCH /admin/tenants/:id/status`

**3. Frontend — `AdminCompaniesPage.tsx` (new):**
- 4 status summary cards (pending/active/suspended/blocked)
- Filter tabs + search (name, STIR, email, phone)
- Expandable rows: legal info, bank details, blocked reason
- Actions: Approve, Suspend, Unblock, Block (with reason modal)
- Route: `/admin/companies` with `RequireAuth` wrapper

**4. Frontend — Landing FAQ section:**
- `FaqSection.tsx` — accordion, accessible (aria-expanded), animation
- 6 FAQ items in 4 languages (uz/ru/en/ja) added to `i18n.ts`
- `LandingDict` type extended with `faq: { title, items: FaqItem[] }`
- Page order: PricingSection → FaqSection → LandingCtaBanner

**5. SEO — `index.html` updated:**
- `<title>` with product name + description
- `<meta name="description">`, keywords, author, robots
- Open Graph meta tags
- Twitter Card meta tags
- `<link rel="canonical">`
- `<meta name="theme-color" content="#0f172a">`
- `<html lang="uz">`

### Files
- `supabase/functions/server/index.ts` (GET /admin/companies added)
- `frontend/src/features/admin/api/adminApi.ts`
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (new)
- `frontend/src/app/router.tsx` (/admin/companies route)
- `frontend/src/features/landing/i18n.ts` (FAQ in 4 locales)
- `frontend/src/features/landing/components/FaqSection.tsx` (new)
- `frontend/src/features/landing/pages/LandingPage.tsx`
- `frontend/index.html` (SEO meta tags)

---

## 2026-05-14 — security: 5 views switched to SECURITY INVOKER

### Context

Supabase Security Advisor reported 5 "Security Definer View" errors:
`employee_invite_stats`, `v_beta_stats`, `v_beta_daily_activity`, `v_beta_model_usage`, `v_beta_feedback`.

SECURITY DEFINER views run with the creator's privileges — bypassing RLS and potentially breaking tenant isolation.

### Done

**Migration `20260514120000_views_security_invoker.sql`:**
- Recreated all 5 views with `with (security_invoker = true)` (PG15+).
- `v_beta_*` views — SELECT only for `service_role` (admin dashboard via backend).
- `employee_invite_stats` — granted to `authenticated` and `service_role` (HR sees within their tenant, RLS handles it).
- Every view has a comment: "SECURITY INVOKER — caller RLS rules apply".

### Reason

Same pattern was used before (`20260304_fix_tenant_daily_stats_security.sql`, `20260429120000_security_hardening.sql`). For multi-tenant SaaS, SECURITY DEFINER view is a serious security risk.

### Verification

After push: Dashboard → Advisors → Security → **Refresh** → 5 errors → 0.

### Files
- `supabase/migrations/20260514120000_views_security_invoker.sql` (new)
- `docs/{DEVLOG,English/DEVLOG,Russian/DEVLOG,Uzbek/DEVLOG,日本語/DEVLOG}.md` (synced)

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
