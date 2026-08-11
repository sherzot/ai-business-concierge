begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(15);

select is(
  (select public from storage.buckets where id = 'generated-documents'),
  false,
  'generated-documents bucket is private'
);

select is(
  (select public from storage.buckets where id = 'document-assets'),
  false,
  'document-assets bucket is private'
);

select is(
  (select file_size_limit from storage.buckets where id = 'generated-documents'),
  10485760::bigint,
  'generated document upload limit is 10 MB'
);

select ok(
  (
    select allowed_mime_types @> array[
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]::text[]
    from storage.buckets
    where id = 'generated-documents'
  ),
  'generated bucket only declares PDF and DOCX MIME types'
);

select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'doc_generated'
      and column_name = 'document_id'
      and data_type = 'uuid'
  ),
  'doc_generated has document_id UUID'
);

select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'doc_generated'
      and column_name = 'sha256'
      and data_type = 'text'
  ),
  'doc_generated has sha256 metadata'
);

select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'doc_generated'
      and column_name = 'storage_version'
      and data_type = 'uuid'
  ),
  'doc_generated has immutable storage version metadata'
);

select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'doc_generated'
      and column_name = 'download_expires_at'
      and data_type = 'timestamp with time zone'
  ),
  'doc_generated tracks the active signed-URL serialization deadline'
);

select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'documents'
      and column_name = 'row_version'
      and data_type = 'bigint'
      and is_nullable = 'NO'
  ),
  'documents expose an optimistic concurrency revision'
);

select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = 'public.doc_generated'::regclass
      and conname = 'doc_generated_storage_contract_check'
  ),
  'doc_generated enforces the canonical object path contract'
);

select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and tablename = 'doc_generated'
      and indexname = 'doc_generated_document_uidx'
      and indexdef ilike 'create unique index%'
  ),
  'each document has at most one active generated-file record'
);

select is(
  (
    select permissive
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Document storage: direct access blocked'
  ),
  'RESTRICTIVE',
  'document Storage deny policy is restrictive'
);

select ok(
  (
    select roles @> array['anon', 'authenticated']::name[]
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Document storage: direct access blocked'
  ),
  'document Storage deny policy covers anon and authenticated roles'
);

insert into storage.objects (bucket_id, name, metadata)
values (
  'generated-documents',
  'storage-contract-fixture/document.pdf',
  '{"mimetype":"application/pdf"}'::jsonb
);

set local role authenticated;
set local "request.jwt.claim.sub" = '11111111-1111-4111-8111-111111111111';
set local "request.jwt.claims" =
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

select is(
  (
    select count(*)
    from storage.objects
    where bucket_id = 'generated-documents'
  ),
  0::bigint,
  'authenticated browser cannot list generated document objects'
);

select throws_ok(
  $$
    insert into storage.objects (bucket_id, name)
    values ('generated-documents', 'storage-contract-fixture/forbidden.pdf')
  $$,
  '42501',
  null,
  'authenticated browser cannot upload generated document objects'
);

select * from finish();
rollback;
