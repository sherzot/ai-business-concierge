# AI Business Concierge — faol reja

> Version: 4.0
> Yangilandi: 2026-08-07
> Bu faylda faqat faol va navbatdagi ishlar turadi. 2026-07-24 gacha bo'lgan katta tarixiy reja [archive/PLAN_LEGACY_2026-07-24.md](archive/PLAN_LEGACY_2026-07-24.md)ga ko'chirilgan.

## Ishlash qoidasi

- Birinchi manba: [STATUS.md](STATUS.md).
- Har sprint backend/security chegarasidan boshlanib, frontend va smoke-test bilan tugaydi.
- Productionga tegadigan migration/key rotation avval audit va dry-run qilinadi.
- Bajarilgan ish `DEVLOG.md`ga dalil bilan yoziladi va bu fayldan olib tashlanadi.

## P0 — sessiyani xavfsiz boshlash

- [ ] `git status` va oxirgi commitlarni tekshirish; mavjud user o'zgarishlarini saqlash.
- [ ] Remote GitHub Actions `frontend-security-gate` green ekanini tasdiqlash.
- [ ] `npm ci`, type-check, 96+ unit test, production audit, build va security check bilan baseline olish.
- [ ] Production `bright-api` health `200`, protected endpoint authsiz `401` ekanini smoke-test qilish.
- [ ] Natijani `DEVLOG.md` va `STATUS.md`ga yozish.

## P1 — Supabase/Netlify security handoffini yakunlash

- [ ] `sb_publishable_...` mavjudligini tekshirish va `VITE_SUPABASE_PUBLISHABLE_KEY` env kontraktiga bosqichma-bosqich o'tish.
- [ ] `config.ts`, `.env.example`, Vitest, CI va Netlify env nomlarini bir xil qilish.
- [ ] Frontend direct Supabase chaqiruvlarini audit qilish; Auth/Realtimedan boshqa operatsiyalarga regressiya gate qo'shish.
- [ ] Public table/view/functionlar uchun RLS va `anon`/`authenticated` grantlarini inventarizatsiya qilish.
- [ ] Cross-tenant SELECT/INSERT/UPDATE/DELETE va role `403` testlarini yozish/ishlatish.
- [ ] `SECURITY DEFINER` funksiyalarning `search_path`, EXECUTE grant va internal authorizationini tekshirish.
- [ ] Production va preview environment/secret/data ajratish qarorini qabul qilish.

## P1 — Phase 2 AI Hujjatchini tugallash

- [ ] AI savol-javob/polishing oqimini LLM Router orqali ulash.
- [ ] Haqiqiy PDF va DOCX binary generatsiyasini yozish.
- [ ] O'zbek/rus matni uchun Noto Sans font embeddingni tekshirish.
- [ ] Private Supabase Storage bucket va `<tenant>/<user>/<resource>/<file>` path kontraktini yaratish.
- [ ] Upload/download/delete RLS, MIME/extension/size/name validation va signed URL oqimini yozish.
- [ ] Unit/integration testlar va 4 til/light-dark regressiya smoke-testini o'tkazish.
- [ ] Web oqimi barqarorlashgach Telegram step-by-step hujjat yaratish va document yuborishni ulash.

## P2 — operatsion integratsiyalar

- [ ] `TELEGRAM_WEBHOOK_SECRET` mavjudligini tekshirish, kerak bo'lsa o'rnatish va webhookni qayta ulash.
- [ ] Telegram `/start`, AI javob, locale, rate limit va feedback smoke-testini o'tkazish.
- [ ] Resend receiving domain, webhook signature, tenant mapping va real deliveryni end-to-end tekshirish.
- [ ] Supabase Leaked Password Protection'ni Dashboard orqali yoqish.
- [ ] Netlify preview protection variantini tanlash.

## P2 — HR Candidate Analysis

- [ ] GitHub analyzer va cache'ni real implementatsiya qilish.
- [ ] PDF/DOCX CV parserni `pdfjs`/`mammoth` bilan ulash.
- [ ] Sonnet structured scoring va report generatorni LLM Router orqali ulash.
- [ ] Auth, role, rate limit, usage/cost log va Zod validationni route'ga qo'shish.
- [ ] Frontend upload/result oqimini yakunlash va `501` stubni olib tashlash.
- [ ] Unit, integration va manual acceptance testlarini o'tkazish.

## Keyingi phase'lar

### Phase 3 — monetizatsiya

- AI Sotuvchi Telegram bot.
- Click va Payme webhooklari, idempotency va subscription lifecycle.
- Plan limitlari, usage aggregation, grace period va upsell.

### Phase 4 — advanced admin va sifat

- Billing/MRR/churn dashboardlari.
- KB, Support, Analytics va Health agentlari.
- Playwright E2E, export/delete flow, push notification va performance ishlari.

## Hozir qilinmaydigan ishlar

- Public Supabase URL yoki publishable keyni yashirish uchun to'liq BFF/cookie proxy yozish.
- Real feature talab qilmasdan bo'sh Storage infratuzilmasi yaratish.
- `vector` extensionini ta'sir auditisiz sxemalar orasida ko'chirish.
- Replacement konfiguratsiya productionda tekshirilmasdan key rotate/revoke qilish.
