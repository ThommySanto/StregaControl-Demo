import { createClient } from '@supabase/supabase-js'

// Le chiavi arrivano dalle variabili d'ambiente (mai hardcoded, §43).
// La "anon key" e' pubblica per design: la protezione reale dei dati
// e' affidata alle policy di Row Level Security definite sul database,
// non alla segretezza di questa chiave.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Non lanciamo piu' un errore qui: un throw a livello di modulo blocca
// l'intero render di React prima che possa mostrare qualunque cosa,
// risultando in una pagina bianca senza nessun messaggio comprensibile
// (§34, §54). Il flag viene invece controllato da App.tsx, che mostra
// una schermata di configurazione chiara se le chiavi mancano.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
)
