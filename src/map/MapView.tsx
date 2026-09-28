import { useMemo, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import type { MapElement, Zone } from '@/types'
import { parseBaseMapSvg } from './parseSvg'
import { useMapViewport } from './useMapViewport'
import type { UseElementsResult } from '@/elements/useElements'
import { AddElementSheet, type PendingPlacement } from '@/elements/AddElementSheet'
import { ElementMarker } from '@/elements/ElementMarker'
import { ElementDetailsPanel } from '@/elements/ElementDetailsPanel'
import { SaveStatusBadge } from '@/ui/SaveStatusBadge'
import { getTypeDef } from '@/elements/catalog'
import { useFilters } from '@/filters/useFilters'
import { FilterPanel } from '@/filters/FilterPanel'
import { SearchBar } from '@/search/SearchBar'

interface MapViewProps {
  svgData: string
  zones: Zone[]
  editionLabel: string
  editionId: string
  elementsApi: UseElementsResult
}

export default function MapView({ svgData, zones, editionLabel, elementsApi }: MapViewProps) {
  const { width, height, innerMarkup } = useMemo(() => parseBaseMapSvg(svgData), [svgData])

  const {
    viewBox,
    svgRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
    goToZone,
    resetView,
    zoomIn,
    zoomOut,
    clientToNormalized,
  } = useMapViewport(width, height)

  const { elements, saveStatus, createElement, updateElement, deleteElement, duplicateElement } =
    elementsApi

  const filters = useFilters(elements, zones)
  const [showFilters, setShowFilters] = useState(false)

  // Dimensione dinamica dei marker (richiesta esplicita): restano leggibili
  // a schermo a qualunque livello di zoom, ma si ingrandiscono un po'
  // quando zoomi (piu' spazio per posizionare con precisione elementi
  // vicini) e si rimpiccioliscono in vista generale (per non sovrapporsi
  // quando ce ne sono molti, §10, §52). Il raggio e' calcolato in unita'
  // mappa a partire da una dimensione-schermo target in pixel, cosi' resta
  // costante in pixel indipendentemente da quanto e' grande la mappa SVG.
  const containerWidthPx = svgRef.current?.getBoundingClientRect().width || width
  const zoomRatio = viewBox.w / width // 1 = vista generale, 1/12 = massimo zoom
  const MIN_MARKER_PX = 11
  const MAX_MARKER_PX = 20
  const targetScreenPx = MAX_MARKER_PX - (MAX_MARKER_PX - MIN_MARKER_PX) * zoomRatio
  const markerRadius = (targetScreenPx * viewBox.w) / containerWidthPx

  // Flusso di aggiunta elemento (§17): showPicker = scelta categoria/tipo,
  // placing = in attesa di un tap sulla mappa per posizionarlo.
  const [showPicker, setShowPicker] = useState(false)
  const [placing, setPlacing] = useState<PendingPlacement | null>(null)
  const [selected, setSelected] = useState<MapElement | null>(null)

  // Alla creazione assegniamo automaticamente la zona piu' vicina al punto
  // toccato (§18, §22): resta comunque modificabile a mano nella scheda.
  function nearestZoneId(x: number, y: number): string | null {
    if (zones.length === 0) return null
    let best = zones[0]
    let bestDist = Infinity
    for (const zone of zones) {
      const d = Math.hypot(zone.center_x - x, zone.center_y - y)
      if (d < bestDist) {
        bestDist = d
        best = zone
      }
    }
    return best.id
  }

  function handleMapPointerUp(e: ReactPointerEvent<SVGSVGElement>) {
    handlePointerUp(e)
    if (!placing) return
    const { x, y } = clientToNormalized(e.clientX, e.clientY)
    const typeDef = getTypeDef(placing.category, placing.type)
    createElement({
      category: placing.category,
      type: placing.type,
      name: typeDef?.label ?? placing.type,
      notes: null,
      x,
      y,
      zone_id: nearestZoneId(x, y),
      quantity: null,
    })
    setPlacing(null)
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-white px-4 py-2">
        <div>
          <Link to="/" className="block text-xs text-gray-400 hover:underline">
            ← Dashboard
          </Link>
          <h1 className="text-sm font-semibold">{editionLabel}</h1>
        </div>

        <div className="flex flex-1 items-center gap-2 sm:max-w-xs">
          <SearchBar query={filters.query} onChange={filters.setQuery} />
        </div>

        <div className="flex items-center gap-2">
          <SaveStatusBadge status={saveStatus} />
          <button
            onClick={() => setShowFilters(true)}
            className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium hover:bg-gray-50 sm:hidden"
          >
            Filtri
          </button>
          {/* Preset di vista (§9, §51): spostano la vista, non filtrano il contenuto */}
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={resetView}
              className="whitespace-nowrap rounded-full border border-gray-300 px-3 py-1 text-xs font-medium hover:bg-gray-50"
            >
              Tutta la festa
            </button>
            {zones.map((zone) => (
              <button
                key={zone.id}
                onClick={() => goToZone(zone)}
                className="whitespace-nowrap rounded-full border border-gray-300 px-3 py-1 text-xs font-medium hover:bg-gray-50"
              >
                {zone.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        {/* Sidebar filtri: sempre visibile da tablet in su (§32); su mobile
            e' un pannello a comparsa (§33), aperto dal pulsante "Filtri". */}
        <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-3 sm:block">
          <FilterPanel zones={zones} filters={filters} />
        </aside>

        <div
          className="relative flex-1 touch-none overflow-hidden bg-gray-100"
          style={{
            touchAction: 'none',
            overscrollBehavior: 'contain',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          <svg
            ref={svgRef}
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
            className={`h-full w-full select-none ${placing ? 'cursor-crosshair' : ''}`}
            style={{
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handleMapPointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
          >
            {/* Livello 0: base cartografica fissa (§7, §39) */}
            <g dangerouslySetInnerHTML={{ __html: innerMarkup }} />

            {/* Livelli 3-6: allestimento / elettrico / audio / luci, filtrati
                per categoria/zona/ricerca (§21-24, §39) */}
            {filters.filteredElements.map((el) => (
              <ElementMarker
                key={el.id}
                element={el}
                mapWidth={width}
                mapHeight={height}
                radius={markerRadius}
                clientToNormalized={clientToNormalized}
                onOpen={setSelected}
                onMoved={(id, x, y) => updateElement(id, { x, y })}
              />
            ))}
          </svg>

          <div className="absolute bottom-4 right-4 flex flex-col overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
            <button
              onClick={zoomIn}
              aria-label="Zoom avanti"
              className="px-3 py-2 text-lg leading-none hover:bg-gray-50"
            >
              +
            </button>
            <div className="border-t border-gray-200" />
            <button
              onClick={zoomOut}
              aria-label="Zoom indietro"
              className="px-3 py-2 text-lg leading-none hover:bg-gray-50"
            >
              –
            </button>
          </div>

          {/* Pulsante "+ Aggiungi", sempre raggiungibile col pollice su mobile (§33) */}
          {!placing && (
            <button
              onClick={() => setShowPicker(true)}
              className="absolute bottom-4 left-4 rounded-full bg-slate-800 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-slate-900"
            >
              + Aggiungi
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-30 flex items-end bg-black/30 sm:hidden" onClick={() => setShowFilters(false)}>
          <div
            className="max-h-[80vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <FilterPanel zones={zones} filters={filters} onClose={() => setShowFilters(false)} />
          </div>
        </div>
      )}

      {(showPicker || placing) && (
        <AddElementSheet
          placing={placing}
          onPick={(p) => {
            setPlacing(p)
            setShowPicker(false)
          }}
          onCancel={() => setShowPicker(false)}
          onCancelPlacing={() => setPlacing(null)}
        />
      )}

      {selected && (
        <ElementDetailsPanel
          element={elements.find((e) => e.id === selected.id) ?? selected}
          zones={zones}
          onClose={() => setSelected(null)}
          onSave={(id, patch) => updateElement(id, patch)}
          onDelete={(id) => {
            deleteElement(id)
            setSelected(null)
          }}
          onDuplicate={(id) => {
            duplicateElement(id)
            setSelected(null)
          }}
        />
      )}
    </div>
  )
}
