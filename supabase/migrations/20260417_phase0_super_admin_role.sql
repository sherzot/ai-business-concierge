-- =============================================================================
-- Phase 0.4 — SUPER_ADMIN roli qo'shish
-- AI Business Concierge v2.0
-- Sana: 2026-04-17
-- =============================================================================
-- user_tenants.role CHECK constraint ga 'super_admin' qo'shamiz
-- Mavjud constraint o'chirib, yangi kengaytirilgani qo'shiladi
-- =============================================================================

-- Mavjud role CHECK constraint nomini topib o'chirish
do $$
declare
  v_constraint text;
begin
  select constraint_name
    into v_constraint
    from information_schema.table_constraints
   where table_name = 'user_tenants'
     and constraint_type = 'CHECK'
     and constraint_name like '%role%'
   limit 1;

  if v_constraint is not null then
    execute format('alter table user_tenants drop constraint %I', v_constraint);
  end if;
end;
$$;

-- Yangi CHECK constraint: super_admin qo'shildi
alter table user_tenants
  add constraint user_tenants_role_check
  check (role in ('super_admin', 'leader', 'hr', 'accounting', 'department_head', 'employee'));

-- Super admin uchun maxsus comment
comment on column user_tenants.role is
  'Foydalanuvchi roli: super_admin (tizim admin) | leader (Rahbar) | hr | accounting | department_head | employee';
