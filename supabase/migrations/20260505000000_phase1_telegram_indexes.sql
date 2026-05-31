-- =============================================================================
-- Phase 1 — Telegram Bot uchun index va constraint'lar
-- Sana: 2026-05-05
-- =============================================================================

-- subscriptions.tenant_id ga unique index (har tenant uchun bitta obuna)
-- session.ts dagi upsert uchun kerak
create unique index if not exists subscriptions_tenant_id_unique
  on subscriptions(tenant_id);
-- ai_conversations: telegram platform + chat_id bo'yicha tez qidiruv
create index if not exists ai_conversations_platform_chat_idx
  on ai_conversations(platform, telegram_chat_id)
  where platform = 'telegram';
-- ai_messages: rate limit tekshirish uchun (tenant + role + created_at)
create index if not exists ai_messages_rate_limit_idx
  on ai_messages(tenant_id, role, created_at)
  where role = 'user';
-- ai_feedback: message_id + tenant_id bo'yicha tez qidiruv
create index if not exists ai_feedback_message_tenant_idx
  on ai_feedback(message_id, tenant_id);
-- tenants: plan bo'yicha filter (free plan limitlar uchun)
create index if not exists tenants_plan_idx on tenants(plan);
