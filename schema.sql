-- ============================================================
--  El Tablero — Esquema de base de datos (Supabase / Postgres)
--  Ejecuta TODO esto una vez en: Supabase -> SQL Editor -> New query -> Run
-- ============================================================

create table if not exists public.deudas (
    id                bigint generated always as identity primary key,
    user_id           uuid not null default auth.uid() references auth.users(id) on delete cascade,
    tipo              text not null default 'por_pagar',   -- por_pagar | por_cobrar
    descripcion       text not null,
    contraparte       text default '',
    moneda            text not null default 'USD',         -- BS | USD | USDT
    monto             numeric not null default 0,
    monto_abonado     numeric not null default 0,
    fecha_creacion    date not null default current_date,
    fecha_vencimiento text default '',
    estado            text not null default 'pendiente',   -- pendiente | pagada
    notas             text default '',
    notified_date     text default '',
    recurrente        boolean not null default false,      -- deuda mensual que se repite
    dia_pago          int,                                 -- día del mes (1-31) si es recurrente
    pagos_realizados  int not null default 0,              -- cuotas mensuales pagadas
    created_at        timestamptz not null default now()
);

create index if not exists deudas_user_idx on public.deudas (user_id);

-- Seguridad a nivel de fila: cada usuario solo ve y gestiona SUS deudas.
alter table public.deudas enable row level security;

drop policy if exists "deudas_select_own" on public.deudas;
drop policy if exists "deudas_insert_own" on public.deudas;
drop policy if exists "deudas_update_own" on public.deudas;
drop policy if exists "deudas_delete_own" on public.deudas;

create policy "deudas_select_own" on public.deudas
    for select using (auth.uid() = user_id);
create policy "deudas_insert_own" on public.deudas
    for insert with check (auth.uid() = user_id);
create policy "deudas_update_own" on public.deudas
    for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "deudas_delete_own" on public.deudas
    for delete using (auth.uid() = user_id);
