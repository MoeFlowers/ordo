-- ============================================================
--  Programar el correo de recordatorios (pg_cron + pg_net)
--  Córrelo UNA vez en Supabase → SQL Editor, DESPUÉS de haber
--  desplegado la Edge Function "enviar-recordatorios".
--
--  Reemplaza <PROJECT_REF> por el ref de tu proyecto (está en la
--  URL de Supabase: https://<PROJECT_REF>.supabase.co) y
--  <ANON_KEY> por tu clave publishable/anon (la misma de config.js).
-- ============================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Corre todos los días a las 13:00 UTC (~09:00 en Venezuela).
select cron.schedule(
  'recordatorios-diarios',
  '0 13 * * *',
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/enviar-recordatorios',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <ANON_KEY>'
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- Ver los jobs programados:   select * from cron.job;
-- Borrar el job si hace falta: select cron.unschedule('recordatorios-diarios');
