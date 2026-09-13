<div align="center">

<img src="web/icons/icon-192.png" width="96" height="96" alt="Ordo" style="border-radius:22px">

# Ordo

**Control de finanzas personales multi‑moneda** — deudas, suscripciones, metas de ahorro, gastos y un planificador de pagos, con tasas de cambio en vivo para Venezuela.

*Ordo* (latín: «orden») — pon en orden tus finanzas.

![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.dot.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth%20%2B%20RLS-3ecf8e?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-instalable-5a0fc8?logo=pwa&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

</div>

## ✨ Qué hace

- **Deudas** en **Bs (BCV), USD, USDT y EUR** con conversión automática entre monedas.
- **Tasas de cambio en vivo** (BCV y paralelo desde `ve.dolarapi.com`; euro derivado de la paridad EUR/USD del BCE) con respaldo manual.
- **Suscripciones / mensualidades** con semáforo de estado y aviso previo.
- **Planificador** de pagos por quincena (tablero arrastrar‑y‑soltar) y desglose por cuota.
- **Compras a crédito** con proveedores personalizables (nombre + color) y calendario de cuotas.
- **Metas de ahorro** con proyección de interés compuesto (estilo *Earn*).
- **Gastos**: heatmap tipo GitHub del calendario de pagos + registro de gastos reales por categoría.
- **Estadísticas**: puntuación de administración y diagnóstico automático.
- **Calculadora / simulador**: conversor con tasa personalizada, y simulación de compra, deuda y crédito.
- **Perfil** con avatares generados, país → zona horaria automática, respaldo/exportación y borrado de cuenta.
- **PWA instalable**, tema claro/oscuro, y recordatorios por correo (Supabase Edge Function + Resend).

## 🧱 Stack

- **Frontend:** Vue 3 (build global, sin bundler) + CSS propio con design tokens.
- **Backend:** Supabase (Postgres, Auth email/password, **Row Level Security** por usuario, Edge Functions en Deno).
- **Hosting:** Vercel (estático, raíz `web/`).
- **Sin build step:** dependencias vendorizadas; se sirve HTML/CSS/JS directo.

## 🚀 Puesta en marcha

```bash
git clone https://github.com/MoeFlowers/ordo.git
cd ordo
```

1. **Supabase** — crea un proyecto y, en *SQL Editor*, corre [`supabase/setup.sql`](supabase/setup.sql) (crea tablas + RLS).
2. **Config** — copia tu *Project URL* y *anon key* en [`web/config.js`](web/config.js).
3. **Ejecuta** — sirve la carpeta `web/` con cualquier servidor estático:
   ```bash
   npx serve web    # o: python -m http.server -d web 8080
   ```
   o despliega en **Vercel** con *Root Directory* = `web`.
4. *(Opcional)* **Recordatorios por correo** — sigue [`supabase/DESPLIEGUE.md`](supabase/DESPLIEGUE.md).

> La `anon key` es pública por diseño: las políticas **RLS** garantizan que cada usuario solo ve y edita sus propios datos.

## 📁 Estructura

```
web/            App Vue (index.html, app.js, styles.css, PWA)
supabase/       setup.sql, Edge Functions (recordatorios, borrar-cuenta), cron
docs/           Notas de diseño / plan
legacy-docker/  Versión local original (PHP + Docker), como referencia histórica
```

## 📄 Licencia

[MIT](LICENSE) — libre para usar, aprender y adaptar.
