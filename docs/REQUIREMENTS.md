# AI Business Concierge — requirements

> Yangilandi: 2026-08-11
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
| AI Hujjatchi | Staging verified / production pending | Qoralama va real PDF/DOCX, embedded font, private Storage va signed URL stagingda green; production rollout qolgan |
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
| R-016 | HR Candidate Analysis | Skeleton | GitHub/CV/LLM implementatsiyasi, auth/rate limit/testlar |
| R-017 | AI rate limiting | Partial | Endpoint/plan bo'yicha yagona quota siyosati va `Retry-After` |
| R-018 | AI cost tracking | Partial | Log wiring mavjud; usage API, tenant dashboard va plan enforcement |
| R-019 | Vector Search (RAG) | Partial | Embedding/match fundamenti bor; explicit docs tool, citation va cache |
| R-020 | Admin Dashboard | Partial | Billing/MRR/churn va advanced AI agent monitoring |
| R-021 | AI Hujjatchi binary output | Staging verified / production pending | Real PDF/DOCX, embedded Noto Sans JP, private Storage, immutable UUID-versioned path, 5m provisional + post-signing 65s download lease, export/edit/delete row-version CAS, DB-first compensation/delete, restrictive RLS va 60s signed URL stagingda green; production rollout qolgan |
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
