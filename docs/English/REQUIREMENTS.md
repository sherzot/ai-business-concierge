# AI Business Concierge – Requirements

This document defines project requirements and future directions. Refer to this document when adding new features.

---

## 1. Current Status (MVP)

### 1.1 Auth & Roles
- [x] Supabase Auth (email/password)
- [x] Multi-tenant: `tenants`, `user_tenants`
- [x] Roles: leader, hr, accounting, department_head, employee
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
| R-003 | Billing/Payments | Subscription, plans, payment history | New |
| R-004 | Audit log view | Audit logs page for admin | Settings |
| R-005 | Export/Import | Excel, CSV export; bulk import | Reports, Tasks |

### 2.2 Medium Priority
| ID | Requirement | Description | Module |
|----|-------------|-------------|--------|
| R-006 | Push/notifications | Browser push, email notifications | All |
| R-007 | Mobile devices | PWA or React Native | All |
| R-008 | Multilingual expansion | Additional languages (ru, en) | Settings |
| R-009 | Custom branding | Logo, colors per tenant | Settings |
| R-010 | API rate limiting | Limit per user/tenant | Backend |

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
