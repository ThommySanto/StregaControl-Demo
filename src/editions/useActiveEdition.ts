// src/editions/useActiveEdition.ts
//
// Carica dal database, per un dato anno:
//   - l'edizione (editions)
//   - la base cartografica collegata (base_maps)
//   - le zone di navigazione (zones)
//   - i punti di interesse (poi)
//
// Usato dalla dashboard e dalla mappa. Gestisce stati di caricamento ed
// errore in modo esplicito, cosi' l'interfaccia puo' sempre mostrare un
// messaggio comprensibile invece di un crash silenzioso (spec §34).

import { useEffect, useState } from 'react';
import { supabase } from '../db/supabaseClient';

export interface Edition {
  id: string;
  name: string;
  year: number;
  base_map_id: string;
}

export interface BaseMap {
  id: string;
  name: string;
  svg_data: string;
}

export interface Zone {
  id: string;
  edition_id: string;
  name: string;
  center_x: number;
  center_y: number;
  zoom_level: number;
}

export interface Poi {
  id: string;
  edition_id: string;
  zone_id: string | null;
  name: string;
  icon: string;
  description: string | null;
  x: number;
  y: number;
}

interface ActiveEditionState {
  edition: Edition | null;
  baseMap: BaseMap | null;
  zones: Zone[];
  poi: Poi[];
  loading: boolean;
  error: string | null;
}

export function useActiveEdition(year: number): ActiveEditionState {
  const [state, setState] = useState<ActiveEditionState>({
    edition: null,
    baseMap: null,
    zones: [],
    poi: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));

      const { data: edition, error: edErr } = await supabase
        .from('editions')
        .select('*')
        .eq('year', year)
        .single();

      if (edErr || !edition) {
        if (!cancelled) {
          setState((s) => ({
            ...s,
            loading: false,
            error: `Edizione ${year} non trovata. Controlla la connessione o riprova.`,
          }));
        }
        return;
      }

      const [baseMapRes, zonesRes, poiRes] = await Promise.all([
        supabase.from('base_maps').select('*').eq('id', edition.base_map_id).single(),
        supabase.from('zones').select('*').eq('edition_id', edition.id).order('name'),
        supabase.from('poi').select('*').eq('edition_id', edition.id),
      ]);

      if (cancelled) return;

      const firstError = baseMapRes.error || zonesRes.error || poiRes.error;
      if (firstError) {
        setState((s) => ({
          ...s,
          loading: false,
          error: 'Impossibile caricare la mappa. Controlla la connessione e riprova.',
        }));
        return;
      }

      setState({
        edition,
        baseMap: baseMapRes.data ?? null,
        zones: zonesRes.data ?? [],
        poi: poiRes.data ?? [],
        loading: false,
        error: null,
      });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [year]);

  return state;
}
