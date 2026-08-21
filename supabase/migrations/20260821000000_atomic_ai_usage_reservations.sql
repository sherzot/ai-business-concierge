-- AI request quota uchun atomik rezervatsiya.
-- Faqat service_role chaqira oladi; brauzer clientlari uchun yopiq.

create or replace function public.reserve_ai_request(
  p_tenant_id text,
  p_user_id uuid,
  p_limit integer
)
returns table (allowed boolean, remaining integer)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_count integer;
begin
  if p_tenant_id is null or btrim(p_tenant_id) = '' then
    raise exception 'tenant_id is required' using errcode = '22023';
  end if;
  if p_user_id is null then
    raise exception 'user_id is required' using errcode = '22023';
  end if;
  if p_limit is null or p_limit < -1 then
    raise exception 'limit must be -1 or greater' using errcode = '22023';
  end if;

  if p_limit = 0 then
    return query select false, 0;
    return;
  end if;

  insert into public.usage_tracking (
    tenant_id,
    user_id,
    date,
    ai_requests,
    ai_tokens_used,
    docs_generated
  )
  values (p_tenant_id, p_user_id, current_date, 1, 0, 0)
  on conflict (tenant_id, user_id, date) do update
    set ai_requests = public.usage_tracking.ai_requests + 1,
        updated_at = now()
    where p_limit = -1
       or public.usage_tracking.ai_requests < p_limit
  returning ai_requests into v_count;

  if v_count is null then
    return query select false, 0;
    return;
  end if;

  return query
    select true,
      case when p_limit = -1 then null else greatest(0, p_limit - v_count) end;
end;
$$;

create or replace function public.release_ai_request(
  p_tenant_id text,
  p_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_updated integer;
begin
  if p_tenant_id is null or btrim(p_tenant_id) = '' then
    raise exception 'tenant_id is required' using errcode = '22023';
  end if;
  if p_user_id is null then
    raise exception 'user_id is required' using errcode = '22023';
  end if;

  update public.usage_tracking
  set ai_requests = ai_requests - 1,
      updated_at = now()
  where tenant_id = p_tenant_id
    and user_id = p_user_id
    and date = current_date
    and ai_requests > 0;

  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

revoke all on function public.reserve_ai_request(text, uuid, integer) from public;
revoke all on function public.reserve_ai_request(text, uuid, integer) from anon;
revoke all on function public.reserve_ai_request(text, uuid, integer) from authenticated;
grant execute on function public.reserve_ai_request(text, uuid, integer) to service_role;

revoke all on function public.release_ai_request(text, uuid) from public;
revoke all on function public.release_ai_request(text, uuid) from anon;
revoke all on function public.release_ai_request(text, uuid) from authenticated;
grant execute on function public.release_ai_request(text, uuid) to service_role;
