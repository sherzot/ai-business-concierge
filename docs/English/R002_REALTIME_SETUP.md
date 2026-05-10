# R-002: Supabase Realtime – Setup

The Inbox and Tasks pages now update in real-time (new messages/tasks appear automatically).

---

## 1. Run the SQL

**Supabase Dashboard** → **SQL Editor** → run the following:

```sql
-- RLS policies (authenticated user can read data from their own tenant)
create policy "inbox_items_select_own_tenant"
  on inbox_items for select to authenticated
  using (tenant_id in (select tenant_id from user_tenants where user_id = auth.uid()));

create policy "tasks_select_own_tenant"
  on tasks for select to authenticated
  using (tenant_id in (select tenant_id from user_tenants where user_id = auth.uid()));

-- Realtime publication
alter publication supabase_realtime add table inbox_items;
alter publication supabase_realtime add table tasks;
```

**Note:** If you get an `already member of publication` error, skip the second and third statements.

---

## 2. Supabase Dashboard (alternative)

**Database** → **Publications** (in the left menu, not Replication) → `supabase_realtime` → toggle **inbox_items** and **tasks** tables.

**Note:** Replication is for external warehouses (BigQuery, Iceberg). Realtime is in the **Publications** section.

---

## 3. Testing

1. Open the Inbox page
2. Send an email to `inbox@doroufdalu.resend.app` from another browser/incognito or phone
3. A few seconds later, the new message should appear automatically in the Inbox page (without refreshing)

Or create a new task on the Tasks page – the Tasks page open in another tab should update.
