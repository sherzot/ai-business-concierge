# CLAUDE.md — AI Business Concierge

> Claude Code uchun loyiha konteksti va qoidalar
> Bu faylni har bir sessiya boshida o'qi

---

## LOYIHA HAQIDA

AI Business Concierge — O'zbekistondagi kichik biznes egalari uchun AI biznes yordamchi.
3 ta modul: AI Maslahatchi (soliq/biznes), AI Hujjatchi (shartnoma/ariza), AI Sotuvchi (Telegram savdo bot).
Telegram bot (asosiy) + Web dashboard (to'liq) + Admin panel.

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

## LOYIHA TUZILISHI

```
ai-business-concierge/
├── docs/                        # Hujjatlar
│   ├── SPEC.md                  # Asosiy spetsifikatsiya
│   ├── PLAN.md                  # Bosqichma-bosqich reja
│   └── ...                      # Mavjud hujjatlar
├── frontend/                    # React web app
│   └── src/
│       ├── app/                 # Global config, providers, router
│       ├── features/            # Feature modules
│       │   ├── admin/           # YANGI: Super Admin panel
│       │   ├── ai-assistant/    # YANGI: AI Maslahatchi UI
│       │   ├── auth/            # Mavjud: Auth
│       │   ├── billing/         # YANGI: Obuna va to'lov
│       │   ├── docs/            # Mavjud + YANGILASH: Hujjatchi
│       │   ├── hr/              # Mavjud: HR
│       │   ├── inbox/           # Mavjud: Inbox
│       │   ├── landing/         # YANGI: Bosh sahifa
│       │   ├── reports/         # Mavjud: Hisobotlar
│       │   ├── sales-bots/      # YANGI: Savdo botlar
│       │   ├── settings/        # Mavjud: Sozlamalar
│       │   ├── tasks/           # Mavjud: Vazifalar
│       │   └── tenants/         # Mavjud: Tenant boshqarish
│       ├── shared/              # Umumiy komponentlar
│       └── styles/              # Global CSS
├── supabase/
│   ├── schema.sql               # DB schema
│   ├── migrations/              # SQL migratsiyalar
│   └── functions/
│       ├── bright-api/          # Mavjud API gateway
│       │   └── index.ts
│       ├── server/              # Asosiy API (Hono)
│       │   ├── index.ts         # Barcha routelar
│       │   ├── routes/          # YANGI: Route modullari
│       │   │   ├── ai.ts        # AI endpointlari
│       │   │   ├── docs.ts      # Hujjat endpointlari
│       │   │   ├── sales-bot.ts # Savdo bot endpointlari
│       │   │   ├── billing.ts   # To'lov endpointlari
│       │   │   └── admin.ts     # Admin endpointlari
│       │   ├── services/        # YANGI: Biznes logika
│       │   │   ├── llm-router.ts    # LLM model tanlash
│       │   │   ├── knowledge-base.ts # KB qidiruv
│       │   │   ├── doc-generator.ts  # Hujjat yaratish
│       │   │   └── payment.ts       # To'lov logika
│       │   └── middleware/      # YANGI: Middleware
│       │       ├── rate-limit.ts
│       │       ├── usage-track.ts
│       │       └── audit.ts
│       └── telegram-bot/        # YANGI: Telegram bot
│           ├── index.ts         # Bot entry point
│           ├── handlers/        # Command va message handlers
│           ├── keyboards/       # Inline va reply keyboards
│           └── middleware/       # Bot middleware
└── resources/
    ├── prompts/                 # AI promptlar (mavjud + yangi)
    │   ├── maslahatchi/         # Module 1 promptlari
    │   ├── hujjatchi/           # Module 2 promptlari
    │   └── sotuvchi/            # Module 3 promptlari
    ├── knowledge-base/          # YANGI: KB source fayllar
    │   ├── soliq-2026.md        # Soliq kodeksi
    │   ├── mehnat-kodeksi.md    # Mehnat kodeksi
    │   └── tadbirkorlik-faq.md  # Tez-tez so'raladigan savollar
    └── templates/               # YANGI: Hujjat shablonlar
        ├── shartnomalar/
        ├── arizalar/
        └── buyruqlar/
```

## MUHIM QOIDALAR

### Umumiy
1. **TypeScript strict mode** — `strict: true` har doim
2. **Zod** — barcha API input/output validatsiya qilinadi
3. **Error handling** — try/catch har doim, user-friendly xato xabarlari
4. **Audit log** — muhim harakatlar (login, AI query, doc gen, payment) loglanadi
5. **RLS** — har bir yangi jadvalda Row Level Security SHART
6. **Tillar** — barcha UI stringlar i18n orqali (uz, ru, en)

### AI qoidalar
1. **Hallucination prevention** — AI faqat knowledge base dagi ma'lumotni ishlatadi
2. **Confidence scoring** — har bir AI javobda ishonch darajasi bo'ladi
3. **Disclaimer** — "Bu AI maslahat, professional maslahat o'rnini bosmaydi"
4. **Feedback** — har bir javobga 👍/👎 baho berish imkoniyati
5. **Cost tracking** — har bir AI so'rov narxi saqlanadi
6. **Cache** — tez-tez so'raladigan savollar cache qilinadi

### Frontend qoidalar
1. **Mobile-first** — barcha UI avval mobile uchun, keyin desktop
2. **Accessibility** — ARIA attributes, keyboard navigation
3. **Loading states** — har bir async operatsiya uchun loading ko'rsatkich
4. **Error states** — har bir xato uchun tushunarli xabar va qayta urinish tugmasi
5. **Empty states** — bo'sh ro'yxatlar uchun tushunarli ko'rsatmalar
6. **Optimistic UI** — imkon qadar tez feedback berish

### Backend qoidalar
1. **Rate limiting** — tarifga mos limitlar
2. **Input validation** — Zod schema har doim
3. **Tenant isolation** — so'rov faqat o'z tenant ma'lumotini ko'radi
4. **Idempotency** — to'lov webhooklari idempotent bo'lishi SHART
5. **Logging** — structured JSON logs

### Telegram Bot qoidalar
1. **Graceful errors** — bot hech qachon crash bo'lmaydi, user-friendly xabar beradi
2. **Timeout** — 25 soniyadan uzoq javob bo'lsa, "Javob tayyorlanmoqda..." xabar
3. **Conversation state** — har bir user'ning suhbat holati saqlanadi
4. **Rate limit** — bepul: 5 so'rov/kun, pulli: tarifga mos

## COMMIT QOIDALARI

Format: `type(scope): description`

```
feat(telegram): add maslahatchi module
fix(ai): fix hallucination in tax answers
docs(spec): update API endpoints
refactor(llm): extract router to service
test(ai): add tax question test suite
chore(deps): update grammy to v1.x
```

Scope'lar: `telegram`, `ai`, `docs`, `sales-bot`, `billing`, `admin`, `auth`, `ui`, `db`, `api`

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
```

## DOIMIY ESLATMALAR

- **Mavjud kodni buzma** — yangi feature qo'shganda mavjud funksionallik ishlashda davom etishi SHART
- **Migration** — DB o'zgarish faqat migration fayl orqali
- **Test** — yangi API endpoint = yangi test
- **i18n** — yangi UI string = uz + ru tarjima
- **Mobile** — har bir UI o'zgarish mobile da tekshiriladi
- **AI test** — AI prompt o'zgarish = 10 ta test savol bilan tekshirish
