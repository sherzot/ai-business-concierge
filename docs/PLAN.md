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
Phase 0:   Tayyorgarlik ............... Hafta 1-2    ✅ YAKUNLANDI
Phase 1:   Telegram MVP ............... Hafta 3-5    ✅ YAKUNLANDI
Phase 1.5: Company Auth & Management .. Hafta 6-8    ✅ YAKUNLANDI
Phase 2:   Hujjatchi + Web Landing .... Hafta 9-12   🚧 BOSHLANDI
Phase 3:   Savdo Bot + To'lov ......... Hafta 13-16  (4 hafta)
Phase 4:   Admin AI + Polish .......... Hafta 17-20  (4 hafta)
Phase 5:   Scale ...................... Hafta 21-27  (7 hafta)
```

> **Nima uchun Phase 1.5 DARHOL:** Billing/payments qismi ishlashi uchun kompaniyalar to'g'ri ro'yxatdan o'tgan, tasdiqlangan va rollarga bo'lingan bo'lishi SHART. Ro'yxatdan o'tish → billing → daromad zanjiri shu phaseda yotadi.

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

---

## PHASE 1.5: COMPANY AUTH & MANAGEMENT (Hafta 6-8) ✅ YAKUNLANDI

**Maqsad:** Kompaniya onboarding, xodim onboarding, rol tizimi, login/auth UX — billing uchun SHART
**Nima uchun hozir:** Billing ishlashi uchun kompaniyalar to'g'ri ro'yxatda bo'lishi, rollari aniq bo'lishi kerak.

---

### 1.5.1 Database — Yangi jadvallar va o'zgarishlar

#### A. `contact_requests` jadvali (yangi)
```sql
CREATE TABLE contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  company_name text,
  stir text,
  phone text NOT NULL,
  email text NOT NULL,
  business_type text,        -- yatt, llc, jsc, other
  employee_count text,        -- 1-10, 11-50, 51-200, 200+
  message text,
  source text,                -- ads, referral, search, telegram
  status text DEFAULT 'new',  -- new, contacted, invite_sent, registered, rejected
  admin_note text,
  invite_token text,
  invite_expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
-- RLS: faqat super_admin/sub_admin ko'radi
```

#### B. `tenants` jadvaliga yangi ustunlar
```sql
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS
  status text DEFAULT 'active',        -- pending_approval, active, suspended, blocked
  legal_form text,                     -- yatt, llc, jsc
  stir text,
  legal_address text,
  activity_type text,
  registration_date date,
  bank_name text,
  bank_account text,
  employee_count_range text,
  contact_request_id uuid REFERENCES contact_requests(id),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  blocked_reason text;
```

#### C. `user_tenants` rollarini yangilash
```sql
-- Yangi rollar: super_admin, sub_admin, company_admin, hr, accountant, manager, employee
-- Mavjud rollarni mapping: leader → company_admin, hr → hr, accounting → accountant, department_head → manager
ALTER TABLE user_tenants DROP CONSTRAINT IF EXISTS user_tenants_role_check;
ALTER TABLE user_tenants ADD CONSTRAINT user_tenants_role_check
  CHECK (role IN ('super_admin','sub_admin','company_admin','hr','accountant','manager','employee'));
```

#### D. `employee_invites` jadvali (xodim invite token)
```sql
CREATE TABLE employee_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  tenant_id uuid REFERENCES tenants(id),
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_by uuid REFERENCES auth.users(id), -- HR
  status text DEFAULT 'pending',  -- pending, used, expired
  created_at timestamptz DEFAULT now()
);
```

#### E. RLS policies
- `contact_requests`: SELECT/UPDATE faqat super_admin/sub_admin
- `tenants`: company_admin o'z tenantini, super_admin/sub_admin hammasini
- `employee_invites`: HR o'z tenantidagi invitlarni, super_admin/sub_admin hammasini

---

### 1.5.2 Backend API — Yangi endpoint'lar

#### Murojaat (public)
```
POST /v1/contact              — murojaat formasi yuborish (public, rate limited)
```

#### Admin — Kompaniya boshqarish
```
GET  /v1/admin/contacts               — murojaat ro'yxati (super/sub admin)
PATCH /v1/admin/contacts/:id/status   — status o'zgartirish (contacted, rejected)
POST /v1/admin/contacts/:id/invite    — invite URL yuborish → email + token yaratish
GET  /v1/admin/companies              — kompaniyalar ro'yxati (filtrlash: status bo'yicha)
GET  /v1/admin/companies/:id          — kompaniya tafsilotlari
PATCH /v1/admin/companies/:id/approve — tasdiqlash
PATCH /v1/admin/companies/:id/block   — bloklash (sabab bilan)
PATCH /v1/admin/companies/:id/suspend — to'xtatish
```

#### Kompaniya ro'yxatdan o'tish (public, token bilan)
```
GET  /v1/register/validate/:token     — token haqiqiyligi tekshirish
POST /v1/register/company             — kompaniya ro'yxatdan o'tish (invite token bilan)
```

#### Xodim onboarding (tenant ichida, HR)
```
POST /v1/employees              — yangi xodim + invite email yuborish
GET  /v1/employees              — xodimlar ro'yxati
GET  /v1/employees/:id          — xodim tafsilotlari
PATCH /v1/employees/:id/confirm — xodim accountini tasdiqlash (HR)
PATCH /v1/employees/:id/block   — bloklash
POST /v1/employees/:id/resend-invite — qayta invite yuborish
```

#### Xodim parol o'rnatish (public, token bilan)
```
GET  /v1/invite/validate/:token — token tekshirish
POST /v1/invite/set-password    — parol o'rnatish (Supabase Auth orqali)
```

#### Auth (mavjudni kengaytirish)
```
POST /v1/auth/forgot-password   — parol tiklash email (Supabase built-in)
POST /v1/auth/reset-password    — yangi parol o'rnatish
```

---

### 1.5.3 Frontend — Yangi sahifalar

#### Public sahifalar
- [ ] `/contact` — Murojaat sahifasi (forma + tushuntirish)
  - Forma: full_name, company_name, phone, email, business_type, employee_count, message, source
  - Yuborilgandan keyin: tasdiqlash xabari + aloqa ma'lumotlari
- [ ] `/register?token=...` — Kompaniya ro'yxatdan o'tish (invite token bilan)
  - Token validation (invalid/expired → xato sahifasi)
  - 2 qadam: kompaniya ma'lumotlari → admin credentials
  - Muvaffaqiyat: "Kutilmoqda" sahifasi
- [ ] `/set-password?token=...` — Xodim parol o'rnatish
  - Token validation
  - Email ko'rsatiladi (o'zgartirish yo'q)
  - Parol kuchi ko'rsatkichi
  - Muvaffaqiyat: "HR tasdiqlashini kuting"
- [ ] `/login` — Yangilangan (status xabarlari, murojaat havolasi)
- [ ] `/forgot-password` — Parol tiklash
- [ ] `/reset-password?token=...` — Yangi parol

#### Admin sahifalar (super_admin/sub_admin)
- [ ] `/admin/contacts` — Murojaat boshqarish
  - Jadval: ism, kompaniya, telefon, email, sana, status
  - Filtrlash: status bo'yicha
  - Har bir murojaat: ko'rish, status o'zgartirish, invite yuborish, rad etish
  - Invite yuborishda: email preview, tasdiq modal
- [ ] `/admin/companies` — Kompaniyalar ro'yxati
  - Filtrlash: status (pending_approval, active, suspended, blocked)
  - Har bir kompaniya: ko'rish, tasdiqlash, bloklash, to'xtatish
  - Kompaniya tafsiloti: barcha ma'lumotlar, xodimlar soni, AI usage, billing
- [ ] `/admin/health` — Tizim holati
- [ ] `/admin/ai-chat` — Admin AI yordamchisi (Phase 4 da to'liq)

#### Company sahifalar
- [ ] `/app/employees` — Xodimlar ro'yxati + boshqarish
  - Yangi xodim qo'shish (to'liq forma, Section 12.1)
  - Xodim holati: password_pending, password_set, active, blocked
  - Har bir xodim: ko'rish, tasdiqlash, bloklash, qayta invite
  - Tizim bildirishnomasi: "Darhol qo'ng'iroq qiling" ogohlantirishi
- [ ] `/app/employees/:id` — Xodim profili (to'liq)
- [ ] `/app/company-profile` — Kompaniya profili (tahrirlash)

---

### 1.5.4 Email shablonlar (Resend)

```
1. company_invite.html       — Kompaniyaga invite URL (siz uchun ro'yxatdan o'tish havolasi)
2. company_pending.html      — Ro'yxatdan o'tgandan keyin (tasdiqlash kutilmoqda)
3. company_approved.html     — Tasdiqlanganda (tizimga kiring)
4. company_rejected.html     — Rad etilganda (sabab + aloqa)
5. employee_invite.html      — Xodimga parol o'rnatish URL
6. employee_approved.html    — Xodim accounti tasdiqlanganda
7. password_reset.html       — Parol tiklash URL
```

---

### 1.5.5 Bildirishnoma tizimi (in-app)

Admin uchun:
- Yangi murojaat keldi
- Yangi kompaniya ro'yxatdan o'tdi (pending_approval)

HR uchun (real-time):
- "✅ [Ism] accounti yaratildi — 📞 Darhol qo'ng'iroq qiling: [telefon]"
- "🔔 [Ism] parolini o'rnatdi — Tasdiqlang: [havola]"

Xodim uchun:
- "✅ Accountingiz tasdiqlandi — Kiring: [URL]"

---

### 1.5.6 Xavfsizlik talablari

- [ ] Invite token: `crypto.randomUUID()` asosida JWT, RS256, 1 martalik
- [ ] Kompaniya invite: 48 soat TTL
- [ ] Xodim invite: 24 soat TTL
- [ ] Parol kuchi: min 8 belgi, katta harf, kichik harf, raqam
- [ ] Brute force: 5 marta noto'g'ri login → 15 daqiqa bloklash
- [ ] RLS: har bir jadvalda tenant isolation
- [ ] Audit log: har bir rol o'zgarishi, tasdiqlash/bloklash yoziladi
- [ ] HTTPS: barcha invite/reset URL'lar

---

**Phase 1.5 natijasi:** Kompaniyalar to'g'ri ro'yxatdan o'ta oladi, xodimlar xavfsiz account oladi, billing uchun asos tayyor.
**O'lchov:** Murojaat → Active account: <48 soat. Xodim onboarding: <24 soat. 0 ta xavfsizlik teshigi.

---

## PHASE 2: HUJJATCHI + WEB LANDING (Hafta 9-12)

**Maqsad:** Hujjat generatsiya, landing page
**Differensiator:** SQB faqat kredit hujjati — biz 15+ turdagi kundalik hujjat

### 2.1 AI Hujjatchi (Module 2)
- [x] 15 ta shablon (seed migration production'ga deploy qilindi):
  - **Shartnomalar:** Ijara (turar-joy), Ijara (tijorat), Mehnat, Xizmat, Oldi-sotdi, Pudrat
  - **Arizalar:** YaTT ro'yxat, Soliq organiga, Ishga olish buyrug'i, Bo'shatish buyrug'i, Ta'til
  - **Boshqa:** Ishonchnoma, Tilxat, Qarz shartnomasi, Hamkorlik
- [x] Qoralama pipeline: shablon → dinamik maydonlar → `documents` + `doc_generated`
- [ ] AI savollar/polish → haqiqiy PDF/DOCX binary
- [ ] Noto Sans font (O'zbek/Rus harflar)
- [ ] Supabase Storage integratsiya

### 2.2 Telegram da Hujjatchi
- [ ] "📄 Hujjat yaratish" faollashtirish
- [ ] Step-by-step savol-javob flow
- [ ] Hujjat yuborish (Telegram document message)

### 2.3 Landing Page
- [x] Hero: "Biznesingiz allaqachon ishlayaptimi? AI yordamchingiz shu yerda."
- [x] 3 modul tushuntirish
- [x] Narxlar, FAQ
- [x] Mobile-first, UZ/RU, SEO

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

## PHASE 4: ADMIN AI + POLISH (Hafta 17-20)

**Maqsad:** Admin AI tizimi to'liq, sifat 95%+, barqarorlik
**Eslatma:** Phase 1.5 da admin panel asoslari qo'yiladi. Bu phase da AI agentlar va to'liq monitoring qo'shiladi.

### 4.1 Super Admin Panel — To'liq
- [ ] `/admin` — Statistika dashboard (users, revenue, AI usage, error rate, churn)
- [ ] `/admin/companies` — Kompaniyalar (Phase 1.5 da boshlangan → to'liqlashtirish)
- [ ] `/admin/contacts` — Murojaat CRM (Phase 1.5 dan → to'liqlashtirish)
- [ ] `/admin/ai` — AI monitoring (so'rovlar, aniqlik, narx, KB gaps, trend grafiklari)
- [ ] `/admin/knowledge-base` — KB boshqarish (CRUD, versioning, qo'llash)
- [ ] `/admin/billing` — MRR, churn, LTV, to'lov tarixi
- [ ] `/admin/audit` — Audit log (global, filter: kompaniya, foydalanuvchi, harakat)
- [ ] `/admin/health` — Real-time tizim holati (Phase 1.5 dan kengaytirish)

### 4.2 Admin AI Yordamchisi (`/admin/ai-chat`) — To'liq
- [ ] KB Agent: bo'shliqlar, outdated javoblar, yangi kontent taklif
- [ ] Support Agent: kompaniya muammolarini tushuntirish, yechim taklif
- [ ] Analytics Agent: MRR sabablar, churn tahlil, foydalanish pattern
- [ ] Health Agent: anomaliya aniqlash, real-time ogohlantirishlar
- [ ] Maxsus kontekst: admin dashboard ma'lumotlari agentga uzatiladi

### 4.3 Sifat oshirish
- [ ] AI aniqlik 95%+ (salbiy feedback tahlil + KB gaps to'ldirish)
- [ ] API <200ms (AI bo'lmagan), <3s (Haiku), <8s (Sonnet)
- [ ] Sentry barcha xatolarni tuzatish
- [ ] UX polish (skeleton, micro-animation, empty states)
- [ ] Mobile testing (barcha sahifalar)

**Natija:** Admin AI tizimi to'liq, 95%+ AI aniqlik, barqaror tizim
**O'lchov:** 0 critical bug, admin to'liq, AI agentlar ishlaydi

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
| B-018 | Contact requests (murojaat forma + admin CRM) | Phase 1.5 | M | DONE |
| B-019 | Company registration flow (invite → register → approve) | Phase 1.5 | L | DONE |
| B-020 | Employee onboarding (HR creates → email → password → HR confirms) | Phase 1.5 | L | DONE |
| B-021 | Login page UX (status xabarlari, murojaat havolasi) | Phase 1.5 | S | DONE |
| B-022 | Forgot/Reset password pages | Phase 1.5 | S | DONE |
| B-023 | Role system update (super_admin/sub_admin/company_admin/hr/accountant/manager/employee) | Phase 1.5 | M | DONE |
| B-024 | Admin company management (/admin/companies, /admin/contacts) | Phase 1.5 | M | DONE |
| B-025 | Employee management UI (/app/employees — full CRUD + onboarding) | Phase 1.5 | M | DONE |
| B-026 | Email templates (7 ta: invite, approved, rejected, employee onboarding) | Phase 1.5 | S | DONE |
| B-027 | In-app notifications for HR (real-time: qo'ng'iroq qiling ogohlantirishlari) | Phase 1.5 | S | DONE |
| B-028 | /admin/health — tizim holati monitoring | Phase 1.5 | M | DONE |
| B-029 | Admin AI chat (/admin/ai-chat — basic) | Phase 1.5 | M | DONE |
| B-030 | Admin AI Agents (KB, Support, Analytics, Health) | Phase 4 | L | TODO |
| B-001 | Unit tests (Vitest) | Phase 2 | M | Partial (89 test yashil) |
| B-002 | E2E tests (Playwright) | Phase 4 | L | TODO |
| B-003 | Async AI job pattern | Phase 3 | M | TODO |
| B-004 | Rate limiting | Phase 3 | M | Partial (usage-tracking mavjud) |
| B-005 | DB optimization | Phase 0 | S | DONE |
| B-006 | Audit log triggers | Phase 0 | M | DONE |
| B-007 | Prompt injection protection | Phase 1 | M | DONE |
| B-008 | AI cost dashboard | Phase 1 | S | DONE |
| B-009 | PWA | Phase 5 | L | Partial (manifest + offline shell) |
| B-010 | Usage-based billing | Phase 3 | L | Partial |
| B-011 | Structured logging | Phase 0 | S | DONE |
| B-012 | Health check | Phase 2 | S | Partial (`/health` mavjud) |
| B-013 | OpenAPI auto-gen | Phase 2 | M | DONE |
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

*PLAN.md — AI Business Concierge v3.0*
*Yangilandi: 2026-07-24 — Phase 1.5 yakuni, Phase 2 starti va backlog holatlari kod/DEVLOG bilan sinxronlandi*
*Avvalgi: v2.1 (2026-04-30) — 17 strategik talab, v2.0 (2026-04-16) — SQB raqobati*

---

## CHANGELOG

| Sana | Versiya | O'zgarish |
|---|---|---|
| 2026-07-24 | v3.1 | Phase 1.5 yakuni va Phase 2 starti tasdiqlandi; backlog kod va DEVLOG bilan sinxronlandi. |
| 2026-05-06 | v3.0 | Phase 1.5 qo'shildi (Company Auth & Management — DARHOL). Rol arxitekturasi: super_admin/sub_admin/company_admin. B-018..B-030 backlog. Phase 4 Admin AI kengaytirildi. |
| 2026-04-30 | v2.1 | 17 strategik talab phase'larga taqsimlandi (B-001..B-017) |
| 2026-04-29 | v2.0+ | Phase 0 yakuni: 12 jadval, LLM Router, KB pgvector |
| 2026-04-16 | v2.0 | SQB raqobati tahlili + Telegram MVP timeline tezlashtirilgan |
