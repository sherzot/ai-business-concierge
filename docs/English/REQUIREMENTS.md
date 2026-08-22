# AI Business Concierge – Requirements

This document defines project requirements and future directions. Refer to this document when adding new features.

> Updated 2026-08-22. Current operational snapshot: [STATUS.md](STATUS.md). Status terms are Done, Partial, Skeleton, and Planned.

---

## 1. Current Status (MVP)

### 1.1 Auth & Roles
- [x] Supabase Auth (email/password)
- [x] Multi-tenant: `tenants`, `user_tenants`
- [x] Roles: super_admin, sub_admin, company_admin, leader, hr, accounting/accountant, department_head/manager, employee
- [x] Role-based access: `canAccess(module)`
- [x] Tenant switcher

### 1.2 Modules
- [x] Reports – KPI, health score, daily report
- [x] Inbox – unified inbox (email/telegram)
- [x] Tasks – board/list, CRUD
- [x] HR – cases, surveys
- [x] Docs – list, search, index
- [x] Integrations – Telegram, Email, AmoCRM
- [x] AI Concierge – chat, tools
- [x] Settings – profile, language

### 1.3 Tech Stack
- Frontend: React + Vite + TypeScript
- Backend: Supabase Edge Function (Hono)
- DB: Supabase Postgres
- Deploy: Netlify + Supabase

---

## 2. Future Requirements (by Priority)

### 2.1 High Priority
| ID | Requirement | Description | Module |
|----|-------------|-------------|--------|
| R-001 | Real inbox integration | Email (Resend) webhook – partially done ✅ | Inbox |
| R-002 | Real-time updates | Supabase Realtime – inbox, tasks ✅ | Inbox, Tasks |
| R-015 | Task assignment notifications | Alert assignee when leader assigns, acknowledgement, status transparency ✅ | Tasks |
| R-016 | HR Candidate Analysis | Partial; bounded adapters, local PDF/DOCX plus sanitized raw-CV in-memory seam, request/role, PostgreSQL quota/finally-release lifecycle, multipart, atomic/idempotent usage-cost, minimized prompts, injectable Haiku/Sonnet stages, strict output/account-before-validation, server composition, deterministic merge/scorer/report, provider-stage orchestrator/30s-deadline application/schema, and frontend boundary are ready (backend HR 99/99; frontend 12/12). Typed provider-unavailable/live smoke, active route, and full flow remain | HR |
| R-017 | AI rate limiting | Partial; polishing daily reservation and HR tenant minute/day/concurrency leases are race-safe in service-role-only PostgreSQL; HR denial/success/error/cleanup lease lifecycle is verified with `finally`, and staging HR's 22-case pgTAP runner succeeded. Production rollout, unified policy for other endpoints, and `Retry-After` remain | Backend |
| R-018 | AI cost tracking | Partial; logging exists, tenant usage dashboard/enforcement remains | Backend |
| R-019 | Vector Search (RAG) | Partial; vector/embedding foundation exists, explicit tool/citations remain | Docs |
| R-020 | Admin Dashboard | Partial; core pages exist, billing/advanced agents remain | Admin |
| R-021 | AI Document Maker binary output | Production / authenticated acceptance green; real PDF/DOCX, embedded Noto Sans JP, O(n) PDF wrap, binary-before-DB publish, private immutable Storage, lease/CAS, restrictive RLS, and 60s signed URLs are live. Authenticated DOCX/PDF downloads are green; direct Storage `400`, cross-tenant `404`, delete `200`, authoritative residue 0/0/0, and final fixture 0/0/0/0/0. Smart CDN invalidation can take up to 60 seconds | Docs |
| R-022 | AI Document Assistant polishing preview | Partial; tenant-scoped endpoint, current-draft input, untrusted-data prompt, full-body timeout, atomic quota, stale-draft protection, viewport scrolling, scoped cache, and four-locale UX are local/CI green; frontend is in production, staging is at 37/37 and `bright-api` v11. Real-provider smoke returns `503 AI_UNAVAILABLE` because staging lacks `ANTHROPIC_API_KEY`; setting the secret and production backend rollout remain | Docs |
| R-003 | Billing/Payments | Subscription, plans, payment history | New |
| R-004 | Audit log view | Admin audit log page and backend endpoint ✅ | Settings |
| R-005 | Export/Import | Excel, CSV export; bulk import | Reports, Tasks |

### 2.2 Medium Priority
| ID | Requirement | Description | Module |
|----|-------------|-------------|--------|
| R-006 | Push/notifications | Browser push, email notifications | All |
| R-007 | Mobile devices | Partial PWA shell; deep offline sync/push remains | All |
| R-008 | Multilingual expansion | Done: uz, ru, en, ja | Settings |
| R-009 | Custom branding | Logo, colors per tenant | Settings |
| R-010 | API rate limiting | Partial: AI protection exists; unified API policy remains | Backend |

### 2.3 Low Priority
| ID | Requirement | Description | Module |
|----|-------------|-------------|--------|
| R-011 | SSO / OAuth | Google, Microsoft login | Auth |
| R-012 | 2FA | Two-factor authentication | Auth |
| R-013 | Advanced analytics | Custom reports, charts | Reports |
| R-014 | Webhook output | Send events to external systems | Integrations |

---

## 3. Rules for Adding Requirements

When adding a new requirement:
1. **ID** – in `R-XXX` format (next number)
2. **Description** – brief, clear
3. **Module** – which module it belongs to
4. **Priority** – high / medium / low
5. **Dependencies** – dependencies on other requirements

---

## 4. Architecture Principles

- **Feature-based** – each module in its own `features/` folder
- **API-first** – backend endpoints first, then frontend
- **Role-based** – each module checks `canAccess`
- **Tenant isolation** – all data separated via `tenant_id`
