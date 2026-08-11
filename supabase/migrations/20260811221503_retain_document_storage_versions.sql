-- Preserve superseded binaries until every issued signed URL has expired.
begin;

alter table public.doc_generated
  add column if not exists retained_storage_paths jsonb not null default '[]'::jsonb;

alter table public.doc_generated
  add constraint doc_generated_retained_storage_paths_check
    check (jsonb_typeof(retained_storage_paths) = 'array');

comment on column public.doc_generated.retained_storage_paths is
  'Superseded private object paths and delete_after timestamps retained beyond the signed URL TTL.';

commit;
