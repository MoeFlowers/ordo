# Desplegar el correo de recordatorios

La función ya está escrita en `supabase/functions/enviar-recordatorios/index.ts`. Falta desplegarla,
darle los secrets y programarla. Se hace **una sola vez**. Dos caminos: por el **panel web** (más fácil)
o por la **CLI**.

---

## Antes de empezar
- Una cuenta en [Resend](https://resend.com) y una **API key** (`re_...`). Si compartiste una antes,
  regenérala en Resend → API Keys.
- (Opcional) Un dominio verificado en Resend para el remitente. Sin dominio, usa el de prueba
  `onboarding@resend.dev` (llega, pero puede caer en spam).

---

## Opción A — Panel web (recomendada)

1. **Crear la función**
   Supabase → **Edge Functions** → *Deploy a new function* → nombre exacto `enviar-recordatorios`.
   Pega el contenido de `functions/enviar-recordatorios/index.ts` y despliega.

2. **Secrets**
   Edge Functions → *Manage secrets* → agrega:
   | Nombre | Valor |
   |---|---|
   | `RESEND_API_KEY` | tu clave `re_...` |
   | `APP_URL` | `https://control-deudas-nine.vercel.app` |
   | `MAIL_FROM` | `El Tablero <onboarding@resend.dev>` (o tu dominio) |
   | `REMINDER_DAYS` | `3` (aviso normal) |
   | `SUBS_REMINDER_DAYS` | `15` (aviso de suscripciones) |

   `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` los inyecta Supabase solo — no los pongas.

3. **Programar (cron)**
   SQL Editor → pega `supabase/cron.sql`, reemplaza `<PROJECT_REF>` y `<ANON_KEY>` → Run.

4. **Probar**
   En la app: **Ajustes → Sistema → "Enviar prueba"** (o en Supabase, Edge Functions → *Invoke*).
   Debe responder `{ ok: true, usuarios_notificados: N }`. Marca el checklist en verde.

---

## Opción B — CLI

```bash
npm i -g supabase
supabase login
supabase link --project-ref <PROJECT_REF>
supabase functions deploy enviar-recordatorios
supabase secrets set RESEND_API_KEY=re_xxx APP_URL=https://control-deudas-nine.vercel.app \
  MAIL_FROM="El Tablero <onboarding@resend.dev>" REMINDER_DAYS=3 SUBS_REMINDER_DAYS=15
```
Luego corre `supabase/cron.sql` en el SQL Editor.

---

## Notas
- La función es **idempotente**: no reenvía la misma deuda dos veces el mismo día (`notified_date`).
- Calcula "hoy" en **America/Caracas**, así el aviso no se corre ±1 día cerca de medianoche.
- Si no llega el correo: revisa *spam*, que la API key sea válida, y los logs en Edge Functions.
