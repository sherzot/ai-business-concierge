-- Fix: tenant_daily_stats must not be SECURITY DEFINER
-- Goal: keep strict tenant isolation under RLS (authenticated users only see their tenant(s))

begin;

-- Ensure RLS is enabled (safe if already enabled)
alter table public.tenants enable row level security;

-- tenants: allow authenticated to see only their tenant(s)
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'tenants'
      and policyname = 'tenants_select_own'
  ) then
    execute $policy$
      create policy tenants_select_own
        on public.tenants
        for select
        to authenticated
        using (
          id in (
            select tenant_id
            from public.user_tenants
            where user_id = auth.uid()
          )
        )
    $policy$;
  end if;
end
$$;

-- Replace view with SECURITY INVOKER semantics (default).
-- If it was previously SECURITY DEFINER, dropping guarantees it is removed.
drop view if exists public.tenant_daily_stats;

create view public.tenant_daily_stats as
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
from public.tenants t
left join (
  select
    tenant_id,
    count(*)::int as total_tasks,
    count(*) filter (where status != 'done')::int as open_tasks,
    count(*) filter (
      where status != 'done'
        and due_date is not null
        and due_date < now()
    )::int as overdue_tasks,
    count(*) filter (where status = 'done')::int as done_tasks
  from public.tasks
  group by tenant_id
) ts on t.id = ts.tenant_id
left join (
  select
    tenant_id,
    count(*) filter (where is_read = false)::int as inbox_unread_count,
    count(*) filter (
      where is_read = false
        and category in ('HR','Billing')
    )::int as pending_approvals
  from public.inbox_items
  group by tenant_id
) ii on t.id = ii.tenant_id;

-- Ensure authenticated can read the view (underlying RLS still applies)
grant select on public.tenant_daily_stats to authenticated;

commit;
