-- =============================================================================
-- Platform tenant — SUPER_ADMIN uchun maxsus tenant
-- 2026-04-30
-- =============================================================================
-- Maqsad:
--   • SUPER_ADMIN platforma darajasidagi rol — bitta kompaniyaga bog'liq emas
--   • Lekin user_tenants jadvalida tenant_id NOT NULL — shuning uchun
--     maxsus 'platform' tenant kerak
--   • Bu tenantning a'zolari faqat super_admin bo'lishi mumkin (kelajakda)
-- =============================================================================

-- 1. Platform tenant yaratish (idempotent)
insert into public.tenants (id, name, plan)
values ('platform', 'AI Business Concierge — Platform', 'enterprise')
on conflict (id) do update
  set name = excluded.name,
      plan = excluded.plan;

comment on table public.tenants is
  'Multi-tenant: har kompaniya o''z tenant''i. ''platform'' — SUPER_ADMIN uchun maxsus tenant.';

-- 2. (Ixtiyoriy) Permissions ustuni mavjud bo'lsa, super_admin'ga "*" beriladi
-- Hozir user_tenants.permissions jsonb / text[] ekanligini bilmaymiz —
-- bu joyda hech narsa qilmaymiz. Manual SQL bilan SUPER_ADMIN'ga huquq beriladi.

-- =============================================================================
-- ⚠️ KEYINGI QADAM — SQL EDITOR DA QO'LDA BAJARILADI
-- =============================================================================
-- Quyidagi snippetni Supabase Dashboard → SQL Editor da bajarib,
-- o'zingizni SUPER_ADMIN qilib belgilang:
--
--   -- 1. Avval auth.users dan o'z user_id'ngizni oling:
--   select id, email from auth.users where email = 'sherzoddeveloper@gmail.com';
--
--   -- 2. user_tenants jadvalga super_admin sifatida qo'shing:
--   insert into public.user_tenants (user_id, tenant_id, role, full_name, status)
--   values (
--     '<USER_ID_BU_YERGA>',  -- yuqoridagi 1-qadamdan
--     'platform',
--     'super_admin',
--     'Sherzod (Super Admin)',
--     'active'
--   )
--   on conflict (user_id, tenant_id) do update set role = 'super_admin';
--
--   -- 3. Tekshirish:
--   select ut.full_name, ut.role, t.name
--   from public.user_tenants ut
--   join public.tenants t on t.id = ut.tenant_id
--   where ut.role = 'super_admin';
-- =============================================================================
