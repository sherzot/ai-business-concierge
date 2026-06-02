-- =============================================================================
-- H-005: match_knowledge() ga p_tenant_id parametri qo'shish
-- Maqsad: semantic search faqat caller tenant + global (tenant_id IS NULL) yozuvlarni qaytarsin
-- =============================================================================

begin;

create or replace function public.match_knowledge(
  query_embedding  vector(1536),
  match_locale     text    default 'uz',
  match_category   text    default null,
  match_count      integer default 5,
  match_threshold  float   default 0.75,
  match_tenant_id  uuid    default null
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
set search_path = pg_catalog, public
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
  from public.knowledge_base kb
  where
    kb.is_active = true
    and kb.locale = match_locale
    and (match_category is null or kb.category = match_category)
    and kb.embedding is not null
    and 1 - (kb.embedding <=> query_embedding) >= match_threshold
    -- Tenant izolyatsiyasi: faqat global yozuvlar (tenant_id IS NULL)
    -- yoki caller tenant yozuvlari
    and (kb.tenant_id is null or kb.tenant_id = match_tenant_id)
  order by kb.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Eski signature revoke/grant (eski signature hali mavjud bo'lishi mumkin)
revoke execute on function public.match_knowledge(vector, text, text, integer, float) from public, anon;
grant  execute on function public.match_knowledge(vector, text, text, integer, float) to authenticated, service_role;

-- Yangi signature
revoke execute on function public.match_knowledge(vector, text, text, integer, float, uuid) from public, anon;
grant  execute on function public.match_knowledge(vector, text, text, integer, float, uuid) to authenticated, service_role;

commit;
