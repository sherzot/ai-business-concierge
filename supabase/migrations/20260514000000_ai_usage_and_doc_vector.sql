-- =============================================================================
-- AI cost tracking + doc_chunks pgvector
-- Sana: 2026-05-14
-- Manba: scale-prompt.md Vazifa 1.3 (token usage) va 2.1 (RAG)
-- =============================================================================
-- Maqsad:
--   1) Har AI chaqiruvga token usage logini yozish (tenant cost tracking)
--   2) doc_chunks da semantic search uchun pgvector embedding
--   3) match_documents() RAG funksiyasi (tenant izolyatsiyasi bilan)
-- =============================================================================

begin;
-- -----------------------------------------------------------------------------
-- 1. AI USAGE LOGS — har AI chaqiruv uchun token va narx
-- -----------------------------------------------------------------------------
create table if not exists public.ai_usage_logs (
  id                  uuid          primary key default gen_random_uuid(),
  tenant_id           text          not null references public.tenants(id) on delete cascade,
  user_id             uuid          references auth.users(id) on delete set null,
  endpoint            text          not null,                   -- '/v1/ai/chat', '/v1/admin/ai/chat' va h.k.
  model               text          not null,                   -- 'claude-3-5-haiku', 'gpt-4o-mini' va h.k.
  provider            text          not null
                                    check (provider in ('claude','openai','fallback')),
  complexity          text          check (complexity in ('simple','document','analysis','default')),
  prompt_tokens       integer       not null default 0,
  completion_tokens   integer       not null default 0,
  total_tokens        integer       generated always as (prompt_tokens + completion_tokens) stored,
  cost_usd            numeric(10,6) not null default 0,
  cached              boolean       not null default false,
  latency_ms          integer,
  trace_id            text,
  created_at          timestamptz   not null default now()
);
comment on table public.ai_usage_logs is
  'Har AI chaqiruv token va narx ma''lumoti. Tenant cost tracking, billing va churn tahlili uchun.';
-- Indekslar — analitika va billing uchun
create index if not exists ai_usage_logs_tenant_created_idx
  on public.ai_usage_logs(tenant_id, created_at desc);
create index if not exists ai_usage_logs_user_created_idx
  on public.ai_usage_logs(user_id, created_at desc)
  where user_id is not null;
create index if not exists ai_usage_logs_endpoint_idx
  on public.ai_usage_logs(endpoint, created_at desc);
-- RLS — tenant izolyatsiya
alter table public.ai_usage_logs enable row level security;
drop policy if exists "ai_usage_tenant_select" on public.ai_usage_logs;
create policy "ai_usage_tenant_select"
  on public.ai_usage_logs for select
  using (
    tenant_id = current_setting('app.tenant_id', true)
    or exists (
      select 1 from public.user_tenants ut
      where ut.user_id = auth.uid()
        and ut.role in ('super_admin', 'sub_admin')
    )
  );
-- Faqat backend (service_role) yozadi
drop policy if exists "ai_usage_insert_blocked" on public.ai_usage_logs;
create policy "ai_usage_insert_blocked"
  on public.ai_usage_logs for insert
  with check (false);
-- -----------------------------------------------------------------------------
-- 2. AI USAGE SUMMARY — tenant bo'yicha agregat (Admin dashboard uchun tez)
-- -----------------------------------------------------------------------------
create or replace view public.v_ai_usage_summary
with (security_invoker = true)
as
select
  tenant_id,
  date_trunc('day', created_at)::date  as date,
  count(*)                              as requests,
  sum(prompt_tokens)                    as prompt_tokens,
  sum(completion_tokens)                as completion_tokens,
  sum(total_tokens)                     as total_tokens,
  sum(cost_usd)::numeric(10,4)          as cost_usd,
  count(*) filter (where cached)        as cache_hits,
  avg(latency_ms)::int                  as avg_latency_ms
from public.ai_usage_logs
group by tenant_id, date_trunc('day', created_at);
comment on view public.v_ai_usage_summary is
  'Kunlik agregat per tenant. Admin /v1/admin/ai/usage endpoint uchun.';
-- -----------------------------------------------------------------------------
-- 3. PGVECTOR DOC_CHUNKS — semantic search uchun
-- -----------------------------------------------------------------------------
create extension if not exists vector;
alter table public.doc_chunks
  add column if not exists embedding vector(1536);
comment on column public.doc_chunks.embedding is
  'OpenAI text-embedding-3-small (1536 o''lcham). RAG search uchun.';
-- HNSW index — knowledge_base patterndan keladi
create index if not exists doc_chunks_embedding_idx
  on public.doc_chunks
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);
-- -----------------------------------------------------------------------------
-- 4. match_documents() — RAG search funksiyasi (tenant scoped)
-- -----------------------------------------------------------------------------
create or replace function public.match_documents(
  query_embedding  vector(1536),
  match_threshold  float    default 0.7,
  match_count      integer  default 10,
  p_tenant_id      text     default null
)
returns table (
  chunk_id    uuid,
  document_id uuid,
  content     text,
  similarity  float
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  return query
  select
    dc.id           as chunk_id,
    dc.document_id  as document_id,
    dc.content      as content,
    1 - (dc.embedding <=> query_embedding) as similarity
  from public.doc_chunks dc
  where
    dc.embedding is not null
    and (p_tenant_id is null or dc.tenant_id = p_tenant_id)
    and 1 - (dc.embedding <=> query_embedding) >= match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
end;
$$;
comment on function public.match_documents is
  'RAG semantic search: doc_chunks ichidan eng yaqin chunklar. p_tenant_id NULL bo''lsa global qidirish.';
revoke execute on function public.match_documents(vector, float, integer, text)
  from public, anon;
grant execute on function public.match_documents(vector, float, integer, text)
  to authenticated, service_role;
-- -----------------------------------------------------------------------------
-- 5. Performance indexes — tez-tez ishlatiladigan filtrlar
-- -----------------------------------------------------------------------------
create index if not exists doc_chunks_document_idx
  on public.doc_chunks(document_id);
create index if not exists doc_chunks_tenant_idx
  on public.doc_chunks(tenant_id);
commit;
-- =============================================================================
-- Yakuniy:
--   • ai_usage_logs jadval + 3 ta index + RLS
--   • v_ai_usage_summary view (tenant kunlik agregat)
--   • doc_chunks.embedding ustun + HNSW index
--   • match_documents() RAG funksiyasi
--   • doc_chunks document/tenant indekslari
-- =============================================================================;
