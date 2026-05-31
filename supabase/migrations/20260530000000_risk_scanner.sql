-- =============================================================================
-- Risk Scanner — DB jadvallari
-- Sana: 2026-05-30
-- Maqsad: Super Admin / Sub Admin uchun xavfsizlik skaneri natijalari saqlash
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. RISK_SCANS — har bir skan sessiyasi
-- -----------------------------------------------------------------------------
create table if not exists public.risk_scans (
  id            uuid          primary key default gen_random_uuid(),
  triggered_by  uuid          references auth.users(id) on delete set null,
  started_at    timestamptz   not null default now(),
  finished_at   timestamptz,
  status        text          not null default 'running'
                              check (status in ('running','completed','failed')),
  duration_ms   integer,
  total_count   integer       not null default 0,
  critical_count integer      not null default 0,
  high_count    integer       not null default 0,
  medium_count  integer       not null default 0,
  low_count     integer       not null default 0,
  score         integer,      -- 0–100, yuqori = yaxshi
  source        text          not null default 'hybrid'
                              check (source in ('static','advisor','hybrid')),
  meta          jsonb         not null default '{}'
);

comment on table public.risk_scans is
  'Har bir xavfsizlik skani sessiyasi. triggered_by = kim ishga tushirgan.';

-- -----------------------------------------------------------------------------
-- 2. RISK_FINDINGS — har bir skan ichidagi topilmalar
-- -----------------------------------------------------------------------------
create table if not exists public.risk_findings (
  id            uuid          primary key default gen_random_uuid(),
  scan_id       uuid          not null references public.risk_scans(id) on delete cascade,
  code          text          not null,   -- C-001, H-002, M-003 ...
  severity      text          not null check (severity in ('critical','high','medium','low','info')),
  title         text          not null,
  description   text          not null,
  location      text,         -- fayl:qator yoki jadval nomi
  source        text          not null check (source in ('static','advisor')),
  status        text          not null default 'open'
                              check (status in ('open','acknowledged','resolved','false_positive')),
  remediation   text,         -- tuzatish yo'nalishi
  resolved_at   timestamptz,
  resolved_by   uuid          references auth.users(id) on delete set null,
  created_at    timestamptz   not null default now()
);

comment on table public.risk_findings is
  'Skan natijasidagi har bir zaiflik. scan_id orqali risk_scans ga boglangan.';

-- -----------------------------------------------------------------------------
-- 3. Indekslar
-- -----------------------------------------------------------------------------
create index if not exists risk_scans_started_at_idx
  on public.risk_scans(started_at desc);

create index if not exists risk_scans_status_idx
  on public.risk_scans(status);

create index if not exists risk_findings_scan_id_idx
  on public.risk_findings(scan_id);

create index if not exists risk_findings_severity_idx
  on public.risk_findings(scan_id, severity);

create index if not exists risk_findings_status_idx
  on public.risk_findings(status)
  where status = 'open';

-- -----------------------------------------------------------------------------
-- 4. RLS — faqat service_role yoza oladi; super/sub admin o'qiy oladi
--    (Edge Function service_role client ishlatadi, frontend esa API orqali)
-- -----------------------------------------------------------------------------
alter table public.risk_scans    enable row level security;
alter table public.risk_findings enable row level security;

-- Faqat service_role yozadi (RLS bypass)
-- O'qish: autentifikatsiya qilingan foydalanuvchi (admin tekshiruvi API da)
create policy "risk_scans: admin read"
  on public.risk_scans for select
  using (auth.role() = 'authenticated');

create policy "risk_scans: service write"
  on public.risk_scans for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "risk_findings: admin read"
  on public.risk_findings for select
  using (auth.role() = 'authenticated');

create policy "risk_findings: service write"
  on public.risk_findings for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

commit;
