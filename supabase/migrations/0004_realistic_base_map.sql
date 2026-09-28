-- =========================================================
-- Base cartografica realistica (Borgo / Piazza / Roccolo)
-- =========================================================
-- Sostituisce lo schema segnaposto del Passo 4 con una
-- rappresentazione vettoriale basata sulla disposizione reale
-- delle tre zone di Polverigi, ricavata da:
--  - la mappa ufficiale della manifestazione (percorso, ingressi,
--    disposizione relativa delle aree);
--  - viste satellitari delle tre zone (forma degli edifici,
--    del Roccolo, della Piazza e del Borgo).
--
-- Resta uno schema semplificato e leggibile (§6), non un rilievo
-- CAD: i vicoli piu' stretti/coperti non sono risolvibili da
-- satellite e potranno essere rifiniti in seguito se serve
-- posizionare un elemento con precisione in un punto specifico.

update base_maps
set
  name = 'Base Polverigi — Borgo, Piazza, Roccolo',
  svg_data = '<svg viewBox="0 0 1600 900">
  <rect width="1600" height="900" fill="#f6f5f2"/>

  <!-- Via principale che collega le tre zone, come nel percorso
       reale della manifestazione (ovest -> centro -> est) -->
  <path d="M 280 550 C 450 520, 620 500, 800 480 C 980 460, 1150 380, 1300 280"
        stroke="#d1d5db" stroke-width="20" fill="none" stroke-linecap="round"/>

  <!-- ================= ZONA BORGO (ovest) ================= -->
  <g id="zona-borgo">
    <path d="M 170 630 C 210 570, 250 520, 280 550 C 305 575, 345 555, 385 495"
          stroke="#d9d9d9" stroke-width="12" fill="none" stroke-linecap="round"/>
    <circle cx="282" cy="556" r="16" fill="#e0e7ff" stroke="#94a3b8" stroke-width="2"/>
    <rect x="120" y="580" width="75" height="55" rx="5" fill="#e5e7eb" stroke="#9ca3af"/>
    <rect x="205" y="500" width="60" height="48" rx="5" fill="#e5e7eb" stroke="#9ca3af"/>
    <rect x="300" y="465" width="85" height="55" rx="5" fill="#e5e7eb" stroke="#9ca3af"/>
    <rect x="330" y="560" width="70" height="55" rx="5" fill="#e5e7eb" stroke="#9ca3af"/>
    <rect x="150" y="500" width="55" height="45" rx="5" fill="#e5e7eb" stroke="#9ca3af"/>
    <text x="280" y="670" font-size="28" text-anchor="middle" fill="#525252">Borgo</text>
  </g>

  <!-- ================= ZONA PIAZZA (centro) ================= -->
  <g id="zona-piazza">
    <ellipse cx="800" cy="480" rx="95" ry="62" fill="#fde68a" opacity="0.4" stroke="#d97706" stroke-width="2"/>
    <path d="M 630 420 L 735 460" stroke="#d9d9d9" stroke-width="12"/>
    <path d="M 655 570 L 745 505" stroke="#d9d9d9" stroke-width="12"/>
    <path d="M 955 435 L 865 465" stroke="#d9d9d9" stroke-width="12"/>
    <path d="M 800 375 L 800 428" stroke="#d9d9d9" stroke-width="12"/>
    <path d="M 725 535 C 765 558, 840 558, 878 533"
          fill="none" stroke="#c8b8a4" stroke-width="16" stroke-linecap="round"/>
    <text x="800" y="405" font-size="28" text-anchor="middle" fill="#525252">Piazza</text>
    <text x="650" y="415" font-size="15" fill="#9a9a9a">Via S. Caterina</text>
    <text x="900" y="450" font-size="15" fill="#9a9a9a">Via D. Alighieri</text>
  </g>

  <!-- ================= ZONA ROCCOLO (est/nord-est) ================= -->
  <g id="zona-roccolo">
    <ellipse cx="1300" cy="280" rx="95" ry="72" fill="none" stroke="#9ca3af" stroke-width="42"/>
    <ellipse cx="1300" cy="280" rx="58" ry="40" fill="#bbf7d0" opacity="0.55"/>
    <path d="M 1300 352 L 1300 385" stroke="#d9d9d9" stroke-width="12"/>
    <text x="1300" y="175" font-size="28" text-anchor="middle" fill="#525252">Roccolo</text>
  </g>
</svg>'
where id = '00000000-0000-0000-0000-000000000001';

-- Aggiorna le zone con la posizione reale (coordinate normalizzate
-- 0..1 rispetto al nuovo viewBox 1600x900) e uno zoom che inquadra
-- bene ciascun nucleo con un po'' di contesto intorno.
update zones set center_x = 0.175, center_y = 0.611, zoom_level = 4
  where edition_id = '00000000-0000-0000-0000-000000000002' and name = 'Borgo';

update zones set center_x = 0.500, center_y = 0.533, zoom_level = 4
  where edition_id = '00000000-0000-0000-0000-000000000002' and name = 'Piazza';

update zones set center_x = 0.8125, center_y = 0.311, zoom_level = 4
  where edition_id = '00000000-0000-0000-0000-000000000002' and name = 'Roccolo';
