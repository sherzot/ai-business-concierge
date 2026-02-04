
  # AI Business Concierge Dashboard

  This is a code bundle for AI Business Concierge Dashboard. The original project is available at https://www.figma.com/design/oyxVQh9H4aRE1FQrz1sH0U/AI-Business-Concierge-Dashboard.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

## Backend setup (Supabase)

1) Apply database schema:

`supabase/schema.sql`

2) Configure Edge Function env vars:

- `SB_URL`
- `SB_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional, default: `gpt-4o-mini`)

3) Edge Function base URL:

`https://<project-id>.supabase.co/functions/v1/bright-api/make-server-6c2837d6/v1`

## API Notes

- All endpoints are under `/v1/*`
- Tenant context is required (JWT with `tenant_id` claim; `X-Tenant-Id` fallback)
- Standard response wrapper with `meta.trace_id`
  