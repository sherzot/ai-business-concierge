-- =============================================================================
-- M-002: increment_usage() ga foydalanuvchi tekshiruvi qo'shish
-- Muammo: autentifikatsiyalangan har qanday foydalanuvchi boshqa tenant'ning
--         usage statistikasini buzishi mumkin edi (ixtiyoriy p_tenant_id bilan)
-- Yechim: auth.uid() bo'sh emas (ya'ni service_role emas) bo'lsa,
--         p_user_id va tenant a'zolikni tekshirish
-- =============================================================================

begin;

create or replace function public.increment_usage(
  p_tenant_id     text,
  p_user_id       uuid,
  p_ai_requests   integer default 0,
  p_ai_tokens     integer default 0,
  p_docs          integer default 0
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  -- Qo'ng'iroqchi tekshiruvi:
  -- auth.uid() IS NULL  → service_role (Edge Function) → tekshiruvsiz ruxsat
  -- auth.uid() IS NOT NULL → autentifikatsiyalangan foydalanuvchi → tekshirish shart
  if auth.uid() is not null then
    -- 1. Qo'ng'iroqchi o'zi uchun yozmoqda
    if auth.uid() is distinct from p_user_id then
      raise exception 'FORBIDDEN: User identity mismatch — can only increment own usage';
    end if;
    -- 2. Foydalanuvchi shu tenant'ning aktiv a'zosi
    if not exists (
      select 1 from public.user_tenants
      where user_id  = p_user_id
        and tenant_id = p_tenant_id::uuid
        and status    = 'active'
    ) then
      raise exception 'FORBIDDEN: Not an active member of this tenant';
    end if;
  end if;

  insert into public.usage_tracking
    (tenant_id, user_id, date, ai_requests, ai_tokens_used, docs_generated)
  values
    (p_tenant_id, p_user_id, current_date, p_ai_requests, p_ai_tokens, p_docs)
  on conflict (tenant_id, user_id, date) do update
    set ai_requests    = public.usage_tracking.ai_requests    + excluded.ai_requests,
        ai_tokens_used = public.usage_tracking.ai_tokens_used + excluded.ai_tokens_used,
        docs_generated = public.usage_tracking.docs_generated + excluded.docs_generated,
        updated_at     = now();
end;
$$;

-- Grant o'zgarmaydi: authenticated va service_role
-- (authenticated endi tekshiruv ostida ishlaydi)
revoke execute on function public.increment_usage(text, uuid, integer, integer, integer) from public, anon;
grant  execute on function public.increment_usage(text, uuid, integer, integer, integer) to authenticated, service_role;

commit;
