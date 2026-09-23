-- =========================================================
-- Notte delle Streghe di Polverigi — Schema iniziale
-- =========================================================
-- Da eseguire una sola volta in Supabase (SQL Editor).
-- Definisce le tabelle di base (§35 della specifica) e attiva
-- Row Level Security su tutte, cosi' un utente non autenticato
-- non puo' leggere ne' scrivere nulla (§43).

-- ---------------------------------------------------------
-- Estensione per generare UUID
-- ---------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- BASE_MAPS — la cartografia fissa (§7, §38)
-- ---------------------------------------------------------
create table base_maps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  svg_data text not null,          -- markup SVG della base cartografica
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- EDITIONS — le edizioni annuali (§25, §35)
-- ---------------------------------------------------------
create table editions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  year int not null,
  base_map_id uuid not null references base_maps(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (year)
);

-- ---------------------------------------------------------
-- ZONES — Roccolo / Piazza / Borgo, con preset di vista (§9, §51)
-- ---------------------------------------------------------
create table zones (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references editions(id) on delete cascade,
  name text not null,
  center_x double precision not null,   -- coordinate normalizzate 0..1
  center_y double precision not null,
  zoom_level double precision not null default 1
);

-- ---------------------------------------------------------
-- POI — punti di interesse (§11)
-- ---------------------------------------------------------
create table poi (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references editions(id) on delete cascade,
  zone_id uuid references zones(id) on delete set null,
  name text not null,
  icon text not null default 'pin',
  description text,
  x double precision not null,
  y double precision not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- ELEMENTS — allestimento / elettrico / audio / luci (§12-16)
-- ---------------------------------------------------------
create table elements (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references editions(id) on delete cascade,
  zone_id uuid references zones(id) on delete set null,
  category text not null check (category in ('allestimento', 'elettrico', 'audio', 'luci')),
  type text not null,          -- es. 'cassa', 'faretto', 'strip_led', 'macchina_fumo'...
  name text not null,
  notes text,
  x double precision not null,
  y double precision not null,
  quantity int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- indice per velocizzare i filtri per edizione+categoria+zona (§52)
create index elements_edition_category_idx on elements (edition_id, category);
create index elements_edition_zone_idx on elements (edition_id, zone_id);

-- ---------------------------------------------------------
-- CHANGE_LOG — traccia minima delle modifiche (§58, opzionale)
-- ---------------------------------------------------------
create table change_log (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references editions(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  action text not null,        -- 'create' | 'update' | 'delete' | 'move'
  element_id uuid,
  element_name text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- updated_at automatico su editions / poi / elements
-- ---------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger editions_set_updated_at before update on editions
  for each row execute function set_updated_at();

create trigger poi_set_updated_at before update on poi
  for each row execute function set_updated_at();

create trigger elements_set_updated_at before update on elements
  for each row execute function set_updated_at();

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
-- Regola unica per la v1 (§3): chiunque sia autenticato e'
-- un organizzatore autorizzato, quindi puo' leggere e scrivere
-- ovunque. Non c'e' ancora distinzione di ruoli (verra' in futuro,
-- come previsto al §3 — "in futuro potra' essere introdotto un
-- ruolo service"). Un utente NON autenticato non ha nessun accesso.

alter table base_maps enable row level security;
alter table editions enable row level security;
alter table zones enable row level security;
alter table poi enable row level security;
alter table elements enable row level security;
alter table change_log enable row level security;

-- base_maps: lettura per tutti gli autenticati, scrittura riservata
-- (la base cartografica non va modificata nell'uso normale, §7)
create policy "base_maps: lettura autenticati" on base_maps
  for select using (auth.role() = 'authenticated');
create policy "base_maps: scrittura autenticati" on base_maps
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "editions: tutto per autenticati" on editions
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "zones: tutto per autenticati" on zones
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "poi: tutto per autenticati" on poi
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "elements: tutto per autenticati" on elements
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "change_log: tutto per autenticati" on change_log
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
