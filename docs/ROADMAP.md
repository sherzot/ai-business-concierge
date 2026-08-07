# AI Business Concierge — roadmap

> Yangilandi: 2026-08-07
> Joriy operatsion holat uchun [STATUS.md](STATUS.md), bajarish tartibi uchun [PLAN.md](PLAN.md) ishlatiladi.

## Joriy ish nuqtasi

- Phase 0, Phase 1 va Phase 1.5 yakunlangan.
- Phase 2 faol: landing va 15 ta to'rt tilli hujjat shabloni tayyor; qoralama generatsiya ishlaydi.
- Phase 2 ning hozirgi maqsadi: haqiqiy PDF/DOCX, AI polishing va private Storage.
- HR Candidate Analysis scaffold/skeleton holatida; production endpoint `501 NOT_IMPLEMENTED`.
- Phase 3 monetizatsiya va Phase 4 advanced Admin AI boshlanmagan.

## Phase 0 — Foundation ✅

- Supabase Auth, multi-tenant va RBAC.
- Hono/Supabase Edge Function backend va React/Vite frontend.
- Claude/OpenAI router, Knowledge Base va pgvector fundamenti.
- RLS, audit, structured logging, CI/build/security asoslari.

## Phase 1 — Telegram MVP ✅ / operatsion tekshiruv qolgan

- To'rt til, komandalar, AI javob, feedback va kunlik limit implementatsiya qilingan.
- Beta monitoring viewlari mavjud.
- Production webhook secret va end-to-end bot smoke-testi qayta tasdiqlanishi kerak.

## Phase 1.5 — Company Auth & Management ✅

- Company contact/invite/register/approve/block oqimi.
- Employee invite, profil, parol va HR tasdiqlash oqimi.
- Admin companies, contacts, users, health, audit, KB, risk va AI stats sahifalari.
- Realtime notifications va task acknowledge.

## Phase 2 — AI Hujjatchi + Landing 🚧

### Bajarilgan

- Landing hero, featurelar, pricing, FAQ, SEO va responsive UI.
- 15 ta hujjat shabloni `uz`, `ru`, `en`, `ja` tillarida.
- Dinamik forma va `documents`/`doc_generated` qoralama pipeline.
- Template/generate API va frontend testlari.

### Qolgan

- AI savol-javob va polishing.
- PDF/DOCX binary va Noto Sans font embedding.
- Private Storage, RLS, file validation va signed URL.
- Telegram orqali step-by-step hujjat yaratish va fayl yuborish.
- Phase 2 yakunidan keyin HR Candidate Analysis full implementation.

## Phase 3 — Savdo bot + monetizatsiya

- AI Sotuvchi bot va katalog/buyurtma oqimi.
- Click va Payme integratsiyasi.
- Subscription lifecycle, plan limitlari, usage billing va grace period.
- Resend webhook idempotency va retry queue.

## Phase 4 — Advanced Admin AI + sifat

- Billing, MRR, churn va AI cost monitoring.
- KB, Support, Analytics va Health agentlari.
- Playwright E2E va keng cross-tenant testlar.
- Export/delete, SSO/2FA, custom branding va advanced analyticsni prioritet bo'yicha olish.

## Phase 5 — Scale

- Performance/code splitting va observability.
- Web Push va chuqurroq PWA/offline oqimlari.
- Regional expansion va tashqi biznes integratsiyalari.

## Roadmap yangilash qoidasi

1. Yangi capability avval [REQUIREMENTS.md](REQUIREMENTS.md)da `R-XXX` sifatida yoziladi.
2. Faol bajarish ishlari [PLAN.md](PLAN.md)ga qo'shiladi.
3. Phase o'zgarganda shu roadmap va [STATUS.md](STATUS.md) bir sessiyada yangilanadi.
4. Bajarilgan ish dalili [DEVLOG.md](DEVLOG.md)ga yoziladi.

## Changelog

| Sana | O'zgarish |
|---|---|
| 2026-08-07 | Phase 2 ning real bajarilgan/qolgan qismlari ajratildi; HR Candidate skeleton va keyingi phase'lar aniqlashtirildi |
| 2026-07-24 | Phase 1.5 yakuni va Phase 2 starti kod/DEVLOG bilan sinxronlangan |
