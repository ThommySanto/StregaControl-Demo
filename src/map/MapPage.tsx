import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/db/supabaseClient'
import type { Edition, Zone } from '@/types'
import { useElements } from '@/elements/useElements'
import MapView from './MapView'

export default function MapPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [edition, setEdition] = useState<Edition | null>(null)
  const [zones, setZones] = useState<Zone[]>([])
  const [svgData, setSvgData] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      // L'edizione "attiva" per ora e' semplicemente quella con l'anno
      // piu' recente. Un selettore esplicito arrivera' col modulo edizioni
      // (Passo 7).
      const { data: editions, error: edErr } = await supabase
        .from('editions')
        .select('*')
        .order('year', { ascending: false })
        .limit(1)

      if (cancelled) return

      if (edErr || !editions || editions.length === 0) {
        setError("Nessuna edizione trovata. Esegui prima il seed di esempio (Passo 2) o crea un'edizione.")
        setLoading(false)
        return
      }

      const active = editions[0] as Edition

      const [baseMapRes, zonesRes] = await Promise.all([
        supabase.from('base_maps').select('*').eq('id', active.base_map_id).single(),
        supabase.from('zones').select('*').eq('edition_id', active.id).order('name'),
      ])

      if (cancelled) return

      if (baseMapRes.error || !baseMapRes.data) {
        setError('Impossibile caricare la base cartografica.')
        setLoading(false)
        return
      }

      setEdition(active)
      setZones((zonesRes.data as Zone[]) ?? [])
      setSvgData(baseMapRes.data.svg_data as string)
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Gli elementi (§12-16) si caricano solo quando conosciamo l'edizione
  // attiva; useElements gestisce da sola il caso editionId === null.
  const elementsApi = useElements(edition?.id ?? null)

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        Caricamento mappa…
      </div>
    )
  }

  if (error || !svgData || !edition) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm text-red-600">{error ?? 'Errore imprevisto.'}</p>
        <Link to="/" className="text-sm text-gray-500 underline">
          Torna alla dashboard
        </Link>
      </div>
    )
  }

  return (
    <MapView
      svgData={svgData}
      zones={zones}
      editionLabel={`${edition.name} ${edition.year}`}
      editionId={edition.id}
      elementsApi={elementsApi}
    />
  )
}
