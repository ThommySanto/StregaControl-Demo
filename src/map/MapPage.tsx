import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRow, listRows } from '@/db/localDb'
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
      if (cancelled) return

      const editions = await listRows<Edition>('editions')
      const active = [...editions].sort((a, b) => b.year - a.year)[0]
      if (!active) {
        setError("Nessuna edizione trovata. Aggiungi un'edizione ai dati locali del progetto.")
        setLoading(false)
        return
      }

      const [baseMap, zoneRows] = await Promise.all([
        getRow<{ id: string; svg_data: string }>('base_maps', { id: active.base_map_id }),
        listRows<Zone>('zones', { edition_id: active.id }),
      ])

      if (cancelled) return

      if (!baseMap) {
        setError('Impossibile caricare la base cartografica.')
        setLoading(false)
        return
      }

      setEdition(active)
      setZones(zoneRows.sort((a, b) => a.name.localeCompare(b.name)))
      setSvgData(baseMap.svg_data)
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
