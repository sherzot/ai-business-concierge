begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(9);

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
)
values (
  '33333333-3333-4333-8333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'ai-usage-reservation@example.invalid',
  '',
  now(),
  now(),
  now()
);

insert into public.tenants (id, name)
values ('ai_usage_reservation_tenant_20260821', 'AI usage reservation fixture');

select ok(
  not has_function_privilege(
    'anon',
    'public.reserve_ai_request(text, uuid, integer)',
    'EXECUTE'
  ),
  'anonymous callers cannot reserve AI usage'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.reserve_ai_request(text, uuid, integer)',
    'EXECUTE'
  ),
  'authenticated browser callers cannot reserve AI usage'
);

select is(
  (
    select allowed
    from public.reserve_ai_request(
      'ai_usage_reservation_tenant_20260821',
      '33333333-3333-4333-8333-333333333333',
      1
    )
  ),
  true,
  'first reservation consumes the final available request'
);

select is(
  (
    select allowed
    from public.reserve_ai_request(
      'ai_usage_reservation_tenant_20260821',
      '33333333-3333-4333-8333-333333333333',
      1
    )
  ),
  false,
  'second reservation is denied at the plan limit'
);

select is(
  (
    select remaining
    from public.reserve_ai_request(
      'ai_usage_reservation_tenant_20260821',
      '33333333-3333-4333-8333-333333333333',
      1
    )
  ),
  0,
  'denied reservation reports no remaining capacity'
);

select is(
  (
    select ai_requests
    from public.usage_tracking
    where tenant_id = 'ai_usage_reservation_tenant_20260821'
      and user_id = '33333333-3333-4333-8333-333333333333'
      and date = current_date
  ),
  1,
  'denied reservation does not exceed the plan limit'
);

select is(
  public.release_ai_request(
    'ai_usage_reservation_tenant_20260821',
    '33333333-3333-4333-8333-333333333333'
  ),
  true,
  'failed provider call releases one reservation'
);

select is(
  (
    select ai_requests
    from public.usage_tracking
    where tenant_id = 'ai_usage_reservation_tenant_20260821'
      and user_id = '33333333-3333-4333-8333-333333333333'
      and date = current_date
  ),
  0,
  'released reservation restores the request count'
);

select is(
  (
    select allowed
    from public.reserve_ai_request(
      'ai_usage_reservation_tenant_20260821',
      '33333333-3333-4333-8333-333333333333',
      1
    )
  ),
  true,
  'released capacity can be reserved again'
);

select * from finish();
rollback;
