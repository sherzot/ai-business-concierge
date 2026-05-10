# R-002: Supabase Realtime – Настройка

Страницы Inbox и Tasks теперь обновляются в реальном времени (новые сообщения/задачи появляются автоматически).

---

## 1. Запуск SQL

**Supabase Dashboard** → **SQL Editor** → выполните следующее:

```sql
-- RLS политики (аутентифицированный пользователь может читать данные своего тенанта)
create policy "inbox_items_select_own_tenant"
  on inbox_items for select to authenticated
  using (tenant_id in (select tenant_id from user_tenants where user_id = auth.uid()));

create policy "tasks_select_own_tenant"
  on tasks for select to authenticated
  using (tenant_id in (select tenant_id from user_tenants where user_id = auth.uid()));

-- Публикация Realtime
alter publication supabase_realtime add table inbox_items;
alter publication supabase_realtime add table tasks;
```

**Примечание:** Если возникает ошибка `already member of publication`, пропустите второй и третий операторы.

---

## 2. Supabase Dashboard (альтернатива)

**Database** → **Publications** (в левом меню, не Replication) → `supabase_realtime` → переключите таблицы **inbox_items** и **tasks**.

**Примечание:** Replication — для внешних хранилищ (BigQuery, Iceberg). Realtime — в разделе **Publications**.

---

## 3. Тестирование

1. Откройте страницу Inbox
2. Отправьте письмо на `inbox@doroufdalu.resend.app` из другого браузера/инкогнито или телефона
3. Через несколько секунд новое сообщение должно автоматически появиться на странице Inbox (без обновления страницы)

Или создайте новую задачу на странице Tasks – страница Tasks, открытая в другой вкладке, должна обновиться.
