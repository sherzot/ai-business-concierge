-- HR Candidate Analysis uchun tenant-scoped minute/day/concurrency quota.
-- Counter va lease jadvallari Data API'dan yashirilgan private sxemada;
-- faqat service_role public RPC chegarasi orqali rezervatsiya qiladi.

begin;

create table private.hr_candidate_quota_state (
  tenant_id text primary key
    references public.tenants(id) on delete cascade,
  minute_window_start timestamptz not null,
  minute_count integer not null default 0
    check (minute_count >= 0),
  day_window_start date not null,
  day_count integer not null default 0
    check (day_count >= 0),
  updated_at timestamptz not null default now()
);

create table private.hr_candidate_quota_leases (
  lease_id uuid primary key default gen_random_uuid(),
  tenant_id text not null
    references public.tenants(id) on delete cascade,
  user_id uuid not null
    references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint hr_candidate_quota_leases_expiry_check
    check (expires_at > created_at)
);

create index hr_candidate_quota_leases_tenant_expiry_idx
  on private.hr_candidate_quota_leases (tenant_id, expires_at);

alter table private.hr_candidate_quota_state enable row level security;
alter table private.hr_candidate_quota_leases enable row level security;
alter table private.hr_candidate_quota_state force row level security;
alter table private.hr_candidate_quota_leases force row level security;

revoke all on table
  private.hr_candidate_quota_state,
  private.hr_candidate_quota_leases
from public, anon, authenticated, service_role;

create or replace function public.reserve_hr_candidate_request(
  p_tenant_id text,
  p_user_id uuid,
  p_concurrent_limit integer,
  p_per_minute_limit integer,
  p_per_day_limit integer,
  p_lease_seconds integer default 45
)
returns table (
  allowed boolean,
  reason text,
  lease_id uuid,
  retry_after_seconds integer,
  minute_remaining integer,
  day_remaining integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_minute_start timestamptz;
  v_day_start date;
  v_state private.hr_candidate_quota_state%rowtype;
  v_active_leases integer;
  v_next_expiry timestamptz;
  v_lease_id uuid;
begin
  if p_tenant_id is null or btrim(p_tenant_id) = '' then
    raise exception 'tenant_id is required' using errcode = '22023';
  end if;
  if p_user_id is null then
    raise exception 'user_id is required' using errcode = '22023';
  end if;
  if p_concurrent_limit is null or p_concurrent_limit < 1 then
    raise exception 'concurrent_limit must be positive' using errcode = '22023';
  end if;
  if p_per_minute_limit is null or p_per_minute_limit < 1 then
    raise exception 'per_minute_limit must be positive' using errcode = '22023';
  end if;
  if p_per_day_limit is null or p_per_day_limit < 1 then
    raise exception 'per_day_limit must be positive' using errcode = '22023';
  end if;
  if p_lease_seconds is null or p_lease_seconds < 1 or p_lease_seconds > 300 then
    raise exception 'lease_seconds must be between 1 and 300'
      using errcode = '22023';
  end if;

  v_minute_start := date_trunc('minute', v_now);
  v_day_start := (v_now at time zone 'UTC')::date;

  insert into private.hr_candidate_quota_state (
    tenant_id,
    minute_window_start,
    day_window_start
  )
  values (p_tenant_id, v_minute_start, v_day_start)
  on conflict (tenant_id) do nothing;

  select state.*
  into v_state
  from private.hr_candidate_quota_state as state
  where state.tenant_id = p_tenant_id
  for update;

  if v_state.minute_window_start <> v_minute_start then
    v_state.minute_window_start := v_minute_start;
    v_state.minute_count := 0;
  end if;
  if v_state.day_window_start <> v_day_start then
    v_state.day_window_start := v_day_start;
    v_state.day_count := 0;
  end if;

  delete from private.hr_candidate_quota_leases as lease
  where lease.tenant_id = p_tenant_id
    and lease.expires_at <= v_now;

  select count(*)::integer, min(lease.expires_at)
  into v_active_leases, v_next_expiry
  from private.hr_candidate_quota_leases as lease
  where lease.tenant_id = p_tenant_id;

  if v_active_leases >= p_concurrent_limit then
    update private.hr_candidate_quota_state
    set minute_window_start = v_state.minute_window_start,
        minute_count = v_state.minute_count,
        day_window_start = v_state.day_window_start,
        day_count = v_state.day_count,
        updated_at = v_now
    where tenant_id = p_tenant_id;

    return query select
      false,
      'concurrent'::text,
      null::uuid,
      greatest(1, ceil(extract(epoch from (v_next_expiry - v_now)))::integer),
      greatest(0, p_per_minute_limit - v_state.minute_count),
      greatest(0, p_per_day_limit - v_state.day_count);
    return;
  end if;

  if v_state.minute_count >= p_per_minute_limit then
    update private.hr_candidate_quota_state
    set minute_window_start = v_state.minute_window_start,
        minute_count = v_state.minute_count,
        day_window_start = v_state.day_window_start,
        day_count = v_state.day_count,
        updated_at = v_now
    where tenant_id = p_tenant_id;

    return query select
      false,
      'minute'::text,
      null::uuid,
      greatest(
        1,
        ceil(extract(epoch from (
          v_state.minute_window_start + interval '1 minute' - v_now
        )))::integer
      ),
      0,
      greatest(0, p_per_day_limit - v_state.day_count);
    return;
  end if;

  if v_state.day_count >= p_per_day_limit then
    update private.hr_candidate_quota_state
    set minute_window_start = v_state.minute_window_start,
        minute_count = v_state.minute_count,
        day_window_start = v_state.day_window_start,
        day_count = v_state.day_count,
        updated_at = v_now
    where tenant_id = p_tenant_id;

    return query select
      false,
      'day'::text,
      null::uuid,
      greatest(
        1,
        ceil(extract(epoch from (
          ((v_state.day_window_start + 1)::timestamp at time zone 'UTC') - v_now
        )))::integer
      ),
      greatest(0, p_per_minute_limit - v_state.minute_count),
      0;
    return;
  end if;

  update private.hr_candidate_quota_state
  set minute_window_start = v_state.minute_window_start,
      minute_count = v_state.minute_count + 1,
      day_window_start = v_state.day_window_start,
      day_count = v_state.day_count + 1,
      updated_at = v_now
  where tenant_id = p_tenant_id;

  insert into private.hr_candidate_quota_leases as lease (
    tenant_id,
    user_id,
    created_at,
    expires_at
  )
  values (
    p_tenant_id,
    p_user_id,
    v_now,
    v_now + make_interval(secs => p_lease_seconds)
  )
  returning lease.lease_id into v_lease_id;

  return query select
    true,
    null::text,
    v_lease_id,
    0,
    greatest(0, p_per_minute_limit - v_state.minute_count - 1),
    greatest(0, p_per_day_limit - v_state.day_count - 1);
end;
$$;

create or replace function public.release_hr_candidate_request(
  p_tenant_id text,
  p_user_id uuid,
  p_lease_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted integer;
begin
  if p_tenant_id is null or btrim(p_tenant_id) = '' then
    raise exception 'tenant_id is required' using errcode = '22023';
  end if;
  if p_user_id is null then
    raise exception 'user_id is required' using errcode = '22023';
  end if;
  if p_lease_id is null then
    raise exception 'lease_id is required' using errcode = '22023';
  end if;

  delete from private.hr_candidate_quota_leases
  where tenant_id = p_tenant_id
    and user_id = p_user_id
    and lease_id = p_lease_id;

  get diagnostics v_deleted = row_count;
  return v_deleted = 1;
end;
$$;

revoke all on function public.reserve_hr_candidate_request(
  text, uuid, integer, integer, integer, integer
) from public, anon, authenticated;
grant execute on function public.reserve_hr_candidate_request(
  text, uuid, integer, integer, integer, integer
) to service_role;

revoke all on function public.release_hr_candidate_request(
  text, uuid, uuid
) from public, anon, authenticated;
grant execute on function public.release_hr_candidate_request(
  text, uuid, uuid
) to service_role;

commit;
