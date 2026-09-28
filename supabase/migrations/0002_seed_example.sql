-- =========================================================
-- Seed di esempio — OPZIONALE
-- =========================================================
-- Crea una base cartografica segnaposto e la prima edizione (2026)
-- con le 3 zone gia' previste. Il campo svg_data qui e' solo un
-- rettangolo di prova: al Passo 4 (mappa) lo sostituiremo con la
-- vera base cartografica di Polverigi.
--
-- Puoi eseguire questo file cosi' com'e' per avere subito dati
-- con cui lavorare, oppure saltarlo e creare l'edizione a mano
-- dall'app quando implementeremo quella funzione.

insert into base_maps (id, name, svg_data)
values (
  '00000000-0000-0000-0000-000000000001',
  'Base Polverigi — segnaposto',
  '<svg viewBox="0 0 1000 1000"><rect width="1000" height="1000" fill="#f3f4f6"/></svg>'
);

insert into editions (id, name, year, base_map_id)
values (
  '00000000-0000-0000-0000-000000000002',
  'Notte delle Streghe',
  2026,
  '00000000-0000-0000-0000-000000000001'
);

insert into zones (edition_id, name, center_x, center_y, zoom_level)
values
  ('00000000-0000-0000-0000-000000000002', 'Roccolo', 0.25, 0.30, 2.0),
  ('00000000-0000-0000-0000-000000000002', 'Piazza',  0.50, 0.55, 2.0),
  ('00000000-0000-0000-0000-000000000002', 'Borgo',   0.75, 0.70, 2.0);
