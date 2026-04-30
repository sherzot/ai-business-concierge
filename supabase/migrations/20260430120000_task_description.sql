-- =============================================================================
-- Task description ustuni
-- 2026-04-30 — vazifaga title qatorida mazmun ham qo'shiladi
-- =============================================================================

alter table public.tasks
  add column if not exists description text;

comment on column public.tasks.description is
  'Vazifa mazmuni / qo''shimcha izoh. Markdown bo''lishi mumkin.';
