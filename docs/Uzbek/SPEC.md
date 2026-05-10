# SPEC.md — AI Business Concierge

> O'zbek tadbirkorning kundalik biznes boshqaruv yordamchisi
> Version: 3.0 | Sana: 2026-05-06

---

## 1. MAHSULOT HAQIDA

### 1.1 Bir qatorda

AI Business Concierge — O'zbekistondagi **allaqachon ishlayotgan** kichik biznes egalari uchun **kundalik operatsion boshqaruv** yordamchisi. Biznes ochishga yordam beruvchi bank vositalaridan farqli o'laroq, biz **biznesni YURITISHDA** — soliq, kadrlar, shartnoma va savdo masalalarida — har kuni yonida bo'lamiz.

> **Kalit farq:** Bank AI → biznes BOSHLASHGA yordam. Biz → biznes YURITISHGA yordam.

### 1.2 Muammo

O'zbekistonda 403,800+ kichik biznes bor. Ular biznesni boshlaganidan keyin kundalik operatsion muammolarga duch keladi:
- **Soliq/buxgalteriya:** Hisobot topshirish muddatlarini bilmaydi → jarimalar.
- **Shartnoma/hujjat:** Har bir shartnoma uchun yuristga 200-500K so'm → oyiga millionlar.
- **Savdo:** Mijozlarga kechqurun/dam olish kunlari qo'lda javob beradi → mijoz yo'qoladi.
- **Kadrlar:** Xodim ishga olish/bo'shatish tartiblarini bilmaydi → mehnat kodeksi buziladi.

### 1.3 Yechim

Telegram bot + Web dashboard orqali 3 ta AI modul — **har kuni, har soat, har savol uchun:**
1. **AI Maslahatchi** — soliq, buxgalteriya, kadrlar, biznes savollari
2. **AI Hujjatchi** — shartnoma, ariza, buyruq generatsiya (PDF/DOCX)
3. **AI Sotuvchi** — Telegram savdo bot yaratish va boshqarish

### 1.4 Auditoriya

| Segment | Hajmi | Asosiy muammo | Bizdan foydasi |
|---|---|---|---|
| YaTT (yakka tartibdagi tadbirkor) | 200,000+ | Soliq hisoboti, shartnoma | Kundalik AI maslahat, hujjat |
| Kichik do'kon/xizmat | 150,000+ | Savdo avtomatizatsiya | Savdo bot, 24/7 mijoz javob |
| 10-50 xodimli o'rta biznes | 50,000+ | Kadrlar, hujjatlar | HR maslahat, mehnat shartnomasi |
| Buxgalteriya/yuridik firmalar | 5,000+ | Ko'p mijoz hujjati | Bulk hujjat generatsiya |

### 1.5 Raqobat Tahlili

| Raqobatchi | Kuchli tomoni | Zaif tomoni | Bizning ustunligimiz |
|---|---|---|---|
| **SQB "AI Maslahatchi"** | Davlat banki, ishonch | Faqat kredit/startup bosqichi | Kundalik operatsion hayot, Telegram |
| **My.soliq.uz** | Rasmiy, to'g'ri | UI yomon, AI yo'q | AI + natural til + barcha modullar |
| **ChatGPT** | Kuchli AI | O'zbek qonunlarini bilmaydi | O'zbekiston spetsifik KB |
| **1C Buxgalteriya** | To'liq funksional | Qimmat, murakkab | Telegram, oddiy, AI maslahat |

**Raqobat strategiyasi:** SQB bilan hamkorlik imkoniyati — ular kredit beradi → mijoz biznesni boshlaydi → **bizning botga keladi** kundalik masalalar bilan. Raqib emas, funnel.

---

## 2. ROLLAR VA RUXSATLAR

### 2.1 Rol arxitekturasi

```
TIZIM DARAJASI
  super_admin  ≡  sub_admin  (bir xil to'liq huquq)
      │
KOMPANIYA DARAJASI
      └── company_admin
              ├── hr
              ├── accountant
              ├── manager
              └── employee
```

### 2.2 Rol vazifalari

#### SUPER_ADMIN / SUB_ADMIN — Tizim darajasi
| Ruxsat | Tafsilot |
|---|---|
| Kompaniyalarni boshqarish | Ro'yxatdan o'tkazish, tasdiqlash, bloklash |
| Murojaat formalarini ko'rish | Yangi murojaat, status boshqarish |
| AI monitoring | Barcha AI so'rovlar, xatolar, narx |
| Knowledge Base | Yangilash va boshqarish |
| Analytics | Tizim darajasidagi statistika, daromad |
| Billing | To'lovlar, obunalar, MRR |
| Health monitoring | Tizim holati, API statuslar |

**Admin Dashboard:**
- `/admin` — Umumiy ko'rsatkichlar
- `/admin/companies` — Kompaniyalar ro'yxati
- `/admin/contacts` — Murojaatlar
- `/admin/ai` — AI monitoring
- `/admin/health` — Tizim holati
- `/admin/ai-chat` — Admin AI yordamchisi

#### COMPANY_ADMIN
| Ruxsat | Tafsilot |
|---|---|
| Kompaniya profil | To'liq boshqarish |
| Xodimlarni boshqarish | Qo'shish, o'chirish, rol berish |
| Barcha modullar | AI Maslahatchi, Hujjatchi, Sotuvchi |
| Obuna | Tarif o'zgartirish, to'lov tarixi |

#### HR
| Ruxsat | Tafsilot |
|---|---|
| Xodim account yaratish | Yangi xodim uchun to'liq ma'lumotlar |
| Xodim account tasdiqlash | Parol o'rnatgandan keyin tasdiqlash |
| AI Maslahatchi | Kadrlar savollari (cheksiz) |
| Hujjatlar | Mehnat shartnomasi, buyruqlar |

#### ACCOUNTANT
| Ruxsat | Tafsilot |
|---|---|
| AI Maslahatchi | Soliq va buxgalteriya savollari |
| Hujjatlar | Moliyaviy hujjatlar |
| Moliya moduli | Kirim/chiqim, soliq hisobotlari |

#### MANAGER
| Ruxsat | Tafsilot |
|---|---|
| AI Maslahatchi | To'liq (o'z bo'limi kontekstida) |
| Vazifalar | O'z bo'limi xodimlariga biriktirish |
| Hisobotlar | O'z bo'limi hisobotlari |

#### EMPLOYEE
| Ruxsat | Tafsilot |
|---|---|
| AI Maslahatchi | Cheklangan (kunlik 10 so'rov) |
| Vazifalar | O'ziga biriktirilgan vazifalar |
| Hujjatlar | O'ziga tegishli hujjatlarni ko'rish |

---

## 3. UI/UX SPETSIFIKATSIYASI

### 3.1 Dizayn Printsipi

**"Oddiy odam 30 soniyada tushunadigan tizim"**
- Har bir sahifada **bitta asosiy harakat**
- O'zbek tilida **tushunarli so'zlar**
- **Katta tugmalar** — mobil qurilmada qulay
- **Xato xabarlari:** tushunarli tilda

### 3.2 Sahifalar Tuzilishi

**Public sahifalar:**
```
/ (Landing Page) — Hero, 3 modul, Narxlar, FAQ, CTA
/login, /register, /contact, /pricing, /about
```

**Dashboard (auth keyin):**
```
/app/dashboard → /app/ai-assistant → /app/documents → /app/sales-bots
/app/inbox → /app/tasks → /app/hr → /app/reports → /app/billing
/admin/* (faqat SUPER_ADMIN)
```

### 3.3 Landing Page Hero

```
"Biznesingiz allaqachon ishlayaptimi?"

Soliq savollari. Shartnomalar. Savdo botlar.
Hammasi bitta Telegram botda. Har kuni.

[Telegram'da bepul boshlang]  [Demo ko'ring]

✓ Kredit emas — kundalik yordam
✓ Yurist emas — AI shartnoma
✓ Qo'lda emas — avtomatik savdo
```

### 3.4 Telegram Bot UX

```
/start → Til tanlang: [O'zbekcha] [Русский] [English] [日本語]
       → [💼 Maslahat olish] [📄 Hujjat yaratish] [🛒 Savdo bot]

Maslahat: User yozadi → AI javob + [👍] [👎] [📋 Saqlash]
Hujjat:   Shablon → Savollar → PDF/DOCX → Telegram ga yuborish
```

---

## 4. TEXNIK ARXITEKTURA

### 4.1 Stack

| Qatlam | Texnologiya |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + Radix UI |
| State | Zustand + React Query |
| Backend | Supabase Edge Functions (Deno) + Hono |
| Database | Supabase PostgreSQL + pgvector |
| Auth | Supabase Auth (multi-tenant) |
| AI (80%) | Claude Haiku 3.5 |
| AI (20%) | Claude Sonnet 4 |
| Telegram | grammY framework (Deno) |
| Hujjat gen | pdf-lib + docx |
| To'lov | Click API + Payme API |
| Hosting | Netlify + Supabase |
| Monitoring | Sentry |

### 4.2 LLM Router Logic

```typescript
function routeToLLM(query: string): LLMChoice {
  if (cache.has(query.normalized)) return cache.get(query);
  const complexity = classifyQuery(query);
  if (complexity === 'simple')   return { model: 'claude-haiku-3-5', maxTokens: 500 };
  if (complexity === 'document') return { model: 'claude-sonnet-4',  maxTokens: 2000 };
  if (complexity === 'analysis') return { model: 'claude-sonnet-4',  maxTokens: 1500 };
  return { model: 'claude-haiku-3-5', maxTokens: 800 };
}
```

---

## 5. SIFAT STANDARTLARI

| Mezon | Standart |
|---|---|
| AI aniqlik | 95%+ oddiy savollar |
| Hallucination | 0% narx/sana ma'lumotlarda |
| Javob vaqti | <3s (Haiku), <8s (Sonnet) |
| "Bilmayman" | Ishonch <70% → disclaimer |

---

## 6. MONETIZATSIYA

| Tarif | Narx | AI | Hujjat | Savdo bot |
|---|---|---|---|---|
| **Bepul** | 0 so'm | 5/kun | 2/oy | yo'q |
| **Tadbirkor** | 49,000 so'm/oy | 50/kun | 20/oy | 1 |
| **Biznes** | 149,000 so'm/oy | cheksiz | cheksiz | 5 |
| **Kompaniya** | 499,000 so'm/oy | cheksiz+ | cheksiz | 20 |

**To'lov:** Click, Payme, Bank o'tkazmasi (Kompaniya tarifi)

---

## 7. DATABASE SCHEMA

```sql
subscriptions, payments, ai_conversations, ai_messages,
ai_feedback, doc_templates, doc_generated, sales_bots,
catalogs, orders, knowledge_base (pgvector), audit_log, usage_tracking
```

---

## 8. API ENDPOINTLAR

| Guruh | Endpointlar |
|---|---|
| AI | POST /v1/ai/chat, GET /v1/ai/conversations, POST /v1/ai/feedback |
| Hujjat | GET /v1/doc-templates, POST /v1/docs/generate |
| Savdo bot | POST/GET /v1/sales-bots |
| Billing | GET/POST /v1/billing/subscription, POST /v1/billing/webhook/click |
| Admin | GET /v1/admin/stats, GET /v1/admin/tenants |

---

## 9. XAVFSIZLIK

Supabase Auth + JWT, RLS barcha jadvallarda, Supabase Vault (API keys), Zod validation, Rate limiting, CORS, Audit log, HTTPS.

---

## 10. TILLAR

| Til | Kod | Qo'llanish |
|---|---|---|
| O'zbekcha (lotin) | `uz` | Asosiy til |
| Русский | `ru` | Ikkinchi til |
| English | `en` | Dashboard, admin |
| 日本語 | `ja` | Telegram bot, landing |

---

## 11. KOMPANIYA RO'YXATDAN O'TISH JARAYONI

### 11.1 Murojaat qabul qilish

**Murojaat formasi maydonlari:**
- To'liq ism / mas'ul shaxs ismi
- Kompaniya nomi
- STIR (ixtiyoriy)
- Telefon raqami *
- Email *
- Biznes turi (YaTT / MChJ / AJ / Boshqa)
- Xodimlar soni
- Asosiy muammo (ixtiyoriy)
- Qanday bildingiz

**Jarayon:**
1. Forma yuboriladi → `contact_requests` jadvaliga yoziladi
2. super_admin ga email + tizim bildirishnomasi
3. Admin murojaatni ko'rib → `contacted` → `invite_sent`
4. Tizim kompaniya emailiga **bir martalik invite URL** yuboradi (48 soat)

### 11.2 Kompaniya ro'yxatdan o'tishi

**Ro'yxatdan o'tish formasi:**
- Kompaniya to'liq nomi, yuridik shakl, STIR, manzil, bank rekvizitlari
- Company Admin: ism, lavozim, telefon, email, parol

**Ro'yxatdan o'tgandan keyin:**
1. Account `status: "pending_approval"` bilan yaratiladi
2. Admin tasdiqlaydi → kompaniyaga email "Accountingiz tasdiqlandi!"
3. Rad etilsa → kompaniyaga email + sabab

### 11.3 Account holatlari

```
contact_request → invite_sent → pending_approval → active → suspended / blocked
```

| Holat | Ma'no |
|---|---|
| `contact_request` | Murojaat yuborildi |
| `invite_sent` | Invite URL yuborildi |
| `pending_approval` | Ro'yxatdan o'tdi, tasdiqlash kutilmoqda |
| `active` | Faol, to'liq kirish |
| `suspended` | To'lov o'tmagan (3 kun grace) |
| `blocked` | Admin tomonidan bloklangan |

---

## 12. XODIM ACCOUNT YARATISH JARAYONI

### 12.1 HR tomonidan account yaratish

**Yangi xodim formasi:**
- Shaxsiy: ism, tug'ilgan sana, jins, pasport, JSHSHIR, telefon, email, manzil
- Mehnat: lavozim, bo'lim, rol, ishga qabul sanasi, maosh, ish turi
- Qo'shimcha: qon guruhi (ixtiyoriy), favqulodda aloqa

### 12.2 Avtomatik jarayon

```
1. HR forma yuboradi
2. Tizim account yaratadi (status: "password_pending")
3. Xodimning emailiga parol o'rnatish URL yuboradi (24 soat)
4. HR ga ogohlantirish: "Darhol xodimga qo'ng'iroq qiling"
5. Xodim parol o'rnatadi
6. HR ga ogohlantirish: "Tasdiqlashingizni kutmoqda"
7. HR tasdiqlaydi → xodimga email "Accountingiz tasdiqlandi!"
```

### 12.3 Xodim account holatlari

```
password_pending → password_set → active → blocked
```

| Holat | Ma'no |
|---|---|
| `password_pending` | HR yaratdi, xodim parol o'rnatmagan |
| `password_set` | Parol o'rnatildi, HR tasdiqlashi kutilmoqda |
| `active` | HR tasdiqladi, to'liq kirish |
| `blocked` | HR yoki company_admin bloklagan |

---

## 13. LOGIN VA AUTH SAHIFALARI

### 13.1 Login sahifasi

```
- Email va parol bilan kirish
- "Parolni unutdim" havolasi
- Status xabarlari (pending/suspended/blocked)
- "Kompaniyangizni ro'yxatdan o'tkazmadingizmi?" → murojaat formasi
- Til tanlash (uz/ru/en/ja)
```

### 13.2 Parolni tiklash

```
/login → "Parolni unutdim"
→ /forgot-password → Email kiritish
→ Emailga tiklash URL (15 daqiqa)
→ /reset-password?token=... → Yangi parol
→ /login + "Parolingiz yangilandi"
```

### 13.3 Murojaat sahifasi (`/contact`)

```
Kim ko'radi: public (hamma)
Maqsad: Kompaniyalar tizimni sinab ko'rishni istasa birinchi qadam

Sahifada:
  1. Qisqa tushuntirish
  2. Murojaat formasi
  3. Kutish vaqti: "1 ish kuni ichida javob"
  4. To'g'ridan-to'g'ri aloqa: Telegram, Telefon
```

---

## 14. SUPER ADMIN AI TIZIMI

### 14.1 Admin AI Yordamchisi (`/admin/ai-chat`)

**Standart savollar:**
- "Bugungi tizim holati qanday?"
- "Oxirgi 7 kunda qaysi kompaniyalar ko'p xato berdi?"
- "Qaysi kompaniyalar obunadan chiqib ketish xavfida?"

**Maxsus Agentlar:**
1. **KB Agent** — KB bo'shliqlari, yangi kontent taklif, sifat tahlili
2. **Support Agent** — Kompaniya muammolarini tahlil, tezkor yechim
3. **Analytics Agent** — MRR o'zgarishi, churn ehtimoli, foydalanish statistikasi
4. **Health Agent** — Tizim holati real vaqt monitoring, anomaliyalar

### 14.2 Tizim Health Monitoring (`/admin/health`)

```
Real vaqt tekshiruvlar:
  🟢/🔴 Supabase DB (latency, connections)
  🟢/🔴 Supabase Auth (response time)
  🟢/🔴 Anthropic API (ping, quota)
  🟢/🔴 OpenAI API (embedding endpoint)
  🟢/🔴 Telegram Bot (webhook status)
  🟢/🔴 Resend Email (delivery rate)
  🟢/🔴 Netlify (build status)

Metrikalar (oxirgi 24 soat):
  - Jami so'rovlar, xatolik darajasi, o'rtacha javob vaqti
  - AI sarflagan kredit, faol kompaniyalar soni
```

---

*SPEC.md — AI Business Concierge v3.0*
*Yangilandi: 2026-05-06 — Rol arxitekturasi, kompaniya onboarding, xodim onboarding, admin AI*
