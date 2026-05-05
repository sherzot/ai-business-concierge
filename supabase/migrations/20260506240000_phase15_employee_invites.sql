-- =============================================================================
-- Phase 1.5 (5/5) — employee_invites
-- Xodim va kompaniya uchun invite token boshqaruvi
-- Sana: 2026-05-06
-- =============================================================================

CREATE TABLE IF NOT EXISTS employee_invites (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       text        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_profile_id uuid    REFERENCES employee_profiles(id) ON DELETE CASCADE,
  email           text        NOT NULL,
  token           text        NOT NULL UNIQUE,
  token_type      text        NOT NULL DEFAULT 'employee_onboard'
                              CHECK (token_type IN ('employee_onboard','password_reset')),
  expires_at      timestamptz NOT NULL,
  used_at         timestamptz,
  status          text        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','used','expired','revoked')),
  created_by      uuid        REFERENCES auth.users(id) ON DELETE SET NULL, -- HR
  resend_count    int         NOT NULL DEFAULT 0,
  last_resent_at  timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Indekslar
CREATE INDEX IF NOT EXISTS employee_invites_token_idx   ON employee_invites(token);
CREATE INDEX IF NOT EXISTS employee_invites_email_idx   ON employee_invites(email);
CREATE INDEX IF NOT EXISTS employee_invites_tenant_idx  ON employee_invites(tenant_id);
CREATE INDEX IF NOT EXISTS employee_invites_status_idx  ON employee_invites(status);

-- Eskirgan invite'larni avtomatik 'expired' ga o'tkazish (cron bilan foydalaniladi)
CREATE OR REPLACE FUNCTION expire_old_employee_invites()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE employee_invites
  SET    status = 'expired'
  WHERE  status    = 'pending'
    AND  expires_at < now();
END;
$$;

-- RLS
ALTER TABLE employee_invites ENABLE ROW LEVEL SECURITY;

-- super_admin / sub_admin — hammasi
CREATE POLICY "employee_invites_admin_all"
  ON employee_invites FOR ALL
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

-- HR / company_admin — o'z tenantlari
CREATE POLICY "employee_invites_hr_all"
  ON employee_invites FOR ALL
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

-- Audit log view: eskirgan invitlar + qayta yuborishlar
CREATE OR REPLACE VIEW employee_invite_stats AS
SELECT
  tenant_id,
  COUNT(*)                                          AS total_invites,
  COUNT(*) FILTER (WHERE status = 'pending')        AS pending,
  COUNT(*) FILTER (WHERE status = 'used')           AS used,
  COUNT(*) FILTER (WHERE status = 'expired')        AS expired,
  AVG(resend_count)::numeric(4,1)                   AS avg_resends,
  MAX(created_at)                                   AS last_invite_at
FROM employee_invites
GROUP BY tenant_id;

COMMENT ON TABLE employee_invites IS
  'Xodim onboarding va parol tiklash uchun bir martalik tokenlar. '
  '24 soat amal qiladi (employee_onboard). Resend: yangi token, eski revoked.';
COMMENT ON COLUMN employee_invites.token IS
  'Kriptografik xavfsiz token (crypto.randomUUID asosida). URL safe base64.';
COMMENT ON COLUMN employee_invites.resend_count IS
  'HR nechi marta qayta yubordi. 5 dan oshsa ogohlantirish.';
