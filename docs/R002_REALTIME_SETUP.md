# R-002: Supabase Realtime – Sozlash

Inbox va Tasks sahifalari endi real-time yangilanadi (yangi xabar/vazifa kelsa avtomatik ko‘rinadi).

---

## 1. SQL ishga tushirish

**Supabase Dashboard** → **SQL Editor** → quyidagini bajaring:

```sql
-- RLS policies (authenticated user o'z tenant'idagi ma'lumotlarni o'qishi)
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

**Eslatma:** Agar `already member of publication` xatosi chiqsa, ikkinchi va uchinchi qatorlarni o‘tkazib yuboring.

---

## 2. Supabase Dashboard (alternativa)

**Database** → **Publications** (chap menyuda, Replication emas) → `supabase_realtime` → **inbox_items** va **tasks** jadvallarini toggle qiling.

**Eslatma:** Replication – tashqi omborlar (BigQuery, Iceberg) uchun. Realtime – **Publications** bo‘limida.

---

## 3. Sinov

1. Inbox sahifasini oching
2. Boshqa brauzer/inkognito yoki telefon orqali `inbox@doroufdalu.resend.app` ga email yuboring
3. Bir necha soniyadan keyin Inbox sahifasida yangi xabar avtomatik paydo bo‘lishi kerak (sahifani yangilamasdan)

Yoki Tasks sahifasida yangi vazifa yarating – boshqa tab’da ochiq Tasks sahifasi yangilanadi.
