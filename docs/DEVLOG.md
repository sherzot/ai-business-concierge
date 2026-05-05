# Development Log — AI Business Concierge

Loyiha rivojlanishi, qilingan ishlar, duch kelgan xatolar va ularning yechimlari.

---

## 2026-05-05 10:00 — Phase 1: Telegram Bot

### Qilingan ishlar

**Arxitektura (Clean Architecture / DDD):**
- `supabase/functions/telegram-bot/` — Edge Function
- `handlers/` — start, help, language, message, feedback, stats, media
- `services/` — session.ts, maslahatchi.ts
- `supabase/functions/server/services/` — llm-router.ts, knowledge-base.ts

**Bot funksionalligi:**
- 4 til: uz / ru / en / ja
- `/start` — yangi/qaytuvchi foydalanuvchi farqi
- `/help` — til bo'yicha yordam
- `/til`, `/language`, `/язык` — til o'zgartirish
- `/stats` — admin-only statistika (ADMIN_CHAT_ID env var orqali)
- Rate limit: 5 so'rov/kun (free plan)
- LLM Router: Haiku 3.5 (~80%) + Sonnet 4.6 (~20%) murakkablikka qarab
- KB semantic search: pgvector + OpenAI text-embedding-3-small

**Beta monitoring:**
- `v_beta_stats` — jami/bugungi/7kunlik foydalanuvchilar, tillar bo'yicha
- `v_beta_daily_activity` — kunlik so'rovlar, narx, latency
- `v_beta_feedback` — 👍/👎 statistika
- `v_beta_model_usage` — model bo'yicha ishlatilish va narx

---

## 2026-05-05 14:00 — Deployment: Xatolar va Yechimlar

### ❌ 401 Unauthorized (Webhook)
**Sabab:** Supabase JWT verification webhook so'rovlarini bloklagan.
**Yechim:** `supabase/config.toml` ga qo'shildi:
```toml
[functions.telegram-bot]
verify_jwt = false
```
Deploy: `supabase functions deploy telegram-bot --no-verify-jwt`

---

### ❌ curl: Malformed URL
**Sabab:** Copy-paste da smart quotes (`"`) oddiy qo'shtirnoq o'rniga kirib qolgan.
**Yechim:** GET format bilan yozildi, JSON body ishlatilmadi.

---

### ❌ TELEGRAM_WEBHOOK_SECRET not found
**Sabab:** Secret hech qachon set qilinmagan, lekin kod tekshirgan.
**Yechim:** Secret olib tashlandi — webhook auth shart emas.

---

### ❌ getMe 404: Not Found
**Sabab:** Supabase da saqlangan TELEGRAM_BOT_TOKEN noto'g'ri/boshqa token edi.
**Yechim:** `supabase secrets set TELEGRAM_BOT_TOKEN="..."` bilan to'g'ri token qayta set qilindi.

---

### ❌ CLAUDE_ERROR:400 credit balance too low
**Sabab:** Anthropic API krediti yo'q.
**Holat:** Foydalanuvchi kredit qo'shishi kerak ($5+). Bot javob bera olmaydi.

---

### ❌ OpenAI 429 insufficient_quota
**Sabab:** KB seed skripti OpenAI embedding API ga murojaat qildi, kvota yo'q.
**Holat:** Anthropic bilan birga hal qilinadi. `scripts/seed_kb.ts` tayyor (53 ta yozuv).

---

### ❌ /stats ishlamadi
**Sabab:** `ADMIN_CHAT_ID` secret set qilinmagan.
**Yechim:** `supabase secrets set ADMIN_CHAT_ID="6132360728"`

---

### ❌ BotFather menyusi faqat yapon tilida
**Sabab:** Til-specific komandalar set qilingan, foydalanuvchi Telegram ilovasi yapon tilida.
**Yechim:** Default (til ko'rsatilmagan) komandalar set qilindi — hammaga ko'rinadi.

---

## 2026-05-06 10:00 — Bot UX Yaxshilashlar

### Qilingan o'zgarishlar

**1. Matn bo'lmagan xabarlar (`handlers/media.ts` — yangi fayl)**
- Rasm, ovoz, fayl, sticker, video → foydalanuvchi tilida "faqat matn yuboring" xabari.

**2. Qaytuvchi foydalanuvchi `/start` (`handlers/start.ts`)**
- `session.isNew === false` → "Xush kelibsiz qayta!" til bo'yicha, keyboard ko'rsatilmaydi.
- Yangi foydalanuvchi → to'liq xush kelibsiz + til tanlash keyboard.

**3. Qolgan limit ko'rsatish (`handlers/message.ts`)**
- Har bir javob oxiriga `📊 Bugun qolgan: X/5 so'rov` qo'shildi.
- `checkRateLimit` qaytargan `{used, limit}` dan hisoblanadi.

**4. Feedback tili tuzatish (`handlers/feedback.ts`)**
- Oldin: `const lang = "uz"` hardcoded.
- Endi: `getOrCreateSession` dan real locale olinadi → 👍/👎 toast user tilida.

---

## 2026-05-06 11:30 — Til Tizimi (Locale) Tuzatishlar

### Root Cause Tahlili

Foydalanuvchi `/til` → `日本語` tanlaganda confirmation xabari yapon tilida keldi, lekin `/help` o'zbek tilida chiqdi. Sabab: **`updateLocale("ja")` DB da silent fail bo'lgan.**

### ❌ DB Check Constraint — Asosiy Xato
**Sabab:** `ai_conversations.locale` ustunida constraint:
```sql
CHECK (locale IN ('uz', 'ru', 'en'))  -- 'ja' yo'q!
```
`updateLocale("ja")` chaqirilganda DB rad etgan, lekin `LANG_SET["ja"]` hardcoded bo'lgani uchun confirmation xabari yapon tilida ko'ringan — foydalanuvchi muvaffaqiyatli o'zgartirdi deb o'ylagan.

**Yechim:** Migration `20260506000000_add_ja_locale.sql`:
```sql
ALTER TABLE ai_conversations DROP CONSTRAINT IF EXISTS ai_conversations_locale_check;
ALTER TABLE ai_conversations ADD CONSTRAINT ai_conversations_locale_check
  CHECK (locale IN ('uz', 'ru', 'en', 'ja'));
```

---

### ❌ Disclaimer faqat uz/ru — en/ja foydalanuvchilar o'zbek disclamer olgan
**Sabab:** `knowledge-base.ts` da faqat 2 ta disclaimer:
```typescript
return answer + (locale === "ru" ? DISCLAIMER_RU : DISCLAIMER_UZ);
// en → DISCLAIMER_UZ (noto'g'ri!)
// ja → DISCLAIMER_UZ (noto'g'ri!)
```
**Yechim:** 4 ta disclaimer qo'shildi, `addDisclaimerIfNeeded` kengaytirildi.

---

### ❌ `addDisclaimerIfNeeded` ga `kbLocale` berilgan
**Sabab:** `maslahatchi.ts` da `kbLocale = "ja" ? "en" : locale` — ya'ni yapon foydalanuvchisi uchun ingliz disclaimer berilgan.
**Yechim:** `locale` (to'liq TelegramLocale) berildi.

---

### ❌ `llm-router.ts` default system prompt faqat uz/ru
**Sabab:** Fallback `locale === "ru" ? RU : UZ` — en/ja uchun o'zbek system prompt.
**Yechim:** Barcha 4 til uchun default system prompt qo'shildi.

---

### ❌ `updateLocale` da error logging yo'q
**Sabab:** Silent fail — DB xatosi log ga tushmagan.
**Yechim:** `if (error) console.error(...)` qo'shildi.

---

## 2026-05-06 13:00 — Kredit Kerak Bo'ladigan Joylar (Bajarish Uchun Shart)

### Anthropic API — Claude (ANTHROPIC_API_KEY)

| Joy | Fayl | Tavsif |
|-----|------|--------|
| Telegram bot | `telegram-bot/services/maslahatchi.ts` | Har bir foydalanuvchi savoliga javob (Haiku 3.5 + Sonnet 4.6) |
| Web chat | `server/index.ts` ~1804 qator | `/ai/chat` endpoint — asosiy LLM (Claude primary) |
| HR CV Parser | `server/services/hr-candidate/cv-parser.ts` | CV matnini tahlil qilish (TODO, hali implement qilinmagan) |
| HR Scorer | `server/services/hr-candidate/candidate-scorer.ts` | Nomzodlarni baholash (TODO) |
| HR Report | `server/services/hr-candidate/report-generator.ts` | Hisobot yaratish (TODO) |

**Kredit qo'shish:** [console.anthropic.com](https://console.anthropic.com) → Billing → $10+ qo'shish tavsiya qilinadi

---

### OpenAI API (OPENAI_API_KEY)

| Joy | Fayl | Tavsif | Chastota |
|-----|------|--------|----------|
| KB Seed | `scripts/seed_kb.ts` | 53 ta KB yozuvi uchun embedding generatsiya | **Bir martalik** |
| KB Search (bot) | `server/services/knowledge-base.ts` → `getEmbedding()` | Har bir bot savolini vektorga aylantirish | Har so'rovda |
| KB Search (web) | `server/index.ts` ~1789 qator | Web chat da KB qidiruv | Har so'rovda |
| Web chat fallback | `server/index.ts` ~1860 qator | Claude ishlamasa → `gpt-4o-mini` fallback | Xatolikda |

**Muhim:** OpenAI `text-embedding-3-small` KB qidiruvda DOIM ishlatiladi — faqat seed uchun emas.
**Kredit qo'shish:** [platform.openai.com](https://platform.openai.com) → Billing → $5+ qo'shish

---

### Kredit Kelganda Bajarish Tartibi

1. **OpenAI kredit qo'shish** → `supabase secrets set OPENAI_API_KEY="..."` → `scripts/seed_kb.ts` ishga tushirish (KB to'ldirish)
2. **Anthropic kredit qo'shish** → `supabase secrets set ANTHROPIC_API_KEY="..."` → bot test qilish
3. **Bot savolga javob berishi** tekshiriladi → KB semantic search ishlayaptimi?
4. **Web chat** `/ai/chat` endpoint tekshiriladi
5. **HR module** Claude integratsiyasi (cv-parser, scorer, report-generator)

---

## 2026-05-06 13:30 — Joriy Holat

### ✅ Ishlayotganlar
- Bot webhook va deployment
- 4 til to'liq: uz/ru/en/ja (DB constraint tuzatildi)
- `/start`, `/help`, `/til`/`/language`/`/язык`, `/stats`
- Rate limit (5/kun), feedback (👍/👎), qaytuvchi user xabari
- Matn bo'lmagan xabarlar uchun javob
- Qolgan limit ko'rsatish
- Beta monitoring views + admin `/stats` komandasi

### ⏸ Bloklangan (Kredit kutilmoqda)
- Bot javoblari: Anthropic kredit ($5+) kerak
- KB seed: OpenAI kredit kerak (`scripts/seed_kb.ts` tayyor, 53 yozuv)

### 📋 Keyingi Rejalar
- Web dashboard yaxshilashlari
- Knowledge Base to'ldirish (kredit kelgach)
- Bot profil rasmi (BotFather)
- 50 beta foydalanuvchi onboarding

---

## 2026-05-06 06:50 — Phase 1.5 (1): DB Migrations + Landing Company Onboarding

### DB — 5 ta migration (Supabase ga apply qilindi ✅)

| Migration | Nima qildi |
|---|---|
| `phase15_contact_requests` | Kompaniya murojaatlari CRM jadvali + RLS (faqat admin) |
| `phase15_tenant_company_info` | `tenants` ga: status, STIR, yuridik ma'lumotlar, bank, tasdiqlash |
| `phase15_roles_update` | `user_tenants` ga: sub_admin, company_admin, accountant, manager + status/position |
| `phase15_employee_profiles` | To'liq HR ma'lumotlari jadvali (pasport, JSHSHIR, maosh, favqulodda) |
| `phase15_employee_invites` | Bir martalik invite token jadvali (24 soat TTL, resend hisobi) |

### Landing Page

- **CompanyOnboardingSection** — yangi komponent: 4 qadam kartalar + features grid + CTA
- **LandingNavbar** — "Murojaat/Contact Us" tugmasi qo'shildi (anchor link)
- **i18n** — `companyOnboarding` + `nav.contact` barcha 4 tilda: uz/ru/en/ja
- Sahifa tartibida: HowItWorks → **CompanyOnboarding** → Pricing

### Keyingi qadam (Phase 1.5 davomi)
- `/contact` sahifasi — murojaat formasi
- Backend: `POST /v1/contact` endpoint
- Admin: `/admin/contacts` — murojaat ko'rish va boshqarish

---

## 2026-05-06 06:15 — Arxitektura: Kompaniya Onboarding, Rol Tizimi, Admin AI

### Qilingan ishlar (docs)

**SPEC.md v3.0** — To'liq yangilandi:
- §2 Rollar: `super_admin=sub_admin` → `company_admin` → `hr/accountant/manager/employee`
- §11 Kompaniya onboarding jarayoni: murojaat → invite → ro'yxat → pending → tasdiqlash → active
- §12 Xodim onboarding: HR yaratadi → email → parol → HR tasdiqlaydi → active
- §13 Login/Auth sahifalari: holat xabarlari, parol tiklash, murojaat sahifasi
- §14 Super Admin AI tizimi: 4 ta maxsus agent (KB, Support, Analytics, Health)

**PLAN.md v3.0** — To'liq yangilandi:
- Phase 1.5 (YANGI, DARHOL): Company Auth & Management — Hafta 6-8
  - 6 ta yangi DB jadvali/ustun: `contact_requests`, `employee_invites`, tenant holatlari
  - 15+ yangi API endpoint: murojaat, kompaniya boshqarish, xodim onboarding
  - 10+ yangi sahifa: `/contact`, `/register`, `/set-password`, `/admin/contacts`, `/app/employees`
  - 7 ta email shablon, real-time HR bildirishnomalar
- B-018..B-030 backlog qo'shildi

**CLAUDE.md** — Rol arxitekturasi bo'limi qo'shildi

### Nima uchun Phase 1.5 DARHOL:
Billing (Click/Payme) ishlashi uchun kompaniyalar to'g'ri ro'yxatda, rollari aniq, account holatlari to'g'ri bo'lishi SHART. Ro'yxatdan o'tish → billing → daromad zanjiri shu phaseda.

---

## 2026-05-06 05:30 — Global Locale Unification

### Muammo

Landing page `"landing_locale"` localStorage kalitiga yozardi.
`I18nProvider` (butun app) esa `"abc_locale"` kalitidan o'qirdi.
Natija: foydalanuvchi landing page da tilni o'zgartirsa, `/app` da eski til ko'rinardi (sahifa yangilanmasa).

### Yechim

`useLandingLocale` hook to'liq qayta yozildi — endi `useI18n()` ni delegate qiladi.
Bir React state, real-time sinxronizatsiya, sahifa yangilanishsiz ishlaydi.

**O'zgargan fayllar:**
- `frontend/src/features/landing/hooks/useLandingLocale.ts` — `useI18n()` ga delegate
- `frontend/src/features/landing/types.ts` — `getDefaultLocale` endi `"abc_locale"` o'qiydi
- `frontend/src/features/landing/__tests__/useLandingLocale.test.ts` — `I18nProvider` wrapper qo'shildi

**Natija:** 14/14 test o'tdi. LP → App locale real-time ishlamoqda.

---

## Muhim Ma'lumotlar

| Parametr | Qiymat |
|----------|--------|
| Supabase project ref | `ufhepwdkjqptjvxrmpjn` |
| Bot username | `@ai_business_concierge_bot` |
| Admin chat ID | `6132360728` |
| LLM Router | Haiku 3.5 (simple) + Sonnet 4.6 (complex) |
| Embedding model | `text-embedding-3-small` (OpenAI) |
| Rate limit | 5 so'rov/kun (free) |
| Til fallback (KB) | `ja` → `en` (KB faqat uz/ru/en) |
