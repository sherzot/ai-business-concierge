# AI Business Concierge — faol reja

> Version: 7.0
> Yangilandi: 2026-08-22
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
- [x] Production dependency auditni scoped gate bilan tekshirish: high/critical 0; GHSA-qwww vaqtinchalik metadata exceptioni 2026-08-11da olib tashlandi.
- [x] Production `bright-api` health `200`, protected endpoint authsiz `401` ekanini smoke-test qilish.
- [x] Natijani `DEVLOG.md` va `STATUS.md`ga yozish.

## P1 — Portfolio-inspired frontend redesignni yetkazish

- [x] Portfolio visual tilini audit qilib warm canvas, ink typography, Sher-blue accent, divider va restrained-motion design system yaratish.
- [x] Landing/public forms, auth oqimlari, product shell/dashboard, Inbox, Tasks, Docs, Settings va admin shellni redesign qilish.
- [x] Qolgan legacy modullar uchun semantic compatibility layer, light/dark, reduced-motion va focus-visible holatlarini saqlash.
- [x] TypeScript, 101/101 test, production build, security gate va dependency auditni o'tkazish.
- [x] Browser-enabled muhitda desktop/mobile landing, login, forgot-password va contact route'larni vizual acceptance qilish; overlay, browser error va horizontal overflow topilmadi.
- [x] Topilmasiz redesignni `83bc7e0` bilan commit/push qilish, PR #2 ochish, GitHub CI va Netlify previewni tekshirish hamda PR #2ni `65abe2f` bilan `main`ga merge qilish.

## P1 — Supabase/Netlify security handoffini yakunlash

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
- [x] Delivery qarorini qabul qilish: faqat Netlify + Supabase; production context production projectga, preview/branch/dev alohida staging projectga ulanadi; Vercel faol arxitekturadan chiqariladi.
- [x] Context/project aralashuvini bloklaydigan `validate:deploy-env` fail-closed guardi, 10 ta Node testi, dynamic Supabase CSP va CI/security gate wiringini yozish.
- [x] `sherzot's Org` uchun `$0/oy` costni userga ko'rsatish va ikki bosqichli tasdiqdan keyin `ap-southeast-1`da staging Supabase project yaratish.
- [x] Stagingga 32/32 migrationni qo'llash, `bright-api` v1ni deploy qilish va health/Auth settings/security-advisor smoke-testlarini o'tkazish.
- [x] Staging Auth redirect allow-listini Netlify preview wildcard/local Vite URLlariga cheklash; email confirmation, 8-digit/1-minute OTP va TOTPni explicit pin qilish.
- [x] Netlify `production` envlarini production contextga, staging envlarini `deploy-preview`/`branch-deploy`/`dev` contextlariga o'tkazish; optional URL envlarini olib tashlash va CLI read-backni 4/4 o'tkazish. Personal reja sabab faqat browser-public `VITE_*` qiymatlar `All` scope'da.
- [x] Vercel external Git integrationini uzish; project/deployment historyni saqlash, CLI yaratgan OIDC `.env.local` va `.vercel` metadata’sini darhol o'chirish.

## P1 — Phase 2 AI Hujjatchini tugallash

- [ ] `ANTHROPIC_API_KEY`ni staging Edge secrets'ga xavfsiz o'rnatish va authenticated real-provider preview/save smoke-testini green qilish.
- [ ] Green staging smoke'dan keyin production `20260821000000` migration + `bright-api` rollout va public/protected smoke-testlarni bajarish.
- [ ] Web oqimi barqarorlashgach Telegram step-by-step hujjat yaratish va document yuborishni ulash.

## P2 — operatsion integratsiyalar

- [ ] Production v15 fail-closed `503`dan keyin yangi `TELEGRAM_WEBHOOK_SECRET`ni o'rnatish va ayni qiymat bilan Telegram `setWebhook`ni qayta ulash.
- [ ] Telegram `/start`, AI javob, locale, rate limit va feedback smoke-testini o'tkazish.
- [ ] Resend receiving domain, webhook signature, tenant mapping va real deliveryni end-to-end tekshirish.
- [ ] **BLOCKED — paid plan:** Supabase organization Free; Pro+ upgrade tasdiqlansa Leaked Password Protection'ni yoqish.
- [ ] Netlify preview protection variantini tanlash.

## P2 — HR Candidate Analysis

- [ ] Orchestrator/application ustida documented 30 soniyalik global deadline'ni enforce qilish; sequential CV/scoring/report stage budgetlari va timeout mapping regressiyalarini yozish, route'ni disabled saqlash.
- [ ] **BLOCKED — `ANTHROPIC_API_KEY`:** staging secretni o'rnatish va authenticated real-provider live smoke qilish.
- [ ] LLM integrationdan keyin tayyor quota lifecycle boundary bilan active route wiring, `501` removal, full-flow integration va manual acceptance testlarini o'tkazish.

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
