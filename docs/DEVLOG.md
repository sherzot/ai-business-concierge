# Development Log — AI Business Concierge

Loyiha rivojlanishi, qilingan ishlar, duch kelgan xatolar va ularning yechimlari.

> **Tarjimalar (sinxron yangilanadi):** [English](English/DEVLOG.md) · [Russian](Russian/DEVLOG.md) · [日本語](日本語/DEVLOG.md)

## 2026-07-24 — Loyihani davom ettirish auditi va testlar tiklandi

### Kontekst
Hujjatlar, git tarixi va joriy kod solishtirildi. `DEVLOG.md` 2026-06-04 da tugagan, koddagi oxirgi commit esa 2026-06-12 bo'lgan.

### Bajarildi
- Landing testlarida `LandingNavbar` va `HeroSection` ishlatadigan auth kontekst mock qilindi
- `npm run test:run`: 16/16 test fayli, 89/89 test muvaffaqiyatli
- `npm run build`: production build muvaffaqiyatli
- Phase 1.5 yakunlangani, Phase 2 landing qismi boshlanganligi va HR Candidate Analysis hali 501 skeleton ekanligi tasdiqlandi
- Production Supabase `ACTIVE_HEALTHY`; Anthropic/OpenAI/Resend secretlari mavjudligi tasdiqlandi
- `TELEGRAM_WEBHOOK_SECRET` yo'qligi va Telegram POST webhook shu sabab 503 qaytarishi aniqlandi
- Frontend API fallback ishlamaydigan `server/...` URLdan canonical `bright-api/...` URLga tuzatildi
- Phase 2 AI Hujjatchi birinchi slice: 15 shablon seed migration, template/generate API, dinamik frontend forma va oylik usage limit
- Migration drift xavfsiz tekislandi: lokal `h003`/`m002` fayl timestamplari production tarixiga moslandi
- Production Supabase'ga `h005_match_knowledge_tenant` va 15 shablon seed migration deploy qilindi
- `bright-api` v69 deploy qilindi; health smoke-test `200`, himoyalangan template endpoint authsiz `401`
- Yakuniy tekshiruv: 17/17 test fayli, 92/92 test va production build muvaffaqiyatli

### Fayllar
- `frontend/src/features/landing/__tests__/LandingPage.test.tsx`
- `frontend/src/features/docs/`
- `frontend/src/app/config.ts`
- `supabase/functions/server/services/document-generator.ts`
- `supabase/migrations/20260724051655_seed_phase2_document_templates.sql`
- `docs/{DEVLOG,PLAN,ROADMAP,REQUIREMENTS}.md` va tarjimalari

---

## 2026-06-12 — Frontend UI, layout va theme polishing

### Kontekst
Light/Clean SaaS migratsiyasidan keyin landing, auth, admin va kompaniya dashboardlarida vizual izchillik yaxshilandi. Bu ish `2ae377a` commitida bajarilgan, lekin DEVLOG ga kiritilmagan edi.

### Bajarildi
- Landing sectionlari va umumiy theme tokenlari yangilandi
- Admin/kompaniya layoutlari, sidebar/topbar va dashboard sahifalari yaxshilandi
- Login va protected route komponentlaridagi UI/yo'naltirish holatlari takomillashtirildi

### Fayllar
- `frontend/src/features/landing/`
- `frontend/src/features/admin/components/AdminLayout.tsx`
- `frontend/src/features/reports/`
- `frontend/src/features/auth/`
- `frontend/src/styles/theme-indigo-slate.css`

---

## 2026-06-04 — Light Theme migratsiyasi yakunlandi — push & deploy

### Kontekst
Oldingi sessiyada Light/Clean SaaS theme o'tishi boshlangan edi, lekin grep tekshiruvi `text-white`, `bg-slate-700/800/900` qoldiqlarini topdi: AdminDashboardPage, AdminKnowledgeBasePage, AdminRiskPage, AdminCompaniesPage, AdminContactsPage.

### Bajarildi
- `AdminDashboardPage.tsx`: To'liq qayta yozildi — StatCard `text-white` → `text-slate-900`, `text-slate-300` → `text-slate-600`, trend ranglari `text-emerald-400` → `text-emerald-600`, SEV_CONFIG badge'lar `/10 opacity` → to'liq rang (`bg-red-100 text-red-700`), SecurityPosture/AiStatsPanel icon container `bg-*-500/15` → `bg-*-100`, QuickLink dark: variant'lar olib tashlandi, Yangilash tugmasi `bg-slate-700` → `bg-white border`, DB banner `text-emerald-300` → `text-emerald-700`, skeleton `bg-slate-200` ranglar
- `AdminKnowledgeBasePage.tsx`: Maqola category va tag badge'lari `bg-slate-700 text-slate-300` → `bg-slate-100 text-slate-600`, question matni `text-white` → `text-slate-900`, delete modal `bg-slate-900` → `bg-white`, h3 `text-white` → `text-slate-900`
- `AdminRiskPage.tsx`: Empty state h2 `text-white` → `text-slate-900`, scanning matni `text-white` → `text-slate-900`, "Topilma yo'q" `text-white` → `text-slate-900`, status filter aktiv tugmasi `bg-slate-700` → `bg-indigo-600`
- `AdminCompaniesPage.tsx`: h1 `text-white` → `text-slate-900`, stat card count `text-white` → `text-slate-900`, filter tabs `bg-slate-800` → `bg-white`, search input `bg-slate-800 text-white` → `bg-white text-slate-900`, skeleton `bg-slate-700` → `bg-slate-200`, company name `text-white` → `text-slate-900`, legal form badge `bg-slate-700` → `bg-slate-100`, block modal `bg-slate-800` → `bg-white`, Yangilash tugmasi `bg-slate-700` → `bg-white border`
- `AdminContactsPage.tsx`: h1 `text-white` → `text-slate-900`, filter tabs/search/skeleton/contact name — xuddi shunday tuzatmalar
- Build tekshiruvi: `✓ built in 3.14s` — hech qanday xato yo'q
- Git push va Netlify deploy ishga tushirildi

### Fayllar
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (to'liq qayta yozildi)
- `frontend/src/features/admin/pages/AdminKnowledgeBasePage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminRiskPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminContactsPage.tsx` (o'zgargan)

---

## 2026-06-04 — Light/Clean Modern SaaS theme ga to'liq o'tish

### Kontekst
Ilgari `forcedTheme="dark"` bilan barcha sahifalar qoʻlda yozilgan qora ranglar bilan ishlangan edi. Foydalanuvchi butun loyihani zamonaviy Light/Clean SaaS koʻrinishga (Notion, Linear, Vercel uslubi) oʻtkazishni soʻradi.

### Bajarildi
- `AppProviders.tsx`: `forcedTheme="dark"` → `forcedTheme="light"` — barcha dark: Tailwind classlar avtomatik o'chadi
- `LoginPage.tsx`: Toʻliq qayta yozildi — oq fon, chap tomonda indigo gradient branding paneli (Notion/Linear uslubi), oq forma kartasi
- `ForgotPasswordPage.tsx`: Toʻliq qayta yozildi — `bg-slate-50` fon, oq karta, light input fieldlar
- `ResetPasswordPage.tsx`: Toʻliq qayta yozildi — bir xil light design pattern
- `SetupAccountPage.tsx`: Tashqi fon `bg-gradient dark` → `bg-slate-50`, LocaleSelect `variant="dark"` → `variant="light"`
- `AdminHealthPage.tsx`: Qora komponentlar (`bg-slate-800/50`, `border-white/8`, `text-white`) → oq komponentlar (`bg-white`, `border-slate-200`, `text-slate-900`, `shadow-sm`)
- `AdminAIChatPage.tsx`: Chat hududi, pufakchalar, inputlar — barchasi light mode ranglariga o'zgartirildi
- `AdminAuditPage.tsx`: Action badge ranglari (`text-emerald-300` → `text-emerald-700`), inputlar `bg-white`, payload hududi `bg-slate-100`
- `AdminRiskPage.tsx`: ScoreRing SVG `stroke="#1e293b"` → `stroke="#e2e8f0"`, `text-white` → `text-slate-900`, filter tugmalari `bg-slate-900` → `bg-slate-100`
- `AdminKnowledgeBasePage.tsx`: Barcha input/select `bg-slate-800 text-white` → `bg-white text-slate-900`, modal `bg-slate-900` → `bg-white`
- `AdminDashboardPage.tsx`: SVG hardcoded ranglar — track stroke `#1e293b`/`#334155` → `#e2e8f0`, center fill `#0f172a` → `white`, text `fill="white"` → `fill="#0f172a"`, boʻsh barlar `#1e293b` → `#e2e8f0`

### Fayllar
- `frontend/src/app/providers/AppProviders.tsx` (o'zgargan)
- `frontend/src/features/auth/pages/LoginPage.tsx` (toʻliq qayta yozildi)
- `frontend/src/features/auth/pages/ForgotPasswordPage.tsx` (toʻliq qayta yozildi)
- `frontend/src/features/auth/pages/ResetPasswordPage.tsx` (toʻliq qayta yozildi)
- `frontend/src/features/auth/pages/SetupAccountPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminHealthPage.tsx` (toʻliq qayta yozildi)
- `frontend/src/features/admin/pages/AdminAIChatPage.tsx` (toʻliq qayta yozildi)
- `frontend/src/features/admin/pages/AdminAuditPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminRiskPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminKnowledgeBasePage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (SVG ranglar o'zgargan)

## 2026-06-04 — Dark Mode Text Ranglari va LatencyGauge Tuzatish

### Kontekst
Dark mode da ba'zi admin sahifalarida `text-slate-900` (qora) yozuvlar ko'rinmasdi — `dark:` variantlari yo'q edi. `LatencyGauge` (DB kechikish) SVG arc'i `pct > 0.5` threshold da sakrab ketardi — 280° arc uchun to'g'ri threshold `180/280 = 9/14`.

### Bajarildi
- `AdminHealthPage.tsx` — barcha `bg-white`, `text-slate-900`, light banner'lar dark slate-800/white ranglar bilan almashtirildi
- `AdminAIChatPage.tsx` — sarlavha, message bubble'lar, input, suggestion tugmalar dark mode uchun tuzatildi
- `AdminDashboardPage.tsx` — `LatencyGauge` `largeArc` threshold: `pct > 0.5` → `pct > 9/14`
- `AdminKnowledgeBasePage`, `AdminAuditPage` — icon rang `text-slate-700` → `text-slate-500`

### Fayllar
- `frontend/src/features/admin/pages/AdminHealthPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminAIChatPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminKnowledgeBasePage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminAuditPage.tsx` (o'zgargan)

---

## 2026-06-04 — Dark Mode va Login Redirect Bug Fixes

### Kontekst
1. Admin panel va dashboard sahifalari ko'zni chalkashtiruvchi aralash rangda ko'rinardi — `dark:` Tailwind class'lari `.dark` parent element bo'lmasdan ishlamaydi. `ThemeProvider` umuman qo'shilmagan edi.
2. Super_admin tizimga kirgan holda LP ga kirib, u yerdan "Kirish" tugmasini bossanda `/admin` o'rniga `/app` ga o'tardi — navbar `/login` ga yuborardi, lekin `LoginPage` da `currentTenant` null bo'lishi mumkin.

### Bajarildi
- `AppProviders.tsx` — `next-themes` dan `ThemeProvider` qo'shildi (`attribute="class"`, `defaultTheme="dark"`) — `<html class="dark">` avtomatik o'rnatiladi, barcha `dark:` Tailwind class'lari to'g'ri ishlaydi
- `LandingNavbar.tsx` — "Kirish" tugmasi endi foydalanuvchi holati tekshiradi: login bo'lsa → `/admin` yoki `/app` ga, login bo'lmasa → `/login` ga
- `HeroSection.tsx` — xuddi shunday tuzatish

### Fayllar
- `frontend/src/app/providers/AppProviders.tsx` (o'zgargan)
- `frontend/src/features/landing/components/LandingNavbar.tsx` (o'zgargan)
- `frontend/src/features/landing/components/HeroSection.tsx` (o'zgargan)

---

## 2026-06-03 — Tasks Mock Data Bug Fix (PATCH 500 xatosi)

### Kontekst
`PATCH /tasks/t-2` → 500 xatosi. Tenant da haqiqiy task yo'q bo'lsa `GET /tasks` `getMockTasks()` qaytarardi — `t-1`, `t-2` kabi fake IDlar. User bu "task"larni update qilmoqchi bo'lganda UUID formatida bo'lmagan ID DB da type error berardi (500).

### Bajarildi
- `server/index.ts` — `getMockTasks()` funksiyasi o'chirildi; `GET /tasks` endi bo'sh array `[]` qaytaradi
- `bright-api` redeploy edildi (version 68)

### Fayllar
- `supabase/functions/server/index.ts` (o'zgargan)

---

## 2026-06-03 — Contact Form va Register Form Bug Fixes (ikki muammo)

### Kontekst
`/contact` sahifasida "Server error" (double `/v1` path bug) va `/register?token=...` sahifasida "Server error" (parol validatsiya + error format mismatch) muammolari tuzatildi. Ikkalasi production da test qilindi.

### Bajarildi

**Bug 1: `/contact` → "Server error" (oldingi session):**
- `ContactPage.tsx` — lokal `API_BASE = VITE_API_BASE_URL ?? ""` + `/v1/contact` → double `/v1/contact` yaratardi. `API_BASE_URL` (shared, to'liq URL) ga o'tkazildi
- `config.ts` — fallback URL `server` funksiyasi nomiga yangilandi
- `config.toml` — `[functions.server] verify_jwt = false` qo'shildi (JWT bloklash tuzatildi)
- `bright-api` redeploy — yangi kod deployed edildi

**Bug 2: `/register` → "Server error" (ushbu session):**
- **Root cause:** Backend `password.length < 12` tekshiruvi — 8-11 belgili parol kiritilsa 400 qaytarardi; lekin frontend `json?.error?.message` o'qirdi, backend `failure()` esa `json.meta.errors[0].message` formatida javob berardi → hamma xato "Server error" ko'rinardi
- `server/index.ts:4543` — `password.length < 12` → `< 8` tuzatildi
- `RegisterCompanyPage.tsx` — error format ikki xil formati qo'llab-quvvatlandi: `json?.error?.message ?? json?.meta?.errors?.[0]?.message`
- `RegisterCompanyPage.tsx` — parol inputiga `minLength={8}` qo'shildi
- `bright-api` redeploy edildi

**Invite email kelmayotganligi (hal qilinmagan):**
- Sabab: `RESEND_API_KEY` Supabase Secrets da o'rnatilmagan
- Kerakli harakat: `supabase secrets set RESEND_API_KEY=re_xxx` + Resend da `aibizconcierge.uz` domenini verify qilish

### Fayllar
- `frontend/src/features/landing/pages/ContactPage.tsx` (o'zgargan)
- `frontend/src/features/landing/pages/RegisterCompanyPage.tsx` (o'zgargan)
- `frontend/src/app/config.ts` (o'zgargan)
- `supabase/config.toml` (o'zgargan)
- `supabase/functions/server/index.ts` (o'zgargan)

---

## 2026-06-03 — Dark/Light Theme, Admin Sidebar Kengaytirish, Users va AI Stats sahifalari

### Kontekst
Barcha dashboardlarda (super_admin va kompaniya) to'liq qoʻng'ir/yorqin mavzu qoʻllab-quvvatlash; Admin sidebar yangi guruhlar bilan kengaytirildi; Super admin uchun barcha kompaniya foydalanuvchilarini ko'rish imkoniyati; yangi AI statistika sahifasi.

### Bajarildi

**Dark/light theme — barcha dashboardlar:**
- `AdminLayout.tsx` — to'liq qayta yozildi: yangi `NAV_GROUPS` guruhlangan navigatsiya tuzilmasi, to'liq `dark:` variantlari qo'shildi (sidebar, topbar, navlar, tooltip, avatar, logout)
- `App.tsx` — kompaniya dashboard sidebar, topbar, barcha havolalar va `NavItem` komponenti `dark:` variantlari bilan yangilandi
- `AdminDashboardPage.tsx`, `AdminContactsPage.tsx`, `AdminCompaniesPage.tsx`, `AdminHealthPage.tsx`, `AdminAuditPage.tsx`, `AdminRiskPage.tsx`, `AdminAIChatPage.tsx`, `AdminKnowledgeBasePage.tsx` — 8 ta admin sahifada ommaviy `dark:` variant almashtirish o'tkazildi

**Admin sidebar kengaytirish:**
- Navigatsiya guruhlarga bo'lindi: Asosiy, Boshqaruv, Monitoring, Kontent
- Yangi menular: **Foydalanuvchilar** (`/admin/users`), **AI Statistika** (`/admin/ai-stats`)
- `Globe` ikonasi "Asosiy sayt" uchun, `PanelLeftOpen/Close` collapse/expand uchun
- Collapsed holat tooltip-lari dark mode da to'g'ri ko'rsatiladi

**Yangi admin sahifalar:**
- `AdminUsersPage.tsx` — barcha platforma foydalanuvchilarini ko'rish: email, ism, kompaniya, rol (rangli badge), status, sana; rol filtrlari, qidiruv, paginatsiya
- `AdminAiStatsPage.tsx` — AI foydalanish tahlili: KPI kartalar, kunlik bar grafik, model taqsimoti (progress bar), top kompaniyalar; 7/14/30/60/90 kunlik davr tanlash

**Backend yangi endpoint:**
- `GET /admin/users` — barcha `user_tenants` + `profiles` + `tenants` join; faqat super_admin/sub_admin; 500 ta limit

**Router yangilanishi:**
- `router.tsx` — `/admin/users` → `AdminUsersPage`, `/admin/ai-stats` → `AdminAiStatsPage` qo'shildi

**API qatlami:**
- `adminApi.ts` — `AdminUser` turi va `getAdminUsers()` funksiyasi qo'shildi

### Fayllar
- `frontend/src/features/admin/components/AdminLayout.tsx` (o'zgargan — to'liq qayta yozildi)
- `frontend/src/App.tsx` (o'zgargan — dark mode + NavItem)
- `frontend/src/features/admin/pages/AdminUsersPage.tsx` (yangi)
- `frontend/src/features/admin/pages/AdminAiStatsPage.tsx` (yangi)
- `frontend/src/features/admin/api/adminApi.ts` (o'zgargan — AdminUser + getAdminUsers)
- `frontend/src/app/router.tsx` (o'zgargan — yangi admin routelar)
- `supabase/functions/server/index.ts` (o'zgargan — GET /admin/users)
- `frontend/src/features/admin/pages/*.tsx` (8 fayl — dark mode variantlari)

---

## 2026-06-02 — RBAC, Admin Dashboard, va ULTRA Xavfsizlik Davomi (H-008..H-010)

### Kontekst
Avvalgi sessiyadan davom: login yo'naltirish xatosi, rol huquqlari, admin dashboard uchun yangi panellar, va ULTRA xavfsizlik auditi.

### Bajarildi

**Login yo'naltirish tuzatildi:**
- `LoginPage.tsx` — `super_admin`/`sub_admin` endi `/admin` ga, qolganlar `/app` ga yo'naltiriladi
- `ProtectedLayout.tsx` — admin rollar `/app` ga to'g'ridan-to'g'ri kirsa ham `/admin` ga qaytariladi

**RBAC rollari kengaytirildi:**
- `types.ts` — `sub_admin`, `company_admin`, `manager` rollari qo'shildi
- `index.ts` — `ROLE_ACCESS` xaritasi 9 ta rol uchun to'liq belgilandi:
  - `super_admin`/`sub_admin` — barcha modullar
  - `company_admin` — billing, hr, ai, kb, settings
  - `leader` — reports, inbox, tasks, hr, docs, integrations, settings
  - `hr` — reports, inbox, tasks, hr, docs, settings
  - `accounting` — reports, docs, integrations, billing, settings
  - `department_head`/`manager` — reports, inbox, tasks, docs, settings
  - `employee` — inbox, tasks, settings

**Admin dashboard yangi panellari:**
- `GET /admin/ai-stats` — AI foydalanish statistikasi endpoint (so'rovlar, tokenlar, xarajat, model kesimi, top tenantlar)
- `AdminDashboardPage.tsx` — 2 ta yangi panel:
  - **Xavfsizlik Holati** — 18 ta bajarilgan tuzatish (kritik/yuqori/o'rta) vizual ro'yxati
  - **AI Biznes Tahlil** — kunlik xarajat grafigi + model kesimi + top kompaniyalar

**ULTRA xavfsizlik (davomi):**
- **H-008** — Barcha API javoblariga xavfsizlik headerlari: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Content-Security-Policy: default-src 'none'`, `Permissions-Policy`
- **H-009** — Admin mutatsiyalari uchun audit log:
  - `PATCH /admin/tenants/:id/status` → `admin.tenant.status_changed` yozadi
  - `PATCH /admin/contacts/:id/status` → `admin.contact.status_changed` yozadi
- **H-010** — Netlify SPA xavfsizlik headerlari (`netlify.toml` `[[headers]]` bo'limi):
  - CSP: `connect-src` da Supabase va WSS ruxsati
  - HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy

**Deployment:** Edge Function `supabase functions deploy server` orqali deploy qilindi.

### Fayllar
- `frontend/src/features/auth/pages/LoginPage.tsx` (o'zgargan — login yo'naltirish)
- `frontend/src/features/auth/components/ProtectedLayout.tsx` (o'zgargan — admin guard)
- `frontend/src/features/auth/types.ts` (o'zgargan — yangi rollar)
- `supabase/functions/server/index.ts` (o'zgargan — ROLE_ACCESS, ai-stats, H-008, H-009)
- `frontend/src/features/admin/api/adminApi.ts` (o'zgargan — AiStats tipi + getAdminAiStats)
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (o'zgargan — 2 yangi panel)
- `netlify.toml` (o'zgargan — H-010 xavfsizlik headerlari)

---

## 2026-06-02 — Xavfsizlik Mustahkamlash: 14 ta tuzatish (commit `fb5bde5`)

### Kontekst
Tizimning keng qamrovli xavfsizlik auditi o'tkazildi. Jami 14 ta kritik va o'rta darajadagi zaiflik aniqlandi va bartaraf qilindi.

### Bajarildi

**Kritik (K):**
- **K-001** `getTenantContext()` — autentifikatsiyasiz `x-tenant-id` header fallback olib tashlandi; JWT + DB membership tekshiruvi bilan almashtirildi
- **K-002** `/ai/chat` — `system_prompt` parametri rad etiladi (prompt injection vektori yopildi)
- **K-004** `frontend/config.ts` — hardcoded Supabase credentials olib tashlandi; env var yo'q bo'lsa app ishga tushmaydi
- **K-005** `telegram-bot/index.ts` — `TELEGRAM_WEBHOOK_SECRET` majburiy; yo'q bo'lsa 503 qaytaradi
- **K-006** `docs/DEMO_USERS.md` — demo foydalanuvchi parollari hujjatdan o'chirildi

**Yuqori (H):**
- **H-001** CORS — wildcard `*` o'rniga aniq domenlar: `aibizconcierge.uz`, `netlify.app`, `localhost`
- **H-002** AI kvota — `guardUsage()` + `recordUsage()` `/ai/chat` ga ulandi
- **H-004** `RequireRole.tsx` — yangi komponent; `/admin` marshrut DB orqali rol tekshiruvi bilan himoyalandi
- **H-005** `match_knowledge()` — `match_tenant_id` parametri qo'shildi; tenant izolyatsiyasi ta'minlandi
- **H-006** Resend webhook — imzo tekshiruvi majburiy; `RESEND_WEBHOOK_SECRET` yo'q bo'lsa 503
- **H-007** `apiClient.ts` — anon key fallback olib tashlandi; auth token yo'q bo'lsa throw

**O'rta (M):**
- **M-003** Invite token — har resend da yangi token generatsiya qilinadi (eski token bekor bo'ladi)
- **M-005** Hard-delete — `hr` roli olib tashlandi; faqat `leader/company_admin/super_admin`
- **M-006** Notifications mark-read — `tenant_id` filtri qo'shildi
- **M-008** Parol minimal uzunligi 8 → 12 belgiga ko'tarildi (3 joyda)

**Manual bajariladigan (foydalanuvchi tomonidan bajarildi ✅):**
- Supabase anon key rotate qilindi
- Netlify env vars yangilandi (`VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_ANON_KEY`)
- Demo foydalanuvchilar parollari Supabase Auth da yangilandi

### Fayllar
- `supabase/functions/server/index.ts` (o'zgargan)
- `supabase/functions/server/services/knowledge-base.ts` (o'zgargan — H-005)
- `supabase/functions/telegram-bot/index.ts` (o'zgargan — K-005)
- `frontend/src/app/config.ts` (o'zgargan — K-004)
- `frontend/src/shared/lib/apiClient.ts` (o'zgargan — H-007)
- `frontend/src/app/router.tsx` (o'zgargan — H-004)
- `frontend/src/features/auth/components/RequireRole.tsx` (yangi — H-004)
- `docs/DEMO_USERS.md` (o'zgargan — K-006)
- `supabase/migrations/20260602000000_h005_match_knowledge_tenant.sql` (yangi — H-005)

---

## 2026-06-02 — Bugfixlar: AdminRiskPage `color` xatosi, statusFilter, Netlify Node.js

### Kontekst
Risk Scanner sahifasi ishga tushirilgandan keyin bir nechta runtime xatolar topildi. Netlify va local build hashlari ham farq qilardi.

### Bajarildi
- **AdminRiskPage `TypeError: Cannot read properties of undefined (reading 'color')`** — sabab: backend `findings` massivida `status` maydoni yo'q edi → `STATUS_CONFIG[undefined]` crash. Tuzatish:
  - `risk-scan.ts`: barcha `findings.push()` ga `status: "open"` qo'shildi
  - `AdminRiskPage.tsx`: `STATUS_CONFIG[finding.status] ?? STATUS_CONFIG["open"]` fallback qo'shildi
- **`statusFilter` xatosi** — `AdminContactsPage` va `AdminCompaniesPage` da `statusFilter` parametri ishlatilgan, lekin API `filter` kutadi. To'g'irlandi.
- **Netlify hash farqi** — local Node 22 vs Netlify default Node 18 → build output hashlari farq qildi. `netlify.toml` ga `NODE_VERSION = "22"` qo'shildi.
- **`frontend/.gitignore`** — `dist/` yozuvi bilan birinchi marta commit qilindi.

### Fayllar
- `supabase/functions/server/routes/risk-scan.ts` (o'zgargan)
- `frontend/src/features/admin/pages/AdminRiskPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminContactsPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (o'zgargan)
- `netlify.toml` (o'zgargan)
- `frontend/.gitignore` (yangi)

---

## 2026-05-30 — B-014 Xavfsizlik Risk Scanner: AdminRiskPage + `POST /risk/scan`

### Kontekst
Super Admin / Sub Admin uchun tizim xavfsizligini real vaqtda skanerlash va natijalarini vizual ko'rsatish funksiyasi kerak edi.

### Bajarildi
- **DB migration** `20260530000000_risk_scanner.sql`:
  - `risk_scans` jadvali — har bir skan sessiyasi: `status`, `score`, `critical/high/medium/low_count`, `duration_ms`, `source`
  - `risk_findings` jadvali — aniq topilmalar: `severity`, `title`, `description`, `location`, `remediation`, `status`
  - RLS: faqat `super_admin/sub_admin` o'qiy oladi
- **Backend** `POST /v1/risk/scan` (`routes/risk-scan.ts`):
  - Hybrid rejim: statik tekshiruvlar + Supabase Advisor API
  - Statik tekshiruvlar: CORS config, env varlar mavjudligi, RLS holati
  - Advisor topilmalari: DB xavfsizlik tavsiyalari (RLS yo'q jadvallar, indeks yo'q FKlar va h.k.)
  - Skan natijasi `risk_scans` + `risk_findings` ga saqlanadi; `score` hisoblanadi
- **Frontend** `AdminRiskPage.tsx` (yangi):
  - "Skan boshlash" tugmasi + loading holati
  - Severity bo'yicha badge: `critical` (qizil), `high` (to'q sariq), `medium` (sariq), `low` (ko'k)
  - Findings ro'yxati: title, description, location, remediation
  - Score ko'rsatkichi (0–100)
- **Router**: `/admin/risk` marshruti qo'shildi
- **AdminLayout**: "Risk Scanner" sidebar linki qo'shildi

### Fayllar
- `supabase/migrations/20260530000000_risk_scanner.sql` (yangi)
- `supabase/functions/server/routes/risk-scan.ts` (yangi)
- `supabase/functions/server/index.ts` (o'zgargan — route ro'yxatdan o'tkazildi)
- `frontend/src/features/admin/pages/AdminRiskPage.tsx` (yangi)
- `frontend/src/app/router.tsx` (o'zgargan)
- `frontend/src/features/admin/components/AdminLayout.tsx` (o'zgargan)

---

## 2026-05-27 — B-005/B-006 DB Optimizatsiya: Performance Indexlar + Audit Triggerlar

### Kontekst
`tasks`, `inbox_items` va `documents` jadvallarida soft-delete (mantiqiy o'chirish) yo'q edi. Tez-tez so'raladigan jadvallar uchun partial indexlar ham yetishmayotgan edi. Audit log triggerlari kerak edi.

### Bajarildi
- **`deleted_at`** ustuni: `tasks`, `inbox_items`, `documents` jadvallariga qo'shildi
- **Partial indexes** (`WHERE deleted_at IS NULL`): `tasks`, `inbox_items`, `documents`, `notifications`, `audit_logs`, `request_logs` uchun — faqat aktiv yozuvlar tezroq so'raladi
- **Audit log triggerlar**: `company_info`, `employee_profiles`, `documents`, `tasks` jadvallariga — muhim o'zgarishlar avtomatik `audit_logs` ga yoziladi

### Fayllar
- `supabase/migrations/20260527105554_b005_b006_optimization.sql` (yangi)

---

## 2026-05-27 — #8 B-013 OpenAPI/Scalar docs — `GET /docs/api` + `GET /docs`

### Kontekst
API hujjatlanmagan edi. Tashqi integratsiyalar va frontend developerlar uchun interaktiv API dokumentatsiya kerak edi.

### Bajarildi
- `supabase/functions/server/openapi.ts` (yangi): to'liq OpenAPI 3.1 spec (`OPENAPI_SPEC` const) — barcha asosiy endpointlar (health, contact, tasks, inbox, employees, KB, audit, analytics) va komponentlar (Error, Task, InboxItem, Employee, KbArticle, AuditLog, AnalyticsData)
- `renderScalarHtml(apiJsonUrl)` funksiyasi — Scalar CDN orqali interaktiv UI (purple/modern tema)
- `server/index.ts`: `openapi.ts` import qo'shildi; `registerRoutes(prefix)` ichiga 2 ta route:
  - `GET ${prefix}/docs/api` → `c.json(OPENAPI_SPEC)` — OpenAPI 3.1 JSON spec
  - `GET ${prefix}/docs` → Scalar HTML UI (URL dinamik, `apiUrl.pathname` replace)
- 4 ta prefixda ham ishlaydi (`BASE_PATH`, `V1_PATH`, `GATEWAY_PREFIX` kombinatsiyalari)

### Fayllar
- `supabase/functions/server/openapi.ts` (yangi)
- `supabase/functions/server/index.ts` (o'zgargan — import + 2 route)

## 2026-05-27 — #7 Reports/Analytics charts — real DB data

### Kontekst
ReportsPage mock data ishlatayotgan edi. Haqiqiy DB aggregatsiyasi va vizualizatsiya kerak edi: task holatlari, 7-kunlik trend, inbox kategoriyalari, xodim statistikasi.

### Bajarildi
**Backend (server/index.ts) — `GET /analytics`:**
- Task stats: total, todo, in_progress, done, overdue (deleted_at IS NULL filter)
- Task trend (7 kun): har bir kun uchun created va done sonlari
- Inbox by category (30 kun): `group by category` analog (JS aggregatsiya)
- Employee stats: total, active, pending, recent_joins (7 kun)

**Frontend:**
- `frontend/src/features/reports/api/analyticsApi.ts` (yangi) — typed API client
- `frontend/src/features/reports/pages/AnalyticsPage.tsx` (yangi):
  - KPI row: jami vazifalar, muddati o'tgan, inbox (30 kun), xodimlar (stagger animatsiya)
  - Task trend → Recharts `AreaChart` (2 area: created/done, gradient fill)
  - Task status → Recharts `PieChart` (donut, 4 rang)
  - Inbox kategoriyalar → Recharts `BarChart` (har bar uchun rang)
  - Employee stats → 4 ta stat box grid
  - Refresh tugmasi + loading/error states
- `App.tsx`: `case "analytics"` → `<AnalyticsPage>` qo'shildi
- `CommandPalette.tsx`: "Analytics" page item qo'shildi

### Fayllar
- `frontend/src/features/reports/api/analyticsApi.ts` (yangi)
- `frontend/src/features/reports/pages/AnalyticsPage.tsx` (yangi)
- `supabase/functions/server/index.ts` (o'zgargan)
- `frontend/src/App.tsx` (o'zgargan)
- `frontend/src/shared/components/CommandPalette.tsx` (o'zgargan)

## 2026-05-27 — #6 PWA manifest — offline shell, home screen install

### Kontekst
Ilova faqat browser tab orqali ishlayotgan edi. Mobile qurilmalarda home screen ga qo'shish va offline ishlash imkoniyati kerak edi.

### Bajarildi
- `vite-plugin-pwa@1.3.0` o'rnatildi (`devDependencies`)
- `vite.config.ts` yangilandi:
  - `VitePWA()` plugin qo'shildi, `registerType: 'autoUpdate'`
  - Web App Manifest:
    - name: "AI Business Concierge", short_name: "AI Concierge"
    - theme_color: `#4f46e5` (indigo), background_color: `#0f172a` (dark)
    - display: `standalone`, start_url: `/app`
    - Icons: `icon.svg` (any/maskable) + `favicon.ico`
  - Workbox config: `globPatterns` JS/CSS/HTML/ICO/SVG/WOFF2
  - Runtime cache: API URL pattern → `StaleWhileRevalidate` (5 min, max 50 entries)
- `frontend/public/icon.svg` (yangi) — SVG app icon (indigo hexagon + spark)
- `frontend/index.html` yangilandi:
  - theme-color → `#4f46e5`
  - `apple-touch-icon`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-title`
  - `mobile-web-app-capable`
- Build natijasi: `dist/sw.js` + `dist/workbox-*.js` yaratildi (9 entry precache, 1.7MB)

### Fayllar
- `frontend/vite.config.ts` (o'zgargan)
- `frontend/public/icon.svg` (yangi)
- `frontend/index.html` (o'zgargan)
- `frontend/package.json` (o'zgargan — vite-plugin-pwa devDep)

## 2026-05-27 — #5 Admin Audit Log viewer + backend

### Kontekst
B-006 trigger orqali audit_logs jadvali to'ldiriladi. Super adminlar uchun bu ma'lumotlarni ko'rish, filtrlash va tekshirish imkoniyati kerak edi.

### Bajarildi
- `GET /admin/audit` backend endpoint (server/index.ts):
  - super_admin / sub_admin tekshiruvi
  - Query params: tenant_id, entity_type, action, from, to, limit (max 500)
  - `audit_logs` jadvaldan tartibli (created_at desc) ma'lumot
- `frontend/src/features/admin/api/auditApi.ts` (yangi) — typed API client
- `frontend/src/features/admin/pages/AdminAuditPage.tsx` (yangi):
  - Header: jami / ko'rsatilgan yozuvlar soni + yangilash tugmasi
  - Filtrlar: qidiruv, entity_type select, action select, sanadan / sanagacha
  - Stagger-animatsiyali ro'yxat
  - Har bir qatorda: action badge (create/update/delete rangli), entity_type, event_type, user_id (qisqartirilgan), vaqt
  - Kengaytirilganda: to'liq payload JSON (pre format)
- Router: `/admin/audit` route qo'shildi
- AdminLayout: `Shield` icon + "Audit Log" nav item (Knowledge Base va Health o'rtasida)

### Fayllar
- `frontend/src/features/admin/api/auditApi.ts` (yangi)
- `frontend/src/features/admin/pages/AdminAuditPage.tsx` (yangi)
- `frontend/src/app/router.tsx` (o'zgargan)
- `frontend/src/features/admin/components/AdminLayout.tsx` (o'zgargan)
- `supabase/functions/server/index.ts` (o'zgargan)

## 2026-05-27 — #4 Admin Knowledge Base CRUD UI + backend

### Kontekst
`knowledge_base` jadvali (pgvector + semantic search) allaqachon mavjud edi, lekin uni boshqarish uchun admin UI yoki CRUD API yo'q edi. Super adminlar maqolalarni qo'shishi, tahrirlashi, o'chirishi va faol/nofaol qilishi kerak edi.

### Bajarildi

**Backend (server/index.ts):**
- `GET /admin/kb` — ro'yxat (locale, category, is_active filter)
- `POST /admin/kb` — yangi maqola yaratish (locale+category+question+answer majburiy)
- `PUT /admin/kb/:id` — maqolani yangilash (allowed fields)
- `DELETE /admin/kb/:id` — maqolani o'chirish
- Barcha endpoint super_admin / sub_admin tekshiruvi

**Frontend:**
- `frontend/src/features/admin/api/kbApi.ts` (yangi) — typed API client
- `frontend/src/features/admin/pages/AdminKnowledgeBasePage.tsx` (yangi):
  - Header: maqola soni / faol soni + yangilash + "Yangi maqola" tugmasi
  - Filtrlar: qidiruv + til select + kategoriya select
  - Stagger animatsiyali ro'yxat (accordion expand)
  - Har bir qatorda: til/kategoriya badge, savol truncate, teglar, toggle switch
  - Kengaytirilganda: to'liq javob + Tahrirlash/O'chirish tugmalar
  - `FormModal` — 2 col locale+category, question input, answer textarea, tags, is_active toggle
  - Delete confirm modal
- `frontend/src/app/router.tsx` — `/admin/knowledge-base` route qo'shildi
- `frontend/src/features/admin/components/AdminLayout.tsx` — `BookOpen` icon + "Knowledge Base" nav item

### Fayllar
- `frontend/src/features/admin/api/kbApi.ts` (yangi)
- `frontend/src/features/admin/pages/AdminKnowledgeBasePage.tsx` (yangi)
- `frontend/src/app/router.tsx` (o'zgargan)
- `frontend/src/features/admin/components/AdminLayout.tsx` (o'zgargan)
- `supabase/functions/server/index.ts` (o'zgargan)

## 2026-05-27 — #3 Framer-motion micro-animatsiyalar

### Kontekst
Framer-motion kutubxonasi allaqachon o'rnatilgan edi, lekin faqat page transition da ishlatilayotgan edi. KPI kartochkalar, employee jadval qatorlari, kompaniya kartochkalarida hover/stagger animatsiyalar kerak edi.

### Bajarildi
- `shared/lib/motionVariants.ts` yangi fayl — umumiy variantlar:
  - `fadeInUp` — sahifa section entrance
  - `staggerContainer` + `staggerItem` — ro'yxat stagger (55ms oralig'i)
  - `cardHover` — scale 1.02 + indigo box-shadow hover
  - `rowHover` — jadval qator hover (subtil)
- `DashboardPage.tsx` o'zgarishlari:
  - KPI grid → `motion.div` (staggerContainer)
  - Har bir `KpiCard` → `motion.div` (staggerItem + cardHover)
- `EmployeesPage.tsx` o'zgarishlari:
  - `<tbody>` → `<motion.tbody>` (staggerContainer)
  - Har bir `<tr>` → `<motion.tr>` (staggerItem) — 55ms stagger
- `AdminCompaniesPage.tsx` o'zgarishlari:
  - Kartochkalar wrapper → `motion.div` (staggerContainer)
  - Har bir kartochka → `motion.div` (staggerItem + border hover indigo)

### Fayllar
- `frontend/src/shared/lib/motionVariants.ts` (yangi)
- `frontend/src/features/reports/pages/DashboardPage.tsx` (o'zgargan)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (o'zgargan)

## 2026-05-27 — #2 CommandPalette: ⌘K global modal qidiruvi

### Kontekst
Avvalgi ⌘K faqat search inputga fokus qilardi. Real CommandPalette — modal, fuzzy search, klaviatura navigatsiyasi — kerak edi.

### Bajarildi
- `CommandPalette.tsx` yangi komponent yaratildi (`shared/components/`)
- Framer-motion: backdrop + modal scale/fade animatsiya
- 13 ta page item (Dashboard → Notifications), 1 ta quick action (Add Employee)
- Xodimlar: `listEmployees(tenantId, "active")` — palette ochilganda lazy load
- Fuzzy match: `includes()` + char-by-char fallback; match substring `<span>` highlight
- Keyboard: ArrowUp/Down cursor harakat, Enter → select, Escape → yopish
- Grouped sections: Pages / Quick Actions / Employees + scroll-into-view
- Footer hint: `↑↓ navigate`, `↵ open`, `ESC close`
- `App.tsx` o'zgarishlari:
  - `paletteOpen` state qo'shildi
  - ⌘K handler: `setPaletteOpen(prev => !prev)` (toggle)
  - Search input → click-to-open button (⌘K badge ko'rsatadi)
  - `<CommandPalette>` layout pastiga render (portal orqali `document.body`)
  - `employee-detail:` prefix navigatsiya employee detail sahifasiga o'tadi

### Fayllar
- `frontend/src/shared/components/CommandPalette.tsx` (yangi)
- `frontend/src/App.tsx` (o'zgargan)

## 2026-05-27 — B-005 + B-006 + B-011: DB indekslar, audit triggers, structured logging

### Kontekst
Saqlash jadvallari indekssiz edi — tenant scope bo'yicha so'rovlar katta hajmda sekin ishlaydi. Audit log faqat manual yozilardi (trigger yo'q). Hono logger oddiy text format chiqarardi — Supabase log observability uchun noqulay.

### Bajarildi

**B-005 — Performance indekslar + soft-delete:**
- `tasks`, `inbox_items`, `documents` jadvallariga `deleted_at timestamptz` ustun qo'shildi
- `idx_tasks_tenant_status_del` — `(tenant_id, status, deleted_at)` partial index (deleted_at IS NULL)
- `idx_tasks_tenant_due` — `(tenant_id, due_date)` partial index (deleted_at IS NULL)
- `idx_inbox_tenant_created_del` — `(tenant_id, created_at desc, deleted_at)` partial
- `idx_notifications_user_unread` — `(user_id, created_at desc)` where read_at IS NULL
- `idx_notifications_tenant_created` — `(tenant_id, created_at desc)`
- `idx_documents_tenant_created_del` — `(tenant_id, created_at desc)` partial
- `idx_audit_logs_tenant_created` — `(tenant_id, created_at desc)`
- `idx_audit_logs_entity` — `(entity_type, entity_id, created_at desc)`
- `idx_request_logs_tenant_created` — `(tenant_id, created_at desc)`

**B-006 — Audit log triggers:**
- `fn_audit_log_change()` PL/pgSQL trigger funksiyasi yaratildi (SECURITY DEFINER)
- INSERT → `event_type = 'table.create'`, payload = NEW row JSON
- UPDATE → `event_type = 'table.update'`, payload = `{before: OLD, after: NEW}`
- DELETE → `event_type = 'table.delete'`, payload = OLD row JSON
- Triggerlar: `trg_audit_tasks`, `trg_audit_inbox_items`, `trg_audit_documents` (tasks/inbox_items/documents/hr_cases)

**B-011 — Structured JSON logging (Hono middleware):**
- `import { logger } from "npm:hono/logger"` olib tashlandi
- Yangi `app.use('*', async (c, next) => {...})` middleware:
  - `X-Trace-Id` headerni oladi yoki yangi UUID yaratadi
  - Response vaqtini o'lchaydi (`Date.now()` before/after)
  - status ≥ 500 → `level: "error"`, ≥ 400 → `"warn"`, duration > 2000ms → `"warn"`, boshqa → `"info"`
  - `logRequest()` orqali JSON formatda chiqaradi: `{level, message, traceId, tenantId, userId, data: {method, path, status, duration_ms}}`
  - 2000ms dan oshgan so'rovlarda `slow_query: true` flag

### Fayllar
- `supabase/migrations/20260527000000_b005_b006_optimization.sql` (yangi)
- `supabase/functions/server/index.ts` (o'zgargan — logger import olib tashlandi, structured middleware qo'shildi)
>
> **Protokol (CLAUDE.md §...):** Har bir o'zgarish bu faylga va 4 til tarjimaga yoziladi.

---

## 2026-05-27 — UI/UX #10: Onboarding tooltips (TourProvider, TourOverlay)

### Bajarildi

- `OnboardingTour.tsx`: `TourProvider` + `useTour` hook + `TourOverlay` component
  - Spotlight: `box-shadow` bilan target element atrofida qorong'i overlay
  - `requestAnimationFrame` orqali target pozitsiyasi kuzatiladi (scroll ham ishlaydi)
  - `placement: "top"|"bottom"|"left"|"right"` — avtomatik viewport cheklash
  - Progress bar, step hisobi (1/4), "O'tkazib yuborish" + "Keyingi" tugmalar
  - Keyboard: `Escape` → yopish, `ArrowRight`/`Enter` → keyingi qadam
- `AppProviders.tsx`: `<TourProvider>` qo'shildi
- `App.tsx`: `DASHBOARD_TOUR` (4 qadam: nav, qidiruv, bildirishnomalar, mavzu) + `HelpCircle` tugma → `startTour()`
- Search input ga `data-tour="search"` attribute qo'shildi

### Fayllar

- `frontend/src/shared/components/OnboardingTour.tsx` (yangi)
- `frontend/src/app/providers/AppProviders.tsx` (o'zgargan)
- `frontend/src/App.tsx` (o'zgargan)

---

## 2026-05-27 — UI/UX #9: Klaviatura shortcutlar (⌘K qidiruv, ⌘N xodim)

### Bajarildi

- `App.tsx` da `keydown` listener: `Cmd/Ctrl+K` → search input ga focus + select; `Cmd/Ctrl+N` → `hr-add-employee` sahifasiga o'tish (faqat HR ruxsati bor bo'lsa)
- Mac/Windows mod key detection (`navigator.platform`)
- Qidiruv input placeholder: `"... (⌘K)"` hint qo'shildi

### Fayllar

- `frontend/src/App.tsx` (o'zgargan)

---

## 2026-05-27 — UI/UX #8: Jadval paginatsiyasi (EmployeesPage, AdminCompaniesPage)

### Bajarildi

- `Pagination` component: ellipsis bilan sahifa tugmalar, `ChevronLeft/Right`, "N–M / total ta" ko'rsatkich; `paginateArray` helper
- **EmployeesPage**: `PAGE_SIZE=20`, tab/search/statusFilter o'zgarganda page reset, `paginateArray(filtered, page, PAGE_SIZE).map(...)`
- **AdminCompaniesPage**: `PAGE_SIZE=15`, filter/search o'zgarganda page reset, paginatsiya list ostida

### Fayllar

- `frontend/src/shared/components/Pagination.tsx` (yangi)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (o'zgargan)

---

## 2026-05-27 — UI/UX #7: Dark/Light mode toggle

### Bajarildi

- `useTheme` hook: localStorage saqlash (`ai-bc-theme`), OS preferense fallback, `<html>` ga `.dark` class qo'shish/olish
- `ThemeToggle` component: `Sun`/`Moon` ikonka, `aria-label`, `dark:` hover renglari
- App.tsx topbar ga `<ThemeToggle />` qo'shildi (LocaleSelect chap tomonida)
- AdminLayout topbar ga ham `<ThemeToggle />` qo'shildi
- `theme.css` da `.dark` CSS variables allaqachon to'liq tayyor edi

### Fayllar

- `frontend/src/shared/hooks/useTheme.ts` (yangi)
- `frontend/src/shared/components/ThemeToggle.tsx` (yangi)
- `frontend/src/App.tsx` (o'zgargan)
- `frontend/src/features/admin/components/AdminLayout.tsx` (o'zgargan)

---

## 2026-05-27 — UI/UX #6: Employee onboarding step wizard

### Bajarildi

- `AddEmployeePage` 3 qadam wizardga o'tkazildi:
  - **Step 1**: Mode tanlash — katta visual kartalar (`Send`/`Lock` ikonka, tanlangan badge)
  - **Step 2**: Ma'lumotlar formasi — ikonkali input lar, mode ko'rsatkich + "O'zgartirish" link, yuborilayotganda spinner
  - **Step 3**: Muvaffaqiyat — `CheckCircle2` katta ko'k doira, "Yana qo'shish" va "Xodimlar ro'yxati" tugmalar
- `StepIndicator` component: numbered circles (active/done/future), connector chiziqlar (rang o'zgaradi), step labels
- `onSuccess?` prop qo'shildi — step 3 da tashqi callback imkoni

### Fayllar

- `frontend/src/features/hr/pages/AddEmployeePage.tsx` (to'liq qayta yozildi)

---

## 2026-05-27 — UI/UX #5: Notifications UI polish

### Bajarildi

- **Badge**: `animate-ping` halqa (qizil nuqta atrofida pulsatsion ring) + ichki qizil raqam badge
- **"Barchasini o'qi"** tugma: header da `CheckCheck` ikonka + `Promise.allSettled` parallel mark
- **Empty state**: `BellOff` ikonka + matn (avval faqat matn)
- **Har bir notification**: tur ikonkasi (emoji), o'qilmagan holat uchun indigo nuqta, `bg-indigo-50` fon
- **Header** qo'shildi: "Bildirishnomalar" sarlavha + o'qilmagan hisobi bor bo'lsa "Barchasini o'qi"
- `CheckSquare` → tur emoji'si (task/hr/invoice/system/🔔 default)

### Fayllar

- `frontend/src/features/notifications/components/NotificationsDropdown.tsx` (to'liq qayta yozildi)

---

## 2026-05-27 — UI/UX #4: Mobile responsive tekshiruv (3 sahifa)

### Bajarildi

- **AdminCompaniesPage** header: `flex-wrap gap-3 + shrink-0` — kichik ekranda tugma keyingi qatorga o'tadi
- **AdminContactsPage** header: xuddi shunday `flex-wrap` tuzatish
- **EmployeeDetailPage**: loading → to'liq skeleton (header + 5 maydon qatori); error state → ikonka + xabar (avval shunchaki matn edi)
- Summary cards `grid-cols-2 sm:grid-cols-4` — allaqachon responsiv edi, saqlandi

### Fayllar

- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminContactsPage.tsx` (o'zgargan)
- `frontend/src/features/hr/pages/EmployeeDetailPage.tsx` (o'zgargan)

---

## 2026-05-27 — UI/UX #3: Skeleton loaderlar + Empty states (4 sahifa)

### Bajarildi

- **AdminCompaniesPage**: spinner → 5 ta karta skeleton (`animate-pulse`); empty state → `Building2` ikonka + kontekstual xabar (filter aktiv bo'lganda "Filtrlarni tozalang")
- **AdminContactsPage**: spinner → 5 ta karta skeleton; empty state → `Users` ikonka + kontekstual xabar; import ga `Users` qo'shildi
- **AdminHealthPage**: bitta qator matn → header + banner + 4 ta stat kartasi skeleton
- **EmployeesPage**: oddiy matn → jadval skeleton (thead + 6 ta qator); empty state → `UserPlus` ikonka + kontekstual xabar

### Fayllar

- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminContactsPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminHealthPage.tsx` (o'zgargan)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (o'zgargan)

---

## 2026-05-27 — UI/UX #1-2: AdminLayout sidebar + AdminDashboard SVG grafiklari

### Bajarildi

**#1 — AdminLayout sidebar qayta yozildi:**
- Desktop: ikonkalar-only rejim (w-16) ↔ kengaytirilgan (w-56) — `PanelLeftClose/Open` tugma
- Mobile: drawer (`-translate-x-full` → `translate-x-0`) + overlay; alohida `mobileOpen` holati
- `NavItem`: tooltip (collapsed da `fixed` pozitsiya), chap aktiv chiziq (animatsiyali balandlik), icon scale hover da
- Badge: contactlar uchun pulsatsion qizil nuqta (collapsed) / raqam (expanded)
- `Avatar`: ismdan bosh harflar, `[\s@._-]` bo'yicha ajratiladi
- Topbar: yangi murojaat hisobi, avatar o'ng yuqorida

**#2 — AdminDashboardPage SVG grafiklari (tashqi kutubxonasiz):**
- `DonutChart`: sof SVG, trigonometriya bilan yoy yo'llar, markaziy teshik, markaziy matn
- `MiniBarChart`: SVG bar chart, kompaniyalar `created_at` dan 7 kunlik qovushlar
- `LatencyGauge`: SVG yoy gauge, ranglar bilan kodlangan (yashil ≤50ms, sariq ≤200ms, qizil >200ms)
- `StatCard`: haftalik trend (↑/↓), hover `scale-[1.01]`
- Skeleton loaderlar: `animate-pulse` divlar yuklanayotganda
- 30s auto-refresh; adminDashboardApi ga yangi `getDashboardStats` type

### Fayllar

- `frontend/src/features/admin/components/AdminLayout.tsx` (to'liq qayta yozildi)
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (to'liq qayta yozildi)

---

## 2026-05-27 — Vazifa 4: B-001 Unit testlar (inbox modul)

### Kontekst

B-001 bo'yicha `features/inbox/` moduli uchun qo'shimcha unit testlar yozildi. Mavjud 76 ta test 89 ga ko'paydi (+13 yangi test, 16 test fayl).

### Bajarildi

**`inbox/__tests__/inboxApi.test.ts` (6 ta yangi test):**
- `snake_case is_read` → `camelCase isRead` normalizatsiyasi
- `is_read` yo'q bo'lganda `false` deb qabul qilish
- To'g'ri endpoint va `tenantId` bilan murojaat
- Bo'sh array → bo'sh list
- Bir nechta item — isRead to'g'ri normalizatsiya
- API xato bo'lsa exception tashlash

**`inbox/__tests__/useInbox.test.ts` (7 ta yangi test):**
- Yuklanganda itemlar olinishi
- `filter=all` — barcha itemlar ko'rsatilishi
- `filter=HR` — faqat HR itemlar filtrlash
- `filter=Sales` — faqat Sales itemlar filtrlash
- Tenant izolyatsiya — boshqa `tenantId` bilan alohida API so'rovi
- API xato → `error` holati, `items=[]`
- `selectedItem` birinchi itemga avtomatik o'rnatilishi

### Holat

| Fayl | Testlar |
|------|---------|
| `tasks/tasksDomain.test.ts` | 5 ✅ |
| `tasks/tasksApi.test.ts` | 6 ✅ |
| `tasks/useTasks.test.ts` | 6 ✅ |
| `inbox/inboxDomain.test.ts` | 3 ✅ |
| `inbox/inboxApi.test.ts` | 6 ✅ **yangi** |
| `inbox/useInbox.test.ts` | 7 ✅ **yangi** |
| Boshqa 10 ta fayl | 56 ✅ |
| **Jami** | **89 ta test, hammasi o'tdi** |

### Fayllar

- `frontend/src/features/inbox/__tests__/inboxApi.test.ts` (yangi)
- `frontend/src/features/inbox/__tests__/useInbox.test.ts` (yangi)

---

## 2026-05-27 — Vazifa 3: B-007 Prompt injection himoya + input sanitizatsiya

### Kontekst

AI chat endpointlar hech qanday input tekshiruvisiz to'g'ridan-to'g'ri Claude/OpenAI ga yuborilyapti edi. Bu injection xavfini keltirib chiqaradi: foydalanuvchi system prompt ni o'zgartirishga yoki tizimni aldashga urinishi mumkin. B-007 bo'yicha `services/ai-safety.ts` service yaratildi va `/v1/ai/chat` ga ulandi.

### Bajarildi

**`services/ai-safety.ts` (yangi fayl):**
- `checkAiSafety(rawInput, userId)` — asosiy funksiya:
  - 25 ta injection pattern (EN/RU/UZ/JA + system markers: `<system>`, `[INST]`, `<|user|>` va h.k.)
  - HTML/script teg stripping (DoS-xavfsiz: `{0,200}` regex)
  - Max 16 000 belgi (~4000 token) tekshiruvi
  - Per-user rate limit: 10 xabar/daqiqa (in-memory sliding window)
  - `SafetyResult` type: `{ safe: true, sanitized }` yoki `{ safe: false, code, message, messageRu }`
- `wrapUserMessage(sanitized)` — prompt layering helper:
  - User xabarini `"User message:\n..."` blokiga o'raydi
  - System kontekstdan aniq ajratadi → injection samaradorligi kamayadi

**`/v1/ai/chat` endpoint yangilandi:**
- `checkAiSafety()` — KB va AI chaqirishdan oldin tekshiriladi
- 422 → `INJECTION_DETECTED` yoki `INPUT_TOO_LONG`
- 429 → `RATE_LIMITED` (til-mos xabar: uz yoki ru)
- `safeMessage` — sanitizatsiya qilingan xabar butun handler davomida ishlatiladi
- `wrapUserMessage()` — Claude + OpenAI fallback chaqiruvlarda qo'llaniladi

### Fayllar

- `supabase/functions/server/services/ai-safety.ts` (yangi)
- `supabase/functions/server/index.ts` (o'zgargan: import + `/v1/ai/chat` handler)

---

## 2026-05-27 — Vazifa 1: ai_usage_logs wiring (billing cost tracking)

### Kontekst

API kreditlar kutilayotgan paytda kredit talab qilmaydigan backend ishlarni boshladik. Birinchi vazifa: `ai_usage_logs` jadval 2026-05-14 da yaratilgan edi, lekin `/v1/ai/chat` va `/v1/admin/ai/chat` endpointlar hali bu jadvalga yozmayotgan edi. Bu billing uchun hal qiluvchi — har qaysi tenant qancha AI kredit sarflayotganini bilmasak, Phase 3 to'lov tizimi ishlay olmaydi.

### Bajarildi

**`insertAiUsageLog` helper funksiya (yangi, non-blocking):**
- `supabase.from("ai_usage_logs").insert(...)` — service_role client ishlatadi (RLS bypass)
- `provider` normalizatsiya: `"openai_fallback"` → `"openai"` (DB constraint: `('claude','openai','fallback')`)
- Non-blocking: `.then(({ error }) => ...)` — asosiy request sekinlamaydi
- `AiUsageLogEntry` type — typed interface

**`/v1/ai/chat` endpoint yangilandi:**
- `insertAiUsageLog()` chaqiriladi har AI so'rovdan keyin
- Saqlangan ma'lumotlar: `tenant_id`, `user_id`, `endpoint`, `model`, `provider`, `complexity`, `prompt_tokens`, `completion_tokens`, `cost_usd`, `cached`, `latency_ms`, `trace_id`

**`/v1/admin/ai/chat` endpoint yangilandi:**
- Token tracking o'zgaruvchilari qo'shildi: `adminModel`, `adminProvider`, `adminInputTokens`, `adminOutputTokens`, `adminCostUsd`, `adminCached`
- `callClaude()` va `callOpenAI()` javob ma'lumotlari to'planadi
- Admin chat uchun `ai_usage_logs` ga yozilmaydi (`tenant_id` FK bor, admin da tenant yo'q) — `console.info()` bilan loglanadi
- TODO: kelajakda `tenant_id nullable` yoki alohida `admin_ai_usage_logs`

**Aniqlik:**
- `/v1/docs/search` endpoint allaqachon mavjud (line 2916) — `ILIKE` bilan ishlaydi
- `match_documents()` pgvector funksiyasi bor, lekin OpenAI embedding kredit kerak — kredit kelgach ulash
- Vazifa 2 (`match_documents()` wiring) kreditga bog'liq, o'tkazib yuborildi

### Fayllar

- `supabase/functions/server/index.ts` (o'zgargan: `insertAiUsageLog` helper + 2 endpoint ulandi)

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
