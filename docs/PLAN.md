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

*PLAN.md — AI Business Concierge v2.0*
*Yangilandi: 2026-04-16 — SQB raqobati kontekstida tezlashtirilgan jadval*
*Ishga kirishamiz! 🚀*
