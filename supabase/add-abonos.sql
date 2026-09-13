-- ============================================================
--  Historial de abonos por deuda.
--  Ejecuta una vez en: Supabase -> SQL Editor -> New query -> Run
--  (La app funciona igual sin esto: guarda el "Total abonado";
--   esta columna solo agrega el historial detallado con fechas.)
-- ============================================================

alter table public.deudas add column if not exists abonos jsonb not null default '[]'::jsonb;
