# CLAUDE.md — AI Business Concierge

> Project context and rules for Claude Code
> Read this file at the start of each session
> Version: 2.0 | Updated: 2026-04-16

---

## ABOUT THE PROJECT

AI Business Concierge — a **daily operational management** AI assistant for **already operating** small business owners in Uzbekistan.

**Key positioning:** Bank AI solutions (SQB and others) help you START a business. We help you RUN it — 365 days, every day.

**3 Modules:**
1. **AI Advisor** — tax/business/HR questions (Knowledge Base + Claude)
2. **AI Document Maker** — contract/application/order generation (PDF/DOCX)
3. **AI Sales Bot** — Telegram sales bot creation and management

**Platforms:** Telegram bot (70% traffic, primary) + Web dashboard (25%) + Admin panel (5%)

---

## TECH STACK

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Radix UI
- **Backend:** Supabase Edge Functions (Deno) + Hono framework
- **Database:** Supabase PostgreSQL + pgvector (knowledge base)
- **Auth:** Supabase Auth (multi-tenant)
- **AI:** Claude Haiku 3.5 (simple, 80%) + Claude Sonnet 4 (complex, 20%)
- **Telegram:** grammY framework (Deno)
- **Payments:** Click API + Payme API
- **Documents:** pdf-lib (PDF) + docx (DOCX)
- **Hosting:** Netlify (frontend) + Supabase (backend)
- **Monitoring:** Sentry

---

## ARCHITECTURE (from 2026-05-05)

> Full rules and patterns: `docs/ARCHITECTURE.md`

**Frontend — Feature Slice + Clean Architecture:**
```
features/{domain}/
  types.ts          ← Full entity + value objects
  api/*.ts          ← Typed (no 'any')
  hooks/use{D}.ts   ← All state + logic (ViewModel)
  components/       ← Pure UI (dumb)
  pages/*Page.tsx   ← Thin: hook + render only (max ~100 lines)
  __tests__/        ← At least 3 tests
```

**Backend — Layered Hono:**
```
server/
  middleware/auth.ts, tenant.ts
  presentation/routes/            ← Thin handlers (max 20 lines)
  application/services/{domain}/  ← hr-candidate REFERENCE
  domain/types.ts
```

**Unit testing stack:** Vitest + @testing-library/react + @testing-library/jest-dom

---

## ROLE ARCHITECTURE

```
SYSTEM LEVEL:
  super_admin ≡ sub_admin  (identical permissions)

COMPANY LEVEL (within tenant):
  company_admin  → full control over their company
  hr             → employee account creation + approval
  accountant     → finance + tax documents
  manager        → tasks and results of their department
  employee       → limited
```

---

## IMPORTANT RULES

### General
1. **TypeScript strict mode** — `strict: true` always
2. **Zod** — validation for all API input/output
3. **RLS** — Row Level Security REQUIRED for every new table
4. **Languages** — all UI strings via i18n (uz, ru, en, ja)
5. **Don't break existing code** — existing functionality continues to work when adding new features

### AI Rules
1. **Hallucination prevention** — AI only uses data from the knowledge base
2. **Confidence scoring** — confidence level in every AI response
3. **Disclaimer** — "This is AI advice and does not replace professional consultation"

### LLM Router Logic
- **simple** → Claude Haiku 3.5, 500 tokens
- **document** → Claude Sonnet 4, 2000 tokens
- **analysis** → Claude Sonnet 4, 1500 tokens
- **default** → Claude Haiku 3.5, 800 tokens

---

## COMMIT RULES

```
type(scope): description
```
Scopes: `telegram`, `ai`, `docs`, `sales-bot`, `billing`, `admin`, `auth`, `ui`, `db`, `api`

---

## ENVIRONMENT VARIABLES

### Frontend (.env)
```
VITE_SUPABASE_PROJECT_ID=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_API_BASE_URL=
VITE_SENTRY_DSN=
VITE_APP_URL=
```

### Backend (Supabase secrets)
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
TELEGRAM_BOT_TOKEN=
CLICK_MERCHANT_ID=
PAYME_MERCHANT_ID=
RESEND_API_KEY=
OPENAI_API_KEY=
```

---

## MANDATORY SESSION LIFECYCLE

Before changing code or documentation in every session:

1. Read `docs/README.md`.
2. Read `docs/STATUS.md` completely.
3. Read the newest top entry in `docs/DEVLOG.md`.
4. Identify the in-scope active task in `docs/PLAN.md`.
5. Run `git status --short` and preserve user changes.

Before declaring a material change complete, follow the DEVLOG protocol and update STATUS/PLAN; synchronize Requirements, Roadmap, or Architecture when capability, phase, or boundaries changed. Full repository rule: `AGENTS.md`.

---

## DEVLOG PROTOCOL (§DEVLOG)

**Rule:** Every significant change (new feature, bug fix, migration, architectural decision, deployment error) MUST be written to **4 files simultaneously**:

1. `docs/DEVLOG.md` — primary (Uzbek, detailed)
2. `docs/English/DEVLOG.md` — English translation
3. `docs/Russian/DEVLOG.md` — Russian translation
4. `docs/日本語/DEVLOG.md` — Japanese translation

**Format:**
```
## YYYY-MM-DD — short description

### Context
What problem existed or what was needed.

### Done
- List of concrete changes

### Files
- `path/to/file` (new/changed)
```

**Sync check:** At the end of each session, the latest entry in all 4 DEVLOG.md files must have the same date. If there's a discrepancy — add the translation immediately.

---

## CONSTANT REMINDERS

- **Migration** — DB changes only through migration files
- **Test** — new API endpoint = new test
- **i18n** — new UI string = uz + ru + en + ja translation
- **Mobile** — every UI change checked on mobile
- **DEVLOG** — every significant change goes into all 4 DEVLOG.md files (see §DEVLOG)
- **Competition** — SQB is not a competitor, it's a funnel. We handle daily ops, they handle the startup phase.
