# AI Business Concierge — joriy holat

> Kod/platforma bo'yicha oxirgi tasdiqlangan snapshot: **2026-08-08**
> Hujjatlar tartiblangan sana: **2026-08-07**
> Lokal runtime, production health/auth va remote GitHub Actions baseline'i 2026-08-07 kuni qayta tekshirildi. P0 commitlari push qilindi va yangi CI run to'liq green yakunlandi.
> 2026-08-08: publishable-key commit push/CI/Netlify deploy qilindi, ammo production bundle hali legacy fallback ishlatmoqda. Risk scanner jadvallarining browser Data API ruxsatlari productionda yopildi.
> 2026-08-08: Realtime tenant isolation productionda qotirildi; faol membership/tenant tekshiruvi va service-role Edge authorization markazlashtirildi.
> 2026-08-08: Fresh local replay 32/32 migratsiya, pgTAP 21/21 va real local Auth tokenli Edge acceptance 8/8 o'tdi.
> 2026-08-08: Production migration history local bilan tenglashtirildi; local Storage/Auth pin drifti yopildi va enabled full-stack health tasdiqlandi.
> 2026-08-08: Supabase CLI `v2.112.0`ga yangilandi; yangi local key/grant contractiga mos fresh replay va barcha acceptance/regression gate'lar o'tdi.
> 2026-08-08: Portfolio-inspired frontend redesign browser acceptance bilan yakunlandi, `83bc7e0`/`509bc2d` push qilindi, PR #2 ochiq va CI green.
> 2026-08-08: Visual consolidation davom etdi: decorative emoji/purple/pink legacy UI semantic palette’ga yig‘ildi, landing title scale kichraytirildi; targeted checks green.

## Hozir qayerdamiz

- Phase 0 — Foundation: **yakunlangan**.
- Phase 1 — Telegram MVP: **funksional qismi yakunlangan, operatsion secret tekshiruvi qolgan**.
- Phase 1.5 — Company Auth & Management: **yakunlangan**.
- Phase 2 — AI Hujjatchi + Landing: **faol bosqich**.
- Phase 3 — Savdo bot + Billing: **boshlanmagan**.
- Phase 4 — Advanced Admin AI: **asoslari bor, to'liq bosqich boshlanmagan**.

## Oxirgi tasdiqlangan texnik snapshot

| Tekshiruv | Holat |
|---|---|
| Git | `agent/portfolio-inspired-redesign` pushed through `e379137`; PR #2 open against `main`; production merge/deploy yo'q |
| Runtime | Node.js `22.18.0`; `frontend/.nvmrc` va package engine `22.x` |
| Supabase CLI | Homebrew official tap `v2.112.0`; fresh local volume bilan tasdiqlangan |
| Backend | Supabase Edge Function `bright-api` v74 |
| Health smoke-test | `200` |
| Type-check | Muvaffaqiyatli |
| Unit test | 21/21 fayl, 101/101 test |
| Production build | Muvaffaqiyatli |
| Security check | 9 ta build/Netlify fayli muvaffaqiyatli |
| Production dependency audit | Scoped gate o'tdi: unexcepted high/critical 0; GHSA-qwww metadata exceptioni 2026-08-21 gacha |
| Frontend design system | Portfolio-inspired warm/ink/Sher-blue tokenlari; landing, public/auth, product core va admin shell redesign lokal yakunlangan |
| Visual browser acceptance | `agent-browser`: desktop/mobile landing, login, forgot-password, contact passed; no overlay, browser errors, or horizontal overflow |
| Preview CI | GitHub run `31240118332` passed; Vercel passed; Netlify Deploy Preview ready |
| Remote GitHub Actions | Run `31193931735`, commit `3e383b1`: `success`; barcha `frontend-security-gate` qadamlari green |
| Frontend Supabase key contract | Kod/deploy: publishable primary + vaqtinchalik fallback; production bundle legacy anon fallback ishlatmoqda, Netlify env/login **pending** |
| DB/Edge security acceptance | Fresh migration replay `32/32`; local pgTAP `21/21`; real Auth tokenli Edge `8/8`; Realtime jadvallari SELECT-only va active membership/tenant bilan himoyalangan |
| Migration history | Local/remote 32/32 teng; production `db push --dry-run`: up to date |
| Local Supabase services | Storage `v1.68.1`, Auth `v2.195.0`; barcha enabled containerlar healthy; Storage/Auth/Studio HTTP `200`; `imgproxy` transformations o'chiq bo'lgani uchun stopped |

## Mahsulot va integratsiyalar holati

| Yo'nalish | Holat | Izoh |
|---|---|---|
| Auth, multi-tenant, RBAC | **Done / hardening davom etadi** | DB canonical tenant/role, faol membership/tenant va yagona admin middleware productionda |
| Core web modullar | **Done** | Reports, Inbox, Tasks, HR, Docs, Integrations, Settings |
| Realtime | **Done** | Inbox, Tasks va Notifications subscriptionlari |
| Task assignment notifications | **Done** | Biriktirish, read va acknowledge oqimi |
| Admin platforma | **Partial** | Dashboard, companies, contacts, users, audit, KB, risk, health va AI stats mavjud; advanced agent/billing monitoring keyin |
| Telegram bot | **Partial / operational block** | Bot funksiyalari mavjud; `TELEGRAM_WEBHOOK_SECRET` productionda qayta tekshirilishi kerak |
| Resend email inbox | **Partial** | Webhook va mapping kodi mavjud; real receiving/delivery smoke-test tasdiqlanmagan |
| AI Concierge / RAG | **Partial** | Claude router, OpenAI embedding va RAG fundamenti bor; explicit document search/citation va to'liq smoke-test qarzi bor |
| AI usage/cost tracking | **Partial** | Log wiring va DB tracking bor; tenant billing dashboard/plan enforcement yo'q |
| AI Hujjatchi | **Partial — faol** | 15 shablon, 4 til, dinamik forma va qoralama pipeline mavjud; PDF/DOCX va Storage yo'q |
| HR Candidate Analysis | **Skeleton** | Backend/frontend scaffold bor; production endpoint `501 NOT_IMPLEMENTED` |
| Billing / Click / Payme | **Planned** | Phase 3 |
| AI Sotuvchi | **Planned** | Phase 3 |

## Qabul qilingan arxitektura chegarasi

- Netlify: faqat React/Vite statik frontend va browser-delivery security.
- Supabase: Auth, PostgreSQL, Edge Function API, Realtime, kelajakdagi private Storage, RLS va authorization.
- Browser Supabase bilan faqat Auth va Realtime uchun bevosita ishlaydi.
- Barcha business/admin/AI/Telegram/email operatsiyalari `apiClient -> bright-api` orqali o'tadi.
- Server secretlari hech qachon `VITE_*`, browser bundle, Git yoki public logga chiqmaydi.

## Eng yaqin bajariladigan ishlar

1. PR #2 review/merge qarorini qabul qilish; production deploy qilinmagan.
2. Netlify CLI loginini tiklash, production `VITE_SUPABASE_PUBLISHABLE_KEY`ni o'rnatish, qayta deploy va Auth/Realtime smoke-test qilish; legacy fallbackni faqat keyin olib tashlash.
3. 2026-08-21gacha GHSA-qwww metadata exceptionini qayta ko'rish; keyin AI Hujjatchi PDF/DOCX/Storage ishlariga o'tish.

Batafsil tartib: [PLAN.md](PLAN.md).

## Qo'lda yoki ehtiyotkor bajariladigan ishlar

- Supabase Dashboard'da Leaked Password Protection'ni yoqish.
- Netlify Personal rejasiga mos preview access protection tanlash.
- `vector` extensionini `public` sxemadan ko'chirishni alohida migration sifatida rejalash.
- Production key rotation/revoke'ni faqat replacement config deploy va smoke-testdan keyin bajarish.

## Ma'lum, lekin bloklamaydigan qarzlar

- Asosiy JavaScript chunk taxminan 1.76 MB; route/module code splitting kerak.
- `supabase.ts` static va dynamic import aralashmasi alohida chunkni cheklaydi.
- Browserslist bazasi eskirgan.
- npm global advisory metadata GHSA-qwww uchun React Router 7.18.2 ni noto'g'ri vulnerable deb hisoblamoqda; upstream repo advisory 7.18.2 ni patched deb belgilagan. Scoped exception 2026-08-21da avtomatik qayta ko'rishni talab qiladi.
- Eski setup hujjatlarida legacy function/key nomlari uchrashi mumkin; joriy qaror uchun `STATUS.md` va eng yangi `DEVLOG` ustun.
