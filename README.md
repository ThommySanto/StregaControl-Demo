# Notte delle Streghe - controllo locale

Applicazione React + TypeScript + Vite per gestire la mappa e gli elementi dell'edizione. Non richiede account, email, password, server o servizi esterni.

## Avvio

```bash
npm install
npm run dev
```

La build di produzione si verifica con `npm run build`.

## Dati locali

I dati iniziali sono in `src/db/seedData.ts`. Al primo avvio vengono copiati nel `localStorage` del browser con la chiave `strega-control-db`; gli elementi creati, modificati o eliminati restano disponibili dopo un refresh.

La definizione della base cartografica e il relativo formato sono descritti in `src/db/map.json`. La mappa SVG viene caricata insieme ai dati iniziali del progetto.

## Pubblicazione su GitHub Pages

Il workflow in `.github/workflows/deploy.yml` pubblica automaticamente il progetto su GitHub Pages a ogni push sul branch `main`.

Nel repository GitHub abilita `Settings > Pages > Source: GitHub Actions`. L'indirizzo pubblico sarà:

`https://thommysanto.github.io/StregaControl-Demo/`
