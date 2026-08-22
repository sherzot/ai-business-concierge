# AI Business Concierge — joriy holat

> Kod/platforma bo'yicha oxirgi tasdiqlangan snapshot: **2026-08-22**
> Hujjatlar tartiblangan sana: **2026-08-07**
> Lokal runtime, production health/auth va remote GitHub Actions baseline'i 2026-08-07 kuni qayta tekshirildi. P0 commitlari push qilindi va yangi CI run to'liq green yakunlandi.
> 2026-08-08: publishable-key commit push/CI/Netlify deploy qilindi, ammo production bundle hali legacy fallback ishlatmoqda. Risk scanner jadvallarining browser Data API ruxsatlari productionda yopildi.
> 2026-08-08: Realtime tenant isolation productionda qotirildi; faol membership/tenant tekshiruvi va service-role Edge authorization markazlashtirildi.
> 2026-08-08: Fresh local replay 32/32 migratsiya, pgTAP 21/21 va real local Auth tokenli Edge acceptance 8/8 o'tdi.
> 2026-08-08: Production migration history local bilan tenglashtirildi; local Storage/Auth pin drifti yopildi va enabled full-stack health tasdiqlandi.
> 2026-08-08: Supabase CLI `v2.112.0`ga yangilandi; yangi local key/grant contractiga mos fresh replay va barcha acceptance/regression gate'lar o'tdi.
> 2026-08-08: Portfolio-inspired frontend redesign browser acceptance bilan yakunlandi, `83bc7e0`/`509bc2d` push qilindi, PR #2 ochiq va CI green.
> 2026-08-08: Visual consolidation davom etdi: decorative emoji/purple/pink legacy UI semantic palette’ga yig‘ildi, landing title scale kichraytirildi; targeted checks green.
> 2026-08-10: PR #3 `79be466` bilan `main`ga merge qilindi; Codex review hotfixi `aee6692` ham `main`ga push qilindi. Frontend Netlify production deploy `6a79d69c9aa5a6bcf326e83c`da ready, `bright-api` v75 ACTIVE; authenticated ikki-rolli smoke-test qolgan.
> 2026-08-10: User Rahbar Kompaniya profili va Super Admin dashboardining authenticated production oqimlarini muvaffaqiyatli tekshirganini tasdiqladi. Landing Why Us kontrast fixi PR #4, Company Dashboard fixi PR #5 orqali `main`ga merge qilindi va Netlify production deploy `6a79e664a453161423131204`da chiqarildi; authenticated dashboard vizual recheck qolgan.
> 2026-08-11: Netlify production modern `sb_publishable_...` keyga o'tdi, Auth `200` va Realtime `OPEN` smoke-testlari o'tdi, legacy frontend env o'chirildi. Source fallback removal `agent/remove-legacy-supabase-anon-fallback` branchida tayyorlandi va GitHub CLI auth keyring orqali tasdiqlandi.
> 2026-08-11: No-fallback source PR #6 orqali `2b71a49` bilan `main`ga merge qilindi; GitHub CI green va final Netlify deploy `6a7ab5474835d660f21249cd` ready. Production bundle/Auth/Realtime recheck to'liq o'tdi; publishable-key handoff yakunlandi.
> 2026-08-11: User productionda Rahbar sifatida authenticated session ochdi; Company Dashboard “Biznes holati” paneli dark mode'da computed contrast va vizual screenshot bilan to'liq tekshirildi. Matn ko'rinadi, overlap/overflow/browser error yo'q; acceptance yakunlandi.
> 2026-08-11: Raw npm production audit 0 ta vulnerability qaytardi; GHSA-qwww vaqtinchalik metadata exceptioni olib tashlandi va exception'siz production audit gate green tasdiqlandi.
> 2026-08-11: GHSA exception removal `1fb6c0c` bilan bevosita `main`ga push qilindi; GitHub CI run `31466592524` barcha security-gate bosqichlari bilan green yakunlandi.
> 2026-08-11: Faol delivery platformasi Netlify + Supabase deb qat'iy belgilandi; Vercel Git integrationi uzildi. `$0/oy` staging Supabase project ikki bosqichli user tasdig'i bilan yaratildi; 32/32 migration, `bright-api` v1, Auth hardening va Netlify context isolation 4/4 green.
> 2026-08-11: Isolation PR #7 `3fb1592` bilan `main`ga merge qilindi; PR/main CI green. Netlify preview va production smoke-testlarida tegishli staging/production ref, Auth/health `200`, Realtime `OPEN`, CSP hamda preview noindex/no-store tasdiqlandi; Vercel yangi deploy yaratmagan.
> 2026-08-11: PR #7 Codex `.env`/CSP hotfixi PR #8 orqali `e2b3e78` bilan main/productionga chiqdi; CI `31479695709`/`31479985070` green, preview/production smoke green. PR #8 Codex mode/STATUS follow-uplari `agent/fix-security-check-build-mode` branchida faol.
> 2026-08-11: PR #9 Codex endpoint-drift P2 topilmasi merge'dan oldin tuzatildi; security gate generated CSP refni barcha bundled Supabase HTTPS/WSS endpoint reflari bilan solishtiradi. Deploy/security environment tests 14/14, mismatched fixture kutilganidek bloklandi.
> 2026-08-11: PR #9 `c00362a` bilan main/productionga merge qilindi; PR/main CI green. Preview va production CSP/bundle isolation, Auth/health va production Realtime smoke-testlari o'tdi.
> 2026-08-11: Staging modern Edge key override'lariga o'tdi, legacy anon/service-role keylari disable qilindi; real synthetic authenticated Edge acceptance 8/8 va majburiy cleanup 2 tenant/5 Auth user bilan o'tdi, yakuniy fixture soni 0/0.
> 2026-08-11: Acceptance o'zgarishlari `cc31fe7` bilan draft PR #10ga push qilindi; GitHub CI run `31485875838` va Netlify deploy-preview `6a7b047d3150bc00088fc18d` green.
> 2026-08-11: AI Hujjatchi real PDF/DOCX, embedded Noto Sans JP va private Storage kontrakti stagingda yakunlandi; 12/12 pgTAP va binary/unit/frontend gate'lar green, `bright-api` v5 ACTIVE. Production ataylab o'zgartirilmadi.
> 2026-08-12: PR #11 `7837778` uchun CI green; Codex re-review topgan signed-URL compensation va parallel export P2lari DB-first cleanup, compare-and-swap hamda 120 soniyalik retained-version grace bilan tuzatildi. Staging 35/35 migration, `bright-api` v7 va health `200`.
> 2026-08-12: `35fa078` CI greenidan keyingi Codex P2lari retained modelni 65 soniyalik export lease va `documents.row_version` CAS bilan almashtirish orqali yopildi. Staging 36/36 migration, `bright-api` v8, health `200`.
> 2026-08-12: `0532a74` Codex P2lari URL-signingdan keyingi final lease pin va delete/export row-version CAS bilan yopildi. Staging `bright-api` v9 ACTIVE, health `200`.
> 2026-08-12: `661401a` Codex P2lari binary-before-DB publish va O(n) PDF wrapping bilan yopildi. Staging `bright-api` v10 ACTIVE, health `200`, Deno 7/7.
> 2026-08-12: PR #11 final head `6db478d` uchun CI/Netlify gate'lari va Codex “major issue yo'q” re-reviewi green bo'ldi; PR `8f179da` bilan `main`ga merge qilindi. Production 36/36 migration, `bright-api` v76 va Netlify deploy `6a7bad961b16200007cfd88e` bilan chiqarildi; public/protected smoke-testlar green, authenticated synthetic acceptance Cloudflare `403` sabab fixture yaratilishidan oldin bloklandi va qoldiq 0/0/0/0/0/0.
> 2026-08-21: AI Hujjatchi tenant-scoped savol/polishing previewi lokalda tayyorlandi. Backend 9/9, frontend 24/24 fayl va 111/111 test, type-check/build/security/deploy-env/audit gate'lari green; staging/production deploy va real-provider smoke hali bajarilmagan.
> 2026-08-21: Landing hero TEAM/08 kartasi va pastki caption overlapi lokalda tuzatildi; frontend 25/25 fayl va 112/112 test, type-check green, 2048×1080 browser acceptance'da 12.73px gap, overlap/overflow/console error 0.
> 2026-08-21: AI polishing reviewining 3 ta P2 va 1 ta P3 topilmasi lokalda yopildi: chat/polish token budjetlari ajratildi, yaroqsiz output usage/costi hisoblanadi, raw instruction logdan olib tashlandi va to'rt tilli xato envelope'i standartlashtirildi. Backend 14/14, frontend 26/26 fayl va 115/115 test green.
> 2026-08-21: AI polishing reviewining qolgan 5 topilmasi lokalda yopildi: Telegram cache scope tiklandi, provider timeouti to'liq body lifecycle'ni qamradi, polish quota PostgreSQLda atomik rezervatsiya qilinadi, stale AI natijasi user draftini bosmaydi va modal qisqa viewportda scroll qiladi. Backend 18/18, Telegram check, frontend 26/26 fayl va 117/117 test, type-check/build, canonical fresh migration replay 37/37 va local database pgTAP 45/45 green.
> 2026-08-21: `4b51fec` main'ga push qilindi, CI `32461091448` va Netlify production deploy `6a88056075359300089b9fa5` green. Staging 37/37 migration va `bright-api` v11ga o'tdi; authenticated smoke `ANTHROPIC_API_KEY` stagingda yo'qligi sabab `503 AI_UNAVAILABLE`da bloklandi, fixture qoldig'i 0/0/0/0.
> 2026-08-21: Production authenticated binary acceptance green: DOCX/PDF signed download, direct Storage deny `400`, cross-tenant deny `404`, delete `200`; authoritative document/generated/object qoldig'i 0/0/0 va final fixture 0/0/0/0/0. Smart CDN cached URL delete'dan keyin 60 soniyagacha `200` berishi mumkin.
> 2026-08-21: Telegram webhook v14 secret yo'qligida invalid POSTni `200` bilan qabul qildi. Pure guard + 4/4 testdan keyin production v15: health `200`, invalid POST fail-closed `503`, PUT `405`. `67ac675` main va CI `32485618740` green; secret set + Telegram `setWebhook` qolgan.
> 2026-08-21: HR Candidate public GitHub analyzer real adapterga o'tdi: bounded REST/pagination/response, timeout, repo-tree aggregation va 10 daqiqalik cache; Deno 10/10 va real `octocat` smoke complete. `8496aae` main va CI `32487503062` green. Route hanuz `501`; Supabase Free sabab Pro+ Leaked Password Protection BLOCKED.
> 2026-08-21: HR Candidate secretsiz PDF/DOCX parseri implementatsiya qilindi: 5 MiB/file magic/PDF 50-page/text limitlari, DOCX ZIP-bomb himoyasi, EN/UZ/RU/JA sana/section va local signal extraction. `2526d72` main, CI `32489478394` green: Deno 22/22; Haiku semantic structuring va route `501` provider keygacha yopiq.
> 2026-08-21: HR request boundary/orchestrator fail-closed qotirildi: pre-provider validation, tenant role guard, tariff policy, failed-CV hard stop, timer cleanup, canonical ULID va schema exclusivity. `2656e6a` main, CI `32491296828` green: Deno 34/34; persistent quota/LLM/route wiring qolgan.
> 2026-08-22: HR tenant quota va multipart boundary secretsiz yakunlandi: PostgreSQL minute/day/concurrency lease, DB plan mapping, 5 MiB + 64 KiB bounded streaming va disabled-route safe drain. Staging 39 migration, remote pgTAP 22-case success; Deno 47/47 va frontend 117/117 green. Production DB/Edge o'zgarmadi; local fresh replay Docker socket sabab blocked.
> 2026-08-22: HR Candidate frontend upload/state/result boundary production darajasiga keltirildi: bounded client validation, tenant/session-first multipart, timeout/cancellation, stale-response himoyasi, runtime result validation va accessible responsive UX. Frontend 28/28 fayl, 127/127 test va barcha build/security gate'lari green; desktop/mobile browser acceptance'da horizontal overflow 0. Backend route ataylab `501`.
> 2026-08-22: `f77dd9a` main, GitHub CI `32545770532` green va Netlify production deploy `6a89065505b5600008dd0385` ready. `/` hamda `/dashboard/hr/candidates` `200`, CSP va production-only bundle green; provider route `501` bo'lib qoldi.
> 2026-08-22: HR provider usage/cost accounting atomik va idempotent qilindi; staging 40 migration, remote transactional acceptance va Deno 51/51 green. Prompt/CV/output yozilmaydi; production va `501` o'zgarmadi.

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
| Git | Live GitHub `main` va lokal `main` ushbu closeout bilan sinxron; faqat uchta user-owned untracked nusxa qolgan |
| Runtime | Node.js `22.18.0`; `frontend/.nvmrc` va package engine `22.x` |
| Supabase CLI | Homebrew official tap `v2.112.0`; fresh local volume bilan tasdiqlangan |
| Backend | Production Supabase Edge Function `bright-api` v76, `ACTIVE`, `verify_jwt=false`; SHA staging v10 bilan teng |
| Health smoke-test | `200` |
| Staging Supabase | `piqsyfwrjtormrlenjix`, `ap-southeast-1`, `$0/oy`, `ACTIVE_HEALTHY`; 40 migration, `bright-api` v11 ACTIVE, health `200`, authsiz docs/polish `401 TENANT_REQUIRED` |
| Staging Auth/API keys | Netlify preview wildcard + local Vite redirect allow-list; email confirmation ON, 8-digit/1-minute OTP, TOTP ON; Auth settings HTTP `200`, autoconfirm false. Edge `SB_ANON_KEY`/`SB_SERVICE_ROLE_KEY` modern key override'larida; legacy anon/service-role API keylari disabled |
| Type-check | Clean temp frontend installida muvaffaqiyatli |
| Unit test | Frontend 28/28 fayl, 127/127 test, jumladan HR Candidate API/form/hook 12/12; AI polish/router/usage Deno 18/18; HR GitHub 10 + CV 8 + boundary 5 + quota 7 + multipart 6 + accounting 4 + orchestrator 6 + schema 1 = 47/47; Telegram bilan joriy targeted backend Deno 51/51; oldingi document binary/lifecycle Deno 7/7 |
| Deploy environment guard | Node test 14/14: 10 isolation contracti + 2 Vite `.env` fallback/runtime-precedence + 2 bundled endpoint extraction regressiyasi |
| Production build | Synthetic non-production project-ref bilan muvaffaqiyatli; CSP tanlangan refdan yaratildi |
| Security check | 10 ta build/Netlify fayli muvaffaqiyatli |
| Production dependency audit | Raw audit: jami 0 vulnerability; scoped gate exception'siz high/critical 0 |
| Frontend design system | Portfolio-inspired warm/ink/Sher-blue tokenlari; landing, public/auth, product core va admin shell redesign lokal yakunlangan |
| Visual browser acceptance | Landing Why Us 6/6 inverse text bilan green. Landing hero TEAM/caption 2048×1080da 12.73px gap, overlap/overflow/console error `0`. Authenticated Company Dashboard dark mode'da “Biznes holati” title/foiz kontrasti `16.73:1`, muted text `7.5:1`, success signal `10.66:1`; 12/12 text node panel ichida. HR Candidate authenticated 1440×1000 desktop va 390×844 mobile layout, dark/light toggle va required alerts green; horizontal overflow `0` |
| Delivery platform | Faol platforma faqat Netlify. Repo ichida Vercel config/dependency yo'q; external Vercel project saqlangan, `gitRepositoryConnected=false` tasdiqlandi |
| Environment isolation | Netlify CLI authoritative read-back 4/4: `production` -> production Supabase; `deploy-preview`/`branch-deploy`/`dev` -> staging. Optional URL envlari yo'q; Personal rejada faqat browser-public `VITE_*` qiymatlar `All` scope'da |
| Staging security advisor | Error `0`; ma'lum `vector` public-schema warningi `1`; server-only RLS/no-policy info `11` |
| Remote GitHub Actions | Commit `f77dd9a` uchun main run `32545770532` 57sda success: Deno quality, frontend 28/28 fayl va 127/127 test, deploy-env 14/14, audit 0 high/critical, 3,701-module build va 10-file security green |
| Netlify preview | Bu slice bevosita `main`ga push qilingani uchun yangi deploy-preview yaratilmagan; Netlify production context ishlagan |
| Production frontend | Deploy `6a89065505b5600008dd0385` ready, build `6a89065505b5600008dd0383`, commit `f77dd9a`, 29s, plugin success, secret match 0/87,145; `/` va `/dashboard/hr/candidates` `200`, CSP va production-only `index-DipHAHEa.js` bundle green |
| Frontend Supabase key contract | Kod va production faqat modern publishable keyni qabul qiladi; bundle modern key 1, JWT-like key 0, legacy env nomi yo'q, format guard bor; Auth settings `200`, Realtime `OPEN`; Netlify legacy frontend env o'chirilgan |
| DB/Edge security acceptance | Fresh migration replay `32/32`; local pgTAP `21/21`; local real Auth tokenli Edge `8/8`; staging modern-key remote Edge `8/8`, cleanup 2 tenant/5 Auth user va yakuniy fixture `0/0`; Realtime jadvallari SELECT-only va active membership/tenant bilan himoyalangan |
| Document binary/Storage acceptance | Real PDF/DOCX lifecycle Deno 7/7. Production authenticated DOCX/PDF signed download green; direct Storage `400`, cross-tenant export `404`, delete `200`, document/generated/object residue 0/0/0 va final fixture 0/0/0/0/0. Smart CDN cached signed URL deletion invalidatsiyasi 60 soniyagacha tarqalishi mumkin |
| Migration history | Oldingi canonical local fresh replay 37/37 va full database pgTAP 45/45 green. Staging 39 migration; yangi HR quota remote pgTAP 22-case success, 2/2 private table RLS+FORCE va RPC grant read-back green. Production 36/36 va o'zgarmagan. User-owned duplicate migration nusxasi o'zgarmagan |
| Local Supabase services | Bu sessiyada Docker socket javob bermadi, shu sabab fresh local 39-migration replay BLOCKED. Yangi SQL staging PostgreSQL 17.6 dry-run/pgTAPda tekshirildi; oldingi PostgreSQL-only baseline 37/37 va pgTAP 45/45 green |

## Mahsulot va integratsiyalar holati

| Yo'nalish | Holat | Izoh |
|---|---|---|
| Auth, multi-tenant, RBAC | **Done / hardening davom etadi** | DB canonical tenant/role, faol membership/tenant va yagona admin middleware productionda |
| Core web modullar | **Done** | Reports, Inbox, Tasks, HR, Docs, Integrations, Settings |
| Realtime | **Done** | Inbox, Tasks va Notifications subscriptionlari |
| Task assignment notifications | **Done** | Biriktirish, read va acknowledge oqimi |
| Admin platforma | **Partial** | Dashboard, companies, contacts, users, audit, KB, risk, health va AI stats mavjud; tenant profile/AI-stats authenticated smoke va Company Dashboard dark-contrast vizual acceptance user sessionida tasdiqlangan |
| Telegram bot | **Partial / fail-closed operational block** | Production v15 ACTIVE; health `200`, secret yo'qligida POST `503`. Secret set, Telegram `setWebhook` va bot smoke qolgan |
| Resend email inbox | **Partial** | Webhook va mapping kodi mavjud; real receiving/delivery smoke-test tasdiqlanmagan |
| AI Concierge / RAG | **Partial** | Claude router, OpenAI embedding va RAG fundamenti bor; explicit document search/citation va to'liq smoke-test qarzi bor |
| AI usage/cost tracking | **Partial** | Log wiring va DB tracking bor; polishing request quota'si PostgreSQL atomik reservation/release bilan race-safe qilingan, provider usage output validatsiyasidan oldin hisoblanadi. Migration rollout, tenant billing dashboard va barcha endpointlar uchun yagona enforcement hali qolgan |
| AI Hujjatchi | **Production binary + staged AI polish preview / provider blocked** | 15 shablon, 4 til va real PDF/DOCX/private Storage productionda. Polishing frontend productionga, migration va `bright-api` v11 stagingga chiqdi; Auth/tenant/document va cleanup green, ammo stagingda `ANTHROPIC_API_KEY` yo'qligi sabab real-provider smoke `503 AI_UNAVAILABLE`. Production backend/migration rollout ataylab kutilmoqda |
| HR Candidate Analysis | **Partial / provider blocked** | GitHub/cache, local PDF/DOCX, request/role, PostgreSQL quota, bounded multipart, atomic usage/cost persistence, orchestrator va frontend boundary real/testlangan; Haiku/Sonnet, provider accounting call-site, active route va full-flow qolgan, production `501` |
| Billing / Click / Payme | **Planned** | Phase 3 |
| AI Sotuvchi | **Planned** | Phase 3 |

## Qabul qilingan arxitektura chegarasi

- Netlify: faqat React/Vite statik frontend va browser-delivery security.
- Supabase: Auth, PostgreSQL, Edge Function API, Realtime, private Storage, RLS va authorization.
- Browser Supabase bilan faqat Auth va Realtime uchun bevosita ishlaydi.
- Barcha business/admin/AI/Telegram/email operatsiyalari `apiClient -> bright-api` orqali o'tadi.
- AI Hujjatchi binarylari faqat private `generated-documents` bucketida immutable `<tenant>/<user>/documents/<document-id>/document-<storage-version>.<pdf|docx>` yo'lida saqlanadi; browser direct Storage CRUD qila olmaydi va faqat `bright-api` bergan 60 soniyali signed URLdan foydalanadi.
- Server secretlari hech qachon `VITE_*`, browser bundle, Git yoki public logga chiqmaydi.

## Eng yaqin bajariladigan ishlar

1. `ANTHROPIC_API_KEY` kelgach HR semantic/scoring/report providerlarini ulash va har bir javobni tayyor usage/cost RPC orqali output validatsiyasidan oldin hisoblash; `501`ni full-flow tayyor bo'lguncha saqlash.
2. Key kelgach uni staging Edge secrets'ga xavfsiz o'rnatish, semantic CV/scoring/reportni ulash va authenticated real-provider smoke-testni green qilish.
3. Green staging smoke'dan keyin quota lease release/wiring bilan `501`ni olib tashlash; AI Hujjatchi production `20260821000000` migration + `bright-api` rolloutini alohida smoke-test qilish.

Batafsil tartib: [PLAN.md](PLAN.md).

## Qo'lda yoki ehtiyotkor bajariladigan ishlar

- **BLOCKED — paid plan:** organization Free; Leaked Password Protection Supabase Pro+ upgrade'dan keyin yoqiladi.
- Netlify Personal rejasiga mos preview access protection tanlash.
- `vector` extensionini `public` sxemadan ko'chirishni alohida migration sifatida rejalash.
- Production key rotation/revoke'ni faqat replacement config deploy va smoke-testdan keyin bajarish.

## Ma'lum, lekin bloklamaydigan qarzlar

- Asosiy JavaScript chunk taxminan 1.76 MB; route/module code splitting kerak.
- `supabase.ts` static va dynamic import aralashmasi alohida chunkni cheklaydi.
- Browserslist bazasi eskirgan.
- Eski setup hujjatlarida legacy function/key nomlari uchrashi mumkin; joriy qaror uchun `STATUS.md` va eng yangi `DEVLOG` ustun.
