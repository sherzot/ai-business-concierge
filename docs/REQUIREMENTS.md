# AI Business Concierge — requirements

> Yangilandi: 2026-08-22
> Holat qiymatlari: **Done** — ishlaydigan implementatsiya bor; **Partial** — bir qismi yoki operatsion verifikatsiya qolgan; **Skeleton** — scaffold bor, business logic ishlamaydi; **Planned** — boshlanmagan.

## Hozirgi platforma capabilitylari

| Capability | Holat | Izoh |
|---|---|---|
| Supabase Auth | Done | Email/password, reset va setup oqimlari |
| Multi-tenant va RBAC | Done | Tenant membership, role guards va tenant switcher |
| Reports | Done | KPI, health score va chartlar |
| Inbox | Partial | UI/API mavjud; real Resend delivery qayta tasdiqlanishi kerak |
| Tasks | Done | Board/list CRUD, Realtime, assignment notification va acknowledge |
| HR employee management | Done | Employee profile/invite/status oqimlari |
| Docs library | Done | List, search, CRUD va 15 ta 4 tilli template |
| AI Hujjatchi | Production binary + staged AI polish preview | Qoralama va real PDF/DOCX/private Storage productionda; polishing frontend productionda, migration/Edge stagingda. Staging provider secreti va production backend rollout kutilmoqda |
| Integrations | Partial | Telegram/Email fundamenti bor; ayrim production smoke-testlar qolgan |
| AI Concierge | Partial | Router, safety, cost log va RAG fundamenti bor; to'liq semantic/citation UX qarzi mavjud |
| Admin platforma | Partial | Asosiy boshqaruv/monitoring sahifalari bor; advanced agent va billing qismlari yo'q |
| Settings va lokalizatsiya | Done | Profil, til, theme; `uz`, `ru`, `en`, `ja` |

## Requirementlar

### Yuqori prioritet

| ID | Talab | Holat | Keyingi aniq ish |
|---|---|---|---|
| R-001 | Real email inbox | Partial | Resend receiving, signature, mapping va real delivery smoke-test |
| R-002 | Supabase Realtime | Done | Regressiya testlari bilan saqlash |
| R-015 | Task assignment notifications | Done | Regressiya testlari bilan saqlash |
| R-016 | HR Candidate Analysis | Partial | GitHub/cache, bounded PDF/DOCX va sanitized raw CV in-memory seam, request/role, PostgreSQL quota/finally-release, bounded multipart, atomic/idempotent usage-cost, minimized prompt, injectable Haiku/Sonnet stages va strict output/account-before-validation, server composition, deterministic merge/scorer/report, provider-stage orchestrator/application/schema va frontend boundary tayyor (backend HR 98/98; frontend 12/12); global deadline, live smoke, active route va full-flow qolgan |
| R-017 | AI rate limiting | Partial | Polishing daily reservation va HR tenant minute/day/concurrency lease service-role-only PostgreSQLda race-safe; HR lease denial/success/error/cleanup lifecycle'i `finally` bilan testlangan, staging pgTAP 22-case success. Production rollout, qolgan endpointlar uchun yagona quota siyosati va `Retry-After` qolgan |
| R-018 | AI cost tracking | Partial | Log wiring mavjud; usage API, tenant dashboard va plan enforcement |
| R-019 | Vector Search (RAG) | Partial | Embedding/match fundamenti bor; explicit docs tool, citation va cache |
| R-020 | Admin Dashboard | Partial | Billing/MRR/churn va advanced AI agent monitoring |
| R-021 | AI Hujjatchi binary output | Production / authenticated acceptance green | Real PDF/DOCX, embedded Noto Sans JP, O(n) PDF wrap, binary-before-DB publish, private immutable Storage, lease/CAS, restrictive RLS va 60s signed URL productionda. Authenticated DOCX/PDF download green; direct Storage `400`, cross-tenant `404`, delete `200`, authoritative residue 0/0/0 va final fixture 0/0/0/0/0. Smart CDN invalidatsiyasi 60 soniyagacha tarqalishi mumkin |
| R-022 | AI Hujjatchi polishing preview | Partial | Tenant-scoped endpoint, current-draft input, untrusted-data prompt, full-body timeout, atomic quota, stale-draft himoyasi, viewport scroll, scoped cache va 4-locale UX local/CI green; frontend productionda, staging 37/37 va `bright-api` v11. Stagingda `ANTHROPIC_API_KEY` yo'qligi sabab real-provider smoke `503 AI_UNAVAILABLE`; secret o'rnatish va production backend rollout qolgan |
| R-003 | Billing/To'lovlar | Planned | Click/Payme, subscription lifecycle va idempotency |
| R-004 | Audit log ko'rinishi | Done | Retention va filterlarni keyin kengaytirish |
| R-005 | Export/Import | Planned | Reports/Tasks CSV/Excel va bulk import |

### O'rta prioritet

| ID | Talab | Holat | Izoh |
|---|---|---|---|
| R-006 | Push/email bildirishnomalar | Partial | In-app mavjud; browser Web Push va umumiy email notification yo'q |
| R-007 | Mobil/PWA | Partial | Manifest/offline shell bor; chuqur offline sync va push yo'q |
| R-008 | Ko'p tillilik | Done | `uz`, `ru`, `en`, `ja`; yangi featurelar shu kontraktni saqlashi kerak |
| R-009 | Custom branding | Planned | Tenant logo/ranglar |
| R-010 | API rate limiting | Partial | AI DB-backed limit bor; barcha endpointlar uchun unified policy yo'q |

### Past prioritet

| ID | Talab | Holat | Izoh |
|---|---|---|---|
| R-011 | SSO/OAuth | Planned | Google/Microsoft |
| R-012 | 2FA | Planned | Auth hardening |
| R-013 | Advanced analytics | Partial | Asosiy chartlar bor; custom analytics va biznes drilldown yo'q |
| R-014 | Outbound webhooks | Planned | Tashqi tizimlarga event yuborish |

## Talab qo'shish qoidasi

1. Keyingi bo'sh `R-XXX` ID tanlanadi.
2. Muammo, acceptance criteria, modul, prioritet va qaramlik yoziladi.
3. Holat faqat kod va verifikatsiya daliliga ko'ra o'zgartiriladi.
4. Faol ish [PLAN.md](PLAN.md)ga, yakuniy natija [DEVLOG.md](DEVLOG.md)ga yoziladi.
5. Multi-tenant, role, localization, audit va secret boundary talablari har yangi feature uchun majburiy.

## Arxitektura talablari

- Feature-based frontend va typed API qatlam.
- Business data faqat `bright-api` orqali; browser direct Supabase faqat Auth/Realtime.
- Har data operatsiyasi tenant/role/ownership bilan tekshiriladi.
- Private fayllar private Storage + RLS + signed/authenticated access bilan ishlaydi.
- Server secretlari browser yoki `VITE_*` envga chiqmaydi.
