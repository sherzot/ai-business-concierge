# PLAN.md — AI Business Concierge

> Bosqichma-bosqich amalga oshirish rejasi
> Har bir phase = aniq natija + o'lchov ko'rsatkichlari

---

## UMUMIY TIMELINE

```
Phase 0: Tayyorgarlik .............. Hafta 1-2    (Infra + KB)
Phase 1: Telegram MVP .............. Hafta 3-6    (Maslahatchi bot)
Phase 2: Hujjatchi + Landing ....... Hafta 7-10   (Hujjat gen + web)
Phase 3: Savdo Bot + To'lov ....... Hafta 11-14  (Monetizatsiya)
Phase 4: Admin + Polish ........... Hafta 15-18  (Sifat + admin)
Phase 5: Scale .................... Hafta 19-24  (O'sish)
```

---

## PHASE 0: TAYYORGARLIK (Hafta 1-2)

**Maqsad:** Infra tayyor, AI ishlaydi, KB to'ldirilgan

### 0.1 LLM Migration (OpenAI → Claude)
- [ ] Anthropic SDK o'rnatish (Deno uchun)
- [ ] LLM Router service yaratish (`services/llm-router.ts`)
  - Complexity classifier
  - Haiku/Sonnet auto-selection
  - Cost tracking
  - Response caching (Supabase da)
  - Fallback logic
- [ ] Mavjud AI Concierge endpointni Claude ga o'tkazish
- [ ] 20 ta test savol bilan tekshirish (UZ va RU)
- [ ] OpenAI kodni fallback sifatida saqlash

### 0.2 Knowledge Base Setup
- [ ] pgvector extension enable (Supabase)
- [ ] `knowledge_base` jadvali yaratish (migration)
- [ ] Knowledge Base service (`services/knowledge-base.ts`)
  - Content embedding (Claude yoki OpenAI embedding)
  - Semantic search
  - Version management
- [ ] Dastlabki kontent kiritish:
  - O'zbekiston 2026-yil soliq qoidalari (YaTT 1% stavka, QQS, foyda solig'i)
  - Soliq hisobot topshirish muddatlari
  - Mehnat kodeksi asoslari (ishga olish, bo'shatish, ta'til)
  - YaTT ro'yxatdan o'tish tartibi
  - Eng ko'p so'raladigan 50 ta savol + javoblar

### 0.3 Database yangilash
- [ ] Yangi jadvallar migration:
  - `subscriptions`
  - `payments`
  - `ai_conversations`
  - `ai_messages`
  - `ai_feedback`
  - `doc_templates`
  - `doc_generated`
  - `sales_bots`
  - `catalogs`
  - `orders`
  - `knowledge_base`
  - `audit_log`
  - `usage_tracking`
- [ ] RLS policies barcha yangi jadvallar uchun
- [ ] Indexes (performance uchun)

### 0.4 Rol tizimi yangilash
- [ ] `SUPER_ADMIN` roli qo'shish
- [ ] `canAccess` funksiyasini yangilash (yangi modullar uchun)
- [ ] Role-based route guard yangilash

**Natija:** Claude API ishlaydi, KB 50+ savolga javob beradi, DB tayyor
**O'lchov:** AI 10 ta test savolga 90%+ aniq javob beradi

---

## PHASE 1: TELEGRAM MVP (Hafta 3-6)

**Maqsad:** Telegram botda AI Maslahatchi ishlaydi, 50 beta user

### 1.1 Telegram Bot Setup
- [ ] grammY framework setup (Supabase Edge Function)
- [ ] Bot webhook endpoint (`/v1/telegram/webhook`)
- [ ] Bot commands:
  - `/start` — onboarding (til tanlash, ro'yxatdan o'tish)
  - `/help` — yordam
  - `/language` — til o'zgartirish
  - `/account` — hisob ma'lumotlari
  - `/history` — suhbat tarixi

### 1.2 Onboarding Flow
- [ ] `/start` → til tanlash (UZ/RU inline keyboard)
- [ ] Salom xabari + nima qila olishi tushuntirish
- [ ] Asosiy menu (reply keyboard):
  ```
  [💼 Maslahat olish]
  [📄 Hujjat yaratish]  (Phase 2 da ochiladi)
  [🛒 Savdo bot]         (Phase 3 da ochiladi)
  [⚙️ Sozlamalar]
  ```
- [ ] Foydalanuvchini Supabase da yaratish (Telegram ID → user)
- [ ] Tenant avtomatik yaratish (bitta user = bitta tenant MVP da)

### 1.3 AI Maslahatchi (Module 1 — Telegram)
- [ ] Suhbat boshqarish:
  - Yangi suhbat boshlash
  - Kontekstni saqlash (oxirgi 10 xabar)
  - Mavzu tanlash: Soliq | Kadrlar | Biznes | Boshqa
- [ ] AI pipeline:
  1. User xabar → LLM Router
  2. Knowledge Base semantic search
  3. Prompt assembly (system + KB context + user message)
  4. Claude Haiku/Sonnet → javob
  5. Confidence check → disclaimer qo'shish
  6. Javobni yuborish + feedback tugmalari
- [ ] Feedback system:
  - [👍] [👎] inline keyboard
  - Salbiy feedback → `ai_feedback` jadvaliga saqlash
- [ ] Usage tracking:
  - Kunlik so'rov hisobi
  - Bepul limit: 5 so'rov/kun
  - Limitga yetganda: "Davom etish uchun obuna bo'ling" xabari

### 1.4 Sifat tekshiruv
- [ ] 100 ta test savol tayyorlash (UZ va RU):
  - 30 ta soliq savollari
  - 20 ta kadrlar savollari
  - 20 ta tadbirkorlik savollari
  - 15 ta aralash/murakkab
  - 15 ta "bilmasligi kerak" (tibbiy, yuridik maslahat)
- [ ] Har bir savolga kutilgan javob yozish
- [ ] Automated test pipeline
- [ ] Aniqlik o'lchash: maqsad 90%+

### 1.5 Beta Launch
- [ ] 5 ta O'zbek Telegram developer guruhlarida e'lon
- [ ] 50 beta user topish
- [ ] Feedback yig'ish (Google Form yoki bot ichida)
- [ ] Bug fix sprint (1 hafta)

**Natija:** Bot ishlaydi, 50 user sinab ko'rgan, feedback yig'ilgan
**O'lchov:** 90%+ aniqlik, < 3s javob vaqti, 50+ beta user, NPS 7+

---

## PHASE 2: HUJJATCHI + LANDING (Hafta 7-10)

**Maqsad:** Hujjat generatsiya ishlaydi, landing page tayyor

### 2.1 AI Hujjatchi (Module 2)
- [ ] Hujjat shablonlar tayyorlash (dastlabki 15 ta):

  **Shartnomalar:**
  1. Ijara shartnomasi (turar-joy)
  2. Ijara shartnomasi (tijorat binosi)
  3. Mehnat shartnomasi
  4. Xizmat ko'rsatish shartnomasi
  5. Oldi-sotdi shartnomasi
  6. Pudrat shartnomasi

  **Arizalar:**
  7. YaTT ro'yxatdan o'tish arizasi
  8. Soliq organiga ariza
  9. Xodim ishga olish buyrug'i
  10. Xodim bo'shatish buyrug'i
  11. Ta'til buyrug'i

  **Boshqa:**
  12. Ishonchnoma (umumiy)
  13. Tilxat
  14. Qarz shartnomasi
  15. Hamkorlik shartnomasi

- [ ] Hujjat generatsiya pipeline:
  1. User shablon tanlaydi
  2. AI savollar beradi (shablon `fields` asosida)
  3. User javob beradi (step by step)
  4. AI shablonni to'ldiradi
  5. PDF yoki DOCX generatsiya
  6. Telegram orqali yuborish + Supabase Storage da saqlash

- [ ] PDF generatsiya (pdf-lib):
  - O'zbek/Rus fontlar (Noto Sans)
  - Professional layout
  - Logo/stamp joy

- [ ] DOCX generatsiya (docx npm):
  - Formatted document
  - Editable format

### 2.2 Telegram da Hujjatchi
- [ ] "📄 Hujjat yaratish" tugmasi faollashtirish
- [ ] Shablon tanlash (inline keyboard, kategoriyalari bilan)
- [ ] Step-by-step savol-javob flow (conversation handler)
- [ ] Hujjat yuborish (document message type)
- [ ] "✏️ O'zgartirish" — qayta to'ldirish imkoniyati

### 2.3 Landing Page (Web)
- [ ] Yangi `features/landing/` module
- [ ] Sahifalar:
  - `/` — Bosh sahifa (hero + modullar + narxlar + FAQ)
  - `/pricing` — Tariflar batafsil
  - `/about` — Biz haqimizda
- [ ] Responsive dizayn (mobile-first)
- [ ] O'zbek va Rus tilida
- [ ] SEO asoslari (meta tags, OG)
- [ ] Telegram bot link — CTA

### 2.4 Web Dashboard yangilash
- [ ] `/ai-assistant` sahifa — AI Maslahatchi web versiya
  - Chat interfeys
  - Suhbatlar tarixi (sidebar)
  - Mavzu filtrlash
- [ ] `/documents` sahifa yangilash
  - "Yangi hujjat yaratish" flow
  - Generatsiya qilingan hujjatlar arxivi
  - Yuklab olish / qayta yaratish

**Natija:** 15 ta hujjat shabloni ishlaydi, landing page live
**O'lchov:** Hujjat generatsiya < 10s, 0 format xato, landing 90+ Lighthouse score

---

## PHASE 3: SAVDO BOT + TO'LOV (Hafta 11-14)

**Maqsad:** Savdo bot ishlaydi, to'lov tizimi ishlaydi, birinchi pulli userlar

### 3.1 AI Sotuvchi (Module 3)
- [ ] Savdo bot yaratish flow:
  1. Tadbirkor "🛒 Savdo bot" tanlaydi
  2. Bot nomi, tavsifi kiritadi
  3. BotFather dan token olish yo'riqnomasi
  4. Token kiritish → bot aktivlashadi
  5. Katalog kiritish (mahsulot nomi, narx, rasm)

- [ ] Savdo bot funksionalligi:
  - Mijoz `/start` → mahsulotlar ro'yxati
  - Kategoriyalar bo'yicha ko'rish
  - Mahsulot tanlash → batafsil ma'lumot
  - Buyurtma berish (ism, telefon, manzil)
  - AI javob berish (FAQ, mahsulot haqida savol)

- [ ] Tadbirkor uchun boshqaruv:
  - Katalog qo'shish/o'zgartirish/o'chirish
  - Buyurtmalarni ko'rish va statusini o'zgartirish
  - Bot statistikasi (xabarlar soni, buyurtmalar)

### 3.2 To'lov integratsiya
- [ ] Click API integratsiya:
  - Prepare endpoint
  - Complete endpoint
  - Webhook handling (idempotent)
- [ ] Payme API integratsiya:
  - CreateTransaction
  - PerformTransaction
  - Webhook handling
- [ ] Subscription management:
  - Plan upgrade/downgrade
  - Auto-renewal
  - Grace period (3 kun)
  - Cancel flow

### 3.3 Usage Limiting
- [ ] Middleware: tarifga mos limitlar tekshirish
- [ ] Limit yetganda: user-friendly upsell xabari
- [ ] Usage dashboard (user o'z sarfini ko'radi)

### 3.4 Telegram da To'lov
- [ ] Obuna taklif xabari (limit yetganda)
- [ ] Click/Payme to'lov linki generatsiya
- [ ] To'lov tasdiqlash → bot ichida bildirishnoma
- [ ] Obuna holati ko'rsatish (`/account`)

**Natija:** To'lov tizimi ishlaydi, savdo bot ishlaydi, birinchi revenue
**O'lchov:** To'lov 99.9% ishonchli, 50+ pulli user, $200+ MRR

---

## PHASE 4: ADMIN + POLISH (Hafta 15-18)

**Maqsad:** Super Admin panel, sifat oshirish, barqarorlik

### 4.1 Super Admin Panel
- [ ] `/admin` — Umumiy ko'rsatkichlar dashboard:
  - Jami tenantlar, userlar, AI so'rovlar
  - Kunlik/oylik daromad grafik
  - AI error rate
  - Eng ko'p so'raladigan savollar
- [ ] `/admin/tenants` — Tenant boshqarish:
  - Ro'yxat + qidiruv + filter
  - Tenant detail (userlar, obuna, AI usage)
  - Bloklash / faollashtirish
- [ ] `/admin/ai` — AI Monitoring:
  - So'rovlar logi (real-time)
  - Aniqlik ko'rsatkichlari
  - Salbiy feedback lari
  - Model usage va narx
  - Knowledge Base gaps (javob berilmagan savollar)
- [ ] `/admin/knowledge-base` — KB boshqarish:
  - Kontent qo'shish / yangilash / o'chirish
  - Versiya boshqarish
  - Import (Markdown)
- [ ] `/admin/billing` — Moliyaviy ko'rsatkichlar:
  - MRR, churn, LTV
  - To'lovlar tarixi
  - Refund boshqarish
- [ ] `/admin/audit` — Audit log:
  - Barcha harakatlar logi
  - Filter (user, action, date)
  - Export (CSV)

### 4.2 Sifat oshirish
- [ ] AI aniqlikni 95%+ ga yetkazish:
  - Salbiy feedbacklarni tahlil qilish
  - Knowledge Base to'ldirish (gaps)
  - Prompt tuning
- [ ] Performance optimizatsiya:
  - API response time < 200ms (AI bo'lmagan endpointlar)
  - AI response time < 3s (Haiku), < 8s (Sonnet)
  - Frontend Lighthouse 90+
- [ ] Bug fix sprint:
  - Sentry dagi barcha xatolarni tuzatish
  - Edge case handling
- [ ] UX polish:
  - Loading skeletonlar
  - Micro-animatsiyalar
  - Error xabarlari yaxshilash
  - Empty state dizaynlari

### 4.3 Testing
- [ ] Unit testlar: util funksiyalar, LLM router, KB search
- [ ] Integration testlar: API endpointlar
- [ ] AI test suite: 100 savol × 2 til = 200 test case
- [ ] Manual QA: 30 ta asosiy scenario

**Natija:** Admin panel to'liq ishlaydi, sifat yuqori, barqaror tizim
**O'lchov:** 95%+ AI aniqlik, 0 critical bug, admin panel to'liq

---

## PHASE 5: SCALE (Hafta 19-24)

**Maqsad:** O'sish, marketing, IT Park

### 5.1 Marketing
- [ ] Telegram kanal yaratish (kontentlar)
- [ ] YouTube seriya: "AI bilan biznes boshqarish" (o'zbek tilida)
- [ ] Telegram guruhlarida organik marketing
- [ ] IT Park tadbirlari va hackathonlarda qatnashish
- [ ] Referral dasturi (invite → 1 oy bepul Pro)

### 5.2 IT Park
- [ ] IT Park rezident arizasi
- [ ] Digital Startups dasturiga ariza (avtomatik rezident status)
- [ ] Soliq imtiyozlari (12%)
- [ ] Xalqaro akselerator uchun ariza (50% xarajat qoplanadi)

### 5.3 Funksional kengaytirish
- [ ] my.soliq.uz integratsiya (agar API mavjud bo'lsa)
- [ ] EHF (Elektron Hisob-Faktura) integratsiya
- [ ] Bank statement import (CSV/PDF)
- [ ] Advanced analytics (Kompaniya tarifi)
- [ ] API access (Kompaniya tarifi)
- [ ] Webhook'lar (tashqi tizimlar uchun)

### 5.4 Regional ekspansiya
- [ ] Qozog'iston bozori tadqiqoti
- [ ] Qirg'iziston bozori tadqiqoti
- [ ] Qozoq/qirg'iz tilida KB tayyorlash
- [ ] Mahalliy soliq qoidalari kiritish

**Natija:** 5,000+ user, $8,000+ MRR, IT Park rezident
**O'lchov:** User growth 30%+ oylik, churn < 5%, NPS 8+

---

## HAFTALIK RITM

Har bir hafta:

```
Dushanba:    Sprint planning (1 soat)
             → Haftalik maqsad belgilash
             → Task larni aniqlash

Seshanba-Juma: Build (1-2 soat/kun)
             → Kod yozish
             → Test qilish

Shanba:      Review + Deploy (1 soat)
             → Haftali natijani tekshirish
             → Production ga deploy

Yakshanba:   Dam olish + Fikrlash
             → User feedback o'qish
             → Keyingi hafta reja
```

---

## SUCCESS METRICS

| Ko'rsatkich | Phase 1 | Phase 3 | Phase 5 |
|---|---|---|---|
| Users (total) | 50 | 500 | 5,000 |
| Pulli users | 0 | 50 | 2,000 |
| MRR | $0 | $200 | $8,000 |
| AI aniqlik | 90% | 93% | 95%+ |
| Javob vaqti (Haiku) | < 5s | < 3s | < 2s |
| Bug count (critical) | < 5 | 0 | 0 |
| NPS | 7+ | 8+ | 8+ |
| Hujjat shablonlar | 0 | 15 | 30+ |
| KB articles | 50 | 200 | 500+ |

---

*PLAN.md — AI Business Concierge v1.0*
*Ishga kirishamiz! 🚀*
