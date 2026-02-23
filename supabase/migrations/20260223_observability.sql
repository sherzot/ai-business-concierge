-- Observability: request_logs, audit_logs, ai_interactions, job_logs
-- trace_id text, ip, user_agent, extra; event_type, entity_type, entity_id

-- 1) request_logs: add ip, user_agent, extra, duration_ms; trace_id -> text
alter table request_logs add column if not exists ip text;
alter table request_logs add column if not exists user_agent text;
alter table request_logs add column if not exists extra jsonb default '{}'::jsonb;
alter table request_logs add column if not exists duration_ms integer;
update request_logs set duration_ms = latency_ms where duration_ms is null and latency_ms is not null;
alter table request_logs drop column if exists latency_ms;
alter table request_logs alter column trace_id type text using trace_id::text;
do $$ begin
  if exists (select 1 from information_schema.columns where table_name='request_logs' and column_name='status') then
    alter table request_logs rename column status to status_code;
  end if;
end $$;

-- 2) audit_logs: add event_type, entity_type, entity_id; trace_id -> text
alter table audit_logs add column if not exists event_type text;
alter table audit_logs add column if not exists entity_type text;
alter table audit_logs add column if not exists entity_id uuid;
update audit_logs set event_type = action where event_type is null and action is not null;
alter table audit_logs alter column trace_id type text using trace_id::text;

-- 3) ai_interactions: trace_id -> text; tenant_id nullable for background jobs
alter table ai_interactions alter column trace_id type text using trace_id::text;
alter table ai_interactions alter column tenant_id drop not null;

-- 4) job_logs (optional)
create table if not exists job_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  tenant_id text null,
  job_name text not null,
  status text not null,
  attempts int default 0,
  duration_ms int null,
  trace_id text null,
  payload jsonb default '{}'::jsonb,
  error_message text null
);
create index if not exists job_logs_tenant_id_idx on job_logs (tenant_id);
create index if not exists job_logs_created_at_idx on job_logs (created_at);
alter table job_logs enable row level security;

-- 5) tenant_daily_stats VIEW (dashboard caching)
create or replace view tenant_daily_stats as
select
  date_trunc('day', now())::date as date,
  t.id as tenant_id,
  coalesce(ts.total_tasks, 0)::int as total_tasks,
  coalesce(ts.open_tasks, 0)::int as open_tasks,
  coalesce(ts.overdue_tasks, 0)::int as overdue_tasks,
  coalesce(ts.done_tasks, 0)::int as done_tasks,
  coalesce(ii.inbox_unread_count, 0)::int as inbox_unread_count,
  coalesce(ii.pending_approvals, 0)::int as pending_approvals,
  0::int as open_hr_cases
from tenants t
left join (
  select
    tenant_id,
    count(*)::int as total_tasks,
    count(*) filter (where status != 'done')::int as open_tasks,
    count(*) filter (where status != 'done' and due_date is not null and due_date < now())::int as overdue_tasks,
    count(*) filter (where status = 'done')::int as done_tasks
  from tasks
  group by tenant_id
) ts on t.id = ts.tenant_id
left join (
  select
    tenant_id,
    count(*) filter (where is_read = false)::int as inbox_unread_count,
    count(*) filter (where is_read = false and category in ('HR','Billing'))::int as pending_approvals
  from inbox_items
  group by tenant_id
) ii on t.id = ii.tenant_id;
