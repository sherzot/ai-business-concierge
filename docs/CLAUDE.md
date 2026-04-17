# CLAUDE.md — AI Business Concierge

> Claude Code uchun loyiha konteksti va qoidalar
> Bu faylni har bir sessiya boshida o'qi
> Version: 2.0 | Yangilandi: 2026-04-16

---

## LOYIHA HAQIDA

AI Business Concierge — O'zbekistondagi **allaqachon ishlayotgan** kichik biznes egalari uchun **kundalik operatsion boshqaruv** AI yordamchisi.

**Kalit pozitsiya:** Bank AI yechimlari (SQB va boshqalar) biznes BOSHLASHGA yordam beradi. Biz biznes YURITISHGA — 365 kun, har kuni — yordam beramiz.

**3 ta modul:**
1. **AI Maslahatchi** — soliq/biznes/kadrlar savollari (Knowledge Base + Claude)
2. **AI Hujjatchi** — shartnoma/ariza/buyruq generatsiya (PDF/DOCX)
3. **AI Sotuvchi** — Telegram savdo bot yaratish va boshqarish

**Platformalar:** Telegram bot (70% traffic, asosiy) + Web dashboard (25%) + Admin panel (5%)

**Bozor urgentsiyasi:** SQB "AI Maslahatchi" chiqqan (2026) — biz tezroq va kengroq horizontal yechim bilan bozorga kirishimiz kerak. Maqsad: 2026 Q2 da Telegram MVP live.

---

## RAQOBAT KONTEKSTI

| Raqobatchi | Nima qiladi | Bizning farqimiz |
|---|---|---|
| SQB AI | Kredit olishga yordam, biznes reja | Kundalik ops, Telegram, hujjat gen, savdo bot |
| My.soliq.uz | Rasmiy soliq portali | AI maslahat, natural til, tez javob |
| ChatGPT | Umumiy AI | O'zbekiston qonunlari KB, hujjat generatsiya |
| 1C | Buxgalteriya dastur | Oddiy, Telegram, AI maslahat |

**SQB raqib emas — funnel:** Ular kredit beradi → mijoz biznes boshlaydi → **bizning botga keladi** kundalik masalalar bilan.

---

## TEXNIK STACK

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Radix UI
- **Backend:** Supabase Edge Functions (Deno) + Hono framework
- **Database:** Supabase PostgreSQL + pgvector (knowledge base)
- **Auth:** Supabase Auth (multi-tenant)
- **AI:** Claude Haiku 3.5 (oddiy, 80%) + Claude Sonnet 4 (murakkab, 20%)
- **Telegram:** grammY framework (Deno)
- **To'lov:** Click API + Payme API
- **Hujjat:** pdf-lib (PDF) + docx (DOCX)
- **Hosting:** Netlify (frontend) + Supabase (backend)
- **Monitoring:** Sentry

---

## MAVJUD REPO HOLATI (2026-04-16)

✅ **Tayyor modullar:** Auth, Tasks, Inbox, HR, Docs, Reports, Integrations, Notifications, Settings, Tenants

✅ **Tayyor infra:** Supabase Auth, RLS, Hono API (~20+ endpoint), React Query, Zustand, i18n (uz/ru/en/ja), Realtime, 40+ Radix UI komponentlar

✅ **AI qismi:** AIChat komponenti + `/ai/chat` endpoint (OpenAI bilan) + 8 ta prompt fayl

❌ **Qo'shilishi kerak:**
- LLM Router (OpenAI → Claude Haiku/Sonnet)
- Knowledge Base (pgvector + embedding + RAG)
- Telegram Bot (grammY)
- AI Hujjatchi (PDF/DOCX generatsiya)
- AI Sotuvchi (savdo bot)
- Billing (Click/Payme)
- Landing Page
- Admin Panel
- 12 ta yangi DB jadval

---

## LOYIHA TUZILISHI

```
ai-business-concierge/
├── docs/                        # CLAUDE.md, SPEC.md, PLAN.md + boshqa hujjatlar
├── frontend/src/
│   ├── app/                     # Global config, providers, router
│   ├── features/
│   │   ├── admin/               # YANGI: Super Admin panel
│   │   ├── ai-assistant/        # YANGI: AI Maslahatchi UI
│   │   ├── auth/                # Mavjud
│   │   ├── billing/             # YANGI: Obuna va to'lov
│   │   ├── docs/                # Mavjud + YANGILASH
│   │   ├── landing/             # YANGI: Bosh sahifa
│   │   ├── sales-bots/          # YANGI: Savdo botlar
│   │   └── ...                  # hr, inbox, reports, settings, tasks, tenants
│   └── shared/
├── supabase/
│   ├── migrations/
│   └── functions/
│       ├── server/              # Hono API (routes/, services/, middleware/)
│       └── telegram-bot/        # YANGI: grammY bot
└── resources/
    ├── prompts/                 # mavjud + maslahatchi/, hujjatchi/, sotuvchi/
    ├── knowledge-base/          # YANGI: soliq-2026.md, mehnat-kodeksi.md
    └── templates/               # YANGI: shartnomalar/, arizalar/, buyruqlar/
```

---

## MUHIM QOIDALAR

### Umumiy
1. **TypeScript strict mode** — `strict: true` har doim
2. **Zod** — barcha API input/output validatsiya
3. **Error handling** — try/catch, user-friendly xato xabarlari
4. **Audit log** — muhim harakatlar loglanadi
5. **RLS** — har bir yangi jadvalda Row Level Security SHART
6. **Tillar** — barcha UI stringlar i18n orqali (uz, ru, en)
7. **Mavjud kodni buzma** — yangi feature qo'shganda mavjud funksionallik ishlashda davom etadi

### AI qoidalari
1. **Hallucination prevention** — AI faqat knowledge base dagi ma'lumotni ishlatadi
2. **Confidence scoring** — har bir AI javobda ishonch darajasi
3. **Disclaimer** — "Bu AI maslahat, professional maslahat o'rnini bosmaydi"
4. **Feedback** — har bir javobga 👍/👎
5. **Cost tracking** — har bir AI so'rov narxi saqlanadi
6. **Cache** — tez-tez so'raladigan savollar

### LLM Router mantiq
- **simple** → Claude Haiku 3.5, 500 token
- **document** → Claude Sonnet 4, 2000 token
- **analysis** → Claude Sonnet 4, 1500 token
- **default** → Claude Haiku 3.5, 800 token

### Frontend qoidalari
1. **Mobile-first** — avval mobile, keyin desktop
2. **Accessibility** — ARIA attributes, keyboard navigation
3. **Loading/Error/Empty states** — har biri uchun

### Backend qoidalari
1. **Rate limiting** — tarifga mos
2. **Tenant isolation** — so'rov faqat o'z tenant ma'lumotini ko'radi
3. **Idempotency** — to'lov webhooklari idempotent SHART

### Telegram Bot qoidalari
1. **Graceful errors** — bot hech qachon crash bo'lmaydi
2. **Timeout** — 25s dan uzoq bo'lsa "Javob tayyorlanmoqda..." xabar
3. **Rate limit** — bepul: 5 so'rov/kun

---

## COMMIT QOIDALARI

```
type(scope): description
```
Scope'lar: `telegram`, `ai`, `docs`, `sales-bot`, `billing`, `admin`, `auth`, `ui`, `db`, `api`

**Misol:**
```
feat(telegram): add maslahatchi module with KB integration
fix(ai): prevent hallucination in tax date answers
feat(db): add subscriptions and payments migration
```

---

## ENVIRONMENT VARIABLES

### Frontend (.env)
```
VITE_SUPABASE_PROJECT_ID=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=
VITE_SENTRY_DSN=
VITE_APP_URL=
```

### Backend (Supabase secrets)
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
CLICK_MERCHANT_ID=
CLICK_SERVICE_ID=
CLICK_SECRET_KEY=
PAYME_MERCHANT_ID=
PAYME_KEY=
RESEND_API_KEY=
SENTRY_DSN=
OPENAI_API_KEY=        # Embedding uchun (text-embedding-3-small)
```

---

## DOIMIY ESLATMALAR

- **Migration** — DB o'zgarish faqat migration fayl orqali
- **Test** — yangi API endpoint = yangi test
- **i18n** — yangi UI string = uz + ru tarjima
- **Mobile** — har bir UI o'zgarish mobile da tekshiriladi
- **AI test** — AI prompt o'zgarish = 10 ta test savol bilan tekshirish
- **Raqobat** — SQB raqib emas, funnel. Biz kundalik ops, ular startup bosqich.
