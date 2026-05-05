-- =============================================================================
-- Phase 1.5 (2/5) — tenant_company_info
-- tenants jadvaliga kompaniya ma'lumotlari va holat ustunlari qo'shish
-- Sana: 2026-05-06
-- =============================================================================

-- Holat ustuni (mavjud tenantlar: 'active' default)
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('pending_approval','active','suspended','blocked'));

-- Kompaniya yuridik ma'lumotlari
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS legal_form     text CHECK (legal_form IN ('yatt','llc','jsc','other')),
  ADD COLUMN IF NOT EXISTS stir           text,
  ADD COLUMN IF NOT EXISTS legal_address  text,
  ADD COLUMN IF NOT EXISTS activity_type  text,
  ADD COLUMN IF NOT EXISTS reg_date       date,
  ADD COLUMN IF NOT EXISTS website        text,
  ADD COLUMN IF NOT EXISTS description    text;

-- Bank ma'lumotlari
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS bank_name      text,
  ADD COLUMN IF NOT EXISTS bank_account   text;

-- Kompaniya hajmi
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS employee_count_range text
    CHECK (employee_count_range IN ('1-10','11-50','51-200','200+'));

-- Murojaat bilan bog'lanish
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS contact_request_id uuid REFERENCES contact_requests(id) ON DELETE SET NULL;

-- Tasdiqlash / bloklash ma'lumotlari
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS approved_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at    timestamptz,
  ADD COLUMN IF NOT EXISTS blocked_reason text,
  ADD COLUMN IF NOT EXISTS blocked_at     timestamptz;

-- Aloqa ma'lumotlari (company_admin dan farqli, kompaniya umumiy)
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS contact_phone  text,
  ADD COLUMN IF NOT EXISTS contact_email  text;

-- Timestamps
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_tenants_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tenants_updated_at ON tenants;
CREATE TRIGGER tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_tenants_updated_at();

-- Indekslar
CREATE INDEX IF NOT EXISTS tenants_status_idx ON tenants(status);
CREATE INDEX IF NOT EXISTS tenants_stir_idx   ON tenants(stir) WHERE stir IS NOT NULL;

-- RLS yangilash: faqat active tenantlar ko'rinsin (super_admin hammasini ko'radi)
-- Mavjud RLS ni kengaytirish — super_admin/sub_admin barcha tenantlarni ko'radi
DROP POLICY IF EXISTS "tenants_admin_all" ON tenants;

CREATE POLICY "tenants_admin_all"
  ON tenants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants
      WHERE user_id = auth.uid()
        AND role IN ('super_admin', 'sub_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tenants
      WHERE user_id = auth.uid()
        AND role IN ('super_admin', 'sub_admin')
    )
  );

-- company_admin o'z tenantini ko'radi va tahrirlaydi
DROP POLICY IF EXISTS "tenants_company_admin_own" ON tenants;

CREATE POLICY "tenants_company_admin_own"
  ON tenants
  FOR ALL
  USING (
    id IN (
      SELECT tenant_id FROM user_tenants
      WHERE user_id = auth.uid()
        AND role IN ('company_admin','leader')
    )
  )
  WITH CHECK (
    id IN (
      SELECT tenant_id FROM user_tenants
      WHERE user_id = auth.uid()
        AND role IN ('company_admin','leader')
    )
  );

-- Boshqa rollar faqat o'z tenantini ko'radi (read only)
DROP POLICY IF EXISTS "tenants_members_select" ON tenants;

CREATE POLICY "tenants_members_select"
  ON tenants
  FOR SELECT
  USING (
    id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

-- Kommentlar
COMMENT ON COLUMN tenants.status IS
  'pending_approval → active | suspended (to''lov muammo) | blocked (admin tomonidan)';
COMMENT ON COLUMN tenants.stir IS
  'Soliq to''lovchi identifikatsiya raqami (STIR)';
COMMENT ON COLUMN tenants.contact_request_id IS
  'Ushbu kompaniya qaysi murojaat orqali kelganini ko''rsatadi';
