# Development Log — AI Business Concierge

Loyiha rivojlanishi, qilingan ishlar, duch kelgan xatolar va ularning yechimlari.

> **Tarjimalar (sinxron yangilanadi):** [English](English/DEVLOG.md) · [Russian](Russian/DEVLOG.md) · [Uzbek](Uzbek/DEVLOG.md) · [日本語](日本語/DEVLOG.md)
>
> **Protokol (CLAUDE.md §...):** Har bir o'zgarish bu faylga va 4 til tarjimaga yoziladi.

---

## 2026-05-15 — Web takomillashtirish (tugallandi): 8 ta muhim UI/UX o'zgarish

### Kontekst

API kreditlar kutilayotganda 8 ta web takomillashtirish ro'yxatini tartib bilan bajardik.

### Bajarildi

**1. ProfileForm — real ma'lumotlarga ulandi:**
- `useUserSettings` hook qayta yozildi — AuthContext dan real `fullName` va `email` o'qiydi
- `PATCH /v1/settings/profile` backend endpoint yaratildi (full_name, phone)
- `refetchProfile()` save'dan keyin chaqiriladi — sidebar darhol yangilanadi

**2. EmployeeDetailPage — edit mode qo'shildi:**
- Barcha 23 ta employee_profiles maydoni forma sifatida ko'rsatiladi
- 5 bo'lim: Shaxsiy, Mehnat, Aloqa, Favqulodda, Izohlar
- `PATCH /v1/tenants/:id/members/:userId/profile` — HR xodimni upsert qiladi

**3. Unit testlar (B-001):**
- 9 test: `adminApi.test.ts` — getAdminCompanies, updateCompanyStatus, getAdminHealth
- 12 test: `settingsDomain.test.ts` — validatePassword, validateFullName
- 7 test: `useUserSettings.test.ts` — real ma'lumot, snake_case body, refetchProfile
- LandingPage.test.tsx tuzatildi: I18nProvider wrapper qo'shildi
- Jami: 76 test, hammasi o'tdi

**4. EmployeesPage — filter + qidiruv + bloklash:**
- Status filter chips: all/active/password_pending/password_set/blocked
- Qidiruv maydoni (isim/email bo'yicha)
- Block/Unblock tugmalar har bir qatorda
- `PATCH /v1/tenants/:id/members/:userId/status` backend endpoint

**5. Docs sahifasi — shablonlar kutubxonasi:**
- 15 ta shablon (shartnomalar, arizalar, buyruqlar)
- Kategoriya filter + qidiruv
- "tez orada" badge — AI kreditlar kutilmoqda

**6. Admin dashboard — 30s auto-refresh + sidebar badge:**
- `setInterval(30_000)` — AdminDashboardPage avtomatik yangilanadi
- Sidebar "Murojaatlar" navida qizil badge (yangi murojaatlar soni)

**7. Reports sahifasi — AI audit o'chirildi:**
- "AI Audit" tugmasi disabled holatga o'tkazildi — "tez orada" label

**8. Notifications sahifasi — to'liq bildirishnomalar tarixi:**
- `NotificationsPage.tsx` — filter (all/unread/read), bulk mark-read
- `NotificationsDropdown` ga "Barchasini ko'rish" link qo'shildi (`onViewAll` prop)
- App.tsx da `case "notifications"` ulandi

### Fayllar

- `supabase/functions/server/index.ts` (o'zgargan — 4 yangi endpoint)
- `frontend/src/features/settings/hooks/useUserSettings.ts` (qayta yozildi)
- `frontend/src/features/settings/components/ProfileForm.tsx` (qayta yozildi)
- `frontend/src/features/hr/pages/EmployeeDetailPage.tsx` (qayta yozildi)
- `frontend/src/features/hr/api/employeesApi.ts` (o'zgargan)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (o'zgargan)
- `frontend/src/features/admin/__tests__/adminApi.test.ts` (yangi)
- `frontend/src/features/settings/__tests__/settingsDomain.test.ts` (yangi)
- `frontend/src/features/settings/__tests__/useUserSettings.test.ts` (yangi)
- `frontend/src/features/landing/__tests__/LandingPage.test.tsx` (tuzatildi)
- `frontend/src/features/docs/components/TemplatesLibrary.tsx` (yangi)
- `frontend/src/features/docs/pages/DocsPage.tsx` (qayta yozildi)
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (o'zgargan)
- `frontend/src/features/admin/components/AdminLayout.tsx` (o'zgargan)
- `frontend/src/features/reports/pages/ReportsPage.tsx` (o'zgargan)
- `frontend/src/features/notifications/pages/NotificationsPage.tsx` (yangi)
- `frontend/src/features/notifications/components/NotificationsDropdown.tsx` (o'zgargan)
- `frontend/src/App.tsx` (o'zgargan)

---

## 2026-05-15 — Web takomillashtirish (davom): TenantSettings, EmployeeDetail, Parol, Landing nav/footer

### Kontekst

API kreditlar kutilayotganda web qismini davom ettirish — 6 ta web takomillashtirish ro'yxatining 3-6 bandlari.

### Bajarildi

**3. TenantSettingsPage (to'liq qayta yozildi):**
- `GET /v1/tenants/:id/profile` va `PATCH /v1/tenants/:id/profile` backendi
- Form: name, legal_form, stir, employee_count_range, activity_type, reg_date, legal_address, website, description, contact_phone, contact_email, bank_name, bank_account
- Stub `<div>Tenant settings</div>` o'rnini oldi

**4. EmployeeDetailPage (yangi):**
- `GET /v1/tenants/:id/members/:userId` endpoint — user_tenant + employee_profiles JOIN
- `EmployeeDetailPage` komponenti: 5 bo'lim (Shaxsiy, Mehnat, Aloqa, Favqulodda, Izohlar)
- EmployeesPage ga `onViewEmployee` callback qo'shildi
- App.tsx ga `selectedEmployeeId` state va "Kompaniya profili" nav elementi qo'shildi

**5. PasswordChangeForm (yangi):**
- `supabase.auth.updateUser({ password })` orqali parol o'zgartirish
- Eye/EyeOff toggle, validatsiya (min 8 belgi, mos kelishi), success/error holatlari
- SettingsPage ga qo'shildi

**6. Landing nav + footer (yangilab):**
- LandingNavbar: `features`, `pricing`, `faq` anchor link label qo'shildi; markdown hamburgersiz chiroyli anchor nav (md+ da ko'rinadi); smooth scroll
- LandingFooter: navigatsiya havolalar qatori (Funksiyalar, Narxlar, Savollar, Murojaat) qo'shildi
- FeaturesSection ga `id="features"`, PricingSection ga `id="pricing"` qo'shildi
- i18n 4 ta lokalizatsiya yangilandi: nav (features/pricing/faq), footer.links (4 ta link)

### Fayllar

- `supabase/functions/server/index.ts` (o'zgargan: yangi endpointlar)
- `frontend/src/features/tenants/pages/TenantSettingsPage.tsx` (qayta yozildi)
- `frontend/src/features/hr/pages/EmployeeDetailPage.tsx` (yangi)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (o'zgargan: onViewEmployee)
- `frontend/src/features/settings/components/PasswordChangeForm.tsx` (yangi)
- `frontend/src/features/settings/pages/SettingsPage.tsx` (o'zgargan)
- `frontend/src/features/landing/components/LandingNavbar.tsx` (o'zgargan)
- `frontend/src/features/landing/components/LandingFooter.tsx` (o'zgargan)
- `frontend/src/features/landing/components/FeaturesSection.tsx` (id qo'shildi)
- `frontend/src/features/landing/components/PricingSection.tsx` (id qo'shildi)
- `frontend/src/features/landing/i18n.ts` (o'zgargan: nav + footer.links)
- `frontend/src/App.tsx` (o'zgargan: EmployeeDetail, TenantSettings, navigate helper)

---

## 2026-05-15 — Phase 1.5 tugallash + Phase 2.3 boshlash: AdminCompaniesPage, FAQ, SEO

### Kontekst

API kreditlar (Anthropic/OpenAI) kutilayotgan paytda web qismi takomillashtirildi. Phase 1.5 da yetishmayotgan `/admin/companies` sahifasi yaratildi, Phase 2.3 dan Landing page ga FAQ bo'limi va SEO meta tags qo'shildi.

### Bajarildi

**1. Backend — `GET /v1/admin/companies` endpoint (yangi):**
- `tenants` jadvalidan barcha maydonlar: id, name, status, legal_form, stir, legal_address, activity_type, contact_phone, contact_email, website, employee_count_range, bank_name, bank_account, blocked_reason, blocked_at, approved_at, created_at
- Har tenant uchun `member_count` (user_tenants dan, terminated emas)
- Status filtrlash: `?status=pending_approval|active|suspended|blocked`
- Faqat super_admin / sub_admin uchun

**2. Frontend — `adminApi.ts` kengaytirildi:**
- `Company` type (barcha tenant maydonlari + member_count)
- `CompanyStatus` type
- `getAdminCompanies(status?)` funksiyasi
- `updateCompanyStatus(id, status, blocked_reason?)` funksiyasi → `PATCH /admin/tenants/:id/status` ga yuboradi

**3. Frontend — `AdminCompaniesPage.tsx` (yangi):**
- 4 ta status summary karta (pending/active/suspended/blocked)
- Filter tabs + qidiruv (nom, STIR, email, telefon)
- Kengaytiriladigan qatorlar: yuridik ma'lumotlar, bank, bloklash sababi
- Amallar: Tasdiqlash, To'xtatish, Blokdan chiqarish, Bloklash (sabab modal bilan)
- Route: `/admin/companies` → `RequireAuth` wrapper

**4. Frontend — Landing FAQ bo'limi:**
- `FaqSection.tsx` — accordion, accessible (aria-expanded), animatsiya
- 6 ta savol-javob 4 tilda (uz/ru/en/ja) `i18n.ts` ga qo'shildi
- `LandingDict` tipiga `faq: { title, items: FaqItem[] }` qo'shildi
- `LandingPage.tsx` da PricingSection → FaqSection → LandingCtaBanner tartibida

**5. SEO — `index.html` yangilandi:**
- `<title>` o'zgartirildi (mahsulot nomi + tavsif)
- `<meta name="description">`, keywords, author, robots
- Open Graph meta tags (og:title, og:description, og:type, og:locale)
- Twitter Card meta tags
- `<link rel="canonical">`
- `<meta name="theme-color" content="#0f172a">`
- `<html lang="uz">` qo'shildi

### PLAN.md holati yangilanishi

- B-019: Company registration flow → **DONE** (AdminCompaniesPage qo'shildi, Phase 1.5 tugallandi)
- Phase 2.3 Landing page: **BOSHLANDI** (FAQ + SEO done; qoldi: hujjat generatsiya kredit kerak)

### Fayllar
- `supabase/functions/server/index.ts` (GET /admin/companies qo'shildi)
- `frontend/src/features/admin/api/adminApi.ts` (Company type + getAdminCompanies + updateCompanyStatus)
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (yangi)
- `frontend/src/app/router.tsx` (/admin/companies route qo'shildi)
- `frontend/src/features/landing/i18n.ts` (FaqItem type + faq 4 tilda)
- `frontend/src/features/landing/components/FaqSection.tsx` (yangi)
- `frontend/src/features/landing/pages/LandingPage.tsx` (FaqSection import + render)
- `frontend/index.html` (SEO meta tags)
- `docs/{DEVLOG,English/DEVLOG,Russian/DEVLOG,Uzbek/DEVLOG,日本語/DEVLOG}.md` (sinxron)

---

## 2026-05-14 — security: 5 view SECURITY INVOKER ga o'tkazildi

### Kontekst

Supabase Security Advisor 5 ta "Security Definer View" xatosini ko'rsatdi:
`employee_invite_stats`, `v_beta_stats`, `v_beta_daily_activity`, `v_beta_model_usage`, `v_beta_feedback`.

SECURITY DEFINER view yaratuvchi nuqtai nazaridan ishlaydi — RLS ni chetlab o'tishi va tenant izolyatsiyasini buzishi mumkin.

### Bajarildi

**Migration `20260514120000_views_security_invoker.sql`:**
- 5 ta view qaytadan yaratildi `with (security_invoker = true)` (PG15+)
- `v_beta_*` views — faqat `service_role` uchun SELECT (admin dashboard backend orqali)
- `employee_invite_stats` — `authenticated` va `service_role` uchun (HR tenant ichida ko'radi, RLS o'zi cheklaydi)
- Comment har birida: "SECURITY INVOKER — caller RLS qoidalariga rioya qiladi"

### Sabab

Bu pattern avval qo'llanilgan (`20260304_fix_tenant_daily_stats_security.sql`, `20260429120000_security_hardening.sql`). Multi-tenant SaaS uchun SECURITY DEFINER view jiddiy xavfsizlik risk.

### Tasdiq

Push'dan keyin: Dashboard → Advisors → Security → **Refresh** → 5 errors → 0.

### Fayllar
- `supabase/migrations/20260514120000_views_security_invoker.sql` (yangi)
- `docs/{DEVLOG,English/DEVLOG,Russian/DEVLOG,Uzbek/DEVLOG,日本語/DEVLOG}.md` (sinxron)

---

## 2026-05-14 — Scale fundament: AI cost tracking + doc_chunks RAG + R-016..R-020

### Kontekst

`docs/ai-business-concierge-scale-prompt.md` (2026-05-11) talablari bo'yicha "darhol" qilinishi kerak bo'lganlari amalga oshirildi. Phase 1.5 holatini tekshirish va etib bormagan urgent ishlarni yopish.

### Bajarildi

**1. DB migration `20260514000000_ai_usage_and_doc_vector.sql`:**
- `ai_usage_logs` jadvali — har AI chaqiruv: tenant, user, endpoint, model, provider, complexity, prompt/completion tokens, cost_usd, cached, latency, trace_id. Generated column `total_tokens`. 3 ta index. RLS bilan tenant izolyatsiya + super_admin/sub_admin barchasini ko'radi
- `v_ai_usage_summary` view — kunlik tenant agregat (Admin dashboard uchun)
- `doc_chunks.embedding vector(1536)` ustun — pgvector RAG uchun
- `doc_chunks_embedding_idx` HNSW index (m=16, ef_construction=64)
- `match_documents(query_embedding, threshold, count, tenant_id)` funksiyasi — RAG search, security definer, search_path locked, faqat authenticated/service_role uchun execute
- `doc_chunks` uchun document_id va tenant_id indekslari

**2. REQUIREMENTS.md yangilandi:**
- R-016 HR Candidate Analysis (skeleton mavjud, full impl Phase 2'da)
- R-017 AI Rate Limiting (qisman done — in-memory `contactRateMap` + Telegram daily limit)
- R-018 AI Cost Tracking (migration done — backend wiring keyingi sessiyada `/v1/ai/chat` endpoint'dan)
- R-019 Vector Search RAG (migration done — backend integration keyingi sessiyada)
- R-020 Admin Dashboard (super_admin/sub_admin uchun health, contacts, AI chat — Phase 4'da to'liq monitoring)

**3. Hozirgi holat tekshirildi:**
- Phase 1.5 5 ta migration applied: contact_requests, tenant_company_info, roles_update (sub_admin/company_admin/accountant/manager qo'shildi), employee_profiles, employee_invites
- Backend admin endpoints mavjud: `/admin/contacts`, `/admin/health`, `/admin/ai/chat`, `/admin/contacts/:id/status`, `/admin/tenants/:id/status`
- Frontend admin pages real impl: `AdminContactsPage`, `AdminHealthPage`, `AdminAIChatPage` + `adminApi.ts`
- docs/ tuzilishi to'g'ri: `English/`, `Russian/`, `Uzbek/`, `日本語/` har birida DEVLOG.md + boshqa tarjimalar

### Defer qilingan (kelajak)

- Prompt caching middleware (`scale-prompt` Vazifa 1.2) — Phase 1.5 yakuni
- HR Candidate Analysis full impl — Phase 2 (PLAN.md v3.0 bo'yicha)
- Backend wiring: `/v1/ai/chat` endpoint'da `ai_usage_logs` ga INSERT — keyingi sessiya (services/llm-router.ts dan token usage olish)
- `match_documents()` ni `POST /v1/docs/search` endpoint'iga ulash — keyingi sessiya
- Full admin debug/log UI (real-time Sentry, query EXPLAIN) — Phase 4

### Fayllar
- `supabase/migrations/20260514000000_ai_usage_and_doc_vector.sql` (yangi)
- `docs/REQUIREMENTS.md` (R-016..R-020 qo'shildi)
- `docs/DEVLOG.md` (bu entry)
- `docs/{English,Russian,Uzbek,日本語}/DEVLOG.md` (sinxron tarjima)

### Sabab — nima uchun shu vazifalar darhol

`ai_usage_logs` bo'lmasa billing (Phase 2) ishlay olmaydi — har AI chaqiruv qaysi tenantga tegishli ekanligini bilmasak, cost share qila olmaymiz. `match_documents()` bo'lmasa AI Concierge "Hujjatlarim ichidan top" tool'i `ILIKE` ishlatadi — natija sifati past.

---

## 2026-05-06 — Phase 1.5 (4): B-027/B-028/B-029

### Qilingan o'zgarishlar

**B-027 — In-app Notifications for HR (Realtime):**
- `createHrSetupCompleteNotification` — xodim setup tugaganda HR/leader larga bildirishnoma yuboradi
- `createEmployeeConfirmedNotification` — HR xodimni tasdiqlaganda xodimga bildirishnoma
- `useRealtimeNotifications` hook — Supabase realtime orqali `notifications` jadvalga subscribe
- `NotificationsDropdown` — `userId` prop qabul qiladi, yangi bildirishnoma kelganda avtomatik yangilanadi (polling emas)

**B-028 — /admin/health (System Monitoring):**
- Backend: `GET /admin/health` — super_admin only; DB latency + tenants/users/contacts/notifications statistikasi
- Frontend: `AdminHealthPage` — stat cards, DB latency banner (green/amber), refresh button; route: `/admin/health`

**B-029 — /admin/ai-chat (Admin AI Chat):**
- Backend: `POST /admin/ai/chat` — super_admin only; Claude + OpenAI fallback; live platform stats as context
- Frontend: `AdminAIChatPage` — chat UI, typing indicator, suggestion chips, locale-aware; route: `/admin/ai-chat`
- `adminApi.ts` — `getAdminHealth()` + `sendAdminAIMessage()` API helpers

---

## 2026-05-06 — Phase 1.5 (3): B-026 Email Templates (7 ta)

### Qilingan o'zgarishlar

**Backend — 7 ta email template (Resend API, dark indigo theme):**
1. `company_invite` — mavjud (admin contact → invite_sent)
2. `company_registered_pending` — POST /register/company → leader emailiga "Admin tasdiqlashini kuting"
3. `company_rejected` — PATCH /admin/contacts/:id/status → status=rejected → contact emailiga
4. `company_approved` — yangi PATCH /admin/tenants/:id/status → status=active → leader emailiga
5. `employee_invite` — POST /members → mode=invite → xodimga branded email (Supabase ga qo'shimcha)
6. `employee_welcome` — POST /auth/setup-complete → "Xush kelibsiz, akkauntingiz tayyor"
7. `admin_new_registration` — POST /register/company → ADMIN_NOTIFY_EMAIL ga bildirishnoma

**Yangi env var:** `ADMIN_NOTIFY_EMAIL` — yangi company ro'yxatdan o'tganda admin xabardor bo'lishi uchun

**Yangi endpoint:** `PATCH /admin/tenants/:id/status` — super_admin/sub_admin kompaniyani active/suspended/blocked qila oladi; tasdiqlanganda company_approved email ketadi

**Arxitektura:**
- `sendResendEmail(to, subject, html, tag)` — generic Resend wrapper
- `emailLayout(content)` + `emailBtn(href, label)` — reusable HTML builder helpers
- Barcha email sendlar non-blocking (await qilinmaydi — asosiy request sekinlamaydi)

---

## 2026-05-06 — Phase 1.5 (2): Matn Tuzatishlar + Language Selector

### Qilingan o'zgarishlar

**Matn va tarjima tuzatishlari (4 ta tilda — uz/ru/en/ja):**
- `landing/i18n.ts` — "ChatGPT bu bilmaydi." iborasi olib tashlandi — O'zbekiston qonunlari tavsifidan keraksiz taqqoslash
- `landing/i18n.ts` — "4 tilda" tavsifi to'g'irlandi: "O'zbekistondagi yapon, xitoy, turk kompaniyalari o'z tilida foydalana oladi." → "O'zbekistondagi xalqaro kompaniyalar istalgan tilda foydalana oladi." (barcha 4 tilda analogik)

**Login sahifasi — tarjima tuzatildi:**
- `app/i18n.ts` — `auth.platformSubtitle` kaliti 4 tilda qo'shildi (ilgari hardcoded o'zbek tilida edi)
- `LoginPage.tsx` — hardcoded o'zbek matni `translate("auth.platformSubtitle")` ga almashtirildi

**Til tanlash — button → selector:**
- `LandingNavbar.tsx` — button group → `<select>` dropdown ga o'zgartirildi
- `LoginPage.tsx` — button group → `<select>` dropdown ga o'zgartirildi
- `LanguageSwitcher.tsx` (Settings) — button group → `<select>` dropdown ga o'zgartirildi

---

## 2026-05-05 10:00 — Phase 1: Telegram Bot

### Qilingan ishlar

**Arxitektura (Clean Architecture / DDD):**
- `supabase/functions/telegram-bot/` — Edge Function
- `handlers/` — start, help, language, message, feedback, stats, media
- `services/` — session.ts, maslahatchi.ts
- `supabase/functions/server/services/` — llm-router.ts, knowledge-base.ts

**Bot funksionalligi:**
- 4 til: uz / ru / en / ja
- `/start` — yangi/qaytuvchi foydalanuvchi farqi
- `/help` — til bo'yicha yordam
- `/til`, `/language`, `/язык` — til o'zgartirish
- `/stats` — admin-only statistika (ADMIN_CHAT_ID env var orqali)
- Rate limit: 5 so'rov/kun (free plan)
- LLM Router: Haiku 3.5 (~80%) + Sonnet 4.6 (~20%) murakkablikka qarab
- KB semantic search: pgvector + OpenAI text-embedding-3-small

**Beta monitoring:**
- `v_beta_stats` — jami/bugungi/7kunlik foydalanuvchilar, tillar bo'yicha
- `v_beta_daily_activity` — kunlik so'rovlar, narx, latency
- `v_beta_feedback` — 👍/👎 statistika
- `v_beta_model_usage` — model bo'yicha ishlatilish va narx

---

## 2026-05-05 14:00 — Deployment: Xatolar va Yechimlar

### ❌ 401 Unauthorized (Webhook)
**Sabab:** Supabase JWT verification webhook so'rovlarini bloklagan.
**Yechim:** `supabase/config.toml` ga qo'shildi:
```toml
[functions.telegram-bot]
verify_jwt = false
```
Deploy: `supabase functions deploy telegram-bot --no-verify-jwt`

---

### ❌ curl: Malformed URL
**Sabab:** Copy-paste da smart quotes (`"`) oddiy qo'shtirnoq o'rniga kirib qolgan.
**Yechim:** GET format bilan yozildi, JSON body ishlatilmadi.

---

### ❌ TELEGRAM_WEBHOOK_SECRET not found
**Sabab:** Secret hech qachon set qilinmagan, lekin kod tekshirgan.
**Yechim:** Secret olib tashlandi — webhook auth shart emas.

---

### ❌ getMe 404: Not Found
**Sabab:** Supabase da saqlangan TELEGRAM_BOT_TOKEN noto'g'ri/boshqa token edi.
**Yechim:** `supabase secrets set TELEGRAM_BOT_TOKEN="..."` bilan to'g'ri token qayta set qilindi.

---

### ❌ CLAUDE_ERROR:400 credit balance too low
**Sabab:** Anthropic API krediti yo'q.
**Holat:** Foydalanuvchi kredit qo'shishi kerak ($5+). Bot javob bera olmaydi.

---

### ❌ OpenAI 429 insufficient_quota
**Sabab:** KB seed skripti OpenAI embedding API ga murojaat qildi, kvota yo'q.
**Holat:** Anthropic bilan birga hal qilinadi. `scripts/seed_kb.ts` tayyor (53 ta yozuv).

---

### ❌ /stats ishlamadi
**Sabab:** `ADMIN_CHAT_ID` secret set qilinmagan.
**Yechim:** `supabase secrets set ADMIN_CHAT_ID="6132360728"`

---

### ❌ BotFather menyusi faqat yapon tilida
**Sabab:** Til-specific komandalar set qilingan, foydalanuvchi Telegram ilovasi yapon tilida.
**Yechim:** Default (til ko'rsatilmagan) komandalar set qilindi — hammaga ko'rinadi.

---

## 2026-05-06 10:00 — Bot UX Yaxshilashlar

### Qilingan o'zgarishlar

**1. Matn bo'lmagan xabarlar (`handlers/media.ts` — yangi fayl)**
- Rasm, ovoz, fayl, sticker, video → foydalanuvchi tilida "faqat matn yuboring" xabari.

**2. Qaytuvchi foydalanuvchi `/start` (`handlers/start.ts`)**
- `session.isNew === false` → "Xush kelibsiz qayta!" til bo'yicha, keyboard ko'rsatilmaydi.
- Yangi foydalanuvchi → to'liq xush kelibsiz + til tanlash keyboard.

**3. Qolgan limit ko'rsatish (`handlers/message.ts`)**
- Har bir javob oxiriga `📊 Bugun qolgan: X/5 so'rov` qo'shildi.
- `checkRateLimit` qaytargan `{used, limit}` dan hisoblanadi.

**4. Feedback tili tuzatish (`handlers/feedback.ts`)**
- Oldin: `const lang = "uz"` hardcoded.
- Endi: `getOrCreateSession` dan real locale olinadi → 👍/👎 toast user tilida.

---

## 2026-05-06 11:30 — Til Tizimi (Locale) Tuzatishlar

### Root Cause Tahlili

Foydalanuvchi `/til` → `日本語` tanlaganda confirmation xabari yapon tilida keldi, lekin `/help` o'zbek tilida chiqdi. Sabab: **`updateLocale("ja")` DB da silent fail bo'lgan.**

### ❌ DB Check Constraint — Asosiy Xato
**Sabab:** `ai_conversations.locale` ustunida constraint:
```sql
CHECK (locale IN ('uz', 'ru', 'en'))  -- 'ja' yo'q!
```
`updateLocale("ja")` chaqirilganda DB rad etgan, lekin `LANG_SET["ja"]` hardcoded bo'lgani uchun confirmation xabari yapon tilida ko'ringan — foydalanuvchi muvaffaqiyatli o'zgartirdi deb o'ylagan.

**Yechim:** Migration `20260506000000_add_ja_locale.sql`:
```sql
ALTER TABLE ai_conversations DROP CONSTRAINT IF EXISTS ai_conversations_locale_check;
ALTER TABLE ai_conversations ADD CONSTRAINT ai_conversations_locale_check
  CHECK (locale IN ('uz', 'ru', 'en', 'ja'));
```

---

### ❌ Disclaimer faqat uz/ru — en/ja foydalanuvchilar o'zbek disclamer olgan
**Sabab:** `knowledge-base.ts` da faqat 2 ta disclaimer:
```typescript
return answer + (locale === "ru" ? DISCLAIMER_RU : DISCLAIMER_UZ);
// en → DISCLAIMER_UZ (noto'g'ri!)
// ja → DISCLAIMER_UZ (noto'g'ri!)
```
**Yechim:** 4 ta disclaimer qo'shildi, `addDisclaimerIfNeeded` kengaytirildi.

---

### ❌ `addDisclaimerIfNeeded` ga `kbLocale` berilgan
**Sabab:** `maslahatchi.ts` da `kbLocale = "ja" ? "en" : locale` — ya'ni yapon foydalanuvchisi uchun ingliz disclaimer berilgan.
**Yechim:** `locale` (to'liq TelegramLocale) berildi.

---

### ❌ `llm-router.ts` default system prompt faqat uz/ru
**Sabab:** Fallback `locale === "ru" ? RU : UZ` — en/ja uchun o'zbek system prompt.
**Yechim:** Barcha 4 til uchun default system prompt qo'shildi.

---

### ❌ `updateLocale` da error logging yo'q
**Sabab:** Silent fail — DB xatosi log ga tushmagan.
**Yechim:** `if (error) console.error(...)` qo'shildi.

---

## 2026-05-06 13:00 — Kredit Kerak Bo'ladigan Joylar (Bajarish Uchun Shart)

### Anthropic API — Claude (ANTHROPIC_API_KEY)

| Joy | Fayl | Tavsif |
|-----|------|--------|
| Telegram bot | `telegram-bot/services/maslahatchi.ts` | Har bir foydalanuvchi savoliga javob (Haiku 3.5 + Sonnet 4.6) |
| Web chat | `server/index.ts` ~1804 qator | `/ai/chat` endpoint — asosiy LLM (Claude primary) |
| HR CV Parser | `server/services/hr-candidate/cv-parser.ts` | CV matnini tahlil qilish (TODO, hali implement qilinmagan) |
| HR Scorer | `server/services/hr-candidate/candidate-scorer.ts` | Nomzodlarni baholash (TODO) |
| HR Report | `server/services/hr-candidate/report-generator.ts` | Hisobot yaratish (TODO) |

**Kredit qo'shish:** [console.anthropic.com](https://console.anthropic.com) → Billing → $10+ qo'shish tavsiya qilinadi

---

### OpenAI API (OPENAI_API_KEY)

| Joy | Fayl | Tavsif | Chastota |
|-----|------|--------|----------|
| KB Seed | `scripts/seed_kb.ts` | 53 ta KB yozuvi uchun embedding generatsiya | **Bir martalik** |
| KB Search (bot) | `server/services/knowledge-base.ts` → `getEmbedding()` | Har bir bot savolini vektorga aylantirish | Har so'rovda |
| KB Search (web) | `server/index.ts` ~1789 qator | Web chat da KB qidiruv | Har so'rovda |
| Web chat fallback | `server/index.ts` ~1860 qator | Claude ishlamasa → `gpt-4o-mini` fallback | Xatolikda |

**Muhim:** OpenAI `text-embedding-3-small` KB qidiruvda DOIM ishlatiladi — faqat seed uchun emas.
**Kredit qo'shish:** [platform.openai.com](https://platform.openai.com) → Billing → $5+ qo'shish

---

### Kredit Kelganda Bajarish Tartibi

1. **OpenAI kredit qo'shish** → `supabase secrets set OPENAI_API_KEY="..."` → `scripts/seed_kb.ts` ishga tushirish (KB to'ldirish)
2. **Anthropic kredit qo'shish** → `supabase secrets set ANTHROPIC_API_KEY="..."` → bot test qilish
3. **Bot savolga javob berishi** tekshiriladi → KB semantic search ishlayaptimi?
4. **Web chat** `/ai/chat` endpoint tekshiriladi
5. **HR module** Claude integratsiyasi (cv-parser, scorer, report-generator)

---

## 2026-05-06 13:30 — Joriy Holat

### ✅ Ishlayotganlar
- Bot webhook va deployment
- 4 til to'liq: uz/ru/en/ja (DB constraint tuzatildi)
- `/start`, `/help`, `/til`/`/language`/`/язык`, `/stats`
- Rate limit (5/kun), feedback (👍/👎), qaytuvchi user xabari
- Matn bo'lmagan xabarlar uchun javob
- Qolgan limit ko'rsatish
- Beta monitoring views + admin `/stats` komandasi

### ⏸ Bloklangan (Kredit kutilmoqda)
- Bot javoblari: Anthropic kredit ($5+) kerak
- KB seed: OpenAI kredit kerak (`scripts/seed_kb.ts` tayyor, 53 yozuv)

### 📋 Keyingi Rejalar
- Web dashboard yaxshilashlari
- Knowledge Base to'ldirish (kredit kelgach)
- Bot profil rasmi (BotFather)
- 50 beta foydalanuvchi onboarding

---

## 2026-05-06 06:50 — Phase 1.5 (1): DB Migrations + Landing Company Onboarding

### DB — 5 ta migration (Supabase ga apply qilindi ✅)

| Migration | Nima qildi |
|---|---|
| `phase15_contact_requests` | Kompaniya murojaatlari CRM jadvali + RLS (faqat admin) |
| `phase15_tenant_company_info` | `tenants` ga: status, STIR, yuridik ma'lumotlar, bank, tasdiqlash |
| `phase15_roles_update` | `user_tenants` ga: sub_admin, company_admin, accountant, manager + status/position |
| `phase15_employee_profiles` | To'liq HR ma'lumotlari jadvali (pasport, JSHSHIR, maosh, favqulodda) |
| `phase15_employee_invites` | Bir martalik invite token jadvali (24 soat TTL, resend hisobi) |

### Landing Page

- **CompanyOnboardingSection** — yangi komponent: 4 qadam kartalar + features grid + CTA
- **LandingNavbar** — "Murojaat/Contact Us" tugmasi qo'shildi (anchor link)
- **i18n** — `companyOnboarding` + `nav.contact` barcha 4 tilda: uz/ru/en/ja
- Sahifa tartibida: HowItWorks → **CompanyOnboarding** → Pricing

### Keyingi qadam (Phase 1.5 davomi)
- `/contact` sahifasi — murojaat formasi
- Backend: `POST /v1/contact` endpoint
- Admin: `/admin/contacts` — murojaat ko'rish va boshqarish

---

## 2026-05-06 06:15 — Arxitektura: Kompaniya Onboarding, Rol Tizimi, Admin AI

### Qilingan ishlar (docs)

**SPEC.md v3.0** — To'liq yangilandi:
- §2 Rollar: `super_admin=sub_admin` → `company_admin` → `hr/accountant/manager/employee`
- §11 Kompaniya onboarding jarayoni: murojaat → invite → ro'yxat → pending → tasdiqlash → active
- §12 Xodim onboarding: HR yaratadi → email → parol → HR tasdiqlaydi → active
- §13 Login/Auth sahifalari: holat xabarlari, parol tiklash, murojaat sahifasi
- §14 Super Admin AI tizimi: 4 ta maxsus agent (KB, Support, Analytics, Health)

**PLAN.md v3.0** — To'liq yangilandi:
- Phase 1.5 (YANGI, DARHOL): Company Auth & Management — Hafta 6-8
  - 6 ta yangi DB jadvali/ustun: `contact_requests`, `employee_invites`, tenant holatlari
  - 15+ yangi API endpoint: murojaat, kompaniya boshqarish, xodim onboarding
  - 10+ yangi sahifa: `/contact`, `/register`, `/set-password`, `/admin/contacts`, `/app/employees`
  - 7 ta email shablon, real-time HR bildirishnomalar
- B-018..B-030 backlog qo'shildi

**CLAUDE.md** — Rol arxitekturasi bo'limi qo'shildi

### Nima uchun Phase 1.5 DARHOL:
Billing (Click/Payme) ishlashi uchun kompaniyalar to'g'ri ro'yxatda, rollari aniq, account holatlari to'g'ri bo'lishi SHART. Ro'yxatdan o'tish → billing → daromad zanjiri shu phaseda.

---

## 2026-05-06 05:30 — Global Locale Unification

### Muammo

Landing page `"landing_locale"` localStorage kalitiga yozardi.
`I18nProvider` (butun app) esa `"abc_locale"` kalitidan o'qirdi.
Natija: foydalanuvchi landing page da tilni o'zgartirsa, `/app` da eski til ko'rinardi (sahifa yangilanmasa).

### Yechim

`useLandingLocale` hook to'liq qayta yozildi — endi `useI18n()` ni delegate qiladi.
Bir React state, real-time sinxronizatsiya, sahifa yangilanishsiz ishlaydi.

**O'zgargan fayllar:**
- `frontend/src/features/landing/hooks/useLandingLocale.ts` — `useI18n()` ga delegate
- `frontend/src/features/landing/types.ts` — `getDefaultLocale` endi `"abc_locale"` o'qiydi
- `frontend/src/features/landing/__tests__/useLandingLocale.test.ts` — `I18nProvider` wrapper qo'shildi

**Natija:** 14/14 test o'tdi. LP → App locale real-time ishlamoqda.

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
| Til fallback (KB) | `ja` → `en` (KB faqat uz/ru/en) |
