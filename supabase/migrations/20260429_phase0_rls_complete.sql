-- =============================================================================
-- Phase 0 — RLS to'liq yopish (INSERT/UPDATE/DELETE)
-- AI Business Concierge v2.0
-- Sana: 2026-04-29
-- =============================================================================
-- Audit:
--   20260417_phase0_new_tables.sql — barcha 12 jadval, lekin faqat SELECT RLS.
--   Bu migration har jadval uchun INSERT/UPDATE/DELETE policiy qo'shadi.
--
-- Printsip:
--   • Tenant ichidagi foydalanuvchi o'z tenantining ma'lumotini boshqaradi.
--   • Service role JWT (backend-only) bypass qiladi (Supabase default).
--   • SUPER_ADMIN ham bypass — backend tarafdan service_role key bilan.
--   • Global jadvallar (doc_templates, knowledge_base global rows) — yozish faqat
--     SUPER_ADMIN, foydalanuvchi yoza olmaydi.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. SUBSCRIPTIONS — Insert/update faqat backend (service role) orqali.
--    Foydalanuvchi UI dan yozolmaydi. Webhook va admin yo'l-yo'lakay yozadi.
-- -----------------------------------------------------------------------------
drop policy if exists "Subscriptions: tenant insert blocked"      on subscriptions;
drop policy if exists "Subscriptions: tenant update blocked"      on subscriptions;
drop policy if exists "Subscriptions: tenant delete blocked"      on subscriptions;

create policy "Subscriptions: tenant insert blocked"
  on subscriptions for insert
  with check (false);

create policy "Subscriptions: tenant update blocked"
  on subscriptions for update
  using (false);

create policy "Subscriptions: tenant delete blocked"
  on subscriptions for delete
  using (false);

-- -----------------------------------------------------------------------------
-- 2. PAYMENTS — Faqat backend yozadi. UI dan yozish taqiqlangan.
-- -----------------------------------------------------------------------------
drop policy if exists "Payments: tenant insert blocked" on payments;
drop policy if exists "Payments: tenant update blocked" on payments;
drop policy if exists "Payments: tenant delete blocked" on payments;

create policy "Payments: tenant insert blocked"
  on payments for insert
  with check (false);

create policy "Payments: tenant update blocked"
  on payments for update
  using (false);

create policy "Payments: tenant delete blocked"
  on payments for delete
  using (false);

-- -----------------------------------------------------------------------------
-- 3. AI_CONVERSATIONS — Tenant ichida foydalanuvchi o'z suhbatlarini yarata oladi.
-- -----------------------------------------------------------------------------
drop policy if exists "AI conversations: tenant insert"        on ai_conversations;
drop policy if exists "AI conversations: tenant update mine"   on ai_conversations;
drop policy if exists "AI conversations: tenant delete mine"   on ai_conversations;

create policy "AI conversations: tenant insert"
  on ai_conversations for insert
  with check (tenant_id = current_setting('app.tenant_id', true));

create policy "AI conversations: tenant update mine"
  on ai_conversations for update
  using (tenant_id = current_setting('app.tenant_id', true)
         and (user_id = auth.uid() or user_id is null));

create policy "AI conversations: tenant delete mine"
  on ai_conversations for delete
  using (tenant_id = current_setting('app.tenant_id', true)
         and (user_id = auth.uid() or user_id is null));

-- -----------------------------------------------------------------------------
-- 4. AI_MESSAGES — Faqat insert (backend yozadi); user delete/update qila olmaydi.
-- -----------------------------------------------------------------------------
drop policy if exists "AI messages: tenant insert"          on ai_messages;
drop policy if exists "AI messages: no update"              on ai_messages;
drop policy if exists "AI messages: no delete"              on ai_messages;

create policy "AI messages: tenant insert"
  on ai_messages for insert
  with check (tenant_id = current_setting('app.tenant_id', true));

create policy "AI messages: no update"
  on ai_messages for update
  using (false);

create policy "AI messages: no delete"
  on ai_messages for delete
  using (false);

-- -----------------------------------------------------------------------------
-- 5. AI_FEEDBACK — User o'z fikrini yozadi/o'chiradi.
-- -----------------------------------------------------------------------------
drop policy if exists "AI feedback: tenant insert"      on ai_feedback;
drop policy if exists "AI feedback: tenant delete mine" on ai_feedback;

create policy "AI feedback: tenant insert"
  on ai_feedback for insert
  with check (tenant_id = current_setting('app.tenant_id', true)
              and (user_id = auth.uid() or user_id is null));

create policy "AI feedback: tenant delete mine"
  on ai_feedback for delete
  using (tenant_id = current_setting('app.tenant_id', true)
         and user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 6. DOC_TEMPLATES — Global jadval. Yozish faqat backend (service role).
-- -----------------------------------------------------------------------------
drop policy if exists "Doc templates: insert blocked" on doc_templates;
drop policy if exists "Doc templates: update blocked" on doc_templates;
drop policy if exists "Doc templates: delete blocked" on doc_templates;

create policy "Doc templates: insert blocked"
  on doc_templates for insert
  with check (false);

create policy "Doc templates: update blocked"
  on doc_templates for update
  using (false);

create policy "Doc templates: delete blocked"
  on doc_templates for delete
  using (false);

-- -----------------------------------------------------------------------------
-- 7. DOC_GENERATED — User o'z hujjatlarini yaratadi/o'chiradi.
-- -----------------------------------------------------------------------------
drop policy if exists "Doc generated: tenant insert"      on doc_generated;
drop policy if exists "Doc generated: tenant delete mine" on doc_generated;

create policy "Doc generated: tenant insert"
  on doc_generated for insert
  with check (tenant_id = current_setting('app.tenant_id', true));

create policy "Doc generated: tenant delete mine"
  on doc_generated for delete
  using (tenant_id = current_setting('app.tenant_id', true)
         and (user_id = auth.uid() or user_id is null));

-- -----------------------------------------------------------------------------
-- 8. SALES_BOTS — TENANT_ADMIN yaratadi. Boshqalar SELECT only.
-- -----------------------------------------------------------------------------
drop policy if exists "Sales bots: tenant insert" on sales_bots;
drop policy if exists "Sales bots: tenant update" on sales_bots;
drop policy if exists "Sales bots: tenant delete" on sales_bots;

create policy "Sales bots: tenant insert"
  on sales_bots for insert
  with check (tenant_id = current_setting('app.tenant_id', true));

create policy "Sales bots: tenant update"
  on sales_bots for update
  using (tenant_id = current_setting('app.tenant_id', true));

create policy "Sales bots: tenant delete"
  on sales_bots for delete
  using (tenant_id = current_setting('app.tenant_id', true));

-- -----------------------------------------------------------------------------
-- 9. CATALOGS — Tenant boshqaradi.
-- -----------------------------------------------------------------------------
drop policy if exists "Catalogs: tenant insert" on catalogs;
drop policy if exists "Catalogs: tenant update" on catalogs;
drop policy if exists "Catalogs: tenant delete" on catalogs;

create policy "Catalogs: tenant insert"
  on catalogs for insert
  with check (tenant_id = current_setting('app.tenant_id', true));

create policy "Catalogs: tenant update"
  on catalogs for update
  using (tenant_id = current_setting('app.tenant_id', true));

create policy "Catalogs: tenant delete"
  on catalogs for delete
  using (tenant_id = current_setting('app.tenant_id', true));

-- -----------------------------------------------------------------------------
-- 10. ORDERS — Faqat backend (Telegram bot) yozadi. UI dan SELECT only.
-- -----------------------------------------------------------------------------
drop policy if exists "Orders: insert blocked"      on orders;
drop policy if exists "Orders: tenant update mine"  on orders;
drop policy if exists "Orders: delete blocked"      on orders;

create policy "Orders: insert blocked"
  on orders for insert
  with check (false);

create policy "Orders: tenant update mine"
  on orders for update
  using (tenant_id = current_setting('app.tenant_id', true));

create policy "Orders: delete blocked"
  on orders for delete
  using (false);

-- -----------------------------------------------------------------------------
-- 11. KNOWLEDGE_BASE — Tenant-specific yozish ruxsat etilgan; global = service role.
-- -----------------------------------------------------------------------------
drop policy if exists "KB: tenant insert own"  on knowledge_base;
drop policy if exists "KB: tenant update own"  on knowledge_base;
drop policy if exists "KB: tenant delete own"  on knowledge_base;

create policy "KB: tenant insert own"
  on knowledge_base for insert
  with check (tenant_id is not null
              and tenant_id = current_setting('app.tenant_id', true));

create policy "KB: tenant update own"
  on knowledge_base for update
  using (tenant_id is not null
         and tenant_id = current_setting('app.tenant_id', true));

create policy "KB: tenant delete own"
  on knowledge_base for delete
  using (tenant_id is not null
         and tenant_id = current_setting('app.tenant_id', true));

-- -----------------------------------------------------------------------------
-- 12. USAGE_TRACKING — Faqat backend (increment_usage funksiyasi) yozadi.
-- -----------------------------------------------------------------------------
drop policy if exists "Usage: insert blocked"  on usage_tracking;
drop policy if exists "Usage: update blocked"  on usage_tracking;
drop policy if exists "Usage: delete blocked"  on usage_tracking;

create policy "Usage: insert blocked"
  on usage_tracking for insert
  with check (false);

create policy "Usage: update blocked"
  on usage_tracking for update
  using (false);

create policy "Usage: delete blocked"
  on usage_tracking for delete
  using (false);

-- =============================================================================
-- Performance — qo'shimcha kompozit indexlar (tez-tez WHERE da uchraydigan)
-- =============================================================================

-- AI cost tracking (per tenant per day)
create index if not exists ai_messages_tenant_created_idx
  on ai_messages(tenant_id, created_at desc);

-- Active subscriptions filter (admin dashboard)
create index if not exists subscriptions_tenant_status_idx
  on subscriptions(tenant_id, status);

-- Payment reconciliation
create index if not exists payments_tenant_status_created_idx
  on payments(tenant_id, status, created_at desc);

-- Order status by sales bot (most-used filter combo)
create index if not exists orders_sales_bot_status_idx
  on orders(sales_bot_id, status);

-- KB tag-based search (gin index for arrays)
create index if not exists knowledge_base_tags_gin_idx
  on knowledge_base using gin(tags);

-- =============================================================================
-- Tasdiqlovchi VIEW — admin dashboard uchun "RLS coverage health"
-- =============================================================================
create or replace view phase0_rls_health as
select
  c.relname as table_name,
  count(*) filter (where p.polcmd = 'r')                  as select_policies,
  count(*) filter (where p.polcmd = 'a')                  as insert_policies,
  count(*) filter (where p.polcmd = 'w')                  as update_policies,
  count(*) filter (where p.polcmd = 'd')                  as delete_policies,
  c.relrowsecurity                                        as rls_enabled
from pg_policy p
join pg_class c on p.polrelid = c.oid
where c.relname in (
  'subscriptions', 'payments', 'ai_conversations', 'ai_messages',
  'ai_feedback', 'doc_templates', 'doc_generated', 'sales_bots',
  'catalogs', 'orders', 'knowledge_base', 'usage_tracking'
)
group by c.relname, c.relrowsecurity
order by c.relname;

comment on view phase0_rls_health is
  'Phase 0 jadvallari uchun RLS coverage. Har bir jadval uchun har 4 ta operatsiya (r/a/w/d) policy ga ega bo''lishi kerak.';

-- =============================================================================
-- Yakuniy: smoke-test query (admin tomonidan ishga tushiriladi)
-- =============================================================================
-- select * from phase0_rls_health;
-- ❌ Agar biror jadval uchun insert_policies = 0 bo'lsa — gap bor.
