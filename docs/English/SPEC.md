# SPEC.md — AI Business Concierge

> Daily business management assistant for Uzbek entrepreneurs
> Version: 3.0 | Date: 2026-05-06

---

## 1. ABOUT THE PRODUCT

### 1.1 One Line

AI Business Concierge — a **daily operational management** assistant for **already operating** small business owners in Uzbekistan. Unlike bank tools that help start a business, we are by their side **RUNNING** it every day — taxes, HR, contracts, and sales.

> **Key difference:** Bank AI → helps START a business. We → help RUN a business.

### 1.2 Problem

There are 403,800+ small businesses in Uzbekistan. After starting, they face daily operational problems:
- **Tax/accounting:** Don't know reporting deadlines → fines.
- **Contracts/documents:** 200-500K UZS per lawyer consultation → millions per month.
- **Sales:** Manually answering customers in evenings/weekends → losing customers.
- **HR:** Don't know hiring/firing procedures → labor code violations.

### 1.3 Solution

3 AI modules via Telegram bot + Web dashboard — **every day, every hour, every question:**
1. **AI Advisor** — tax, accounting, HR, business questions
2. **AI Document Maker** — contract, application, order generation (PDF/DOCX)
3. **AI Sales Bot** — Telegram sales bot creation and management

### 1.4 Audience

| Segment | Size | Main Problem | Value from Us |
|---|---|---|---|
| Sole proprietors (IP) | 200,000+ | Tax reporting, contracts | Daily AI advice, documents |
| Small shops/services | 150,000+ | Sales automation | Sales bot, 24/7 customer replies |
| Medium business (10-50 employees) | 50,000+ | HR, documents | HR advice, employment contracts |
| Accounting/legal firms | 5,000+ | Bulk client documents | Bulk document generation |

### 1.5 Competitive Analysis

| Competitor | Strength | Weakness | Our Advantage |
|---|---|---|---|
| **SQB "AI Advisor"** | State bank, trust | Only credit/startup stage | Daily ops, Telegram, 3 modules |
| **My.soliq.uz** | Official, accurate | Poor UI, no AI | AI + natural language + all modules |
| **ChatGPT** | Powerful AI | Doesn't know Uzbek law | Uzbekistan-specific KB |
| **1C Accounting** | Full-featured | Expensive, complex | Telegram, simple, AI advice |

**Competitive strategy:** Partnership opportunity with SQB — they give credit → client starts business → **comes to our bot** for daily questions. Not a competitor, but a funnel.

---

## 2. ROLES AND PERMISSIONS

### 2.1 Role Architecture

```
SYSTEM LEVEL
  super_admin  ≡  sub_admin  (identical full permissions)
      │
COMPANY LEVEL
      └── company_admin
              ├── hr
              ├── accountant
              ├── manager
              └── employee
```

> **Important:** `super_admin` and `sub_admin` have identical permissions. Both have full access to all companies, system, monitoring, and management.

### 2.2 Role Responsibilities

#### SUPER_ADMIN / SUB_ADMIN — System Level
| Permission | Details |
|---|---|
| Manage companies | Register, approve, block, edit |
| View contact forms | New company inquiries, status management |
| Send invite URLs | One-time invite after agreement |
| AI monitoring | All AI requests, errors, quality, cost |
| Knowledge Base | Update tax rules, document templates |
| Analytics | System-level stats, revenue, churn, NPS |
| Billing | Payments, subscriptions, refunds, MRR |
| Health monitoring | System status, API statuses, errors |

**Admin Dashboard:**
- `/admin` — Overview metrics
- `/admin/companies` — Company list + approval
- `/admin/contacts` — New inquiries
- `/admin/ai` — AI monitoring
- `/admin/health` — System health
- `/admin/ai-chat` — Admin AI assistant

#### COMPANY_ADMIN
| Permission | Details |
|---|---|
| Company profile | Full company data management |
| Manage employees | Add, remove, assign roles, block |
| All modules | AI Advisor, Document Maker, Sales Bot — full access |
| Subscription | Change plan, payment history |

#### HR
| Permission | Details |
|---|---|
| Create employee accounts | Full employee data entry |
| Approve employee accounts | Approve after password is set |
| AI Advisor | HR questions (unlimited) |
| Documents | Employment contracts, hiring/termination orders |

#### ACCOUNTANT
| Permission | Details |
|---|---|
| AI Advisor | Tax and accounting questions |
| Documents | Financial documents |
| Finance module | Income/expense, tax reports |

#### MANAGER
| Permission | Details |
|---|---|
| AI Advisor | Full (in context of own department) |
| Tasks | Assign to department employees |
| Reports | Department reports |

#### EMPLOYEE
| Permission | Details |
|---|---|
| AI Advisor | Limited (10 queries/day) |
| Tasks | View and complete assigned tasks |
| Documents | View own documents |

---

## 3. UI/UX SPECIFICATION

### 3.1 Design Principle

**"A system any ordinary person understands in 30 seconds"**
- **One main action** per page
- **Clear words** in local language
- **Large buttons** — comfortable on mobile
- **Error messages** in understandable language

### 3.2 Page Structure

**Public pages:**
```
/ (Landing Page) — Hero, 3 modules, Pricing, FAQ, CTA
/login, /register, /contact, /pricing, /about
```

**Dashboard (after auth):**
```
/app/dashboard → /app/ai-assistant → /app/documents → /app/sales-bots
/app/inbox → /app/tasks → /app/hr → /app/reports → /app/billing
/admin/* (super_admin only)
```

### 3.3 Landing Page Hero

```
"Is your business already running?"

Tax questions. Contracts. Sales bots.
All in one Telegram bot. Every day.

[Start free on Telegram]  [See Demo]

✓ Not a loan — daily help
✓ Not a lawyer — AI contracts
✓ Not manual — automated sales
```

### 3.4 Telegram Bot UX

```
/start → Choose language: [Uzbek] [Russian] [English] [日本語]
       → [💼 Get Advice] [📄 Create Document] [🛒 Sales Bot]

Advice: User types → AI response + [👍] [👎] [📋 Save]
Document: Template → Questions → PDF/DOCX → Send to Telegram
```

---

## 4. TECHNICAL ARCHITECTURE

### 4.1 Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + Radix UI |
| State | Zustand + React Query |
| Backend | Supabase Edge Functions (Deno) + Hono |
| Database | Supabase PostgreSQL + pgvector |
| Auth | Supabase Auth (multi-tenant) |
| AI (80%) | Claude Haiku 3.5 |
| AI (20%) | Claude Sonnet 4 |
| Telegram | grammY framework (Deno) |
| Document gen | pdf-lib + docx |
| Payments | Click API + Payme API |
| Hosting | Netlify + Supabase |
| Monitoring | Sentry |

### 4.2 LLM Router Logic

```typescript
function routeToLLM(query: string): LLMChoice {
  if (cache.has(query.normalized)) return cache.get(query);
  const complexity = classifyQuery(query);
  if (complexity === 'simple')   return { model: 'claude-haiku-3-5', maxTokens: 500 };
  if (complexity === 'document') return { model: 'claude-sonnet-4',  maxTokens: 2000 };
  if (complexity === 'analysis') return { model: 'claude-sonnet-4',  maxTokens: 1500 };
  return { model: 'claude-haiku-3-5', maxTokens: 800 };
}
```

---

## 5. QUALITY STANDARDS

| Criterion | Standard |
|---|---|
| AI accuracy | 95%+ for simple questions |
| Hallucination | 0% on price/date data |
| Response time | <3s (Haiku), <8s (Sonnet) |
| "I don't know" | Confidence <70% → disclaimer |

---

## 6. MONETIZATION

| Plan | Price | AI | Documents | Sales Bots |
|---|---|---|---|---|
| **Free** | 0 UZS | 5/day | 2/month | none |
| **Entrepreneur** | 49,000 UZS/mo | 50/day | 20/month | 1 |
| **Business** | 149,000 UZS/mo | unlimited | unlimited | 5 |
| **Company** | 499,000 UZS/mo | unlimited+ | unlimited | 20 |

**Payment:** Click, Payme, Bank transfer (Company plan)

---

## 7. DATABASE SCHEMA

```sql
subscriptions, payments, ai_conversations, ai_messages,
ai_feedback, doc_templates, doc_generated, sales_bots,
catalogs, orders, knowledge_base (pgvector), audit_log, usage_tracking
```

---

## 8. API ENDPOINTS

| Group | Endpoints |
|---|---|
| AI | POST /v1/ai/chat, GET /v1/ai/conversations, POST /v1/ai/feedback |
| Documents | GET /v1/doc-templates, POST /v1/docs/generate |
| Sales bot | POST/GET /v1/sales-bots |
| Billing | GET/POST /v1/billing/subscription, POST /v1/billing/webhook/click |
| Admin | GET /v1/admin/stats, GET /v1/admin/tenants |

---

## 9. SECURITY

Supabase Auth + JWT, RLS on all tables, Supabase Vault (API keys), Zod validation, Rate limiting, CORS, Audit log, HTTPS.

---

## 10. LANGUAGES

| Language | Code | Usage |
|---|---|---|
| Uzbek (Latin) | `uz` | Primary language |
| Russian | `ru` | Second language |
| English | `en` | Dashboard, admin, docs |
| Japanese | `ja` | Telegram bot, landing |

---

## 11. COMPANY REGISTRATION PROCESS

### 11.1 Receiving Inquiries

**Contact form fields:**
- Full name / responsible person name
- Company name
- Tax ID (optional)
- Phone *
- Email *
- Business type (IP / LLC / JSC / Other)
- Number of employees
- Main problem (optional)
- How did you hear about us

**Process:**
1. Form submitted → written to `contact_requests` table
2. Email + system notification to super_admin/sub_admin
3. Admin reviews in `/admin/contacts` → `contacted` → `invite_sent`
4. System sends **one-time invite URL** to company email (valid 48 hours)

### 11.2 Company Registration (Invite URL)

**Registration form:**
- Company: full name, legal form, tax ID, address, bank details
- Company Admin: name, position, phone, email, password

**After registration:**
1. Account created with `status: "pending_approval"`
2. Admin approves → company gets email "Your account is approved!"
3. If rejected → company gets email + reason

### 11.3 Account Statuses

```
contact_request → invite_sent → pending_approval → active → suspended / blocked
```

| Status | Meaning |
|---|---|
| `contact_request` | Form submitted |
| `invite_sent` | Invite URL sent |
| `pending_approval` | Registered, waiting for approval |
| `active` | Active, full access |
| `suspended` | Payment failed (3-day grace) |
| `blocked` | Blocked by admin |

---

## 12. EMPLOYEE ACCOUNT CREATION PROCESS

### 12.1 HR Creates Account

**New employee form:**
- Personal: name, date of birth, gender, passport, JSHSHIR, phone, email, address
- Work: position, department, role, hire date, salary, work type
- Additional: blood type (optional), emergency contact

### 12.2 Automatic Process

```
1. HR submits form
2. System creates account (status: "password_pending")
3. Sends password setup URL to employee email (valid 24 hours)
4. Warning to HR: "Call the employee immediately"
5. Employee sets password
6. Warning to HR: "Waiting for your approval"
7. HR approves → employee gets email "Your account is approved!"
```

### 12.3 Employee Account Statuses

```
password_pending → password_set → active → blocked
```

| Status | Meaning |
|---|---|
| `password_pending` | HR created, employee hasn't set password |
| `password_set` | Password set, waiting for HR approval |
| `active` | HR approved, full access |
| `blocked` | Blocked by HR or company_admin |

---

## 13. LOGIN AND AUTH PAGES

### 13.1 Login Page

```
- Email and password login
- "Forgot password" link
- Status messages (pending/suspended/blocked)
- "Haven't registered your company?" → contact form
- Language selector (uz/ru/en/ja)
```

### 13.2 Password Reset

```
/login → "Forgot password"
→ /forgot-password → Enter email
→ Reset URL sent to email (valid 15 minutes)
→ /reset-password?token=... → New password
→ /login + "Password updated"
```

### 13.3 Contact Page (`/contact`)

```
Audience: public (everyone)
Purpose: First step for companies wanting to try the system

Page includes:
  1. Short explanation
  2. Contact form
  3. Wait time: "Response within 1 business day"
  4. Direct contact: Telegram, Phone
```

---

## 14. SUPER ADMIN AI SYSTEM

### 14.1 Admin AI Assistant (`/admin/ai-chat`)

**Default questions:**
- "What's today's system status?"
- "Which companies had the most errors in the last 7 days?"
- "Which companies are at risk of churning?"

**Specialized Agents:**
1. **KB Agent** — KB gaps, new content suggestions, quality analysis
2. **Support Agent** — Company problem analysis, quick solutions
3. **Analytics Agent** — MRR changes, churn probability, usage stats
4. **Health Agent** — Real-time system health monitoring, anomaly detection

### 14.2 System Health Monitoring (`/admin/health`)

```
Real-time checks:
  🟢/🔴 Supabase DB (latency, connections)
  🟢/🔴 Supabase Auth (response time)
  🟢/🔴 Anthropic API (ping, quota)
  🟢/🔴 OpenAI API (embedding endpoint)
  🟢/🔴 Telegram Bot (webhook status)
  🟢/🔴 Resend Email (delivery rate)
  🟢/🔴 Netlify (build status)

Metrics (last 24 hours):
  - Total requests, error rate, avg response time
  - AI credits spent, active companies count
```

---

*SPEC.md — AI Business Concierge v3.0*
*Updated: 2026-05-06 — Role architecture, company onboarding, employee onboarding, admin AI system*
