-- =============================================================================
-- Employee lifecycle — soft delete + termination tracking
-- AI Business Concierge — 2026-04-30
-- =============================================================================
-- Maqsad:
--   • Xodim ishdan ketganda yozuv yo'qolmaydi (hisobot va audit uchun saqlanadi)
--   • HR + Rahbar "Faol" va "Ishdan ketganlar" ro'yxatini ko'ra oladi
--   • Kelajakdagi HR Reports sahifasi turnover, sabab tahlilini qura oladi
-- =============================================================================

begin;

-- 1. Status ustunlarini qo'shish
alter table public.user_tenants
  add column if not exists status text not null default 'active'
    check (status in ('active', 'terminated')),
  add column if not exists terminated_at timestamptz,
  add column if not exists termination_reason text,
  add column if not exists terminated_by uuid references auth.users(id);

comment on column public.user_tenants.status is
  'active = hozir ishlayapti; terminated = ishdan ketgan (tarixiy yozuv)';
comment on column public.user_tenants.terminated_at is
  'Ishdan ketgan sana — terminated holatga o''tganda set qilinadi';
comment on column public.user_tenants.termination_reason is
  'Ixtiyoriy izoh: qisqartirish, o''z arizasi, kontrakt tugadi va h.k.';
comment on column public.user_tenants.terminated_by is
  'Kim (HR yoki Rahbar) ishdan ketkazganini auth.users.id orqali kuzatish';

-- 2. Indexlar — hisobot va filtr uchun
create index if not exists user_tenants_status_idx
  on public.user_tenants(tenant_id, status);

create index if not exists user_tenants_terminated_at_idx
  on public.user_tenants(tenant_id, terminated_at desc)
  where status = 'terminated';

-- 3. Mavjud yozuvlarni active deb belgilash (default'dan keyin migration safe)
update public.user_tenants
set status = 'active'
where status is null;

commit;

-- =============================================================================
-- Eslatma: bu migration RLS ga tegmaydi.
-- Mavjud "tenants_select_own" policy avtomat barcha statuslar uchun ishlaydi.
-- Backend tarafidan filter qilamiz (faol vs ketgan).
-- =============================================================================
