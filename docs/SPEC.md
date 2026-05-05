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
TIZIM DARAJASI
  super_admin  ≡  sub_admin  (bir xil to'liq huquq — tizim egasi va yordamchisi)
      │
KOMPANIYA DARAJASI
      └── company_admin  (kompaniya rahbari — o'z kompaniyasi ustidan to'liq nazorat)
              ├── hr             (kadrlar — xodimlarni boshqaradi, account yaratadi)
              ├── accountant     (buxgalter — moliyaviy hujjatlar)
              ├── manager        (menejer — o'z bo'limining vazifa va natijalarini)
              └── employee       (xodim — cheklangan, o'ziga tegishli)
```

> **Muhim:** `super_admin` va `sub_admin` — bir xil, tengdosh huquq. Ikkalasi ham barcha kompaniyalarga, tizimga, monitoring va boshqaruvga to'liq kirish huquqiga ega.

### 2.2 Rol vazifalari va ruxsatlari

#### SUPER_ADMIN / SUB_ADMIN — Tizim darajasi
| Ruxsat | Tafsilot |
|---|---|
| Kompaniyalarni boshqarish | Ro'yxatdan o'tkazish, tasdiqlash, bloklash, tahrirlash |
| Murojaat formalarini ko'rish | Yangi kompaniya murojaatlari, status boshqarish |
| Invite URL yuborish | Kelishuvdan so'ng kompaniyaga ro'yxatdan o'tish URL'i |
| AI monitoring | Barcha AI so'rovlar, xatolar, sifat, narx |
| Knowledge Base | Soliq qoidalari, hujjat shablonlar yangilash |
| Analytics | Tizim darajasidagi statistika, daromad, churn, NPS |
| Billing | To'lovlar, obunalar, refund, MRR |
| Audit log | Barcha harakatlar logi (barcha kompaniyalar bo'yicha) |
| Health monitoring | Tizim holati, API statuslar, xatolar |
| AI Agent tizimi | Maxsus agentlar: KB Agent, Support Agent, Analytics Agent |
| Sub_admin boshqarish | Yangi sub_admin qo'shish/o'chirish |

**Super/Sub Admin Dashboard (`/admin`):**
- `/admin` — Umumiy ko'rsatkichlar (users, MRR, AI usage, error rate)
- `/admin/companies` — Kompaniyalar ro'yxati + tasdiqlash
- `/admin/contacts` — Yangi murojaat formalarini ko'rish va boshqarish
- `/admin/ai` — AI monitoring (so'rovlar, aniqlik, narx, KB gaps)
- `/admin/knowledge-base` — KB boshqarish
- `/admin/billing` — MRR, churn, LTV, to'lov tarixi
- `/admin/audit` — Audit log (global)
- `/admin/health` — Tizim holati: DB, API, Telegram, AI, Resend
- `/admin/ai-chat` — Admin AI yordamchisi (maxsus agentlar bilan)
- `/admin/settings` — Tizim sozlamalari

#### COMPANY_ADMIN — Kompaniya darajasi
> Kompaniya rahbari. Faqat o'z kompaniyasi ichida to'liq huquq.

| Ruxsat | Tafsilot |
|---|---|
| Kompaniya profil | To'liq kompaniya ma'lumotlarini boshqarish |
| Xodimlarni boshqarish | Qo'shish, o'chirish, rol berish, bloklash |
| Barcha modullar | AI Maslahatchi, Hujjatchi, Sotuvchi — to'liq |
| Savdo botlar | Yaratish, sozlash, katalog boshqarish |
| Moliya | Daromad/xarajatlar hisoboti, xodim maoshi |
| Obuna | Tarif o'zgartirish, to'lov tarixi |
| Vazifalar | Barcha xodimlarga biriktirish va ko'rish |
| Hisobotlar | To'liq kompaniya analitikasi |

**Company Admin Dashboard (`/app`):**
- `/app/dashboard` — Kompaniya ko'rsatkichlari
- `/app/employees` — Xodimlar boshqarish + account yaratish
- `/app/tasks` — Vazifalar (barcha xodimlar)
- `/app/hr` — HR hujjatlar, mehnat shartnomalari
- `/app/finance` — Daromad, xarajat, maosh
- `/app/ai-assistant` — AI Maslahatchi (to'liq)
- `/app/documents` — Hujjat generatsiya
- `/app/sales-bots` — Savdo botlar
- `/app/billing` — Obuna va to'lov
- `/app/settings` — Kompaniya sozlamalari

#### HR — Kadrlar bo'limi
| Ruxsat | Tafsilot |
|---|---|
| Xodim account yaratish | HR o'zi yangi xodim uchun account ochadi (to'liq ma'lumotlar) |
| Xodim account tasdiqlash | Xodim parol o'rnatgandan keyin HR tasdiqlaydi |
| AI Maslahatchi | Kadrlar savollari (cheksiz) |
| Hujjatlar | Mehnat shartnomasi, ishga olish/bo'shatish buyruqlari |
| HR hisobotlar | Xodimlar, davomad, ta'tillar |
| Xodimlar ko'rinishi | Barcha xodim profillari va holati |

#### ACCOUNTANT — Buxgalteriya
| Ruxsat | Tafsilot |
|---|---|
| AI Maslahatchi | Soliq va buxgalteriya savollari (kunlik limit kengaytirilgan) |
| Hujjatlar | Moliyaviy hujjatlar yaratish va ko'rish (barcha) |
| Moliya moduli | Kirim/chiqim, soliq hisobotlari |
| Maoshlar | Ko'rish (o'zgartirish faqat company_admin) |

#### MANAGER — Bo'lim boshlig'i
| Ruxsat | Tafsilot |
|---|---|
| AI Maslahatchi | To'liq (o'z bo'limi kontekstida) |
| Hujjatlar | Yaratish, ko'rish (o'z bo'limiga tegishli) |
| Vazifalar | O'z bo'limi xodimlariga biriktirish va monitoring |
| Hisobotlar | O'z bo'limi hisobotlari |

#### EMPLOYEE — Xodim
| Ruxsat | Tafsilot |
|---|---|
| AI Maslahatchi | Cheklangan (kunlik 10 so'rov) |
| Vazifalar | O'ziga biriktirilgan vazifalarni ko'rish va bajarish |
| Hujjatlar | O'ziga tegishli hujjatlarni ko'rish |
| Profil | O'z profil ma'lumotlarini yangilash |

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
| 日本語 | `ja` | Telegram bot, landing page |

---

## 11. KOMPANIYA RO'YXATDAN O'TISH JARAYONI

### 11.1 Murojaat qabul qilish

Kompaniya landing page dagi **Murojaat formasi** orqali ma'lumot yuboradi:
```
Murojaat formasi maydonlari:
  - To'liq ism yoki mas'ul shaxs ismi
  - Kompaniya nomi
  - STIR (ixtiyoriy)
  - Telefon raqami *
  - Email *
  - Biznes turi (YaTT / MChJ / AJ / Boshqa)
  - Xodimlar soni (1-10 / 11-50 / 51-200 / 200+)
  - Asosiy muammo (ixtiyoriy matn)
  - Qanday bildingiz (reklama / tavsiya / qidiruv / Telegram)
```

**Jarayon:**
1. Forma yuboriladi → `contact_requests` jadvaliga yoziladi
2. super_admin/sub_admin ga email + tizim bildirishnomasi
3. Admin `/admin/contacts` da yangi murojaatni ko'radi
4. Admin `status: "contacted"` → telefon/email orqali kompaniya bilan bog'lanadi
5. Kelishuvga erishilsa → admin "Invite yuborish" tugmasini bosadi
6. Tizim kompaniya emailiga **bir martalik invite URL** yuboradi (48 soat amal qiladi)
7. Admin `status: "invite_sent"` ga o'tadi

### 11.2 Kompaniya ro'yxatdan o'tishi (Invite URL)

Kompaniya invite URL'ni ochganda:
```
Ro'yxatdan o'tish formasi:
  Kompaniya ma'lumotlari:
    - Kompaniya to'liq nomi *
    - Yuridik shakl (YaTT / MChJ / AJ) *
    - STIR *
    - Yuridik manzil *
    - Faoliyat turi *
    - Ro'yxatdan o'tish sanasi *
    - Bank rekvizitlari (bank, hisob raqam)
    - Telefon *
    - Email *
    - Web-sayt (ixtiyoriy)
    - Xodimlar soni *
    - Oylik aylanma (taxminan, ixtiyoriy)
  
  Company Admin ma'lumotlari:
    - To'liq ism *
    - Lavozim *
    - Telefon *
    - Email (invite yuborilgan email — o'zgartirib bo'lmaydi)
    - Parol (min 8 belgi, katta+kichik harf+raqam) *
    - Parolni tasdiqlash *
```

**Ro'yxatdan o'tgandan keyin:**
1. Account `status: "pending_approval"` bilan yaratiladi
2. Kompaniyaga tizimda xabar: "Accountingiz muvaffaqiyatli yaratildi. Tasdiqlash uchun kutilmoqda. Biz siz bilan bog'lanamiz yoki [telefon] raqamiga qo'ng'iroq qiling."
3. super_admin/sub_admin ga email + tizim bildirishnomasi: "Yangi kompaniya ro'yxatdan o'tdi: [Kompaniya nomi]. Tasdiqlash kerak."
4. Admin `/admin/companies` da `pending_approval` kompaniyalarni ko'radi
5. Admin kompaniya ma'lumotlarini tekshirib → "Tasdiqlash" yoki "Rad etish"
6. Tasdiqlanganda: kompaniyaga email "Accountingiz tasdiqlandi! Kiring: [URL]"
7. Rad etilganda: kompaniyaga email + sabab ko'rsatiladi

### 11.3 Account holatlari (Company)

```
contact_request → invite_sent → pending_registration → pending_approval → active
                                                                          ↓
                                                                       blocked
                                                                       suspended
```

| Holat | Ma'no |
|---|---|
| `contact_request` | Murojaat formasi yuborildi, admin hali bog'lanmagan |
| `invite_sent` | Admin invite URL yubordi, kompaniya hali ro'yxatdan o'tmagan |
| `pending_registration` | URL ochildi lekin forma to'ldirilmadi (24 soatdan keyin expire) |
| `pending_approval` | Ro'yxatdan o'tdi, admin tasdiqlashini kutmoqda |
| `active` | Faol, to'liq kirish |
| `suspended` | To'lov o'tmagan, vaqtincha to'xtatilgan (3 kun grace) |
| `blocked` | Admin tomonidan bloklangan |

---

## 12. XODIM ACCOUNT YARATISH JARAYONI

### 12.1 HR tomonidan account yaratish

HR `/app/employees/new` sahifasida xodim uchun account yaratadi:
```
Yangi xodim formasi (HR to'ldiradi):
  Shaxsiy ma'lumotlar:
    - To'liq ism (familiya, ism, otasining ismi) *
    - Tug'ilgan sana *
    - Jins *
    - Fuqarolik *
    - Pasport/ID raqami *
    - JSHSHIR (INN) *
    - Telefon raqami *
    - Email manzili * (parol yuboriladi shu yerga)
    - Yashash manzili *
  
  Mehnat ma'lumotlari:
    - Lavozim *
    - Bo'lim *
    - Rol (hr / accountant / manager / employee) *
    - Ishga qabul sanasi *
    - Ish vaqti (to'liq / yarim kunlik) *
    - Oylik maosh *
    - Band ish turi (asosiy / yarim stavka / shartnoma)
    - Ishlash joyi (ofis / masofaviy / gibrid)
  
  Qo'shimcha:
    - Qon guruhi (ixtiyoriy)
    - Favqulodda aloqa: ism, telefon, munosabat
    - Izoh (ixtiyoriy)
```

### 12.2 Account yaratilgandan keyin avtomatik jarayon

```
1. HR forma yuboradi
2. Tizim xodim accountini yaratadi (status: "password_pending")
3. Tizim xodimning emailiga parol o'rnatish URL yuboradi (24 soat amal qiladi)
4. DARHOL: HR ga tizim ogohlantirishi:
   ┌────────────────────────────────────────────────────────┐
   │ ✅ [Ism Familiya] accounti yaratildi                   │
   │ 📧 Parol o'rnatish URL: [email]@... ga yuborildi       │
   │ ⚠️  MUHIM: Darhol xodimga qo'ng'iroq qiling va        │
   │    emailni tekshirishini, URL ni bosishini aytib qo'ying│
   │    📞 Telefon: [xodim telefoni]                        │
   └────────────────────────────────────────────────────────┘
5. Xodim URL ni bosib parol o'rnatish sahifasiga o'tadi
6. Xodim login (email) va parolni o'zi yaratadi
7. Parol o'rnatilgandan keyin:
   - Xodimga: "Parolingiz muvaffaqiyatli o'rnatildi. HR tasdiqlashini kuting."
   - HR ga DARHOL tizim ogohlantirishi:
     ┌─────────────────────────────────────────────────────┐
     │ 🔔 [Ism Familiya] parolini o'rnatdi                 │
     │ ✅ Account tasdiqlashingizni kutmoqda               │
     │ → Tasdiqlash uchun: /app/employees/[id]/confirm    │
     └─────────────────────────────────────────────────────┘
8. HR xodim ma'lumotlarini tekshirib → "Tasdiqlash" bosadi
9. Xodimga email: "Accountingiz tasdiqlandi! Tizimga kirishingiz mumkin: [URL]"
10. Xodim login/parol bilan tizimga kiradi
```

### 12.3 Xodim account holatlari

```
created → password_pending → password_set → active
                                             ↓
                                         blocked
```

| Holat | Ma'no |
|---|---|
| `password_pending` | HR yaratdi, email yuborildi, xodim hali parol o'rnatmagan |
| `password_set` | Xodim parol o'rnatdi, HR tasdiqlashini kutmoqda |
| `active` | HR tasdiqladi, xodim to'liq kirish huquqiga ega |
| `blocked` | HR yoki company_admin tomonidan bloklangan |

### 12.4 URL va token xavfsizligi

- Invite URL: `JWT` token, 24 soat TTL (xodim) / 48 soat (kompaniya)
- Bir martalik: token ishlatilgandan keyin invalid
- Resend: agar expire bo'lsa HR qayta yuborishi mumkin (yangi token)
- Hammasi HTTPS orqali

---

## 13. LOGIN VA AUTH SAHIFALARI

### 13.1 Login sahifasi (`/login`)

```
Login sahifasi:
  - Email va parol bilan kirish
  - "Parolni unutdim" havolasi
  - Status xabarlari:
    * "Accountingiz tasdiqlash kutilmoqda — administrator bilan bog'laning"  (pending)
    * "Accountingiz vaqtincha to'xtatildi — [telefon]"                       (suspended)
    * "Accountingiz bloklandi — [telefon]"                                   (blocked)
  - "Kompaniyangizni ro'yxatdan o'tkazmadingizmi?" → murojaat formasi
  - Til tanlash (uz/ru/en/ja)
```

### 13.2 Parolni tiklash

```
1. /login → "Parolni unutdim" havolasi
2. /forgot-password → Email kiritish
3. Emailga tiklash URL (15 daqiqa amal qiladi)
4. /reset-password?token=... → Yangi parol kiritish
5. Muvaffaqiyat → /login ga yo'naltirish + "Parolingiz yangilandi, kiring"
```

### 13.3 Murojaat sahifasi (`/contact`)

Landing page dagi alohida sahifa yoki modal:
```
Kim ko'radi: public (hamma)
Maqsad: Kompaniyalar tizimni sinab ko'rishni istasa birinchi qadam

Sahifada:
  1. Qisqa tushuntirish: "Biz siz bilan bog'lanib, tizimni ko'rsatib, kelishuvga erishgandan
     keyin accountingizni ochamiz"
  2. Murojaat formasi (Section 11.1 dagi maydonlar)
  3. Kutish vaqti: "Odatda 1 ish kuni ichida javob beramiz"
  4. To'g'ridan-to'g'ri aloqa: Telegram, Telefon

Yuborilgandan keyin:
  "Murojaatingiz qabul qilindi! Siz bilan 24 soat ichida bog'lanamiz.
   Telefon: +998 XX XXX-XX-XX | Telegram: @username"
```

---

## 14. SUPER ADMIN AI TIZIMI

### 14.1 Admin AI Yordamchisi

`/admin/ai-chat` — super_admin/sub_admin uchun maxsus AI chat:

**Standart savollar:**
- "Bugungi tizim holati qanday?"
- "Oxirgi 7 kunda qaysi kompaniyalar ko'p xato berdi?"
- "Knowledge Base dagi eng ko'p so'raladigan savol nima?"
- "Qaysi kompaniyalar obunadan chiqib ketish xavfida?"

**Maxsus Agentlar:**
```
1. KB Agent (Knowledge Base Agent)
   - KB bo'shliqlari: "Qaysi savollar javobsiz qoldi?"
   - Yangi kontent taklif: "Bu savolga qo'shish kerak"
   - KB sifat tahlili: "Qaysi javoblar outdated?"

2. Support Agent
   - Kompaniya muammolarini tahlil qilish
   - "Nima uchun [kompaniya] ko'p xato bermoqda?"
   - Tezkor yechim taklif

3. Analytics Agent
   - MRR o'zgarishi sabablarini tushuntirish
   - Churn ehtimoli yuqori kompaniyalarni aniqlash
   - Foydalanish statistikasini tahlil

4. Health Agent
   - Tizim holati real vaqt monitoring
   - Anomaliyalarni aniqlash
   - "Oxirgi 1 soatda nimalar noto'g'ri bo'ldi?"
```

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
  - Jami so'rovlar: X
  - Xatolik darajasi: X%
  - O'rtacha javob vaqti: Xms
  - AI sarflagan kredit: $X
  - Faol kompaniyalar: X
```

---

*SPEC.md — AI Business Concierge v3.0*
*Yangilandi: 2026-05-06 — Rol arxitekturasi, kompaniya onboarding, xodim onboarding, admin AI tizimi*
*Avvalgi: v2.0 (2026-04-16) — Raqobat tahlili + kuchli pozitsiyalash*
