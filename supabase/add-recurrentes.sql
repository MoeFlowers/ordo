-- ============================================================
--  Deudas mensuales recurrentes — agrega las columnas necesarias.
--  Ejecuta una vez en: Supabase -> SQL Editor -> New query -> Run
--  (Es seguro correrlo aunque ya existan; usa "if not exists".)
-- ============================================================

alter table public.deudas add column if not exists recurrente boolean not null default false;
alter table public.deudas add column if not exists dia_pago int;
alter table public.deudas add column if not exists pagos_realizados int not null default 0;
alter table public.deudas add column if not exists ultimo_pago text default '';

-- (Opcional) Convertir tus deudas actuales a mensuales, por si prefieres SQL
-- en vez de editarlas en la app. Ajusta el nombre y el día:
--
-- update public.deudas set recurrente = true, dia_pago = 2
--   where descripcion ilike '%prestamo bdv%';
-- update public.deudas set recurrente = true, dia_pago = 16
--   where descripcion ilike '%suscripc%';
