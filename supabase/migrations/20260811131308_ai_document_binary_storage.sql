-- Private PDF/DOCX generation and Storage contract (R-021).
begin;

-- Generated exports are private and can only be accessed through bright-api.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'generated-documents',
  'generated-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- The PDF font is cached privately after its pinned upstream checksum is
-- verified. Keeping it separate preserves the generated-file path contract.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'document-assets',
  'document-assets',
  false,
  5242880,
  array['font/otf', 'application/vnd.ms-opentype']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.doc_generated
  add column if not exists document_id uuid references public.documents(id) on delete cascade,
  add column if not exists storage_bucket text,
  add column if not exists mime_type text,
  add column if not exists file_size bigint,
  add column if not exists sha256 text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.doc_generated
  add constraint doc_generated_storage_bucket_check
    check (
      storage_bucket is null
      or storage_bucket = 'generated-documents'
    ),
  add constraint doc_generated_mime_type_check
    check (
      mime_type is null
      or mime_type = case format
        when 'pdf' then 'application/pdf'
        when 'docx' then 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      end
    ),
  add constraint doc_generated_file_size_check
    check (file_size is null or file_size between 1 and 10485760),
  add constraint doc_generated_sha256_check
    check (sha256 is null or sha256 ~ '^[0-9a-f]{64}$'),
  add constraint doc_generated_storage_contract_check
    check (
      storage_path is null
      or (
        document_id is not null
        and user_id is not null
        and storage_bucket = 'generated-documents'
        and mime_type is not null
        and file_size is not null
        and sha256 is not null
        and storage_path = concat(
          tenant_id,
          '/',
          user_id::text,
          '/documents/',
          document_id::text,
          '/document.',
          format
        )
      )
    );

create unique index if not exists doc_generated_document_uidx
  on public.doc_generated(document_id)
  where document_id is not null;

create unique index if not exists doc_generated_storage_path_uidx
  on public.doc_generated(storage_path)
  where storage_path is not null;

create index if not exists doc_generated_document_id_idx
  on public.doc_generated(document_id);

-- These restrictive policies make the two private buckets deny browser-side
-- CRUD even if a broader permissive Storage policy is introduced later.
-- bright-api uses the server-only service role, which bypasses RLS only after
-- the application has validated the caller's active tenant membership.
drop policy if exists "Document storage: direct access blocked" on storage.objects;
create policy "Document storage: direct access blocked"
  on storage.objects
  as restrictive
  for all
  to anon, authenticated
  using (bucket_id not in ('generated-documents', 'document-assets'))
  with check (bucket_id not in ('generated-documents', 'document-assets'));

comment on column public.doc_generated.storage_path is
  'Private object path: <tenant>/<user>/documents/<document-id>/document.<pdf|docx>';
comment on column public.doc_generated.sha256 is
  'Lowercase SHA-256 digest of the stored binary.';

commit;
