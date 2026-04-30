# PLAN.md — AI Business Concierge

> Bosqichma-bosqich amalga oshirish rejasi
> Version: 2.0 | Yangilandi: 2026-04-16
> ⚡ BOZOR URGENTSIYASI: SQB "AI Maslahatchi" chiqqan — tezlashtirilgan jadval

---

## STRATEGIK KONTEKST

SQB davlat banki 2026 yilda "AI Maslahatchi" mahsulotini chiqardi. Bu:
- **Bozorni tasdiqlaydi** — talab bor, sarmoya oqlanadi
- **Bizni tezlashtirishga undaydi** — horizontal kundalik yechim bilan bozorga birinchi kirish kerak
- **Raqib emas, funnel** — SQB startup bosqichni qoplaydi, biz kundalik operatsiyalarni

**Maqsad:** 2026 Q2 (iyun) gacha Telegram MVP bilan bozorda bo'lish.

---

## TEZLASHTIRILGAN TIMELINE

```
Phase 0: Tayyorgarlik .............. Hafta 1-2    (o'zgarmadi)
Phase 1: Telegram MVP .............. Hafta 3-5    (4 haftadan → 3 haftaga ⚡)
Phase 2: Hujjatchi + Landing ....... Hafta 6-9    (4 hafta)
Phase 3: Savdo Bot + To'lov ....... Hafta 10-13  (4 hafta)
Phase 4: Admin + Polish ........... Hafta 14-17  (4 hafta)
Phase 5: Scale .................... Hafta 18-24  (7 hafta)
```

---

## PHASE 0: TAYYORGARLIK (Hafta 1-2)

**Maqsad:** Infra tayyor, AI ishlaydi, KB to'ldirilgan

### 0.1 LLM Migration (OpenAI → Claude) ⚡ BIRINCHI PRIORITET
- [ ] Anthropic SDK o'rnatish (Deno uchun)
- [ ] LLM Router service (`services/llm-router.ts`)
  - Complexity classifier (simple/document/analysis)
  - Haiku/Sonnet auto-selection
  - Cost tracking
  - Response caching (Supabase da)
  - Fallback logic
- [ ] Mavjud `/ai/chat` endpointni Claude ga o'tkazish
- [ ] 20 ta test savol (UZ + RU)
- [ ] OpenAI kodni fallback sifatida saqlash

### 0.2 Knowledge Base Setup ⚡ RAQOBAT USTUNLIGI
- [ ] pgvector extension enable (Supabase)
- [ ] `knowledge_base` jadvali + migration
- [ ] Knowledge Base service (`services/knowledge-base.ts`)
  - Embedding (OpenAI text-embedding-3-small)
  - Semantic search (cosine similarity)
  - Version management
- [ ] Dastlabki kontent (50+ savol-javob):
  - O'zbekiston 2026 soliq qoidalari (YaTT 1%, QQS 12%, foyda 15%)
  - Soliq hisobot muddatlari
  - Mehnat kodeksi asoslari
  - YaTT ro'yxatdan o'tish tartibi
  - **SQB qoplamaydigan** kundalik operatsion savollarga javoblar

### 0.3 Database Migration (12 ta yangi jadval)
- [ ] `subscriptions` — obunalar
- [ ] `payments` — to'lovlar
- [ ] `ai_conversations` — AI suhbatlar
- [ ] `ai_messages` — AI xabarlar
- [ ] `ai_feedback` — javob baholash
- [ ] `doc_templates` — hujjat shablonlar
- [ ] `doc_generated` — yaratilgan hujjatlar
- [ ] `sales_bots` — savdo botlar
- [ ] `catalogs` — mahsulot katalog
- [ ] `orders` — buyurtmalar
- [ ] `knowledge_base` — bilimlar bazasi (pgvector)
- [ ] `audit_log` — audit log
- [ ] `usage_tracking` — foydalanish hisobi
- [ ] RLS policies barcha yangi jadvallar uchun
- [ ] Performance indexes

### 0.4 Rol tizimi yangilash
- [ ] `SUPER_ADMIN` roli qo'shish
- [ ] `canAccess` funksiyasini yangilash
- [ ] Route guard yangilash

**Natija:** Claude API ishlaydi, KB 50+ savolga javob beradi, DB tayyor
**O'lchov:** 20 ta test savolga 90%+ aniq javob

---

## PHASE 1: TELEGRAM MVP (Hafta 3-5) ⚡ TEZLASHTIRILDI

**Maqsad:** Telegram botda AI Maslahatchi ishlaydi, 50 beta user
**Differensiator:** SQB faqat web/app — biz Telegram da, foydalanuvchi allaqachon bor

### 1.1 Telegram Bot Setup
- [ ] grammY framework setup (Supabase Edge Function)
- [ ] Bot webhook endpoint (`/v1/telegram/webhook`)
- [ ] Commands: `/start`, `/help`, `/language`, `/account`, `/history`
- [ ] Error handler — bot HECH QACHON crash bo'lmaydi

### 1.2 Onboarding Flow
- [ ] `/start` → til tanlash (UZ/RU inline keyboard)
- [ ] Salom + nima qila olishi tushuntirish
- [ ] Asosiy menu (reply keyboard):
  ```
  [💼 Maslahat olish]
  [📄 Hujjat yaratish]   (Phase 2 da ochiladi)
  [🛒 Savdo bot]          (Phase 3 da ochiladi)
  [⚙️ Sozlamalar]
  ```
- [ ] Supabase da user yaratish (Telegram ID → user)
- [ ] Tenant avtomatik yaratish

### 1.3 AI Maslahatchi (Module 1)
- [ ] Mavzu tanlash: Soliq | Kadrlar | Biznes | Boshqa
- [ ] AI pipeline:
  1. User xabar → LLM Router
  2. KB semantic search
  3. Prompt assembly (system + KB + user)
  4. Claude Haiku/Sonnet → javob
  5. Confidence check → disclaimer
  6. [👍] [👎] feedback tugmalari
- [ ] Suhbat konteksti (oxirgi 10 xabar)
- [ ] Usage tracking: bepul limit 5 so'rov/kun

### 1.4 Sifat tekshiruv
- [ ] 100 ta test savol (UZ + RU):
  - 30 soliq, 20 kadrlar, 20 tadbirkorlik, 15 murakkab, 15 "bilmasligi kerak"
- [ ] Automated test pipeline
- [ ] Maqsad: 90%+ aniqlik, <3s javob vaqti

### 1.5 Beta Launch ⚡
- [ ] 5 ta O'zbek Telegram developer guruhlarida e'lon
- [ ] **SQB mijozlarini target qilish** — "Kredit oldingizmi? Endi biznesni boshqarish uchun..."
- [ ] 50 beta user
- [ ] Feedback yig'ish
- [ ] Bug fix sprint

**Natija:** Bot live, 50 beta user, feedback yig'ilgan
**O'lchov:** 90%+ aniqlik, <3s, 50+ beta user, NPS 7+

---

## PHASE 2: HUJJATCHI + LANDING (Hafta 6-9)

**Maqsad:** Hujjat generatsiya, landing page
**Differensiator:** SQB faqat kredit hujjati — biz 15+ turdagi kundalik hujjat

### 2.1 AI Hujjatchi (Module 2)
- [ ] 15 ta shablon:
  - **Shartnomalar:** Ijara (turar-joy), Ijara (tijorat), Mehnat, Xizmat, Oldi-sotdi, Pudrat
  - **Arizalar:** YaTT ro'yxat, Soliq organiga, Ishga olish buyrug'i, Bo'shatish buyrug'i, Ta'til
  - **Boshqa:** Ishonchnoma, Tilxat, Qarz shartnomasi, Hamkorlik
- [ ] Generatsiya pipeline: shablon → AI savollar → to'ldirish → PDF/DOCX
- [ ] Noto Sans font (O'zbek/Rus harflar)
- [ ] Supabase Storage integratsiya

### 2.2 Telegram da Hujjatchi
- [ ] "📄 Hujjat yaratish" faollashtirish
- [ ] Step-by-step savol-javob flow
- [ ] Hujjat yuborish (Telegram document message)

### 2.3 Landing Page
- [ ] Hero: "Biznesingiz allaqachon ishlayaptimi? AI yordamchingiz shu yerda."
- [ ] 3 modul tushuntirish
- [ ] Narxlar, FAQ
- [ ] Mobile-first, UZ/RU, SEO

**Natija:** 15 shablon, landing live
**O'lchov:** Hujjat gen <10s, landing 90+ Lighthouse

---

## PHASE 3: SAVDO BOT + TO'LOV (Hafta 10-13)

**Maqsad:** Monetizatsiya, savdo bot
**Differensiator:** SQB savdo bot bermaydi — bu bizning eksklyuziv moduli

### 3.1 AI Sotuvchi (Module 3)
- [ ] Bot yaratish flow (token → katalog → aktivlash)
- [ ] Mijoz funksionalligi: mahsulotlar, buyurtma berish
- [ ] Tadbirkor uchun: katalog boshqarish, buyurtmalar, statistika

### 3.2 To'lov (Click + Payme)
- [ ] Click: Prepare + Complete + webhook (idempotent)
- [ ] Payme: CreateTransaction + PerformTransaction + webhook
- [ ] Subscription management (upgrade/downgrade, grace period 3 kun)

### 3.3 Usage Limiting
- [ ] Tarifga mos limit middleware
- [ ] Upsell xabar (limit yetganda)

**Natija:** To'lov ishlaydi, savdo bot ishlaydi, birinchi revenue
**O'lchov:** 99.9% to'lov ishonchlilik, 50+ pulli user, $200+ MRR

---

## PHASE 4: ADMIN + POLISH (Hafta 14-17)

**Maqsad:** Admin panel, sifat 95%+, barqarorlik

### 4.1 Super Admin Panel
- [ ] `/admin` — Statistika dashboard (users, revenue, AI usage, error rate)
- [ ] `/admin/tenants` — Tenant boshqarish
- [ ] `/admin/ai` — AI monitoring (so'rovlar, aniqlik, narx, KB gaps)
- [ ] `/admin/knowledge-base` — KB boshqarish
- [ ] `/admin/billing` — MRR, churn, LTV
- [ ] `/admin/audit` — Audit log

### 4.2 Sifat oshirish
- [ ] AI aniqlik 95%+ (salbiy feedback tahlil + KB gaps to'ldirish)
- [ ] API <200ms (AI bo'lmagan), <3s (Haiku), <8s (Sonnet)
- [ ] Sentry barcha xatolarni tuzatish
- [ ] UX polish (skeleton, micro-animation, empty states)

**Natija:** Admin panel to'liq, 95%+ AI aniqlik
**O'lchov:** 0 critical bug, admin to'liq

---

## PHASE 5: SCALE (Hafta 18-24)

**Maqsad:** 5,000+ user, $8,000+ MRR, IT Park

### 5.1 Marketing
- [ ] Telegram kanal (kontentlar)
- [ ] YouTube: "AI bilan biznes boshqarish" (o'zbek tilida)
- [ ] **SQB mijozlari uchun retargeting** — "Kredit oldingizmi? Endi boshqaring"
- [ ] Referral dasturi (invite → 1 oy bepul Pro)

### 5.2 IT Park
- [ ] IT Park rezident arizasi
- [ ] Digital Startups dasturi (soliq imtiyozlari 12%)
- [ ] Xalqaro akselerator ariza

### 5.3 Funksional kengaytirish
- [ ] my.soliq.uz integratsiya
- [ ] EHF (Elektron Hisob-Faktura)
- [ ] Bank statement import
- [ ] API access (Kompaniya tarifi)

### 5.4 Regional ekspansiya
- [ ] Qozog'iston, Qirg'iziston bozori tadqiqoti
- [ ] **Yapon bozori tadqiqoti** — `ja` lokalizatsiya allaqachon bor (HR Candidate Analysis modulidan)

---

## QO'SHIMCHA TEXNIK BACKLOG — 17 ta strategik talab

> Yuklangan `ai-business-concierge-promptlari.md` (2026-04-30) dan kelib chiqqan strategik talablar.
> Har biri PLAN.md ichidagi tegishli phase'ga taqsimlangan.

### Phase 0 — Foundation (qoldi)

#### B-005 · Database optimallashtirish (deleted_at + indexlar)
- [ ] Har asosiy jadvalga `deleted_at timestamptz null` (soft delete)
- [ ] Indexlar:
  - `tasks (tenant_id, status, deleted_at)`
  - `inbox_items (tenant_id, created_at, deleted_at)`
  - `notifications (user_id, read_at, created_at)`
- [ ] Full-text search: `documents` jadvalida GIN index (uz va ru tsvector)
- [ ] Partial index: `where deleted_at is null`
- [ ] Migration fayl: `20260501_db_optimization.sql`

#### B-006 · Audit log triggerlari
- [ ] Mavjud `audit_logs` jadvaliga schema audit:
  - `id, table_name, record_id, action, old_data jsonb, new_data jsonb`
  - `performed_by uuid, tenant_id text, created_at timestamptz`
- [ ] Postgres trigger'lar: `tasks`, `inbox_items`, `documents`, `hr_cases`
- [ ] Edge Function: `GET /v1/audit-logs` (faqat `leader|hr_admin|super_admin`)
- [ ] 90 kunlik retention — Postgres `pg_cron` yoki Supabase scheduled function

#### B-011 · Structured logging middleware
- [ ] Hono middleware: har request uchun structured JSON log
  - `timestamp, trace_id, tenant_id, user_id, method, path, duration_ms, status, error`
- [ ] Levels: DEBUG, INFO, WARN, ERROR
- [ ] Storage: Supabase `request_logs` jadval (allaqachon mavjud)
- [ ] 2s+ query'larga avtomat WARN

### Phase 1 — Telegram MVP (Hafta 3-5)

#### B-007 · AI Prompt injection protection
- [ ] Input sanitizatsiya: blocklist (`ignore previous instructions`, `system prompt`, `you are now`, `</system>`, `[INST]`, ...)
- [ ] Input validation: max 4000 token, HTML/script tag strip
- [ ] Prompt layering: foydalanuvchi xabari `User message:` blokida ajratilgan
- [ ] Rate limit: per user 10 xabar/daqiqa
- [ ] OpenAI Moderation API: toxic / hate / violence flag
- [ ] Implementatsiya: `services/ai-safety.ts` + `routes/ai.ts` middleware

#### B-008 · AI cost tracking dashboard (per tenant)
- [x] `ai_messages` jadval va cost ustun mavjud (Phase 0)
- [ ] `GET /v1/ai/usage` — tenant uchun aggregat (kun/oy)
- [ ] Plan limitlari: Free $5/oy, Pro $50/oy, Company cheksiz
- [ ] Limit oshganda chat'da "Limit tugadi, planni yangilang" xabari
- [ ] Admin dashboardda usage grafigi

#### B-014 · Semantic search (RAG)
- [x] pgvector + embedding pipeline mavjud (Phase 0.2)
- [ ] AI chat'da explicit "Hujjatlar orasida qidir" tool
- [ ] Embedding caching: bir xil query → in-memory map (5 min TTL)
- [ ] Top-5 chunks + citation in response

### Phase 2 — Hujjatchi + Landing (Hafta 6-9)

#### B-001 · Unit tests (Vitest + RTL)
- [ ] `vitest`, `@testing-library/react`, `jsdom` qo'shish (`frontend/package.json`)
- [ ] Module 1: `features/tasks/` — task CRUD + assignee notification
- [ ] Module 2: `features/inbox/` — kategoriya tasniflash + tenant isolation
- [ ] Mocks: `supabase` client, `useAuth`, `toast`
- [ ] Coverage threshold: 80%+ (CI'da fail bo'ladi)
- [ ] Sample test cases:
  - Task yaratganda assignee'ga notification ketadi
  - Boshqa tenant task'i ko'rinmaydi
  - Due_date o'tgan task overdue status oladi

#### B-013 · OpenAPI auto-generation
- [ ] `@hono/zod-openapi` + `scalar` o'rnatish
- [ ] Har endpoint uchun Zod schema (request body + response 200/400/401/403/500)
- [ ] Bearer JWT va `X-Tenant-Id` headerlar docs'da ko'rsatilgan
- [ ] Misol request/response har endpoint'da
- [ ] Endpoint: `GET /docs/api` (Scalar UI)

#### B-012 · Health check (kengaytirilgan)
- [ ] `GET /health` ni quyidagilarni tekshirsin:
  - Postgres `select 1` (latency_ms)
  - Supabase Auth ping
  - Anthropic API ping (cheap, faqat list models)
  - OpenAI API ping (embedding endpoint)
  - Resend API status
  - Realtime subscription status
- [ ] Output: `{"status": "healthy|degraded|unhealthy", "checks": {...}, "timestamp"}`
- [ ] Degraded → 200 (monitoring dashboard alert qiladi)

### Phase 3 — Savdo Bot + To'lov (Hafta 10-13)

#### B-003 · Async AI job pattern
- [ ] `ai_jobs` jadvali: `id, tenant_id, user_id, type, status, params jsonb, result jsonb, error, created_at, completed_at`
- [ ] `POST /v1/ai/jobs` → `{job_id, status: "pending"}` (darhol)
- [ ] Background processing — Edge Function ichida `EdgeRuntime.waitUntil()` yoki Supabase scheduled function
- [ ] Realtime broadcast: `ai_jobs` row update → frontend subscribe
- [ ] `GET /v1/ai/jobs/:id` — status + natija
- [ ] Timeout: 50s'gacha sync javob, undan keyin async route'ga tushadi
- [ ] **Kerak:** uzoq hisobotlar, HR Candidate Analysis (deep mode), bulk doc generation

#### B-004 · Rate limiting (sliding window)
- [ ] `rate_limits` jadvali: `(tenant_id, user_id, endpoint, count, window_start, reset_at)`
- [ ] Limitlar:
  - Tenant: 100 AI request/soat
  - User: 10 AI request/daqiqa
  - IP (auth'siz): 30 request/daqiqa
- [ ] Hono middleware: har request'da check
- [ ] Sliding window algorithm (deletion + insert har so'rovda)
- [ ] 429 + `Retry-After` header
- [ ] **Eslatma:** `services/usage-tracking.ts` mavjud (Phase 0) — uni kengaytiramiz

#### B-010 · Usage-based billing
- [ ] `plans` jadval (Free/Pro $29/Enterprise $99) — `subscriptions` da plan column allaqachon bor
- [ ] Limit ma'lumotlari: task count, AI credits, storage GB, user count
- [ ] Usage aggregation: `tasks.count`, `ai_usage.sum`, `storage.size`
- [ ] Billing cycle: oy boshidan oxirigacha
- [ ] Click + Payme integration (Phase 3 da yozilgan)
- [ ] Grace period: to'lov o'tmagan tenant `frozen` status (3 kun)

#### B-017 · Resend webhook idempotency
- [ ] `webhook_events` jadval: `idempotency_key, payload, processed_at, status`
- [ ] Bir xil `idempotency_key` (Resend signature) → 200 lekin re-process emas
- [ ] Failed event'lar uchun retry: 3 marta exponential backoff
- [ ] Admin dashboard: failed queue
- [ ] Signature verification: `RESEND_WEBHOOK_SECRET` HMAC

### Phase 4 — Admin + Polish (Hafta 14-17)

#### B-002 · E2E tests (Playwright)
- [ ] `@playwright/test` o'rnatish
- [ ] Test scenarios:
  1. Login → Dashboard → Task yaratish → AI Chat orqali task yaratish → Logout
  2. Multi-tenant isolation: User A tenant 1 task → User B tenant 2'da ko'rinmaydi
  3. Realtime: Browser A da task yaratish → Browser B avtomat yangilanadi
  4. Offline mode: Internet uzilsa form xato beradi (Service Worker)
- [ ] Lokal: `supabase start` bilan ishlaydi
- [ ] CI: GitHub Actions matrix (Chrome + Firefox + Safari)

#### B-015 · Multi-turn AI memory
- [x] `ai_conversations` + `ai_messages` mavjud (Phase 0)
- [ ] Har yangi chatda:
  - Oxirgi 10 xabar yuklanadi
  - 10+ bo'lsa eski xabarlar `summary` ga aylantiriladi (Haiku)
- [ ] Token limit: 4000 → eski tarix sumarize
- [ ] User "Kechagi vazifalarni eslaysanmi?" → tarix asosida javob

#### B-016 · GDPR / O'zbekiston data export
- [ ] `GET /v1/export/my-data` — auth'd user ma'lumotlari JSON
  - Profile (auth.users + user_tenants)
  - Tasks (yaratgan + assigned)
  - Inbox, notifications, AI history, HR cases
- [ ] Async: 50MB+ uchun job pattern (B-003)
- [ ] Email link: Resend orqali signed download URL
- [ ] `DELETE /v1/account` — soft delete + 30 kun grace + cron full delete
- [ ] RLS: faqat o'z ma'lumoti

### Phase 5 — Scale (Hafta 18-24)

#### B-009 · PWA implementatsiya
- [ ] `vite-plugin-pwa` qo'shish
- [ ] Service Worker:
  - Offline shell + asset caching
  - Task list IndexedDB cache
  - Background Sync API: offline yaratilgan tasklar internet kelganda push
- [ ] Web Push notifications:
  - Supabase Realtime → service worker → notification
  - Use cases: task assigned, deadline yaqin
- [ ] App manifest: ikonka, theme color (Indigo), `display: standalone`
- [ ] Mobile UX: task board mobile-friendly drag, AI chat optimized

---

## TAQSIMOT MATRIXI

| ID | Vazifa | Phase | Effort | Status |
|---|---|---|---|---|
| B-001 | Unit tests (Vitest) | Phase 2 | M | TODO |
| B-002 | E2E tests (Playwright) | Phase 4 | L | TODO |
| B-003 | Async AI job pattern | Phase 3 | M | TODO |
| B-004 | Rate limiting | Phase 3 | M | Partial (usage-tracking mavjud) |
| B-005 | DB optimization | Phase 0 | S | TODO |
| B-006 | Audit log triggers | Phase 0 | M | TODO |
| B-007 | Prompt injection protection | Phase 1 | M | TODO |
| B-008 | AI cost dashboard | Phase 1 | S | Partial (cost tracking mavjud) |
| B-009 | PWA | Phase 5 | L | TODO |
| B-010 | Usage-based billing | Phase 3 | L | Partial |
| B-011 | Structured logging | Phase 0 | S | Partial |
| B-012 | Health check | Phase 2 | S | Partial (`/health` mavjud) |
| B-013 | OpenAPI auto-gen | Phase 2 | M | TODO |
| B-014 | Semantic search RAG | Phase 1 | S | Done (Phase 0.2) |
| B-015 | Multi-turn AI memory | Phase 4 | M | TODO |
| B-016 | GDPR data export | Phase 4 | M | TODO |
| B-017 | Resend webhook idempotency | Phase 3 | S | TODO |

**Effort:** S=1-3 kun · M=1 hafta · L=2 hafta

---

## HAFTALIK RITM

```
Dushanba:    Sprint planning (1 soat)
Seshanba-Juma: Build (1-2 soat/kun)
Shanba:      Review + Deploy (1 soat)
Yakshanba:   Dam olish + Feedback o'qish
```

---

## SUCCESS METRICS

| Ko'rsatkich | Phase 1 | Phase 3 | Phase 5 |
|---|---|---|---|
| Users (total) | 50 | 500 | 5,000 |
| Pulli users | 0 | 50 | 2,000 |
| MRR | $0 | $200 | $8,000 |
| AI aniqlik | 90% | 93% | 95%+ |
| Javob vaqti (Haiku) | <5s | <3s | <2s |
| Hujjat shablonlar | 0 | 15 | 30+ |
| KB articles | 50 | 200 | 500+ |
| SQB dan konvertatsiya | — | 10% | 20% |

---

*PLAN.md — AI Business Concierge v2.1*
*Yangilandi: 2026-04-30 — 17 ta strategik talab phase'larga taqsimlangan (B-001 ... B-017)*
*Avvalgi: v2.0 (2026-04-16) — SQB raqobati kontekstida tezlashtirilgan jadval*
*Ishga kirishamiz! 🚀*

---

## CHANGELOG

| Sana | Versiya | O'zgarish |
|---|---|---|
| 2026-04-30 | v2.1 | 17 strategik talab phase'larga taqsimlangan (B-001..B-017) — testing, async jobs, rate limiting, audit log, prompt injection, RAG memory, GDPR, PWA |
| 2026-04-29 | v2.0+ | Phase 0 yakuni: 12 jadval RLS, security hardening, LLM Router, KB pgvector, AI feedback, Indigo+Slate tema, CONNECTIONS.md, FIRST_PUSH.md |
| 2026-04-16 | v2.0 | SQB raqobati tahlili + Telegram MVP timeline tezlashtirilgan |
