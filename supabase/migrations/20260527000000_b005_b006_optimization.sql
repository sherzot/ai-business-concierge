-- B-005: Performance indexes + soft-delete columns
-- B-006: Audit log triggers for key business tables
-- 2026-05-27

-- ============================================================
-- B-005: Soft-delete columns
-- ============================================================

alter table tasks         add column if not exists deleted_at timestamptz null;
alter table inbox_items   add column if not exists deleted_at timestamptz null;
alter table documents     add column if not exists deleted_at timestamptz null;

-- ============================================================
-- B-005: Performance indexes (composite + partial)
-- ============================================================

-- tasks: tenant scoped status queries (exclude soft-deleted)
create index if not exists idx_tasks_tenant_status_del
  on tasks (tenant_id, status, deleted_at)
  where deleted_at is null;

-- tasks: due-date queries (overdue detection)
create index if not exists idx_tasks_tenant_due
  on tasks (tenant_id, due_date)
  where deleted_at is null;

-- inbox_items: tenant timeline (inbox feed)
create index if not exists idx_inbox_tenant_created_del
  on inbox_items (tenant_id, created_at desc, deleted_at)
  where deleted_at is null;

-- notifications: per-user unread feed
create index if not exists idx_notifications_user_unread
  on notifications (user_id, created_at desc)
  where read_at is null;

-- notifications: per-tenant cleanup sweep
create index if not exists idx_notifications_tenant_created
  on notifications (tenant_id, created_at desc);

-- documents: tenant timeline
create index if not exists idx_documents_tenant_created_del
  on documents (tenant_id, created_at desc)
  where deleted_at is null;

-- audit_logs: per-tenant timeline (audit viewer)
create index if not exists idx_audit_logs_tenant_created
  on audit_logs (tenant_id, created_at desc);

-- audit_logs: per-entity lookup
create index if not exists idx_audit_logs_entity
  on audit_logs (entity_type, entity_id, created_at desc);

-- request_logs: per-tenant timeline
create index if not exists idx_request_logs_tenant_created
  on request_logs (tenant_id, created_at desc);

-- ============================================================
-- B-006: Audit log trigger function
-- ============================================================

create or replace function fn_audit_log_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entity_id uuid;
  v_tenant_id text;
  v_action    text;
  v_payload   jsonb;
begin
  -- Determine entity id and tenant_id from OLD/NEW
  if TG_OP = 'DELETE' then
    v_entity_id := OLD.id;
    v_tenant_id := OLD.tenant_id::text;
    v_action    := 'delete';
    v_payload   := to_jsonb(OLD);
  elsif TG_OP = 'INSERT' then
    v_entity_id := NEW.id;
    v_tenant_id := NEW.tenant_id::text;
    v_action    := 'create';
    v_payload   := to_jsonb(NEW);
  else -- UPDATE
    v_entity_id := NEW.id;
    v_tenant_id := NEW.tenant_id::text;
    v_action    := 'update';
    -- Only log changed fields
    v_payload   := jsonb_build_object(
      'before', to_jsonb(OLD),
      'after',  to_jsonb(NEW)
    );
  end if;

  insert into audit_logs (
    tenant_id,
    user_id,
    action,
    event_type,
    entity_type,
    entity_id,
    payload,
    created_at
  ) values (
    v_tenant_id,
    null,                          -- updated by app layer when available
    v_action,
    TG_TABLE_NAME || '.' || v_action,
    TG_TABLE_NAME,
    v_entity_id,
    v_payload,
    now()
  );

  if TG_OP = 'DELETE' then
    return OLD;
  end if;
  return NEW;
end;
$$;

-- ============================================================
-- B-006: Attach triggers to key tables
-- ============================================================

-- tasks
drop trigger if exists trg_audit_tasks on tasks;
create trigger trg_audit_tasks
  after insert or update or delete on tasks
  for each row execute function fn_audit_log_change();

-- inbox_items
drop trigger if exists trg_audit_inbox_items on inbox_items;
create trigger trg_audit_inbox_items
  after insert or update or delete on inbox_items
  for each row execute function fn_audit_log_change();

-- documents
drop trigger if exists trg_audit_documents on documents;
create trigger trg_audit_documents
  after insert or update or delete on documents
  for each row execute function fn_audit_log_change();

-- hr_cases (if table exists)
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'hr_cases') then
    execute $sql$
      drop trigger if exists trg_audit_hr_cases on hr_cases;
      create trigger trg_audit_hr_cases
        after insert or update or delete on hr_cases
        for each row execute function fn_audit_log_change();
    $sql$;
  end if;
end;
$$;

-- ============================================================
-- Verify
-- ============================================================
comment on function fn_audit_log_change() is
  'B-006: Automatic audit trail for INSERT/UPDATE/DELETE on business tables. 2026-05-27';
