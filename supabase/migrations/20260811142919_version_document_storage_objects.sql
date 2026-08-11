-- Keep each generated binary immutable until its metadata commit succeeds.
begin;

alter table public.doc_generated
  add column if not exists storage_version uuid;

alter table public.doc_generated
  drop constraint if exists doc_generated_storage_contract_check;

alter table public.doc_generated
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
        and (
          (
            storage_version is null
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
          or (
            storage_version is not null
            and storage_path = concat(
              tenant_id,
              '/',
              user_id::text,
              '/documents/',
              document_id::text,
              '/document-',
              storage_version::text,
              '.',
              format
            )
          )
        )
      )
    );

comment on column public.doc_generated.storage_path is
  'Private immutable object path: <tenant>/<user>/documents/<document-id>/document-<storage-version>.<pdf|docx>; legacy unversioned paths remain readable.';
comment on column public.doc_generated.storage_version is
  'Unique binary version used to avoid overwriting the active object before metadata commits.';

commit;
