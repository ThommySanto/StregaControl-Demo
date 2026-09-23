# StregaControl-Demo

Passo 1 completato: scheletro del progetto (React + TypeScript + Vite + Tailwind),
struttura cartelle modulare, e collegamento predisposto a Supabase.

## Struttura cartelle

```
src/
  auth/       login, sessione, guard delle rotte      (passo 2)
  map/        rendering SVG, pan/zoom, base cartografica (passo 3)
  elements/   CRUD elementi (allestimento/elettrico/audio/luci)
  poi/        punti di interesse
  filters/    stato filtri categoria + zona
  search/     ricerca testuale
  editions/   gestione anni, duplicazione, storico
  pdf/        export planimetrie
  ui/         componenti condivisi (pannelli, modali, bottom sheet)
  db/         client Supabase, query tipizzate
  types/      tipi TypeScript condivisi (rispecchiano lo schema DB)
```

## Cosa devi fare tu ora (setup locale)

1. **Installare le dipendenze** (serve Node.js 18+):
   ```
   npm install
   ```

2. **Creare un progetto Supabase** (gratuito): vai su https://supabase.com,
   crea un account e un nuovo progetto. Scegli una regione vicina all'Italia
   (es. eu-central).

3. **Copiare le chiavi**: nel progetto Supabase vai su
   *Project Settings → API* e copia:
   - `Project URL`
   - `anon public key`

   Poi:
   ```
   cp .env.example .env
   ```
   e incolla i due valori dentro `.env`.

4. **Avviare il progetto in locale**:
   ```
   npm run dev
   ```
   Dovresti vedere la pagina con il messaggio "progetto inizializzato".

## Passo 2 — Schema del database (completato)

Le tabelle e le regole di sicurezza sono in `supabase/migrations/`:

- `0001_init.sql` — tabelle `base_maps`, `editions`, `zones`, `poi`,
  `elements`, `change_log`, trigger per `updated_at`, e Row Level
  Security (solo utenti autenticati possono leggere/scrivere,
  §43 della specifica).
- `0002_seed_example.sql` — **opzionale**: crea una base cartografica
  segnaposto, l'edizione 2026 e le 3 zone (Roccolo, Piazza, Borgo),
  cosi' hai subito dati con cui lavorare nei prossimi passi.

### Come eseguirle

1. Vai nel tuo progetto Supabase → **SQL Editor**.
2. Apri `supabase/migrations/0001_init.sql`, copia tutto il contenuto,
   incollalo nell'editor e premi **Run**.
3. (Opzionale, consigliato per ora) fai lo stesso con
   `0002_seed_example.sql`.
4. Vai su **Table Editor**: dovresti vedere le tabelle popolate
   (`editions` con una riga 2026, `zones` con 3 righe).

Se preferisci lavorare da terminale invece che dalla dashboard, puoi
usare la Supabase CLI (`supabase db push`), ma per ora la SQL Editor
è più diretta e non richiede altra configurazione.

**Verifica di sicurezza**: prova a interrogare una tabella (es. `zones`)
dalla dashboard con l'utente anonimo disattivato, o semplicemente fidati
delle policy — sono già impostate per bloccare qualunque accesso non
autenticato.

## Passo 3 — Autenticazione (completato)

Aggiunto in `src/auth/`:

- `AuthContext.tsx` — gestisce la sessione (login, logout, ascolto dei
  cambi di stato); Supabase rinnova da solo il token.
- `LoginPage.tsx` — form email/password con messaggi d'errore in
  italiano comprensibile (§54), non testo tecnico.
- `ProtectedRoute.tsx` — blocca l'accesso alle pagine riservate se non
  c'è una sessione valida e reindirizza al login.

`App.tsx` ora usa `react-router-dom`: `/login` è pubblica, `/` (la
dashboard, per ora provvisoria) è protetta.

**Importante**: questa è una piattaforma privata (§3) — non c'è una
pagina di registrazione pubblica. Gli account degli organizzatori
vanno creati manualmente da te.

### Come creare il primo account

1. Nel tuo progetto Supabase vai su **Authentication → Users**.
2. Clicca **Add user → Create new user**.
3. Inserisci l'email e una password, e spunta **Auto Confirm User**
   (altrimenti Supabase richiederebbe una conferma via email che
   in questa fase non è configurata).
4. Salva.

### Come provarlo

1. Aggiorna le dipendenze se non l'hai già fatto:
   ```
   npm install
   ```
2. `npm run dev`, apri l'app: dovresti finire sulla pagina di login.
3. Accedi con l'account appena creato: dovresti vedere la dashboard
   provvisoria con la tua email e il pulsante "Esci".
4. Prova a visitare `/` in una scheda anonima (senza sessione): deve
   rimandarti al login.

## Passo 4 — Mappa: pan, zoom, preset di zona (completato)

Aggiunto in `src/map/`:

- `parseSvg.ts` — legge la base cartografica salvata nel database ed
  estrae dimensioni e markup da incorporare nella mappa.
- `useMapViewport.ts` — gestisce pan e zoom manipolando direttamente
  il `viewBox` dell'SVG: trascinamento (mouse o un dito), rotella del
  mouse, pinch-to-zoom a due dita (§10). Nessuna libreria esterna.
- `MapView.tsx` — la mappa vera e propria: base cartografica, pulsanti
  di zoom, e i pulsanti dei preset di zona (§9, §51) che spostano la
  vista senza cambiare il contenuto mostrato.
- `MapPage.tsx` — carica dal database l'edizione più recente, le sue
  zone e la base cartografica, e gestisce stati di caricamento/errore.

Ho anche aggiunto `0003_update_placeholder_map.sql`: aggiorna la mappa
segnaposto del Passo 2 con strade/edifici schematici (invece del
rettangolo vuoto), solo per avere qualcosa di leggibile su cui provare
pan e zoom. La vera base cartografica di Polverigi arriverà più avanti.

### Come provarlo

1. Esegui `supabase/migrations/0003_update_placeholder_map.sql` nella
   SQL Editor di Supabase (come hai fatto per le precedenti).
2. `npm run dev`, accedi, poi dalla dashboard clicca **Apri mappa**.
3. Prova: trascinamento, rotella del mouse (o pinch su touch), i
   pulsanti **+ / –**, e i pulsanti **Roccolo / Piazza / Borgo / Tutta
   la festa** — la vista deve spostarsi sulla zona con lo zoom giusto,
   restando comunque liberamente esplorabile dopo.

## Passo 4 (aggiornamento) — Base cartografica realistica

Ho sostituito lo schema segnaposto con una mappa basata sulla vera
disposizione di Polverigi, a partire dalla mappa ufficiale della
manifestazione e da viste satellitari delle tre zone: **Borgo** (a
ovest), **Piazza** (al centro), **Roccolo** (a est/nord-est),
collegate dal percorso principale reale.

Migrazione: `0004_realistic_base_map.sql` — aggiorna la base
cartografica e riposiziona le zone (prima erano a coordinate a caso).

**Nota**: resta uno schema semplificato e leggibile, non un rilievo
tecnico — i vicoli più stretti/coperti (spesso invisibili anche da
satellite) sono approssimati. Se in futuro serve più precisione in un
punto specifico per posizionare un elemento, lo rifiniamo insieme.

### Come provarlo

1. Esegui `0004_realistic_base_map.sql` nella SQL Editor di Supabase.
2. Apri la mappa: i pulsanti **Borgo / Piazza / Roccolo** ora portano
   davvero sulle tre zone reali, nella loro posizione e disposizione
   corretta l'una rispetto all'altra.

## Pulizia — rimosso un tentativo di mappa non utilizzato

Ho trovato in `src/map/MapCanvas.tsx` un'implementazione alternativa della
mappa (basata sulla libreria `react-zoom-pan-pinch`) che non era collegata
a nessuna pagina — quella davvero in uso è sempre stata `MapView.tsx`
(pan/zoom fatto a mano sul `viewBox` dell'SVG, §10). L'ho eliminata insieme
al suo hook `useActiveEdition.ts` (anch'esso non usato, con tipi leggermente
disallineati da `src/types`) per evitare confusione futura. Rimossa anche
la dipendenza `react-zoom-pan-pinch` da `package.json`: se hai già fatto
`npm install`, lancialo di nuovo dopo aver aggiornato i file.

## Passo 5 — CRUD elementi e posizionamento sulla mappa (completato)

Aggiunto in `src/elements/`:

- `catalog.ts` — il catalogo delle tipologie per ciascuna categoria
  (§13-16): scenografia, macchina del fumo/apparecchiatura/punto di
  alimentazione/altra utenza, cassa, faretto/strip LED/punto luce/altra
  luce. Ogni tipo ha solo icona e nome — nessun campo tecnico (§2, §14-16).
- `useElements.ts` — hook con tutte le operazioni CRUD (§45) su
  `elements`: crea, modifica (incluso lo spostamento), elimina, duplica
  (§46). Gli aggiornamenti sono "ottimistici" (la mappa si aggiorna subito,
  §52) e vengono annullati automaticamente se il salvataggio fallisce;
  espone uno stato `saving / saved / error` per il badge di salvataggio.
- `ElementMarker.tsx` — l'icona dell'elemento sulla mappa: un tap apre la
  scheda, un trascinamento lo sposta (§17 Metodo A implicito nel click,
  Metodo B nel drag; §18).
- `AddElementSheet.tsx` — il flusso "+ Aggiungi": scegli categoria → tipo →
  tocca la mappa nel punto desiderato (§17). Su mobile si comporta da
  bottom sheet (§33).
- `ElementDetailsPanel.tsx` — la scheda elemento (§19): nome, categoria,
  tipo, quantità (solo per i tipi che la prevedono), note (§20); pulsanti
  Modifica / Duplica / Elimina, con conferma obbligatoria prima di
  eliminare (§34, §45).

Aggiunto anche `src/ui/SaveStatusBadge.tsx` — mostra "Salvataggio…",
"Salvato ✓" o l'avviso di errore connessione (§34, §44), sempre visibile
nell'intestazione della mappa.

`MapView.tsx` ora incorpora il livello elementi sopra la base cartografica,
gestisce il tap sulla mappa durante il posizionamento, e apre la scheda
dettaglio al click su un marker. `useMapViewport.ts` espone in più
`clientToNormalized`, che converte un punto dello schermo in coordinate
0..1 della mappa (§36), usato sia per il posizionamento che per il
trascinamento.

La dashboard (`src/editions/DashboardPage.tsx`) ora mostra anche i
contatori per categoria (§23, §48), calcolati dagli stessi elementi
caricati per la mappa — si aggiornano da soli quando aggiungi/elimini
qualcosa.

### Come provarlo

1. `npm install` (per rimuovere la dipendenza non più usata).
2. `npm run dev`, accedi, apri la mappa.
3. Premi **+ Aggiungi**, scegli una categoria (es. Luci) e un tipo (es.
   Faretto), poi tocca un punto della mappa: l'icona 💡 deve comparire lì,
   e in alto deve lampeggiare "Salvato ✓".
4. Trascina l'icona in un altro punto: la posizione deve aggiornarsi e
   restare tale dopo un refresh della pagina.
5. Tocca l'icona (senza trascinare): deve aprirsi la scheda con
   Modifica / Duplica / Elimina. Prova a modificare il nome e le note,
   poi a duplicare l'elemento (deve comparirne una copia leggermente
   spostata), poi a eliminarlo (deve chiedere conferma prima).
6. Torna alla dashboard: i contatori per categoria devono riflettere
   gli elementi appena creati.

## Passo 6 — Filtri e ricerca (completato)

Aggiunto in `src/filters/`:

- `useFilters.ts` — stato di categorie attive + zona attiva + testo di
  ricerca, combinabili (§21, §22): filtra gli elementi e calcola i
  contatori per categoria (§23). I contatori restano stabili rispetto
  al filtro di categoria (si aggiornano solo con zona/ricerca), cosi'
  restano confrontabili mentre accendi/spegni le categorie.
- `FilterPanel.tsx` — l'elenco "Mostra" con checkbox e contatore per
  categoria (cliccare il numero isola quella categoria, §23), e la lista
  zone (Tutte/Roccolo/Piazza/Borgo). Su desktop e' una sidebar sempre
  visibile; su mobile si apre come bottom sheet dal pulsante "Filtri"
  in alto (§32-33).

Aggiunto `src/search/SearchBar.tsx`: ricerca testuale case-insensitive
su nome, tipo e zona dell'elemento (§24), sempre visibile nell'intestazione
della mappa.

Un dettaglio pratico per far funzionare davvero il filtro per zona: quando
posizioni un elemento sulla mappa, gli viene assegnata automaticamente la
zona il cui centro e' piu' vicino al punto toccato — resta comunque
modificabile a mano nella scheda elemento (nuovo campo **Zona**, accanto a
Note), per i casi limite o se preferisci cambiarla.

`MapView.tsx` ora mostra solo `filters.filteredElements` sulla mappa,
cosi' filtri e ricerca nascondono davvero i marker corrispondenti,
lasciando sempre visibili la base cartografica e i preset di zona (che
restano solo navigazione, non filtro — §9).

### Come provarlo

1. `npm run dev`, apri la mappa con alcuni elementi già creati al Passo 5
   (o creane di nuovi in zone diverse).
2. Nella sidebar (o premendo **Filtri** su mobile), disattiva tutte le
   categorie tranne "Luci": devono restare visibili solo i marker 💡.
3. Clicca il numero accanto a "Audio": deve isolare solo quella categoria
   (le altre si spengono automaticamente).
4. Seleziona una zona (es. Roccolo) e verifica che il conteggio Luci si
   aggiorni di conseguenza; prova a combinare zona + categoria.
5. Nella barra di ricerca digita parte di un nome o "Roccolo": la mappa
   deve mostrare solo gli elementi corrispondenti, a prescindere dai
   filtri categoria/zona attivi.
6. Apri un elemento, cambia la sua Zona dalla scheda e verifica che il
   filtro per zona lo segua correttamente.

## Fix critici prima del Passo 7

Prima di passare all'ultimo pezzo della base, hai segnalato tre problemi.
Eccoli, con la causa reale trovata nel codice (non solo il sintomo):

**1. Schermo bianco all'avvio.** `src/db/supabaseClient.ts` lanciava un
`throw new Error(...)` a livello di modulo se `VITE_SUPABASE_URL` /
`VITE_SUPABASE_ANON_KEY` mancavano o erano sbagliate. Un errore lanciato
lì blocca l'intero render di React prima ancora che monti qualunque cosa
— da qui la pagina bianca, senza nessun messaggio comprensibile (contro
il principio del §34). Ora il client non lancia più errori: espone un
flag `isSupabaseConfigured`, e `App.tsx` lo controlla per primo, mostrando
`src/ui/ConfigErrorScreen.tsx` con istruzioni chiare se manca la
configurazione, invece di andare in crash silenzioso.

**2. Dopo il login non succedeva nulla.** La rotta `/login` in `App.tsx`
non controllava mai se l'utente fosse già autenticato: dopo un login
corretto, `AuthContext` aggiornava la sessione, ma niente reindirizzava
via dal form. Aggiunto `src/auth/GuestRoute.tsx` (il simmetrico di
`ProtectedRoute.tsx`): se c'è già una sessione valida, reindirizza subito
alla dashboard. Ora il login funziona in modo puramente reattivo — nessun
redirect manuale da gestire in `LoginPage.tsx`.

**3. Icone non "dinamiche" con lo zoom.** Avevano un raggio fisso in unità
mappa: a zoom molto diverso finivano per essere o minuscole o enormi in
modo incontrollato, rendendo difficile piazzare elementi vicini con
precisione. `MapView.tsx` ora calcola un raggio dinamico a ogni
cambiamento di zoom — pensato in pixel-schermo target (min ~11px in vista
generale, max ~20px quando sei molto zoomato) e convertito in unità mappa
in base al rapporto attuale tra viewBox e larghezza della mappa. Risultato:
più zoomi, più le icone si allargano (spazio per la precisione); più
allontani, più si rimpiccioliscono (vista d'insieme leggibile anche con
tanti elementi vicini). `ElementMarker.tsx` ora riceve `radius` da fuori
invece di un valore fisso interno.

## Fix — icone dei marker illeggibili a zoom alto (dopo il Passo 6)

Il dimensionamento dinamico (punto 3 sopra) era corretto, ma restava un
problema più a monte: le icone dei marker erano emoji (💡🔊⚡...) disegnate
con `<text>` dentro l'SVG. Il browser non tratta l'emoji come vettoriale —
la disegna come un piccolo bitmap (font a colori) e quel bitmap viene poi
scalato dal `viewBox` quando zoomi. Da qui la sgranatura a zoom alto: non
era un problema di dimensione ma di natura del disegno (raster scalato,
non vettore).

Aggiunto `src/elements/icons.tsx`: un'icona vettoriale dedicata (path SVG
disegnati a mano, stile lineare) per ciascuna tipologia — fulmine, plafoniera,
sole, cassa, spina, nuvola, maschera, stella — con fallback per categoria.
Un path SVG scala insieme al `viewBox` senza mai perdere nitidezza, a
qualunque livello di zoom, perché è geometria vera e non un'immagine.
`ElementMarker.tsx` ora usa `<TypeIcon>` al posto del `<text>` con l'emoji.
Le emoji restano invece dove non c'è zoom (menu "+ Aggiungi", legenda
filtri): lì non danno nessun problema e non le ho toccate.

### Come provarlo

1. Apri la mappa, aggiungi qualche elemento di categorie diverse (luci,
   audio, elettrico, allestimento).
2. Zooma al massimo con la rotella/pulsanti **+**: le icone devono restare
   nitide e riconoscibili, non più sgranate o "a blocchetti".
3. Torna in vista generale: le icone devono restare leggibili e coerenti
   con quelle viste da vicino (stessa forma, solo più piccola).

### Come provarlo

1. Se avevi già un `.env` funzionante, il comportamento su Supabase non
   cambia — controlla solo che l'app parta sulla pagina di login (non più
   bianca) quando non sei autenticato.
2. Prova a rinominare temporaneamente `.env` per vedere la nuova schermata
   di configurazione al posto del bianco, poi ripristinalo.
3. Fai login con credenziali corrette: devi finire sulla dashboard senza
   ricaricare la pagina a mano. Vai manualmente su `/login` da loggato:
   devi essere rimbalzato subito su "/".
4. Apri la mappa, aggiungi un paio di elementi vicini, poi zooma avanti e
   indietro con rotella/pulsanti: le icone devono ingrandirsi zoomando e
   rimpicciolirsi in vista generale, restando sempre leggibili.

## Prossimi passi (uno alla volta, come concordato)

- **Passo 7** — PDF ed edizioni annuali

Confermami che questi tre punti sono a posto, poi via al Passo 7.
# StregaControl-Demo
# StregaControl-Demo
# StregaControl-Demo
# StregaControl-Demo
