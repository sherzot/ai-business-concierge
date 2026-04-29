-- =============================================================================
-- Phase 0 — 12 ta yangi jadval
-- AI Business Concierge v2.0
-- Sana: 2026-04-17
-- =============================================================================
-- Mavjud jadvallar (o'zgartirilmaydi): audit_logs, ai_interactions, tenants,
--   user_tenants, tasks, notifications, inbox_items, documents, doc_chunks
-- =============================================================================

-- pgvector (knowledge_base uchun)
create extension if not exists vector;

-- =============================================================================
-- 1. SUBSCRIPTIONS — obunalar
-- =============================================================================
create table if not exists subscriptions (
  id                uuid         primary key default gen_random_uuid(),
  tenant_id         text         not null references tenants(id) on delete cascade,
  plan              text         not null default 'free'
                                 check (plan in ('free', 'starter', 'pro', 'company')),
  status            text         not null default 'active'
                                 check (status in ('active', 'cancelled', 'expired', 'grace')),
  started_at        timestamptz  not null default now(),
  expires_at        timestamptz,
  cancelled_at      timestamptz,
  grace_until       timestamptz,                        -- 3 kunlik imtiyoz davri
  payment_provider  text         check (payment_provider in ('click', 'payme')),
  external_id       text,                               -- provider tomonidagi ID
  metadata          jsonb        not null default '{}',
  created_at        timestamptz  not null default now(),
  updated_at        timestamptz  not null default now()
);

create index if not exists subscriptions_tenant_id_idx on subscriptions(tenant_id);
create index if not exists subscriptions_status_idx    on subscriptions(status);

alter table subscriptions enable row level security;

create policy "Tenant o'z obunasini ko'ra oladi"
  on subscriptions for select
  using (tenant_id = current_setting('app.tenant_id', true));

-- =============================================================================
-- 2. PAYMENTS — to'lovlar (Click + Payme idempotency)
-- =============================================================================
create table if not exists payments (
  id                   uuid         primary key default gen_random_uuid(),
  tenant_id            text         not null references tenants(id) on delete cascade,
  subscription_id      uuid         references subscriptions(id),
  provider             text         not null check (provider in ('click', 'payme')),
  provider_payment_id  text         unique,             -- idempotency: tashqi to'lov ID
  amount               bigint       not null,           -- tiyin (UZS * 100)
  currency             text         not null default 'UZS',
  status               text         not null default 'pending'
                                    check (status in ('pending', 'completed', 'failed', 'cancelled')),
  metadata             jsonb        not null default '{}',
  created_at           timestamptz  not null default now(),
  updated_at           timestamptz  not null default now()
);

create index if not exists payments_tenant_id_idx          on payments(tenant_id);
create index if not exists payments_provider_payment_id_idx on payments(provider_payment_id);
create index if not exists payments_status_idx             on payments(status);

alter table payments enable row level security;

create policy "Tenant o'z to'lovlarini ko'ra oladi"
  on payments for select
  using (tenant_id = current_setting('app.tenant_id', true));

-- =============================================================================
-- 3. AI_CONVERSATIONS — AI suhbatlar (web + Telegram)
-- =============================================================================
create table if not exists ai_conversations (
  id                uuid         primary key default gen_random_uuid(),
  tenant_id         text         not null references tenants(id) on delete cascade,
  user_id           uuid         references auth.users(id),
  platform          text         not null default 'web'
                                 check (platform in ('web', 'telegram')),
  telegram_chat_id  bigint,
  locale            text         not null default 'uz'
                                 check (locale in ('uz', 'ru', 'en')),
  topic             text         check (topic in ('soliq', 'kadrlar', 'biznes', 'boshqa')),
  status            text         not null default 'active'
                                 check (status in ('active', 'closed')),
  total_messages    integer      not null default 0,
  total_tokens      integer      not null default 0,
  total_cost_usd    numeric(10,6) not null default 0,
  created_at        timestamptz  not null default now(),
  updated_at        timestamptz  not null default now()
);

create index if not exists ai_conversations_tenant_id_idx        on ai_conversations(tenant_id);
create index if not exists ai_conversations_user_id_idx          on ai_conversations(user_id);
create index if not exists ai_conversations_telegram_chat_id_idx on ai_conversations(telegram_chat_id);
create index if not exists ai_conversations_created_at_idx       on ai_conversations(created_at desc);

alter table ai_conversations enable row level security;

create policy "Tenant o'z suhbatlarini ko'ra oladi"
  on ai_conversations for select
  using (tenant_id = current_setting('app.tenant_id', true));

-- =============================================================================
-- 4. AI_MESSAGES — AI xabarlar
-- =============================================================================
create table if not exists ai_messages (
  id               uuid          primary key default gen_random_uuid(),
  conversation_id  uuid          not null references ai_conversations(id) on delete cascade,
  tenant_id        text          not null references tenants(id) on delete cascade,
  role             text          not null check (role in ('user', 'assistant', 'system')),
  content          text          not null,
  content_excerpt  text,                                    -- birinchi 500 belgi
  llm_model        text,                                    -- claude-3-5-haiku-20241022 va h.k.
  complexity       text          check (complexity in ('simple', 'document', 'analysis', 'default')),
  input_tokens     integer       not null default 0,
  output_tokens    integer       not null default 0,
  cost_usd         numeric(10,6) not null default 0,
  latency_ms       integer,
  cached           boolean       not null default false,
  created_at       timestamptz   not null default now()
);

create index if not exists ai_messages_conversation_id_idx on ai_messages(conversation_id);
create index if not exists ai_messages_tenant_id_idx       on ai_messages(tenant_id);
create index if not exists ai_messages_created_at_idx      on ai_messages(created_at desc);

alter table ai_messages enable row level security;

create policy "Tenant o'z xabarlarini ko'ra oladi"
  on ai_messages for select
  using (tenant_id = current_setting('app.tenant_id', true));

-- =============================================================================
-- 5. AI_FEEDBACK — javob baholash (👍 / 👎)
-- =============================================================================
create table if not exists ai_feedback (
  id          uuid         primary key default gen_random_uuid(),
  message_id  uuid         not null references ai_messages(id) on delete cascade,
  tenant_id   text         not null references tenants(id) on delete cascade,
  user_id     uuid         references auth.users(id),
  rating      smallint     not null check (rating in (1, -1)),  -- 1=yaxshi, -1=yomon
  comment     text,
  created_at  timestamptz  not null default now()
);

create index if not exists ai_feedback_message_id_idx on ai_feedback(message_id);
create index if not exists ai_feedback_tenant_id_idx  on ai_feedback(tenant_id);

alter table ai_feedback enable row level security;

create policy "Tenant o'z feedbacklarini ko'ra oladi"
  on ai_feedback for select
  using (tenant_id = current_setting('app.tenant_id', true));

-- =============================================================================
-- 6. DOC_TEMPLATES — hujjat shablonlari (global, 15+ tur)
-- =============================================================================
create table if not exists doc_templates (
  id              uuid         primary key default gen_random_uuid(),
  slug            text         not null unique,       -- 'mehnat-shartnomasi'
  category        text         not null
                               check (category in ('shartnoma', 'ariza', 'buyruq', 'boshqa')),
  title_uz        text         not null,
  title_ru        text,
  description_uz  text,
  description_ru  text,
  fields          jsonb        not null default '[]', -- [{name, label_uz, label_ru, type, required}]
  template_uz     text         not null,              -- {{placeholder}} li matn
  template_ru     text,
  is_active       boolean      not null default true,
  created_at      timestamptz  not null default now(),
  updated_at      timestamptz  not null default now()
);

create index if not exists doc_templates_slug_idx     on doc_templates(slug);
create index if not exists doc_templates_category_idx on doc_templates(category);

-- doc_templates global — RLS kerak emas (faqat o'qish)
alter table doc_templates enable row level security;

create policy "Hamma shablonlarni o'qiy oladi"
  on doc_templates for select
  using (is_active = true);

-- =============================================================================
-- 7. DOC_GENERATED — yaratilgan hujjatlar
-- =============================================================================
create table if not exists doc_generated (
  id            uuid         primary key default gen_random_uuid(),
  tenant_id     text         not null references tenants(id) on delete cascade,
  user_id       uuid         references auth.users(id),
  template_id   uuid         references doc_templates(id),
  title         text         not null,
  locale        text         not null default 'uz',
  fields_data   jsonb        not null default '{}',  -- to'ldirilgan maydonlar
  storage_path  text,                                -- Supabase Storage path
  format        text         not null default 'pdf'
                             check (format in ('pdf', 'docx')),
  created_at    timestamptz  not null default now()
);

create index if not exists doc_generated_tenant_id_idx  on doc_generated(tenant_id);
create index if not exists doc_generated_user_id_idx    on doc_generated(user_id);
create index if not exists doc_generated_created_at_idx on doc_generated(created_at desc);

alter table doc_generated enable row level security;

create policy "Tenant o'z hujjatlarini ko'ra oladi"
  on doc_generated for select
  using (tenant_id = current_setting('app.tenant_id', true));

-- =============================================================================
-- 8. SALES_BOTS — savdo botlari
-- =============================================================================
create table if not exists sales_bots (
  id             uuid         primary key default gen_random_uuid(),
  tenant_id      text         not null references tenants(id) on delete cascade,
  bot_token      text         not null,              -- Telegram bot token
  bot_username   text,
  name           text         not null,
  status         text         not null default 'inactive'
                              check (status in ('active', 'inactive', 'suspended')),
  webhook_set    boolean      not null default false,
  settings       jsonb        not null default '{}',
  created_at     timestamptz  not null default now(),
  updated_at     timestamptz  not null default now()
);

create index if not exists sales_bots_tenant_id_idx on sales_bots(tenant_id);
create index if not exists sales_bots_status_idx    on sales_bots(status);

alter table sales_bots enable row level security;

create policy "Tenant o'z savdo botlarini ko'ra oladi"
  on sales_bots for select
  using (tenant_id = current_setting('app.tenant_id', true));

-- =============================================================================
-- 9. CATALOGS — mahsulot / xizmat katalogi
-- =============================================================================
create table if not exists catalogs (
  id            uuid         primary key default gen_random_uuid(),
  tenant_id     text         not null references tenants(id) on delete cascade,
  sales_bot_id  uuid         references sales_bots(id) on delete cascade,
  name          text         not null,
  description   text,
  image_url     text,
  price         bigint       not null default 0,     -- UZS da
  currency      text         not null default 'UZS',
  is_available  boolean      not null default true,
  sort_order    integer      not null default 0,
  metadata      jsonb        not null default '{}',
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);

create index if not exists catalogs_tenant_id_idx    on catalogs(tenant_id);
create index if not exists catalogs_sales_bot_id_idx on catalogs(sales_bot_id);
create index if not exists catalogs_sort_order_idx   on catalogs(sort_order);

alter table catalogs enable row level security;

create policy "Tenant o'z katalogini ko'ra oladi"
  on catalogs for select
  using (tenant_id = current_setting('app.tenant_id', true));

-- =============================================================================
-- 10. ORDERS — buyurtmalar
-- =============================================================================
create table if not exists orders (
  id                  uuid         primary key default gen_random_uuid(),
  tenant_id           text         not null references tenants(id) on delete cascade,
  sales_bot_id        uuid         references sales_bots(id),
  telegram_chat_id    bigint       not null,
  telegram_user_id    bigint,
  telegram_username   text,
  status              text         not null default 'pending'
                                   check (status in ('pending', 'confirmed', 'delivered', 'cancelled')),
  total_amount        bigint       not null default 0,   -- UZS da
  currency            text         not null default 'UZS',
  items               jsonb        not null default '[]', -- [{catalog_id, name, price, qty}]
  notes               text,
  created_at          timestamptz  not null default now(),
  updated_at          timestamptz  not null default now()
);

create index if not exists orders_tenant_id_idx        on orders(tenant_id);
create index if not exists orders_sales_bot_id_idx     on orders(sales_bot_id);
create index if not exists orders_status_idx           on orders(status);
create index if not exists orders_telegram_chat_id_idx on orders(telegram_chat_id);
create index if not exists orders_created_at_idx       on orders(created_at desc);

alter table orders enable row level security;

create policy "Tenant o'z buyurtmalarini ko'ra oladi"
  on orders for select
  using (tenant_id = current_setting('app.tenant_id', true));

-- =============================================================================
-- 11. KNOWLEDGE_BASE — bilimlar bazasi (pgvector + RAG)
-- =============================================================================
create table if not exists knowledge_base (
  id          uuid          primary key default gen_random_uuid(),
  tenant_id   text,                                    -- null = global (barcha tenantlar uchun)
  locale      text          not null default 'uz'
                            check (locale in ('uz', 'ru', 'en')),
  category    text          not null
                            check (category in ('soliq', 'kadrlar', 'biznes', 'hujjat', 'boshqa')),
  question    text          not null,
  answer      text          not null,
  tags        text[]        not null default '{}',
  embedding   vector(1536),                            -- OpenAI text-embedding-3-small
  version     integer       not null default 1,
  is_active   boolean       not null default true,
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now()
);

create index if not exists knowledge_base_locale_idx    on knowledge_base(locale);
create index if not exists knowledge_base_category_idx  on knowledge_base(category);
create index if not exists knowledge_base_is_active_idx on knowledge_base(is_active);

-- HNSW index — tez semantic search uchun (cosine distance)
create index if not exists knowledge_base_embedding_idx
  on knowledge_base
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

alter table knowledge_base enable row level security;

create policy "Hamma global KB ni o'qiy oladi"
  on knowledge_base for select
  using (is_active = true and (tenant_id is null or tenant_id = current_setting('app.tenant_id', true)));

-- =============================================================================
-- 12. USAGE_TRACKING — foydalanish hisobi (tarifga mos limitlar)
-- =============================================================================
create table if not exists usage_tracking (
  id              uuid         primary key default gen_random_uuid(),
  tenant_id       text         not null references tenants(id) on delete cascade,
  user_id         uuid         references auth.users(id),
  date            date         not null default current_date,
  ai_requests     integer      not null default 0,
  ai_tokens_used  integer      not null default 0,
  docs_generated  integer      not null default 0,
  created_at      timestamptz  not null default now(),
  updated_at      timestamptz  not null default now(),
  unique (tenant_id, user_id, date)
);

create index if not exists usage_tracking_tenant_id_idx on usage_tracking(tenant_id);
create index if not exists usage_tracking_date_idx      on usage_tracking(date desc);

alter table usage_tracking enable row level security;

create policy "Tenant o'z usage ni ko'ra oladi"
  on usage_tracking for select
  using (tenant_id = current_setting('app.tenant_id', true));

-- =============================================================================
-- Yordamchi funksiya: usage upsert (INSERT ... ON CONFLICT)
-- =============================================================================
create or replace function increment_usage(
  p_tenant_id     text,
  p_user_id       uuid,
  p_ai_requests   integer default 0,
  p_ai_tokens     integer default 0,
  p_docs          integer default 0
)
returns void
language plpgsql
security definer
as $$
begin
  insert into usage_tracking (tenant_id, user_id, date, ai_requests, ai_tokens_used, docs_generated)
  values (p_tenant_id, p_user_id, current_date, p_ai_requests, p_ai_tokens, p_docs)
  on conflict (tenant_id, user_id, date) do update
    set ai_requests    = usage_tracking.ai_requests    + excluded.ai_requests,
        ai_tokens_used = usage_tracking.ai_tokens_used + excluded.ai_tokens_used,
        docs_generated = usage_tracking.docs_generated + excluded.docs_generated,
        updated_at     = now();
end;
$$;

-- =============================================================================
-- match_knowledge funksiyasi — semantic search (KB uchun, Phase 0.2)
-- =============================================================================
create or replace function match_knowledge(
  query_embedding  vector(1536),
  match_locale     text    default 'uz',
  match_category   text    default null,
  match_count      integer default 5,
  match_threshold  float   default 0.75
)
returns table (
  id         uuid,
  question   text,
  answer     text,
  category   text,
  tags       text[],
  similarity float
)
language plpgsql
security definer
as $$
begin
  return query
  select
    kb.id,
    kb.question,
    kb.answer,
    kb.category,
    kb.tags,
    1 - (kb.embedding <=> query_embedding) as similarity
  from knowledge_base kb
  where
    kb.is_active = true
    and kb.locale = match_locale
    and (match_category is null or kb.category = match_category)
    and kb.embedding is not null
    and 1 - (kb.embedding <=> query_embedding) >= match_threshold
  order by kb.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- =============================================================================
-- updated_at auto-trigger uchun umumiy funksiya
-- =============================================================================
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Har bir jadvalga updated_at trigger
do $$
declare
  t text;
begin
  foreach t in array array[
    'subscriptions', 'payments', 'ai_conversations',
    'doc_templates', 'doc_generated', 'sales_bots',
    'catalogs', 'orders', 'usage_tracking'
  ] loop
    execute format('
      create trigger set_%I_updated_at
      before update on %I
      for each row execute function set_updated_at()', t, t);
  exception when duplicate_object then
    null; -- trigger allaqachon mavjud
  end loop;
end;
$$;
