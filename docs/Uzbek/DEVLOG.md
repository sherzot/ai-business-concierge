# Development Log — AI Business Concierge

Loyiha rivojlanishi, qilingan ishlar, duch kelgan xatolar va ularning yechimlari.

> **Tarjimalar (sinxron yangilanadi):** [O'zbekcha (asosiy)](../DEVLOG.md) · [English](../English/DEVLOG.md) · [Russian](../Russian/DEVLOG.md) · [日本語](../日本語/DEVLOG.md)

## 2026-05-27 — #3 Framer-motion micro-animatsiyalar

### Bajarildi
- `shared/lib/motionVariants.ts` yaratildi: staggerContainer, staggerItem, cardHover, fadeInUp
- DashboardPage: KPI grid stagger + KpiCard hover (scale + indigo shadow)
- EmployeesPage: `<motion.tbody>` + `<motion.tr>` stagger (55ms)
- AdminCompaniesPage: kartochkalar stagger + border hover indigo

### Fayllar
- `frontend/src/shared/lib/motionVariants.ts` (yangi)
- DashboardPage, EmployeesPage, AdminCompaniesPage (o'zgargan)

## 2026-05-27 — #2 CommandPalette: ⌘K global modal qidiruv

### Bajarildi
- `CommandPalette.tsx` yaratildi: framer-motion modal, fuzzy search, group sections
- 13 page + 1 action + xodimlar (lazy load)
- Keyboard: ArrowUp/Down, Enter, Escape
- App.tsx: `paletteOpen` state, ⌘K toggle, search input → click-to-open button

### Fayllar
- `frontend/src/shared/components/CommandPalette.tsx` (yangi)
- `frontend/src/App.tsx` (o'zgargan)

## 2026-05-27 — B-005 + B-006 + B-011: DB indekslar, audit triggers, structured logging

### Bajarildi
- `tasks`, `inbox_items`, `documents` ga `deleted_at` ustun qo'shildi (soft-delete)
- 9 ta composite/partial indeks yaratildi (B-005)
- `fn_audit_log_change()` trigger funksiyasi: INSERT/UPDATE/DELETE → audit_logs (B-006)
- Hono structured JSON logging middleware: trace_id, duration_ms, slow_query flag (B-011)
- Migration: `20260527000000_b005_b006_optimization.sql` — Supabase ga apply qilindi

### Fayllar
- `supabase/migrations/20260527000000_b005_b006_optimization.sql` (yangi)
- `supabase/functions/server/index.ts` (o'zgargan)
>
> **Protokol (CLAUDE.md §...):** Har bir o'zgarish bu faylga va 4 til tarjimaga yoziladi.

---

## 2026-05-27 — UI/UX #10: Onboarding tooltips

### Bajarildi

- OnboardingTour: TourProvider + useTour hook + TourOverlay (tashqi kutubxonasiz)
- Spotlight, progress bar, keyboard nav, 4 qadam tur

### Fayllar

- `OnboardingTour.tsx` (yangi), `AppProviders.tsx`, `App.tsx` (o'zgargan)

---

## 2026-05-27 — UI/UX #9: Klaviatura shortcutlar

### Bajarildi

- ⌘K: qidiruv ga focus; ⌘N: xodim qo'shish sahifasi; placeholder hint

### Fayllar

- `frontend/src/App.tsx` (o'zgargan)

---

## 2026-05-27 — UI/UX #8: Jadval paginatsiyasi

### Bajarildi

- `Pagination` component + `paginateArray` helper (yangi)
- EmployeesPage (20 ta/sahifa), AdminCompaniesPage (15 ta/sahifa)

### Fayllar

- `frontend/src/shared/components/Pagination.tsx` (yangi)
- `EmployeesPage.tsx`, `AdminCompaniesPage.tsx` (o'zgargan)

---

## 2026-05-27 — UI/UX #7: Dark/Light mode toggle

### Bajarildi

- `useTheme` hook + `ThemeToggle` component (Sun/Moon), localStorage, OS fallback
- App.tsx va AdminLayout topbar larga qo'shildi

### Fayllar

- `frontend/src/shared/hooks/useTheme.ts`, `ThemeToggle.tsx` (yangi)
- `App.tsx`, `AdminLayout.tsx` (o'zgargan)

---

## 2026-05-27 — UI/UX #6: Employee onboarding step wizard

### Bajarildi

- AddEmployeePage: 3 qadam wizard (mode tanlash, ma'lumot, muvaffaqiyat)
- StepIndicator: numbered circles, connector chiziqlar

### Fayllar

- `frontend/src/features/hr/pages/AddEmployeePage.tsx` (to'liq qayta yozildi)

---

## 2026-05-27 — UI/UX #5: Notifications UI polish

### Bajarildi

- Badge: animate-ping ring, mark all as read tugma, BellOff empty state, tur emoji ikonkasi, o'qilmagan nuqta

### Fayllar

- `frontend/src/features/notifications/components/NotificationsDropdown.tsx` (to'liq qayta yozildi)

---

## 2026-05-27 — UI/UX #4: Mobile responsive tekshiruv (3 sahifa)

### Bajarildi

- Header larda `flex-wrap` — kichik ekranda to'g'ri ko'rinish
- EmployeeDetailPage: loading skeleton, error state ikonkasi

### Fayllar

- `AdminCompaniesPage.tsx`, `AdminContactsPage.tsx`, `EmployeeDetailPage.tsx` (o'zgargan)

---

## 2026-05-27 — UI/UX #3: Skeleton loaderlar + Empty states (4 sahifa)

### Bajarildi

- AdminCompaniesPage, AdminContactsPage: spinner → karta skeleton, empty state → ikonka + xabar
- AdminHealthPage: matn → to'liq skeleton (header + banner + 4 karta)
- EmployeesPage: matn → jadval skeleton, empty state → UserPlus ikonka

### Fayllar

- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx`, `AdminContactsPage.tsx`, `AdminHealthPage.tsx` (o'zgargan)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (o'zgargan)

---

## 2026-05-27 — UI/UX #1-2: AdminLayout sidebar + AdminDashboard SVG grafiklari

### Bajarildi

- AdminLayout: icon-only (w-16) ↔ kengaytirilgan (w-56), mobile drawer, tooltip, aktiv chiziq, badge
- AdminDashboard: DonutChart, MiniBarChart, LatencyGauge — sof SVG, tashqi kutubxonasiz
- StatCard: trend ko'rsatkich, skeleton loaderlar, 30s auto-refresh

### Fayllar

- `frontend/src/features/admin/components/AdminLayout.tsx` (to'liq qayta yozildi)
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (to'liq qayta yozildi)

---

## 2026-05-27 — Vazifa 4: B-001 Unit testlar (inbox)

### Bajarildi

- `inboxApi.test.ts` (6 test): is_read normalizatsiya, tenantId, xato
- `useInbox.test.ts` (7 test): filter all/HR/Sales, tenant izolyatsiya, xato holati
- Jami: 76 → 89 test, hammasi o'tdi

### Fayllar

- `frontend/src/features/inbox/__tests__/inboxApi.test.ts` (yangi)
- `frontend/src/features/inbox/__tests__/useInbox.test.ts` (yangi)

---

## 2026-05-27 — Vazifa 3: B-007 Prompt injection himoya

### Bajarildi

- `services/ai-safety.ts` yangi fayl: 25 ta injection pattern (EN/RU/UZ/JA), HTML strip, 16k belgi limit, 10 xabar/daqiqa rate limit
- `wrapUserMessage()` — prompt layering helper
- `/v1/ai/chat` — safety check KB va AI chaqirishdan oldin, `safeMessage` butun handlerda

### Fayllar

- `supabase/functions/server/services/ai-safety.ts` (yangi)
- `supabase/functions/server/index.ts` (o'zgargan)

---

## 2026-05-27 — Vazifa 1: ai_usage_logs wiring (billing cost tracking)

### Kontekst

API kreditlar kutilayotganda kredit talab qilmaydigan backend ishlari boshlandi.

### Bajarildi

- `insertAiUsageLog` helper funksiya — non-blocking, service_role orqali `ai_usage_logs` ga yozadi
- `/v1/ai/chat` — har AI so'rovdan keyin `insertAiUsageLog()` chaqiriladi
- `/v1/admin/ai/chat` — token tracking o'zgaruvchilari qo'shildi; admin chatda tenant yo'qligi sababli `ai_usage_logs` ga yozilmaydi, faqat `console.info()`
- `/v1/docs/search` allaqachon mavjud (ILIKE bilan); `match_documents()` kredit kelgach ulanadi

### Fayllar

- `supabase/functions/server/index.ts` (o'zgargan)

---

## 2026-05-15 — Web takomillashtirish (tugallandi): 8 ta UI/UX o'zgarish

### Bajarildi

1. ProfileForm — real auth ma'lumotlariga ulandi (`useUserSettings` qayta yozildi)
2. EmployeeDetailPage — edit mode qo'shildi (23 maydon, 5 bo'lim)
3. Unit testlar: 76 test, hammasi o'tdi (3 yangi to'plam + LandingPage tuzatildi)
4. EmployeesPage — status filter + qidiruv + bloklash/yechish
5. Docs — 15 ta shablon kutubxonasi ("tez orada" badge)
6. Admin dashboard — 30s auto-refresh + sidebar badge
7. Reports — AI audit disabled ("tez orada")
8. Notifications sahifasi — to'liq tarix, filter, "Barchasini ko'rish" link

### Fayllar (asosiy)

- `NotificationsPage.tsx` (yangi), `NotificationsDropdown.tsx` (o'zgargan), `App.tsx` (o'zgargan)
- 3 yangi test fayl, `TemplatesLibrary.tsx`, `AdminLayout.tsx`, `AdminDashboardPage.tsx`

---

## 2026-05-15 — Web takomillashtirish (davom): TenantSettings, EmployeeDetail, Parol, Landing

### Kontekst

6 ta web takomillashtirish ro'yxatining 3-6 bandlari amalga oshirildi.

### Bajarildi

- TenantSettingsPage to'liq yozildi + backend (GET/PATCH profile)
- EmployeeDetailPage yangi: user_tenant + employee_profiles JOIN
- PasswordChangeForm: `supabase.auth.updateUser` orqali
- Landing navbar: features/pricing/faq anchor havolalar (smooth scroll)
- Landing footer: navigatsiya havolalar qatori
- FeaturesSection `id="features"`, PricingSection `id="pricing"`
- i18n 4 ta lokalizatsiya yangilandi (nav + footer.links)

### Fayllar

- `supabase/functions/server/index.ts`, `frontend/src/features/tenants/pages/TenantSettingsPage.tsx`
- `frontend/src/features/hr/pages/EmployeeDetailPage.tsx` (yangi)
- `frontend/src/features/settings/components/PasswordChangeForm.tsx` (yangi)
- `frontend/src/features/landing/components/LandingNavbar.tsx`, `LandingFooter.tsx`
- `frontend/src/features/landing/i18n.ts`, `frontend/src/App.tsx`

---

## 2026-05-15 — Phase 1.5 tugallash + Phase 2.3: AdminCompaniesPage, FAQ, SEO

### Bajarildi

- Backend: `GET /v1/admin/companies` (yangi endpoint, super_admin/sub_admin)
- `adminApi.ts`: `Company` type, `getAdminCompanies`, `updateCompanyStatus`
- `AdminCompaniesPage.tsx` (yangi): status kartalar, filter, qidiruv, expand, amallar, bloklash modal
- Router: `/admin/companies` route qo'shildi
- `FaqSection.tsx` (yangi): 6 savol-javob, accordion, 4 tilda
- `i18n.ts`: `faq` bo'limi 4 tilda qo'shildi
- `LandingPage.tsx`: FaqSection PricingSection dan keyin
- `index.html`: SEO meta tags, OG, Twitter Card, canonical

### Fayllar
- `supabase/functions/server/index.ts`, `frontend/src/features/admin/*`, `frontend/src/features/landing/*`, `frontend/index.html`

---

## 2026-05-14 — security: 5 view SECURITY INVOKER ga o'tkazildi

### Kontekst

Supabase Security Advisor 5 ta "Security Definer View" xatosi: `employee_invite_stats`, `v_beta_stats`, `v_beta_daily_activity`, `v_beta_model_usage`, `v_beta_feedback`.

SECURITY DEFINER view yaratuvchi nuqtai nazaridan ishlaydi — RLS ni chetlab o'tishi mumkin.

### Bajarildi

**Migration `20260514120000_views_security_invoker.sql`:** 5 ta view qaytadan yaratildi `with (security_invoker = true)`. `v_beta_*` — `service_role` uchun. `employee_invite_stats` — `authenticated` + `service_role`.

### Tasdiq

Dashboard → Advisors → Security → Refresh → 0 errors.

### Fayllar
- `supabase/migrations/20260514120000_views_security_invoker.sql`
- 5 ta DEVLOG sinxron yangilandi

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
