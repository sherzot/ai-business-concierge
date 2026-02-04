create extension if not exists "pgcrypto";

create table if not exists tasks (
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

create index if not exists tasks_tenant_id_idx on tasks (tenant_id);

create table if not exists inbox_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  source text not null,
  sender jsonb not null,
  subject text not null,
  preview text not null,
  timestamp timestamptz not null,
  is_read boolean not null default false,
  category text not null,
  priority text not null,
  tags text[] default '{}',
  source_message_id text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists inbox_items_tenant_source_idx
  on inbox_items (tenant_id, source_message_id);
create index if not exists inbox_items_tenant_id_idx on inbox_items (tenant_id);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  user_id text,
  action text not null,
  trace_id uuid,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_tenant_id_idx on audit_logs (tenant_id);

create table if not exists request_logs (
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

create index if not exists request_logs_tenant_id_idx on request_logs (tenant_id);

create table if not exists ai_interactions (
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

create index if not exists ai_interactions_tenant_id_idx on ai_interactions (tenant_id);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  title text not null,
  content text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists documents_tenant_id_idx on documents (tenant_id);

create table if not exists doc_chunks (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  document_id uuid not null references documents(id) on delete cascade,
  section text,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists doc_chunks_tenant_id_idx on doc_chunks (tenant_id);
create index if not exists doc_chunks_document_id_idx on doc_chunks (document_id);
