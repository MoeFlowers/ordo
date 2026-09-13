// ============================================================
//  Edge Function: borrar-cuenta
//  Elimina por completo la cuenta del usuario que llama (y, por
//  "on delete cascade", todas sus deudas, metas, gastos y ajustes).
//  El cliente la invoca con supa.functions.invoke('borrar-cuenta'),
//  que envía el JWT del usuario en Authorization.
//
//  Requiere (los inyecta Supabase solo): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//  Desplegar: Supabase → Edge Functions → deploy (igual que enviar-recordatorios).
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const jwt = (req.headers.get("Authorization") || "").replace("Bearer ", "").trim();
    if (!jwt) return json({ error: "Falta autorización" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verifica el token y obtiene el usuario dueño de la sesión
    const { data: u, error: uErr } = await admin.auth.getUser(jwt);
    if (uErr || !u?.user) return json({ error: "Sesión inválida" }, 401);
    const id = u.user.id;

    // Borra el usuario; las tablas con "references auth.users(id) on delete cascade"
    // (deudas, metas, gastos, user_settings) se limpian solas.
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return json({ error: error.message }, 500);

    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
