# AI Business Concierge — faol reja

> Version: 5.3
> Yangilandi: 2026-08-11
> Bu faylda faqat faol va navbatdagi ishlar turadi. 2026-07-24 gacha bo'lgan katta tarixiy reja [archive/PLAN_LEGACY_2026-07-24.md](archive/PLAN_LEGACY_2026-07-24.md)ga ko'chirilgan.

## Ishlash qoidasi

- Birinchi manba: [STATUS.md](STATUS.md).
- Har sprint backend/security chegarasidan boshlanib, frontend va smoke-test bilan tugaydi.
- Productionga tegadigan migration/key rotation avval audit va dry-run qilinadi.
- Bajarilgan ish `DEVLOG.md`ga dalil bilan yoziladi va bu fayldan olib tashlanadi.

## P0 — sessiyani xavfsiz boshlash

- [x] `git status` va oxirgi commitlarni tekshirish; docs workflow `55ec941` commitida saqlandi.
- [x] P0 commitlarini `origin/main`ga push qilish va commit `06b5756` uchun CI run `31188866507` to'liq green ekanini tasdiqlash.
- [x] Node 22 bilan `npm ci`, type-check, 96 unit test, build va security check baseline olish.
- [x] Production dependency auditni scoped gate bilan tekshirish: unexcepted high/critical 0; GHSA-qwww/React Router 7.18.2 metadata exceptioni 2026-08-21gacha.
- [x] Production `bright-api` health `200`, protected endpoint authsiz `401` ekanini smoke-test qilish.
- [x] Natijani `DEVLOG.md` va `STATUS.md`ga yozish.

## P1 — Portfolio-inspired frontend redesignni yetkazish

- [x] Portfolio visual tilini audit qilib warm canvas, ink typography, Sher-blue accent, divider va restrained-motion design system yaratish.
- [x] Landing/public forms, auth oqimlari, product shell/dashboard, Inbox, Tasks, Docs, Settings va admin shellni redesign qilish.
- [x] Qolgan legacy modullar uchun semantic compatibility layer, light/dark, reduced-motion va focus-visible holatlarini saqlash.
- [x] TypeScript, 101/101 test, production build, security gate va dependency auditni o'tkazish.
- [x] Browser-enabled muhitda desktop/mobile landing, login, forgot-password va contact route'larni vizual acceptance qilish; overlay, browser error va horizontal overflow topilmadi.
- [x] Topilmasiz redesignni `83bc7e0` bilan commit/push qilish, PR #2 ochish, GitHub CI/Vercel/Netlify previewni tekshirish va PR #2ni `65abe2f` bilan `main`ga merge qilish.

## P1 — Supabase/Netlify security handoffini yakunlash

- [ ] 2026-08-21gacha GHSA-qwww metadata exceptionini qayta tekshirish va npm advisory yangilansa exceptionni olib tashlash.
- [x] Productionda `sb_publishable_...` mavjudligini tekshirish; `config.ts`, env type/example va CI'ni yangi contractga o'tkazish, legacy fallbackni rollout uchun vaqtincha saqlash.
- [x] Publishable-key commit `35d4b91`ni push qilish, GitHub CI run `31192041119`ni green va Netlify production deployni `ready` holatda tasdiqlash; bundle legacy fallback ishlatayotganini aniqlash.
- [x] Netlify production publishable envni o'rnatish, qayta deploy, Auth `200`/Realtime `OPEN` smoke-testini o'tkazish va legacy frontend envni olib tashlash.
- [x] Frontend direct Supabase chaqiruvlarini audit qilish; Auth/Realtimedan boshqa `from/rpc/storage/functions` operatsiyalariga regressiya gate qo'shish.
- [x] Public table/view/functionlar uchun RLS va `anon`/`authenticated` grantlarini inventarizatsiya qilish; 32/32 table RLS, 8/8 view `security_invoker`, 6/6 `SECURITY DEFINER` browser EXECUTEdan yopiq ekanini tasdiqlash.
- [x] Risk scanner server-only chegarasini qotirish: browser CRUD grant/policylarini olib tashlash va production migrationni qo'llash.
- [x] `user_tenants` status kontraktini besh lifecycle holatiga birlashtirish; Realtime uchun active membership/tenant helper, read-only browser grantlari va 21 ta rollback pgTAP fixture yozish/productionda ishlatish.
- [x] Cross-tenant SELECT hamda browser INSERT/UPDATE/DELETE denialini real `authenticated` DB role bilan tekshirish; pre-fix 4/21 fail, post-fix 21/21 pass.
- [x] Tenant-protected service-role route'larni DB-canonical contextga o'tkazish; JWT role/tenant bypassini yopish va barcha `/admin/*` route'lar uchun faol admin middleware qo'shish.
- [x] Production bo'lmagan local Auth fixture/tokenlar bilan active/blocked/terminated, super-admin cross-tenant/admin va role-`403` Edge integration testlarini ishlatish: 8/8 pass, production user/data yaratilmagan.
- [x] Fresh local migration stackni tiklash: core baseline va tarixiy PL/pgSQL replay fixidan keyin 32/32 migratsiya, pgTAP 21/21 pass.
- [x] Supabase CLI'ni `v2.101.0`dan `v2.112.0`ga yangilash va fresh/full-stack regressiyani qayta ishlatish: 32/32 migration, pgTAP 21/21, Edge 8/8, Storage/Auth/Studio `200`.
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
