-- =========================================================
-- StregaControl-Demo: public access for portfolio/demo usage
-- =========================================================
-- This migration is meant for a dedicated demo database only.
-- It disables the private-auth-only security model and makes all tables
-- readable/writable for anonymous users so the app works without login.

-- Recreate policies in a permissive way for the demo database.
-- If you used the original schema migration, keep it and run this one next.

alter table base_maps enable row level security;
alter table editions enable row level security;
alter table zones enable row level security;
alter table poi enable row level security;
alter table elements enable row level security;
alter table change_log enable row level security;

drop policy if exists "base_maps: lettura autenticati" on base_maps;
drop policy if exists "base_maps: scrittura autenticati" on base_maps;
drop policy if exists "editions: tutto per autenticati" on editions;
drop policy if exists "zones: tutto per autenticati" on zones;
drop policy if exists "poi: tutto per autenticati" on poi;
drop policy if exists "elements: tutto per autenticati" on elements;
drop policy if exists "change_log: tutto per autenticati" on change_log;

create policy "demo: base_maps public read/write" on base_maps
  for all using (true) with check (true);

create policy "demo: editions public read/write" on editions
  for all using (true) with check (true);

create policy "demo: zones public read/write" on zones
  for all using (true) with check (true);

create policy "demo: poi public read/write" on poi
  for all using (true) with check (true);

create policy "demo: elements public read/write" on elements
  for all using (true) with check (true);

create policy "demo: change_log public read/write" on change_log
  for all using (true) with check (true);
