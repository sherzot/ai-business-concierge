-- Internal SECURITY DEFINER va trigger helper funksiyalarini PostgREST orqali
-- bevosita chaqirishni yopish. Edge Functions service_role bilan ishlaydi.

begin;

-- Mutable search_path advisory'larini yopish.
alter function public.update_contact_requests_updated_at()
  set search_path = pg_catalog, public;
alter function public.update_tenants_updated_at()
  set search_path = pg_catalog, public;
alter function public.update_user_tenants_updated_at()
  set search_path = pg_catalog, public;
alter function public.update_employee_profiles_updated_at()
  set search_path = pg_catalog, public;
alter function public.expire_old_employee_invites()
  set search_path = pg_catalog, public;
alter function public.fn_audit_log_change()
  set search_path = pg_catalog, public;

-- Trigger/maintenance helperlar faqat server tomondan ishlatiladi.
revoke execute on function public.update_contact_requests_updated_at()
  from public, anon, authenticated;
revoke execute on function public.update_tenants_updated_at()
  from public, anon, authenticated;
revoke execute on function public.update_user_tenants_updated_at()
  from public, anon, authenticated;
revoke execute on function public.update_employee_profiles_updated_at()
  from public, anon, authenticated;
revoke execute on function public.expire_old_employee_invites()
  from public, anon, authenticated;
revoke execute on function public.fn_audit_log_change()
  from public, anon, authenticated;

grant execute on function public.expire_old_employee_invites()
  to service_role;

-- SECURITY DEFINER RPC'lar browser rollariga ochiq bo'lmasligi kerak.
revoke execute on function public.increment_usage(text, uuid, integer, integer, integer)
  from public, anon, authenticated;
grant execute on function public.increment_usage(text, uuid, integer, integer, integer)
  to service_role;

revoke execute on function public.match_documents(public.vector, double precision, integer, text)
  from public, anon, authenticated;
grant execute on function public.match_documents(public.vector, double precision, integer, text)
  to service_role;

revoke execute on function public.match_knowledge(public.vector, text, text, integer, double precision)
  from public, anon, authenticated;
grant execute on function public.match_knowledge(public.vector, text, text, integer, double precision)
  to service_role;

revoke execute on function public.match_knowledge(public.vector, text, text, integer, double precision, uuid)
  from public, anon, authenticated;
grant execute on function public.match_knowledge(public.vector, text, text, integer, double precision, uuid)
  to service_role;

commit;
