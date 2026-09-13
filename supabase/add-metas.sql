-- ============================================================
--  Metas de ahorro — tabla + seguridad por usuario (RLS)
--  Ejecuta una vez en: Supabase -> SQL Editor -> New query -> Run
-- ============================================================

create table if not exists public.metas (
    id              bigint generated always as identity primary key,
    user_id         uuid not null default auth.uid() references auth.users(id) on delete cascade,
    nombre          text not null,
    moneda          text not null default 'USDT',
    objetivo        numeric not null default 0,
    ahorrado        numeric not null default 0,
    apy             numeric not null default 0,          -- % anual
    tipo            text not null default 'simple',      -- simple | flexible | fija
    plazo_meses     int,                                 -- si es fija
    aporte_mensual  numeric not null default 0,
    movimientos     jsonb not null default '[]'::jsonb,  -- historial de aportes/retiros
    fecha_creacion  date not null default current_date,
    created_at      timestamptz not null default now()
);

-- Si la tabla ya existía sin la columna de movimientos:
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
