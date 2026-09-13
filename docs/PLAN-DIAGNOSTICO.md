# Plan de resolución del diagnóstico — El Tablero

> Objetivo: dejar en **verde** los 9 focos de atención del diagnóstico (2 alta · 3 media · 3 baja · 1 info),
> atacándolos del más alto al más bajo. Fecha de arranque: 13 sep 2026.

Cada punto indica **quién lo hace**:
- 🤖 **Código (Claude)** — resuelto en el repo, verificado; se despliega solo al hacer push.
- 🧑 **Una acción tuya** — lo dejé listo (SQL de copiar/pegar, botón, o checklist); tú lo ejecutas una vez.

La app trae ahora una vista **Ajustes → Sistema** que hace un chequeo en vivo y muestra 🔴/🟢 por cada
dependencia, con el SQL a copiar y la lista de acciones manuales que quedan. Ese panel es el "semáforo"
que confirma que todo quedó en verde.

---

## Prioridad ALTA

### 1. Faltan columnas en la base de datos 🧑 (código listo)
- **Qué:** funciones nuevas (recurrentes, abonos, cuotas, metas, sync, gastos) guardan en columnas/tablas
  que quizá no existen todavía en Supabase. La app reintenta y no se rompe, pero el detalle no persiste.
- **Solución:** un único script consolidado **`supabase/setup.sql`** (idempotente: `if not exists`) con
  TODAS las columnas de `deudas`, la tabla `metas`, y las tablas nuevas `user_settings` y `gastos` (con RLS).
- **Acción tuya:** Supabase → SQL Editor → pega `setup.sql` → Run (una vez).
- **Verás verde en:** Ajustes → Sistema → "Base de datos".

### 2. El correo aún no está activo 🧑 (código listo + docs)
- **Qué:** la Edge Function de recordatorios existe pero no está desplegada ni programada.
- **Solución:** guía paso a paso **`supabase/DESPLIEGUE.md`** + `supabase/cron.sql` (pg_cron 1×/día).
  Además corregí la zona horaria de la función (ver punto 6).
- **Acción tuya:** desplegar la función, poner los secrets (RESEND_API_KEY, APP_URL), correr `cron.sql`.
- **Verás verde en:** Ajustes → Sistema → checklist "Correo desplegado / probado" (botón "Enviar prueba").

---

## Prioridad MEDIA

### 3. El plan vive solo en cada dispositivo 🤖
- **Qué:** `planCfg`, asignaciones del tablero, tasas manuales y proveedores de crédito vivían solo en
  `localStorage`: distintos en laptop y teléfono, y se pierden al limpiar el navegador.
- **Solución:** tabla `user_settings` (jsonb por usuario). La app **sincroniza** al cargar (pull) y al
  cambiar (push, con debounce), usando `localStorage` como caché offline y **fallback** si la tabla aún no existe.

### 4. Las suscripciones avanzan aunque no pagues 🤖
- **Qué:** al abrir la app, una mensualidad vencida saltaba sola al mes siguiente aunque no la pagaras,
  ocultando un pago olvidado.
- **Solución:** `loadDeudas` ya **no** auto-avanza. Una recurrente vencida se queda como *"por pagar / vencida"*
  hasta que pulses **"Pagué este mes"**; solo entonces avanza. Solo se re-proyecta hacia adelante si la fecha
  quedó en un mes ya cerrado sin estar vencida (mantiene el próximo cobro correcto sin ocultar atrasos).

### 5. "Gastos" solo reflejaba deudas 🤖 + 🧑 (tabla)
- **Qué:** el calendario de Gastos se armaba solo con deudas, no con gastos reales del día a día.
- **Solución:** módulo **Gastos reales** con categorías (comida, transporte, servicios, etc.): alta rápida,
  lista, total del mes y una **capa propia (azul) en el heatmap**. Tabla `gastos` (en `setup.sql`).
  Degrada con elegancia: si la tabla no existe, la sección invita a correr el SQL en vez de romperse.

---

## Prioridad BAJA

### 6. Zona horaria 🤖
- **Qué:** la app calcula días con hora local y el correo usaba UTC → ±1 día cerca de medianoche.
- **Solución:** la Edge Function calcula "hoy" en **America/Caracas**.

### 7. Borrar un usuario borra sus deudas 🤖 (mitigado por diseño)
- **Qué:** `on delete cascade` borra deudas/metas al borrar la cuenta (correcto, pero peligroso a la ligera).
- **Solución:** la app **no** tiene botón de "borrar cuenta" (no hay ruta accidental). Se documenta la regla:
  para reiniciar, editar o resetear contraseña — nunca borrar el usuario. Nota visible en Ajustes → Sistema.

### 8. Sin respaldo ni exportación 🤖
- **Qué:** no había forma de exportar/respaldar.
- **Solución:** botones **Exportar CSV** (deudas) y **Respaldo JSON** (deudas + metas + gastos) en
  Ajustes → Sistema. Descarga 100% en el cliente, sin enviar datos a terceros.

---

## Informativo

### 9. Seguridad: resetear contraseña de la BD 🧑
- **Qué:** compartiste la contraseña de la base de datos en el chat; conviene rotarla.
- **Solución:** checklist en Ajustes → Sistema (Supabase → Settings → Database → Reset password).
  La clave pública (anon) del frontend es pública por diseño y no hay que cambiarla.

---

## Orden de ejecución
1. 🤖 Código: #4, #6, #3, #5, #8 + panel Ajustes/Sistema (este push).
2. 🧑 Tú, una vez: correr `supabase/setup.sql` (#1, cubre 3 y 5) y resetear la contraseña (#9).
3. 🧑 Tú, una vez: desplegar el correo con `DESPLIEGUE.md` + `cron.sql` (#2).
4. Abrir Ajustes → Sistema y confirmar que todo está 🟢.

Al terminar esto, sigue el segundo análisis: **publicar como app móvil** (Play Store + App Store) y web.
