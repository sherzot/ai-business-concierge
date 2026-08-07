-- Risk scanner data is an internal platform-admin resource.
-- The browser reaches it only through bright-api, whose service-role client
-- performs the super_admin/sub_admin authorization check.

begin;

drop policy if exists "risk_scans: admin read"
  on public.risk_scans;
drop policy if exists "risk_scans: service write"
  on public.risk_scans;
drop policy if exists "risk_findings: admin read"
  on public.risk_findings;
drop policy if exists "risk_findings: service write"
  on public.risk_findings;

-- RLS stays enabled as defense in depth, while table privileges make the
-- server-only boundary explicit and prevent direct Data API access.
revoke all privileges on table public.risk_scans
  from anon, authenticated;
revoke all privileges on table public.risk_findings
  from anon, authenticated;

grant select, insert, update, delete on table public.risk_scans
  to service_role;
grant select, insert, update, delete on table public.risk_findings
  to service_role;

commit;
