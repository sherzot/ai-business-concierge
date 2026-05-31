-- =============================================================================
-- Phase 1.5 (4/5) — employee_profiles
-- Xodimlarning to'liq HR ma'lumotlari (HR tomonidan kiritiladi)
-- auth.users va user_tenants dan alohida — maxfiy HR data
-- Sana: 2026-05-06
-- =============================================================================

CREATE TABLE IF NOT EXISTS employee_profiles (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id       text        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Shaxsiy ma'lumotlar
  last_name       text        NOT NULL,
  first_name      text        NOT NULL,
  middle_name     text,
  birth_date      date,
  gender          text        CHECK (gender IN ('male','female')),
  citizenship     text        DEFAULT 'UZ',
  passport_number text,
  jshshir         text,                         -- JSHSHIR (INN)
  address         text,

  -- Mehnat ma'lumotlari
  position        text        NOT NULL,
  department      text,
  hire_date       date,
  work_type       text        CHECK (work_type IN ('full_time','part_time','contract')),
  work_schedule   text        CHECK (work_schedule IN ('office','remote','hybrid')),
  salary          numeric(14,2),
  salary_currency text        DEFAULT 'UZS',

  -- Aloqa
  phone           text,
  email           text,                         -- invite yuboriladigan email

  -- Qo'shimcha
  blood_group     text,
  notes           text,

  -- Favqulodda aloqa
  emergency_name  text,
  emergency_phone text,
  emergency_rel   text,                         -- munosabat: turmush o'rtog'i, ota, ona ...

  -- Kimlar tomonidan yaratilgan
  created_by      uuid        REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, tenant_id)
);
-- Indekslar
CREATE INDEX IF NOT EXISTS employee_profiles_tenant_idx  ON employee_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS employee_profiles_user_idx    ON employee_profiles(user_id)    WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS employee_profiles_jshshir_idx ON employee_profiles(jshshir)    WHERE jshshir IS NOT NULL;
-- updated_at trigger
CREATE OR REPLACE FUNCTION update_employee_profiles_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS employee_profiles_updated_at ON employee_profiles;
CREATE TRIGGER employee_profiles_updated_at
  BEFORE UPDATE ON employee_profiles
  FOR EACH ROW EXECUTE FUNCTION update_employee_profiles_updated_at();
-- RLS
ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;
-- super_admin / sub_admin — barcha kompaniyalar
DROP POLICY IF EXISTS "employee_profiles_admin_all" ON employee_profiles;
CREATE POLICY "employee_profiles_admin_all"
  ON employee_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants
      WHERE user_id = auth.uid() AND role IN ('super_admin','sub_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tenants
      WHERE user_id = auth.uid() AND role IN ('super_admin','sub_admin')
    )
  );
-- company_admin / hr — o'z tenantlari
DROP POLICY IF EXISTS "employee_profiles_hr_all" ON employee_profiles;
CREATE POLICY "employee_profiles_hr_all"
  ON employee_profiles FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants
      WHERE user_id = auth.uid()
        AND role IN ('company_admin','leader','hr')
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants
      WHERE user_id = auth.uid()
        AND role IN ('company_admin','leader','hr')
    )
  );
-- Xodim o'z profilini ko'radi (o'zgartira olmaydi)
DROP POLICY IF EXISTS "employee_profiles_self_select" ON employee_profiles;
CREATE POLICY "employee_profiles_self_select"
  ON employee_profiles FOR SELECT
  USING (user_id = auth.uid());
-- Manager o'z bo'limining xodimlarini ko'radi
DROP POLICY IF EXISTS "employee_profiles_manager_select" ON employee_profiles;
CREATE POLICY "employee_profiles_manager_select"
  ON employee_profiles FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants
      WHERE user_id = auth.uid() AND role = 'manager'
    )
  );
COMMENT ON TABLE employee_profiles IS
  'Xodimlarning to''liq HR ma''lumotlari. HR tomonidan yaratiladi. user_id — account yaratilgandan keyin to''ldiriladi.';
COMMENT ON COLUMN employee_profiles.user_id IS
  'NULL bo''lishi mumkin: HR profil yaratdi, lekin xodim hali parol o''rnatmagan';
COMMENT ON COLUMN employee_profiles.email IS
  'Xodimga invite URL yuboriladigan email. auth.users.email bilan bir xil bo''ladi.';
