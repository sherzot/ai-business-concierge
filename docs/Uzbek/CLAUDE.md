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

## ARXITEKTURA (2026-05-05 dan boshlab)

> To'liq qoida va pattern: `docs/ARCHITECTURE.md`

**Frontend — Feature Slice + Clean Architecture:**
```
features/{domain}/
  types.ts          ← To'liq entity + value objects
  api/*.ts          ← Typed (no 'any')
  hooks/use{D}.ts   ← Barcha state + logika (ViewModel)
  components/       ← Pure UI (dumb)
  pages/*Page.tsx   ← Thin: faqat hook + render (max ~100 qator)
  __tests__/        ← Kamida 3 test
```

**Backend — Layered Hono:**
```
server/
  middleware/auth.ts, tenant.ts
  presentation/routes/            ← Thin handlers (max 20 qator)
  application/services/{domain}/  ← hr-candidate ETALON
  domain/types.ts
```

**Unit testing stack:** Vitest + @testing-library/react + @testing-library/jest-dom

---

## ROL ARXITEKTURASI

```
TIZIM DARAJASI:
  super_admin ≡ sub_admin  (bir xil huquq)

KOMPANIYA DARAJASI (tenant ichida):
  company_admin  → o'z kompaniyasi ustidan to'liq nazorat
  hr             → xodim account yaratish + tasdiqlash
  accountant     → moliya + soliq hujjatlar
  manager        → o'z bo'limining vazifa va natijalarini
  employee       → cheklangan
```

---

## MUHIM QOIDALAR

### Umumiy
1. **TypeScript strict mode** — `strict: true` har doim
2. **Zod** — barcha API input/output validatsiya
3. **RLS** — har bir yangi jadvalda Row Level Security SHART
4. **Tillar** — barcha UI stringlar i18n orqali (uz, ru, en, ja)
5. **Mavjud kodni buzma** — yangi feature qo'shganda mavjud funksionallik ishlashda davom etadi

### AI qoidalari
1. **Hallucination prevention** — AI faqat knowledge base dagi ma'lumotni ishlatadi
2. **Confidence scoring** — har bir AI javobda ishonch darajasi
3. **Disclaimer** — "Bu AI maslahat, professional maslahat o'rnini bosmaydi"

### LLM Router mantiq
- **simple** → Claude Haiku 3.5, 500 token
- **document** → Claude Sonnet 4, 2000 token
- **analysis** → Claude Sonnet 4, 1500 token
- **default** → Claude Haiku 3.5, 800 token

---

## COMMIT QOIDALARI

```
type(scope): description
```
Scope'lar: `telegram`, `ai`, `docs`, `sales-bot`, `billing`, `admin`, `auth`, `ui`, `db`, `api`

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
CLICK_MERCHANT_ID=
PAYME_MERCHANT_ID=
RESEND_API_KEY=
OPENAI_API_KEY=
```

---

## DOIMIY ESLATMALAR

- **Migration** — DB o'zgarish faqat migration fayl orqali
- **Test** — yangi API endpoint = yangi test
- **i18n** — yangi UI string = uz + ru tarjima
- **Mobile** — har bir UI o'zgarish mobile da tekshiriladi
- **Raqobat** — SQB raqib emas, funnel. Biz kundalik ops, ular startup bosqich.
