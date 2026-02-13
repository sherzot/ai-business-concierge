-- R-002: Supabase Realtime – inbox_items va tasks uchun

-- 1. RLS policies: authenticated user o'z tenant'idagi ma'lumotlarni o'qishi mumkin
create policy "inbox_items_select_own_tenant"
  on inbox_items for select
  to authenticated
  using (
    tenant_id in (
      select tenant_id from user_tenants where user_id = auth.uid()
    )
  );

create policy "tasks_select_own_tenant"
  on tasks for select
  to authenticated
  using (
    tenant_id in (
      select tenant_id from user_tenants where user_id = auth.uid()
    )
  );

-- 2. Realtime publication ga jadvallarni qo'shish
alter publication supabase_realtime add table inbox_items;
alter publication supabase_realtime add table tasks;
