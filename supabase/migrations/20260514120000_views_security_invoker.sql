-- =============================================================================
-- View Security Hardening — 5 ta view ni SECURITY INVOKER ga o'tkazish
-- Sana: 2026-05-14
-- =============================================================================
-- Sabab:
--   Supabase Security Advisor errors: SECURITY DEFINER View
--   - public.employee_invite_stats
--   - public.v_beta_stats
--   - public.v_beta_daily_activity
--   - public.v_beta_model_usage
--   - public.v_beta_feedback
--
-- PG15+ syntax: with (security_invoker = true) — RLS qoidalari querying user
-- nuqtai nazaridan amal qiladi (view yaratuvchining emas). Bu tenant
-- izolyatsiyasini saqlash uchun shart.
--
-- Bu pattern avval ham qo'llanilgan:
--   20260304_fix_tenant_daily_stats_security.sql
--   20260429120000_security_hardening.sql (tenant_daily_stats, phase0_rls_health)
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. v_beta_stats — Telegram beta umumiy statistika
-- -----------------------------------------------------------------------------
drop view if exists public.v_beta_stats;

create view public.v_beta_stats
with (security_invoker = true)
as
select
  count(distinct telegram_chat_id)                                          as total_users,
  count(distinct case when c.created_at > now() - interval '1 day'
    then telegram_chat_id end)                                              as active_today,
  count(distinct case when c.created_at > now() - interval '7 days'
    then telegram_chat_id end)                                              as active_7d,
  count(distinct case when c.locale = 'uz' then telegram_chat_id end)       as users_uz,
  count(distinct case when c.locale = 'ru' then telegram_chat_id end)       as users_ru,
  count(distinct case when c.locale = 'en' then telegram_chat_id end)       as users_en,
  count(distinct case when c.locale = 'ja' then telegram_chat_id end)       as users_ja
from public.ai_conversations c
where platform = 'telegram';

comment on view public.v_beta_stats is
  'Telegram beta umumiy statistika. SECURITY INVOKER — caller RLS qoidalariga rioya qiladi.';

-- -----------------------------------------------------------------------------
-- 2. v_beta_daily_activity — kunlik faollik (so'nggi 14 kun)
-- -----------------------------------------------------------------------------
drop view if exists public.v_beta_daily_activity;

create view public.v_beta_daily_activity
with (security_invoker = true)
as
select
  date(m.created_at)                                     as day,
  count(distinct c.telegram_chat_id)                     as unique_users,
  count(*)                                               as total_messages,
  count(case when m.role = 'user' then 1 end)            as user_messages,
  round(sum(m.cost_usd)::numeric, 4)                     as cost_usd,
  round(avg(m.latency_ms)::numeric, 0)                   as avg_latency_ms
from public.ai_messages m
join public.ai_conversations c on c.id = m.conversation_id
where c.platform = 'telegram'
  and m.created_at > now() - interval '14 days'
group by date(m.created_at)
order by day desc;

comment on view public.v_beta_daily_activity is
  'Kunlik Telegram bot faolligi (14 kun). SECURITY INVOKER.';

-- -----------------------------------------------------------------------------
-- 3. v_beta_feedback — feedback statistika
-- -----------------------------------------------------------------------------
drop view if exists public.v_beta_feedback;

create view public.v_beta_feedback
with (security_invoker = true)
as
select
  count(*)                                               as total_feedback,
  count(case when rating = 1  then 1 end)               as good,
  count(case when rating = -1 then 1 end)               as bad,
  round(
    100.0 * count(case when rating = 1 then 1 end)
    / nullif(count(*), 0), 1
  )                                                      as satisfaction_pct
from public.ai_feedback;

comment on view public.v_beta_feedback is
  'AI Concierge javoblariga 👍/👎 statistika. SECURITY INVOKER.';

-- -----------------------------------------------------------------------------
-- 4. v_beta_model_usage — model bo'yicha ishlatish va narx
-- -----------------------------------------------------------------------------
drop view if exists public.v_beta_model_usage;

create view public.v_beta_model_usage
with (security_invoker = true)
as
select
  llm_model,
  count(*)                                               as requests,
  sum(input_tokens)                                      as total_input_tokens,
  sum(output_tokens)                                     as total_output_tokens,
  round(sum(cost_usd)::numeric, 4)                       as total_cost_usd,
  round(avg(latency_ms)::numeric, 0)                     as avg_latency_ms
from public.ai_messages
where role = 'assistant' and llm_model is not null
group by llm_model
order by requests desc;

comment on view public.v_beta_model_usage is
  'LLM modellari ishlatish va narx (Haiku vs Sonnet). SECURITY INVOKER.';

-- -----------------------------------------------------------------------------
-- 5. employee_invite_stats — tenant bo'yicha invite holati
-- -----------------------------------------------------------------------------
drop view if exists public.employee_invite_stats;

create view public.employee_invite_stats
with (security_invoker = true)
as
select
  tenant_id,
  count(*)                                          as total_invites,
  count(*) filter (where status = 'pending')        as pending,
  count(*) filter (where status = 'used')           as used,
  count(*) filter (where status = 'expired')        as expired,
  avg(resend_count)::numeric(4,1)                   as avg_resends,
  max(created_at)                                   as last_invite_at
from public.employee_invites
group by tenant_id;

comment on view public.employee_invite_stats is
  'Xodim invite tokenlari statistikasi per tenant. SECURITY INVOKER — RLS rioya qilinadi.';

-- -----------------------------------------------------------------------------
-- 6. Beta monitoring va invite stats faqat super_admin/sub_admin uchun
--    (oddiy authenticated user bilmasligi kerak)
-- -----------------------------------------------------------------------------
revoke all on public.v_beta_stats          from public, anon, authenticated;
revoke all on public.v_beta_daily_activity from public, anon, authenticated;
revoke all on public.v_beta_feedback       from public, anon, authenticated;
revoke all on public.v_beta_model_usage    from public, anon, authenticated;
-- employee_invite_stats — tenant ichida HR ko'rishi mumkin, lekin RLS o'zi cheklaydi

grant select on public.v_beta_stats          to service_role;
grant select on public.v_beta_daily_activity to service_role;
grant select on public.v_beta_feedback       to service_role;
grant select on public.v_beta_model_usage    to service_role;
grant select on public.employee_invite_stats to authenticated, service_role;

commit;

-- =============================================================================
-- Tasdiq:
--   Supabase Dashboard → Advisors → Security → Refresh
--   "Security Definer View" errors 0 ga tushishi kerak.
-- =============================================================================
