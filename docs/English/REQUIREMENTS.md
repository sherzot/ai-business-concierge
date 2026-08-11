# AI Business Concierge – Requirements

This document defines project requirements and future directions. Refer to this document when adding new features.

> Updated 2026-08-11. Current operational snapshot: [STATUS.md](STATUS.md). Status terms are Done, Partial, Skeleton, and Planned.

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
| R-016 | HR Candidate Analysis | Skeleton; GitHub/CV/LLM business logic and tests remain | HR |
| R-017 | AI rate limiting | Partial; DB-backed AI limits exist, unified plan/endpoint policy remains | Backend |
| R-018 | AI cost tracking | Partial; logging exists, tenant usage dashboard/enforcement remains | Backend |
| R-019 | Vector Search (RAG) | Partial; vector/embedding foundation exists, explicit tool/citations remain | Docs |
| R-020 | Admin Dashboard | Partial; core pages exist, billing/advanced agents remain | Admin |
| R-021 | AI Document Maker binary output | Staging verified / production pending; real PDF/DOCX, embedded Noto Sans JP, O(n) PDF wrap, binary-before-DB publish, private immutable Storage, provisional/final download lease, export/edit/delete CAS, DB-first compensation/delete, restrictive RLS, and 60s signed URLs are green | Docs |
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
