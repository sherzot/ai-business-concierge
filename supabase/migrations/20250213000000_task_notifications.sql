-- R-015: Task assignment notifications va assignee tasdiqlash
-- Rahbar vazifa biriktirganda mas'ulga bildirishnoma, status shaffofligi

-- Notifications jadvali
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references tenants(id) on delete cascade,
  user_id uuid not null,
  type text not null default 'task_assigned',
  title text not null,
  message text,
  task_id uuid references tasks(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_tenant_user_idx on notifications (tenant_id, user_id);
create index if not exists notifications_user_unread_idx on notifications (user_id, read_at) where read_at is null;

alter table notifications enable row level security;

create policy "notifications_select_own"
  on notifications for select to authenticated
  using (user_id = auth.uid());

-- tasks jadvaliga acknowledged_at qo'shish
alter table tasks add column if not exists acknowledged_at timestamptz;
