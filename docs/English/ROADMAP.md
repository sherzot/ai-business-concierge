# AI Business Concierge – Roadmap

Requirements and roadmap are interconnected. `docs/REQUIREMENTS.md` contains requirements; this document contains phases and plans.

---

## Phase 1: Foundation (completed) ✅

- Auth, roles, tenant
- All core modules (Reports, Inbox, Tasks, HR, Docs, Integrations)
- AI Concierge
- Settings

---

## Phase 2: Short Term (1–2 months)

| Time | Task | Requirement ID |
|------|------|----------------|
| Week 1–2 | Real inbox: Email API (Resend/SendGrid) or Telegram Bot | R-001 |
| Week 2–3 | Supabase Realtime – inbox, tasks updates | R-002 |
| Week 3–4 | Audit log page (admin) | R-004 |

---

## Phase 3: Medium Term (2–4 months)

| Time | Task | Requirement ID |
|------|------|----------------|
| Month 1 | Billing / subscription (Stripe or Supabase Billing) | R-003 |
| Month 2 | Export (Excel, CSV) – Reports, Tasks | R-005 |
| Month 2–3 | Push notifications | R-006 |
| Month 3–4 | PWA / mobile optimization | R-007 |

---

## Phase 4: Long Term (4+ months)

| Time | Task | Requirement ID |
|------|------|----------------|
| Month 4+ | SSO / OAuth | R-011 |
| Month 4+ | 2FA | R-012 |
| Month 5+ | Custom branding | R-009 |
| Month 5+ | Advanced analytics | R-013 |

---

## How to Use This Document

### 1. Adding a new requirement
1. Add a new row to `docs/REQUIREMENTS.md` (ID, description, module, priority)
2. Add it to the appropriate phase in `docs/ROADMAP.md`
3. If priority changes – update the roadmap

### 2. Sprint planning
1. Select a phase from the roadmap
2. Take the relevant IDs from Requirements
3. Work in Backend → Frontend order

### 3. Changes
- Requirements and Roadmap are documentation only
- Core code lives in `frontend/` and `supabase/`
- When a new requirement arrives – write it in Requirements first, then move to code

---

## Changelog

| Date | Change |
|------|--------|
| 2026-02-05 | Initial roadmap, Phase 1 completed |
