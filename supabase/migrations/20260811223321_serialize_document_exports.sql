-- Serialize document exports for the lifetime of issued signed URLs and add
-- optimistic document revisions so export cannot publish stale content.
begin;

alter table public.doc_generated
  drop constraint if exists doc_generated_retained_storage_paths_check;

alter table public.doc_generated
  drop column if exists retained_storage_paths;

alter table public.doc_generated
  add column if not exists download_expires_at timestamptz;

alter table public.documents
  add column if not exists row_version bigint not null default 1;

alter table public.documents
  add constraint documents_row_version_check
    check (row_version >= 1);

comment on column public.doc_generated.download_expires_at is
  'Server-side export serialization deadline; a new binary cannot replace the active object before this timestamp.';

comment on column public.documents.row_version is
  'Optimistic concurrency revision incremented by document edits and binary publication metadata updates.';

commit;
