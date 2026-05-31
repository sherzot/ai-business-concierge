-- =============================================================================
-- Phase 0 — Security hardening (Advisor warnings yopish)
-- AI Business Concierge v2.0
-- Sana: 2026-04-29
-- =============================================================================
-- Maqsad: Supabase Security Advisor signal larini tuzatish.
--
-- Audit:
--   ❌ Error 1: tenant_daily_stats view SECURITY DEFINER ko'rinadi (advisor)
--   ❌ Error 2: phase0_rls_health view SECURITY DEFINER ko'rinadi
--   🟡 Warning: increment_usage / match_knowledge / set_updated_at — search_path mutable
--   🟡 Warning: public va anon role increment_usage / match_knowledge ni execute qila oladi
--   ⚪ Info: pgvector public schema'da — qabul qilamiz (MVP scope)
-- =============================================================================

begin;
-- -----------------------------------------------------------------------------
-- 1. tenant_daily_stats — SECURITY INVOKER (default, lekin explicit)
--    PG15+ syntax: with (security_invoker = true)
-- -----------------------------------------------------------------------------
drop view if exists public.tenant_daily_stats;
create view public.tenant_daily_stats
with (security_invoker = true)
as
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
grant select on public.tenant_daily_stats to authenticated;
-- -----------------------------------------------------------------------------
-- 2. phase0_rls_health — SECURITY INVOKER + faqat service_role o'qiy oladi
--    (Bu admin diagnostic view, oddiy user ga kerak emas)
-- -----------------------------------------------------------------------------
drop view if exists public.phase0_rls_health;
create view public.phase0_rls_health
with (security_invoker = true)
as
select
  c.relname as table_name,
  count(*) filter (where p.polcmd = 'r')                  as select_policies,
  count(*) filter (where p.polcmd = 'a')                  as insert_policies,
  count(*) filter (where p.polcmd = 'w')                  as update_policies,
  count(*) filter (where p.polcmd = 'd')                  as delete_policies,
  c.relrowsecurity                                        as rls_enabled
from pg_policy p
join pg_class c on p.polrelid = c.oid
where c.relname in (
  'subscriptions', 'payments', 'ai_conversations', 'ai_messages',
  'ai_feedback', 'doc_templates', 'doc_generated', 'sales_bots',
  'catalogs', 'orders', 'knowledge_base', 'usage_tracking'
)
group by c.relname, c.relrowsecurity
order by c.relname;
comment on view public.phase0_rls_health is
  'Phase 0 jadvallari uchun RLS coverage diagnostic. Faqat service_role uchun.';
revoke all on public.phase0_rls_health from public, anon, authenticated;
grant select on public.phase0_rls_health to service_role;
-- -----------------------------------------------------------------------------
-- 3. Funksiyalar — search_path lock + restrictive grants
--    set search_path = pg_catalog, public — schema injection oldini oladi
-- -----------------------------------------------------------------------------

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
revoke execute on function public.increment_usage(text, uuid, integer, integer, integer) from public, anon;
grant execute on function public.increment_usage(text, uuid, integer, integer, integer) to authenticated, service_role;
-- match_knowledge (KB semantic search)
create or replace function public.match_knowledge(
  query_embedding  vector(1536),
  match_locale     text    default 'uz',
  match_category   text    default null,
  match_count      integer default 5,
  match_threshold  float   default 0.75
)
returns table (
  id         uuid,
  question   text,
  answer     text,
  category   text,
  tags       text[],
  similarity float
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  return query
  select
    kb.id,
    kb.question,
    kb.answer,
    kb.category,
    kb.tags,
    1 - (kb.embedding <=> query_embedding) as similarity
  from public.knowledge_base kb
  where
    kb.is_active = true
    and kb.locale = match_locale
    and (match_category is null or kb.category = match_category)
    and kb.embedding is not null
    and 1 - (kb.embedding <=> query_embedding) >= match_threshold
  order by kb.embedding <=> query_embedding
  limit match_count;
end;
$$;
revoke execute on function public.match_knowledge(vector, text, text, integer, float) from public, anon;
grant execute on function public.match_knowledge(vector, text, text, integer, float) to authenticated, service_role;
-- set_updated_at — trigger function, NOT security definer
-- Lekin search_path immutable bo'lishi kerak (advisor warning)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
commit;
-- =============================================================================
-- Eslatma — Dashboard tarafidan sozlanadigan
-- =============================================================================
-- 🟡 "Leaked Password Protection" warning — bu Auth sozlamasi, migrationda
--    yopib bo'lmaydi. Dashboard'da yoqing:
--
--    https://supabase.com/dashboard/project/ufhepwdkjqptjvxrmpjn/auth/policies
--    → Settings → Auth → "Leaked password protection" toggle ON
--
-- ⚪ "Extension pgvector in public schema" — info darajasi, MVP da qabul.
--    Production ga o'tishda extensions schema'ga ko'chirish mumkin.
-- =============================================================================;
