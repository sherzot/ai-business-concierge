-- Realtime tenant isolation and membership lifecycle hardening.
-- Browser clients may subscribe to these tables, but all writes stay behind
-- the service-role Edge Function boundary.

begin;

-- Earlier migrations introduced different subsets of the membership lifecycle.
-- Keep every status currently used by the application and employee lifecycle.
alter table public.user_tenants
  drop constraint if exists user_tenants_status_check;

alter table public.user_tenants
  add constraint user_tenants_status_check
  check (
    status in (
      'password_pending',
      'password_set',
      'active',
      'blocked',
      'terminated'
    )
  );

comment on column public.user_tenants.status is
  'password_pending -> password_set -> active; blocked = access disabled; terminated = historical employee record';

-- Keep membership rows private while allowing RLS policies to ask one narrow,
-- caller-scoped question without recursively exposing user_tenants.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create or replace function private.is_active_tenant_member(target_tenant_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.user_tenants as membership
      join public.tenants as tenant
        on tenant.id = membership.tenant_id
      where membership.user_id = (select auth.uid())
        and membership.tenant_id = target_tenant_id
        and membership.status = 'active'
        and tenant.status = 'active'
    );
$$;

revoke all on function private.is_active_tenant_member(text)
  from public, anon, authenticated;
grant execute on function private.is_active_tenant_member(text)
  to authenticated;

-- Realtime clients are read-only. All mutations are performed by bright-api.
revoke all privileges on table
  public.tasks,
  public.inbox_items,
  public.notifications
from anon, authenticated;

grant select on table
  public.tasks,
  public.inbox_items,
  public.notifications
to authenticated;

grant all privileges on table
  public.tasks,
  public.inbox_items,
  public.notifications
to service_role;

alter table public.tasks enable row level security;
alter table public.inbox_items enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "tasks_select_own_tenant" on public.tasks;
create policy "tasks_select_own_tenant"
  on public.tasks
  for select
  to authenticated
  using ((select private.is_active_tenant_member(tenant_id)));

drop policy if exists "inbox_items_select_own_tenant" on public.inbox_items;
create policy "inbox_items_select_own_tenant"
  on public.inbox_items
  for select
  to authenticated
  using ((select private.is_active_tenant_member(tenant_id)));

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    and (select private.is_active_tenant_member(tenant_id))
  );

commit;
