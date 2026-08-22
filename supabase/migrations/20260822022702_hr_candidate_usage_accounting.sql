-- Atomic, idempotent HR Candidate provider usage/cost accounting.
-- The function records billing metadata only; CV, prompts, and model output
-- never cross this boundary.

begin;

create unique index ai_usage_logs_hr_operation_uidx
  on public.ai_usage_logs (tenant_id, endpoint, trace_id)
  where endpoint like '/v1/hr/candidates/analyze/%'
    and trace_id is not null;

create or replace function public.record_hr_candidate_ai_usage(
  p_tenant_id text,
  p_user_id uuid,
  p_request_id text,
  p_stage text,
  p_model text,
  p_complexity text,
  p_prompt_tokens integer,
  p_completion_tokens integer,
  p_cost_usd numeric,
  p_cached boolean,
  p_latency_ms integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inserted integer;
  v_endpoint text;
begin
  if p_tenant_id is null or btrim(p_tenant_id) = '' then
    raise exception 'tenant_id is required' using errcode = '22023';
  end if;
  if p_user_id is null then
    raise exception 'user_id is required' using errcode = '22023';
  end if;
  if p_request_id is null or p_request_id !~ '^[0-9A-HJKMNP-TV-Z]{26}$' then
    raise exception 'request_id must be a canonical ULID' using errcode = '22023';
  end if;
  if p_stage not in ('cv_semantic', 'candidate_scoring', 'report_generation') then
    raise exception 'unsupported HR provider stage' using errcode = '22023';
  end if;
  if p_model is null or length(btrim(p_model)) < 1 or length(p_model) > 160 then
    raise exception 'model is invalid' using errcode = '22023';
  end if;
  if p_complexity not in ('simple', 'document', 'analysis', 'default') then
    raise exception 'complexity is invalid' using errcode = '22023';
  end if;
  if p_prompt_tokens is null or p_prompt_tokens < 0 or p_prompt_tokens > 5000000
    or p_completion_tokens is null or p_completion_tokens < 0
    or p_completion_tokens > 5000000 then
    raise exception 'token metrics are invalid' using errcode = '22023';
  end if;
  if p_cost_usd is null or p_cost_usd < 0 or p_cost_usd > 100 then
    raise exception 'cost metric is invalid' using errcode = '22023';
  end if;
  if p_latency_ms is null or p_latency_ms < 0 or p_latency_ms > 120000 then
    raise exception 'latency metric is invalid' using errcode = '22023';
  end if;
  if p_cached is null or (
    p_cached and (p_prompt_tokens <> 0 or p_completion_tokens <> 0 or p_cost_usd <> 0)
  ) then
    raise exception 'cached metrics are inconsistent' using errcode = '22023';
  end if;
  if not exists (
    select 1
    from public.user_tenants as membership
    join public.tenants as tenant on tenant.id = membership.tenant_id
    where membership.tenant_id = p_tenant_id
      and membership.user_id = p_user_id
      and membership.status = 'active'
      and tenant.status = 'active'
  ) then
    raise exception 'active tenant membership is required' using errcode = '42501';
  end if;

  v_endpoint := '/v1/hr/candidates/analyze/' || p_stage;
  insert into public.ai_usage_logs (
    tenant_id, user_id, endpoint, model, provider, complexity,
    prompt_tokens, completion_tokens, cost_usd, cached, latency_ms, trace_id
  ) values (
    p_tenant_id, p_user_id, v_endpoint, p_model, 'claude', p_complexity,
    p_prompt_tokens, p_completion_tokens, p_cost_usd, p_cached, p_latency_ms,
    p_request_id
  )
  on conflict do nothing;
  get diagnostics v_inserted = row_count;

  if v_inserted = 0 then
    return false;
  end if;

  insert into public.usage_tracking (
    tenant_id, user_id, date, ai_requests, ai_tokens_used, docs_generated
  ) values (
    p_tenant_id, p_user_id, current_date, 0,
    p_prompt_tokens + p_completion_tokens, 0
  )
  on conflict (tenant_id, user_id, date) do update
    set ai_tokens_used = public.usage_tracking.ai_tokens_used +
          excluded.ai_tokens_used,
        updated_at = now();

  return true;
end;
$$;

revoke all on function public.record_hr_candidate_ai_usage(
  text, uuid, text, text, text, text, integer, integer, numeric, boolean, integer
) from public, anon, authenticated;
grant execute on function public.record_hr_candidate_ai_usage(
  text, uuid, text, text, text, text, integer, integer, numeric, boolean, integer
) to service_role;

commit;
