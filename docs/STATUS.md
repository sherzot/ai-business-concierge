# AI Business Concierge — joriy holat

> Kod/platforma bo'yicha oxirgi tasdiqlangan snapshot: **2026-07-24**
> Hujjatlar tartiblangan sana: **2026-08-07**
> Muhim: 2026-08-07 kuni production va CI qayta tekshirilmagan; quyidagi runtime holat oxirgi `DEVLOG` dalillariga asoslangan.

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
| Git commit | `730b3bd`, o'sha sessiyada `origin/main` bilan bir xil |
| Backend | Supabase Edge Function `bright-api` v72 |
| Health smoke-test | `200` |
| Type-check | Muvaffaqiyatli |
| Unit test | 19/19 fayl, 96/96 test |
| Production build | Muvaffaqiyatli |
| Security check | 9 ta build/Netlify fayli muvaffaqiyatli |
| Production dependency audit | 0 ta zaiflik |
| Remote GitHub Actions | Keyingi sessiyada qayta tasdiqlanishi kerak |

## Mahsulot va integratsiyalar holati

| Yo'nalish | Holat | Izoh |
|---|---|---|
| Auth, multi-tenant, RBAC | **Done** | Asosiy rollar, tenant membership va route guardlar mavjud |
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

1. Git/CI/runtime baseline'ni qayta tasdiqlash.
2. Legacy anon-key env nomidan `VITE_SUPABASE_PUBLISHABLE_KEY` kontraktiga xavfsiz o'tish.
3. Browser-to-Supabase, DB grants/RLS va cross-tenant authorization auditini tugatish.
4. AI Hujjatchi uchun PDF/DOCX, Noto Sans, private Storage va signed URL oqimini yozish.
5. Telegram webhook secret va Resend receiving/delivery smoke-testlarini yopish.
6. Keyin HR Candidate Analysis implementatsiyasiga o'tish.

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
- Eski setup hujjatlarida legacy function/key nomlari uchrashi mumkin; joriy qaror uchun `STATUS.md` va eng yangi `DEVLOG` ustun.
