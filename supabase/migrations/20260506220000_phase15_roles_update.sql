-- =============================================================================
-- Phase 1.5 (3/5) — roles_update
-- user_tenants.role ga yangi rollar qo'shish (backward compatible)
-- Yangi: sub_admin, company_admin, accountant, manager
-- Saqlanadi: super_admin, leader, hr, accounting, department_head, employee
-- Sana: 2026-05-06
-- =============================================================================

-- Mavjud CHECK constraint ni topib o'chirish
DO $$
DECLARE
  v_constraint text;
BEGIN
  SELECT constraint_name
    INTO v_constraint
    FROM information_schema.table_constraints
   WHERE table_name       = 'user_tenants'
     AND constraint_type  = 'CHECK'
     AND constraint_name LIKE '%role%'
   LIMIT 1;

  IF v_constraint IS NOT NULL THEN
    EXECUTE format('ALTER TABLE user_tenants DROP CONSTRAINT %I', v_constraint);
  END IF;
END;
$$;
-- Yangi to'liq rol ro'yxati (eski rollar ham saqlanadi)
ALTER TABLE user_tenants
  ADD CONSTRAINT user_tenants_role_check
  CHECK (role IN (
    -- Tizim darajasi (yangi)
    'super_admin',
    'sub_admin',
    -- Kompaniya darajasi — yangi nomlar
    'company_admin',
    'hr',
    'accountant',
    'manager',
    'employee',
    -- Eski nomlar (backward compatibility — keyinchalik migrate qilinadi)
    'leader',
    'accounting',
    'department_head'
  ));
-- Ustun kommentini yangilash
COMMENT ON COLUMN user_tenants.role IS
  'Tizim: super_admin, sub_admin | Kompaniya: company_admin, hr, accountant, manager, employee | Eski (deprecated): leader, accounting, department_head';
-- user_tenants jadvaliga qo'shimcha ustunlar
ALTER TABLE user_tenants
  ADD COLUMN IF NOT EXISTS status     text NOT NULL DEFAULT 'active'
    CHECK (status IN ('password_pending','password_set','active','blocked')),
  ADD COLUMN IF NOT EXISTS position   text,          -- lavozim (HR tomonidan kiritiladi)
  ADD COLUMN IF NOT EXISTS department text,          -- bo'lim
  ADD COLUMN IF NOT EXISTS phone      text,
  ADD COLUMN IF NOT EXISTS hired_at   date,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
-- Mavjud user_tenants status ni 'active' ga o'rnatish (eski userlar)
UPDATE user_tenants SET status = 'active' WHERE status IS NULL OR status = '';
-- updated_at trigger for user_tenants
CREATE OR REPLACE FUNCTION update_user_tenants_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS user_tenants_updated_at ON user_tenants;
CREATE TRIGGER user_tenants_updated_at
  BEFORE UPDATE ON user_tenants
  FOR EACH ROW EXECUTE FUNCTION update_user_tenants_updated_at();
-- Indeks: tenant bo'yicha rolni tez topish
CREATE INDEX IF NOT EXISTS user_tenants_role_idx   ON user_tenants(role);
CREATE INDEX IF NOT EXISTS user_tenants_status_idx ON user_tenants(status);
COMMENT ON COLUMN user_tenants.status IS
  'password_pending (HR yaratdi, email ketdi) → password_set (xodim parol qo''ydi) → active (HR tasdiqladi) | blocked';
COMMENT ON COLUMN user_tenants.position IS
  'Xodim lavozimi, HR tomonidan kiritiladi';
