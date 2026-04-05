# SPEC.md — AI Business Concierge

> O'zbek tadbirkorning yagona AI yordamchisi
> Version: 1.0 | Sana: 2026-04-04

---

## 1. MAHSULOT HAQIDA

### 1.1 Bir qatorda
AI Business Concierge — O'zbekistondagi kichik biznes egalari uchun AI asosidagi biznes yordamchi platforma. Telegram bot (asosiy) va web dashboard (to'liq) orqali soliq maslahat, hujjat generatsiya va savdo avtomatizatsiyasini birlashtiradi.

### 1.2 Muammo
O'zbekistonda 403,800+ kichik biznes bor. Ularning ko'pchiligi:
- Soliq/buxgalteriya savollariga javob topa olmaydi → jarimalarga tushadi
- Shartnoma/ariza uchun yuristga 200-500K so'm to'laydi → ortiqcha xarajat
- Mijozlarga qo'lda javob beradi → kechqurun/dam olish kuni mijoz yo'qoladi
- Excel/qog'ozda ishlaydi → raqamli muhitga o'ta olmayapti

### 1.3 Yechim
Telegram bot + Web dashboard orqali 3 ta AI modul:
1. **AI Maslahatchi** — soliq, buxgalteriya, biznes savollari
2. **AI Hujjatchi** — shartnoma, ariza, nizom generatsiya (PDF/DOCX)
3. **AI Sotuvchi** — Telegram savdo bot yaratish va boshqarish

### 1.4 Auditoriya
| Segment | Hajmi | Kanal |
|---|---|---|
| YaTT (yakka tartibdagi tadbirkor) | 200,000+ | Telegram bot |
| Kichik do'kon/xizmat ko'rsatuvchi | 150,000+ | Telegram bot |
| 10-50 xodimli o'rta biznes | 50,000+ | Web dashboard |
| Buxgalteriya/yuridik firmalar | 5,000+ | Web dashboard (Kompaniya tarif) |

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

#### SUPER_ADMIN (Tizim Administratori)
Butun tizim ustidan to'liq nazorat.

| Ruxsat | Tafsilot |
|---|---|
| Tenantlarni boshqarish | Yaratish, o'chirish, faollashtirish, bloklash |
| Foydalanuvchilarni boshqarish | Barcha tenantlardagi barcha userlar |
| AI monitoring | Barcha AI so'rovlar, xatolar, sifat ko'rsatkichlari |
| Tizim sozlamalari | LLM konfiguratsiya, narxlar, tariflar, limitlar |
| Knowledge Base | Soliq qoidalari, hujjat shablonlar yangilash |
| Analytics | Tizim darajasidagi statistika, daromad, churn |
| Billing | To'lovlar, obunalar, refund |
| Audit log | Barcha harakatlar logi |

**Super Admin Dashboard sahifalari:**
- `/admin` — Umumiy ko'rsatkichlar (users, revenue, AI usage, error rate)
- `/admin/tenants` — Tenantlar ro'yxati + boshqarish
- `/admin/users` — Global foydalanuvchilar
- `/admin/ai` — AI monitoring (so'rovlar, aniqlik, narx, xatolar)
- `/admin/knowledge-base` — Soliq kodeksi, shablonlar boshqarish
- `/admin/billing` — To'lovlar, obunalar
- `/admin/settings` — Tizim konfiguratsiya
- `/admin/audit` — Audit log

#### TENANT_ADMIN (Biznes Egasi / Kompaniya Admini)
O'z kompaniyasi doirasida to'liq boshqaruv.

| Ruxsat | Tafsilot |
|---|---|
| Xodimlarni boshqarish | Qo'shish, o'chirish, rol berish |
| Barcha modullar | AI Maslahatchi, Hujjatchi, Sotuvchi — to'liq |
| Hisobotlar | Kompaniya statistikasi, AI usage |
| Integratsiyalar | Telegram, Click/Payme sozlash |
| Savdo botlar | Yaratish, sozlash, katalog boshqarish |
| Obuna | Tarif o'zgartirish, to'lov tarixi |

**Tenant Admin Dashboard:**
- `/dashboard` — Kompaniya ko'rsatkichlari
- `/team` — Xodimlar boshqarish
- `/ai-assistant` — AI Maslahatchi
- `/documents` — Hujjatlar (generatsiya + arxiv)
- `/sales-bots` — Savdo botlar boshqarish
- `/inbox` — Unified inbox
- `/tasks` — Vazifalar
- `/reports` — Hisobotlar
- `/integrations` — Integratsiyalar
- `/settings` — Kompaniya sozlamalari
- `/billing` — Obuna va to'lov

#### MANAGER (Bo'lim Boshlig'i)
| Ruxsat | Tafsilot |
|---|---|
| AI Maslahatchi | To'liq (o'z bo'limi kontekstida) |
| Hujjatlar | Yaratish, ko'rish (o'z bo'limiga tegishli) |
| Vazifalar | O'z bo'limi xodimlariga biriktirish |
| Hisobotlar | O'z bo'limi statistikasi |

#### ACCOUNTANT (Buxgalter)
| Ruxsat | Tafsilot |
|---|---|
| AI Maslahatchi | Soliq va buxgalteriya savollari |
| Hujjatlar | Moliyaviy hujjatlar yaratish va ko'rish |
| Hisobotlar | Moliyaviy hisobotlar |

#### HR (Kadrlar)
| Ruxsat | Tafsilot |
|---|---|
| AI Maslahatchi | Kadrlar savollari |
| Hujjatlar | Mehnat shartnomasi, buyruqlar yaratish |
| HR Pulse | Cases, surveys |

#### EMPLOYEE (Xodim)
| Ruxsat | Tafsilot |
|---|---|
| AI Maslahatchi | Cheklangan (kunlik limit) |
| Vazifalar | O'ziga biriktirilgan vazifalar |
| Hujjatlar | Faqat o'ziga tegishli |

---

## 3. UI/UX SPETSIFIKATSIYASI

### 3.1 Dizayn Prinsipi

**"Oddiy odam 30 soniyada tushunadigan tizim"**

- Har bir sahifada **bitta asosiy harakat** bo'lishi kerak
- O'zbek tilida **tushunarli so'zlar** (texnik atamalar EMAS)
- **Katta tugmalar**, katta shrift — mobil qurilmada qulay
- **3 ta rang:** asosiy, aksent, fond — ortiqcha rang yo'q
- **Animatsiya:** minimal, faqat feedback uchun (loading, success, error)
- **Xato xabarlari:** tushunarli tilda ("Nimadur xato ketdi" emas, "Internet aloqasi yo'q, qayta urinib ko'ring")

### 3.2 Sahifalar Tuzilishi

#### Public sahifalar (auth talab qilinmaydi)

```
/ (Landing Page — Bosh sahifa)
├── Hero section — "Biznesingiz uchun AI yordamchi"
├── 3 ta modul tushuntirish (Maslahatchi, Hujjatchi, Sotuvchi)
├── Narxlar (tariflar)
├── FAQ
├── Telegram bot link
├── Kirish / Ro'yxatdan o'tish tugmalari
│
/login — Kirish
/register — Ro'yxatdan o'tish
/pricing — Tariflar batafsil
/about — Biz haqimizda
```

#### Auth keyin — Dashboard (rolga qarab)

```
/dashboard — Bosh sahifa (rolga mos widgets)
│
├── /ai-assistant — AI Maslahatchi (chat interfeys)
│   ├── Yangi suhbat
│   ├── Suhbatlar tarixi
│   └── Mavzular: Soliq | Buxgalteriya | Kadrlar | Biznes
│
├── /documents — AI Hujjatchi
│   ├── Yangi hujjat yaratish (shablon tanlash → savollar → PDF)
│   ├── Mening hujjatlarim (arxiv)
│   └── Shablonlar kutubxonasi
│
├── /sales-bots — AI Sotuvchi
│   ├── Yangi bot yaratish
│   ├── Katalog boshqarish
│   ├── Buyurtmalar
│   └── Bot statistikasi
│
├── /inbox — Unified Inbox
├── /tasks — Vazifalar
├── /hr — HR Pulse (agar ruxsat bo'lsa)
├── /reports — Hisobotlar
├── /team — Jamoa boshqarish (admin/manager)
├── /integrations — Integratsiyalar
├── /billing — Obuna va to'lov
├── /settings — Sozlamalar (profil, til, bildirishnomalar)
│
└── /admin/* — Super Admin panel (faqat SUPER_ADMIN)
```

### 3.3 Landing Page Tuzilishi

```
┌──────────────────────────────────────────────┐
│  HEADER: Logo | Imkoniyatlar | Narxlar | UZ/RU | Kirish  │
├──────────────────────────────────────────────┤
│                                              │
│  HERO: "Biznesingiz uchun AI yordamchi"      │
│  Subtitle: "Soliq maslahat. Hujjat yaratish. │
│  Savdo avtomatizatsiya. Hammasi bitta joyda."│
│                                              │
│  [Telegram'da sinab ko'ring]  [Bepul boshlash]│
│                                              │
├──────────────────────────────────────────────┤
│  3 TA MODUL KARTOCHKALARI                    │
│  ┌──────┐ ┌──────┐ ┌──────┐                 │
│  │ 💼   │ │ 📄   │ │ 🛒   │                 │
│  │Masla-│ │Hujjat│ │Savdo │                 │
│  │hatchi│ │chi   │ │bot   │                 │
│  └──────┘ └──────┘ └──────┘                 │
├──────────────────────────────────────────────┤
│  QANDAY ISHLAYDI: 3 qadam                   │
│  1. Telegram botni oching                    │
│  2. Savolingizni yozing                      │
│  3. AI javob/hujjat olasiz                   │
├──────────────────────────────────────────────┤
│  NARXLAR: 4 ta tarif kartochkasi             │
├──────────────────────────────────────────────┤
│  FAQ: Accordion                              │
├──────────────────────────────────────────────┤
│  CTA: "Hoziroq bepul boshlang"              │
├──────────────────────────────────────────────┤
│  FOOTER: Aloqa | Telegram | Maxfiylik siyosati│
└──────────────────────────────────────────────┘
```

### 3.4 Dashboard Layouti

```
┌──────────────────────────────────────────────┐
│  TOPBAR: Logo | Qidiruv | Til | Bildirishnoma | Profil │
├────────┬─────────────────────────────────────┤
│        │                                     │
│ SIDEBAR│         MAIN CONTENT                │
│        │                                     │
│ 🏠 Bosh│  ┌─────────────────────────────┐   │
│ 🤖 AI  │  │   Rolga mos widgets         │   │
│ 📄 Hujjat│  │   va asosiy kontent         │   │
│ 🛒 Savdo│  │                             │   │
│ 📥 Inbox│  └─────────────────────────────┘   │
│ ✅ Vazifa│                                    │
│ 👥 Jamoa│                                    │
│ 📊 Hisob│                                    │
│ ⚙️ Sozla│                                    │
│        │                                     │
├────────┴─────────────────────────────────────┤
│  Mobile: Sidebar → Bottom navigation         │
└──────────────────────────────────────────────┘
```

### 3.5 Telegram Bot UX

```
/start
  → Til tanlang: [O'zbekcha] [Русский]
  → Salom! Men sizning AI biznes yordamchingizman.
  → Nima qila olaman:
    [💼 Maslahat olish]
    [📄 Hujjat yaratish]
    [🛒 Savdo bot]
    [⚙️ Sozlamalar]

Maslahat olish:
  → Savolingizni yozing yoki tanlang:
    [Soliq savollari]
    [Xodim masalalari]
    [Biznes maslahat]
  → User yozadi: "QQS hisobotini qachon topshiraman?"
  → AI javob beradi (source ko'rsatiladi)
  → [👍 Foydali] [👎 Foydali emas] [📋 Saqlash]

Hujjat yaratish:
  → Qaysi hujjat kerak?
    [Ijara shartnomasi]
    [Mehnat shartnomasi]
    [Soliq arizasi]
    [Boshqa...]
  → AI savollar beradi (kim, nima, qancha, sana)
  → "Hujjatingiz tayyor!" + PDF fayl
  → [📥 Yuklab olish] [✏️ O'zgartirish] [📋 Arxivga saqlash]
```

---

## 4. TEXNIK ARXITEKTURA

### 4.1 Stack

| Qatlam | Texnologiya | Sabab |
|---|---|---|
| **Frontend** | React 18 + TypeScript + Vite | Mavjud repo, tez |
| **UI** | Tailwind CSS + Radix UI | Mavjud repo |
| **State** | Zustand + React Query | Mavjud repo |
| **Backend** | Supabase Edge Functions (Deno) + Hono | Mavjud repo |
| **Database** | Supabase PostgreSQL | Mavjud repo |
| **Auth** | Supabase Auth | Mavjud repo |
| **Realtime** | Supabase Realtime | Mavjud repo |
| **AI (asosiy)** | Claude Haiku 3.5 (Anthropic) | Arzon, tez, UZ yaxshi |
| **AI (murakkab)** | Claude Sonnet 4 (Anthropic) | Sifat, chuqur tahlil |
| **Telegram** | grammY framework | TypeScript native, Deno mos |
| **Hujjat gen** | pdf-lib + docx (npm) | Server-side PDF/DOCX |
| **To'lov** | Click API + Payme API | O'zbekiston standarti |
| **Vector DB** | Supabase pgvector | Knowledge Base uchun |
| **Hosting** | Netlify (frontend) + Supabase (backend) | Mavjud |
| **Monitoring** | Sentry | Xato tracking |

### 4.2 Arxitektura Diagrammasi

```
┌─────────────────────────────────────────────────────────────┐
│                        MIJOZLAR                              │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Telegram Bot  │  │ Web App      │  │ Admin Panel      │  │
│  │ (grammY)      │  │ (React)      │  │ (React)          │  │
│  │ 70% traffic   │  │ 25% traffic  │  │ 5% (internal)    │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   API GATEWAY (Hono)                          │
│              Supabase Edge Functions (Deno)                   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 MIDDLEWARE                            │    │
│  │  Auth │ Rate Limit │ Tenant Context │ Audit Log     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │  /ai/*       │ │  /docs/*    │ │  /sales-bot/*       │   │
│  │  Maslahatchi  │ │  Hujjatchi  │ │  Sotuvchi           │   │
│  └──────┬──────┘ └──────┬──────┘ └──────────┬──────────┘   │
│         │               │                    │               │
│  ┌──────▼───────────────▼────────────────────▼────────┐     │
│  │              LLM ROUTER                             │     │
│  │                                                     │     │
│  │  Classifier → Haiku (oddiy, 80%)                    │     │
│  │             → Sonnet (murakkab, 20%)                │     │
│  │                                                     │     │
│  │  Features:                                          │     │
│  │  - Model auto-selection (complexity based)          │     │
│  │  - Response caching (tez-tez so'raladigan savollar) │     │
│  │  - Fallback (Haiku xato → Sonnet retry)             │     │
│  │  - Cost tracking (har bir so'rov narxi)             │     │
│  │  - Rate limiting (tarifga mos)                      │     │
│  └────────────────────────┬────────────────────────────┘     │
│                           │                                   │
│  ┌────────────────────────▼────────────────────────────┐     │
│  │           KNOWLEDGE BASE (pgvector)                  │     │
│  │                                                     │     │
│  │  ┌──────────────┐ ┌──────────┐ ┌──────────────┐   │     │
│  │  │ Soliq kodeksi │ │ Hujjat   │ │ Biznes FAQ   │   │     │
│  │  │ 2026 qoidalar│ │ shablonlar│ │ Kadrlar qoida│   │     │
│  │  └──────────────┘ └──────────┘ └──────────────┘   │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              SUPABASE (PostgreSQL)                    │    │
│  │                                                     │    │
│  │  tenants │ users │ user_tenants │ roles              │    │
│  │  ai_conversations │ ai_messages │ ai_feedback        │    │
│  │  documents │ doc_templates │ doc_generated            │    │
│  │  sales_bots │ catalogs │ orders                      │    │
│  │  subscriptions │ payments │ invoices                  │    │
│  │  tasks │ inbox │ notifications │ audit_log            │    │
│  │  knowledge_base │ knowledge_embeddings               │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              INTEGRATIONS                            │    │
│  │  Telegram Bot API │ Click │ Payme │ Resend Email    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 LLM Router Logic

```typescript
// Pseudocode
function routeToLLM(query: string, context: AIContext): LLMChoice {
  // 1. Cache check
  if (cache.has(query.normalized)) return cache.get(query);

  // 2. Classify complexity
  const complexity = classifyQuery(query);

  // 3. Route
  if (complexity === 'simple') {
    // Soliq sanasi, oddiy savol, FAQ
    return { model: 'claude-haiku-3-5', maxTokens: 500 };
  }

  if (complexity === 'document') {
    // Hujjat generatsiya — aniqlik muhim
    return { model: 'claude-sonnet-4', maxTokens: 2000 };
  }

  if (complexity === 'analysis') {
    // Moliyaviy tahlil, murakkab maslahat
    return { model: 'claude-sonnet-4', maxTokens: 1500 };
  }

  // Default: Haiku
  return { model: 'claude-haiku-3-5', maxTokens: 800 };
}
```

---

## 5. SIFAT STANDARTLARI

### 5.1 Bug Prevention Strategiyasi

| Qatlam | Yondashuv |
|---|---|
| **TypeScript** | `strict: true` — runtime xatolarni compile vaqtida ushlash |
| **Zod** | API input/output validatsiya — noto'g'ri ma'lumot o'tmaydi |
| **RLS** | Supabase Row Level Security — ma'lumot izolyatsiyasi |
| **Error Boundary** | React error boundary — UI crash bo'lmaydi |
| **Sentry** | Real-time xato monitoring + alertlar |
| **Audit Log** | Har bir muhim harakat saqlanadi |
| **Rate Limiting** | API abuse'dan himoya |
| **Input Sanitization** | XSS, SQL injection himoya |

### 5.2 AI Sifat Standartlari

| Mezon | Standart | Qanday tekshiriladi |
|---|---|---|
| **Aniqlik** | 95%+ oddiy savollar uchun | Knowledge base grounding + test suite |
| **Hallucination** | 0% narx/sana ma'lumotlarda | Faqat bazadagi ma'lumot ishlatiladi |
| **Javob vaqti** | < 3 soniya (Haiku), < 8 soniya (Sonnet) | Monitoring + alerting |
| **"Bilmayman"** | Ishonch < 70% → disclaimer | Confidence scoring |
| **Tillar** | UZ/RU natural | Native speaker QA |

### 5.3 Testing Strategiyasi

```
Unit Tests:        Har bir util funksiya, AI router logic
Integration Tests: API endpoint + DB + AI pipeline
E2E Tests:         Asosiy user flow'lar (onboarding, hujjat yaratish)
AI Tests:          100 ta test savol → kutilgan javob bilan solishtirish
Manual QA:         Har bir release oldidan 20 ta scenario
```

---

## 6. MONETIZATSIYA

### 6.1 Tariflar

| Tarif | Narx | Limitlar |
|---|---|---|
| **Bepul** | 0 so'm | 5 AI so'rov/kun, 2 hujjat/oy, savdo bot yo'q |
| **Tadbirkor** | 49,000 so'm/oy (~$4) | 50 AI so'rov/kun, 20 hujjat/oy, 1 savdo bot |
| **Biznes** | 149,000 so'm/oy (~$12) | Cheksiz AI, cheksiz hujjat, 5 savdo bot, web dashboard |
| **Kompaniya** | 499,000 so'm/oy (~$40) | Hammasi + 20 user, API, priority support, analytics |

### 6.2 To'lov usullari
- **Click** — O'zbekistondagi eng keng tarqalgan
- **Payme** — ikkinchi variant
- **Bank o'tkazmasi** — Kompaniya tarifi uchun

---

## 7. DATABASE SCHEMA (yangi jadvallar)

Mavjud jadvallar saqlanadi (tenants, user_tenants, tasks, inbox_items, docs, notifications, integrations).
Quyidagilar QO'SHILADI:

### 7.1 Yangi jadvallar

```sql
-- Obunalar
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('free','tadbirkor','biznes','kompaniya')),
  status TEXT NOT NULL CHECK (status IN ('active','cancelled','past_due','trial')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- To'lovlar
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id),
  amount BIGINT NOT NULL, -- tiyin (100 tiyin = 1 so'm)
  currency TEXT DEFAULT 'UZS',
  provider TEXT NOT NULL CHECK (provider IN ('click','payme','bank')),
  provider_tx_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending','completed','failed','refunded')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI suhbatlar
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT,
  module TEXT NOT NULL CHECK (module IN ('maslahatchi','hujjatchi','sotuvchi')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI xabarlar
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_conversations(id) NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  model TEXT, -- 'claude-haiku-3-5' yoki 'claude-sonnet-4'
  tokens_in INT,
  tokens_out INT,
  cost_usd NUMERIC(10,6),
  confidence NUMERIC(3,2), -- 0.00 - 1.00
  sources JSONB, -- knowledge base references
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI feedback
CREATE TABLE ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES ai_messages(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('positive','negative')),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Hujjat shablonlar
CREATE TABLE doc_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_uz TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  category TEXT NOT NULL, -- 'shartnoma','ariza','buyruq','nizom'
  fields JSONB NOT NULL, -- shablon to'ldirish uchun maydonlar
  template_body TEXT NOT NULL, -- Markdown/HTML shablon
  is_active BOOLEAN DEFAULT true,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Generatsiya qilingan hujjatlar
CREATE TABLE doc_generated (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  template_id UUID REFERENCES doc_templates(id),
  title TEXT NOT NULL,
  fields_data JSONB NOT NULL,
  output_url TEXT, -- Supabase Storage dagi fayl
  format TEXT DEFAULT 'pdf' CHECK (format IN ('pdf','docx')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Savdo botlar
CREATE TABLE sales_bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  name TEXT NOT NULL,
  telegram_bot_token TEXT, -- encrypted
  telegram_bot_username TEXT,
  welcome_message TEXT,
  ai_instructions TEXT, -- bot uchun maxsus ko'rsatmalar
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Katalog
CREATE TABLE catalogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_bot_id UUID REFERENCES sales_bots(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL, -- tiyin
  currency TEXT DEFAULT 'UZS',
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Buyurtmalar (savdo bot orqali)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_bot_id UUID REFERENCES sales_bots(id) NOT NULL,
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  customer_telegram_id BIGINT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  items JSONB NOT NULL,
  total_amount BIGINT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','confirmed','delivered','cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Knowledge Base
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'soliq','mehnat','tadbirkorlik','umumiy'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT, -- qonun nomi, manbasi
  valid_from DATE,
  valid_to DATE,
  embedding vector(1536),
  is_active BOOLEAN DEFAULT true,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Audit log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'login','ai_query','doc_generated','payment'
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Usage tracking (tarif limitlari uchun)
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  ai_queries INT DEFAULT 0,
  docs_generated INT DEFAULT 0,
  bot_messages INT DEFAULT 0,
  UNIQUE(tenant_id, user_id, date)
);
```

---

## 8. API ENDPOINTLAR (yangi)

Mavjud endpointlar saqlanadi. Quyidagilar QO'SHILADI:

### 8.1 AI Module
| Method | Endpoint | Vazifa |
|---|---|---|
| POST | `/v1/ai/chat` | AI suhbat (mavjud, yangilanadi) |
| GET | `/v1/ai/conversations` | Suhbatlar ro'yxati |
| GET | `/v1/ai/conversations/:id` | Suhbat batafsil |
| POST | `/v1/ai/feedback` | Javobga baho berish |

### 8.2 Hujjat Module
| Method | Endpoint | Vazifa |
|---|---|---|
| GET | `/v1/doc-templates` | Shablonlar ro'yxati |
| POST | `/v1/docs/generate` | Hujjat generatsiya |
| GET | `/v1/docs/generated` | Generatsiya qilingan hujjatlar |
| GET | `/v1/docs/generated/:id/download` | Hujjatni yuklab olish |

### 8.3 Savdo Bot Module
| Method | Endpoint | Vazifa |
|---|---|---|
| POST | `/v1/sales-bots` | Yangi bot yaratish |
| GET | `/v1/sales-bots` | Botlar ro'yxati |
| PATCH | `/v1/sales-bots/:id` | Bot sozlamalarini yangilash |
| POST | `/v1/sales-bots/:id/catalog` | Mahsulot qo'shish |
| GET | `/v1/sales-bots/:id/orders` | Buyurtmalar |
| PATCH | `/v1/sales-bots/:id/orders/:orderId` | Buyurtma statusini yangilash |

### 8.4 Billing
| Method | Endpoint | Vazifa |
|---|---|---|
| GET | `/v1/billing/subscription` | Joriy obuna |
| POST | `/v1/billing/subscribe` | Obuna bo'lish |
| POST | `/v1/billing/webhook/click` | Click webhook |
| POST | `/v1/billing/webhook/payme` | Payme webhook |

### 8.5 Admin
| Method | Endpoint | Vazifa |
|---|---|---|
| GET | `/v1/admin/stats` | Tizim statistikasi |
| GET | `/v1/admin/tenants` | Barcha tenantlar |
| PATCH | `/v1/admin/tenants/:id` | Tenant boshqarish |
| GET | `/v1/admin/ai/monitoring` | AI monitoring |
| POST | `/v1/admin/knowledge-base` | KB yangilash |
| GET | `/v1/admin/audit` | Audit log |

### 8.6 Telegram Bot Webhook
| Method | Endpoint | Vazifa |
|---|---|---|
| POST | `/v1/telegram/webhook` | Asosiy bot webhook |
| POST | `/v1/telegram/sales-bot/:id/webhook` | Savdo bot webhook |

---

## 9. XAVFSIZLIK

| Soha | Yechim |
|---|---|
| **Auth** | Supabase Auth + JWT + refresh tokens |
| **RLS** | Har bir jadvalda Row Level Security |
| **API keys** | Supabase Vault da encrypted saqlash |
| **Bot tokens** | Database da encrypted (pgcrypto) |
| **Input** | Zod validation + sanitization |
| **Rate limit** | IP + user based, tarifga mos |
| **CORS** | Faqat ruxsat berilgan domainlar |
| **Audit** | Barcha muhim harakatlar loglanadi |
| **HTTPS** | Barcha trafik encrypted |

---

## 10. TILLAR

| Til | Kod | Qo'llanish |
|---|---|---|
| O'zbekcha (lotin) | `uz` | Asosiy til |
| Русский | `ru` | Ikkinchi til |
| English | `en` | Dashboard, admin, docs |

AI javoblar foydalanuvchi tanlagan tilda beriladi.
Telegram bot: foydalanuvchi /start da til tanlaydi.
Web: header da til almashtirish.

---

*SPEC.md — AI Business Concierge v1.0*
*Keyingi: CLAUDE.md va PLAN.md*
