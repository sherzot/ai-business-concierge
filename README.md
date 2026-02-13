## AI Business Concierge

AI Business Concierge is a multi-tenant business operations dashboard with an AI assistant. It unifies inbox, tasks, HR pulse, docs, reports, and integrations into one interface and exposes a Supabase Edge Function API for data + AI actions.

## Docs

- [REQUIREMENTS.md](docs/REQUIREMENTS.md) – talablar va kelajakdagi funksiyalar
- [ROADMAP.md](docs/ROADMAP.md) – bosqichlar va reja
- [DEMO_USERS.md](docs/DEMO_USERS.md) – demo hisoblar
- [R001_EMAIL_SETUP.md](docs/R001_EMAIL_SETUP.md) – Resend email inbox sozlash
- [R002_REALTIME_SETUP.md](docs/R002_REALTIME_SETUP.md) – Supabase Realtime sozlash

## What it does

- Manager Reports dashboard with KPIs and trends
- Unified Inbox (email/telegram/CRM style) with categorization
- Tasks & Compliance board and list view
- HR Pulse cases + survey submissions
- Docs Hub (indexing + search + listing)
- Integrations configuration (Telegram/Email/AmoCRM style)
- AI Concierge chat with OpenAI fallback

## Architecture

- Frontend: React + TypeScript + Vite (feature-based structure under `frontend/`)
- Backend: Supabase Edge Function (`supabase/functions/server/index.tsx`)
- Database: Supabase Postgres (`supabase/schema.sql`)

## Environment variables

Frontend (Netlify or local `.env` under `frontend/`):

- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL` (optional override)
- `VITE_SENTRY_DSN` (optional)

Backend (Supabase Edge Function secrets):

- `SB_URL` – Supabase project URL
- `SB_SERVICE_ROLE_KEY` – Supabase service role key
- `JWT_SECRET` – (ixtiyoriy, `/auth/me` endi `supabase.auth.getUser` ishlatadi)
- `RESEND_WEBHOOK_SECRET` – Resend inbound webhook signing secret (R-001 email uchun)
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional, default: `gpt-4o-mini`)

## Local development

Frontend:

```
cd frontend
npm i
npm run dev
```

Backend:

1) Apply DB schema in Supabase SQL Editor:
   - `supabase/schema.sql`
2) Deploy Edge Function from `supabase/functions/server/index.tsx`

## Deployment

Supabase (Edge Function):

- Deploy function code from `supabase/functions/server/index.tsx`
- Set secrets (see Backend env vars above)
- Base URL:
  `https://<project-id>.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1`

Netlify (Frontend):

- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `dist`
- Set frontend env vars (see Frontend env vars above)

## API overview

All endpoints are under `/v1/*` and require tenant context:

- `X-Tenant-Id` header (fallback)
- or `Authorization: Bearer <jwt>` with `tenant_id` claim

Key endpoints:

- `GET /dashboard` - dashboard stats
- `GET /tasks` / `POST /tasks` - tasks list/create
- `GET /inbox` - inbox list
- `POST /ai/chat` - AI assistant chat
- `GET /ai/tools` - AI tool registry
- `GET /docs` - docs list (supports `?q=...`)
- `GET /docs/:id` - doc detail
- `POST /docs/index` - index a doc
- `POST /docs/search` - search doc chunks
- `GET /hr/cases` - HR cases list
- `POST /hr/surveys` - HR survey submit
- `GET /integrations` - integrations list
- `POST /integrations/:id` - update integration settings

Standard response wrapper:

```
{
  "data": ...,
  "meta": { "success": true, "trace_id": "..." }
}
```
  