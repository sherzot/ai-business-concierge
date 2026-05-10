# PLAN.md — AI Business Concierge

> Bosqichma-bosqich amalga oshirish rejasi
> Version: 3.0 | Yangilandi: 2026-05-06
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
Phase 1.5: Company Auth & Management .. Hafta 6-8    ⚡ DARHOL — billing uchun SHART
Phase 2:   Hujjatchi + Web Landing .... Hafta 9-12   (4 hafta)
Phase 3:   Savdo Bot + To'lov ......... Hafta 13-16  (4 hafta)
Phase 4:   Admin AI + Polish .......... Hafta 17-20  (4 hafta)
Phase 5:   Scale ...................... Hafta 21-27  (7 hafta)
```

> **Nima uchun Phase 1.5 DARHOL:** Billing ishlashi uchun kompaniyalar to'g'ri ro'yxatdan o'tgan, tasdiqlangan va rollarga bo'lingan bo'lishi SHART.

---

## PHASE 0: TAYYORGARLIK (Hafta 1-2) ✅ YAKUNLANDI

**Maqsad:** Infra tayyor, AI ishlaydi, KB to'ldirilgan

### 0.1 LLM Migration (OpenAI → Claude)
- [x] Anthropic SDK o'rnatish (Deno uchun)
- [x] LLM Router service (`services/llm-router.ts`) — Haiku/Sonnet auto-selection, cost tracking, caching
- [x] Mavjud `/ai/chat` endpointni Claude ga o'tkazish
- [x] OpenAI kodni fallback sifatida saqlash

### 0.2 Knowledge Base Setup
- [x] pgvector extension enable (Supabase)
- [x] `knowledge_base` jadvali + migration
- [x] Knowledge Base service — embedding (OpenAI text-embedding-3-small), semantic search
- [x] Dastlabki kontent (50+ savol-javob): soliq qoidalari, muddatlar, mehnat kodeksi

### 0.3 Database Migration (12 ta yangi jadval)
- [x] `subscriptions`, `payments`, `ai_conversations`, `ai_messages`, `ai_feedback`
- [x] `doc_templates`, `doc_generated`, `sales_bots`, `catalogs`, `orders`
- [x] `knowledge_base` (pgvector), `audit_log`, `usage_tracking`
- [x] RLS policies + Performance indexes

**Natija:** Claude API ishlaydi, KB 50+ savolga javob beradi, DB tayyor

---

## PHASE 1: TELEGRAM MVP (Hafta 3-5) ✅ YAKUNLANDI

**Maqsad:** Telegram botda AI Maslahatchi ishlaydi, 50 beta user

### 1.1 Telegram Bot Setup
- [x] grammY framework setup (Supabase Edge Function)
- [x] Commands: `/start`, `/help`, `/language`, `/stats`
- [x] Error handler — bot HECH QACHON crash bo'lmaydi

### 1.2 Onboarding Flow
- [x] `/start` → til tanlash (UZ/RU/EN/JA)
- [x] Qaytuvchi foydalanuvchi farqi
- [x] Rate limit: 5 so'rov/kun (bepul)

### 1.3 AI Maslahatchi (Module 1)
- [x] AI pipeline: xabar → LLM Router → KB semantic search → Claude → javob
- [x] Confidence check → disclaimer
- [x] Feedback: [👍] [👎]
- [x] Qolgan limit ko'rsatish

### 1.4 Beta Launch
- [x] 50 beta user
- [x] Feedback yig'ish

**Natija:** Bot live, 50 beta user, 90%+ aniqlik, <3s javob

---

## PHASE 1.5: COMPANY AUTH & MANAGEMENT (Hafta 6-8) ⚡ DARHOL

**Maqsad:** Kompaniya onboarding, xodim onboarding, rol tizimi, billing uchun asos
**Nima uchun hozir:** Billing ishlashi uchun kompaniyalar to'g'ri ro'yxatda bo'lishi SHART.

### 1.5.1 Database — Yangi jadvallar

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
  employee_count text,       -- 1-10, 11-50, 51-200, 200+
  message text,
  source text,               -- ads, referral, search, telegram
  status text DEFAULT 'new', -- new, contacted, invite_sent, registered, rejected
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
  status text DEFAULT 'active',  -- pending_approval, active, suspended, blocked
  legal_form text,               -- yatt, llc, jsc
  stir text,
  legal_address text,
  activity_type text,
  bank_name text,
  bank_account text,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  blocked_reason text;
```

#### C. `user_tenants` rollarini yangilash
```sql
ALTER TABLE user_tenants ADD CONSTRAINT user_tenants_role_check
  CHECK (role IN ('super_admin','sub_admin','company_admin','hr','accountant','manager','employee'));
```

#### D. `employee_invites` jadvali
```sql
CREATE TABLE employee_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  tenant_id uuid REFERENCES tenants(id),
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  status text DEFAULT 'pending',  -- pending, used, expired
  created_at timestamptz DEFAULT now()
);
```

### 1.5.2 Backend API — Yangi endpoint'lar

```
POST /v1/contact                          — murojaat formasi (public)
GET  /v1/admin/contacts                   — murojaat ro'yxati
PATCH /v1/admin/contacts/:id/status       — status o'zgartirish
POST /v1/admin/contacts/:id/invite        — invite URL yuborish
GET  /v1/admin/companies                  — kompaniyalar ro'yxati
PATCH /v1/admin/companies/:id/approve     — tasdiqlash
PATCH /v1/admin/companies/:id/block       — bloklash
GET  /v1/register/validate/:token         — token tekshirish
POST /v1/register/company                 — kompaniya ro'yxat
POST /v1/employees                        — yangi xodim
PATCH /v1/employees/:id/confirm           — xodimni tasdiqlash
POST /v1/employees/:id/resend-invite      — qayta invite
GET  /v1/invite/validate/:token           — xodim token tekshirish
POST /v1/invite/set-password              — parol o'rnatish
```

### 1.5.3 Frontend — Yangi sahifalar

**Public:**
- [x] `/contact` — Murojaat sahifasi
- [x] `/register?token=...` — Kompaniya ro'yxatdan o'tish
- [x] `/set-password?token=...` — Xodim parol o'rnatish
- [x] `/login` — Yangilangan (status xabarlari)
- [x] `/forgot-password`, `/reset-password?token=...`

**Admin:**
- [x] `/admin/contacts` — Murojaat boshqarish
- [x] `/admin/companies` — Kompaniyalar ro'yxati
- [x] `/admin/health` — Tizim holati
- [x] `/admin/ai-chat` — Admin AI yordamchisi (asosiy)

**Company:**
- [x] `/app/employees` — Xodimlar ro'yxati + boshqarish
- [x] `/app/employees/:id` — Xodim profili

### 1.5.4 Email shablonlar (Resend)

```
1. company_invite.html       — Kompaniyaga invite URL
2. company_pending.html      — Ro'yxatdan o'tgandan keyin
3. company_approved.html     — Tasdiqlanganda
4. company_rejected.html     — Rad etilganda
5. employee_invite.html      — Xodimga parol o'rnatish URL
6. employee_approved.html    — Xodim tasdiqlanganda
7. password_reset.html       — Parol tiklash
```

### 1.5.5 Xavfsizlik talablari

- Invite token: JWT, RS256, bir martalik
- Kompaniya invite: 48 soat TTL
- Xodim invite: 24 soat TTL
- Parol kuchi: min 8 belgi, katta+kichik harf+raqam
- Brute force: 5 noto'g'ri → 15 daqiqa bloklash

**Phase 1.5 natijasi:** Kompaniyalar to'g'ri ro'yxatdan o'ta oladi, xodimlar xavfsiz account oladi, billing uchun asos tayyor.

---

## PHASE 2: HUJJATCHI + WEB LANDING (Hafta 9-12)

**Maqsad:** Hujjat generatsiya, landing page

### 2.1 AI Hujjatchi (Module 2)
- [ ] 15 ta shablon: Shartnomalar (ijara, mehnat, xizmat), Arizalar, Boshqalar
- [ ] Generatsiya pipeline: shablon → AI savollar → to'ldirish → PDF/DOCX
- [ ] Noto Sans font (O'zbek/Rus harflar)
- [ ] Supabase Storage integratsiya

### 2.2 Telegram da Hujjatchi
- [ ] Step-by-step savol-javob flow
- [ ] Hujjat yuborish (Telegram document message)

### 2.3 Landing Page
- [ ] Hero, 3 modul, Narxlar, FAQ
- [ ] Mobile-first, UZ/RU/EN/JA, SEO

**Natija:** 15 shablon, landing live, hujjat gen <10s

---

## PHASE 3: SAVDO BOT + TO'LOV (Hafta 13-16)

**Maqsad:** Monetizatsiya, savdo bot

### 3.1 AI Sotuvchi (Module 3)
- [ ] Bot yaratish flow (token → katalog → aktivlash)
- [ ] Mijoz funksionalligi: mahsulotlar, buyurtma berish
- [ ] Tadbirkor uchun: katalog, buyurtmalar, statistika

### 3.2 To'lov (Click + Payme)
- [ ] Click: Prepare + Complete + webhook (idempotent)
- [ ] Payme: CreateTransaction + PerformTransaction + webhook
- [ ] Subscription management (upgrade/downgrade, grace period 3 kun)

### 3.3 Usage Limiting
- [ ] Tarifga mos limit middleware
- [ ] Upsell xabar (limit yetganda)

**Natija:** To'lov ishlaydi, savdo bot ishlaydi, birinchi revenue
**O'lchov:** 50+ pulli user, $200+ MRR

---

## PHASE 4: ADMIN AI + POLISH (Hafta 17-20)

**Maqsad:** Admin AI tizimi to'liq, sifat 95%+

### 4.1 Super Admin Panel — To'liq
- [ ] `/admin` — Statistika dashboard
- [ ] `/admin/ai` — AI monitoring (aniqlik, narx, KB gaps, trend grafiklari)
- [ ] `/admin/knowledge-base` — KB boshqarish (CRUD, versioning)
- [ ] `/admin/billing` — MRR, churn, LTV
- [ ] `/admin/audit` — Audit log (global)

### 4.2 Admin AI Agentlar (`/admin/ai-chat`) — To'liq
- [ ] KB Agent: bo'shliqlar, outdated javoblar, yangi kontent taklif
- [ ] Support Agent: kompaniya muammolarini tushuntirish
- [ ] Analytics Agent: MRR, churn, foydalanish pattern
- [ ] Health Agent: anomaliya aniqlash, real-time ogohlantirishlar

### 4.3 Sifat oshirish
- [ ] AI aniqlik 95%+ 
- [ ] API <200ms (AI bo'lmagan), <3s (Haiku), <8s (Sonnet)
- [ ] Mobile testing (barcha sahifalar)

**Natija:** Admin AI tizimi to'liq, 95%+ AI aniqlik, barqaror tizim

---

## PHASE 5: SCALE (Hafta 21-27)

**Maqsad:** 5,000+ user, $8,000+ MRR, IT Park

### 5.1 Marketing
- [ ] Telegram kanal (kontentlar)
- [ ] YouTube: "AI bilan biznes boshqarish"
- [ ] SQB mijozlari uchun retargeting
- [ ] Referral dasturi (invite → 1 oy bepul Pro)

### 5.2 IT Park
- [ ] IT Park rezident arizasi
- [ ] Digital Startups dasturi (soliq imtiyozlari 12%)

### 5.3 Funksional kengaytirish
- [ ] my.soliq.uz integratsiya
- [ ] EHF (Elektron Hisob-Faktura)
- [ ] Bank statement import
- [ ] API access (Kompaniya tarifi)

### 5.4 Regional ekspansiya
- [ ] Qozog'iston, Qirg'iziston bozori tadqiqoti
- [ ] Yapon bozori tadqiqoti (`ja` lokalizatsiya allaqachon bor)

---

## BACKLOG TAQSIMOTI

| ID | Vazifa | Phase | Effort | Status |
|---|---|---|---|---|
| B-018 | Contact requests (murojaat forma + admin CRM) | Phase 1.5 | M | TODO |
| B-019 | Company registration flow | Phase 1.5 | L | TODO |
| B-020 | Employee onboarding | Phase 1.5 | L | DONE |
| B-021 | Login page UX | Phase 1.5 | S | DONE |
| B-022 | Forgot/Reset password pages | Phase 1.5 | S | DONE |
| B-023 | Role system update | Phase 1.5 | M | DONE |
| B-024 | Admin company management | Phase 1.5 | M | DONE |
| B-025 | Employee management UI | Phase 1.5 | M | DONE |
| B-026 | Email templates (7 ta) | Phase 1.5 | S | DONE |
| B-027 | In-app notifications for HR | Phase 1.5 | S | DONE |
| B-028 | /admin/health — tizim holati | Phase 1.5 | M | DONE |
| B-029 | Admin AI chat (basic) | Phase 1.5 | M | DONE |
| B-030 | Admin AI Agents (KB, Support, Analytics, Health) | Phase 4 | L | TODO |
| B-001 | Unit tests (Vitest) | Phase 2 | M | TODO |
| B-002 | E2E tests (Playwright) | Phase 4 | L | TODO |
| B-003 | Async AI job pattern | Phase 3 | M | TODO |
| B-004 | Rate limiting (sliding window) | Phase 3 | M | Partial |
| B-005 | DB optimization (deleted_at + indexlar) | Phase 0 | S | TODO |
| B-006 | Audit log triggerlari | Phase 0 | M | TODO |
| B-007 | Prompt injection protection | Phase 1 | M | TODO |
| B-008 | AI cost dashboard | Phase 1 | S | Partial |
| B-009 | PWA implementatsiya | Phase 5 | L | TODO |
| B-010 | Usage-based billing | Phase 3 | L | Partial |
| B-011 | Structured logging middleware | Phase 0 | S | Partial |
| B-012 | Health check (kengaytirilgan) | Phase 2 | S | Partial |
| B-013 | OpenAPI auto-generation | Phase 2 | M | TODO |
| B-014 | Semantic search (RAG) | Phase 1 | S | DONE |
| B-015 | Multi-turn AI memory | Phase 4 | M | TODO |
| B-016 | GDPR / O'zbekiston data export | Phase 4 | M | TODO |
| B-017 | Resend webhook idempotency | Phase 3 | S | TODO |

**Effort:** S=1-3 kun · M=1 hafta · L=2 hafta

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

---

## CHANGELOG

| Sana | Versiya | O'zgarish |
|---|---|---|
| 2026-05-06 | v3.0 | Phase 1.5 qo'shildi (Company Auth). B-018..B-030 backlog. |
| 2026-04-30 | v2.1 | 17 strategik talab phase'larga taqsimlandi (B-001..B-017) |
| 2026-04-16 | v2.0 | SQB raqobati tahlili + Telegram MVP timeline tezlashtirilgan |

---

*PLAN.md — AI Business Concierge v3.0 · 2026-05-06*
