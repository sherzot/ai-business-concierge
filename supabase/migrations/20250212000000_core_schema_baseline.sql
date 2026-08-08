-- Core schema baseline.
--
-- The project originally bootstrapped these objects from supabase/schema.sql,
-- outside the migration history. Keep this migration idempotent so existing
-- environments are unchanged while a fresh stack can replay every migration.

create extension if not exists "pgcrypto";

create table if not exists public.tenants (
  id text primary key,
  name text not null,
  plan text not null default 'Pro'
);

create table if not exists public.user_tenants (
  user_id uuid not null,
  tenant_id text not null references public.tenants(id) on delete cascade,
  role text not null check (
    role in ('leader', 'hr', 'accounting', 'department_head', 'employee')
  ),
  full_name text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, tenant_id)
);

create index if not exists user_tenants_user_id_idx
  on public.user_tenants (user_id);
create index if not exists user_tenants_tenant_id_idx
  on public.user_tenants (tenant_id);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  title text not null,
  status text not null default 'todo',
  priority text not null default 'medium',
  assignee jsonb,
  due_date timestamptz,
  tags text[] default '{}',
  comments integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists tasks_tenant_id_idx
  on public.tasks (tenant_id);

create table if not exists public.inbox_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  source text not null,
  sender jsonb not null,
  subject text not null,
  preview text not null,
  "timestamp" timestamptz not null,
  is_read boolean not null default false,
  category text not null,
  priority text not null,
  tags text[] default '{}',
  source_message_id text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists inbox_items_tenant_source_idx
  on public.inbox_items (tenant_id, source_message_id);
create index if not exists inbox_items_tenant_id_idx
  on public.inbox_items (tenant_id);

create table if not exists public.tenant_inbox_emails (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references public.tenants(id) on delete cascade,
  email_address text not null,
  source text not null default 'resend',
  created_at timestamptz not null default now(),
  unique (email_address)
);

create index if not exists tenant_inbox_emails_email_idx
  on public.tenant_inbox_emails (email_address);
create index if not exists tenant_inbox_emails_tenant_idx
  on public.tenant_inbox_emails (tenant_id);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  user_id text,
  action text not null,
  trace_id uuid,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_tenant_id_idx
  on public.audit_logs (tenant_id);

create table if not exists public.request_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id text,
  user_id text,
  method text not null,
  path text not null,
  status integer not null,
  latency_ms integer not null,
  trace_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists request_logs_tenant_id_idx
  on public.request_logs (tenant_id);

create table if not exists public.ai_interactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  user_id text,
  role text not null,
  prompt_name text not null,
  prompt_version text not null,
  locale text not null,
  input_excerpt text,
  output_excerpt text,
  tools_used jsonb,
  success_flag boolean not null,
  error_code text,
  latency_ms integer,
  trace_id uuid,
  created_at timestamptz not null default now(),
  context jsonb
);

create index if not exists ai_interactions_tenant_id_idx
  on public.ai_interactions (tenant_id);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  title text not null,
  content text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists documents_tenant_id_idx
  on public.documents (tenant_id);

create table if not exists public.doc_chunks (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  document_id uuid not null references public.documents(id) on delete cascade,
  section text,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists doc_chunks_tenant_id_idx
  on public.doc_chunks (tenant_id);
create index if not exists doc_chunks_document_id_idx
  on public.doc_chunks (document_id);

alter table public.tenants enable row level security;
alter table public.user_tenants enable row level security;
alter table public.tenant_inbox_emails enable row level security;
alter table public.tasks enable row level security;
alter table public.inbox_items enable row level security;
alter table public.audit_logs enable row level security;
alter table public.request_logs enable row level security;
alter table public.ai_interactions enable row level security;
alter table public.documents enable row level security;
alter table public.doc_chunks enable row level security;

-- Fresh environments must not depend on implicit platform grants. The backend
-- service role owns all mutations for these baseline tables and bypasses RLS.
grant all privileges on table
  public.tenants,
  public.user_tenants,
  public.tasks,
  public.inbox_items,
  public.tenant_inbox_emails,
  public.audit_logs,
  public.request_logs,
  public.ai_interactions,
  public.documents,
  public.doc_chunks
to service_role;
