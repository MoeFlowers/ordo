-- ============================================================
--  El Tablero — SETUP CONSOLIDADO (córrelo UNA vez)
--  Supabase → SQL Editor → New query → pega TODO → Run.
--  Es idempotente y seguro: usa "if not exists"; puedes correrlo
--  de nuevo sin dañar tus datos.
--
--  Cubre: columnas de deudas (recurrentes, abonos, cuotas/crédito),
--  tabla de metas, sincronización entre dispositivos (user_settings)
--  y gastos reales (gastos). Todo con seguridad por fila (RLS).
-- ============================================================

-- ---------- 1) Tabla base de deudas (por si no existía) ----------
create table if not exists public.deudas (
    id              bigint generated always as identity primary key,
    user_id         uuid not null default auth.uid() references auth.users(id) on delete cascade,
    tipo            text not null default 'por_pagar',   -- por_pagar | por_cobrar
    descripcion     text not null default '',
    contraparte     text default '',
    moneda          text not null default 'USD',         -- USD | BS | USDT
    monto           numeric not null default 0,
    monto_abonado   numeric not null default 0,
    fecha_vencimiento text default '',
    estado          text not null default 'pendiente',   -- pendiente | pagada
    notas           text default '',
    notified_date   text default '',
    created_at      timestamptz not null default now()
);

-- ---------- 2) Columnas nuevas de deudas (recurrentes/abonos/crédito) ----------
alter table public.deudas add column if not exists recurrente boolean not null default false;
alter table public.deudas add column if not exists dia_pago int;
alter table public.deudas add column if not exists pagos_realizados int not null default 0;
alter table public.deudas add column if not exists ultimo_pago text default '';
alter table public.deudas add column if not exists abonos jsonb not null default '[]'::jsonb;
alter table public.deudas add column if not exists plan text default '';          -- '' normal | nombre del proveedor de crédito (ej: 'Cashea', 'Mundo Total')
alter table public.deudas add column if not exists inicial numeric default 0;
alter table public.deudas add column if not exists cuotas jsonb not null default '[]'::jsonb;
alter table public.deudas add column if not exists pagado_en timestamptz;      -- marca de tiempo de cuándo se saldó

create index if not exists deudas_user_idx on public.deudas (user_id);
alter table public.deudas enable row level security;
drop policy if exists "deudas_select_own" on public.deudas;
drop policy if exists "deudas_insert_own" on public.deudas;
drop policy if exists "deudas_update_own" on public.deudas;
drop policy if exists "deudas_delete_own" on public.deudas;
create policy "deudas_select_own" on public.deudas for select using (auth.uid() = user_id);
create policy "deudas_insert_own" on public.deudas for insert with check (auth.uid() = user_id);
create policy "deudas_update_own" on public.deudas for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "deudas_delete_own" on public.deudas for delete using (auth.uid() = user_id);

-- ---------- 3) Metas de ahorro ----------
create table if not exists public.metas (
    id              bigint generated always as identity primary key,
    user_id         uuid not null default auth.uid() references auth.users(id) on delete cascade,
    nombre          text not null,
    moneda          text not null default 'USDT',
    objetivo        numeric not null default 0,
    ahorrado        numeric not null default 0,
    apy             numeric not null default 0,
    tipo            text not null default 'simple',      -- simple | flexible | fija
    plazo_meses     int,
    aporte_mensual  numeric not null default 0,
    movimientos     jsonb not null default '[]'::jsonb,
    fecha_creacion  date not null default current_date,
    created_at      timestamptz not null default now()
);
alter table public.metas add column if not exists movimientos jsonb not null default '[]'::jsonb;
create index if not exists metas_user_idx on public.metas (user_id);
alter table public.metas enable row level security;
drop policy if exists "metas_select_own" on public.metas;
drop policy if exists "metas_insert_own" on public.metas;
drop policy if exists "metas_update_own" on public.metas;
drop policy if exists "metas_delete_own" on public.metas;
create policy "metas_select_own" on public.metas for select using (auth.uid() = user_id);
create policy "metas_insert_own" on public.metas for insert with check (auth.uid() = user_id);
create policy "metas_update_own" on public.metas for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "metas_delete_own" on public.metas for delete using (auth.uid() = user_id);

-- ---------- 4) Sincronización entre dispositivos (plan, asignaciones, tasas, proveedores) ----------
create table if not exists public.user_settings (
    user_id     uuid primary key default auth.uid() references auth.users(id) on delete cascade,
    data        jsonb not null default '{}'::jsonb,
    updated_at  timestamptz not null default now()
);
alter table public.user_settings enable row level security;
drop policy if exists "settings_select_own" on public.user_settings;
drop policy if exists "settings_insert_own" on public.user_settings;
drop policy if exists "settings_update_own" on public.user_settings;
drop policy if exists "settings_delete_own" on public.user_settings;
create policy "settings_select_own" on public.user_settings for select using (auth.uid() = user_id);
create policy "settings_insert_own" on public.user_settings for insert with check (auth.uid() = user_id);
create policy "settings_update_own" on public.user_settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "settings_delete_own" on public.user_settings for delete using (auth.uid() = user_id);

-- ---------- 5) Gastos reales (día a día, con categorías) ----------
create table if not exists public.gastos (
    id          bigint generated always as identity primary key,
    user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
    fecha       text not null default '',            -- YYYY-MM-DD
    categoria   text not null default 'otros',
    descripcion text default '',
    monto       numeric not null default 0,
    moneda      text not null default 'USD',
    created_at  timestamptz not null default now()
);
create index if not exists gastos_user_idx on public.gastos (user_id);
alter table public.gastos enable row level security;
drop policy if exists "gastos_select_own" on public.gastos;
drop policy if exists "gastos_insert_own" on public.gastos;
drop policy if exists "gastos_update_own" on public.gastos;
drop policy if exists "gastos_delete_own" on public.gastos;
create policy "gastos_select_own" on public.gastos for select using (auth.uid() = user_id);
create policy "gastos_insert_own" on public.gastos for insert with check (auth.uid() = user_id);
create policy "gastos_update_own" on public.gastos for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "gastos_delete_own" on public.gastos for delete using (auth.uid() = user_id);

-- ---------- 6) Bitácora (historial de actividad, sincronizado) ----------
create table if not exists public.bitacora (
    id          bigint generated always as identity primary key,
    user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
    at          timestamptz not null default now(),   -- cuándo ocurrió el evento
    type        text not null default '',             -- deuda_add | pago | abono | meta_add | gasto_add | ...
    title       text not null default '',
    detail      text default '',
    amount      numeric,
    moneda      text default '',
    created_at  timestamptz not null default now()
);
create index if not exists bitacora_user_idx on public.bitacora (user_id, at desc);
alter table public.bitacora enable row level security;
drop policy if exists "bitacora_select_own" on public.bitacora;
drop policy if exists "bitacora_insert_own" on public.bitacora;
drop policy if exists "bitacora_delete_own" on public.bitacora;
create policy "bitacora_select_own" on public.bitacora for select using (auth.uid() = user_id);
create policy "bitacora_insert_own" on public.bitacora for insert with check (auth.uid() = user_id);
create policy "bitacora_delete_own" on public.bitacora for delete using (auth.uid() = user_id);

-- Listo. Vuelve a la app → Ajustes → Sistema y verás todo en verde.
