begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(21);

insert into public.tenants (id, name)
values
  ('rls_fixture_tenant_a_20260808', 'RLS fixture tenant A'),
  ('rls_fixture_tenant_b_20260808', 'RLS fixture tenant B');

insert into public.user_tenants (user_id, tenant_id, role, full_name, status)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'rls_fixture_tenant_a_20260808',
    'employee',
    'RLS fixture user A',
    'active'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'rls_fixture_tenant_b_20260808',
    'employee',
    'RLS fixture user B',
    'terminated'
  );

insert into public.tasks (id, tenant_id, title)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    'rls_fixture_tenant_a_20260808',
    'RLS fixture task A'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
    'rls_fixture_tenant_b_20260808',
    'RLS fixture task B'
  );

insert into public.inbox_items (
  id,
  tenant_id,
  source,
  sender,
  subject,
  preview,
  timestamp,
  category,
  priority,
  source_message_id
)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    'rls_fixture_tenant_a_20260808',
    'test',
    '{"name":"fixture"}'::jsonb,
    'RLS fixture inbox A',
    'fixture',
    now(),
    'test',
    'low',
    'rls-fixture-a-20260808'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4',
    'rls_fixture_tenant_b_20260808',
    'test',
    '{"name":"fixture"}'::jsonb,
    'RLS fixture inbox B',
    'fixture',
    now(),
    'test',
    'low',
    'rls-fixture-b-20260808'
  );

insert into public.notifications (id, tenant_id, user_id, title)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5',
    'rls_fixture_tenant_a_20260808',
    '11111111-1111-4111-8111-111111111111',
    'RLS fixture notification A'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb6',
    'rls_fixture_tenant_b_20260808',
    '22222222-2222-4222-8222-222222222222',
    'RLS fixture notification B'
  );

set local role authenticated;
set local "request.jwt.claim.sub" = '11111111-1111-4111-8111-111111111111';
set local "request.jwt.claims" =
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

select is(
  (select auth.uid()),
  '11111111-1111-4111-8111-111111111111'::uuid,
  'fixture applies the authenticated user JWT'
);

select is(
  (select count(*) from public.tasks
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'),
  1::bigint,
  'active member can select own-tenant task'
);

select is(
  (select count(*) from public.tasks
    where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2'),
  0::bigint,
  'active member cannot select cross-tenant task'
);

select is(
  (select count(*) from public.inbox_items
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3'),
  1::bigint,
  'active member can select own-tenant inbox item'
);

select is(
  (select count(*) from public.inbox_items
    where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4'),
  0::bigint,
  'active member cannot select cross-tenant inbox item'
);

select is(
  (select count(*) from public.notifications
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5'),
  1::bigint,
  'active member can select own notification'
);

select is(
  (select count(*) from public.notifications
    where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb6'),
  0::bigint,
  'active member cannot select another user notification'
);

select throws_ok(
  $$
    select count(*)
    from public.user_tenants
    where user_id = '11111111-1111-4111-8111-111111111111'
  $$,
  '42501',
  null,
  'authenticated role cannot read user_tenants directly'
);

select throws_ok(
  $$
    insert into public.tasks (tenant_id, title)
    values ('rls_fixture_tenant_b_20260808', 'forbidden task insert')
  $$,
  '42501',
  null,
  'authenticated role cannot insert a cross-tenant task'
);

select throws_ok(
  $$
    update public.tasks
    set title = 'forbidden task update'
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'
  $$,
  '42501',
  null,
  'authenticated role cannot update even an own-tenant task'
);

select throws_ok(
  $$
    delete from public.tasks
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'
  $$,
  '42501',
  null,
  'authenticated role cannot delete even an own-tenant task'
);

select throws_ok(
  $$
    insert into public.inbox_items (
      tenant_id, source, sender, subject, preview, timestamp,
      category, priority, source_message_id
    ) values (
      'rls_fixture_tenant_b_20260808', 'test', '{}'::jsonb,
      'forbidden inbox insert', 'fixture', now(),
      'test', 'low', 'forbidden-inbox-insert'
    )
  $$,
  '42501',
  null,
  'authenticated role cannot insert a cross-tenant inbox item'
);

select throws_ok(
  $$
    update public.inbox_items
    set subject = 'forbidden inbox update'
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3'
  $$,
  '42501',
  null,
  'authenticated role cannot update even an own-tenant inbox item'
);

select throws_ok(
  $$
    delete from public.inbox_items
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3'
  $$,
  '42501',
  null,
  'authenticated role cannot delete even an own-tenant inbox item'
);

select throws_ok(
  $$
    insert into public.notifications (tenant_id, user_id, title)
    values (
      'rls_fixture_tenant_b_20260808',
      '11111111-1111-4111-8111-111111111111',
      'forbidden notification insert'
    )
  $$,
  '42501',
  null,
  'authenticated role cannot insert a notification'
);

select throws_ok(
  $$
    update public.notifications
    set read_at = now()
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5'
  $$,
  '42501',
  null,
  'authenticated role cannot update notifications directly'
);

select throws_ok(
  $$
    delete from public.notifications
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5'
  $$,
  '42501',
  null,
  'authenticated role cannot delete notifications directly'
);

reset role;

select lives_ok(
  $$
    update public.user_tenants
    set status = 'blocked'
    where user_id = '22222222-2222-4222-8222-222222222222'
      and tenant_id = 'rls_fixture_tenant_b_20260808'
  $$,
  'user_tenants status contract accepts blocked accounts'
);

set local role authenticated;
set local "request.jwt.claim.sub" = '22222222-2222-4222-8222-222222222222';
set local "request.jwt.claims" =
  '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';

select is(
  (select count(*) from public.tasks
    where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2'),
  0::bigint,
  'blocked member cannot select own-tenant task'
);

select is(
  (select count(*) from public.inbox_items
    where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4'),
  0::bigint,
  'blocked member cannot select own-tenant inbox item'
);

select is(
  (select count(*) from public.notifications
    where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb6'),
  0::bigint,
  'blocked member cannot select own notification'
);

reset role;

select * from finish();

rollback;
