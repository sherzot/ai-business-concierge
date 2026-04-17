# SPEC.md — AI Business Concierge

> O'zbek tadbirkorning kundalik biznes boshqaruv yordamchisi
> Version: 2.0 | Sana: 2026-04-16 | Yangilangan: SQB raqobat tahlili qo'shildi

---

## 1. MAHSULOT HAQIDA

### 1.1 Bir qatorda

AI Business Concierge — O'zbekistondagi **allaqachon ishlayotgan** kichik biznes egalari uchun **kundalik operatsion boshqaruv** yordamchisi. Biznes ochishga yordam beruvchi bank vositalaridan farqli o'laroq, biz **biznesni YURITISHDA** — soliq, kadrlar, shartnoma va savdo masalalarida — har kuni yonida bo'lamiz.

> **Kalit farq:** Bank AI → biznes BOSHLASHGA yordam. Biz → biznes YURITISHGA yordam.

### 1.2 Muammo

O'zbekistonda 403,800+ kichik biznes bor. Ular biznesni boshlaganidan keyin kundalik operatsion muammolarga duch keladi:

- **Soliq/buxgalteriya:** Hisobot topshirish muddatlarini bilmaydi → jarimalar. Bank AI bu muammoni yechmaydi — u faqat kredit olishga yordam beradi.
- **Shartnoma/hujjat:** Har bir shartnoma uchun yuristga 200-500K so'm → oyiga millionlar. Bank AI hujjat bermaydi.
- **Savdo:** Mijozlarga kechqurun/dam olish kunlari qo'lda javob beradi → mijoz yo'qoladi. Bank AI savdo botini boshqarmaydi.
- **Kadrlar:** Xodim ishga olish/bo'shatish tartiblarini bilmaydi → mehnat kodeksi buziladi. Bank AI HR masalalarini yechmaydi.

**Xulosa:** Mavjud bank AI yechimlari faqat biznes ochishning boshlang'ich bosqichini qoplaydi. Biznes ochilgandan keyin — kundalik 365 kunlik operatsion hayot yordamsiz qoladi.

### 1.3 Yechim

Telegram bot + Web dashboard orqali 3 ta AI modul — **har kuni, har soat, har savol uchun:**

1. **AI Maslahatchi** — soliq, buxgalteriya, kadrlar, biznes savollari (real vaqt, Knowledge Base asosida)
2. **AI Hujjatchi** — shartnoma, ariza, buyruq generatsiya (PDF/DOCX, 2 daqiqada)
3. **AI Sotuvchi** — Telegram savdo bot yaratish va boshqarish (mijozlarga 24/7 javob)

### 1.4 Auditoriya

| Segment | Hajmi | Asosiy muammo | Bizdan foydasi | Bank AI bilan farq |
|---|---|---|---|---|
| YaTT (yakka tartibdagi tadbirkor) | 200,000+ | Soliq hisoboti, shartnoma | Kundalik AI maslahat, hujjat | Bank AI kredit beradi, biz YURITISHGA yordam |
| Kichik do'kon/xizmat | 150,000+ | Savdo avtomatizatsiya | Savdo bot, 24/7 mijoz javob | Bank AI savdo botini bermaydi |
| 10-50 xodimli o'rta biznes | 50,000+ | Kadrlar, hujjatlar | HR maslahat, mehnat shartnomasi | Bank AI HR ni yechmaydi |
| Buxgalteriya/yuridik firmalar | 5,000+ | Ko'p mijoz hujjati | Bulk hujjat generatsiya, API | Bank AI bu segmentni ko'rmaydi |

**Asosiy foydalanuvchi portreti:**
- Ismi: Jahongir, 32 yosh, Toshkentda kichik qurilish firma egasi
- 8 ta xodim, oylik daromad 15-20M so'm
- Har hafta soliq savollari bor, har oy yangi shartnomalar kerak
- Telegram'da kuniga 3-4 soat o'tkazadi
- Yurist va buxgalterga pul sarflashni xohlamaydi

### 1.5 Raqobat Tahlili

#### Mavjud raqobatchilar

| Raqobatchi | Tur | Kuchli tomoni | Zaif tomoni | Bizning ustunligimiz |
|---|---|---|---|---|
| **SQB "AI Maslahatchi"** | Bank AI | Davlat banki, ishonch, kredit bilan integratsiya | Faqat kredit/startup bosqichi, kundalik ops yo'q | Kundalik operatsion hayot, Telegram, 3 modul |
| **My.soliq.uz** | Davlat portali | Rasmiy, to'g'ri ma'lumot | UI yomon, AI yo'q, faqat soliq | AI + natural til + barcha modullar |
| **Telegram buxgalterlar** | Insoniy maslahat | Ishonchli | Qimmat, sekin, 24/7 emas | Arzon, tez, 24/7, hujjat generatsiya |
| **1C Buxgalteriya** | Desktop dastur | To'liq funksional | Qimmat, murakkab, o'rganish kerak | Telegram, oddiy, AI maslahat |
| **Xorijiy AI (ChatGPT)** | Umumiy AI | Kuchli AI | O'zbek qonunlarini bilmaydi, hujjat bermaydi | O'zbekiston spetsifik KB, hujjat gen |

#### Pozitsionlash matritsasi

```
                    KUNDALIK OPS
                         ↑
              [Biz: AI Business Concierge]
              Kundalik + Keng + Telegram
                         |
STARTUP ←────────────────┼──────────────── KENG FUNKSIONAL
BOSQICHI                 |
                   [SQB AI]              [1C]
                   Startup + Tor         Keng + Murakkab
                         |
                         ↓
                    BIR MARTALIK
```

#### Raqobat strategiyasi

1. **SQB bilan hamkorlik imkoniyati** — ular kredit beradi → mijoz biznesni boshlaydi → **bizning botga keladi** kundalik masalalar bilan. Raqib emas, funnel.
2. **Davlat portallarini to'ldirish** — my.soliq.uz rasmiy, biz tushuntiruvchi va hujjat beruvchi.
3. **Tezlik ustunligi** — bozorga birinchi keng horizontal yechim sifatida kirish (2026 Q2).
4. **Telegram — bank ilova emas** — bank ilovani o'rnatish kerak, bizni allaqachon Telegram da.

---

## 2. ROLLAR VA RUXSATLAR

### 2.1 Rol arxitekturasi

```
SUPER_ADMIN (tizim admini)
  └── TENANT_ADMIN (kompaniya admini/biznes egasi)
       ├── MANAGER (bo'lim boshlig'i)
       ├── ACCOUNTANT (buxgalter)
       ├── HR (kadrlar)
       └── EMPLOYEE (xodim)
```

### 2.2 Rol vazifalari va ruxsatlari

#### SUPER_ADMIN
| Ruxsat | Tafsilot |
|---|---|
| Tenantlarni boshqarish | Yaratish, o'chirish, faollashtirish, bloklash |
| AI monitoring | Barcha AI so'rovlar, xatolar, sifat ko'rsatkichlari |
| Knowledge Base | Soliq qoidalari, hujjat shablonlar yangilash |
| Analytics | Tizim darajasidagi statistika, daromad, churn |
| Billing | To'lovlar, obunalar, refund |
| Audit log | Barcha harakatlar logi |

**Super Admin Dashboard:**
- `/admin` — Umumiy ko'rsatkichlar
- `/admin/tenants` — Tenantlar ro'yxati
- `/admin/ai` — AI monitoring
- `/admin/knowledge-base` — KB boshqarish
- `/admin/billing` — To'lovlar
- `/admin/audit` — Audit log

#### TENANT_ADMIN (Biznes Egasi)
| Ruxsat | Tafsilot |
|---|---|
| Xodimlarni boshqarish | Qo'shish, o'chirish, rol berish |
| Barcha modullar | AI Maslahatchi, Hujjatchi, Sotuvchi — to'liq |
| Savdo botlar | Yaratish, sozlash, katalog boshqarish |
| Obuna | Tarif o'zgartirish, to'lov tarixi |

#### MANAGER
| Ruxsat | Tafsilot |
|---|---|
| AI Maslahatchi | To'liq (o'z bo'limi kontekstida) |
| Hujjatlar | Yaratish, ko'rish (o'z bo'limiga tegishli) |
| Vazifalar | O'z bo'limi xodimlariga biriktirish |

#### ACCOUNTANT
| Ruxsat | Tafsilot |
|---|---|
| AI Maslahatchi | Soliq va buxgalteriya savollari |
| Hujjatlar | Moliyaviy hujjatlar yaratish va ko'rish |

#### HR
| Ruxsat | Tafsilot |
|---|---|
| AI Maslahatchi | Kadrlar savollari |
| Hujjatlar | Mehnat shartnomasi, buyruqlar |

#### EMPLOYEE
| Ruxsat | Tafsilot |
|---|---|
| AI Maslahatchi | Cheklangan (kunlik limit) |
| Vazifalar | O'ziga biriktirilgan |

---

## 3. UI/UX SPETSIFIKATSIYASI

### 3.1 Dizayn Printsipi

**"Oddiy odam 30 soniyada tushunadigan tizim"**

- Har bir sahifada **bitta asosiy harakat**
- O'zbek tilida **tushunarli so'zlar**
- **Katta tugmalar** — mobil qurilmada qulay
- **3 ta rang:** asosiy, aksent, fond
- **Animatsiya:** minimal, faqat feedback uchun
- **Xato xabarlari:** tushunarli tilda

### 3.2 Sahifalar Tuzilishi

#### Public sahifalar
```
/ (Landing Page)
├── Hero: "Biznesingiz allaqachon ishlayaptimi? AI yordamchingiz shu yerda."
├── 3 modul (Maslahatchi, Hujjatchi, Sotuvchi)
├── Narxlar
├── FAQ
└── Telegram bot CTA

/login, /register, /pricing, /about
```

#### Dashboard (auth keyin)
```
/dashboard → /ai-assistant → /documents → /sales-bots
/inbox → /tasks → /hr → /reports → /billing → /settings
/admin/* (faqat SUPER_ADMIN)
```

### 3.3 Landing Page Hero (yangilangan)

```
┌──────────────────────────────────────────────────────┐
│  "Biznesingiz allaqachon ishlayaptimi?"              │
│                                                      │
│  Soliq savollari. Shartnomalar. Savdo botlar.        │
│  Hammasi bitta Telegram botda. Har kuni.             │
│                                                      │
│  [Telegram'da bepul boshlang]  [Demo ko'ring]        │
│                                                      │
│  ✓ Kredit emas — kundalik yordam                     │
│  ✓ Yurist emas — AI shartnoma                        │
│  ✓ Qo'lda emas — avtomatik savdo                     │
└──────────────────────────────────────────────────────┘
```

### 3.4 Dashboard Layouti

```
┌──────────────────────────────────────────────┐
│  TOPBAR: Logo | Qidiruv | Til | Bildirishnoma | Profil │
├────────┬─────────────────────────────────────┤
│        │                                     │
│ SIDEBAR│         MAIN CONTENT                │
│ 🏠 Bosh│  Rolga mos widgets va kontent        │
│ 🤖 AI  │                                     │
│ 📄 Hujjat│                                   │
│ 🛒 Savdo│                                    │
│ 📥 Inbox│                                    │
│ ✅ Vazifa│                                   │
│        │                                     │
├────────┴─────────────────────────────────────┤
│  Mobile: Sidebar → Bottom navigation         │
└──────────────────────────────────────────────┘
```

### 3.5 Telegram Bot UX

```
/start → Til tanlang: [O'zbekcha] [Русский]
       → Salom! Men sizning AI biznes yordamchingizman.
       → [💼 Maslahat olish] [📄 Hujjat yaratish]
         [🛒 Savdo bot] [⚙️ Sozlamalar]

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
| AI (asosiy, 80%) | Claude Haiku 3.5 |
| AI (murakkab, 20%) | Claude Sonnet 4 |
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
| **Tadbirkor** | 49,000 so'm/oy (~$4) | 50/kun | 20/oy | 1 |
| **Biznes** | 149,000 so'm/oy (~$12) | cheksiz | cheksiz | 5 |
| **Kompaniya** | 499,000 so'm/oy (~$40) | cheksiz+ | cheksiz | 20 |

**To'lov:** Click, Payme, Bank o'tkazmasi (Kompaniya tarifi)

---

## 7. DATABASE SCHEMA (yangi jadvallar)

```sql
subscriptions, payments, ai_conversations, ai_messages,
ai_feedback, doc_templates, doc_generated, sales_bots,
catalogs, orders, knowledge_base (pgvector), audit_log, usage_tracking
```
_(To'liq SQL schema avvalgi versiyadan saqlanadi)_

---

## 8. API ENDPOINTLAR

| Guruh | Endpointlar |
|---|---|
| AI | POST /v1/ai/chat, GET /v1/ai/conversations, POST /v1/ai/feedback |
| Hujjat | GET /v1/doc-templates, POST /v1/docs/generate, GET /v1/docs/generated |
| Savdo bot | POST/GET /v1/sales-bots, POST /v1/sales-bots/:id/catalog |
| Billing | GET/POST /v1/billing/subscription, POST /v1/billing/webhook/click, POST /v1/billing/webhook/payme |
| Admin | GET /v1/admin/stats, GET /v1/admin/tenants, GET /v1/admin/ai/monitoring |
| Telegram | POST /v1/telegram/webhook, POST /v1/telegram/sales-bot/:id/webhook |

---

## 9. XAVFSIZLIK

Supabase Auth + JWT, RLS barcha jadvallarda, Supabase Vault (API keys), Zod validation, Rate limiting, CORS, Audit log, HTTPS.

---

## 10. TILLAR

| Til | Kod | Qo'llanish |
|---|---|---|
| O'zbekcha (lotin) | `uz` | Asosiy til |
| Русский | `ru` | Ikkinchi til |
| English | `en` | Dashboard, admin, docs |

---

*SPEC.md — AI Business Concierge v2.0*
*Yangilandi: 2026-04-16 — Raqobat tahlili + kuchli pozitsiyalash*
