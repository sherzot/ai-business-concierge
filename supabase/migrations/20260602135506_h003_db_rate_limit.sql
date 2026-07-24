-- =============================================================================
-- H-003: Contact form uchun DB-based rate limiting
-- Muammo: in-memory Map cold-start da tozalanadi, multi-instance da ishlaydi
-- Yechim: rate_limit_logs jadvali + atomik check_rate_limit() funksiya
-- =============================================================================

begin;

create table if not exists public.rate_limit_logs (
  id           bigserial    primary key,
  key          text         not null,
  window_start timestamptz  not null,
  count        integer      not null default 1,
  constraint uq_rate_limit_key_window unique (key, window_start)
);

create index if not exists idx_rate_limit_key_window
  on public.rate_limit_logs (key, window_start);

-- Faqat SECURITY DEFINER funksiya orqali kirish, to'g'ridan-to'g'ri emas
alter table public.rate_limit_logs enable row level security;

-- =============================================================================
-- check_rate_limit() — atomik: upsert + count qaytaradi
-- true  = so'rov ruxsat etilgan (limit oshilmagan)
-- false = limit oshilgan, so'rovni rad etish kerak
-- =============================================================================
create or replace function public.check_rate_limit(
  p_key          text,
  p_window_start timestamptz,
  p_limit        integer
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_count integer;
begin
  -- Eski yozuvlarni vaqti-vaqti bilan tozalash (taxminan 1% so'rovlarda)
  if random() < 0.01 then
    delete from public.rate_limit_logs
    where window_start < now() - interval '3 hours';
  end if;

  -- Atomik upsert: yangi oyna = 1 dan boshlash, mavjud = +1
  insert into public.rate_limit_logs (key, window_start, count)
  values (p_key, p_window_start, 1)
  on conflict (key, window_start) do update
    set count = rate_limit_logs.count + 1
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

-- Faqat service_role chaqira oladi (Edge Function service key bilan ishlaydi)
revoke execute on function public.check_rate_limit(text, timestamptz, integer) from public, anon, authenticated;
grant  execute on function public.check_rate_limit(text, timestamptz, integer) to service_role;

commit;
