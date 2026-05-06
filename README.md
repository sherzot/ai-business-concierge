<div align="center">

# AI Business Concierge

**O'zbekistondagi kichik biznes egalari uchun kundalik operatsion AI yordamchisi**

[![Stack](https://img.shields.io/badge/stack-Supabase%20%2B%20React%20%2B%20Hono-4f46e5)](#technical-stack)
[![Status](https://img.shields.io/badge/status-Phase%201.5%20Company%20Onboarding-f59e0b)](docs/PLAN.md)
[![License](https://img.shields.io/badge/license-Proprietary-64748b)](#license)

🇺🇿 [O'zbekcha](#-ozbekcha) · 🇷🇺 [Русский](#-русский) · 🇬🇧 [English](#-english) · 🇯🇵 [日本語](#-日本語)

</div>

---

## 🇺🇿 O'zbekcha

### Loyiha haqida

AI Business Concierge — O'zbekistondagi **allaqachon ishlayotgan** kichik biznes egalari uchun **kundalik operatsion boshqaruv** AI yordamchisi. Bank AI yechimlari (SQB va boshqalar) biznes BOSHLASHGA yordam beradi — biz biznes YURITISHGA, 365 kun, har kuni yordam beramiz.

### 3 ta modul

| Modul | Tavsif | Platforma |
|---|---|---|
| 🤖 **AI Maslahatchi** | Soliq, kadrlar, biznes savollar (KB + Claude) | Telegram + Web |
| 📄 **AI Hujjatchi** | Shartnoma, ariza, buyruq generatsiya (PDF/DOCX) | Telegram + Web |
| 🛒 **AI Sotuvchi** | Telegram savdo bot yaratish va boshqarish | Telegram |

### Mavjud modullar (Phase 0 + Phase 1 + Phase 1.5)

- **Manager Reports** — KPI, health score, trend grafiklar, AI Audit
- **Unified Inbox** — Email/Telegram/CRM tarzidagi kategoriyali inbox
- **Tasks & Compliance** — Board/list view, CRUD, biriktirish, tasdiqlash
- **HR Pulse** — Cases, survey, nomzod tahlili
- **Docs Hub** — Hujjatlar ro'yxati, qidiruv, indexlash
- **Integrations** — Telegram, Email, AmoCRM
- **AI Concierge** — Chat + tool: vazifa yaratish, hujjat qidirish, inbox tasniflash
- **Settings** — Profil, til (uz / ru / en / ja)
- 🆕 **AI Maslahatchi Bot** — Telegram bot (grammY), 4 til, KB + Claude, rate limit
- 🆕 **Kompaniya Onboarding** — Murojaat → Invite → Ro'yxat → Tasdiqlash oqimi
- 🆕 **Admin Contacts** — Kompaniya murojaatlarini CRM tarzida boshqarish
- 🆕 **Login redesign** — 4 tilda to'liq tarjima, selector-based til tanlash

### Hujjatlar

- 📋 [SPEC.md](docs/SPEC.md) — to'liq spetsifikatsiya
- 🗓 [PLAN.md](docs/PLAN.md) — bosqichma-bosqich amalga oshirish rejasi
- 🤝 [CLAUDE.md](docs/CLAUDE.md) — AI yordamchi uchun loyiha konteksti
- 🔌 [CONNECTIONS.md](docs/CONNECTIONS.md) — Supabase, Anthropic, Telegram, Click, Payme sozlash
- 🚀 [FIRST_PUSH.md](docs/FIRST_PUSH.md) — birinchi deploy qo'llanmasi
- 👥 [HR_CANDIDATE_ANALYSIS.md](docs/HR_CANDIDATE_ANALYSIS.md) — nomzod tahlili modul dizayni
- 📦 [DEPLOY_SETUP.md](docs/DEPLOY_SETUP.md) — umumiy deploy qo'llanma
- ✅ [REQUIREMENTS.md](docs/REQUIREMENTS.md) · [ROADMAP.md](docs/ROADMAP.md)

### Tezkor boshlash

```bash
git clone git@github.com:sherzot/ai-business-concierge.git
cd ai-business-concierge

# Frontend
cd frontend && cp .env.example .env  # qiymatlarni to'ldiring
npm install && npm run dev

# Backend (Supabase Edge Functions)
cd ..
supabase link --project-ref <your-ref>
supabase db push
supabase functions deploy server
supabase functions deploy bright-api
```

To'liq qadamlar — [docs/FIRST_PUSH.md](docs/FIRST_PUSH.md).

---

## 🇷🇺 Русский

### О проекте

AI Business Concierge — это AI-ассистент для **повседневного операционного управления** для **уже работающих** малых бизнесов в Узбекистане. Банковские AI-решения (SQB и другие) помогают **начать** бизнес — мы помогаем **вести** бизнес, 365 дней, каждый день.

### 3 модуля

| Модуль | Описание | Платформа |
|---|---|---|
| 🤖 **AI-Консультант** | Налоги, кадры, бизнес-вопросы (KB + Claude) | Telegram + Web |
| 📄 **AI-Документовод** | Договоры, заявления, приказы (PDF/DOCX) | Telegram + Web |
| 🛒 **AI-Продавец** | Создание и управление Telegram-ботами продаж | Telegram |

### Существующие модули (Phase 0 + Phase 1 + Phase 1.5)

- **Manager Reports** — KPI, health score, тренды, AI Audit
- **Unified Inbox** — единый ящик с категориями (Email/Telegram/CRM)
- **Tasks & Compliance** — board/list, CRUD, назначение, подтверждение
- **HR Pulse** — кейсы, опросы, анализ кандидатов
- **Docs Hub** — список документов, поиск, индексация
- **Integrations** — Telegram, Email, AmoCRM
- **AI Concierge** — чат с инструментами
- **Settings** — профиль, язык (uz / ru / en / ja)
- 🆕 **AI-Консультант Бот** — Telegram-бот (grammY), 4 языка, KB + Claude, лимиты
- 🆕 **Онбординг компании** — Заявка → Инвайт → Регистрация → Подтверждение
- 🆕 **Admin Contacts** — CRM-управление заявками компаний
- 🆕 **Редизайн логина** — полный перевод на 4 языка, выбор языка через selector

### Документация

- 📋 [SPEC.md](docs/SPEC.md) — полная спецификация
- 🗓 [PLAN.md](docs/PLAN.md) — план поэтапной реализации
- 🤝 [CLAUDE.md](docs/CLAUDE.md) — контекст проекта для AI
- 🔌 [CONNECTIONS.md](docs/CONNECTIONS.md) — внешние сервисы
- 🚀 [FIRST_PUSH.md](docs/FIRST_PUSH.md) — руководство по первому деплою

### Быстрый старт

```bash
git clone git@github.com:sherzot/ai-business-concierge.git
cd ai-business-concierge
cd frontend && cp .env.example .env && npm install && npm run dev
```

Полное руководство — [docs/FIRST_PUSH.md](docs/FIRST_PUSH.md).

---

## 🇬🇧 English

### About

AI Business Concierge — a daily operational AI assistant for **already-running** small businesses in Uzbekistan. Bank AI solutions (SQB and others) help businesses **start** — we help businesses **run**, 365 days a year, every day.

### Three modules

| Module | Description | Platform |
|---|---|---|
| 🤖 **AI Consultant** | Tax, HR, business Q&A (KB + Claude) | Telegram + Web |
| 📄 **AI Doc Generator** | Contracts, applications, orders (PDF/DOCX) | Telegram + Web |
| 🛒 **AI Salesperson** | Build and manage Telegram sales bots | Telegram |

### Existing modules (Phase 0 + Phase 1 + Phase 1.5)

- **Manager Reports** — KPIs, health score, trends, AI Audit
- **Unified Inbox** — categorised inbox across Email/Telegram/CRM
- **Tasks & Compliance** — board/list views, CRUD, assignment, sign-off
- **HR Pulse** — cases, surveys, candidate analysis
- **Docs Hub** — document list, search, indexing
- **Integrations** — Telegram, Email, AmoCRM
- **AI Concierge** — chat with tools (create task, search docs, classify inbox)
- **Settings** — profile, language (uz / ru / en / ja)
- 🆕 **AI Maslahatchi Bot** — Telegram bot (grammY), 4 languages, KB + Claude, rate limiting
- 🆕 **Company Onboarding** — Request → Invite → Registration → Approval flow
- 🆕 **Admin Contacts** — CRM-style management of company requests
- 🆕 **Login redesign** — fully translated in 4 languages, selector-based language switching

### Documentation

- 📋 [SPEC.md](docs/SPEC.md) — full specification
- 🗓 [PLAN.md](docs/PLAN.md) — phased implementation plan
- 🤝 [CLAUDE.md](docs/CLAUDE.md) — project context for AI assistants
- 🔌 [CONNECTIONS.md](docs/CONNECTIONS.md) — external services setup
- 🚀 [FIRST_PUSH.md](docs/FIRST_PUSH.md) — first-deploy guide
- 👥 [HR_CANDIDATE_ANALYSIS.md](docs/HR_CANDIDATE_ANALYSIS.md) — candidate analysis module design

### Quick start

```bash
git clone git@github.com:sherzot/ai-business-concierge.git
cd ai-business-concierge
cd frontend && cp .env.example .env && npm install && npm run dev
```

Full guide — [docs/FIRST_PUSH.md](docs/FIRST_PUSH.md).

---

## 🇯🇵 日本語

### プロジェクトについて

AI Business Concierge は、ウズベキスタンの**既に運営中**の中小企業向け**日常業務管理 AI アシスタント**です。銀行系 AI ソリューション（SQB 等）は事業の**開始**を支援しますが、当サービスは事業の**運営**を 365 日、毎日サポートします。

### 3 つのモジュール

| モジュール | 説明 | プラットフォーム |
|---|---|---|
| 🤖 **AI コンサルタント** | 税務・人事・経営の質問（KB + Claude） | Telegram + Web |
| 📄 **AI 文書ジェネレーター** | 契約書・申請書・命令書（PDF/DOCX） | Telegram + Web |
| 🛒 **AI セールスエージェント** | Telegram 販売ボットの作成と運用 | Telegram |

### 既存モジュール（Phase 0 + Phase 1 + Phase 1.5）

- **Manager Reports** — KPI、ヘルススコア、トレンド、AI 監査
- **Unified Inbox** — Email/Telegram/CRM 統合受信箱
- **Tasks & Compliance** — ボード/リスト表示、CRUD、担当割当、承認
- **HR Pulse** — 案件、アンケート、候補者分析
- **Docs Hub** — 文書一覧、検索、インデックス
- **Integrations** — Telegram、Email、AmoCRM
- **AI Concierge** — ツール付きチャット
- **Settings** — プロフィール、言語（uz / ru / en / ja）
- 🆕 **AI コンサルタント Bot** — Telegram ボット（grammY）、4言語、KB + Claude、利用制限
- 🆕 **企業オンボーディング** — 申請 → 招待 → 登録 → 承認フロー
- 🆕 **Admin Contacts** — 企業申請の CRM 管理
- 🆕 **ログインページ刷新** — 4言語完全対応、セレクター式言語切替

### ドキュメント

- 📋 [SPEC.md](docs/SPEC.md) — 完全な仕様書
- 🗓 [PLAN.md](docs/PLAN.md) — フェーズ別実装計画
- 🤝 [CLAUDE.md](docs/CLAUDE.md) — AI アシスタント向けコンテキスト
- 🔌 [CONNECTIONS.md](docs/CONNECTIONS.md) — 外部サービス
- 🚀 [FIRST_PUSH.md](docs/FIRST_PUSH.md) — 初回デプロイガイド

### クイックスタート

```bash
git clone git@github.com:sherzot/ai-business-concierge.git
cd ai-business-concierge
cd frontend && cp .env.example .env && npm install && npm run dev
```

完全ガイド — [docs/FIRST_PUSH.md](docs/FIRST_PUSH.md)。

---

<a id="technical-stack"></a>

## Technical Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + Radix UI + Recharts + Framer Motion |
| State | Zustand + native React hooks (no React Query yet) |
| Backend | Supabase Edge Functions (Deno) + Hono framework |
| Database | Supabase PostgreSQL + pgvector |
| Auth | Supabase Auth (multi-tenant, JWT) |
| AI (primary, 80%) | Claude Haiku 3.5 (`claude-3-5-haiku-20241022`) |
| AI (deep, 20%) | Claude Sonnet 4.5 (`claude-sonnet-4-5`) |
| Embeddings | OpenAI `text-embedding-3-small` (KB only) |
| Telegram | grammY framework (Deno) |
| Payments | Click API + Payme API (Phase 3) |
| Hosting | Netlify (frontend) + Supabase (backend) |
| Monitoring | Sentry |
| i18n | uz, ru, en, ja |

> **Stack note:** The project runs entirely on **Supabase + Hono (Deno)**. There is no Laravel, Express, NestJS, or Redis dependency. Earlier roadmap drafts mentioned Laravel as an aspirational target — that direction has been formally abandoned in favour of staying on Supabase Edge Functions.

## Project structure

```
ai-business-concierge/
├── docs/                       # Specification & guides
│   ├── CLAUDE.md
│   ├── SPEC.md
│   ├── PLAN.md
│   ├── CONNECTIONS.md
│   ├── FIRST_PUSH.md
│   ├── HR_CANDIDATE_ANALYSIS.md
│   ├── DEPLOY_SETUP.md
│   ├── REQUIREMENTS.md
│   └── ROADMAP.md
│
├── frontend/                   # React + Vite + Tailwind
│   └── src/
│       ├── app/                # Global config, providers, router, i18n
│       ├── features/           # Feature-based modules:
│       │   ├── auth/
│       │   ├── docs/
│       │   ├── hr/
│       │   │   └── candidates/  # HR Candidate Analysis (skeleton)
│       │   ├── inbox/
│       │   ├── integrations/
│       │   ├── notifications/
│       │   ├── reports/
│       │   ├── settings/
│       │   ├── tasks/
│       │   └── tenants/
│       ├── shared/             # Common UI, hooks, lib (apiClient, supabase, AI)
│       └── styles/             # globals.css, theme.css, theme-indigo-slate.css
│
├── supabase/
│   ├── migrations/             # PostgreSQL migrations (schema, RLS, hardening)
│   └── functions/
│       ├── server/             # Main Hono API (~1700 lines)
│       │   ├── index.ts
│       │   ├── middleware/     # auth.ts, tenant.ts
│       │   ├── routes/         # hr-candidate.ts, …
│       │   └── services/       # llm-router, knowledge-base, hr-candidate, usage-tracking
│       ├── telegram-bot/       # 🆕 Phase 1: AI Maslahatchi Telegram bot (grammY)
│       │   ├── index.ts        # Webhook entry point
│       │   ├── bot.ts          # Command + callback registration
│       │   ├── handlers/       # start, help, language, message, feedback
│       │   └── services/       # session.ts, maslahatchi.ts
│       ├── bright-api/         # Frontend gateway (re-exports server)
│       └── _shared/            # logging, helpers
│
└── resources/
    ├── prompts/                # AI prompts (uz/ru): ai_coo, shadow_cfo, inbox_classifier, …
    ├── knowledge-base/         # Tax, labour code Q&A (Phase 0.2)
    └── templates/              # Document templates (Phase 2)
```

## Modules in `frontend/src/features/`

| Module | Purpose |
|---|---|
| **auth** | Login, role, tenant context, `AuthContext`, `ProtectedLayout` |
| **docs** | Document list, search, detail view, indexing |
| **hr** | HR cases, surveys; `hr/candidates/` — Candidate analysis (skeleton) |
| **inbox** | Unified inbox, filters, real-time updates |
| **integrations** | Telegram, Email, AmoCRM settings |
| **notifications** | Task assignment notifications, dropdown |
| **reports** | Dashboard KPIs, report download, AI Audit |
| **settings** | Profile, language switcher |
| **tasks** | Board/list view, CRUD, assignee, acknowledge |
| **tenants** | Tenant switcher, tenant settings |

## Database tables (Phase 0 complete)

| Table | Purpose |
|---|---|
| `tenants`, `user_tenants` | Multi-tenant + role mapping |
| `tasks`, `notifications`, `inbox_items` | Existing modules |
| `documents`, `doc_chunks` | Docs Hub + search |
| `subscriptions`, `payments` | Billing (Phase 3) |
| `ai_conversations`, `ai_messages`, `ai_feedback` | AI chat history + feedback |
| `doc_templates`, `doc_generated` | Document generation (Phase 2) |
| `sales_bots`, `catalogs`, `orders` | Telegram sales bots (Phase 3) |
| `knowledge_base` | pgvector-backed RAG (Phase 0.2) |
| `usage_tracking` | Per-tenant per-day usage limits |
| `audit_logs`, `request_logs` | Observability |

All tables have RLS enabled with full select/insert/update/delete policies (see `20260429_phase0_rls_complete.sql`).

## API endpoints (subset)

All endpoints under `/v1/*`, require tenant context (`X-Tenant-Id` header or JWT `tenant_id` claim):

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/auth/me` | Current user |
| GET | `/dashboard` | Dashboard stats |
| GET, POST | `/inbox`, `/inbox/ingest` | Inbox + ingest |
| GET, POST, PATCH, DELETE | `/tasks`, `/tasks/:id` | Task CRUD |
| POST | `/tasks/:id/acknowledge` | Acknowledge task |
| GET, PATCH | `/notifications`, `/notifications/:id/read` | Notifications |
| POST | `/ai/chat` | AI chat (Claude + KB RAG) |
| POST | `/ai/feedback` | 👍/👎 feedback |
| GET | `/ai/tools` | Tool registry |
| GET, POST | `/docs`, `/docs/index`, `/docs/search` | Docs |
| GET, POST | `/hr/cases`, `/hr/surveys` | HR |
| POST | `/hr/candidates/analyze` | Candidate analysis (501 stub) |
| GET, POST | `/integrations`, `/integrations/:id` | Integrations |

Standard response envelope:

```json
{
  "data": { ... },
  "meta": { "success": true, "trace_id": "..." }
}
```

## Status (2026-05-06)

✅ **Phase 0 complete** — DB schema (12 new tables), RLS policies, security hardening, LLM Router (Claude Haiku/Sonnet), Knowledge Base (pgvector + RAG), AI feedback, Indigo + Slate theme tokens.

✅ **Architecture upgrade** — DDD/Clean Architecture: full domain types, proper ViewModel hooks, 34 unit tests (Vitest), `docs/ARCHITECTURE.md` as canonical guide.

✅ **Phase 1 complete (code)** — Telegram bot (grammY), 4 languages, AI Maslahatchi pipeline, rate limiting, session management, beta monitoring. Blocked on API credits.

🚀 **Phase 1.5 in progress** — Company Auth & Management:
- Landing page Company Onboarding section (4 languages)
- Login redesign — fully translated (4 langs), selector-based language switcher
- DB migrations: `contact_requests`, `employee_invites`, tenant status, role system
- Company invite → registration flow (`/register`)
- Admin contacts panel (`/admin/contacts`)
- i18n fixes: text corrections across all 4 languages

⏳ **Phase 1.5 remaining** — per [docs/PLAN.md](docs/PLAN.md): employee onboarding, billing integration.

⏸ **Phase 1 Telegram** — blocked on Anthropic + OpenAI API credits. Bot code ready; resume after credits added.

See [docs/PLAN.md](docs/PLAN.md) for the full roadmap.

## Local development

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Backend (Supabase Edge Functions)

```bash
supabase link --project-ref <your-ref>
supabase db push
supabase functions deploy server
supabase functions deploy bright-api
supabase functions deploy telegram-bot
```

Required environment variables — see `frontend/.env.example` and `supabase/.env.example`.

## Security note — `tenant_daily_stats` and `phase0_rls_health`

Both views are explicitly created with `with (security_invoker = true)` so RLS policies of the calling user apply, not the view owner's. See `supabase/migrations/20260429120000_security_hardening.sql`.

## Contributing

This is a private project. Repository owner: [@sherzot](https://github.com/sherzot).

## License

Proprietary. © 2026 Sher Musurmonov. All rights reserved.
