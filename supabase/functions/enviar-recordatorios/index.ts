// ============================================================
//  Edge Function: enviar-recordatorios
//  Revisa las deudas "por pagar" próximas a vencer (o vencidas)
//  de cada usuario y le envía un correo con diseño profesional.
//  Idempotente: no reenvía la misma deuda dos veces el mismo día.
//
//  Variables (Supabase -> Edge Functions -> Secrets):
//    RESEND_API_KEY   (obligatoria)
//    MAIL_FROM        ej: "El Tablero <recordatorios@tudominio.com>"
//                     (por defecto usa el remitente de prueba de Resend)
//    REMINDER_DAYS    días de aviso previo (por defecto 3)
//    APP_URL          URL de tu app en Vercel
//  SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY las inyecta Supabase solo.
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SYM: Record<string, string> = { BS: "Bs", USD: "$", USDT: "USDT" };
const COLOR: Record<string, string> = { BS: "#C07C1E", USD: "#1F9E6A", USDT: "#0E9C97" };

const money = (n: number) =>
  new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

function diasTexto(dr: number) {
  if (dr < 0) return { txt: `Vencida hace ${Math.abs(dr)} día(s)`, color: "#E5484D" };
  if (dr === 0) return { txt: "Vence hoy", color: "#E5484D" };
  if (dr <= 3) return { txt: `Vence en ${dr} día(s)`, color: "#C07C1E" };
  return { txt: `Vence en ${dr} día(s)`, color: "#5B6B80" };
}

function buildEmail(lista: any[], today: Date, appUrl: string) {
  const filas = lista.map((d) => {
    const saldo = Number(d.monto) - Number(d.monto_abonado);
    const venc = new Date(d.fecha_vencimiento + "T00:00:00");
    const dr = Math.round((venc.getTime() - today.getTime()) / 86400000);
    const est = diasTexto(dr);
    const sim = SYM[d.moneda] ?? d.moneda;
    const col = COLOR[d.moneda] ?? "#16202E";
    return `
      <tr>
        <td style="padding:14px 16px;border-bottom:1px solid #EAEEF4;">
          <div style="font-weight:600;color:#16202E;font-size:15px;">${escape(d.descripcion)}</div>
          <div style="color:#8A99AC;font-size:13px;margin-top:2px;">${escape(d.contraparte || "Sin contraparte")}</div>
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #EAEEF4;text-align:right;white-space:nowrap;">
          <span style="font-family:'Courier New',monospace;font-weight:700;color:${col};font-size:15px;">${sim} ${money(saldo)}</span>
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #EAEEF4;text-align:right;white-space:nowrap;">
          <div style="color:#16202E;font-size:13px;">${d.fecha_vencimiento}</div>
          <div style="color:${est.color};font-size:12px;font-weight:600;margin-top:2px;">${est.txt}</div>
        </td>
      </tr>`;
  }).join("");

  return `
  <!DOCTYPE html>
  <html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#EEF1F7;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF1F7;padding:28px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px -12px rgba(20,30,50,.2);">
          <!-- Header -->
          <tr><td style="background:linear-gradient(120deg,#7C93FF,#5B6AD6);padding:26px 28px;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="vertical-align:middle;">
                <div style="width:40px;height:40px;border-radius:10px;background:rgba(255,255,255,.2);text-align:center;line-height:40px;font-size:22px;">💰</div>
              </td>
              <td style="vertical-align:middle;padding-left:12px;">
                <div style="color:#fff;font-weight:700;font-size:18px;">El Tablero</div>
                <div style="color:rgba(255,255,255,.8);font-size:12px;">Recordatorio de deudas</div>
              </td>
            </tr></table>
          </td></tr>
          <!-- Intro -->
          <tr><td style="padding:28px 28px 8px;">
            <h1 style="margin:0 0 8px;color:#16202E;font-size:20px;">Tienes ${lista.length} deuda(s) por atender</h1>
            <p style="margin:0;color:#5B6B80;font-size:14px;line-height:1.5;">Estas deudas están vencidas o vencen pronto. Págalas a tiempo para mantener tu administración en orden.</p>
          </td></tr>
          <!-- Tabla -->
          <tr><td style="padding:18px 16px 8px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #EAEEF4;border-radius:12px;overflow:hidden;">
              <tr style="background:#F5F7FB;">
                <td style="padding:11px 16px;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#8A99AC;">Deuda</td>
                <td style="padding:11px 16px;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#8A99AC;text-align:right;">Saldo</td>
                <td style="padding:11px 16px;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#8A99AC;text-align:right;">Vence</td>
              </tr>
              ${filas}
            </table>
          </td></tr>
          <!-- CTA -->
          <tr><td style="padding:20px 28px 30px;" align="center">
            <a href="${appUrl}" style="display:inline-block;background:#4B63E6;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 28px;border-radius:10px;">Abrir El Tablero</a>
          </td></tr>
          <!-- Footer -->
          <tr><td style="padding:18px 28px;background:#F5F7FB;border-top:1px solid #EAEEF4;">
            <p style="margin:0;color:#94A2B4;font-size:12px;line-height:1.5;">Recibes este correo porque tienes deudas registradas en El Tablero. Se envía automáticamente una vez al día cuando hay vencimientos cercanos.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

function escape(s: string) {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const RESEND = Deno.env.get("RESEND_API_KEY");
    const FROM = Deno.env.get("MAIL_FROM") ?? "El Tablero <onboarding@resend.dev>";
    const DAYS = Number(Deno.env.get("REMINDER_DAYS") ?? "3");
    const APP_URL = Deno.env.get("APP_URL") ?? "https://control-deudas-nine.vercel.app";
    if (!RESEND) return json({ ok: false, error: "Falta RESEND_API_KEY" }, 500);

    // "Hoy" en Venezuela (America/Caracas = UTC-4, sin horario de verano),
    // así el aviso no se corre ±1 día cerca de medianoche.
    const nowVe = new Date(Date.now() - 4 * 3600 * 1000);
    const today = new Date(Date.UTC(nowVe.getUTCFullYear(), nowVe.getUTCMonth(), nowVe.getUTCDate()));
    const todayStr = today.toISOString().slice(0, 10);
    const SUBS_DAYS = Number(Deno.env.get("SUBS_REMINDER_DAYS") ?? "15"); // aviso previo para suscripciones

    // Correos de cada usuario
    const { data: usersData, error: uErr } = await supabase.auth.admin.listUsers();
    if (uErr) return json({ ok: false, error: uErr.message }, 500);
    const emailById: Record<string, string> = {};
    for (const u of usersData.users) if (u.email) emailById[u.id] = u.email;

    // Deudas por pagar pendientes con fecha de vencimiento
    const { data: deudas, error: dErr } = await supabase
      .from("deudas").select("*")
      .eq("tipo", "por_pagar").eq("estado", "pendiente").neq("fecha_vencimiento", "");
    if (dErr) return json({ ok: false, error: dErr.message }, 500);

    const porUsuario: Record<string, any[]> = {};
    for (const d of deudas ?? []) {
      const venc = new Date(d.fecha_vencimiento + "T00:00:00");
      if (isNaN(venc.getTime())) continue;
      // Suscripciones avisan con más antelación (15 días); el resto usa REMINDER_DAYS
      const dias = d.recurrente ? SUBS_DAYS : DAYS;
      const limit = new Date(today.getTime() + dias * 86400000);
      if (venc <= limit && d.notified_date !== todayStr) {
        (porUsuario[d.user_id] ??= []).push(d);
      }
    }

    let enviados = 0;
    for (const [uid, lista] of Object.entries(porUsuario)) {
      const email = emailById[uid];
      if (!email) continue;
      const html = buildEmail(lista, today, APP_URL);
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: FROM,
          to: email,
          subject: `Tienes ${lista.length} deuda(s) por vencer`,
          html,
        }),
      });
      if (res.ok) {
        enviados++;
        await supabase.from("deudas").update({ notified_date: todayStr })
          .in("id", lista.map((d) => d.id));
      } else {
        console.error("Resend error:", await res.text());
      }
    }
    return json({ ok: true, usuarios_notificados: enviados });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
