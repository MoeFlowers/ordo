-- ============================================================
--  Programar el envío diario de recordatorios (pg_cron + pg_net)
--  Ejecuta esto en Supabase -> SQL Editor DESPUÉS de haber
--  desplegado la Edge Function "enviar-recordatorios".
--
--  Reemplaza:
--    <PROJECT_REF>        -> el ref de tu proyecto (TU-PROYECTO)
--    <SERVICE_ROLE_KEY>   -> Settings > API > service_role (SECRETO, no lo compartas)
--
--  Corre a las 13:00 UTC = 9:00 a. m. hora de Venezuela.
-- ============================================================

-- 1) Habilita las extensiones (una sola vez)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2) (Opcional) elimina un job anterior con el mismo nombre
select cron.unschedule('recordatorios-deudas')
where exists (select 1 from cron.job where jobname = 'recordatorios-deudas');

-- 3) Programa el envío diario
select cron.schedule(
  'recordatorios-deudas',
  '0 13 * * *',
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.functions.supabase.co/enviar-recordatorios',
    headers := jsonb_build_object(
                 'Authorization', 'Bearer <SERVICE_ROLE_KEY>',
                 'Content-Type',  'application/json'
               ),
    body    := '{}'::jsonb
  );
  $$
);

-- Para ver los jobs programados:
--   select * from cron.job;
-- Para disparar una prueba manual ahora mismo, corre el bloque net.http_post de arriba suelto.
