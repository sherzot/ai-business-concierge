# Development Log — AI Business Concierge

Loyiha rivojlanishi, qilingan ishlar, duch kelgan xatolar va ularning yechimlari.

> **Tarjimalar (sinxron yangilanadi):** [English](English/DEVLOG.md) · [Russian](Russian/DEVLOG.md) · [日本語](日本語/DEVLOG.md)

## 2026-08-21 — HR PDF/DOCX CV parserning secretsiz qismi implementatsiya qilindi

- `ANTHROPIC_API_KEY` kutilayotgan paytda HR Candidate'ning key talab qilmaydigan keyingi qismi bajarildi. Oldingi `cv-parser.ts` PDF/DOCX extractor, sana/section parsing va semantic structure uchun faqat TODO/`NOT_IMPLEMENTED` edi.
- Parser endi 5 MiB input, MIME va file magicni tekshiradi; PDFni `pdfjs-dist` bilan 50 sahifa/64,000 raw belgi chegarasida, DOCXni `mammoth` bilan lokal o'qiydi. DOCX preflight ZIP64/encryption/path traversal, 2,048 entry, 16 MiB single-entry, 32 MiB total expanded size va 250× compression ratio limitlarini fail-closed qiladi. Filename basename/control-char bilan sanitizatsiya qilinadi; CV raw matni saqlanmaydi yoki loglanmaydi.
- EN/UZ/RU/JA sana oralig'i va section headinglari, overlapni ikki marta sanamaydigan tajriba yillari, bounded tech-skill/language hintlari deterministik olinadi. Prompt-injection sanitation saqlandi. Haiku semantic role/education structuring ataylab chaqirilmaydi; natija `partial / SEMANTIC_STRUCTURING_PENDING`, scanned/image-only PDF esa fail bo'ladi.
- Deno `v2.1.14`da real `pdf-lib` PDF va `docx` DOCX fixturelari bilan yangi 8/8 test, format/check va umumiy targeted backend 22/22 PASS. Testlar invalid magic, oversize, 51-page PDF, scanned PDF, DOCX expansion bomb, lokal sana/sectionlarni qoplaydi. PDF yo'li native canvasga tayanmaydigan standards polyfill bilan ishlaydi. Route va production `501` o'zgarmadi; deploy/remote smoke bajarilmadi.
- `2526d72` `main`ga push qilindi; GitHub CI `32489478394` 59 soniyada green: Deno 22/22, frontend 26/26 fayl va 117/117 test, deploy-env 14/14, audit 0 high/critical, 3,701-modulli build va 10-faylli security gate PASS. Frontend/runtime route o'zgarmagani uchun Netlify ataylab skip qilindi.

Fayllar: `.github/workflows/ci.yml`, `supabase/functions/server/services/hr-candidate/cv-parser{,.test}.ts`, `frontend/src/features/hr/candidates/README.md`, 4-tilli `DEVLOG/STATUS/PLAN/REQUIREMENTS/ARCHITECTURE`.

## 2026-08-21 — HR GitHub analyzer va cache real implementatsiya qilindi

- `ANTHROPIC_API_KEY` kutilayotgan paytda secret talab qilmaydigan HR Candidate P2 boshlandi. Oldingi `github-analyzer.ts` profilni olsa-da, repo pagination, aggregation, repo sifati va cache TODO edi; URL parser repository pathlarni ham profil deb qabul qilardi.
- Public REST adapter exact profil inputini tekshiradi, profil va birinchi repo sahifasini parallel oladi, paginationni 3×100 bilan cheklaydi, har requestga 3 soniya va butun analysisga 5.5 soniya timeout hamda 2 MiB response limiti qo'yadi. Top 6 repo tree'lari parallel tekshirilib README/test/CI, til/stars/activity proxy va quality aggregate qilinadi; qisman provider javobi `partial` bo'lib qoladi. Case-insensitive 10 daqiqalik, 250-entry process cache stampede'ni birlashtiradi va defensive copy qaytaradi; cache authorization yoki source of truth emas.
- Deno format/check va 10/10 deterministic test PASS, jumladan unsafe provider URL rad etilishi; real public `octocat` smoke `complete`, 8 public repo, 6 sampled repo va 2 til aggregate'ini qaytardi. Route, CV parser, scoring/report, auth/rate-limit va production `501` ataylab o'zgarmadi. CI targeted Deno gate endi Telegram 4 test bilan birga HR 10 testni ham ishlatadi.
- Supabase organization read-back `free`; joriy Supabase hujjatida Leaked Password Protection faqat Pro+ ekanligi tasdiqlandi. Production/staging Auth config o'zgarmadi; PLAN'dagi vazifa paid-upgrade blocker sifatida qayta belgilandi.
- `8496aae` `main`ga push qilindi; GitHub CI `32487503062` 58 soniyada green: Deno 14/14, frontend 26/26 fayl va 117/117 test, deploy-env 14/14, audit 0 high/critical, 3,701-modulli build va 10-faylli security gate PASS.

Fayllar: `.github/workflows/ci.yml`, `supabase/functions/server/services/hr-candidate/github-analyzer{,.test}.ts`, `frontend/src/features/hr/candidates/README.md`, 4-tilli `DEVLOG/STATUS/PLAN/REQUIREMENTS/ARCHITECTURE`.

## 2026-08-21 — Production Telegram webhook bypass fail-closed qilindi

- Productionda `TELEGRAM_BOT_TOKEN` bor, `TELEGRAM_WEBHOOK_SECRET` yo'q va `telegram-bot` v14 ACTIVE edi; stagingda Telegram secret/function yo'q. GET health `200`, invalid secretli `{}` POST esa kutilgan `503` o'rniga `200` qaytardi.
- Deployed v14 source `if (SECRET && secretHeader !== SECRET)` bilan secret bo'lmaganda tekshiruvni chetlab o'tardi. Fail-closed qaror pure helperga ajratildi: missing/empty config `503`, missing/wrong header `401`, exact secret allow. GitHub CI'ga pinned Deno `v2.1.14` bilan shu 4 ta regression testi, 3-faylli format gate va entrypoint check qo'shildi; lokal YAML parse, test 4/4, format 3/3, entrypoint check va diff-check PASS. Secret/token qiymati o'qilmadi yoki loglanmadi.
- Faqat `telegram-bot` productionga deploy qilindi: v15 ACTIVE, health `200`, invalid POST `503 Service Unavailable`, PUT `405`. Bot ataylab fail-closed; yangi secretni set qilish, ayni qiymat bilan Telegram `setWebhook`, so'ng bot smoke qolgan.
- `67ac675` `main`ga push qilindi. GitHub CI run `32485618740` 1m5sda green: Telegram 4/4, frontend 26/26 fayl va 117/117 test, deploy-env 14/14, audit 0 high/critical, 3,701-modulli build va 10-faylli security gate PASS. Commit Netlify skip marker bilan yuborildi, chunki frontend o'zgarmadi.

Fayllar/state: `.github/workflows/ci.yml`, `supabase/functions/telegram-bot/{index.ts,webhook-security.ts,webhook-security.test.ts}`, production `telegram-bot` v15, 4-tilli `DEVLOG/STATUS/PLAN/CONNECTIONS`.

## 2026-08-21 — Production authenticated PDF/DOCX acceptance green

- Staging `ANTHROPIC_API_KEY` kutilayotgan paytda mustaqil P1 qarz yopildi: production `ufhepwdkjqptjvxrmpjn` 36/36 migration va `bright-api` v76 ACTIVE holatida qayta tasdiqlandi. Auth Admin endpointiga bog'lanmaydigan, SQL orqali synthetic Auth fixture yaratib oddiy password sign-in qiladigan phased acceptance client qo'shildi; u faqat `doc-acceptance-*` tenantlari va `@example.test` userlarini qabul qiladi, token/key/passwordni loglamaydi va HTTP timeoutlarga ega.
- Production authenticated oqim real DOCX signed download (`3,894,448` bytes) va tahrirdan keyingi PDF signed downloadni (`3,961,631` bytes) o'tkazdi. Direct authenticated Storage `400`, cross-tenant export `404`, document delete API `200`; immutable tenant/user/document path kontrakti ham tasdiqlandi.
- Delete'dan keyin ayni signed URL Smart CDN cache sabab `200` qaytardi. Supabase joriy Smart CDN hujjati object deletion invalidatsiyasi 60 soniyagacha tarqalishini aytadi; shu sabab noto'g'ri immediate `400/404` assertion olib tashlandi. Authoritative cleanup SQL read-back document/generated/object uchun `0/0/0`, yakuniy Auth user/tenant/template/document/object fixture qoldig'i `0/0/0/0/0` ekanini tasdiqladi.
- `node --check`, `git diff --check` va production acceptance PASS. O'zgarishlar `a2b4419` bilan `main`ga push qilindi; GitHub CI run `32484224203` 49 soniyada type-check, 117 test, deploy-env, audit, build va security gate bilan to'liq green yakunlandi. Application schema, Edge Function va frontend deploy o'zgarmadi. Keyingi birinchi qadam o'zgarmadi: stagingga `ANTHROPIC_API_KEY`ni xavfsiz o'rnatish va real-provider polishing smoke'ni green qilish.

Fayllar: `supabase/tests/integration/document_binary_storage.client.mjs`, 4-tilli `DEVLOG/STATUS/PLAN/REQUIREMENTS`.

## 2026-08-21 — GitHub/Netlify green, AI polishing stagingga chiqarildi

- `4b51fec` bevosita `main`ga fast-forward push qilindi. GitHub Actions run `32461091448` type-check, 117 frontend test, deploy-env, dependency audit, production build va hosting security gate bilan to'liq green yakunlandi.
- Main push Netlify preview emas, production deployni ishga tushirdi: deploy `6a88056075359300089b9fa5`, build `6a88056075359300089b9fa3`, 34 soniya, plugin success va 87,170 faylda secret match `0`. `/` hamda `/dashboard/docs` `200`, CSP mavjud, bundle production Supabase refini 1 marta va staging refini 0 marta saqlaydi. Production Supabase backend ataylab v76/36 migration holatida qoldi.
- Staging `piqsyfwrjtormrlenjix`ga canonical `20260821000000_atomic_ai_usage_reservations` migrationi qo'llandi: history 37/37, ikkala RPC mavjud, `service_role` EXECUTE oladi, `anon`/`authenticated` rad etiladi. `bright-api` v11 ACTIVE; health `200`, authsiz `/docs` va `/docs/:id/polish` `401 TENANT_REQUIRED`. Security advisor yangi error bermadi; oldingi 11 RLS/no-policy info va `vector` warningi saqlanadi.
- Authenticated synthetic preview/save smoke Auth, tenant va document chegaralaridan o'tdi, ammo real provider chaqiruvi `503 AI_UNAVAILABLE`da to'xtadi: staging Edge secrets ro'yxatida `ANTHROPIC_API_KEY` yo'q, productionda esa nomi mavjud. Synthetic tenant/document/membership/Auth user qoldig'i `0/0/0/0`; secret qiymati o'qilmadi, ko'chirilmadi yoki loglanmadi.
- Keyingi birinchi qadam: `ANTHROPIC_API_KEY`ni stagingga xavfsiz o'rnatish va authenticated real-provider preview/save smoke'ni qayta green qilish. Faqat shundan keyin production migration + `bright-api` rollout qilinadi. Uchta user-owned untracked nusxaga tegilmadi.

Fayllar/state: GitHub `main`/CI, Netlify production deploy, staging Supabase migration/`bright-api` v11 va 4-tilli `DEVLOG/STATUS/PLAN/REQUIREMENTS`.

## 2026-08-21 — AI polishing reviewining qolgan besh topilmasi lokalda yopildi

- Oldingi reviewda beshta muammo tasdiqlangan edi: Telegram Maslahatchi yangi majburiy `cacheScope`ni bermagani sabab entrypoint type-checkdan o'tmasdi; Anthropic timeouti response headeridan keyin bekor qilinib kechikkan bodyni qamramasdi; plan quota check va increment orasida parallel so'rovlar limitdan oshishi mumkin edi; polishing paytida yozilgan foydalanuvchi tahriri kech kelgan AI natijasi bilan bosilardi; edit modal qisqa viewportda ekrandan chiqardi.
- Telegram caller tenant-scoped cache bilan tiklandi. LLM timeouti endi fetch, xato body va JSON body o'qilishini o'z ichiga olgan to'liq provider lifecycle'ni qamraydi. Polishing quota'sining authoritative qarori service-role-only PostgreSQL `reserve_ai_request` RPCsiga o'tdi; limit check va increment bitta atomik statementda, providerga yetib bormagan xatoda `release_ai_request` rezervatsiyani qaytaradi. Token hisobi alohida qoladi va request ikki marta sanalmaydi.
- React edit modal current draft revisionini request boshlangandagi revision bilan solishtiradi; foydalanuvchi AI kutilayotganda matnni o'zgartirsa stale natija qo'llanmaydi va to'rt tilda qayta urinish xabari ko'rsatiladi. Dialog `100dvh`ga bog'langan max-height va ichki vertical scroll oldi; foydalanuvchi tahriri bloklanmadi. Yangi qatlamlar qo'shilmadi: use-case vertikal slice bo'lib qoldi, quota invarianti PostgreSQLga, draft invarianti Reactga, provider timeouti adapterga tegishli.
- Verifikatsiya: avval timeout regressiyasi 6/7 fail va reservation testi missing-export bilan fail bo'ldi; fixdan keyin polish/router/usage Deno testlari 18/18 PASS, Telegram entrypoint `deno check` va `git diff --check` PASS. Secretsiz clean temp frontend installida targeted modal 3/3, full suite 26/26 fayl va 117/117 test, TypeScript va 3,701-modulli production build PASS. Docker Desktop ishga tushirilib, user-owned duplicate migration trap bilan vaqtincha chetga olinib qaytarildi; canonical fresh migration replay 37/37, yangi quota pgTAP 9/9 va to'liq local database suite 3/3 fayl — 45/45 test PASS. Final production reviewda commitni to'xtatadigan yangi verified finding chiqmadi va intended fayllarda secret signature topilmadi. Full `server/index.ts` check avvaldan ma'lum 22 monolit typing xatosida qoladi, yangi satrlarga tegishli error ko'rinmadi. Real Anthropic, staging/production deploy va authenticated remote smoke bajarilmadi.
- Qolgan ish va keyingi birinchi qadam: lokal closeout commitini GitHubga push qilish, CI/Netlify previewdan o'tkazish, staging migration + `bright-api` deploy va authenticated real-provider preview/save smoke-test. Mavjud uchta user-owned untracked nusxa o'zgartirilmadi va commitga kiritilmadi.

Fayllar: `supabase/functions/{server/index.ts,server/services/llm-router.ts,server/services/llm-router.test.ts,server/services/usage-tracking.ts,server/services/usage-tracking.test.ts,telegram-bot/services/maslahatchi.ts}`, `supabase/migrations/20260821000000_atomic_ai_usage_reservations.sql`, `supabase/tests/database/ai_usage_reservation.test.sql`, `frontend/src/features/docs/{components/DocEditModal.tsx,__tests__/DocEditModal.test.tsx}`, `frontend/src/app/i18n.ts`, 4-tilli `DEVLOG/STATUS/PLAN/REQUIREMENTS/ARCHITECTURE`.

## 2026-08-21 — AI polishing review topilmalari lokalda yopildi

- Oldingi lokal polishing slice reviewida to'rtta muammo tasdiqlangan edi: umumiy `document` chat budjeti ham 8,000 tokenga kengaygan; yaroqsiz model outputida provider usage/cost yozilmay qolgan; foydalanuvchining raw instruction parchasi `ai_interactions`ga saqlangan; quota/rate-limit xatolari frontend envelope va to'rt locale kontraktiga mos bo'lmagan.
- LLM Router umumiy `document` so'rovlari uchun 2,000-token defaultga qaytdi, faqat polishing explicit 8,000 token so'raydi; effective token budjeti cache keyga ham qo'shildi. Provider usage/cost endi output validatsiyasidan oldin yoziladi va empty output regressiyasi bu tartibni tekshiradi. AI interactionda raw instruction o'rniga faqat `instruction_length` saqlanadi.
- Polish document-not-found, minute rate-limit, guard-unavailable va plan-quota xatolari UZ/RU/EN/JA matnlari bilan standart `failure()` envelope orqali qaytadi. Frontend API parseri standart envelope ustuvorligini saqlagan holda legacy `error.message`ni ham o'qiydi. DB schema, migration, RLS va tenant authorization o'zgarmadi.
- Verifikatsiya: Deno polish/router testlari 14/14 PASS; focused service `deno check` PASS. Full `index.ts` check ayni oldingi 23 monolit typing xatosini qaytardi va yangi polishing satriga tegishli error yo'q. Secretsiz clean `/tmp` frontend installida 26/26 fayl va 115/115 test, TypeScript, 3,701-modulli production build, 10-faylli security gate, deploy-env 14/14 va production dependency audit jami 0 vulnerability PASS. Real Anthropic, staging/production deploy va authenticated remote smoke bajarilmadi.
- Qolgan ish va keyingi birinchi qadam: final diffni tekshirib commit qilish, CI/Netlify previewdan o'tkazish, staging `bright-api`ga deploy qilish va authenticated real-provider preview/save smoke-testini bajarish. Mavjud uchta user-owned untracked nusxa o'zgartirilmadi.

Fayllar: `supabase/functions/server/{index.ts,services/llm-router.ts,services/llm-router.test.ts,services/document-polisher.ts,services/document-polisher.test.ts}`, `frontend/src/shared/lib/{apiClient.ts,apiError.ts,apiError.test.ts}`, 4-tilli `DEVLOG/STATUS/PLAN/REQUIREMENTS/ARCHITECTURE`.

## 2026-08-21 — Landing hero TEAM/caption overlapi yopildi

- User bergan 2048×1080 production screenshotda `LandingSystemVisual` ichidagi `TEAM / 08` kartasi pastki `ONE TENANT · ONE OPERATIONAL VIEW` captioni ustiga chiqib, ikkala matnni o'qishni qiyinlashtirayotgani tasdiqlandi. Sabab SVG geometriyasida TEAM kartasi `y=274`, balandligi `58`, caption baseline esa `y=322` bo'lib, karta `332`gacha tushgani edi.
- TEAM kartasi `y=244`ga ko'tarildi. Yangi DOM-geometriya regression testi karta pastki chegarasi bilan caption baseline orasida kamida 16 SVG birlik clearance talab qiladi.
- Clean temp installda targeted landing testlari 2/2 fayl va 6/6 test, full frontend suite 25/25 fayl va 112/112 test, TypeScript check PASS. In-app browser 2048×1080 acceptance'da real karta/caption bo'shlig'i `12.73px`, overlap `false`, horizontal overflow `false`, console error `0`; hero content/copy/CTA/motion o'zgarmadi.
- Qolgan ish: ushbu landing fix AI polishing slice bilan birga review/commit, CI va Netlify previewdan o'tadi; productionga hali deploy qilinmadi. Faol P1 tartibi o'zgarmadi.

Fayllar: `frontend/src/features/landing/components/LandingSystemVisual.tsx`, `frontend/src/features/landing/__tests__/LandingSystemVisual.test.tsx`, 4-tilli `DEVLOG/STATUS`.

## 2026-08-21 — AI Hujjatchi polishing preview lokalda tayyorlandi

- Oldingi production holatda AI Hujjatchi real PDF/DOCX va private Storage bilan ishlardi, ammo foydalanuvchi mavjud hujjatga AI savol/ko'rsatma berib matnni yaxshilash oqimi yo'q edi. Lokal `main` va `origin/main` audit boshida `5e33f094`da teng edi; mavjud uchta untracked user fayli saqlandi.
- Tenant himoyalangan `POST /v1/docs/:id/polish` endpointi, Anthropic LLM Router integratsiyasi va to'rt tilli edit-modal UI qo'shildi. AI natijasi faqat ko'rib chiqiladigan preview sifatida textarea'ga tushadi; DB hujjati faqat foydalanuvchi mavjud **Saqlash** amalini bosganda yangilanadi. Endpoint current draft contentni qabul qiladi, document ownershipni tenant bo'yicha tekshiradi, safety/rate/usage guardlardan o'tadi va audit/usage metadata yozadi; hujjat matni logga yozilmaydi.
- LLM Router current Claude Haiku 4.5/Sonnet 4.6 modellari, tenant-scoped full-prompt SHA-256 cache key, 250-entry TTL cache, bounded timeout va document uchun 8,000 output-token budget bilan qotirildi. Prompt document/title qiymatlarini untrusted data deb ajratadi, embedded ko'rsatmalarga amal qilmaydi va fakt/citation/legal guarantee to'qishni taqiqlaydi. Input/output hajm limitlari va UZ/RU/EN/JA xatolari qo'shildi.
- Verifikatsiya: yangi backend testlari 9/9 PASS; clean `/tmp` installda frontend Vitest 24/24 fayl, 111/111 test PASS va TypeScript PASS; production build 3,700 modul/10 artifact PASS, security gate 10 fayl PASS, deploy-env 14/14 PASS, production dependency audit high/critical 0. Workspace `node_modules` iCloud read hangi sabab frontend gate'lar clean temp copyda ishlatildi. Full `index.ts` Deno check faqat avvaldan mavjud 23 monolit typing xatosida fail bo'ldi; yangi endpoint/servicega tegishli error topilmadi. Real Anthropic call, browser visual acceptance, staging/production deploy yoki remote smoke bajarilmadi.
- Qolgan ish va keyingi birinchi qadam: o'zgarishlarni review/commit qilib CI/Netlify previewdan o'tkazish, so'ng staging `bright-api` deploy va authenticated real-provider polish preview/save smoke-testini bajarish. Faqat shu dalillardan keyin production rollout ko'rib chiqiladi.

Fayllar: `supabase/functions/server/{index.ts,openapi.ts,services/llm-router.ts,services/llm-router.test.ts,services/document-polisher.ts,services/document-polisher.test.ts}`, `frontend/src/features/docs/{api/docsApi.ts,components/DocEditModal.tsx,__tests__/docsApi.test.ts,__tests__/DocEditModal.test.tsx}`, `frontend/src/app/i18n.ts`, 4-tilli `DEVLOG/STATUS/PLAN/REQUIREMENTS/ARCHITECTURE`.

## 2026-08-12 — AI Hujjatchi production rollouti yakunlandi

- PR #10 `55d1468` bilan, PR #11 esa final head `6db478d` uchun CI run `31545572719`, backend-only Netlify PASS va Codex “major issue yo'q” re-reviewidan keyin `8f179da` bilan `main`ga squash-merge qilindi. Merge commit uchun GitHub Actions run `31545917894` muvaffaqiyatli yakunlandi.
- Production Supabase `ufhepwdkjqptjvxrmpjn`ga to'rtta document migration dry-run natijasiga aynan mos holda qo'llandi; local/staging/production history 36/36 bo'ldi. Ikki private document bucket, `documents.row_version`, `doc_generated.download_expires_at` va eski retained ustunining yo'qligi read-back bilan tasdiqlandi. `bright-api` v76 ACTIVE, staging v10 bilan SHA teng; health `200`, authsiz docs `401`, production pgTAPning oxirgi assertioni `ok 15`. Security advisor yangi document Storage topilmasi qaytarmadi.
- Netlify production deploy `6a7bad961b16200007cfd88e` / build `6a7bad961b16200007cfd88c` commit `8f179da` uchun 32 soniyada ready bo'ldi; plugin success, 87,166 faylda secret match `0`. `/` va `/dashboard/docs` `200`; CSP va `index-DRUqHIdd.js` bundle faqat production Supabase refini saqlaydi, staging ref hamda legacy env nomi `0`.
- Production authenticated synthetic acceptance Supabase Auth Admin oldidagi Cloudflare `403` sabab birinchi user fixture yaratilishidan oldin bloklandi va qayta urinish qilinmadi. Yakuniy SQL read-back Auth user/tenant/template/document/generated/object qoldig'ini 0/0/0/0/0/0 tasdiqladi. Shu sabab production rollout yakunlangan, ammo authenticated signed-download/cross-tenant/direct-Storage/delete-cleanup recheck alohida operatsion vazifa bo'lib qoladi.
- Keyingi mahsulot ishi: LLM Router orqali AI savol-javob/polishing oqimini ulash; undan keyin Telegram step-by-step document yaratish va yuborish. Uchta mavjud untracked user fayliga tegilmadi.

Fayllar/state: PR #10/#11, production Supabase migrations/`bright-api` v76, Netlify deploy `6a7bad961b16200007cfd88e`, `docs/{DEVLOG,STATUS,PLAN,REQUIREMENTS}.md` va ularning `English`/`Russian`/`日本語` ekvivalentlari.

## 2026-08-12 — Generate publish tartibi va PDF wrapping qotirildi

- `661401a` CI run `31544880764` 40 soniyada PASS, Netlify `6a7ba9f3a8c5ab0009f8474f` canceled/PASS. Codex review `4911510535` binary xatosidan keyingi document cleanup muvaffaqiyatsiz bo'lsa file-less duplicate qolishi va uzun newline'siz PDF paragraf O(n²) o'lchanishini 2 ta P2 sifatida topdi.
- Generate endi UUID document IDni oldindan yaratadi, binaryni immutable private pathga tayyorlaydi va faqat shundan keyin `documents` qatorini publish qiladi. Binary/font/upload xatosida DB qatori hali yo'q; document insert xatosida esa faqat yetim object cleanup qilinadi.
- PDF wrapper har bir glyph kengligini bir marta o'lchab O(n) ishlaydi; 20,000 belgili regressiya testi exact 20,000 measurementni tasdiqlaydi. Delete storage snapshoti unique `doc_generated` rowga soddalashtirilib oldingi race threadi outdated qilindi. Staging `bright-api` v10 ACTIVE, health `200`; Deno 7/7, focused/syntax/diff green, full API faqat avvalgi 22 typing qarzida.
- Qolgan ish: commit/push, yangi CI/Netlify/Codex greenidan keyin PR #11 merge va production rollout. Uch untracked user fayli tegilmagan.

Fayllar: `supabase/functions/server/{index.ts,services/document-binary.ts,services/document-binary.test.ts}` va 4-tilli DEVLOG/STATUS/PLAN/REQUIREMENTS/ARCHITECTURE.

## 2026-08-12 — PR #11 URL lease va delete/export race yopildi

- `0532a74` uchun CI run `31543616548` 50 soniyada PASS, Netlify `6a7ba58c7a91150008320965` canceled/PASS bo'ldi. Codex review `4911406530` URL TTL lease signingdan oldin boshlanishi va delete in-flight export bilan serializatsiya qilinmaganini 2 ta P2 sifatida topdi.
- Binary metadata commitida 5 daqiqalik provisional lease olinadi; signed URL muvaffaqiyatli yaratilgan vaqtdan keyin lease 65 soniyaga qayta pin qilinadi. Final lease write muvaffaqiyatsiz bo'lsa generate/export DB metadata va objectni compensation bilan qaytaradi, URL clientga berilmaydi.
- Delete `documents.row_version` CAS ishlatadi: export publish yutsa delete `409 DOCUMENT_CONFLICT`, delete yutsa stale export document yo'qligini aniqlab immutable yangi uploadni cleanup qiladi. Staging `bright-api` v9 ACTIVE, health `200`; Deno 6/6, focused check/integration syntax/diff green, full API faqat avvalgi 22 typing qarzida.
- Qolgan ish: follow-up commit/push, yangi CI/Netlify/Codex greenidan keyin PR #11 merge va production rollout. Mavjud uch untracked user fayliga tegilmadi.

Fayllar: `supabase/functions/server/{index.ts,services/document-binary.ts,services/document-binary.test.ts}` va 4-tilli DEVLOG/STATUS/PLAN/REQUIREMENTS/ARCHITECTURE.

## 2026-08-12 — PR #11 uchinchi Codex concurrency topilmalari serializatsiya bilan yopildi

- `35fa078` uchun GitHub CI run `31542246103` 55 soniyada PASS bo'ldi; backend/docs-only Netlify preview `6a7ba1042a94de0008d79759` canceled/PASS. Codex review `4911297037` aynan shu commitda 2 ta P2 topdi: 120 soniyalik retained object cleanupi kelajak requestga bog'langan va parallel document edit exportning eski metadata/binarysini current qilib qo'yishi mumkin edi.
- Retained-path modeli productionga chiqishidan oldin almashtirildi. `doc_generated.download_expires_at` 60 soniyali signed URL ustiga 5 soniya safety lease beradi; faol lease vaqtida re-export `409 EXPORT_DOWNLOAD_ACTIVE`, lease tugagach immutable old object yangi metadata/document commitidan keyin darhol o'chadi. `documents.row_version` edit va export metadata publishini optimistic compare-and-swap bilan serializatsiya qiladi; stale export upload/metadata rollback qilinib `409 DOCUMENT_CONFLICT` qaytaradi.
- Follow-up migration `20260811223321_serialize_document_exports.sql` stagingga qo'llandi: staging 36/36 migration, `bright-api` v8 ACTIVE, health `200`, authsiz docs `401`; `download_expires_at`/`row_version` read-back green, eski retained ustun olib tashlangan, faol lease residue `0`, pgTAP oxirgi assertion `ok 15`. Deno binary/lifecycle `6/6`, focused check, integration syntax va diff check PASS; full API checkda faqat avvalgi 22 typing qarzi qolgan.
- Qolgan ish: ushbu follow-upni PR #11ga push qilish, yangi CI/Netlify/Codex re-reviewni green qilish, merge va production Supabase/Netlify rollout. Remote authenticated fixture Cloudflare Auth Admin IP `403` sabab BLOCKED; mavjud uch untracked user fayliga tegilmadi.

Fayllar/state: `supabase/functions/server/{index.ts,services/document-binary.ts}`, unit/database/integration testlar, `supabase/migrations/20260811223321_serialize_document_exports.sql`, sinxron 4-tilli DEVLOG/STATUS/PLAN/REQUIREMENTS/ARCHITECTURE.

## 2026-08-12 — PR #11 Codex re-review concurrency va compensation topilmalari yopildi

- `7837778` follow-up pushidan keyin GitHub CI run `31540938092` 52 soniyada PASS bo'ldi. Frontend o'zgarmagani uchun Netlify incremental preview `6a7b9cd2d9412e000833a5c8`ni cancel qilib statusni PASS berdi; avvalgi ayni frontend artifact previewi `6a7b2e774d8b4a00084583b0` ready qolgan. Codex re-review `4911171318` aynan `7837778`da yana ikki P2 topdi: initial generate signed-URL failure compensationi Storage-first edi va parallel export oldingi 60 soniyalik signed URL objectini darhol o'chirishi mumkin edi.
- Generate signed-URL compensationi endi avval tenant-scoped `documents` qatorini o'chirish natijasini tekshiradi; faqat DB delete muvaffaqiyatidan keyin binary cleanup qiladi. Export replace esa `storage_path` compare-and-swap bilan bir document uchun metadata commitlarini serializatsiya qiladi; stale parallel request yangi uploadini tozalab `409 EXPORT_CONFLICT` qaytaradi.
- Superseded binarylar `retained_storage_paths`da `path/delete_after` bilan kuzatiladi va signed URL TTL `60s` ustiga `60s` safety window, jami `120s`, saqlanadi. Expired objectlar faqat yangi signed URL yaratilgach tozalanadi; cleanup metadata compare-and-swap bilan active versionni clobber qilmaydi. Document delete DB-first bo'lib active hamda barcha retained pathlarni keyin birga o'chiradi. Follow-up migration `20260811221503_retain_document_storage_versions.sql` JSONB array kontraktini qo'shdi.
- Staging `piqsyfwrjtormrlenjix`: 35/35 migration, `bright-api` v7 ACTIVE, health `200`; retained-column/constraint read-back green, pgTAP oxirgi assertion `ok 14`, retained/acceptance fixture residue `0`. Security advisor faqat oldindan mavjud 11 RLS/no-policy info va `vector` public-schema warningini qaytardi; yangi document Storage finding yo'q. Deno binary/lifecycle testlari `7/7`, focused service check, integration syntax va diff check PASS; full `bright-api` check ayni eski 22 typing qarzida qoladi. Remote authenticated fixture Cloudflare Auth Admin IP `403` sabab hali BLOCKED.
- Qolgan ish: ikkinchi follow-upni PR #11ga commit/push qilish, yangi CI/Netlify/Codex re-reviewni green qilish, so'ng merge va production migration/Edge/Netlify rollout. Uchta mavjud untracked user fayli hanuz tegilmagan.

Fayllar/state: `supabase/functions/server/{index.ts,services/document-binary.ts}`, `supabase/functions/server/services/document-binary.test.ts`, `supabase/migrations/20260811221503_retain_document_storage_versions.sql`, `supabase/tests/{database/document_storage_contract.test.sql,integration/document_binary_storage.test.mjs}`, 4-tilli STATUS/PLAN/REQUIREMENTS/ARCHITECTURE/DEVLOG.

## 2026-08-11 — PR #11 Codex transactional Storage topilmalari tuzatildi

- Oldingi holatda PR #10 draft va PR #11 uning branchiga stacked edi. PR #10ning `adab3fe` commitidagi GitHub CI hamda Netlify preview greenligi va ochiq review e'tirozi yo'qligi qayta tasdiqlanib, PR #10 `55d1468` bilan `main`ga squash-merge qilindi. PR #11 `main`ga retarget qilindi; squash tarixi sabab chiqqan konflikt faqat PR #11ning ikki commitini yangi `main` ustiga rebase qilish bilan yopildi. Yangi `50a46c2` head uchun CI run `31500547178` 53 soniyada PASS, Netlify preview `6a7b2e774d8b4a00084583b0` ready; `/` va `/dashboard/docs` HTTP `200`, staging-only CSP va `noindex` tasdiqlandi.
- Codex review `4907243544` aynan `50a46c2`ni ko'rib ikkita P2 topdi: same-format re-export canonical objectni DB metadata commitidan oldin overwrite qilar, delete esa DB qatoridan oldin binaryni o'chirar edi. Re-export endi har safar UUID `storage_version` bilan immutable `<tenant>/<user>/documents/<document-id>/document-<storage-version>.<pdf|docx>` object yaratadi, `upsert:false` ishlatadi, metadata commit muvaffaqiyatidan keyingina eski objectni tozalaydi. Delete endi avval tenant-scoped `documents` qatorini o'chiradi, so'ng binary cleanup qiladi; DB xatosi ko'rinadigan metadata'ni missing object bilan qoldirmaydi.
- Follow-up `20260811142919_version_document_storage_objects.sql` legacy unversioned yo'llarni o'qish uchun saqlagan holda `storage_version` va exact versioned-path constraintini qo'shdi. Stagingda 34/34 migration, `bright-api` v6 ACTIVE va health `200`; schema read-backda yangi UUID ustun/validated constraint/private bucketlar 2/2, acceptance user/tenant/template qoldig'i 0. Security/performance advisor faqat oldindan mavjud linter qarzlarini qaytardi, yangi document Storage finding yo'q.
- Verifikatsiya: Deno binary/service regression `5/5` PASS, same-format ikki upload yo'li turli va ikkalasi `upsert:false`; focused service `deno check`, integration `node --check`, `git diff --check` PASS. Full `bright-api` check ayni oldingi 22 logging/Hono/risk/usage typing xatosini qaytardi, yangi document lifecycle xatosi qo'shilmadi. Staging real Auth acceptance fixture yaratilishidan oldin Supabase oldidagi Cloudflare IP-level `403`da bloklandi; yakuniy fixture residue `0`, shu sabab yangi remote authenticated path hali BLOCKED. Qolgan ish: follow-up commitni PR #11ga push qilish, CI/Netlify/Codex re-reviewni green qilish, merge'dan keyin production migration/Edge/Netlify rollout va imkon qadar authenticated smoke.

Fayllar/state: PR #10 merge `55d1468`, PR #11, `supabase/functions/server/{index.ts,services/document-binary.ts}`, `supabase/functions/server/services/document-binary.test.ts`, `supabase/migrations/20260811142919_version_document_storage_objects.sql`, `supabase/tests/{database/document_storage_contract.test.sql,integration/document_binary_storage.test.mjs}`, sinxron 4-tilli STATUS/PLAN/REQUIREMENTS/ARCHITECTURE/DEVLOG.

## 2026-08-11 — AI Hujjatchi real PDF/DOCX va private Storage stagingda yakunlandi

- Oldingi holatda 15 shablon, 4 til, dinamik forma va editable qoralama mavjud, ammo “PDF” browser print dialogi, “download” esa `.txt` edi; private Storage, binary metadata, signed URL va tenant/user path kontrakti yo'q edi. Ish `agent/ai-document-binary-storage` branchida draft PR #10 ustiga stack qilindi; uchta mavjud untracked user fayli o'zgartirilmadi va stage qilinmadi.
- `pdf-lib@1.17.1`, `@pdf-lib/fontkit@1.1.1` va `docx@9.7.1` bilan haqiqiy PDF/DOCX generator yozildi. Pinned Noto Sans JP asseti exact SHA-256 bilan tekshiriladi, private asset bucketida cache qilinadi, PDFga to'liq va DOCXga `word/fonts/font1.odttf` sifatida embed qilinadi. PDF subsetting CFF glyph mapni buzishi vizual testda topilib `subset:false` bilan tuzatildi; to'rt til PDF va DOCXda o'qildi.
- `generated-documents` va `document-assets` private bucketlari, 10/5 MiB limitlar, MIME allow-list, `doc_generated` file metadata/checksum/FK/unique/canonical-path constraintlari va `anon`/`authenticated` uchun restrictive direct-access deny policy qo'shildi. Canonical yo'l `<tenant>/<user>/documents/<document-id>/document.<pdf|docx>`; server 60 soniyali signed URL beradi. Generate/export/edit-stale/delete oqimlari tenant-scoped bo'lib, failure compensation cleanup va audit loglarga ega.
- Frontenddagi print/`.txt` pseudo-export olib tashlandi; real PDF/DOCX download tugmalari backend exportdan signed URL oladi. List/detail file holati va barcha to'rt locale copylari yangilandi. OpenAPI real generate/export kontraktini va 4 locale enumini hujjatlashtiradi.
- Staging `piqsyfwrjtormrlenjix`ga migration `20260811131308` qo'llandi va `bright-api` v5 `ACTIVE`, health `ok`. Storage/RLS pgTAP 12/12 PASS. Oldingi v3 remote E2E real DOCX/PDF download, direct authenticated Storage deny `400`, cross-tenant export `404`, edit/regenerate va delete cleanupni o'tkazdi. Embedded-font v4/v5 acceptance qayta urinishini Supabase oldidagi Cloudflare Auth Admin endpointi IP-level `403` bilan fixture yaratilishidan oldin blokladi; final read-back acceptance user/tenant/document/template/generated/object qoldig'i `0`, verified font cache `1`. Production ataylab o'zgartirilmadi: yangi bucket `0`, yangi ustun `0`; preflight 2 legacy generated rowning hech birida `storage_path` yo'qligini tasdiqladi.
- Verifikatsiya: Deno binary test `4/4`; DOCX ZIP integrity green, embedded `.odttf` `4,533,028` bayt, final DOCX `3,894,424` bayt; PDF `3,961,665` bayt va Quick Look visual green. Frontend Vitest `23/23` fayl, `109/109` test; TypeScript PASS; production build `3700` modul PASS; raw npm audit jami `0`, production high/critical `0`; focused docs API `5/5`; new backend service `deno check`, integration script `node --check` va `git diff --check` PASS. Full `bright-api` Deno checkdagi 22 eski logging/Hono/risk/usage typing xatosi bu slice'dan oldingi qarz; local Supabase stack Docker stopped sabab ishlatilmadi.
- Application/docs `d8bec96` bilan `agent/ai-document-binary-storage`ga commit/push qilindi va draft PR #11 PR #10ning head branchiga stacked holda ochildi: OPEN, DRAFT, MERGEABLE. CI workflow faqat `pull_request` base `main` bo'lganda ishlaydi, shu sabab PR #11da checklar hali yaratilmagan; bu failure emas. Qolgan ish: draft PR #10ni review/merge qilish, PR #11ni `main`ga retarget qilib CI/Netlify preview/Codex reviewdan o'tkazish; faqat approved merge'dan keyin production migration/Edge rollout va authenticated smoke-test. Undan keyingi mahsulot ishi — LLM Router orqali AI savol-javob/polishing.

Fayllar: `supabase/migrations/20260811131308_ai_document_binary_storage.sql`, `supabase/functions/bright-api/deno.json`, `supabase/functions/server/{index.ts,openapi.ts}`, `supabase/functions/server/services/document-binary{,.test}.ts`, `supabase/tests/{database/document_storage_contract.test.sql,integration/document_binary_storage.test.mjs}`, `frontend/src/features/docs/**`, `frontend/src/app/i18n.ts`, 4-tilli STATUS/PLAN/REQUIREMENTS/ARCHITECTURE/DEVLOG.

## 2026-08-11 — Staging authenticated Edge acceptance va legacy-key cleanup yakunlandi

- Oldingi holatda staging `bright-api` health va migrationlari green edi, ammo Supabase CLI `v2.112.0` API-key metadata timestampini parse qila olmagani sabab real remote Auth/tenant acceptance o'tmagan edi. Integration skripti local stackka bog'langan va cleanup javoblarini tekshirmas edi.
- `edge_tenant_authorization.test.mjs` endi explicit remote `SUPABASE_URL` hamda modern publishable/secret keylarni process environment orqali qabul qiladi, signed-user Edge requestiga `apikey` qo'shadi, legacy JWT bo'lmagan secretni `Authorization` sifatida yubormaydi va cleanupda 2 tenant/5 Auth user o'chirilganini qat'iy tekshiradi. Local fallback saqlandi.
- CLI `v2.102.0`ning maskalanishi kutilmaganda staging legacy `service_role` qiymatini tool outputga to'liq chiqargani aniqlangach, qiymat Git yoki hujjatga yozilmadi va darhol yaroqsizlantirildi: staging Edge uchun `SB_ANON_KEY`/`SB_SERVICE_ROLE_KEY` modern publishable/secret override'lari o'rnatildi, legacy anon/service-role API keylari stagingda disable qilindi. Productionga tegilmadi; `bright-api` secret reload natijasida v2 bo'ldi.
- Remote synthetic acceptance modern keylar bilan 8/8 PASS: active own-tenant `200`, cross-tenant/blocked/terminated `401 TENANT_REQUIRED`, super-admin cross-tenant va admin route `200`, blocked admin `403 FORBIDDEN`, employee mutation `403 FORBIDDEN_ROLE`. Cleanup 2/2 tenant va 5/5 Auth user uchun PASS; yakuniy SQL read-back `acceptance_tenants=0`, `acceptance_users=0`, Auth loglarda 5 delete `200` va Edge loglarda kutilgan statuslar tasdiqlandi.
- `node --check` PASS. Local regression ishga tushmadi, chunki closeout paytida local Supabase stack ishlamayotgan edi; ayni skriptning remote yo'li to'liq o'tdi. Keyingi ish: AI Hujjatchi PDF/DOCX binary generation va private Storage kontraktini amalga oshirish.
- O'zgarishlar `cc31fe7` bilan `agent/staging-authenticated-edge-acceptance` branchiga push qilindi va draft PR #10 ochildi. GitHub CI run `31485875838` `success`: `frontend-security-gate` type-check, unit test, deploy-environment test, production audit/build va bundle/hosting security bosqichlarining barchasi green. Netlify deploy-preview `6a7b047d3150bc00088fc18d` statusi `success`; frontend behavior o'zgarmagani uchun yangi browser smoke talab qilinmadi.

Fayllar/state: `supabase/tests/integration/edge_tenant_authorization.test.mjs`, staging Supabase `piqsyfwrjtormrlenjix` Edge v2 va modern-key overrides/legacy-key disable, 4-tilli STATUS/PLAN/DEVLOG.

## 2026-08-11 — PR #9 endpoint-drift hardening main/production closeouti yakunlandi

- PR #9 follow-up `57d4dbc`ga push qilindi; GitHub CI run `31481174852` `success`. Netlify preview `6a7af589fd49aa00082aa968` `ready`, build `6a7af589fd49aa00082aa966`, 29s, plugin success, secret match 0/87,166; staging-only CSP/bundle va noindex/no-store green.
- PR #9 `c00362a` bilan squash-merge qilindi. Main CI run `31481586911` `success`. Netlify production deploy `6a7af6d8233dfa000954ac24` `ready`, build `6a7af6d8233dfa000954ac22`, 32s, plugin success, secret match 0/87,166. Production sahifa/Auth/health HTTP `200`, Realtime `OPEN`; CSP/bundle faqat production refni o'z ichiga oldi, staging ref yo'q.
- Codex re-review yangi commit uchun 5 daqiqadan ko'proq kutilgan, lekin GitHub faqat eski `c7a489a` reviewini saqlagan; threadga user alohida so'ramagani uchun reply/resolve berilmadi. Finding 14/14 regression, mismatch-FAIL/aligned-PASS integration acceptance, remote CI va preview bilan yopildi. Uchta mavjud untracked user fayli commit qilinmadi.
- Final 4-tilli closeout `a648f73` bilan main'ga push qilindi; `[skip netlify]` yangi deploy yaratmagan, latest production deploy `6a7af6d8233dfa000954ac24` bo'lib qoldi. STATUS Git handoffi self-referential HEAD hashga bog'lanmasligi uchun main/origin sync + latest application merge ko'rinishiga o'tkazildi.
- Qolgan faol ish: staging ephemeral synthetic Auth/tenant authenticated Edge acceptance va cleanup; undan keyin AI Hujjatchi PDF/DOCX/Storage.

Fayllar/state: PR #9, merge `c00362a`, CI `31481174852`/`31481586911`, Netlify preview `6a7af589fd49aa00082aa968`, production `6a7af6d8233dfa000954ac24`, 4-tilli STATUS/PLAN/DEVLOG.

## 2026-08-11 — PR #9 Codex bundled endpoint drift topilmasi yopildi

- PR #9ni merge'dan oldin kutish natijasida Codex yana bitta P2 drift holatini topdi: CSP ref bundle ichida biror joyda mavjud bo'lishi yetarli, optional `VITE_SUPABASE_URL`/`VITE_API_BASE_URL` esa boshqa Supabase project endpointiga qarashi mumkin edi.
- `security-artifacts.mjs` bundled HTTPS/WSS Supabase endpointlaridan barcha 20 belgili project-ref'larni, shu jumladan escaped URL stringlarni chiqaradi. Security gate generated CSP refning bundle ichida mavjudligini va topilgan har bir runtime endpoint ref aynan shu CSP refga tengligini tekshiradi. Ikki regression test qo'shilib deploy/security environment testlari 14/14ga yetdi.
- Node 22.18 acceptance: mismatched synthetic API project bilan non-default-mode build 3700 modul PASS, security gate kutilganidek FAIL; ayni fixture CSP projectga moslangach build 3700 modul va 10-faylli security gate PASS. TypeScript PASS, Vitest baseline 23/23 fayl va 108/108 test PASS. Temporary env fixture o'chirildi. Qolgan ish: PR #9 branchiga follow-up commit push, CI/preview qayta green, Codex re-review va merge/production smoke.

Fayllar: `frontend/scripts/security-artifacts.mjs`, `frontend/scripts/security-artifacts.node.mjs`, `frontend/scripts/security-check.mjs`, `frontend/package.json`, 4-tilli STATUS/DEVLOG.

## 2026-08-11 — PR #8 Codex mode va STATUS follow-uplari tuzatildi

- PR #8 `e2b3e78` bilan merge va productionga chiqqach Codex review ikki to'g'ri topilma berdi: non-default `vite build --mode ...` qiymati standalone `security:check`ga avtomatik o'tmas edi; canonical STATUS esa hotfixni hali uncommitted deb ko'rsatgan.
- Security gate env/mode'ni qayta taxmin qilmaydi: generated `_headers` ichidagi CSPdan yagona bir xil HTTPS/WSS 20 belgili Supabase refni oladi va ayni ref build bundle ichida mavjudligini tekshiradi. Bu har qanday Vite mode'da generated artifactlarni o'zaro solishtiradi. STATUS transient “uncommitted” iborasidan tozalandi va PR #8 merge holatiga yangilandi.
- Node 22.18 verifikatsiyasi: custom `.env.codex-mode-regression` va unset shell `VITE_*` bilan non-default mode build 3700 modul PASS; `MODE` unset standalone security gate 10 fayl PASS; environment tests 12/12, TypeScript PASS, Vitest 23/23 fayl va 108/108 test PASS. Dastlab bundle minification to'liq URLni contiguous saqlamagani aniqlandi; gate exact 20 belgili refni solishtirishga tuzatilib qayta green bo'ldi. Temporary env fayli o'chirildi. Qolgan ish: follow-up branch/PR CI, preview, merge va production smoke-test.

Fayllar: `frontend/scripts/security-check.mjs`, 4-tilli STATUS/PLAN/DEVLOG.

## 2026-08-11 — PR #7 Codex reviewidagi Vite `.env` CSP topilmasi tuzatildi

- PR #7 merge'dan keyingi Codex review bitta P2 topilmani ko'rsatdi: Vite application `.env` qiymatlarini `import.meta.env`ga yuklasa ham, build-time CSP plugin va standalone security gate faqat `process.env`ni o'qirdi. Shu sabab hujjatdagi `frontend/.env` lokal workflowida application config valid bo'lsa ham build noto'g'ri yiqilishi mumkin edi; Netlify production/preview shell env ishlatgani uchun deployed runtime ta'sirlanmagan.
- Shared `vite-environment.mjs` Vite `loadEnv` orqali mode-aware env fayllarini o'qiydi va runtime env precedence'ini saqlaydi. `vite.config.ts` hamda `security-check.mjs` bir xil resolved project-refdan foydalanadi. Lokal `.env` fallbacki va runtime precedence uchun 2 ta regression test qo'shilib environment testlari 12/12ga yetdi.
- Verifikatsiya: TypeScript PASS; Vitest 23/23 fayl, 108/108 test PASS; shell `VITE_*` qiymatlari unset holatda faqat vaqtinchalik `.env.codex-review-test` orqali build 3700 modul PASS va security gate 10 build/Netlify fayli PASS. Vaqtinchalik env fayli testdan keyin o'chirildi, credential loglanmadi. Qolgan ish: hotfixni branch/PR orqali CI va Netlify previewdan o'tkazish.

Fayllar: `frontend/vite.config.ts`, `frontend/scripts/security-check.mjs`, `frontend/scripts/vite-environment.mjs`, `frontend/scripts/vite-environment.node.mjs`, `frontend/package.json`, 4-tilli STATUS/PLAN/DEVLOG.

## 2026-08-11 — Netlify/Supabase isolation PR #7 orqali productionga chiqarildi

- Isolation o'zgarishlari `4a29773` bilan `agent/netlify-supabase-environment-isolation` branchiga commit/push qilindi va PR #7 ochildi. GitHub Actions PR run `31478289472` `success`; Netlify deploy-preview `6a7aec950715d300093248d8` `ready`, build `6a7aec950715d300093248d6`, plugin `success`, 87,162 scanned faylda normal/enhanced secret match `0`.
- Preview smoke-test: sahifa/Auth/health HTTP `200`, Realtime `OPEN`; CSP va JavaScript bundle staging refni o'z ichiga oldi, production refni olmadi; `noindex/no-store` headerlari to'g'ri. PR #7 squash-merge qilinib `3fb1592` bilan `main`ga tushdi.
- Main CI run `31478554989` `success`. Netlify production deploy `6a7aed68abe8a70008108596` `ready`, build `6a7aed68abe8a70008108594`, 43s, plugin `success`, 87,162 scanned faylda secret match `0`. Production sahifa/Auth/health HTTP `200`, Realtime `OPEN`; CSP/bundle faqat production refni o'z ichiga oldi, staging ref yo'q. Merge oralig'ida Vercel yangi deploymentlari `0`, ya'ni uzilgan Git integration qayta ishga tushmagan.
- Qolgan ish: Supabase CLI v2.112 `projects api-keys` metadata timestampini parse qila olmagani sabab stagingdagi ephemeral synthetic Auth/tenant authenticated Edge acceptance va cleanup alohida faol item bo'lib qoladi. Uchta mavjud untracked user fayli commit qilinmadi.

Fayllar/state: PR #7, commit `3fb1592`, GitHub CI `31478289472`/`31478554989`, Netlify preview `6a7aec950715d300093248d8`, production `6a7aed68abe8a70008108596`, 4-tilli STATUS/PLAN/DEVLOG.

## 2026-08-11 — Netlify/Supabase environment isolation qarori va fail-closed guard tayyorlandi

- Oldingi holat auditida faol repo ichida Vercel config/dependency yo'qligi, ammo tashqi Vercel project Git integrationi mavjudligi tasdiqlandi. Netlify `production`, `deploy-preview`, `branch-deploy` va `dev` contextlarining frontend Supabase qiymatlari bir xil production projectga qaragan; demak PR preview production Auth/API/Realtime/data chegarasiga ulanishi mumkin edi. Supabase organization Free rejada va Branching mavjud emas; production project healthy, alohida staging project yo'q edi. Hech qanday credential hujjat/logga yozilmadi.
- Delivery qarori qat'iylashtirildi: faol hosting faqat GitHub -> Netlify; Vercel faol runtime/preview/deploy arxitekturasidan chiqarildi. Netlify `production` faqat approved production Supabase project-refni, `deploy-preview`/`branch-deploy`/`dev` esa alohida non-production project-refni qabul qiladi. Supabase Free Branching o'rniga alohida staging project, versionlangan migrationlar va faqat synthetic test data ishlatiladi.
- `frontend/scripts/validate-deploy-environment.mjs` Netlify contexti, 20 belgili project-ref, modern publishable-key formati, optional Supabase URL va `bright-api` endpoint mosligini fail-closed tekshiradi; qiymatlarni loglamaydi. 10 ta Node regression testi qo'shildi. Netlify build guardni builddan oldin ishlatadi. CSP `vite.config.ts`da tanlangan project-refdan dinamik yaratiladi, preview `noindex/no-store` headerlari saqlanadi; security gate va GitHub CI yangi kontraktga ulandi.
- Verifikatsiya: deploy guard `10/10` PASS; Vitest `23/23` fayl, `108/108` test PASS; TypeScript PASS; synthetic 20 belgili non-production ref bilan production build `3700` modul PASS; security gate `10` build/Netlify fayli PASS. Dastlab Node test fayli Vitest globiga tushdi va CI fixture 20 belgili ref talabiga mos emas edi; test fayli izolyatsiya qilinib fixture tuzatilgach barcha gate green bo'ldi. Remote GitHub CI/Netlify deploy hali ishlatilmadi.
- Supabase `$0/oy` project costi userga ko'rsatildi va alohida ikki bosqichli tasdiqdan keyin `AI Business Concierge Staging` (`piqsyfwrjtormrlenjix`) `ap-southeast-1`da yaratildi: `ACTIVE_HEALTHY`, 32/32 tracked migration applied, `bright-api` v1 ACTIVE, real health `200`. Security advisor error `0`, ma'lum `vector` public-schema warningi `1`, server-only RLS/no-policy info `11`. Auth settings `200`, email autoconfirm false.
- Netlify connector delete/upsertni success desa ham inventory `[]` qaytardi; authenticated Netlify CLI bilan tekshiruv envlar yo'qligini ko'rsatdi. CLI'dagi `builds`-only granular scope Personal rejada qo'llanmagani aniqlanib, faqat browser-public project-ref/publishable key `All` scope'da, contextlar bo'yicha yozildi. Authoritative read-back 4/4: production -> production, deploy-preview/branch-deploy/dev -> staging; optional URL envlari yo'q. Raw keylar loglanmadi.
- Staging Auth redirectlari production Netlify URL, Netlify preview wildcard va Vite local URLlari bilan cheklandi. Birinchi `config push` local CLI defaultlari sabab email confirmation/TOTPni o'chirib va OTPni 6-digit/1-secondga yumshatgani darhol aniqlandi; `config.toml`da email confirmation ON, TOTP ON, 8-digit/1-minute OTP explicit pin qilinib ikkinchi push bilan to'liq qaytarildi. Productionga tegilmadi.
- Vercel CLI OAuthdan keyin mavjud project link qilindi va Git integration explicit tasdiq bilan uzildi; read-back `gitRepositoryConnected=false`. Project/deployment history o'chirilmadi. CLI avtomatik yaratgan OIDC `.env.local` va `.vercel` metadata fayllari qiymatini o'qimasdan darhol o'chirildi; `.netlify`/`.vercel` lokal metadata yo'llari `.gitignore`ga kiritildi.
- Qolgan ish: stagingda ephemeral synthetic Auth/tenant fixture bilan authenticated Edge acceptance va cleanup; branch/PR orqali GitHub CI va Netlify production/preview smoke-testlari. Vercel project/history deletion faqat alohida destructive tasdiq bilan amalga oshiriladi.

Fayllar: `.gitignore`, `.github/workflows/ci.yml`, `netlify.toml`, `supabase/config.toml`, `frontend/package.json`, `frontend/vite.config.ts`, `frontend/scripts/validate-deploy-environment.mjs`, `frontend/scripts/validate-deploy-environment.node.mjs`, `frontend/scripts/security-check.mjs`, 4-tilli `ARCHITECTURE/CONNECTIONS/DEPLOY_SETUP/STATUS/PLAN/DEVLOG`.

## 2026-08-11 — GHSA exception removal main push va remote CI closeout yakunlandi

- Tekshirilgan audit gate va sinxron 4-tilli hujjatlar `1fb6c0c` (`chore: remove obsolete GHSA audit exception [skip netlify]`) sifatida bevosita `main`ga commit/push qilindi. Lokal `main` va `origin/main` shu commitda teng; uchta mavjud untracked user fayli stage/commit qilinmadi.
- GitHub Actions CI run `31466592524` 57 soniyada `success`: install, type-check, unit tests, exception'siz production dependency audit, production build va bundle/hosting security bosqichlarining barchasi green. `[skip netlify]` audit/CI script va docs o'zgarishi uchun keraksiz production frontend deployni oldini oldi.
- Keyingi faol ish o'zgarmadi: production/preview environment, secret va data ajratish qarori; undan keyin AI Hujjatchi PDF/DOCX/Storage.

Fayllar/state: commit `1fb6c0c`, GitHub CI `31466592524`, sinxron 4-tilli STATUS/DEVLOG.

## 2026-08-11 — GHSA-qwww vaqtinchalik metadata exceptioni olib tashlandi

- Oldingi holatda npm/global advisory va React Router upstream advisory orasidagi `react-router@7.18.2` patched-range tafovuti sabab production audit gate'da faqat GHSA-qwww uchun exact-versiyali, 2026-08-21gacha amal qiladigan exception bor edi. User va agent alohida raw `npm audit --omit=dev --json` tekshiruvlarida jami vulnerability `0` natijasini oldi; scoped gate ham warning'siz green bo'ldi, ya'ni exception endi hech qanday advisory'ni filtrlab o'tkazmayotgan edi.
- `frontend/scripts/audit-production.mjs`dan GHSA-qwww allowlist, lockfile exact-version tekshiruvi, deadline/evidence metadata va exception warning yo'li olib tashlandi. Gate network/API/JSON nosozligida fail-closed qoladi va endi istisnosiz barcha high/critical advisory'larni bloklaydi. Dependency va lockfile o'zgarmadi.
- Tekshiruv: raw production audit — info/low/moderate/high/critical jami `0`, production dependency `233`; exception olib tashlangach `npm run audit:production` PASS — high/critical `0`; `npm run typecheck` PASS; synthetic non-secret publishable env bilan Vitest `23/23` fayl va `108/108` test PASS; production build `3700` module PASS; security gate `9` build/Netlify fayli PASS; `git diff --check` PASS. Env qiymatlarisiz dastlabki test run `13` fayl/`56` testdan keyin config fail-fast sabab `10` suite fail bo'ldi va yuqoridagi synthetic env bilan to'liq qayta ishlatildi.
- Qolgan faol tartib: production/preview environment, secret va data ajratish qarorini qabul qilish; undan keyin AI Hujjatchi PDF/DOCX/Storage.

Fayllar: `frontend/scripts/audit-production.mjs`, `docs/STATUS.md`, `docs/PLAN.md`, 4-tilli `DEVLOG/STATUS/PLAN`.

## 2026-08-11 — Company Dashboard authenticated dark-mode visual acceptance yakunlandi

- Oldingi holatda “Biznes holati” inverse markup unit test va landingdagi shared token browser acceptance bilan himoyalangan, ammo agentda production credential bo'lmagani uchun authenticated Company Dashboard vizual recheck ochiq qolgan edi. User ko'rinadigan agent browser oynasida Rahbar akkaunti bilan login qildi; credential qiymatlari agentga berilmadi va loglanmadi.
- Production `/app` authenticated Rahbar dashboardini ochdi; HTML class va computed `color-scheme` `dark`, theme toggle esa “Yorug' rejim”ni ko'rsatdi. “Biznes holati” section fon rangi `rgb(17,19,24)`, title/foiz matni `rgb(244,243,239)` va `16.73:1`, 6/6 muted matn `65%` inverse foreground va `7.5:1`, yashil success signal `rgb(74,222,128)` va `10.66:1` kontrast bilan render bo'ldi. SVG background track `20%` inverse rangda dekorativ; yashil arc va raqam/status matni holatni mustaqil beradi.
- 12/12 to'g'ridan-to'g'ri text node section chegarasida, out-of-bounds `0`, overlap `0`; section viewport ichida, sahifa horizontal overflow `0`, browser console error `0`. Targeted viewport screenshot vizual ko'rib chiqildi: barcha title, update, status, bo'lim label va foizlar o'qiladi.
- Tekshiruvdan keyin test browser sessionidan UI orqali logout qilindi va `/login` redirect tasdiqlandi. Private dashboard ma'lumoti tushgan screenshotlar commit qilinmadi va lokal tempdan o'chirildi. Kod o'zgarmadi; completed dashboard visual item faol PLAN'dan olib tashlandi.
- Keyingi faol ish: 2026-08-21gacha GHSA-qwww metadata exceptionini qayta ko'rish, production/preview environment ajratish qarori, so'ng AI Hujjatchi PDF/DOCX/Storage.

Fayllar/state: 4-tilli STATUS/PLAN/DEVLOG; production authenticated browser runtime. Application code o'zgarmadi.

## 2026-08-11 — Main closeout CI va docs-only production holati tasdiqlandi

- Codex P1 findingi va final rollout dalillari `f9152c6` docs-only commitida bevosita `main`ga push qilindi. Main GitHub CI run `31462960098` 58 soniyada `success`; type-check, 108/108 unit test, production dependency audit, build va bundle/hosting security steps green.
- Push avtomatik docs-only Netlify production deployni yaratdi: deploy `6a7ab804ea3f550008240f11`, build `6a7ab804ea3f550008240f0f`, `ready`, commit `f9152c6`, published `2026-08-11T05:50:30.225Z`, 32s, plugin `success`; 87,160 scanned faylda normal/enhanced secret match `0`.
- Eng so'nggi production bundle qayta tekshirildi: modern publishable key 1, JWT-like legacy key 0, legacy env nomi yo'q, format guard mavjud; Auth `200`, Realtime `OPEN`, console error/Vite overlay/overflow `0`. Keyingi hujjat commitida keraksiz yangi production rebuild siklini oldini olish uchun Netlify'ning `[skip netlify]` commit markeri ishlatiladi.

Fayllar/state: `f9152c6`, GitHub CI `31462960098`, Netlify `6a7ab804ea3f550008240f11`, 4-tilli STATUS/DEVLOG.

## 2026-08-11 — PR #6 merge, Codex P1 closeout va final no-fallback deploy yakunlandi

- No-fallback kod va 4-tilli hujjatlar `85cb241` commitida `agent/remove-legacy-supabase-anon-fallback`ga push qilindi. Draft PR #6 ready-for-reviewga o'tkazildi; GitHub `frontend-security-gate` run `31461980468` 48 soniyada `success`, Netlify preview `6a7ab3ed99861d0008a32837` ready, Vercel deployment `EPxGDaLxfNeKnHPKfwsUzxp7sZfd` ready bo'ldi. PR #6 `2b71a4990e6cdba5c822379821c27816b6854185` bilan `main`ga squash-merge qilindi.
- Merge'dan keyin kelgan Codex reviewda bitta unresolved P1 thread topildi: canonical PLAN/STATUS/DEVLOG commit yaratilganidan keyin ham commitni keyingi amal deb ko'rsatgan va IDni yozmagan. Finding to'g'ri; ushbu append-only entry va 4-tilli STATUS/PLAN closeout commit/PR/CI/deploy IDlarini yozib, tugallangan itemni faol rejadan olib tashlaydi. User reply/resolve so'ramagani uchun GitHub threadga yozilmadi va u resolve qilinmadi.
- Merge commitning clean tracked snapshotidan manual production deploy qilindi. Birinchi sandboxed urinish npm registry DNS `ENOTFOUND` bilan tugadi; ayni command network approval bilan qayta ishlatilib muvaffaqiyatli yakunlandi. Netlify deploy `6a7ab5474835d660f21249cd`, build `6a7ab5464835d660f21249cb`, `ready`, published `2026-08-11T05:39:38.297Z`, 82s, plugin `success`; 87,160 scanned faylda normal/enhanced secret match `0`.
- Production browser acceptance: 2 script, modern publishable key 1, JWT-like legacy key 0, `VITE_SUPABASE_ANON_KEY` nomi yo'q, `sb_publishable_...` format guard mavjud; Auth settings HTTP `200`, Realtime WebSocket `OPEN`. Login mazmunli render bo'ldi, console error/Vite overlay/horizontal overflow `0`.
- Keyingi faol ish: Company Dashboard “Biznes holati” panelining authenticated production dark-mode vizual rechecki; 2026-08-21gacha GHSA-qwww metadata exceptionini qayta ko'rish; undan keyin AI Hujjatchi PDF/DOCX/Storage.

Fayllar/state: PR #6, `frontend/src/app/config.ts`, `frontend/src/app/__tests__/config.test.ts`, `frontend/src/env.d.ts`, 4-tilli STATUS/PLAN/DEVLOG/FIRST_PUSH, Netlify production env/deploy.

## 2026-08-11 — Supabase publishable-key production handoffi bajarildi, source publish tayyorlandi

- Oldingi holatda frontend yangi publishable keyni birinchi tanlasa-da, Netlify'da modern env yo'q va production bundle legacy anon fallbackni ishlatar edi. Supabase production projectida faol modern `sb_publishable_...` key mavjudligi qiymatini loglamasdan tekshirildi; Netlify'da `VITE_SUPABASE_PUBLISHABLE_KEY` public build env sifatida barcha Personal-plan scope/contextlariga o'rnatildi.
- `main`ning clean tracked snapshoti Netlify productionga deploy qilindi: deploy `6a7a9c1ec552d009a42c6f97`, build `6a7a9c1ec552d009a42c6f95`, `ready`, published `2026-08-11T03:51:28.742Z`, 33s, plugin `success`, 87,160 scanned faylda secret match `0`. Bundle ichida modern key prefixi 1 marta, project legacy JWT esa 0 marta topildi; Auth settings HTTP `200`, Realtime WebSocket `OPEN`, login console/Vite overlay errorlari va horizontal overflow `0` bo'ldi.
- Rollout tasdiqlangach Netlify'dagi faqat `VITE_SUPABASE_ANON_KEY` frontend env o'chirildi; modern publishable env saqlandi. Supabase legacy API keyning o'zi revoke qilinmadi. `config.ts` endi faqat `VITE_SUPABASE_PUBLISHABLE_KEY`ni qabul qiladi va `sb_publishable_` formatini fail-fast tekshiradi; eski env tipi/fallback va fallback testi olib tashlandi, negative contract test qo'shildi. 4-tilli `FIRST_PUSH` ko'rsatmasi modern keyga o'tkazildi.
- Verifikatsiya: targeted config 3/3 test `PASS`; TypeScript `PASS`; modern test env bilan Vitest 23/23 fayl, 108/108 test `PASS`; production build 3700 modul `PASS`; security gate 9 fayl `PASS`; `git diff --check` `PASS`. Lokal `.env`da modern key yo'qligini ko'rsatgan dastlabki full run 13 suite/56 testni o'tkazib, 10 suite'ni aynan config fail-fastda to'xtatdi; maxfiy lokal fayl o'zgartirilmadi.
- Source va hujjatlar lokal `agent/remove-legacy-supabase-anon-fallback` branchida. Dastlab sandbox ichidagi `gh auth status` tokenni invalid ko'rsatdi; user loginidan keyin system keyring bilan qayta tekshiruv `sherzot` accounti va `repo/workflow` scope'larini tasdiqladi. Birinchi keyingi amal: explicit staging/commit/push/PR, CI va final bundle/Auth/Realtime recheck.

Fayllar/state: `frontend/src/app/config.ts`, `frontend/src/app/__tests__/config.test.ts`, `frontend/src/env.d.ts`, `docs/FIRST_PUSH.md`, 4-tilli STATUS/PLAN/DEVLOG/FIRST_PUSH, Netlify env va production deploy.

## 2026-08-10 — Inverse kontrast hotfixlari productionga chiqarildi

- PR #4 Codex reviewidagi DEVLOG closeout topilmasi PR #5ning 4-tilli hujjat commitida bajarildi. PR #5 Codex reviewidagi yagona P1 topilma green gate identifikatorlari yetishmasligi edi; GitHub run, Netlify preview va Vercel deployment ID'lari STATUS/DEVLOGga qo'shilib `67ab618` bilan `main`ga push qilindi. GitHub threadlariga reply/resolve berilmadi.
- Landing fixi PR #4 `700483d`, Company Dashboard fix/test/docs PR #5 `2466200` bilan `main`ga squash-merge qilingan. Netlify production deploy `6a79e664a453161423131204` `ready`, build `6a79e664a453161423131202`, published `2026-08-10T14:56:55.975Z`, deploy time 81s, plugin state `success`; 87,160 scanned faylda secret match `0`.
- Production browser dark mode'da Why Us 6/6 sababni topdi: title ranglari `rgb(244,243,239)`, izohlar 65% inverse foreground, fon `rgb(17,19,24)`; overflow `0`, console error/Vite overlay yo'q va sahifa mazmunli render bo'ldi.
- Company Dashboard kodi production bundle ichida va 23/23 fayl, 108/108 test baseline'i green. Credential bo'lmagani uchun authenticated “Biznes holati” paneli agent browserda ochilmadi; birinchi keyingi action userning shu panelni production dark mode'da vizual qayta tekshirishidir. Shundan keyin publishable-key handoff davom etadi.

Fayllar/state: PR #4/PR #5 frontend fixlari, frontend deploy source `67ab618`, Netlify production deploy va 4-tilli STATUS/PLAN/DEVLOG.

## 2026-08-10 — Landing va Company Dashboard inverse kontrasti tuzatildi

### Kontekst va bajarilgan ish

- User Rahbar Kompaniya profili va Super Admin dashboardining oldingi authenticated production smoke-testlari muvaffaqiyatli o'tganini tasdiqladi.
- Landingdagi “Nega global bozorda aynan biz?” blokining 01–06 sarlavha/izohlari fixed qora inverse panel ichida theme-dependent `background` tokenini ishlatgan. Dark mode'da token ham qorayib matn fon bilan qo'shilgan. Title'lar `--editorial-inverse-fg`, izohlar shared `editorial-inverse-muted` tokeniga o'tkazildi; fix `c59ed82`/PR #4 orqali `700483d` bilan `main`ga merge qilindi.
- Company Dashboard “Biznes holati” panelida ayni pattern heading, update, status, bo'lim label/foizlari va SVG trackda topildi. Barchasi inverse foreground/muted contractiga o'tkazildi; panel ichida `text-background` qaytishini bloklaydigan `DashboardPage` regressiya testi qo'shildi (`4184ddb`, PR #5).
- PR #4 Codex reviewidagi yagona unresolved P1 topilma majburiy DEVLOG closeout yo'qligi edi; ushbu 4-tilli entry va STATUS/PLAN sinxronizatsiyasi shu feedbackni kod o'zgartirmasdan yopadi.

### Verifikatsiya va qolgan ish

- Node `22.18.0`: TypeScript `PASS`; Vitest 23/23 fayl, 108/108 test `PASS`; production build `PASS` (3700 modul); security gate 9 build/Netlify fayli `PASS`; `git diff --check` `PASS`.
- Lokal browser dark/light mode'da Why Us 6/6 sababni topdi: title `rgb(244,243,239)`, izoh inverse foreground 65%, fon `rgb(17,19,24)`; overflow `0`, console error va Vite overlay yo'q. Screenshot: `/private/tmp/abc-why-us-dark.png`.
- Authenticated dashboard browser sessiyasi credential'siz takrorlanmadi; ayni inverse tokenning computed browser kontrasti landingda, dashboard markup contracti esa yangi unit testda tasdiqlandi. PR #5 code-only GitHub run `31399285836` va final docs run `31399751738` `success`; Netlify code preview `6a79e27ae3c42e00088ffd45` ready, latest docs-only deploy `6a79e3b03648850008d64852` canceled; Vercel final deployment `Cg6Bt5HG1JJrGvwzDYaJqokQQU2q` ready. PR #5 `2466200` bilan `main`ga merge qilindi; keyingi action Netlify production deploy va user dark-mode smoke-testidir.

### Fayllar

- `frontend/src/features/landing/components/WhyUsSection.tsx`
- `frontend/src/features/reports/pages/DashboardPage.tsx`
- `frontend/src/features/reports/__tests__/DashboardPage.test.tsx`
- `docs/{STATUS,PLAN,DEVLOG}.md`
- `docs/{English,Russian,日本語}/{STATUS,PLAN,DEVLOG}.md`

## 2026-08-10 — PR #3 review hotfixi va production rollout yakunlandi

### Kontekst va bajarilgan ish

- `agent/fix-landing-localization-copy`dagi o'zgarishlar `be047c4` bilan commit/push qilindi; PR #3 GitHub Actions run `31393176016` green bo'lgach `79be466` bilan `main`ga squash-merge qilindi.
- Codex reviewidagi ikki P2 topilma tekshirildi. Global form padding qoidasi ikonali `pl-8` inputlarning chap insetini bosib, Admin Audit va Knowledge Base qidiruv placeholderlarini ikonaga yaqinlashtirayotgani tasdiqlandi; `pl-8` uchun `32px` override qo'shilib `aee6692` bilan bevosita `main`ga push qilindi. Ikkinchi topilma bo'yicha STATUS/PLAN'dagi eski “lokal/deploy pending” holati ushbu closeout bilan yangilandi.
- Supabase `bright-api` productionga deploy qilindi: version 75, `ACTIVE`, `verify_jwt=false`. Netlify production hotfix deploy `6a79d69c9aa5a6bcf326e83c` `ready` holatda 2026-08-10T13:50:02.498Z da published bo'ldi.

### Verifikatsiya va qolgan ish

- Node `22.18.0`: TypeScript `PASS`; Vitest 22/22 fayl, 107/107 test `PASS`; production build `PASS` (3700 modul); security gate 9 build/Netlify fayli `PASS`; `git diff --check` `PASS`.
- Lokal browser computed checkda dinamik `input.pl-8` chap paddingi `32px`, o'ng `16px`, yuqori `12px`; login mazmunli render bo'ldi, overlay/page error/overflow topilmadi. Production landingda `Nimalar avtomatlashadi?` mavjud, xitoy/turk/koreys copy yo'q, overflow `0`, `pl-8` chap padding `32px`, console/page error yo'q. Authsiz `/admin` `/login`ga xavfsiz redirect bo'ldi.
- Production Edge health `200` va `{"status":"ok"}` qaytardi. User credentiallari berilmagani uchun Rahbar Kompaniya profili va Super Admin dashboardining authenticated oqimi bajarilmadi; birinchi keyingi action shu ikki rol bilan production smoke-testdir.

### Fayllar

- `frontend/src/styles/editorial.css`
- `docs/{STATUS,PLAN,DEVLOG}.md`
- `docs/{English,Russian,日本語}/{STATUS,PLAN,DEVLOG}.md`

## 2026-08-10 — Lokalizatsiya, form/hover kontrasti va dashboard regressiyalari tuzatildi

### Kontekst va bajarilgan ish

- PR #2 `65abe2f` bilan `main`ga merge qilingan holat qayta tekshirildi; ish `main`dan ochilgan `agent/fix-landing-localization-copy` branchida bajarildi. Mavjud uchta untracked user fayliga tegilmadi.
- Landingning o'zbek, rus, ingliz va yapon nusxalari imlo/uslub bo'yicha tekshirildi. Aralash yozuvdagi `Nimalар avtomatlashadi?` to'liq lotincha `Nimalar avtomatlashadi?`ga almashtirildi. “Kim uchun?” qismida tizimda yo'q xitoy/turk/koreys tillari olib tashlanib, faqat o'zbek, rus, ingliz va yapon tillari qoldirildi; til statistikasi va pricing copy ham shu kontraktga moslandi.
- Barcha matnli input/select/textarea uchun 16 px gorizontal va 12 px vertikal ichki padding markazlashtirildi; password/search icon offsetlari saqlandi, label-control oralig'i 8 px qilindi. Shared Input/Textarea/Select 44 px control kontraktiga o'tdi.
- Dark mode'dagi solid light `hover:bg-*` utilitylari neutral/brand/status dark tokenlariga bog'landi; white-on-white ko'rinmas hover holati yopildi.
- Rahbarning Kompaniya profili GET/PATCH so'rovlari tenant ID'ni URL'da bergan, lekin `apiRequest`ga `tenantId` uzatmagani sabab `X-Tenant-Id` yuborilmagan va backend `Tenant context topilmadi.` qaytargan. Tenant profile API helperi yaratilib ikkala so'rov tuzatildi; Employee Detail'dagi ayni pattern ham yopildi.
- Super Admin crashining sababi Edge AI stats javobidagi `cost` va frontend kutgan `cost_usd` nomlari mos emasligi edi. Server contracti `cost_usd`ga tuzatildi, frontend eski/qisman javoblarni finite raqamlarga normallashtiradi. `/admin` uchun maxfiy stackni ko'rsatmaydigan route error fallback qo'shildi.

### Verifikatsiya va qolgan ish

- Node `22.18.0`: TypeScript `PASS`; Vitest 22/22 fayl, 107/107 test `PASS`; production build `PASS` (3700 modul); security gate 9 build/Netlify fayli `PASS`; `git diff --check` `PASS`.
- Agent-browser: 4/4 landing locale desktopda tekshirildi; obsolete tillar yo'q va horizontal overflow `0`. 390×844 mobil Uzbek landingda title/copy va overflow `0`; browser page error yo'q. Dark login computed padding emailda `12/16/12/16`, passwordda `12/44/12/16`; hover fon `rgb(24, 28, 34)`, matn `rgb(243, 244, 246)`.
- Lokal `deno` mavjud emasligi sabab Edge Function alohida Deno typecheck qilinmadi. Kod hali commit/push/deploy qilinmagan; productiondagi tenant/admin tuzatishlari branch merge va frontend/`bright-api` deploydan keyin kuchga kiradi. Birinchi keyingi action: branchni review/commit/push qilish, CI'dan keyin frontend va Edge'ni deploy qilib Rahbar profile hamda Super Admin login smoke-testini bajarish.

### Fayllar

- `frontend/src/features/landing/{i18n.ts,__tests__/landingDomain.test.ts}` va `frontend/src/app/i18n.ts`
- `frontend/src/styles/{editorial.css,theme-indigo-slate.css}` va `frontend/src/shared/ui/{input,textarea,select}.tsx`
- `frontend/src/features/tenants/{api/tenantsApi.ts,pages/TenantSettingsPage.tsx,__tests__/tenantsApi.test.ts}`
- `frontend/src/features/hr/pages/EmployeeDetailPage.tsx`
- `frontend/src/features/admin/{api/adminApi.ts,__tests__/adminApi.test.ts}`
- `frontend/src/app/{router.tsx,RouteErrorPage.tsx}`
- `supabase/functions/server/index.ts`
- `docs/{STATUS,PLAN,DEVLOG}.md` va uchta tarjima to'plami

## 2026-08-08 — Hero typography va form spacing sinchiklab tuzatildi

- LP hero headline max-size yana pasaytirildi, tracking normalga yaqinlashtirildi va line-height oshirildi; browser screenshotda uzun Uzbek sarlavha endi yumshoqroq, 3 qatorli va o‘qilishi qulay.
- Global `label + input/select/textarea` oralig‘iga 6px breathing space qo‘shildi; contact form browser computed tekshiruvda label/control overlap topilmadi.
- Agent-browser visual smoke-check: landing va contact route’lari content bilan render bo‘ldi, Vite overlay yo‘q.

## 2026-08-08 — Visual consolidation va title scale refinement

- Portfolio-inspired visual qoidasi product/admin/HR surface’lariga yanada kuchaytirildi: dekorativ purple/pink ranglar semantic blue/neutral palette’ga bog‘landi, notification/template/HR signal emoji’lari lucide ikonkalarga almashtirildi.
- Landing hero sarlavhasi va umumiy editorial title scale kichraytirildi; uzun Uzbek hero copy endi birinchi viewportda yengilroq va o‘qilishi qulayroq.
- Harf tracking va line-height kengaytirildi; title va paragraph matnlari bir-biriga yopishib qolmaydi.
- TypeScript va landing/docs targeted tests: `PASS`.

## 2026-08-08 — PR #2 review commentlari yopildi

- Dark-system kontrast feedbacki tuzatildi: editorial inverse surface va header endi theme’dan mustaqil `#111318`/`#f4f3ef` tokenlaridan foydalanadi; contact/register/auth inverse content o‘qilishi saqlandi.
- Landing `Explore system` CTA’si `landingI18n`ga qo‘shilib Uzbek, Russian, English va Japanese bo‘yicha lokalizatsiya qilindi.
- Canonical `STATUS.md` snapshotidagi browser/commit pending contradictioni tuzatildi va 4 til nusxasi sinxronlashtirildi.
- Browser regression: dark contact computed inverse background/header, form content va no-overflow; Russian va Japanese locale switch CTA’lari tekshirildi.
- Full regression: 21/21 test fayli, 101/101 test, production build, 9-file security gate va `git diff --check` — `PASS`.

---

## 2026-08-08 — Redesign commit, push va preview CI yakunlandi

- Portfolio-inspired redesign `83bc7e0` (`feat: redesign frontend in portfolio style`) commit qilindi va `agent/portfolio-inspired-redesign` branchi `origin`ga push qilindi.
- PR #2 ochiq: https://github.com/sherzot/ai-business-concierge/pull/2
- GitHub `frontend-security-gate` run `31240118332` `success`; Vercel preview `success`; Netlify Deploy Preview `https://deploy-preview-2--ai-business-concierge1.netlify.app` ready.
- PR `main`ga merge qilinmagan va production deploy qilinmagan. Keyingi faol ish: Netlify publishable-key handoff, keyin AI Hujjatchi PDF/DOCX/Storage.

---

## 2026-08-08 — Portfolio-inspired to'liq frontend redesign lokal yakunlandi

### Bajarildi

- `sherzot/Portfolio`ning warm canvas, qora tipografiya, yagona Sher-blue accent, divider-based kompozitsiya va yengil motion tili AI Business Concierge'ga mahsulotga mos tarzda ko'chirildi; Portfolio kodi nusxalanmadi.
- Yangi global tokenlar, editorial primitivlar, brand mark/lockup va product operational-system SVG yaratildi. Light/dark theme, reduced-motion va focus-visible holatlari saqlandi.
- Landing, contact/company registration, login/forgot/reset/setup-account, product sidebar/topbar, dashboard, Inbox, Tasks, Docs, Settings va admin shell qayta dizayn qilindi. Qolgan eski modullar yagona compatibility layer orqali warm/ink/blue tizimiga moslandi.
- Auth sahifalaridagi takroriy layout yagona `AuthShell`ga yig'ildi; public form label/input bog'lanishlari va password-toggle aria labellari yaxshilandi.

### Verifikatsiya va chegara

- `git diff --check`, TypeScript, 21/21 test fayli va 101/101 test, production build va 9-file security gate — `PASS`; production dependency audit high/critical `0`.
- Build muvaffaqiyatli, oldindan ma'lum bloklamaydigan warninglar saqlanadi: ~1.76 MB main chunk, `supabase.ts` mixed import va eski Browserslist data.
- `agent-browser` Chrome runtime bilan o'rnatildi va browser acceptance bajarildi: desktop landing, mobile landing, login, forgot-password va contact route'lari mazmunli render bo'ldi; error overlay, browser error va horizontal overflow topilmadi. Annotated screenshots `/private/tmp/abc-landing.png`, `/private/tmp/abc-mobile.png`, `/private/tmp/abc-login.png`da saqlandi.
- Keyingi Vite route smoke-checkda `/`, `/login`, `/forgot-password`, `/contact`, `/app` va `/admin` barchasi `200` status va SPA shell bilan qaytdi; server tartibli to'xtatildi.
- Ishlar local `agent/portfolio-inspired-redesign` branchida, base `df42ecf`; hali commit/push/deploy qilinmagan.

### Keyingi qadam

1. Browser acceptance topilmalari bo'lmagani uchun redesignni commit/push qilish va GitHub CI/Netlify previewni tekshirish.
2. Shundan so'ng faol product rejasidagi Netlify publishable-key handoff va AI Hujjatchi ishlariga qaytish.

---

## 2026-08-08 — Supabase CLI v2.112.0 va fresh local-infra regressiyasi

### Yangilash va topilmalar

- Official Supabase Homebrew formulasi tor `brew trust --formula supabase/tap/supabase` ruxsati bilan tanlandi. Core formula oraliqda `v2.111.0`ni o'rnatganidan keyin official tap orqali CLI `v2.112.0`ga yangilandi; keng tap trust berilmadi.
- Official upgrade tavsiyasiga ko'ra oldingi local-only volume backup qilinmay o'chirildi. Production schema/data va linked migration historyga tegilmadi.
- `v2.112.0`da `functions serve` function nomini positional argument sifatida qabul qilmaydi; local acceptance barcha functionlarni `supabase functions serve --no-verify-jwt` bilan serve qiladi.
- Fresh Postgres image implicit CRUD grantlariga tayanib bo'lmasligini ko'rsatdi. Core baseline backend boshqaradigan dastlabki jadvallar uchun aniq `service_role` grantlari bilan to'ldirildi.
- pgTAP direct `user_tenants` o'qishini bo'sh natija deb emas, aniq `42501 permission denied` deb tekshiradigan bo'ldi. Edge fixture yangi `sb_secret_...` API key va legacy service-role JWT'ni alohida headerlarda ishlatadi; qiymatlar log/hujjatga yozilmadi.

### Yakuniy verifikatsiya

- Toza local bazada 32/32 migratsiya replay bo'ldi. Cold-start health probe warm-up paytida timeout berdi, lekin diagnostik startdan keyin barcha enabled containerlar `healthy`; Storage/Auth/Studio endpointlari `200` bo'ldi.
- `supabase test db`: 1 fayl, 21/21 test — `PASS`. Real local Auth-token Edge acceptance: 8/8 — `PASS`.
- Node `22.18.0`: type-check, 21/21 test fayli va 101/101 test, production build, 9-file security gate muvaffaqiyatli; production dependency audit high/critical `0`.
- Local Edge server va Supabase stack tekshiruvdan keyin tartibli to'xtatildi.

### Fayllar

- `supabase/migrations/20250212000000_core_schema_baseline.sql`
- `supabase/tests/database/realtime_tenant_isolation.test.sql`
- `supabase/tests/integration/edge_tenant_authorization.test.mjs`
- `docs/{STATUS,PLAN,DEVLOG}.md` va uchta tarjima to'plami

---

## 2026-08-08 — Migration history va local Storage drift yopildi

### Production migration history

- Joriy Supabase changelog va CLI migration hujjatlari tekshirildi. `db push --dry-run` backdated `20250212000000_core_schema_baseline.sql` remote historyda yo'qligini, `--include-all --dry-run` esa faqat shu faylni rejalayotganini ko'rsatdi.
- Production metadata read-only tekshirildi: baseline kutgan 10/10 jadval, 13/13 index, `pgcrypto` va barcha 10 jadvaldagi RLS allaqachon mavjud edi.
- SQL'ni qayta ishlatish o'rniga `supabase migration repair 20250212000000 --status applied --linked` bajarildi. Bu faqat migration-history yozuvini qo'shdi; schema va business data o'zgarmadi.
- Yakuniy `migration list` local/remote versiyalar to'liq tengligini, `db push --linked --dry-run` esa `Remote database is up to date` holatini tasdiqladi.

### Local Storage/full-stack health

- Stale linked metadata local Storage/Auth'ni `v1.58.1/v2.189.0`ga pin qilgan edi. `supabase link`dan keyin pinlar productionga mos `v1.68.1/v2.195.0`ga yangilandi; repo fayllari o'zgarmadi.
- Yangilangan image'lar bilan exclusionsiz local stack ishga tushirildi. Dastlab 2 soniyalik health probe warm-up paytida timeout berdi; diagnostik startdan keyin barcha enabled Supabase containerlari `healthy` bo'ldi.
- Gateway smoke-testlari: Storage `/storage/v1/status` `200`, Auth `/auth/v1/health` `200`, Studio profile `200`.
- `imgproxy` image transformations configda yoqilmagani uchun ataylab stopped; capability kerak bo'lmaguncha bo'sh infratuzilma sifatida yoqilmaydi. Local stack tekshiruvdan keyin to'xtatildi.

### Qolgan operatsion eslatma

- O'rnatilgan Supabase CLI `v2.101.0`, mavjud yangilanish `v2.112.0`; bu tekshiruvlarni bloklamadi.

### Fayllar

- Production migration history: `20250212000000` applied deb muvofiqlashtirildi
- Local-only linked service metadata yangilandi (`supabase/.temp`, Gitga kirmaydi)
- `docs/{STATUS,PLAN,DEVLOG}.md` va uchta tarjima to'plami

---

## 2026-08-08 — Qolgan acceptance tekshiruvlari yopildi

### Fresh migration stack

- Toza lokal DB birinchi urinishda yiqildi: asosiy jadvallar tarixan `supabase/schema.sql` bilan yaratilgan, ammo migratsiya tarixida foundation yo'q edi. Replay keyin `20260417134151_phase0_new_tables.sql` ichidagi noto'g'ri `DO/EXCEPTION` blokida ham to'xtadi.
- CLI scaffoldidan `20250212000000_core_schema_baseline.sql` yaratildi. U seed va policylarni takrorlamasdan asosiy jadvallar/indexlar/RLSni idempotent yaratadi; mavjud muhitga xavfsiz no-op bo'ladi.
- Tarixiy trigger loopiga ichki `BEGIN … EXCEPTION … END` bloki qo'shildi. Shundan keyin bo'sh lokal bazada 32/32 migratsiya oxirigacha replay bo'ldi.
- Backdated baseline productionga yuborilmadi va `20250212000000` remote migration historyda hali yo'q. Keyingi production DB migrationidan oldin dry-run qilib idempotent no-op apply yoki history repair yo'li tanlanadi.
- Linked project va local CLI service-version drift sabab Storage health-check nosog'lom bo'ldi; DB/Auth/Realtime/Edge acceptance stacki `storage-api,imgproxy`ni chiqarib muvaffaqiyatli ishga tushdi. Bu file-storage acceptance emas.
- Lokal `supabase test db`: 1 fayl, 21 test — `PASS`.

### Real Auth tokenli Edge integration

- `supabase/tests/integration/edge_tenant_authorization.test.mjs` qo'shildi. Test faqat local Auth/REST/Edge'da vaqtinchalik tenant va userlar yaratadi, token/keylarni chiqarmaydi va fixturelarni `finally`da tozalaydi.
- `bright-api` real access tokenlari bilan 8/8 holat o'tdi: active own-tenant `200`; cross-tenant, blocked va terminated `401 TENANT_REQUIRED`; super-admin cross-tenant va admin route `200`; blocked admin `403 FORBIDDEN`; employee privileged member-create `403 FORBIDDEN_ROLE`.
- Production Auth user yoki production data yaratilmagan. Local Edge server va Supabase containerlari testdan keyin to'xtatildi; local DB volume backup qoldi.

### Fayllar

- `supabase/migrations/20250212000000_core_schema_baseline.sql`
- `supabase/migrations/20260417134151_phase0_new_tables.sql`
- `supabase/tests/integration/edge_tenant_authorization.test.mjs`
- `docs/{STATUS,PLAN,DEVLOG}.md` va uchta tarjima to'plami

---

## 2026-08-08 — Realtime tenant isolation va Edge authorization qotirildi

### Topilma va qaror

- Production reproducer faol tenant a'zosi o'z `tasks` va `inbox_items` yozuvlarini ko'ra olmasligini ko'rsatdi: policy RLS yoqilgan, ammo policy'siz `user_tenants`ni subquery qilgani uchun default-deny ishlagan. `notifications` esa membership statusini umuman tekshirmas edi.
- Tarixiy migratsiyalar `user_tenants.status` uchun ikki xil kontrakt qoldirgan: production faqat `active/terminated`ni qabul qilgan, kod esa `password_pending/password_set/blocked`ni ham yozadi.
- `getTenantContext` JWT ichidagi `tenant_id/role`ni DB membership statusisiz qabul qilgan; takroriy admin route tekshiruvlari ham active membership/tenantni talab qilmagan.

### Bajarildi

- `20260808014845_harden_realtime_tenant_authorization.sql` productionga qo'llandi: status kontrakti besh lifecycle holatiga birlashtirildi; `private.is_active_tenant_member()` yaratildi; `tasks`, `inbox_items`, `notifications` browser uchun read-only qilindi va policylar faol membership hamda faol tenantga bog'landi.
- `supabase/tests/database/realtime_tenant_isolation.test.sql` 21 ta tranzaksion pgTAP fixture bilan yaratildi. Testlar real `authenticated` DB role/JWT setting, cross-tenant SELECT, uch jadvaldagi INSERT/UPDATE/DELETE deniali, blocked membership va status kontraktini tekshiradi; oxirida `ROLLBACK` qiladi.
- Edge tenant context header/JWT tenant tanlovini DB'da qayta tasdiqlaydi, faqat faol tenant/a'zolikni qabul qiladi va faol `super_admin` cross-tenant huquqini saqlaydi. DB roli canonical bo'ldi.
- `/auth/me` faqat faol assignment va faol tenantlarni qaytaradi. Barcha `/admin/*` route'lar oldiga faol `super_admin/sub_admin` assignment va faol source tenantni talab qiladigan yagona middleware qo'shildi.
- `bright-api` v74 productionga deploy qilindi.

### Verifikatsiya

- Pre-fix pgTAP: 4/21 fail; migrationdan keyin: `ok 21`. Fixture ma'lumotlari saqlanmadi.
- Production metadata: helper `private` sxemada `SECURITY DEFINER`, `search_path=""`; `anon` EXECUTE yo'q, `authenticated` EXECUTE bor. Uch Realtime jadvalida `authenticated` uchun faqat SELECT va bittadan SELECT policy mavjud.
- Migration historyda `20260808014845` mavjud. Security Advisor yangi error bermadi; ma'lum warninglar `vector` public schema va Leaked Password Protection o'chiqligi. Policy'siz server-only jadvallar INFO/default-deny.
- `bright-api` v74 ACTIVE; health `200`; authsiz tenant route `401 TENANT_REQUIRED`; authsiz admin route `401 UNAUTHORIZED`.
- Frontend regression: type-check, 21/21 test fayli va 101/101 test, build, 9-file security gate muvaffaqiyatli; dependency audit high/critical `0`.

### Ochiq verifikatsiya chegarasi

- Docker ishlamagani sabab fresh local Supabase migration/test stacki ishlatilmadi.
- Active/blocked/terminated va role `403` uchun haqiqiy Edge token integration testi maxsus non-production Auth fixturelarini talab qiladi. Productionda vaqtinchalik Auth user yaratilmagan.
- Netlify publishable-key env rollout alohida ochiq ish bo'lib qoladi.

### Fayllar

- `supabase/migrations/20260808014845_harden_realtime_tenant_authorization.sql`
- `supabase/tests/database/realtime_tenant_isolation.test.sql`
- `supabase/functions/server/index.ts`
- `docs/{STATUS,PLAN,DEVLOG}.md` va uchta tarjima to'plami

---

## 2026-08-08 — Risk scanner uchun to'g'ridan-to'g'ri Data API kirishi yopildi

### Kontekst va qaror

- Production inventarizatsiyasi 32/32 public tableda RLS, 8/8 viewda `security_invoker` va 6/6 `SECURITY DEFINER` funksiyada fixed `search_path` hamda `anon/authenticated` uchun yopiq EXECUTE grantlarini tasdiqladi.
- `risk_scans` va `risk_findings` faqat `bright-api`ning service-role clienti orqali ishlatiladi; API `super_admin/sub_admin` rolini tekshiradi. DBdagi eski `auth.role() = 'authenticated'` SELECT siyosati esa istalgan login qilgan foydalanuvchiga bevosita Data API o'qishini ochib qo'ygan edi.
- Productionda `20260724132314_harden_internal_functions_and_rpc_grants`, repoda esa aynan shu SQL `20260724130852_...` nomida bo'lgan. SQL matni production history bilan tengligi tekshirilib, lokal fayl production timestampiga nomlandi; migration history `repair` qilinmadi.

### Bajarildi

- `20260807153154_lock_down_risk_scanner_tables.sql` yaratildi va productionga qo'llandi.
- Ikkala risk jadvalidagi eski read/service policylar olib tashlandi; `anon` va `authenticated` uchun barcha table privilege'lar bekor qilindi; `service_role` CRUD saqlandi va RLS yoqilgan holda qoldi.
- Security o'zgarishlari `3e383b1` commitida `origin/main`ga push qilindi; GitHub CI run `31193931735` to'liq `success` yakunlandi.
- Publishable-key commit `35d4b91` uchun GitHub CI run `31192041119` green, Netlify production deploy `ready` ekanligi tasdiqlandi. Production bundle hali legacy anon fallback ishlatadi: Netlify CLI login/env rollout qolgan, eski env/fallback olib tashlanmadi.

### Verifikatsiya

- Production metadata: risk jadvallarida RLS `true`, policy soni `0`; `anon/authenticated` SELECT/INSERT/UPDATE/DELETE barchasi `false`; `service_role` CRUD `true`.
- Migration history lokal va remote versiyalar uchun to'liq mos.
- Security Advisor: error `0`; ma'lum warninglar — `vector` public schema va Leaked Password Protection o'chiq. Policy'siz jadvallar INFO/default-deny bo'lib qoladi.
- Production `bright-api` health `200`; autentifikatsiyasiz risk scans endpoint `401`; publishable key bilan anonim `risk_scans` Data API SELECT ham `401`.
- `npm run typecheck` — muvaffaqiyatli; `npm run test:run` — 21/21 fayl, 101/101 test; build va 9-file security gate — muvaffaqiyatli; production audit — exceptiondan tashqari high/critical `0`.

### Keyingi qadam

1. Netlify CLI login, production publishable env, redeploy va Auth/Realtime smoke-testni yopish.
2. Test tenant/user fixturelari bilan cross-tenant CRUD/role denial va `user_tenants`ga bog'liq Realtime/RLS oqimini tekshirish.
3. Har bir service-role Edge route ichki authorizationini audit qilish.

### Fayllar

- `supabase/migrations/20260724132314_harden_internal_functions_and_rpc_grants.sql` (production timestampiga nomlandi)
- `supabase/migrations/20260807153154_lock_down_risk_scanner_tables.sql` (yangi)
- `docs/{STATUS,PLAN,DEVLOG}.md` va uchta tarjima to'plami

---

## 2026-08-08 — Publishable-key frontend contract lokal implementatsiya qilindi

### Kontekst va qaror

- Supabase joriy changelog va API-key migration hujjatlari tekshirildi: browser uchun `sb_publishable_...` tavsiya qilinadi; legacy `anon` 2026 oxirigacha deprecate qilinadi.
- Production Supabase loyihasida `default` publishable key borligi qiymatini chiqarmasdan tasdiqlandi.
- Zero-downtime rollout tanlandi: frontend yangi `VITE_SUPABASE_PUBLISHABLE_KEY`ni birinchi ishlatadi, local/rollback uchun legacy anon fallback vaqtincha qoladi. Edge Function `SUPABASE_ANON_KEY`/JWT oqimi bu slice'da o'zgarmadi.
- Netlify connector upsert muvaffaqiyatli deb javob berdi, ammo keyingi metadata list yangi keyni ko'rsatmadi. Shuning uchun Netlify env holati production bundle tekshirilguncha `UNKNOWN`; legacy env olib tashlanmadi.

### Bajarildi

- Config, TypeScript env contract, CI placeholder va `.env.example` publishable-key nomiga o'tkazildi.
- HR Candidate request session yo'q bo'lsa legacy public keyni `Authorization: Bearer`da yubormaydi; request fail-fast qiladi.
- Foydalanilmaydigan hardcoded legacy public key fayli olib tashlandi.
- Security gate frontendda `supabase.from/rpc/storage/functions` business-data bypasslarini va hardcoded Supabase credential literalini taqiqlaydi.
- `CLAUDE`, `DEPLOY_SETUP` va `CONNECTIONS`ning 4 til nusxasi yangi frontend contractga moslandi.

### Verifikatsiya

- Targeted: 2/2 test fayli, 5/5 test o'tdi.
- `npm run typecheck` — muvaffaqiyatli.
- `npm run test:run` — 21/21 test fayli, 101/101 test muvaffaqiyatli.
- `npm run build` — muvaffaqiyatli; oldingi chunk/mixed-import/Browserslist warninglari bloklamaydi.
- `npm run security:check` — 9 build/Netlify fayli va yangi source boundary gate muvaffaqiyatli.
- `npm run audit:production` — exception'dan tashqari high/critical advisory 0; GHSA-qwww vaqtinchalik metadata exceptioni 2026-08-21gacha.

### Keyingi qadam

O'zgarishlarni commit/push qilish, GitHub CI va Netlify deployni tekshirish, production bundle haqiqatan `sb_publishable_...` ishlatayotganini credentialni chiqarmasdan tasdiqlash, so'ng Auth/Realtime smoke-test o'tkazish. Faqat shundan keyin legacy frontend env/fallbackni olib tashlash mumkin.

### Fayllar

- `.github/workflows/ci.yml`
- `frontend/.env.example`, `frontend/src/env.d.ts`
- `frontend/src/app/config.ts`, `frontend/src/shared/lib/supabase.ts`
- `frontend/src/features/hr/candidates/api/candidatesApi.ts`
- `frontend/scripts/security-check.mjs`
- `frontend/src/app/__tests__/config.test.ts`
- `frontend/src/features/hr/__tests__/candidatesApi.test.ts`
- `frontend/src/utils/supabase/info.tsx` (olib tashlandi)
- `docs/{STATUS,PLAN,DEVLOG,CLAUDE,DEPLOY_SETUP,CONNECTIONS}.md` va tarjimalari

---

## 2026-08-07 — P0 commitlari push qilindi va yangi CI green

- Lokal `55ec941`, `a088fef` va `06b5756` commitlari `origin/main`ga push qilindi (`730b3bd..06b5756`).
- GitHub Actions `CI` run `31188866507` commit `06b5756` uchun 42 soniyada `success` yakunlandi.
- `frontend-security-gate`ning barcha qadamlari o'tdi: checkout, Node setup, clean install, typecheck, unit testlar, production dependency audit, production build va bundle/hosting security check.
- Shu bilan P0 lokal va remote baseline yakunlandi. Keyingi faol ish: React Router metadata exception muddatini kuzatish, so'ng publishable-key contract va Supabase/RLS authorization auditi.

---

## 2026-08-07 — GitHub CLI autentifikatsiyasi va remote CI tasdiqlandi

- `gh auth login --web` orqali `sherzot` akkaunti uchun GitHub CLI autentifikatsiyasi keyring'da muvaffaqiyatli tiklandi; token qiymati hujjat yoki logga yozilmadi.
- `gh auth status` HTTPS protocol va kerakli repository/workflow scope'lari bilan login faol ekanini tasdiqladi.
- Remote `CI` workflow active. `main`dagi oxirgi remote commit `730b3bd` uchun run `30099108015` `success` holatida yakunlangan.
- Lokal `55ec941` va `a088fef` commitlari hali push qilinmagan; shu sabab yangi dependency audit gate uchun remote CI run hali mavjud emas.
- Keyingi qadam: pushni alohida tasdiqlash, so'ng yangi run'ni green holatigacha kuzatish.

---

## 2026-08-07 — P0 lokal baseline va dependency audit mustahkamlandi

### Kontekst

2026-07-24 dagi runtime holatini qayta tasdiqlash, hujjat tartibini alohida commit qilish va keyingi xavfsizlik ishlariga ishonchli baseline bilan kirish kerak edi. Dastlabki shell Node.js 21.4.0 bilan ishlayotgani aniqlandi; loyiha CI esa Node.js 22 ni kutadi. Shu tekshiruv vaqtida npm advisory metadata va React Router upstream advisory orasida ham tafovut topildi.

### Bajarildi

- Hujjatlar va doimiy session lifecycle o'zgarishlari `55ec941` (`docs: establish project status and session workflow`) lokal commitiga jamlandi; commit hali remote'ga push qilinmadi.
- Frontend runtime'i Node.js 22 ga `frontend/.nvmrc` va `package.json` `engines` orqali pin qilindi.
- `react-router-dom` va uning `react-router` dependency'si `7.18.2` ga yangilandi. React Router'ning upstream advisory'si bu versiyani v7 liniyasi uchun patched deb ko'rsatadi.
- npm/global advisory metadata hali eski range'ni qaytargani sabab CI uchun tor doiradagi `audit:production` gate yozildi. U audit network/API/JSON xatolarida va barcha boshqa high/critical advisory'larda fail qiladi; yagona vaqtinchalik metadata exception exact `react-router@7.18.2`ga bog'langan va 2026-08-21 da avtomatik eskiradi.
- GitHub Actions production audit qadami yangi scoped gate'ga o'tkazildi.

### Verifikatsiya

- Node.js `22.18.0`, npm `11.5.2` ostida `npm ci` — muvaffaqiyatli.
- `npm run typecheck` — muvaffaqiyatli.
- `npm run test:run` — 19/19 test fayli, 96/96 test muvaffaqiyatli.
- `npm run audit:production` — 0 ta exception'dan tashqari high/critical advisory; vaqtinchalik metadata exception aniq ko'rsatildi.
- Audit endpoint mavjud bo'lmagan holat alohida sinovda gate'ni fail qildi; registry access tiklanganda audit muvaffaqiyatli o'tdi.
- Raw `npm audit --omit=dev --audit-level=high` hali stale global metadata sabab 2 ta high natija ko'rsatadi; bu cheklov yashirilmaydi va 2026-08-21 gacha qayta ko'rib chiqiladi.
- `npm run build` — muvaffaqiyatli. Oldingi bloklamaydigan warninglar saqlanadi: katta main chunk, `supabase.ts` mixed import va eski Browserslist data.
- `npm run security:check` — 9 ta build/Netlify fayli tekshirildi, muvaffaqiyatli.
- Production smoke-test: `bright-api` health — `200`; auth'siz tenant-protected endpoint — `401 TENANT_REQUIRED`.
- Remote GitHub Actions holatini tekshirish bloklandi: lokal `gh` tokeni yaroqsiz. `gh auth login -h github.com` bajarilgach remote run tekshiriladi.

### Keyingi aniq qadamlar

1. GitHub CLI autentifikatsiyasini tiklash va remote Actions run'ni tekshirish.
2. Lokal commitlarni push qilish qarorini alohida tasdiqlash.
3. 2026-08-21 gacha React Router metadata exception'ini qayta tekshirish va imkon bo'lsa olib tashlash.
4. `sb_publishable_...` frontend contract, browser Supabase boundary va RLS/grant/tenant isolation auditiga o'tish.

### Fayllar

- `.github/workflows/ci.yml`
- `frontend/.nvmrc`
- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/scripts/audit-production.mjs`
- `docs/{STATUS,PLAN,DEVLOG}.md` va uchta tarjima to'plami

---

## 2026-08-07 — Har bir agent sessiyasi uchun majburiy hujjat lifecycle

### Kontekst

Sessiya yakuni protokoli `docs/README.md`da, DEVLOG qoidasi esa `docs/CLAUDE.md`da bor edi, lekin yangi Codex/agent sessiyasi bu hujjatlarni ish boshlashdan oldin o'qishini repo darajasida majburlovchi ko'rsatma yo'q edi.

### Bajarildi

- Repo ildizida `AGENTS.md` yaratildi; u har agent sessiyasiga tatbiq qilinadi.
- Majburiy startup tartibi yozildi: `README → STATUS → DEVLOG top entry → PLAN → git status`.
- Material o'zgarish uchun majburiy closeout yozildi: yangi DEVLOG entry, STATUS/PLAN update, kerak bo'lsa REQUIREMENTS/ROADMAP/ARCHITECTURE va 4 til sinxronizatsiyasi.
- Read-only savol bilan material repo o'zgarishi ajratildi; faqat o'qish uchun keraksiz DEVLOG yozish taqiqlandi.
- Secret/private data'ni hujjat yoki logga yozmaslik va documentation closeout tugamasa taskni “to'liq tugadi” demaslik qotirildi.
- `docs/README.md`dan `AGENTS.md`ga link qo'shildi; `CLAUDE.md`ning 4 til nusxasiga bir xil session lifecycle kiritildi.

### Verifikatsiya

- O'zgarishlar faqat agent/documentation qoidalariga tegishli; application runtime o'zgarmadi.
- `git diff --check` — muvaffaqiyatli.
- Barcha lokal Markdown linklari mavjud targetlarga yechildi.

### Fayllar

- `AGENTS.md` (yangi)
- `docs/README.md`
- `docs/{CLAUDE,English/CLAUDE,Russian/CLAUDE,日本語/CLAUDE}.md`
- `docs/{DEVLOG,English/DEVLOG,Russian/DEVLOG,日本語/DEVLOG}.md`

---

## 2026-08-07 — Hujjatlar source-of-truth tizimiga keltirildi

### Kontekst

`DEVLOG.md` eng to'liq tarixiy manba bo'lib qolgan, ammo `PLAN`, `ROADMAP`, `REQUIREMENTS` va `ARCHITECTURE`da eski checkboxlar hamda bir-biriga zid statuslar bor edi. Xususan, AI Hujjatchining birinchi slice'i bajarilgan bo'lsa ham “keyingi vazifa” deb turardi; HR Candidate esa arxitekturada etalon deb yozilgan, real kodda esa skeleton va `501 NOT_IMPLEMENTED` edi.

### Bajarildi

- `docs/README.md` — hujjatlar xaritasi, source-of-truth ustuvorligi va sessiya yakuni protokoli yaratildi.
- `docs/STATUS.md` — joriy phase, oxirgi tasdiqlangan texnik snapshot, capability holatlari, bloklar va next actionlar uchun canonical handoff yaratildi.
- Eski katta `PLAN.md` 2026-07-24 holatida `docs/archive/`ga saqlandi; yangi `PLAN.md` faqat faol P0/P1/P2 ishlarni saqlaydi.
- `ROADMAP.md` Phase 2 ning bajarilgan va qolgan qismlariga ajratildi.
- `REQUIREMENTS.md` `Done`, `Partial`, `Skeleton`, `Planned` statuslari bilan yangilandi va R-021 AI Hujjatchi binary output talabi qo'shildi.
- `ARCHITECTURE.md`da HR Candidate production-ready etalon emas, TODO/stublari bor target modular scaffold ekani aniqlandi.
- Phase 0 `FIRST_PUSH.md` tarixiy deb, integratsiya/setup fayllari esa joriy status bannerlari bilan belgilandi.
- `STATUS`, `PLAN`, `ROADMAP` va `REQUIREMENTS`ning English, Russian va Japanese nusxalari sinxronlandi.

### Verifikatsiya chegarasi

- Bu sessiyada faqat Markdown hujjatlari o'zgardi; application kodi, DB, Edge Function va hosting konfiguratsiyasi o'zgarmadi.
- Production, GitHub Actions, test va build qayta ishlatilmadi. `STATUS.md` runtime snapshoti 2026-07-24 dagi oxirgi tasdiqlangan DEVLOG dalillariga tayangan va bu cheklovni ochiq ko'rsatadi.

### Fayllar

- `docs/{README,STATUS,DEVLOG,PLAN,ROADMAP,REQUIREMENTS,ARCHITECTURE}.md`
- `docs/{CLAUDE,English/CLAUDE,Russian/CLAUDE,日本語/CLAUDE}.md`
- `docs/{English,Russian,日本語}/{STATUS,DEVLOG,PLAN,ROADMAP,REQUIREMENTS,ARCHITECTURE}.md`
- `docs/archive/**/PLAN_LEGACY_2026-07-24.md`
- `docs/{FIRST_PUSH,DEPLOY_SETUP,CONNECTIONS,R001_EMAIL_SETUP,R002_REALTIME_SETUP,R015_TASK_NOTIFICATIONS,HR_CANDIDATE_ANALYSIS}.md`

---

## 2026-07-24 — Sessiya yakuni va ertangi aniq handoff

### Bugun yakunlangan holat
- Shablonlar kutubxonasi va unga bog'liq mayda UI matnlari `uz`, `ru`, `en`, `ja` tillariga o'tkazildi; productiondagi 15 ta aktiv hujjat shabloni 4 tilda to'ldirildi.
- Light/dark theme yagona `next-themes` holatiga o'tkazildi; theme almashganda yo'qoladigan matnlar, fon, border va placeholder kontrastlari tuzatildi.
- Code review topilmalari yopildi: locale race condition, eski modal holati, klaviatura fokusi, icon-only tugmalar `aria-label`lari, admin/auth/xodim sahifalaridagi qolgan hardcoded matnlar.
- Netlify va Supabase xavfsizlik chegaralari mustahkamlandi: CSP, HSTS, cache, preview protection, PWA authenticated-response cache, CORS, DB-backed rate limit, RPC grantlari va `SECURITY DEFINER` helperlar.
- Egalik qilinmaydigan `aibizconcierge.uz` barcha runtime konfiguratsiyalaridan olib tashlandi. Bu domen sotib olinmagan va loyiha domeni deb hisoblanmaydi.
- Production migration qo'llandi va `bright-api` v72 deploy qilindi; health smoke-test `200`.
- Dependency audit tozalandi; production dependency auditda 0 ta zaiflik qoldi.
- Security CI gate yaratildi: type-check, unit test, production audit, build va bundle/hosting security check.

Tegishli commitlar:
- `0931e50` — 4 til shablonlari va theme support.
- `625231d` — code review locale/theme/accessibility tuzatishlari.
- `db6588a` — Netlify/Supabase security hardening va CI security gate.
- `730b3bd` — clean GitHub runner uchun public test konfiguratsiyasi va Node action yangilanishlari.

### CI xatosi va tuzatishi

GitHub Actions'dagi `frontend-security-gate` avval clean runnerda quyidagi sabab bilan yiqildi:

```text
VITE_SUPABASE_PROJECT_ID va VITE_SUPABASE_ANON_KEY sozlanmagan
```

Bu production secret muammosi emas edi. `config.ts` import vaqtida public Supabase konfiguratsiyasini talab qilgan, testlar esa networkni mock qilsa ham clean CI environmentda bu public qiymatlar mavjud emas edi.

Tuzatish:
- `.github/workflows/ci.yml` job environmentiga faqat test uchun mo'ljallangan, non-production public placeholderlar qo'shildi.
- `actions/checkout@v4` -> `actions/checkout@v5`.
- `actions/setup-node@v4` -> `actions/setup-node@v6`.
- Node.js `22` saqlandi; GitHub'ning Node 20 action runtime warningi bartaraf qilindi.
- `useTasks` boshlang'ich loading testi tugamaydigan mocked promise bilan deterministik qilindi va hook unmount qilindi.

2026-07-24 sessiya oxiridagi local CI-equivalent natija:
- `npm run typecheck` — muvaffaqiyatli.
- `npm run test:run` — 19/19 test fayli, 96/96 test muvaffaqiyatli.
- `npm run build` — muvaffaqiyatli.
- `npm run security:check` — 9 ta build/Netlify fayli tekshirildi, muvaffaqiyatli.
- Git holati tekshiruvdan oldin clean; `HEAD` va `origin/main` bir xil: `730b3bd`.
- Ertaga ishni boshlashdan oldin remote GitHub Actions run ham green ekanini birinchi bo'lib tekshirish kerak.

Builddagi bloklamaydigan warninglar:
- asosiy JS chunk taxminan 1.76 MB; keyinchalik route/module code splitting kerak;
- `supabase.ts` ham statik, ham dinamik import qilinadi, shuning uchun alohida chunkka ajralmaydi;
- Browserslist bazasi eskirgan.

---

## 2026-07-24 — Ertangi asosiy arxitektura: Netlify faqat frontend, Supabase backend platformasi

### Qabul qilingan yo'nalish

Netlify'da faqat React/Vite statik frontend qoladi. Auth, PostgreSQL DB, backend API, Realtime, kelajakdagi Storage, RLS va data authorization Supabase'da bo'ladi.

```text
Internet
   |
   v
Netlify CDN
   `-- React/Vite statik frontend
          |
          |-- Supabase Auth + Realtime
          |      public URL + publishable key + user JWT
          |
          `-- Supabase Edge Function: bright-api
                  |-- JWT/session tekshiruvi
                  |-- tenant/role/permission tekshiruvi
                  |-- PostgreSQL operatsiyalari
                  |-- private Storage/signed URL
                  |-- AI, Telegram va email integratsiyalari
                  |-- rate limit va audit log
                  `-- server-only secretlar
```

Netlify "faqat frontend" bo'lsa ham quyidagi browser/delivery himoyalari Netlify'da qoladi:
- HTTPS va CDN/DDoS qatlami;
- CSP, HSTS, MIME/frame/referrer va Permissions Policy;
- statik asset cache siyosati;
- Deploy Preview uchun `noindex`, `no-store` va access protection.

Data va biznes xavfsizligining asosiy qismi Supabase'da bo'ladi:
- Supabase Auth va session;
- RLS, table/function grantlari va tenant izolyatsiyasi;
- Edge Function authorization;
- private Storage bucket va Storage Policy;
- server secretlari;
- rate limit, audit log va backend input validation.

### Public konfiguratsiya va haqiqiy secret farqi

Frontendda ko'rinishi normal va xavfsizlik hodisasi hisoblanmaydigan qiymatlar:

```text
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_API_BASE_URL=https://<project-ref>.supabase.co/functions/v1/bright-api/...
```

Supabase project/API URL raw database URL emas. Browser ishlatadigan endpoint baribir Network panelda ko'rinadi. Uni "yashirish" xavfsizlik bermaydi.

Frontendga hech qachon chiqmasligi kerak:

```text
postgresql://... database connection string
DATABASE_URL
POSTGRES_PASSWORD
SUPABASE_SERVICE_ROLE_KEY / SB_SERVICE_ROLE_KEY
sb_secret_...
OPENAI_API_KEY
ANTHROPIC_API_KEY
TELEGRAM_BOT_TOKEN
RESEND_API_KEY
Stripe/payment secretlari
webhook signing secretlari
```

Bu qiymatlar faqat Supabase Project Secrets/Edge Function environmentida saqlanadi. `service_role` yoki `sb_secret_...` RLS'ni chetlab o'tishi mumkin, shuning uchun ularning browser bundle, Git, Netlify public environment yoki logga chiqishi critical incident hisoblanadi.

### Nega browser Supabase Auth va Realtime bilan bevosita ishlashda qoladi

Hozirgi frontendda Supabase browser client faqat quyidagi vazifalarda ishlatiladi:
- `AuthContext.tsx` — session, login, logout va auth state;
- `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`, `SetupAccountPage.tsx`, `PasswordChangeForm.tsx` — Auth operatsiyalari;
- `useRealtimeInbox.ts`, `useRealtimeTasks.ts`, `useRealtimeNotifications.ts` — Realtime subscriptionlar;
- `apiClient.ts` va `candidatesApi.ts` — user access tokenni olib `bright-api`ga yuborish.

Frontend kodida hozir to'g'ridan-to'g'ri `supabase.from(...)`, `supabase.rpc(...)` yoki `supabase.storage...` business-data chaqiruvi topilmadi. Asosiy CRUD va biznes operatsiyalari allaqachon `bright-api` orqali o'tadi.

Shuning uchun tavsiya qilingan xavfsiz va kam-riskli variant:
- Auth va Realtime browser -> Supabase bevosita;
- barcha biznes/admin/AI/Telegram/email operatsiyalari browser -> `bright-api`;
- DB va Storage authorization RLS/policy bilan;
- jiddiy kalitlar faqat Edge Functionda.

Supabase URL va publishable key'ni ham browserdan butunlay olib tashlash uchun to'liq BFF/cookie proxy yozish mumkin, lekin bu hozir tavsiya qilinmaydi. U Auth refresh, OAuth/reset callback, `HttpOnly` cookie, CSRF, CORS va Realtime relayni qayta yozishni talab qiladi; murakkablik oshadi, lekin public endpointni baribir yashirmaydi.

### Hozirgi backend holati
- Canonical backend: `supabase/functions/server/`, production function nomi `bright-api`.
- Frontend API client barcha authenticated requestlarga Supabase access token qo'shadi.
- Backend user tokenini tekshiradi va tenant/role kontekstini DB orqali aniqlaydi.
- Service-role client faqat Edge Function ichida yaratiladi.
- OpenAI, Anthropic, Telegram va boshqa jiddiy secretlar frontendda emas.
- Storage uchun frontend yoki backendda faol upload/download integratsiyasi hozir topilmadi; Storage qo'shilganda boshidan private bucket + policy + signed URL modeli ishlatiladi.

### Ertaga bajarish tartibi

#### 1. Boshlang'ich holatni tasdiqlash
1. `git status`, `git log` va GitHub Actions `frontend-security-gate` natijasini tekshirish.
2. `npm ci`, type-check, 96 test, production build va security check bilan baseline olish.
3. Supabase production project, `bright-api` health va authsiz protected endpoint `401` holatini smoke-test qilish.
4. Hech qanday secret qiymatini terminal output, DEVLOG yoki commitga chiqarmaslik.

#### 2. Frontend environment kontraktini yangilash
1. Supabase Dashboard'da zamonaviy `sb_publishable_...` key mavjudligini tekshirish.
2. Legacy `VITE_SUPABASE_ANON_KEY`dan `VITE_SUPABASE_PUBLISHABLE_KEY`ga bosqichma-bosqich o'tish.
3. `frontend/src/app/config.ts`, `frontend/.env.example`, Vitest setup, CI placeholder va Netlify production/preview env nomlarini bir xil kontraktga keltirish.
4. Avval yangi key bilan production ishlashini tekshirish; faqat shundan keyin legacy anon keyni revoke/rotate qilish.
5. `DATABASE_URL`, service role yoki boshqa server secret uchun hech qanday `VITE_*` o'zgaruvchi yaratmaslik.

#### 3. Browser-to-Supabase auditini qotirish
1. Frontendda `supabase.from`, `rpc`, `storage`, `functions.invoke` va tashqi secret API chaqiruvlarini qayta qidirish.
2. Auth/Realtimedan boshqa barcha operatsiyalarni `apiClient -> bright-api` chegarasida saqlash.
3. Direct browser DB chaqiruvi keyinchalik qo'shilmasligi uchun security script/testga regressiya qoidasi qo'shishni baholash.
4. Auth va Realtime uchun faqat publishable key ishlatilishini test qilish.

#### 4. Supabase DB va authorization auditi
1. Browserga ta'sir qilishi mumkin bo'lgan barcha `public` table/view/functionlar uchun RLS va grantlarni inventarizatsiya qilish.
2. `anon` va `authenticated`ga keraksiz table/function execute/select huquqlarini revoke qilish.
3. Har tenant jadvalida cross-tenant SELECT/INSERT/UPDATE/DELETE rad etilishini test qilish.
4. `SECURITY DEFINER` funksiyalarda fixed `search_path`, minimal EXECUTE grant va ichki authorization borligini tekshirish.
5. Backend-only obyektlarni `private` schema'ga ko'chirishdan oldin `bright-api`ning PostgREST/service-role access modeliga ta'sirini aniqlash; ko'r-ko'rona schema ko'chirmaslik.
6. Service-role bilan bajariladigan har bir user action oldidan JWT, membership va permission tekshiruvi borligini tasdiqlash.

#### 5. Storage modeli
1. Kerakli bucketlar va fayl path kontraktini aniqlash: masalan, `<tenant_id>/<user_id>/<resource_id>/<filename>`.
2. Bucketlarni default private qilish.
3. Upload/download/delete uchun tenant va userga bog'langan Storage RLS policy yozish.
4. Private download uchun qisqa muddatli signed URL yoki authenticated Edge Function response ishlatish.
5. File type, extension, MIME, size va nom sanitizatsiyasini backendda tekshirish.
6. Storage hali ishlatilmasa, bo'sh infratuzilma yaratib qo'ymasdan, birinchi real feature bilan migratsiya qilish.

#### 6. Backend va network security
1. `bright-api`da Authorization Bearer tokenni server-side `getUser` bilan tekshirish.
2. Har endpoint uchun role/tenant/ownership tekshiruvini qotirish.
3. CORS allowlistga faqat real production origin va boshqariladigan preview/staging originlarini qo'shish.
4. Authenticated/private response uchun `Cache-Control: no-store`.
5. AI, login/reset, upload, webhook va admin endpointlar uchun alohida rate-limit/quota siyosati.
6. Audit loglarda token, cookie, password, raw PII va secretlarni yozmaslik.
7. Preview environmentni production DB/secretlardan ajratish; buning uchun alohida staging Supabase kerakmi, ertaga mavjud Netlify/Supabase resurslari bo'yicha aniqlash.

#### 7. Yakuniy verifikatsiya va deploy
1. Source va `dist/` ichida secret nomlari/qiymatlari yo'qligini security gate bilan tekshirish.
2. `npm run typecheck`.
3. `npm run test:run`.
4. `npm audit --omit=dev --audit-level=high`.
5. `npm run build`.
6. `npm run security:check`.
7. Auth login/logout/reset, 4 til, light/dark theme, template generate va Realtime smoke-test.
8. Authsiz request `401`, noto'g'ri role `403`, boshqa tenant ma'lumoti ko'rinmasligi va private Storage access rad etilishini test qilish.
9. Migrationlarni avval dry-run/audit qilish, keyin productionga qo'llash.
10. `bright-api`ni deploy qilish, health/auth smoke-test, undan keyin frontendni Netlify'ga deploy qilish.
11. Natijalar, migration nomlari, function version va test sonlarini DEVLOG'ga yozish.

### Ertangi yakuniy qabul mezonlari
- Netlify faqat statik frontend va browser-delivery security vazifasini bajaradi.
- Browser bundle ichida faqat Supabase public URL, publishable key va public API base URL mavjud.
- Raw PostgreSQL URL/password, `service_role`, `sb_secret`, AI/Telegram/email/payment secretlari source, bundle, log va Netlify public envda yo'q.
- Auth va Realtime ishlaydi; biznes operatsiyalari faqat `bright-api` orqali o'tadi.
- Barcha exposed data RLS/grant bilan himoyalangan va cross-tenant testlar o'tadi.
- Storage ishlatilsa, private bucket va signed/authenticated access bilan ishlaydi.
- Production va preview environmentlari production secret/data bo'yicha aralashmaydi.
- GitHub Actions security gate green.
- Production health `200`, protected endpoint authsiz `401`, unauthorized role uchun `403`.
- 4 til va light/dark theme regressiyasiz ishlaydi.

### Hali qo'lda yoki ehtiyotkorlik bilan bajariladigan platforma ishlari
- Supabase Dashboard'da Leaked Password Protection'ni yoqish.
- Netlify Personal plan sabab non-production Team Login `422`; plan imkoniyatiga qarab password/SSO yoki boshqa preview protection tanlash.
- `vector` extensionini `public`dan ko'chirishni alohida migration sifatida rejalash.
- `TELEGRAM_WEBHOOK_SECRET` real qiymati mavjudligini tekshirish; yo'q bo'lsa webhook 503 holati davom etadi.
- Production key rotation yoki revoke faqat yangi konfiguratsiya deploy va smoke-testdan keyin amalga oshiriladi.

---

## 2026-07-24 — Netlify + Supabase security hardening

### Bajarildi
- Netlify CSP'dan `script-src 'unsafe-inline'` olib tashlandi; print oynasidagi inline script xavfsiz JS callback bilan almashtirildi
- HSTS, Permissions Policy, COOP/CORP, MIME/frame/referrer himoyasi va asset/PWA cache siyosatlari kuchaytirildi
- Authenticated API javoblarini PWA cache'iga yozish to'xtatildi; preview buildlar `noindex` va `no-store` header oladi
- Egalik qilinmaydigan `aibizconcierge.uz` runtime CORS/CSP/canonical va email fallbacklaridan olib tashlandi
- AI rate limit Edge xotirasidan atomik PostgreSQL `check_rate_limit()` ga ko'chirildi; IP/user kalitlari SHA-256 bilan xeshlanadi
- Internal `SECURITY DEFINER` RPC va trigger helperlar `anon`/`authenticated` uchun yopildi, `search_path` qotirildi
- Production migration qo'llandi va `bright-api` v72 deploy qilindi; health smoke-test `200`
- React Router, Vite, Vitest va transitive dependencylar yangilandi; to'liq `npm audit` — 0 zaiflik
- CI ga type-check, 96 unit test, production audit, build va bundle/security gate qo'shildi
- Eski `frontend/dist.zip` o'chirildi va `*.zip` ignore qilindi

### Platformada qo'lda qolgan ishlar
- Netlify Personal rejasida non-production Team Login API `422` qaytardi
- Supabase'da Leaked Password Protection'ni Dashboard orqali yoqish kerak
- `vector` extensionini `public` sxemadan ko'chirish alohida, ehtiyotkor migratsiya talab qiladi

---

## 2026-07-24 — Loyihani davom ettirish auditi va testlar tiklandi

### Kontekst
Hujjatlar, git tarixi va joriy kod solishtirildi. `DEVLOG.md` 2026-06-04 da tugagan, koddagi oxirgi commit esa 2026-06-12 bo'lgan.

### Bajarildi
- Landing testlarida `LandingNavbar` va `HeroSection` ishlatadigan auth kontekst mock qilindi
- `npm run test:run`: 16/16 test fayli, 89/89 test muvaffaqiyatli
- `npm run build`: production build muvaffaqiyatli
- Phase 1.5 yakunlangani, Phase 2 landing qismi boshlanganligi va HR Candidate Analysis hali 501 skeleton ekanligi tasdiqlandi
- Production Supabase `ACTIVE_HEALTHY`; Anthropic/OpenAI/Resend secretlari mavjudligi tasdiqlandi
- `TELEGRAM_WEBHOOK_SECRET` yo'qligi va Telegram POST webhook shu sabab 503 qaytarishi aniqlandi
- Frontend API fallback ishlamaydigan `server/...` URLdan canonical `bright-api/...` URLga tuzatildi
- Phase 2 AI Hujjatchi birinchi slice: 15 shablon seed migration, template/generate API, dinamik frontend forma va oylik usage limit
- Migration drift xavfsiz tekislandi: lokal `h003`/`m002` fayl timestamplari production tarixiga moslandi
- Production Supabase'ga `h005_match_knowledge_tenant` va 15 shablon seed migration deploy qilindi
- `bright-api` v69 deploy qilindi; health smoke-test `200`, himoyalangan template endpoint authsiz `401`
- Yakuniy tekshiruv: 17/17 test fayli, 92/92 test va production build muvaffaqiyatli

### Fayllar
- `frontend/src/features/landing/__tests__/LandingPage.test.tsx`
- `frontend/src/features/docs/`
- `frontend/src/app/config.ts`
- `supabase/functions/server/services/document-generator.ts`
- `supabase/migrations/20260724051655_seed_phase2_document_templates.sql`
- `docs/{DEVLOG,PLAN,ROADMAP,REQUIREMENTS}.md` va tarjimalari

---

## 2026-06-12 — Frontend UI, layout va theme polishing

### Kontekst
Light/Clean SaaS migratsiyasidan keyin landing, auth, admin va kompaniya dashboardlarida vizual izchillik yaxshilandi. Bu ish `2ae377a` commitida bajarilgan, lekin DEVLOG ga kiritilmagan edi.

### Bajarildi
- Landing sectionlari va umumiy theme tokenlari yangilandi
- Admin/kompaniya layoutlari, sidebar/topbar va dashboard sahifalari yaxshilandi
- Login va protected route komponentlaridagi UI/yo'naltirish holatlari takomillashtirildi

### Fayllar
- `frontend/src/features/landing/`
- `frontend/src/features/admin/components/AdminLayout.tsx`
- `frontend/src/features/reports/`
- `frontend/src/features/auth/`
- `frontend/src/styles/theme-indigo-slate.css`

---

## 2026-06-04 — Light Theme migratsiyasi yakunlandi — push & deploy

### Kontekst
Oldingi sessiyada Light/Clean SaaS theme o'tishi boshlangan edi, lekin grep tekshiruvi `text-white`, `bg-slate-700/800/900` qoldiqlarini topdi: AdminDashboardPage, AdminKnowledgeBasePage, AdminRiskPage, AdminCompaniesPage, AdminContactsPage.

### Bajarildi
- `AdminDashboardPage.tsx`: To'liq qayta yozildi — StatCard `text-white` → `text-slate-900`, `text-slate-300` → `text-slate-600`, trend ranglari `text-emerald-400` → `text-emerald-600`, SEV_CONFIG badge'lar `/10 opacity` → to'liq rang (`bg-red-100 text-red-700`), SecurityPosture/AiStatsPanel icon container `bg-*-500/15` → `bg-*-100`, QuickLink dark: variant'lar olib tashlandi, Yangilash tugmasi `bg-slate-700` → `bg-white border`, DB banner `text-emerald-300` → `text-emerald-700`, skeleton `bg-slate-200` ranglar
- `AdminKnowledgeBasePage.tsx`: Maqola category va tag badge'lari `bg-slate-700 text-slate-300` → `bg-slate-100 text-slate-600`, question matni `text-white` → `text-slate-900`, delete modal `bg-slate-900` → `bg-white`, h3 `text-white` → `text-slate-900`
- `AdminRiskPage.tsx`: Empty state h2 `text-white` → `text-slate-900`, scanning matni `text-white` → `text-slate-900`, "Topilma yo'q" `text-white` → `text-slate-900`, status filter aktiv tugmasi `bg-slate-700` → `bg-indigo-600`
- `AdminCompaniesPage.tsx`: h1 `text-white` → `text-slate-900`, stat card count `text-white` → `text-slate-900`, filter tabs `bg-slate-800` → `bg-white`, search input `bg-slate-800 text-white` → `bg-white text-slate-900`, skeleton `bg-slate-700` → `bg-slate-200`, company name `text-white` → `text-slate-900`, legal form badge `bg-slate-700` → `bg-slate-100`, block modal `bg-slate-800` → `bg-white`, Yangilash tugmasi `bg-slate-700` → `bg-white border`
- `AdminContactsPage.tsx`: h1 `text-white` → `text-slate-900`, filter tabs/search/skeleton/contact name — xuddi shunday tuzatmalar
- Build tekshiruvi: `✓ built in 3.14s` — hech qanday xato yo'q
- Git push va Netlify deploy ishga tushirildi

### Fayllar
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (to'liq qayta yozildi)
- `frontend/src/features/admin/pages/AdminKnowledgeBasePage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminRiskPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminContactsPage.tsx` (o'zgargan)

---

## 2026-06-04 — Light/Clean Modern SaaS theme ga to'liq o'tish

### Kontekst
Ilgari `forcedTheme="dark"` bilan barcha sahifalar qoʻlda yozilgan qora ranglar bilan ishlangan edi. Foydalanuvchi butun loyihani zamonaviy Light/Clean SaaS koʻrinishga (Notion, Linear, Vercel uslubi) oʻtkazishni soʻradi.

### Bajarildi
- `AppProviders.tsx`: `forcedTheme="dark"` → `forcedTheme="light"` — barcha dark: Tailwind classlar avtomatik o'chadi
- `LoginPage.tsx`: Toʻliq qayta yozildi — oq fon, chap tomonda indigo gradient branding paneli (Notion/Linear uslubi), oq forma kartasi
- `ForgotPasswordPage.tsx`: Toʻliq qayta yozildi — `bg-slate-50` fon, oq karta, light input fieldlar
- `ResetPasswordPage.tsx`: Toʻliq qayta yozildi — bir xil light design pattern
- `SetupAccountPage.tsx`: Tashqi fon `bg-gradient dark` → `bg-slate-50`, LocaleSelect `variant="dark"` → `variant="light"`
- `AdminHealthPage.tsx`: Qora komponentlar (`bg-slate-800/50`, `border-white/8`, `text-white`) → oq komponentlar (`bg-white`, `border-slate-200`, `text-slate-900`, `shadow-sm`)
- `AdminAIChatPage.tsx`: Chat hududi, pufakchalar, inputlar — barchasi light mode ranglariga o'zgartirildi
- `AdminAuditPage.tsx`: Action badge ranglari (`text-emerald-300` → `text-emerald-700`), inputlar `bg-white`, payload hududi `bg-slate-100`
- `AdminRiskPage.tsx`: ScoreRing SVG `stroke="#1e293b"` → `stroke="#e2e8f0"`, `text-white` → `text-slate-900`, filter tugmalari `bg-slate-900` → `bg-slate-100`
- `AdminKnowledgeBasePage.tsx`: Barcha input/select `bg-slate-800 text-white` → `bg-white text-slate-900`, modal `bg-slate-900` → `bg-white`
- `AdminDashboardPage.tsx`: SVG hardcoded ranglar — track stroke `#1e293b`/`#334155` → `#e2e8f0`, center fill `#0f172a` → `white`, text `fill="white"` → `fill="#0f172a"`, boʻsh barlar `#1e293b` → `#e2e8f0`

### Fayllar
- `frontend/src/app/providers/AppProviders.tsx` (o'zgargan)
- `frontend/src/features/auth/pages/LoginPage.tsx` (toʻliq qayta yozildi)
- `frontend/src/features/auth/pages/ForgotPasswordPage.tsx` (toʻliq qayta yozildi)
- `frontend/src/features/auth/pages/ResetPasswordPage.tsx` (toʻliq qayta yozildi)
- `frontend/src/features/auth/pages/SetupAccountPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminHealthPage.tsx` (toʻliq qayta yozildi)
- `frontend/src/features/admin/pages/AdminAIChatPage.tsx` (toʻliq qayta yozildi)
- `frontend/src/features/admin/pages/AdminAuditPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminRiskPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminKnowledgeBasePage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (SVG ranglar o'zgargan)

## 2026-06-04 — Dark Mode Text Ranglari va LatencyGauge Tuzatish

### Kontekst
Dark mode da ba'zi admin sahifalarida `text-slate-900` (qora) yozuvlar ko'rinmasdi — `dark:` variantlari yo'q edi. `LatencyGauge` (DB kechikish) SVG arc'i `pct > 0.5` threshold da sakrab ketardi — 280° arc uchun to'g'ri threshold `180/280 = 9/14`.

### Bajarildi
- `AdminHealthPage.tsx` — barcha `bg-white`, `text-slate-900`, light banner'lar dark slate-800/white ranglar bilan almashtirildi
- `AdminAIChatPage.tsx` — sarlavha, message bubble'lar, input, suggestion tugmalar dark mode uchun tuzatildi
- `AdminDashboardPage.tsx` — `LatencyGauge` `largeArc` threshold: `pct > 0.5` → `pct > 9/14`
- `AdminKnowledgeBasePage`, `AdminAuditPage` — icon rang `text-slate-700` → `text-slate-500`

### Fayllar
- `frontend/src/features/admin/pages/AdminHealthPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminAIChatPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminKnowledgeBasePage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminAuditPage.tsx` (o'zgargan)

---

## 2026-06-04 — Dark Mode va Login Redirect Bug Fixes

### Kontekst
1. Admin panel va dashboard sahifalari ko'zni chalkashtiruvchi aralash rangda ko'rinardi — `dark:` Tailwind class'lari `.dark` parent element bo'lmasdan ishlamaydi. `ThemeProvider` umuman qo'shilmagan edi.
2. Super_admin tizimga kirgan holda LP ga kirib, u yerdan "Kirish" tugmasini bossanda `/admin` o'rniga `/app` ga o'tardi — navbar `/login` ga yuborardi, lekin `LoginPage` da `currentTenant` null bo'lishi mumkin.

### Bajarildi
- `AppProviders.tsx` — `next-themes` dan `ThemeProvider` qo'shildi (`attribute="class"`, `defaultTheme="dark"`) — `<html class="dark">` avtomatik o'rnatiladi, barcha `dark:` Tailwind class'lari to'g'ri ishlaydi
- `LandingNavbar.tsx` — "Kirish" tugmasi endi foydalanuvchi holati tekshiradi: login bo'lsa → `/admin` yoki `/app` ga, login bo'lmasa → `/login` ga
- `HeroSection.tsx` — xuddi shunday tuzatish

### Fayllar
- `frontend/src/app/providers/AppProviders.tsx` (o'zgargan)
- `frontend/src/features/landing/components/LandingNavbar.tsx` (o'zgargan)
- `frontend/src/features/landing/components/HeroSection.tsx` (o'zgargan)

---

## 2026-06-03 — Tasks Mock Data Bug Fix (PATCH 500 xatosi)

### Kontekst
`PATCH /tasks/t-2` → 500 xatosi. Tenant da haqiqiy task yo'q bo'lsa `GET /tasks` `getMockTasks()` qaytarardi — `t-1`, `t-2` kabi fake IDlar. User bu "task"larni update qilmoqchi bo'lganda UUID formatida bo'lmagan ID DB da type error berardi (500).

### Bajarildi
- `server/index.ts` — `getMockTasks()` funksiyasi o'chirildi; `GET /tasks` endi bo'sh array `[]` qaytaradi
- `bright-api` redeploy edildi (version 68)

### Fayllar
- `supabase/functions/server/index.ts` (o'zgargan)

---

## 2026-06-03 — Contact Form va Register Form Bug Fixes (ikki muammo)

### Kontekst
`/contact` sahifasida "Server error" (double `/v1` path bug) va `/register?token=...` sahifasida "Server error" (parol validatsiya + error format mismatch) muammolari tuzatildi. Ikkalasi production da test qilindi.

### Bajarildi

**Bug 1: `/contact` → "Server error" (oldingi session):**
- `ContactPage.tsx` — lokal `API_BASE = VITE_API_BASE_URL ?? ""` + `/v1/contact` → double `/v1/contact` yaratardi. `API_BASE_URL` (shared, to'liq URL) ga o'tkazildi
- `config.ts` — fallback URL `server` funksiyasi nomiga yangilandi
- `config.toml` — `[functions.server] verify_jwt = false` qo'shildi (JWT bloklash tuzatildi)
- `bright-api` redeploy — yangi kod deployed edildi

**Bug 2: `/register` → "Server error" (ushbu session):**
- **Root cause:** Backend `password.length < 12` tekshiruvi — 8-11 belgili parol kiritilsa 400 qaytarardi; lekin frontend `json?.error?.message` o'qirdi, backend `failure()` esa `json.meta.errors[0].message` formatida javob berardi → hamma xato "Server error" ko'rinardi
- `server/index.ts:4543` — `password.length < 12` → `< 8` tuzatildi
- `RegisterCompanyPage.tsx` — error format ikki xil formati qo'llab-quvvatlandi: `json?.error?.message ?? json?.meta?.errors?.[0]?.message`
- `RegisterCompanyPage.tsx` — parol inputiga `minLength={8}` qo'shildi
- `bright-api` redeploy edildi

**Invite email kelmayotganligi (hal qilinmagan):**
- Sabab: `RESEND_API_KEY` Supabase Secrets da o'rnatilmagan
- Kerakli harakat: `supabase secrets set RESEND_API_KEY=re_xxx` + Resend da `aibizconcierge.uz` domenini verify qilish

### Fayllar
- `frontend/src/features/landing/pages/ContactPage.tsx` (o'zgargan)
- `frontend/src/features/landing/pages/RegisterCompanyPage.tsx` (o'zgargan)
- `frontend/src/app/config.ts` (o'zgargan)
- `supabase/config.toml` (o'zgargan)
- `supabase/functions/server/index.ts` (o'zgargan)

---

## 2026-06-03 — Dark/Light Theme, Admin Sidebar Kengaytirish, Users va AI Stats sahifalari

### Kontekst
Barcha dashboardlarda (super_admin va kompaniya) to'liq qoʻng'ir/yorqin mavzu qoʻllab-quvvatlash; Admin sidebar yangi guruhlar bilan kengaytirildi; Super admin uchun barcha kompaniya foydalanuvchilarini ko'rish imkoniyati; yangi AI statistika sahifasi.

### Bajarildi

**Dark/light theme — barcha dashboardlar:**
- `AdminLayout.tsx` — to'liq qayta yozildi: yangi `NAV_GROUPS` guruhlangan navigatsiya tuzilmasi, to'liq `dark:` variantlari qo'shildi (sidebar, topbar, navlar, tooltip, avatar, logout)
- `App.tsx` — kompaniya dashboard sidebar, topbar, barcha havolalar va `NavItem` komponenti `dark:` variantlari bilan yangilandi
- `AdminDashboardPage.tsx`, `AdminContactsPage.tsx`, `AdminCompaniesPage.tsx`, `AdminHealthPage.tsx`, `AdminAuditPage.tsx`, `AdminRiskPage.tsx`, `AdminAIChatPage.tsx`, `AdminKnowledgeBasePage.tsx` — 8 ta admin sahifada ommaviy `dark:` variant almashtirish o'tkazildi

**Admin sidebar kengaytirish:**
- Navigatsiya guruhlarga bo'lindi: Asosiy, Boshqaruv, Monitoring, Kontent
- Yangi menular: **Foydalanuvchilar** (`/admin/users`), **AI Statistika** (`/admin/ai-stats`)
- `Globe` ikonasi "Asosiy sayt" uchun, `PanelLeftOpen/Close` collapse/expand uchun
- Collapsed holat tooltip-lari dark mode da to'g'ri ko'rsatiladi

**Yangi admin sahifalar:**
- `AdminUsersPage.tsx` — barcha platforma foydalanuvchilarini ko'rish: email, ism, kompaniya, rol (rangli badge), status, sana; rol filtrlari, qidiruv, paginatsiya
- `AdminAiStatsPage.tsx` — AI foydalanish tahlili: KPI kartalar, kunlik bar grafik, model taqsimoti (progress bar), top kompaniyalar; 7/14/30/60/90 kunlik davr tanlash

**Backend yangi endpoint:**
- `GET /admin/users` — barcha `user_tenants` + `profiles` + `tenants` join; faqat super_admin/sub_admin; 500 ta limit

**Router yangilanishi:**
- `router.tsx` — `/admin/users` → `AdminUsersPage`, `/admin/ai-stats` → `AdminAiStatsPage` qo'shildi

**API qatlami:**
- `adminApi.ts` — `AdminUser` turi va `getAdminUsers()` funksiyasi qo'shildi

### Fayllar
- `frontend/src/features/admin/components/AdminLayout.tsx` (o'zgargan — to'liq qayta yozildi)
- `frontend/src/App.tsx` (o'zgargan — dark mode + NavItem)
- `frontend/src/features/admin/pages/AdminUsersPage.tsx` (yangi)
- `frontend/src/features/admin/pages/AdminAiStatsPage.tsx` (yangi)
- `frontend/src/features/admin/api/adminApi.ts` (o'zgargan — AdminUser + getAdminUsers)
- `frontend/src/app/router.tsx` (o'zgargan — yangi admin routelar)
- `supabase/functions/server/index.ts` (o'zgargan — GET /admin/users)
- `frontend/src/features/admin/pages/*.tsx` (8 fayl — dark mode variantlari)

---

## 2026-06-02 — RBAC, Admin Dashboard, va ULTRA Xavfsizlik Davomi (H-008..H-010)

### Kontekst
Avvalgi sessiyadan davom: login yo'naltirish xatosi, rol huquqlari, admin dashboard uchun yangi panellar, va ULTRA xavfsizlik auditi.

### Bajarildi

**Login yo'naltirish tuzatildi:**
- `LoginPage.tsx` — `super_admin`/`sub_admin` endi `/admin` ga, qolganlar `/app` ga yo'naltiriladi
- `ProtectedLayout.tsx` — admin rollar `/app` ga to'g'ridan-to'g'ri kirsa ham `/admin` ga qaytariladi

**RBAC rollari kengaytirildi:**
- `types.ts` — `sub_admin`, `company_admin`, `manager` rollari qo'shildi
- `index.ts` — `ROLE_ACCESS` xaritasi 9 ta rol uchun to'liq belgilandi:
  - `super_admin`/`sub_admin` — barcha modullar
  - `company_admin` — billing, hr, ai, kb, settings
  - `leader` — reports, inbox, tasks, hr, docs, integrations, settings
  - `hr` — reports, inbox, tasks, hr, docs, settings
  - `accounting` — reports, docs, integrations, billing, settings
  - `department_head`/`manager` — reports, inbox, tasks, docs, settings
  - `employee` — inbox, tasks, settings

**Admin dashboard yangi panellari:**
- `GET /admin/ai-stats` — AI foydalanish statistikasi endpoint (so'rovlar, tokenlar, xarajat, model kesimi, top tenantlar)
- `AdminDashboardPage.tsx` — 2 ta yangi panel:
  - **Xavfsizlik Holati** — 18 ta bajarilgan tuzatish (kritik/yuqori/o'rta) vizual ro'yxati
  - **AI Biznes Tahlil** — kunlik xarajat grafigi + model kesimi + top kompaniyalar

**ULTRA xavfsizlik (davomi):**
- **H-008** — Barcha API javoblariga xavfsizlik headerlari: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Content-Security-Policy: default-src 'none'`, `Permissions-Policy`
- **H-009** — Admin mutatsiyalari uchun audit log:
  - `PATCH /admin/tenants/:id/status` → `admin.tenant.status_changed` yozadi
  - `PATCH /admin/contacts/:id/status` → `admin.contact.status_changed` yozadi
- **H-010** — Netlify SPA xavfsizlik headerlari (`netlify.toml` `[[headers]]` bo'limi):
  - CSP: `connect-src` da Supabase va WSS ruxsati
  - HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy

**Deployment:** Edge Function `supabase functions deploy server` orqali deploy qilindi.

### Fayllar
- `frontend/src/features/auth/pages/LoginPage.tsx` (o'zgargan — login yo'naltirish)
- `frontend/src/features/auth/components/ProtectedLayout.tsx` (o'zgargan — admin guard)
- `frontend/src/features/auth/types.ts` (o'zgargan — yangi rollar)
- `supabase/functions/server/index.ts` (o'zgargan — ROLE_ACCESS, ai-stats, H-008, H-009)
- `frontend/src/features/admin/api/adminApi.ts` (o'zgargan — AiStats tipi + getAdminAiStats)
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (o'zgargan — 2 yangi panel)
- `netlify.toml` (o'zgargan — H-010 xavfsizlik headerlari)

---

## 2026-06-02 — Xavfsizlik Mustahkamlash: 14 ta tuzatish (commit `fb5bde5`)

### Kontekst
Tizimning keng qamrovli xavfsizlik auditi o'tkazildi. Jami 14 ta kritik va o'rta darajadagi zaiflik aniqlandi va bartaraf qilindi.

### Bajarildi

**Kritik (K):**
- **K-001** `getTenantContext()` — autentifikatsiyasiz `x-tenant-id` header fallback olib tashlandi; JWT + DB membership tekshiruvi bilan almashtirildi
- **K-002** `/ai/chat` — `system_prompt` parametri rad etiladi (prompt injection vektori yopildi)
- **K-004** `frontend/config.ts` — hardcoded Supabase credentials olib tashlandi; env var yo'q bo'lsa app ishga tushmaydi
- **K-005** `telegram-bot/index.ts` — `TELEGRAM_WEBHOOK_SECRET` majburiy; yo'q bo'lsa 503 qaytaradi
- **K-006** `docs/DEMO_USERS.md` — demo foydalanuvchi parollari hujjatdan o'chirildi

**Yuqori (H):**
- **H-001** CORS — wildcard `*` o'rniga aniq domenlar: `aibizconcierge.uz`, `netlify.app`, `localhost`
- **H-002** AI kvota — `guardUsage()` + `recordUsage()` `/ai/chat` ga ulandi
- **H-004** `RequireRole.tsx` — yangi komponent; `/admin` marshrut DB orqali rol tekshiruvi bilan himoyalandi
- **H-005** `match_knowledge()` — `match_tenant_id` parametri qo'shildi; tenant izolyatsiyasi ta'minlandi
- **H-006** Resend webhook — imzo tekshiruvi majburiy; `RESEND_WEBHOOK_SECRET` yo'q bo'lsa 503
- **H-007** `apiClient.ts` — anon key fallback olib tashlandi; auth token yo'q bo'lsa throw

**O'rta (M):**
- **M-003** Invite token — har resend da yangi token generatsiya qilinadi (eski token bekor bo'ladi)
- **M-005** Hard-delete — `hr` roli olib tashlandi; faqat `leader/company_admin/super_admin`
- **M-006** Notifications mark-read — `tenant_id` filtri qo'shildi
- **M-008** Parol minimal uzunligi 8 → 12 belgiga ko'tarildi (3 joyda)

**Manual bajariladigan (foydalanuvchi tomonidan bajarildi ✅):**
- Supabase anon key rotate qilindi
- Netlify env vars yangilandi (`VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_ANON_KEY`)
- Demo foydalanuvchilar parollari Supabase Auth da yangilandi

### Fayllar
- `supabase/functions/server/index.ts` (o'zgargan)
- `supabase/functions/server/services/knowledge-base.ts` (o'zgargan — H-005)
- `supabase/functions/telegram-bot/index.ts` (o'zgargan — K-005)
- `frontend/src/app/config.ts` (o'zgargan — K-004)
- `frontend/src/shared/lib/apiClient.ts` (o'zgargan — H-007)
- `frontend/src/app/router.tsx` (o'zgargan — H-004)
- `frontend/src/features/auth/components/RequireRole.tsx` (yangi — H-004)
- `docs/DEMO_USERS.md` (o'zgargan — K-006)
- `supabase/migrations/20260602000000_h005_match_knowledge_tenant.sql` (yangi — H-005)

---

## 2026-06-02 — Bugfixlar: AdminRiskPage `color` xatosi, statusFilter, Netlify Node.js

### Kontekst
Risk Scanner sahifasi ishga tushirilgandan keyin bir nechta runtime xatolar topildi. Netlify va local build hashlari ham farq qilardi.

### Bajarildi
- **AdminRiskPage `TypeError: Cannot read properties of undefined (reading 'color')`** — sabab: backend `findings` massivida `status` maydoni yo'q edi → `STATUS_CONFIG[undefined]` crash. Tuzatish:
  - `risk-scan.ts`: barcha `findings.push()` ga `status: "open"` qo'shildi
  - `AdminRiskPage.tsx`: `STATUS_CONFIG[finding.status] ?? STATUS_CONFIG["open"]` fallback qo'shildi
- **`statusFilter` xatosi** — `AdminContactsPage` va `AdminCompaniesPage` da `statusFilter` parametri ishlatilgan, lekin API `filter` kutadi. To'g'irlandi.
- **Netlify hash farqi** — local Node 22 vs Netlify default Node 18 → build output hashlari farq qildi. `netlify.toml` ga `NODE_VERSION = "22"` qo'shildi.
- **`frontend/.gitignore`** — `dist/` yozuvi bilan birinchi marta commit qilindi.

### Fayllar
- `supabase/functions/server/routes/risk-scan.ts` (o'zgargan)
- `frontend/src/features/admin/pages/AdminRiskPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminContactsPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (o'zgargan)
- `netlify.toml` (o'zgargan)
- `frontend/.gitignore` (yangi)

---

## 2026-05-30 — B-014 Xavfsizlik Risk Scanner: AdminRiskPage + `POST /risk/scan`

### Kontekst
Super Admin / Sub Admin uchun tizim xavfsizligini real vaqtda skanerlash va natijalarini vizual ko'rsatish funksiyasi kerak edi.

### Bajarildi
- **DB migration** `20260530000000_risk_scanner.sql`:
  - `risk_scans` jadvali — har bir skan sessiyasi: `status`, `score`, `critical/high/medium/low_count`, `duration_ms`, `source`
  - `risk_findings` jadvali — aniq topilmalar: `severity`, `title`, `description`, `location`, `remediation`, `status`
  - RLS: faqat `super_admin/sub_admin` o'qiy oladi
- **Backend** `POST /v1/risk/scan` (`routes/risk-scan.ts`):
  - Hybrid rejim: statik tekshiruvlar + Supabase Advisor API
  - Statik tekshiruvlar: CORS config, env varlar mavjudligi, RLS holati
  - Advisor topilmalari: DB xavfsizlik tavsiyalari (RLS yo'q jadvallar, indeks yo'q FKlar va h.k.)
  - Skan natijasi `risk_scans` + `risk_findings` ga saqlanadi; `score` hisoblanadi
- **Frontend** `AdminRiskPage.tsx` (yangi):
  - "Skan boshlash" tugmasi + loading holati
  - Severity bo'yicha badge: `critical` (qizil), `high` (to'q sariq), `medium` (sariq), `low` (ko'k)
  - Findings ro'yxati: title, description, location, remediation
  - Score ko'rsatkichi (0–100)
- **Router**: `/admin/risk` marshruti qo'shildi
- **AdminLayout**: "Risk Scanner" sidebar linki qo'shildi

### Fayllar
- `supabase/migrations/20260530000000_risk_scanner.sql` (yangi)
- `supabase/functions/server/routes/risk-scan.ts` (yangi)
- `supabase/functions/server/index.ts` (o'zgargan — route ro'yxatdan o'tkazildi)
- `frontend/src/features/admin/pages/AdminRiskPage.tsx` (yangi)
- `frontend/src/app/router.tsx` (o'zgargan)
- `frontend/src/features/admin/components/AdminLayout.tsx` (o'zgargan)

---

## 2026-05-27 — B-005/B-006 DB Optimizatsiya: Performance Indexlar + Audit Triggerlar

### Kontekst
`tasks`, `inbox_items` va `documents` jadvallarida soft-delete (mantiqiy o'chirish) yo'q edi. Tez-tez so'raladigan jadvallar uchun partial indexlar ham yetishmayotgan edi. Audit log triggerlari kerak edi.

### Bajarildi
- **`deleted_at`** ustuni: `tasks`, `inbox_items`, `documents` jadvallariga qo'shildi
- **Partial indexes** (`WHERE deleted_at IS NULL`): `tasks`, `inbox_items`, `documents`, `notifications`, `audit_logs`, `request_logs` uchun — faqat aktiv yozuvlar tezroq so'raladi
- **Audit log triggerlar**: `company_info`, `employee_profiles`, `documents`, `tasks` jadvallariga — muhim o'zgarishlar avtomatik `audit_logs` ga yoziladi

### Fayllar
- `supabase/migrations/20260527105554_b005_b006_optimization.sql` (yangi)

---

## 2026-05-27 — #8 B-013 OpenAPI/Scalar docs — `GET /docs/api` + `GET /docs`

### Kontekst
API hujjatlanmagan edi. Tashqi integratsiyalar va frontend developerlar uchun interaktiv API dokumentatsiya kerak edi.

### Bajarildi
- `supabase/functions/server/openapi.ts` (yangi): to'liq OpenAPI 3.1 spec (`OPENAPI_SPEC` const) — barcha asosiy endpointlar (health, contact, tasks, inbox, employees, KB, audit, analytics) va komponentlar (Error, Task, InboxItem, Employee, KbArticle, AuditLog, AnalyticsData)
- `renderScalarHtml(apiJsonUrl)` funksiyasi — Scalar CDN orqali interaktiv UI (purple/modern tema)
- `server/index.ts`: `openapi.ts` import qo'shildi; `registerRoutes(prefix)` ichiga 2 ta route:
  - `GET ${prefix}/docs/api` → `c.json(OPENAPI_SPEC)` — OpenAPI 3.1 JSON spec
  - `GET ${prefix}/docs` → Scalar HTML UI (URL dinamik, `apiUrl.pathname` replace)
- 4 ta prefixda ham ishlaydi (`BASE_PATH`, `V1_PATH`, `GATEWAY_PREFIX` kombinatsiyalari)

### Fayllar
- `supabase/functions/server/openapi.ts` (yangi)
- `supabase/functions/server/index.ts` (o'zgargan — import + 2 route)

## 2026-05-27 — #7 Reports/Analytics charts — real DB data

### Kontekst
ReportsPage mock data ishlatayotgan edi. Haqiqiy DB aggregatsiyasi va vizualizatsiya kerak edi: task holatlari, 7-kunlik trend, inbox kategoriyalari, xodim statistikasi.

### Bajarildi
**Backend (server/index.ts) — `GET /analytics`:**
- Task stats: total, todo, in_progress, done, overdue (deleted_at IS NULL filter)
- Task trend (7 kun): har bir kun uchun created va done sonlari
- Inbox by category (30 kun): `group by category` analog (JS aggregatsiya)
- Employee stats: total, active, pending, recent_joins (7 kun)

**Frontend:**
- `frontend/src/features/reports/api/analyticsApi.ts` (yangi) — typed API client
- `frontend/src/features/reports/pages/AnalyticsPage.tsx` (yangi):
  - KPI row: jami vazifalar, muddati o'tgan, inbox (30 kun), xodimlar (stagger animatsiya)
  - Task trend → Recharts `AreaChart` (2 area: created/done, gradient fill)
  - Task status → Recharts `PieChart` (donut, 4 rang)
  - Inbox kategoriyalar → Recharts `BarChart` (har bar uchun rang)
  - Employee stats → 4 ta stat box grid
  - Refresh tugmasi + loading/error states
- `App.tsx`: `case "analytics"` → `<AnalyticsPage>` qo'shildi
- `CommandPalette.tsx`: "Analytics" page item qo'shildi

### Fayllar
- `frontend/src/features/reports/api/analyticsApi.ts` (yangi)
- `frontend/src/features/reports/pages/AnalyticsPage.tsx` (yangi)
- `supabase/functions/server/index.ts` (o'zgargan)
- `frontend/src/App.tsx` (o'zgargan)
- `frontend/src/shared/components/CommandPalette.tsx` (o'zgargan)

## 2026-05-27 — #6 PWA manifest — offline shell, home screen install

### Kontekst
Ilova faqat browser tab orqali ishlayotgan edi. Mobile qurilmalarda home screen ga qo'shish va offline ishlash imkoniyati kerak edi.

### Bajarildi
- `vite-plugin-pwa@1.3.0` o'rnatildi (`devDependencies`)
- `vite.config.ts` yangilandi:
  - `VitePWA()` plugin qo'shildi, `registerType: 'autoUpdate'`
  - Web App Manifest:
    - name: "AI Business Concierge", short_name: "AI Concierge"
    - theme_color: `#4f46e5` (indigo), background_color: `#0f172a` (dark)
    - display: `standalone`, start_url: `/app`
    - Icons: `icon.svg` (any/maskable) + `favicon.ico`
  - Workbox config: `globPatterns` JS/CSS/HTML/ICO/SVG/WOFF2
  - Runtime cache: API URL pattern → `StaleWhileRevalidate` (5 min, max 50 entries)
- `frontend/public/icon.svg` (yangi) — SVG app icon (indigo hexagon + spark)
- `frontend/index.html` yangilandi:
  - theme-color → `#4f46e5`
  - `apple-touch-icon`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-title`
  - `mobile-web-app-capable`
- Build natijasi: `dist/sw.js` + `dist/workbox-*.js` yaratildi (9 entry precache, 1.7MB)

### Fayllar
- `frontend/vite.config.ts` (o'zgargan)
- `frontend/public/icon.svg` (yangi)
- `frontend/index.html` (o'zgargan)
- `frontend/package.json` (o'zgargan — vite-plugin-pwa devDep)

## 2026-05-27 — #5 Admin Audit Log viewer + backend

### Kontekst
B-006 trigger orqali audit_logs jadvali to'ldiriladi. Super adminlar uchun bu ma'lumotlarni ko'rish, filtrlash va tekshirish imkoniyati kerak edi.

### Bajarildi
- `GET /admin/audit` backend endpoint (server/index.ts):
  - super_admin / sub_admin tekshiruvi
  - Query params: tenant_id, entity_type, action, from, to, limit (max 500)
  - `audit_logs` jadvaldan tartibli (created_at desc) ma'lumot
- `frontend/src/features/admin/api/auditApi.ts` (yangi) — typed API client
- `frontend/src/features/admin/pages/AdminAuditPage.tsx` (yangi):
  - Header: jami / ko'rsatilgan yozuvlar soni + yangilash tugmasi
  - Filtrlar: qidiruv, entity_type select, action select, sanadan / sanagacha
  - Stagger-animatsiyali ro'yxat
  - Har bir qatorda: action badge (create/update/delete rangli), entity_type, event_type, user_id (qisqartirilgan), vaqt
  - Kengaytirilganda: to'liq payload JSON (pre format)
- Router: `/admin/audit` route qo'shildi
- AdminLayout: `Shield` icon + "Audit Log" nav item (Knowledge Base va Health o'rtasida)

### Fayllar
- `frontend/src/features/admin/api/auditApi.ts` (yangi)
- `frontend/src/features/admin/pages/AdminAuditPage.tsx` (yangi)
- `frontend/src/app/router.tsx` (o'zgargan)
- `frontend/src/features/admin/components/AdminLayout.tsx` (o'zgargan)
- `supabase/functions/server/index.ts` (o'zgargan)

## 2026-05-27 — #4 Admin Knowledge Base CRUD UI + backend

### Kontekst
`knowledge_base` jadvali (pgvector + semantic search) allaqachon mavjud edi, lekin uni boshqarish uchun admin UI yoki CRUD API yo'q edi. Super adminlar maqolalarni qo'shishi, tahrirlashi, o'chirishi va faol/nofaol qilishi kerak edi.

### Bajarildi

**Backend (server/index.ts):**
- `GET /admin/kb` — ro'yxat (locale, category, is_active filter)
- `POST /admin/kb` — yangi maqola yaratish (locale+category+question+answer majburiy)
- `PUT /admin/kb/:id` — maqolani yangilash (allowed fields)
- `DELETE /admin/kb/:id` — maqolani o'chirish
- Barcha endpoint super_admin / sub_admin tekshiruvi

**Frontend:**
- `frontend/src/features/admin/api/kbApi.ts` (yangi) — typed API client
- `frontend/src/features/admin/pages/AdminKnowledgeBasePage.tsx` (yangi):
  - Header: maqola soni / faol soni + yangilash + "Yangi maqola" tugmasi
  - Filtrlar: qidiruv + til select + kategoriya select
  - Stagger animatsiyali ro'yxat (accordion expand)
  - Har bir qatorda: til/kategoriya badge, savol truncate, teglar, toggle switch
  - Kengaytirilganda: to'liq javob + Tahrirlash/O'chirish tugmalar
  - `FormModal` — 2 col locale+category, question input, answer textarea, tags, is_active toggle
  - Delete confirm modal
- `frontend/src/app/router.tsx` — `/admin/knowledge-base` route qo'shildi
- `frontend/src/features/admin/components/AdminLayout.tsx` — `BookOpen` icon + "Knowledge Base" nav item

### Fayllar
- `frontend/src/features/admin/api/kbApi.ts` (yangi)
- `frontend/src/features/admin/pages/AdminKnowledgeBasePage.tsx` (yangi)
- `frontend/src/app/router.tsx` (o'zgargan)
- `frontend/src/features/admin/components/AdminLayout.tsx` (o'zgargan)
- `supabase/functions/server/index.ts` (o'zgargan)

## 2026-05-27 — #3 Framer-motion micro-animatsiyalar

### Kontekst
Framer-motion kutubxonasi allaqachon o'rnatilgan edi, lekin faqat page transition da ishlatilayotgan edi. KPI kartochkalar, employee jadval qatorlari, kompaniya kartochkalarida hover/stagger animatsiyalar kerak edi.

### Bajarildi
- `shared/lib/motionVariants.ts` yangi fayl — umumiy variantlar:
  - `fadeInUp` — sahifa section entrance
  - `staggerContainer` + `staggerItem` — ro'yxat stagger (55ms oralig'i)
  - `cardHover` — scale 1.02 + indigo box-shadow hover
  - `rowHover` — jadval qator hover (subtil)
- `DashboardPage.tsx` o'zgarishlari:
  - KPI grid → `motion.div` (staggerContainer)
  - Har bir `KpiCard` → `motion.div` (staggerItem + cardHover)
- `EmployeesPage.tsx` o'zgarishlari:
  - `<tbody>` → `<motion.tbody>` (staggerContainer)
  - Har bir `<tr>` → `<motion.tr>` (staggerItem) — 55ms stagger
- `AdminCompaniesPage.tsx` o'zgarishlari:
  - Kartochkalar wrapper → `motion.div` (staggerContainer)
  - Har bir kartochka → `motion.div` (staggerItem + border hover indigo)

### Fayllar
- `frontend/src/shared/lib/motionVariants.ts` (yangi)
- `frontend/src/features/reports/pages/DashboardPage.tsx` (o'zgargan)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (o'zgargan)

## 2026-05-27 — #2 CommandPalette: ⌘K global modal qidiruvi

### Kontekst
Avvalgi ⌘K faqat search inputga fokus qilardi. Real CommandPalette — modal, fuzzy search, klaviatura navigatsiyasi — kerak edi.

### Bajarildi
- `CommandPalette.tsx` yangi komponent yaratildi (`shared/components/`)
- Framer-motion: backdrop + modal scale/fade animatsiya
- 13 ta page item (Dashboard → Notifications), 1 ta quick action (Add Employee)
- Xodimlar: `listEmployees(tenantId, "active")` — palette ochilganda lazy load
- Fuzzy match: `includes()` + char-by-char fallback; match substring `<span>` highlight
- Keyboard: ArrowUp/Down cursor harakat, Enter → select, Escape → yopish
- Grouped sections: Pages / Quick Actions / Employees + scroll-into-view
- Footer hint: `↑↓ navigate`, `↵ open`, `ESC close`
- `App.tsx` o'zgarishlari:
  - `paletteOpen` state qo'shildi
  - ⌘K handler: `setPaletteOpen(prev => !prev)` (toggle)
  - Search input → click-to-open button (⌘K badge ko'rsatadi)
  - `<CommandPalette>` layout pastiga render (portal orqali `document.body`)
  - `employee-detail:` prefix navigatsiya employee detail sahifasiga o'tadi

### Fayllar
- `frontend/src/shared/components/CommandPalette.tsx` (yangi)
- `frontend/src/App.tsx` (o'zgargan)

## 2026-05-27 — B-005 + B-006 + B-011: DB indekslar, audit triggers, structured logging

### Kontekst
Saqlash jadvallari indekssiz edi — tenant scope bo'yicha so'rovlar katta hajmda sekin ishlaydi. Audit log faqat manual yozilardi (trigger yo'q). Hono logger oddiy text format chiqarardi — Supabase log observability uchun noqulay.

### Bajarildi

**B-005 — Performance indekslar + soft-delete:**
- `tasks`, `inbox_items`, `documents` jadvallariga `deleted_at timestamptz` ustun qo'shildi
- `idx_tasks_tenant_status_del` — `(tenant_id, status, deleted_at)` partial index (deleted_at IS NULL)
- `idx_tasks_tenant_due` — `(tenant_id, due_date)` partial index (deleted_at IS NULL)
- `idx_inbox_tenant_created_del` — `(tenant_id, created_at desc, deleted_at)` partial
- `idx_notifications_user_unread` — `(user_id, created_at desc)` where read_at IS NULL
- `idx_notifications_tenant_created` — `(tenant_id, created_at desc)`
- `idx_documents_tenant_created_del` — `(tenant_id, created_at desc)` partial
- `idx_audit_logs_tenant_created` — `(tenant_id, created_at desc)`
- `idx_audit_logs_entity` — `(entity_type, entity_id, created_at desc)`
- `idx_request_logs_tenant_created` — `(tenant_id, created_at desc)`

**B-006 — Audit log triggers:**
- `fn_audit_log_change()` PL/pgSQL trigger funksiyasi yaratildi (SECURITY DEFINER)
- INSERT → `event_type = 'table.create'`, payload = NEW row JSON
- UPDATE → `event_type = 'table.update'`, payload = `{before: OLD, after: NEW}`
- DELETE → `event_type = 'table.delete'`, payload = OLD row JSON
- Triggerlar: `trg_audit_tasks`, `trg_audit_inbox_items`, `trg_audit_documents` (tasks/inbox_items/documents/hr_cases)

**B-011 — Structured JSON logging (Hono middleware):**
- `import { logger } from "npm:hono/logger"` olib tashlandi
- Yangi `app.use('*', async (c, next) => {...})` middleware:
  - `X-Trace-Id` headerni oladi yoki yangi UUID yaratadi
  - Response vaqtini o'lchaydi (`Date.now()` before/after)
  - status ≥ 500 → `level: "error"`, ≥ 400 → `"warn"`, duration > 2000ms → `"warn"`, boshqa → `"info"`
  - `logRequest()` orqali JSON formatda chiqaradi: `{level, message, traceId, tenantId, userId, data: {method, path, status, duration_ms}}`
  - 2000ms dan oshgan so'rovlarda `slow_query: true` flag

### Fayllar
- `supabase/migrations/20260527000000_b005_b006_optimization.sql` (yangi)
- `supabase/functions/server/index.ts` (o'zgargan — logger import olib tashlandi, structured middleware qo'shildi)
>
> **Protokol (CLAUDE.md §...):** Har bir o'zgarish bu faylga va 4 til tarjimaga yoziladi.

---

## 2026-05-27 — UI/UX #10: Onboarding tooltips (TourProvider, TourOverlay)

### Bajarildi

- `OnboardingTour.tsx`: `TourProvider` + `useTour` hook + `TourOverlay` component
  - Spotlight: `box-shadow` bilan target element atrofida qorong'i overlay
  - `requestAnimationFrame` orqali target pozitsiyasi kuzatiladi (scroll ham ishlaydi)
  - `placement: "top"|"bottom"|"left"|"right"` — avtomatik viewport cheklash
  - Progress bar, step hisobi (1/4), "O'tkazib yuborish" + "Keyingi" tugmalar
  - Keyboard: `Escape` → yopish, `ArrowRight`/`Enter` → keyingi qadam
- `AppProviders.tsx`: `<TourProvider>` qo'shildi
- `App.tsx`: `DASHBOARD_TOUR` (4 qadam: nav, qidiruv, bildirishnomalar, mavzu) + `HelpCircle` tugma → `startTour()`
- Search input ga `data-tour="search"` attribute qo'shildi

### Fayllar

- `frontend/src/shared/components/OnboardingTour.tsx` (yangi)
- `frontend/src/app/providers/AppProviders.tsx` (o'zgargan)
- `frontend/src/App.tsx` (o'zgargan)

---

## 2026-05-27 — UI/UX #9: Klaviatura shortcutlar (⌘K qidiruv, ⌘N xodim)

### Bajarildi

- `App.tsx` da `keydown` listener: `Cmd/Ctrl+K` → search input ga focus + select; `Cmd/Ctrl+N` → `hr-add-employee` sahifasiga o'tish (faqat HR ruxsati bor bo'lsa)
- Mac/Windows mod key detection (`navigator.platform`)
- Qidiruv input placeholder: `"... (⌘K)"` hint qo'shildi

### Fayllar

- `frontend/src/App.tsx` (o'zgargan)

---

## 2026-05-27 — UI/UX #8: Jadval paginatsiyasi (EmployeesPage, AdminCompaniesPage)

### Bajarildi

- `Pagination` component: ellipsis bilan sahifa tugmalar, `ChevronLeft/Right`, "N–M / total ta" ko'rsatkich; `paginateArray` helper
- **EmployeesPage**: `PAGE_SIZE=20`, tab/search/statusFilter o'zgarganda page reset, `paginateArray(filtered, page, PAGE_SIZE).map(...)`
- **AdminCompaniesPage**: `PAGE_SIZE=15`, filter/search o'zgarganda page reset, paginatsiya list ostida

### Fayllar

- `frontend/src/shared/components/Pagination.tsx` (yangi)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (o'zgargan)

---

## 2026-05-27 — UI/UX #7: Dark/Light mode toggle

### Bajarildi

- `useTheme` hook: localStorage saqlash (`ai-bc-theme`), OS preferense fallback, `<html>` ga `.dark` class qo'shish/olish
- `ThemeToggle` component: `Sun`/`Moon` ikonka, `aria-label`, `dark:` hover renglari
- App.tsx topbar ga `<ThemeToggle />` qo'shildi (LocaleSelect chap tomonida)
- AdminLayout topbar ga ham `<ThemeToggle />` qo'shildi
- `theme.css` da `.dark` CSS variables allaqachon to'liq tayyor edi

### Fayllar

- `frontend/src/shared/hooks/useTheme.ts` (yangi)
- `frontend/src/shared/components/ThemeToggle.tsx` (yangi)
- `frontend/src/App.tsx` (o'zgargan)
- `frontend/src/features/admin/components/AdminLayout.tsx` (o'zgargan)

---

## 2026-05-27 — UI/UX #6: Employee onboarding step wizard

### Bajarildi

- `AddEmployeePage` 3 qadam wizardga o'tkazildi:
  - **Step 1**: Mode tanlash — katta visual kartalar (`Send`/`Lock` ikonka, tanlangan badge)
  - **Step 2**: Ma'lumotlar formasi — ikonkali input lar, mode ko'rsatkich + "O'zgartirish" link, yuborilayotganda spinner
  - **Step 3**: Muvaffaqiyat — `CheckCircle2` katta ko'k doira, "Yana qo'shish" va "Xodimlar ro'yxati" tugmalar
- `StepIndicator` component: numbered circles (active/done/future), connector chiziqlar (rang o'zgaradi), step labels
- `onSuccess?` prop qo'shildi — step 3 da tashqi callback imkoni

### Fayllar

- `frontend/src/features/hr/pages/AddEmployeePage.tsx` (to'liq qayta yozildi)

---

## 2026-05-27 — UI/UX #5: Notifications UI polish

### Bajarildi

- **Badge**: `animate-ping` halqa (qizil nuqta atrofida pulsatsion ring) + ichki qizil raqam badge
- **"Barchasini o'qi"** tugma: header da `CheckCheck` ikonka + `Promise.allSettled` parallel mark
- **Empty state**: `BellOff` ikonka + matn (avval faqat matn)
- **Har bir notification**: tur ikonkasi (emoji), o'qilmagan holat uchun indigo nuqta, `bg-indigo-50` fon
- **Header** qo'shildi: "Bildirishnomalar" sarlavha + o'qilmagan hisobi bor bo'lsa "Barchasini o'qi"
- `CheckSquare` → tur emoji'si (task/hr/invoice/system/🔔 default)

### Fayllar

- `frontend/src/features/notifications/components/NotificationsDropdown.tsx` (to'liq qayta yozildi)

---

## 2026-05-27 — UI/UX #4: Mobile responsive tekshiruv (3 sahifa)

### Bajarildi

- **AdminCompaniesPage** header: `flex-wrap gap-3 + shrink-0` — kichik ekranda tugma keyingi qatorga o'tadi
- **AdminContactsPage** header: xuddi shunday `flex-wrap` tuzatish
- **EmployeeDetailPage**: loading → to'liq skeleton (header + 5 maydon qatori); error state → ikonka + xabar (avval shunchaki matn edi)
- Summary cards `grid-cols-2 sm:grid-cols-4` — allaqachon responsiv edi, saqlandi

### Fayllar

- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminContactsPage.tsx` (o'zgargan)
- `frontend/src/features/hr/pages/EmployeeDetailPage.tsx` (o'zgargan)

---

## 2026-05-27 — UI/UX #3: Skeleton loaderlar + Empty states (4 sahifa)

### Bajarildi

- **AdminCompaniesPage**: spinner → 5 ta karta skeleton (`animate-pulse`); empty state → `Building2` ikonka + kontekstual xabar (filter aktiv bo'lganda "Filtrlarni tozalang")
- **AdminContactsPage**: spinner → 5 ta karta skeleton; empty state → `Users` ikonka + kontekstual xabar; import ga `Users` qo'shildi
- **AdminHealthPage**: bitta qator matn → header + banner + 4 ta stat kartasi skeleton
- **EmployeesPage**: oddiy matn → jadval skeleton (thead + 6 ta qator); empty state → `UserPlus` ikonka + kontekstual xabar

### Fayllar

- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminContactsPage.tsx` (o'zgargan)
- `frontend/src/features/admin/pages/AdminHealthPage.tsx` (o'zgargan)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (o'zgargan)

---

## 2026-05-27 — UI/UX #1-2: AdminLayout sidebar + AdminDashboard SVG grafiklari

### Bajarildi

**#1 — AdminLayout sidebar qayta yozildi:**
- Desktop: ikonkalar-only rejim (w-16) ↔ kengaytirilgan (w-56) — `PanelLeftClose/Open` tugma
- Mobile: drawer (`-translate-x-full` → `translate-x-0`) + overlay; alohida `mobileOpen` holati
- `NavItem`: tooltip (collapsed da `fixed` pozitsiya), chap aktiv chiziq (animatsiyali balandlik), icon scale hover da
- Badge: contactlar uchun pulsatsion qizil nuqta (collapsed) / raqam (expanded)
- `Avatar`: ismdan bosh harflar, `[\s@._-]` bo'yicha ajratiladi
- Topbar: yangi murojaat hisobi, avatar o'ng yuqorida

**#2 — AdminDashboardPage SVG grafiklari (tashqi kutubxonasiz):**
- `DonutChart`: sof SVG, trigonometriya bilan yoy yo'llar, markaziy teshik, markaziy matn
- `MiniBarChart`: SVG bar chart, kompaniyalar `created_at` dan 7 kunlik qovushlar
- `LatencyGauge`: SVG yoy gauge, ranglar bilan kodlangan (yashil ≤50ms, sariq ≤200ms, qizil >200ms)
- `StatCard`: haftalik trend (↑/↓), hover `scale-[1.01]`
- Skeleton loaderlar: `animate-pulse` divlar yuklanayotganda
- 30s auto-refresh; adminDashboardApi ga yangi `getDashboardStats` type

### Fayllar

- `frontend/src/features/admin/components/AdminLayout.tsx` (to'liq qayta yozildi)
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (to'liq qayta yozildi)

---

## 2026-05-27 — Vazifa 4: B-001 Unit testlar (inbox modul)

### Kontekst

B-001 bo'yicha `features/inbox/` moduli uchun qo'shimcha unit testlar yozildi. Mavjud 76 ta test 89 ga ko'paydi (+13 yangi test, 16 test fayl).

### Bajarildi

**`inbox/__tests__/inboxApi.test.ts` (6 ta yangi test):**
- `snake_case is_read` → `camelCase isRead` normalizatsiyasi
- `is_read` yo'q bo'lganda `false` deb qabul qilish
- To'g'ri endpoint va `tenantId` bilan murojaat
- Bo'sh array → bo'sh list
- Bir nechta item — isRead to'g'ri normalizatsiya
- API xato bo'lsa exception tashlash

**`inbox/__tests__/useInbox.test.ts` (7 ta yangi test):**
- Yuklanganda itemlar olinishi
- `filter=all` — barcha itemlar ko'rsatilishi
- `filter=HR` — faqat HR itemlar filtrlash
- `filter=Sales` — faqat Sales itemlar filtrlash
- Tenant izolyatsiya — boshqa `tenantId` bilan alohida API so'rovi
- API xato → `error` holati, `items=[]`
- `selectedItem` birinchi itemga avtomatik o'rnatilishi

### Holat

| Fayl | Testlar |
|------|---------|
| `tasks/tasksDomain.test.ts` | 5 ✅ |
| `tasks/tasksApi.test.ts` | 6 ✅ |
| `tasks/useTasks.test.ts` | 6 ✅ |
| `inbox/inboxDomain.test.ts` | 3 ✅ |
| `inbox/inboxApi.test.ts` | 6 ✅ **yangi** |
| `inbox/useInbox.test.ts` | 7 ✅ **yangi** |
| Boshqa 10 ta fayl | 56 ✅ |
| **Jami** | **89 ta test, hammasi o'tdi** |

### Fayllar

- `frontend/src/features/inbox/__tests__/inboxApi.test.ts` (yangi)
- `frontend/src/features/inbox/__tests__/useInbox.test.ts` (yangi)

---

## 2026-05-27 — Vazifa 3: B-007 Prompt injection himoya + input sanitizatsiya

### Kontekst

AI chat endpointlar hech qanday input tekshiruvisiz to'g'ridan-to'g'ri Claude/OpenAI ga yuborilyapti edi. Bu injection xavfini keltirib chiqaradi: foydalanuvchi system prompt ni o'zgartirishga yoki tizimni aldashga urinishi mumkin. B-007 bo'yicha `services/ai-safety.ts` service yaratildi va `/v1/ai/chat` ga ulandi.

### Bajarildi

**`services/ai-safety.ts` (yangi fayl):**
- `checkAiSafety(rawInput, userId)` — asosiy funksiya:
  - 25 ta injection pattern (EN/RU/UZ/JA + system markers: `<system>`, `[INST]`, `<|user|>` va h.k.)
  - HTML/script teg stripping (DoS-xavfsiz: `{0,200}` regex)
  - Max 16 000 belgi (~4000 token) tekshiruvi
  - Per-user rate limit: 10 xabar/daqiqa (in-memory sliding window)
  - `SafetyResult` type: `{ safe: true, sanitized }` yoki `{ safe: false, code, message, messageRu }`
- `wrapUserMessage(sanitized)` — prompt layering helper:
  - User xabarini `"User message:\n..."` blokiga o'raydi
  - System kontekstdan aniq ajratadi → injection samaradorligi kamayadi

**`/v1/ai/chat` endpoint yangilandi:**
- `checkAiSafety()` — KB va AI chaqirishdan oldin tekshiriladi
- 422 → `INJECTION_DETECTED` yoki `INPUT_TOO_LONG`
- 429 → `RATE_LIMITED` (til-mos xabar: uz yoki ru)
- `safeMessage` — sanitizatsiya qilingan xabar butun handler davomida ishlatiladi
- `wrapUserMessage()` — Claude + OpenAI fallback chaqiruvlarda qo'llaniladi

### Fayllar

- `supabase/functions/server/services/ai-safety.ts` (yangi)
- `supabase/functions/server/index.ts` (o'zgargan: import + `/v1/ai/chat` handler)

---

## 2026-05-27 — Vazifa 1: ai_usage_logs wiring (billing cost tracking)

### Kontekst

API kreditlar kutilayotgan paytda kredit talab qilmaydigan backend ishlarni boshladik. Birinchi vazifa: `ai_usage_logs` jadval 2026-05-14 da yaratilgan edi, lekin `/v1/ai/chat` va `/v1/admin/ai/chat` endpointlar hali bu jadvalga yozmayotgan edi. Bu billing uchun hal qiluvchi — har qaysi tenant qancha AI kredit sarflayotganini bilmasak, Phase 3 to'lov tizimi ishlay olmaydi.

### Bajarildi

**`insertAiUsageLog` helper funksiya (yangi, non-blocking):**
- `supabase.from("ai_usage_logs").insert(...)` — service_role client ishlatadi (RLS bypass)
- `provider` normalizatsiya: `"openai_fallback"` → `"openai"` (DB constraint: `('claude','openai','fallback')`)
- Non-blocking: `.then(({ error }) => ...)` — asosiy request sekinlamaydi
- `AiUsageLogEntry` type — typed interface

**`/v1/ai/chat` endpoint yangilandi:**
- `insertAiUsageLog()` chaqiriladi har AI so'rovdan keyin
- Saqlangan ma'lumotlar: `tenant_id`, `user_id`, `endpoint`, `model`, `provider`, `complexity`, `prompt_tokens`, `completion_tokens`, `cost_usd`, `cached`, `latency_ms`, `trace_id`

**`/v1/admin/ai/chat` endpoint yangilandi:**
- Token tracking o'zgaruvchilari qo'shildi: `adminModel`, `adminProvider`, `adminInputTokens`, `adminOutputTokens`, `adminCostUsd`, `adminCached`
- `callClaude()` va `callOpenAI()` javob ma'lumotlari to'planadi
- Admin chat uchun `ai_usage_logs` ga yozilmaydi (`tenant_id` FK bor, admin da tenant yo'q) — `console.info()` bilan loglanadi
- TODO: kelajakda `tenant_id nullable` yoki alohida `admin_ai_usage_logs`

**Aniqlik:**
- `/v1/docs/search` endpoint allaqachon mavjud (line 2916) — `ILIKE` bilan ishlaydi
- `match_documents()` pgvector funksiyasi bor, lekin OpenAI embedding kredit kerak — kredit kelgach ulash
- Vazifa 2 (`match_documents()` wiring) kreditga bog'liq, o'tkazib yuborildi

### Fayllar

- `supabase/functions/server/index.ts` (o'zgargan: `insertAiUsageLog` helper + 2 endpoint ulandi)

---

## 2026-05-15 — Web takomillashtirish (tugallandi): 8 ta muhim UI/UX o'zgarish

### Kontekst

API kreditlar kutilayotganda 8 ta web takomillashtirish ro'yxatini tartib bilan bajardik.

### Bajarildi

**1. ProfileForm — real ma'lumotlarga ulandi:**
- `useUserSettings` hook qayta yozildi — AuthContext dan real `fullName` va `email` o'qiydi
- `PATCH /v1/settings/profile` backend endpoint yaratildi (full_name, phone)
- `refetchProfile()` save'dan keyin chaqiriladi — sidebar darhol yangilanadi

**2. EmployeeDetailPage — edit mode qo'shildi:**
- Barcha 23 ta employee_profiles maydoni forma sifatida ko'rsatiladi
- 5 bo'lim: Shaxsiy, Mehnat, Aloqa, Favqulodda, Izohlar
- `PATCH /v1/tenants/:id/members/:userId/profile` — HR xodimni upsert qiladi

**3. Unit testlar (B-001):**
- 9 test: `adminApi.test.ts` — getAdminCompanies, updateCompanyStatus, getAdminHealth
- 12 test: `settingsDomain.test.ts` — validatePassword, validateFullName
- 7 test: `useUserSettings.test.ts` — real ma'lumot, snake_case body, refetchProfile
- LandingPage.test.tsx tuzatildi: I18nProvider wrapper qo'shildi
- Jami: 76 test, hammasi o'tdi

**4. EmployeesPage — filter + qidiruv + bloklash:**
- Status filter chips: all/active/password_pending/password_set/blocked
- Qidiruv maydoni (isim/email bo'yicha)
- Block/Unblock tugmalar har bir qatorda
- `PATCH /v1/tenants/:id/members/:userId/status` backend endpoint

**5. Docs sahifasi — shablonlar kutubxonasi:**
- 15 ta shablon (shartnomalar, arizalar, buyruqlar)
- Kategoriya filter + qidiruv
- "tez orada" badge — AI kreditlar kutilmoqda

**6. Admin dashboard — 30s auto-refresh + sidebar badge:**
- `setInterval(30_000)` — AdminDashboardPage avtomatik yangilanadi
- Sidebar "Murojaatlar" navida qizil badge (yangi murojaatlar soni)

**7. Reports sahifasi — AI audit o'chirildi:**
- "AI Audit" tugmasi disabled holatga o'tkazildi — "tez orada" label

**8. Notifications sahifasi — to'liq bildirishnomalar tarixi:**
- `NotificationsPage.tsx` — filter (all/unread/read), bulk mark-read
- `NotificationsDropdown` ga "Barchasini ko'rish" link qo'shildi (`onViewAll` prop)
- App.tsx da `case "notifications"` ulandi

### Fayllar

- `supabase/functions/server/index.ts` (o'zgargan — 4 yangi endpoint)
- `frontend/src/features/settings/hooks/useUserSettings.ts` (qayta yozildi)
- `frontend/src/features/settings/components/ProfileForm.tsx` (qayta yozildi)
- `frontend/src/features/hr/pages/EmployeeDetailPage.tsx` (qayta yozildi)
- `frontend/src/features/hr/api/employeesApi.ts` (o'zgargan)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (o'zgargan)
- `frontend/src/features/admin/__tests__/adminApi.test.ts` (yangi)
- `frontend/src/features/settings/__tests__/settingsDomain.test.ts` (yangi)
- `frontend/src/features/settings/__tests__/useUserSettings.test.ts` (yangi)
- `frontend/src/features/landing/__tests__/LandingPage.test.tsx` (tuzatildi)
- `frontend/src/features/docs/components/TemplatesLibrary.tsx` (yangi)
- `frontend/src/features/docs/pages/DocsPage.tsx` (qayta yozildi)
- `frontend/src/features/admin/pages/AdminDashboardPage.tsx` (o'zgargan)
- `frontend/src/features/admin/components/AdminLayout.tsx` (o'zgargan)
- `frontend/src/features/reports/pages/ReportsPage.tsx` (o'zgargan)
- `frontend/src/features/notifications/pages/NotificationsPage.tsx` (yangi)
- `frontend/src/features/notifications/components/NotificationsDropdown.tsx` (o'zgargan)
- `frontend/src/App.tsx` (o'zgargan)

---

## 2026-05-15 — Web takomillashtirish (davom): TenantSettings, EmployeeDetail, Parol, Landing nav/footer

### Kontekst

API kreditlar kutilayotganda web qismini davom ettirish — 6 ta web takomillashtirish ro'yxatining 3-6 bandlari.

### Bajarildi

**3. TenantSettingsPage (to'liq qayta yozildi):**
- `GET /v1/tenants/:id/profile` va `PATCH /v1/tenants/:id/profile` backendi
- Form: name, legal_form, stir, employee_count_range, activity_type, reg_date, legal_address, website, description, contact_phone, contact_email, bank_name, bank_account
- Stub `<div>Tenant settings</div>` o'rnini oldi

**4. EmployeeDetailPage (yangi):**
- `GET /v1/tenants/:id/members/:userId` endpoint — user_tenant + employee_profiles JOIN
- `EmployeeDetailPage` komponenti: 5 bo'lim (Shaxsiy, Mehnat, Aloqa, Favqulodda, Izohlar)
- EmployeesPage ga `onViewEmployee` callback qo'shildi
- App.tsx ga `selectedEmployeeId` state va "Kompaniya profili" nav elementi qo'shildi

**5. PasswordChangeForm (yangi):**
- `supabase.auth.updateUser({ password })` orqali parol o'zgartirish
- Eye/EyeOff toggle, validatsiya (min 8 belgi, mos kelishi), success/error holatlari
- SettingsPage ga qo'shildi

**6. Landing nav + footer (yangilab):**
- LandingNavbar: `features`, `pricing`, `faq` anchor link label qo'shildi; markdown hamburgersiz chiroyli anchor nav (md+ da ko'rinadi); smooth scroll
- LandingFooter: navigatsiya havolalar qatori (Funksiyalar, Narxlar, Savollar, Murojaat) qo'shildi
- FeaturesSection ga `id="features"`, PricingSection ga `id="pricing"` qo'shildi
- i18n 4 ta lokalizatsiya yangilandi: nav (features/pricing/faq), footer.links (4 ta link)

### Fayllar

- `supabase/functions/server/index.ts` (o'zgargan: yangi endpointlar)
- `frontend/src/features/tenants/pages/TenantSettingsPage.tsx` (qayta yozildi)
- `frontend/src/features/hr/pages/EmployeeDetailPage.tsx` (yangi)
- `frontend/src/features/hr/pages/EmployeesPage.tsx` (o'zgargan: onViewEmployee)
- `frontend/src/features/settings/components/PasswordChangeForm.tsx` (yangi)
- `frontend/src/features/settings/pages/SettingsPage.tsx` (o'zgargan)
- `frontend/src/features/landing/components/LandingNavbar.tsx` (o'zgargan)
- `frontend/src/features/landing/components/LandingFooter.tsx` (o'zgargan)
- `frontend/src/features/landing/components/FeaturesSection.tsx` (id qo'shildi)
- `frontend/src/features/landing/components/PricingSection.tsx` (id qo'shildi)
- `frontend/src/features/landing/i18n.ts` (o'zgargan: nav + footer.links)
- `frontend/src/App.tsx` (o'zgargan: EmployeeDetail, TenantSettings, navigate helper)

---

## 2026-05-15 — Phase 1.5 tugallash + Phase 2.3 boshlash: AdminCompaniesPage, FAQ, SEO

### Kontekst

API kreditlar (Anthropic/OpenAI) kutilayotgan paytda web qismi takomillashtirildi. Phase 1.5 da yetishmayotgan `/admin/companies` sahifasi yaratildi, Phase 2.3 dan Landing page ga FAQ bo'limi va SEO meta tags qo'shildi.

### Bajarildi

**1. Backend — `GET /v1/admin/companies` endpoint (yangi):**
- `tenants` jadvalidan barcha maydonlar: id, name, status, legal_form, stir, legal_address, activity_type, contact_phone, contact_email, website, employee_count_range, bank_name, bank_account, blocked_reason, blocked_at, approved_at, created_at
- Har tenant uchun `member_count` (user_tenants dan, terminated emas)
- Status filtrlash: `?status=pending_approval|active|suspended|blocked`
- Faqat super_admin / sub_admin uchun

**2. Frontend — `adminApi.ts` kengaytirildi:**
- `Company` type (barcha tenant maydonlari + member_count)
- `CompanyStatus` type
- `getAdminCompanies(status?)` funksiyasi
- `updateCompanyStatus(id, status, blocked_reason?)` funksiyasi → `PATCH /admin/tenants/:id/status` ga yuboradi

**3. Frontend — `AdminCompaniesPage.tsx` (yangi):**
- 4 ta status summary karta (pending/active/suspended/blocked)
- Filter tabs + qidiruv (nom, STIR, email, telefon)
- Kengaytiriladigan qatorlar: yuridik ma'lumotlar, bank, bloklash sababi
- Amallar: Tasdiqlash, To'xtatish, Blokdan chiqarish, Bloklash (sabab modal bilan)
- Route: `/admin/companies` → `RequireAuth` wrapper

**4. Frontend — Landing FAQ bo'limi:**
- `FaqSection.tsx` — accordion, accessible (aria-expanded), animatsiya
- 6 ta savol-javob 4 tilda (uz/ru/en/ja) `i18n.ts` ga qo'shildi
- `LandingDict` tipiga `faq: { title, items: FaqItem[] }` qo'shildi
- `LandingPage.tsx` da PricingSection → FaqSection → LandingCtaBanner tartibida

**5. SEO — `index.html` yangilandi:**
- `<title>` o'zgartirildi (mahsulot nomi + tavsif)
- `<meta name="description">`, keywords, author, robots
- Open Graph meta tags (og:title, og:description, og:type, og:locale)
- Twitter Card meta tags
- `<link rel="canonical">`
- `<meta name="theme-color" content="#0f172a">`
- `<html lang="uz">` qo'shildi

### PLAN.md holati yangilanishi

- B-019: Company registration flow → **DONE** (AdminCompaniesPage qo'shildi, Phase 1.5 tugallandi)
- Phase 2.3 Landing page: **BOSHLANDI** (FAQ + SEO done; qoldi: hujjat generatsiya kredit kerak)

### Fayllar
- `supabase/functions/server/index.ts` (GET /admin/companies qo'shildi)
- `frontend/src/features/admin/api/adminApi.ts` (Company type + getAdminCompanies + updateCompanyStatus)
- `frontend/src/features/admin/pages/AdminCompaniesPage.tsx` (yangi)
- `frontend/src/app/router.tsx` (/admin/companies route qo'shildi)
- `frontend/src/features/landing/i18n.ts` (FaqItem type + faq 4 tilda)
- `frontend/src/features/landing/components/FaqSection.tsx` (yangi)
- `frontend/src/features/landing/pages/LandingPage.tsx` (FaqSection import + render)
- `frontend/index.html` (SEO meta tags)
- `docs/{DEVLOG,English/DEVLOG,Russian/DEVLOG,Uzbek/DEVLOG,日本語/DEVLOG}.md` (sinxron)

---

## 2026-05-14 — security: 5 view SECURITY INVOKER ga o'tkazildi

### Kontekst

Supabase Security Advisor 5 ta "Security Definer View" xatosini ko'rsatdi:
`employee_invite_stats`, `v_beta_stats`, `v_beta_daily_activity`, `v_beta_model_usage`, `v_beta_feedback`.

SECURITY DEFINER view yaratuvchi nuqtai nazaridan ishlaydi — RLS ni chetlab o'tishi va tenant izolyatsiyasini buzishi mumkin.

### Bajarildi

**Migration `20260514120000_views_security_invoker.sql`:**
- 5 ta view qaytadan yaratildi `with (security_invoker = true)` (PG15+)
- `v_beta_*` views — faqat `service_role` uchun SELECT (admin dashboard backend orqali)
- `employee_invite_stats` — `authenticated` va `service_role` uchun (HR tenant ichida ko'radi, RLS o'zi cheklaydi)
- Comment har birida: "SECURITY INVOKER — caller RLS qoidalariga rioya qiladi"

### Sabab

Bu pattern avval qo'llanilgan (`20260304_fix_tenant_daily_stats_security.sql`, `20260429120000_security_hardening.sql`). Multi-tenant SaaS uchun SECURITY DEFINER view jiddiy xavfsizlik risk.

### Tasdiq

Push'dan keyin: Dashboard → Advisors → Security → **Refresh** → 5 errors → 0.

### Fayllar
- `supabase/migrations/20260514120000_views_security_invoker.sql` (yangi)
- `docs/{DEVLOG,English/DEVLOG,Russian/DEVLOG,Uzbek/DEVLOG,日本語/DEVLOG}.md` (sinxron)

---

## 2026-05-14 — Scale fundament: AI cost tracking + doc_chunks RAG + R-016..R-020

### Kontekst

`docs/ai-business-concierge-scale-prompt.md` (2026-05-11) talablari bo'yicha "darhol" qilinishi kerak bo'lganlari amalga oshirildi. Phase 1.5 holatini tekshirish va etib bormagan urgent ishlarni yopish.

### Bajarildi

**1. DB migration `20260514000000_ai_usage_and_doc_vector.sql`:**
- `ai_usage_logs` jadvali — har AI chaqiruv: tenant, user, endpoint, model, provider, complexity, prompt/completion tokens, cost_usd, cached, latency, trace_id. Generated column `total_tokens`. 3 ta index. RLS bilan tenant izolyatsiya + super_admin/sub_admin barchasini ko'radi
- `v_ai_usage_summary` view — kunlik tenant agregat (Admin dashboard uchun)
- `doc_chunks.embedding vector(1536)` ustun — pgvector RAG uchun
- `doc_chunks_embedding_idx` HNSW index (m=16, ef_construction=64)
- `match_documents(query_embedding, threshold, count, tenant_id)` funksiyasi — RAG search, security definer, search_path locked, faqat authenticated/service_role uchun execute
- `doc_chunks` uchun document_id va tenant_id indekslari

**2. REQUIREMENTS.md yangilandi:**
- R-016 HR Candidate Analysis (skeleton mavjud, full impl Phase 2'da)
- R-017 AI Rate Limiting (qisman done — in-memory `contactRateMap` + Telegram daily limit)
- R-018 AI Cost Tracking (migration done — backend wiring keyingi sessiyada `/v1/ai/chat` endpoint'dan)
- R-019 Vector Search RAG (migration done — backend integration keyingi sessiyada)
- R-020 Admin Dashboard (super_admin/sub_admin uchun health, contacts, AI chat — Phase 4'da to'liq monitoring)

**3. Hozirgi holat tekshirildi:**
- Phase 1.5 5 ta migration applied: contact_requests, tenant_company_info, roles_update (sub_admin/company_admin/accountant/manager qo'shildi), employee_profiles, employee_invites
- Backend admin endpoints mavjud: `/admin/contacts`, `/admin/health`, `/admin/ai/chat`, `/admin/contacts/:id/status`, `/admin/tenants/:id/status`
- Frontend admin pages real impl: `AdminContactsPage`, `AdminHealthPage`, `AdminAIChatPage` + `adminApi.ts`
- docs/ tuzilishi to'g'ri: `English/`, `Russian/`, `Uzbek/`, `日本語/` har birida DEVLOG.md + boshqa tarjimalar

### Defer qilingan (kelajak)

- Prompt caching middleware (`scale-prompt` Vazifa 1.2) — Phase 1.5 yakuni
- HR Candidate Analysis full impl — Phase 2 (PLAN.md v3.0 bo'yicha)
- Backend wiring: `/v1/ai/chat` endpoint'da `ai_usage_logs` ga INSERT — keyingi sessiya (services/llm-router.ts dan token usage olish)
- `match_documents()` ni `POST /v1/docs/search` endpoint'iga ulash — keyingi sessiya
- Full admin debug/log UI (real-time Sentry, query EXPLAIN) — Phase 4

### Fayllar
- `supabase/migrations/20260514000000_ai_usage_and_doc_vector.sql` (yangi)
- `docs/REQUIREMENTS.md` (R-016..R-020 qo'shildi)
- `docs/DEVLOG.md` (bu entry)
- `docs/{English,Russian,Uzbek,日本語}/DEVLOG.md` (sinxron tarjima)

### Sabab — nima uchun shu vazifalar darhol

`ai_usage_logs` bo'lmasa billing (Phase 2) ishlay olmaydi — har AI chaqiruv qaysi tenantga tegishli ekanligini bilmasak, cost share qila olmaymiz. `match_documents()` bo'lmasa AI Concierge "Hujjatlarim ichidan top" tool'i `ILIKE` ishlatadi — natija sifati past.

---

## 2026-05-06 — Phase 1.5 (4): B-027/B-028/B-029

### Qilingan o'zgarishlar

**B-027 — In-app Notifications for HR (Realtime):**
- `createHrSetupCompleteNotification` — xodim setup tugaganda HR/leader larga bildirishnoma yuboradi
- `createEmployeeConfirmedNotification` — HR xodimni tasdiqlaganda xodimga bildirishnoma
- `useRealtimeNotifications` hook — Supabase realtime orqali `notifications` jadvalga subscribe
- `NotificationsDropdown` — `userId` prop qabul qiladi, yangi bildirishnoma kelganda avtomatik yangilanadi (polling emas)

**B-028 — /admin/health (System Monitoring):**
- Backend: `GET /admin/health` — super_admin only; DB latency + tenants/users/contacts/notifications statistikasi
- Frontend: `AdminHealthPage` — stat cards, DB latency banner (green/amber), refresh button; route: `/admin/health`

**B-029 — /admin/ai-chat (Admin AI Chat):**
- Backend: `POST /admin/ai/chat` — super_admin only; Claude + OpenAI fallback; live platform stats as context
- Frontend: `AdminAIChatPage` — chat UI, typing indicator, suggestion chips, locale-aware; route: `/admin/ai-chat`
- `adminApi.ts` — `getAdminHealth()` + `sendAdminAIMessage()` API helpers

---

## 2026-05-06 — Phase 1.5 (3): B-026 Email Templates (7 ta)

### Qilingan o'zgarishlar

**Backend — 7 ta email template (Resend API, dark indigo theme):**
1. `company_invite` — mavjud (admin contact → invite_sent)
2. `company_registered_pending` — POST /register/company → leader emailiga "Admin tasdiqlashini kuting"
3. `company_rejected` — PATCH /admin/contacts/:id/status → status=rejected → contact emailiga
4. `company_approved` — yangi PATCH /admin/tenants/:id/status → status=active → leader emailiga
5. `employee_invite` — POST /members → mode=invite → xodimga branded email (Supabase ga qo'shimcha)
6. `employee_welcome` — POST /auth/setup-complete → "Xush kelibsiz, akkauntingiz tayyor"
7. `admin_new_registration` — POST /register/company → ADMIN_NOTIFY_EMAIL ga bildirishnoma

**Yangi env var:** `ADMIN_NOTIFY_EMAIL` — yangi company ro'yxatdan o'tganda admin xabardor bo'lishi uchun

**Yangi endpoint:** `PATCH /admin/tenants/:id/status` — super_admin/sub_admin kompaniyani active/suspended/blocked qila oladi; tasdiqlanganda company_approved email ketadi

**Arxitektura:**
- `sendResendEmail(to, subject, html, tag)` — generic Resend wrapper
- `emailLayout(content)` + `emailBtn(href, label)` — reusable HTML builder helpers
- Barcha email sendlar non-blocking (await qilinmaydi — asosiy request sekinlamaydi)

---

## 2026-05-06 — Phase 1.5 (2): Matn Tuzatishlar + Language Selector

### Qilingan o'zgarishlar

**Matn va tarjima tuzatishlari (4 ta tilda — uz/ru/en/ja):**
- `landing/i18n.ts` — "ChatGPT bu bilmaydi." iborasi olib tashlandi — O'zbekiston qonunlari tavsifidan keraksiz taqqoslash
- `landing/i18n.ts` — "4 tilda" tavsifi to'g'irlandi: "O'zbekistondagi yapon, xitoy, turk kompaniyalari o'z tilida foydalana oladi." → "O'zbekistondagi xalqaro kompaniyalar istalgan tilda foydalana oladi." (barcha 4 tilda analogik)

**Login sahifasi — tarjima tuzatildi:**
- `app/i18n.ts` — `auth.platformSubtitle` kaliti 4 tilda qo'shildi (ilgari hardcoded o'zbek tilida edi)
- `LoginPage.tsx` — hardcoded o'zbek matni `translate("auth.platformSubtitle")` ga almashtirildi

**Til tanlash — button → selector:**
- `LandingNavbar.tsx` — button group → `<select>` dropdown ga o'zgartirildi
- `LoginPage.tsx` — button group → `<select>` dropdown ga o'zgartirildi
- `LanguageSwitcher.tsx` (Settings) — button group → `<select>` dropdown ga o'zgartirildi

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

---

## 2026-07-24 — 4 til va theme yakuniy tuzatishi

- `uz`, `ru`, `en`, `ja` uchun Shablonlar kutubxonasi, tablar, qidiruv, kategoriyalar, modal, validatsiya va format matnlari to'liq locale kontraktiga o'tkazildi.
- Production bazadagi 15 ta aktiv shablonning sarlavha, tavsif, barcha maydon labeli va hujjat tanasi 4 tilda to'ldirildi (`20260724065619_localize_document_templates_four_languages.sql`).
- Hujjat API si va OpenAPI locale enumlari 4 tilni qabul qiladi; locale endi frontendda `uz`ga qisqartirilmaydi.
- `next-themes` yagona theme manbasi qilindi; majburiy light theme olib tashlandi va eski utility ranglari uchun dark-mode kontrast qatlami qo'shildi.
- Umumiy navigatsiya, bildirishnomalar, sozlamalar, kompaniya profili, analytics, AI chat va command palette mayda matnlari locale tizimiga o'tkazildi.
- Tekshiruv: frontend build muvaffaqiyatli, 95/95 test o'tdi, backend bundle muvaffaqiyatli; production DB tekshiruvida `15/15` title, body va field locale to'liq.

## 2026-07-24 — Code review tuzatishlari

- Bildirishnoma turlari, admin navigatsiyasi, auth konfiguratsiya xatolari va xodim profilining barcha mayda UI matnlari `uz`, `ru`, `en`, `ja` tarjima kalitlariga o'tkazildi.
- Dark-mode compatibility qatlami endi komponentlarning aniq `dark:*` klasslarini bosib ketmaydi; background, matn, border va placeholder kontrasti saqlanadi.
- Shablonlar kutubxonasida locale tez almashgandagi async race yopildi: eskirgan javob yangi til natijasini almashtirmaydi va ochiq eski shablon modali yopiladi.
- Parolni ko'rsatish tugmasi klaviatura fokusiga qaytarildi, icon-only tugmalarga tarjima qilinadigan `aria-label` qo'shildi.
- Regressiya testi qo'shildi; yakuniy tekshiruv: 19/19 test fayli, 96/96 test va production build muvaffaqiyatli.
