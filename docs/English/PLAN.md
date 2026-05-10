# PLAN.md — AI Business Concierge

> Step-by-step implementation plan
> Version: 3.0 | Updated: 2026-05-06
> ⚡ MARKET URGENCY: SQB "AI Advisor" launched — accelerated timeline

---

## STRATEGIC CONTEXT

State bank SQB launched "AI Advisor" product in 2026. This:
- **Validates the market** — there is demand, investment is justified
- **Accelerates us** — need to be first to market with horizontal daily solution
- **Not a competitor, but a funnel** — SQB covers the startup stage, we cover daily operations

**Goal:** Be in the market with Telegram MVP by 2026 Q2 (June).

---

## ACCELERATED TIMELINE

```
Phase 0:   Preparation ................ Weeks 1-2    ✅ COMPLETE
Phase 1:   Telegram MVP ............... Weeks 3-5    ✅ COMPLETE
Phase 1.5: Company Auth & Management .. Weeks 6-8    ⚡ URGENT — REQUIRED for billing
Phase 2:   Document Maker + Landing ... Weeks 9-12   (4 weeks)
Phase 3:   Sales Bot + Payments ....... Weeks 13-16  (4 weeks)
Phase 4:   Admin AI + Polish .......... Weeks 17-20  (4 weeks)
Phase 5:   Scale ...................... Weeks 21-27  (7 weeks)
```

> **Why Phase 1.5 is URGENT:** For billing/payments to work, companies MUST be properly registered, approved, and divided into roles. The registration → billing → revenue chain rests on this phase.

---

## PHASE 0: PREPARATION (Weeks 1-2) ✅ COMPLETE

**Goal:** Infrastructure ready, AI works, KB populated

### 0.1 LLM Migration (OpenAI → Claude)
- [x] Anthropic SDK installation (for Deno)
- [x] LLM Router service — Haiku/Sonnet auto-selection, cost tracking, caching
- [x] Migrated `/ai/chat` endpoint to Claude
- [x] OpenAI kept as fallback

### 0.2 Knowledge Base Setup
- [x] pgvector extension enabled (Supabase)
- [x] `knowledge_base` table + migration
- [x] KB service — embedding (OpenAI text-embedding-3-small), semantic search
- [x] Initial content (50+ Q&A): tax rules, deadlines, labor code

### 0.3 Database Migration (12 new tables)
- [x] `subscriptions`, `payments`, `ai_conversations`, `ai_messages`, `ai_feedback`
- [x] `doc_templates`, `doc_generated`, `sales_bots`, `catalogs`, `orders`
- [x] `knowledge_base` (pgvector), `audit_log`, `usage_tracking`
- [x] RLS policies + Performance indexes

**Result:** Claude API works, KB answers 50+ questions, DB ready

---

## PHASE 1: TELEGRAM MVP (Weeks 3-5) ✅ COMPLETE

**Goal:** AI Advisor working in Telegram bot, 50 beta users

### 1.1 Telegram Bot Setup
- [x] grammY framework setup (Supabase Edge Function)
- [x] Commands: `/start`, `/help`, `/language`, `/stats`
- [x] Error handler — bot NEVER crashes

### 1.2 Onboarding Flow
- [x] `/start` → language selection (UZ/RU/EN/JA)
- [x] Returning user distinction
- [x] Rate limit: 5 queries/day (free)

### 1.3 AI Advisor (Module 1)
- [x] AI pipeline: message → LLM Router → KB semantic search → Claude → response
- [x] Confidence check → disclaimer
- [x] Feedback: [👍] [👎]
- [x] Remaining limit display

### 1.4 Beta Launch
- [x] 50 beta users
- [x] Feedback collection

**Result:** Bot live, 50 beta users, 90%+ accuracy, <3s response

---

## PHASE 1.5: COMPANY AUTH & MANAGEMENT (Weeks 6-8) ⚡ URGENT

**Goal:** Company onboarding, employee onboarding, role system, billing foundation
**Why now:** For billing to work, companies MUST be properly registered and have clear roles.

### 1.5.1 Database — New Tables

#### A. `contact_requests` table (new)
```sql
CREATE TABLE contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  company_name text,
  stir text,
  phone text NOT NULL,
  email text NOT NULL,
  business_type text,        -- ip, llc, jsc, other
  employee_count text,       -- 1-10, 11-50, 51-200, 200+
  message text,
  source text,               -- ads, referral, search, telegram
  status text DEFAULT 'new', -- new, contacted, invite_sent, registered, rejected
  admin_note text,
  invite_token text,
  invite_expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
-- RLS: super_admin/sub_admin only
```

#### B. New columns in `tenants`
```sql
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS
  status text DEFAULT 'active',  -- pending_approval, active, suspended, blocked
  legal_form text,
  stir text,
  legal_address text,
  activity_type text,
  bank_name text,
  bank_account text,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  blocked_reason text;
```

#### C. Update `user_tenants` roles
```sql
ALTER TABLE user_tenants ADD CONSTRAINT user_tenants_role_check
  CHECK (role IN ('super_admin','sub_admin','company_admin','hr','accountant','manager','employee'));
```

#### D. `employee_invites` table
```sql
CREATE TABLE employee_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  tenant_id uuid REFERENCES tenants(id),
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  status text DEFAULT 'pending',  -- pending, used, expired
  created_at timestamptz DEFAULT now()
);
```

### 1.5.2 Backend API — New Endpoints

```
POST /v1/contact                          — contact form (public)
GET  /v1/admin/contacts                   — contact list
PATCH /v1/admin/contacts/:id/status       — change status
POST /v1/admin/contacts/:id/invite        — send invite URL
GET  /v1/admin/companies                  — company list
PATCH /v1/admin/companies/:id/approve     — approve
PATCH /v1/admin/companies/:id/block       — block
GET  /v1/register/validate/:token         — token check
POST /v1/register/company                 — company registration
POST /v1/employees                        — new employee
PATCH /v1/employees/:id/confirm           — confirm employee
POST /v1/employees/:id/resend-invite      — resend invite
GET  /v1/invite/validate/:token           — employee token check
POST /v1/invite/set-password              — set password
```

### 1.5.3 Frontend — New Pages

**Public:**
- [x] `/contact` — Contact/inquiry page
- [x] `/register?token=...` — Company registration
- [x] `/set-password?token=...` — Employee password setup
- [x] `/login` — Updated (status messages)
- [x] `/forgot-password`, `/reset-password?token=...`

**Admin:**
- [x] `/admin/contacts` — Contact management
- [x] `/admin/companies` — Company list
- [x] `/admin/health` — System health
- [x] `/admin/ai-chat` — Admin AI assistant (basic)

**Company:**
- [x] `/app/employees` — Employee list + management
- [x] `/app/employees/:id` — Employee profile

### 1.5.4 Email Templates (Resend)

```
1. company_invite.html       — Invite URL to company
2. company_pending.html      — After registration (awaiting approval)
3. company_approved.html     — When approved
4. company_rejected.html     — When rejected
5. employee_invite.html      — Password setup URL to employee
6. employee_approved.html    — When employee is approved
7. password_reset.html       — Password reset
```

### 1.5.5 Security Requirements

- Invite token: JWT, RS256, one-time use
- Company invite: 48-hour TTL
- Employee invite: 24-hour TTL
- Password strength: min 8 chars, uppercase + lowercase + number
- Brute force: 5 wrong attempts → 15-minute block

**Phase 1.5 result:** Companies can properly register, employees get secure accounts, billing foundation ready.

---

## PHASE 2: DOCUMENT MAKER + LANDING (Weeks 9-12)

**Goal:** Document generation, landing page

### 2.1 AI Document Maker (Module 2)
- [ ] 15 templates: Contracts (rental, employment, services), Applications, Others
- [ ] Generation pipeline: template → AI questions → fill → PDF/DOCX
- [ ] Noto Sans font (Uzbek/Russian chars)
- [ ] Supabase Storage integration

### 2.2 Document Maker in Telegram
- [ ] Step-by-step Q&A flow
- [ ] Document sending (Telegram document message)

### 2.3 Landing Page
- [ ] Hero, 3 modules, Pricing, FAQ
- [ ] Mobile-first, UZ/RU/EN/JA, SEO

**Result:** 15 templates, landing live, document gen <10s

---

## PHASE 3: SALES BOT + PAYMENTS (Weeks 13-16)

**Goal:** Monetization, sales bot

### 3.1 AI Sales Bot (Module 3)
- [ ] Bot creation flow (token → catalog → activation)
- [ ] Customer functionality: products, order placement
- [ ] For owner: catalog management, orders, stats

### 3.2 Payments (Click + Payme)
- [ ] Click: Prepare + Complete + webhook (idempotent)
- [ ] Payme: CreateTransaction + PerformTransaction + webhook
- [ ] Subscription management (upgrade/downgrade, 3-day grace period)

### 3.3 Usage Limiting
- [ ] Plan-based limit middleware
- [ ] Upsell message (when limit reached)

**Result:** Payments work, sales bot works, first revenue
**Metrics:** 50+ paid users, $200+ MRR

---

## PHASE 4: ADMIN AI + POLISH (Weeks 17-20)

**Goal:** Full admin AI system, 95%+ quality

### 4.1 Super Admin Panel — Complete
- [ ] `/admin` — Stats dashboard (users, revenue, AI usage, error rate, churn)
- [ ] `/admin/ai` — AI monitoring (accuracy, cost, KB gaps, trend graphs)
- [ ] `/admin/knowledge-base` — KB management (CRUD, versioning)
- [ ] `/admin/billing` — MRR, churn, LTV
- [ ] `/admin/audit` — Audit log (global)

### 4.2 Admin AI Agents (`/admin/ai-chat`) — Complete
- [ ] KB Agent: gaps, outdated responses, new content suggestions
- [ ] Support Agent: company problem explanation, solution proposals
- [ ] Analytics Agent: MRR reasons, churn analysis, usage patterns
- [ ] Health Agent: anomaly detection, real-time alerts

### 4.3 Quality Improvement
- [ ] AI accuracy 95%+
- [ ] API <200ms (non-AI), <3s (Haiku), <8s (Sonnet)
- [ ] Mobile testing (all pages)

**Result:** Full admin AI, 95%+ accuracy, stable system

---

## PHASE 5: SCALE (Weeks 21-27)

**Goal:** 5,000+ users, $8,000+ MRR, IT Park

### 5.1 Marketing
- [ ] Telegram channel (content)
- [ ] YouTube: "Managing business with AI" (in Uzbek)
- [ ] Retargeting for SQB customers
- [ ] Referral program (invite → 1 month free Pro)

### 5.2 IT Park
- [ ] IT Park resident application
- [ ] Digital Startups program (12% tax benefits)

### 5.3 Feature Expansion
- [ ] my.soliq.uz integration
- [ ] EHF (Electronic Invoice)
- [ ] Bank statement import
- [ ] API access (Company plan)

### 5.4 Regional Expansion
- [ ] Kazakhstan, Kyrgyzstan market research
- [ ] Japanese market research (`ja` localization already exists)

---

## BACKLOG DISTRIBUTION

| ID | Task | Phase | Effort | Status |
|---|---|---|---|---|
| B-018 | Contact requests (form + admin CRM) | Phase 1.5 | M | TODO |
| B-019 | Company registration flow | Phase 1.5 | L | TODO |
| B-020 | Employee onboarding | Phase 1.5 | L | DONE |
| B-021 | Login page UX (status messages) | Phase 1.5 | S | DONE |
| B-022 | Forgot/Reset password pages | Phase 1.5 | S | DONE |
| B-023 | Role system update | Phase 1.5 | M | DONE |
| B-024 | Admin company management | Phase 1.5 | M | DONE |
| B-025 | Employee management UI | Phase 1.5 | M | DONE |
| B-026 | Email templates (7 total) | Phase 1.5 | S | DONE |
| B-027 | In-app notifications for HR | Phase 1.5 | S | DONE |
| B-028 | /admin/health — system monitoring | Phase 1.5 | M | DONE |
| B-029 | Admin AI chat (basic) | Phase 1.5 | M | DONE |
| B-030 | Admin AI Agents (KB, Support, Analytics, Health) | Phase 4 | L | TODO |
| B-001 | Unit tests (Vitest) | Phase 2 | M | TODO |
| B-002 | E2E tests (Playwright) | Phase 4 | L | TODO |
| B-003 | Async AI job pattern | Phase 3 | M | TODO |
| B-004 | Rate limiting (sliding window) | Phase 3 | M | Partial |
| B-005 | DB optimization (deleted_at + indexes) | Phase 0 | S | TODO |
| B-006 | Audit log triggers | Phase 0 | M | TODO |
| B-007 | Prompt injection protection | Phase 1 | M | TODO |
| B-008 | AI cost dashboard | Phase 1 | S | Partial |
| B-009 | PWA implementation | Phase 5 | L | TODO |
| B-010 | Usage-based billing | Phase 3 | L | Partial |
| B-011 | Structured logging middleware | Phase 0 | S | Partial |
| B-012 | Health check (extended) | Phase 2 | S | Partial |
| B-013 | OpenAPI auto-generation | Phase 2 | M | TODO |
| B-014 | Semantic search (RAG) | Phase 1 | S | DONE |
| B-015 | Multi-turn AI memory | Phase 4 | M | TODO |
| B-016 | GDPR / data export | Phase 4 | M | TODO |
| B-017 | Resend webhook idempotency | Phase 3 | S | TODO |

**Effort:** S=1-3 days · M=1 week · L=2 weeks

---

## SUCCESS METRICS

| Metric | Phase 1 | Phase 3 | Phase 5 |
|---|---|---|---|
| Total users | 50 | 500 | 5,000 |
| Paid users | 0 | 50 | 2,000 |
| MRR | $0 | $200 | $8,000 |
| AI accuracy | 90% | 93% | 95%+ |
| Response time (Haiku) | <5s | <3s | <2s |
| Document templates | 0 | 15 | 30+ |
| KB articles | 50 | 200 | 500+ |

---

## CHANGELOG

| Date | Version | Change |
|---|---|---|
| 2026-05-06 | v3.0 | Phase 1.5 added (Company Auth). B-018..B-030 backlog. |
| 2026-04-30 | v2.1 | 17 strategic requirements distributed across phases (B-001..B-017) |
| 2026-04-16 | v2.0 | SQB competitive analysis + Telegram MVP timeline accelerated |

---

*PLAN.md — AI Business Concierge v3.0 · 2026-05-06*
