-- ============================================================
--  Compras financiadas por cuotas (tipo Cashea)
--  Ejecuta una vez en: Supabase -> SQL Editor -> New query -> Run
--  (La app funciona igual sin esto: reintenta sin estas columnas;
--   pero para guardar el desglose de cuotas, córrelo.)
-- ============================================================

alter table public.deudas add column if not exists plan text default '';        -- '' normal | nombre del proveedor de crédito (ej: 'Cashea', 'Mundo Total'); el color se guarda en el dispositivo
alter table public.deudas add column if not exists inicial numeric default 0;    -- inicial pagada (referencia)
alter table public.deudas add column if not exists cuotas jsonb not null default '[]'::jsonb;  -- [{n,monto,fecha,pagada}]
