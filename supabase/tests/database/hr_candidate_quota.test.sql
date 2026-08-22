begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(22);

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
values
  (
    '44444444-4444-4444-8444-444444444444',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'hr-quota-primary@example.invalid',
    '',
    now(),
    now(),
    now()
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'hr-quota-secondary@example.invalid',
    '',
    now(),
    now(),
    now()
  );

insert into public.tenants (id, name)
values
  ('hr_quota_concurrency_20260822', 'HR quota concurrency fixture'),
  ('hr_quota_day_20260822', 'HR quota day fixture'),
  ('hr_quota_expiry_20260822', 'HR quota expiry fixture');

select ok(
  not has_function_privilege(
    'anon',
    'public.reserve_hr_candidate_request(text, uuid, integer, integer, integer, integer)',
    'EXECUTE'
  ),
  'anonymous callers cannot reserve HR candidate quota'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.reserve_hr_candidate_request(text, uuid, integer, integer, integer, integer)',
    'EXECUTE'
  ),
  'authenticated browser callers cannot reserve HR candidate quota'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.reserve_hr_candidate_request(text, uuid, integer, integer, integer, integer)',
    'EXECUTE'
  ),
  'service role can reserve HR candidate quota'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.release_hr_candidate_request(text, uuid, uuid)',
    'EXECUTE'
  ),
  'anonymous callers cannot release HR candidate quota'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.release_hr_candidate_request(text, uuid, uuid)',
    'EXECUTE'
  ),
  'authenticated browser callers cannot release HR candidate quota'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.release_hr_candidate_request(text, uuid, uuid)',
    'EXECUTE'
  ),
  'service role can release HR candidate quota'
);

select ok(
  not has_table_privilege(
    'service_role',
    'private.hr_candidate_quota_state',
    'SELECT'
  ),
  'service role cannot read private HR quota state directly'
);

select has_index(
  'private',
  'hr_candidate_quota_leases',
  'hr_candidate_quota_leases_user_idx',
  'lease user foreign key has a covering index'
);

create temporary table first_reservation as
select *
from public.reserve_hr_candidate_request(
  'hr_quota_concurrency_20260822',
  '44444444-4444-4444-8444-444444444444',
  1,
  1,
  2,
  45
);

select is(
  (select allowed from first_reservation),
  true,
  'first request is reserved'
);

select isnt(
  (select lease_id from first_reservation),
  null::uuid,
  'allowed request returns a concurrency lease'
);

select is(
  (select minute_remaining from first_reservation),
  0,
  'allowed request reports minute capacity after consumption'
);

select is(
  (select day_remaining from first_reservation),
  1,
  'allowed request reports day capacity after consumption'
);

create temporary table concurrent_denial as
select *
from public.reserve_hr_candidate_request(
  'hr_quota_concurrency_20260822',
  '55555555-5555-4555-8555-555555555555',
  1,
  1,
  2,
  45
);

select is(
  (select reason from concurrent_denial),
  'concurrent',
  'active lease denies a concurrent request before counters are consumed'
);

select cmp_ok(
  (select retry_after_seconds from concurrent_denial),
  '>=',
  1,
  'concurrency denial returns a positive retry delay'
);

select is(
  (
    select minute_count
    from private.hr_candidate_quota_state
    where tenant_id = 'hr_quota_concurrency_20260822'
  ),
  1,
  'denied concurrent request does not increment the minute counter'
);

select is(
  public.release_hr_candidate_request(
    'hr_quota_concurrency_20260822',
    '55555555-5555-4555-8555-555555555555',
    (select lease_id from first_reservation)
  ),
  false,
  'a different user cannot release the lease'
);

select is(
  public.release_hr_candidate_request(
    'hr_quota_concurrency_20260822',
    '44444444-4444-4444-8444-444444444444',
    (select lease_id from first_reservation)
  ),
  true,
  'lease owner can release the concurrency slot'
);

select is(
  (
    select reason
    from public.reserve_hr_candidate_request(
      'hr_quota_concurrency_20260822',
      '44444444-4444-4444-8444-444444444444',
      1,
      1,
      2,
      45
    )
  ),
  'minute',
  'released concurrency does not roll back the consumed minute request'
);

create temporary table day_reservation as
select *
from public.reserve_hr_candidate_request(
  'hr_quota_day_20260822',
  '44444444-4444-4444-8444-444444444444',
  2,
  5,
  1,
  45
);

select is(
  public.release_hr_candidate_request(
    'hr_quota_day_20260822',
    '44444444-4444-4444-8444-444444444444',
    (select lease_id from day_reservation)
  ),
  true,
  'day-limit fixture releases its active lease'
);

select is(
  (
    select reason
    from public.reserve_hr_candidate_request(
      'hr_quota_day_20260822',
      '44444444-4444-4444-8444-444444444444',
      2,
      5,
      1,
      45
    )
  ),
  'day',
  'daily capacity is enforced independently from concurrency and minute limits'
);

create temporary table expiring_reservation as
select *
from public.reserve_hr_candidate_request(
  'hr_quota_expiry_20260822',
  '44444444-4444-4444-8444-444444444444',
  1,
  5,
  5,
  45
);

update private.hr_candidate_quota_leases
set created_at = now() - interval '2 minutes',
    expires_at = now() - interval '1 minute'
where lease_id = (select lease_id from expiring_reservation);

select is(
  (
    select allowed
    from public.reserve_hr_candidate_request(
      'hr_quota_expiry_20260822',
      '55555555-5555-4555-8555-555555555555',
      1,
      5,
      5,
      45
    )
  ),
  true,
  'expired leases are cleaned before concurrency is checked'
);

select is(
  (
    select count(*)::integer
    from private.hr_candidate_quota_leases
    where tenant_id = 'hr_quota_expiry_20260822'
  ),
  1,
  'expired lease cleanup keeps only the new active lease'
);

select * from finish();
rollback;
