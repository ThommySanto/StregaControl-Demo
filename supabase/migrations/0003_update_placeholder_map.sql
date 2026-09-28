-- =========================================================
-- Aggiorna la mappa segnaposto (solo per test del Passo 4)
-- =========================================================
-- Sostituisce il rettangolo vuoto del Passo 2 con una base
-- schematica minima (strade, piazza, sagome di edifici) cosi'
-- il pan/zoom si puo' testare su qualcosa di leggibile. Verra'
-- sostituita dalla vera base cartografica di Polverigi quando
-- sara' pronta (§38: idealmente un SVG vettoriale strutturato).

update base_maps
set svg_data = '<svg viewBox="0 0 1000 1000">
  <rect width="1000" height="1000" fill="#f3f4f6"/>

  <!-- Strade -->
  <path d="M 0 300 H 1000" stroke="#d1d5db" stroke-width="14"/>
  <path d="M 500 0 V 1000" stroke="#d1d5db" stroke-width="14"/>
  <path d="M 250 300 V 700" stroke="#d1d5db" stroke-width="10"/>
  <path d="M 750 300 V 700" stroke="#d1d5db" stroke-width="10"/>

  <!-- Zona Roccolo (~0.25, 0.30) -->
  <rect x="120" y="120" width="180" height="120" fill="#e5e7eb" stroke="#9ca3af"/>
  <text x="210" y="100" font-size="22" text-anchor="middle" fill="#6b7280">Roccolo</text>

  <!-- Zona Piazza (~0.50, 0.55), rappresentata come spazio aperto -->
  <rect x="420" y="470" width="160" height="160" fill="#fde68a" stroke="#d97706" opacity="0.5"/>
  <text x="500" y="450" font-size="22" text-anchor="middle" fill="#6b7280">Piazza</text>

  <!-- Zona Borgo (~0.75, 0.70) -->
  <rect x="680" y="620" width="200" height="140" fill="#e5e7eb" stroke="#9ca3af"/>
  <text x="780" y="600" font-size="22" text-anchor="middle" fill="#6b7280">Borgo</text>
</svg>'
where id = '00000000-0000-0000-0000-000000000001';
