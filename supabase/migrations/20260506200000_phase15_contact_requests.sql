-- =============================================================================
-- Phase 1.5 (1/5) — contact_requests
-- Kompaniya murojaatlarini saqlash: murojaat formasi → admin CRM
-- Sana: 2026-05-06
-- =============================================================================

CREATE TABLE IF NOT EXISTS contact_requests (
  id                uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name         text          NOT NULL,
  company_name      text,
  stir              text,
  phone             text          NOT NULL,
  email             text          NOT NULL,
  business_type     text          CHECK (business_type IN ('yatt','llc','jsc','other')),
  employee_count    text          CHECK (employee_count IN ('1-10','11-50','51-200','200+')),
  message           text,
  source            text          CHECK (source IN ('ads','referral','search','telegram','other')),
  status            text          NOT NULL DEFAULT 'new'
                                  CHECK (status IN ('new','contacted','invite_sent','registered','rejected')),
  admin_note        text,
  rejected_reason   text,
  invite_token      text          UNIQUE,
  invite_expires_at timestamptz,
  tenant_id         text          REFERENCES tenants(id) ON DELETE SET NULL,
  handled_by        uuid          REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        timestamptz   NOT NULL DEFAULT now(),
  updated_at        timestamptz   NOT NULL DEFAULT now()
);

-- Indekslar
CREATE INDEX IF NOT EXISTS contact_requests_status_idx  ON contact_requests(status);
CREATE INDEX IF NOT EXISTS contact_requests_email_idx   ON contact_requests(email);
CREATE INDEX IF NOT EXISTS contact_requests_created_idx ON contact_requests(created_at DESC);

-- updated_at avtomatik yangilanishi
CREATE OR REPLACE FUNCTION update_contact_requests_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS contact_requests_updated_at ON contact_requests;
CREATE TRIGGER contact_requests_updated_at
  BEFORE UPDATE ON contact_requests
  FOR EACH ROW EXECUTE FUNCTION update_contact_requests_updated_at();

-- RLS
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- Faqat super_admin / sub_admin ko'radi va o'zgartiradi
CREATE POLICY "contact_requests_admin_all"
  ON contact_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants
      WHERE user_id  = auth.uid()
        AND role IN ('super_admin', 'sub_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tenants
      WHERE user_id  = auth.uid()
        AND role IN ('super_admin', 'sub_admin')
    )
  );

-- Comment
COMMENT ON TABLE contact_requests IS
  'Kompaniya murojaatlari: landing page forma → admin CRM → invite → ro''yxat';
COMMENT ON COLUMN contact_requests.status IS
  'new → contacted → invite_sent → registered | rejected';
COMMENT ON COLUMN contact_requests.invite_token IS
  'Bir martalik JWT token, 48 soat amal qiladi. Ishlatilgandan keyin NULL lanadi.';
