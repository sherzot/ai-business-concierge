# AI Business Concierge – Roadmap

Requirements and roadmap are interconnected. `docs/REQUIREMENTS.md` contains requirements; this document contains phases and plans.

> Updated 2026-08-07. Operational status: [STATUS.md](STATUS.md). Active tasks: [PLAN.md](PLAN.md).

---

## Current Working Point (2026-08-07 docs snapshot)

- Phase 0, Phase 1, and Phase 1.5 are complete
- Phase 2 is active: landing plus 15 four-language templates and the draft generation pipeline are ready
- Current product task: finish AI Document Maker with AI polishing, real PDF/DOCX and private Storage
- HR Candidate Analysis remains a skeleton; the endpoint returns `501 NOT_IMPLEMENTED`
- Phase 3 billing/payments and Phase 4 advanced Admin AI have not started

---

## Phase 1: Foundation (completed) ✅

- Auth, roles, tenant
- All core modules (Reports, Inbox, Tasks, HR, Docs, Integrations)
- AI Concierge
- Settings

---

## Phase 2: AI Document Maker + Landing (active)

| Slice | Status | Requirement ID |
|------|------|----------------|
| Landing, FAQ, SEO and responsive UI | Done | — |
| 15 templates, four languages and draft pipeline | Done | R-021 |
| AI polishing, PDF/DOCX, private Storage and signed URLs | Active | R-021 |
| Telegram document wizard/delivery | Next | R-021 |
| HR Candidate Analysis full implementation | After Document Maker | R-016 |

---

## Phase 3: Sales Bot + Monetization

| Slice | Requirement ID |
|------|----------------|
| AI Sales Bot, catalog and order flow | — |
| Click/Payme and subscription lifecycle | R-003 |
| Plan limits, usage billing and grace period | R-018 |
| Resend idempotency and retry queue | R-001 |

---

## Phase 4: Advanced Admin AI + Quality

| Slice | Requirement ID |
|------|----------------|
| Billing/MRR/churn and AI cost monitoring | R-020 |
| KB, Support, Analytics and Health agents | R-020 |
| Playwright E2E and broader tenant-isolation tests | — |
| Export/delete, SSO/2FA, branding and advanced analytics by priority | R-005, R-011–R-013 |

## Phase 5: Scale

- Performance/code splitting and observability.
- Web Push and deeper PWA/offline flows.
- Regional expansion and external business integrations.

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
| 2026-08-07 | Split completed and remaining Phase 2 work; clarified the Candidate skeleton and active plan |
| 2026-07-24 | Synchronized Phase 1.5 completion and the Phase 2 starting point with code and DEVLOG |
| 2026-02-05 | Initial roadmap, Phase 1 completed |
