import { useCallback, useRef, useState } from 'react'
import type { PointerEvent, WheelEvent } from 'react'
import type { Zone } from '@/types'

export interface ViewBox {
  x: number
  y: number
  w: number
  h: number
}

// La "vista generale" (mappa intera) e' lo zoom minimo consentito;
// MAX_SCALE limita quanto ci si puo' avvicinare, cosi' l'utente non
// si perde in uno zoom infinito su un dettaglio (§10).
const MIN_SCALE = 1
const MAX_SCALE = 12
const WHEEL_ZOOM_FACTOR = 1.15
const BUTTON_ZOOM_FACTOR = 1.4

interface Point {
  x: number
  y: number
}

interface GestureState {
  mode: 'pan' | 'pinch' | null
  startView: ViewBox
  startClient: Point
  startDist?: number
  startMid?: Point
}

// Gestisce pan/zoom di una mappa SVG manipolando direttamente il suo
// viewBox — nessuna libreria esterna. Supporta trascinamento (mouse o
// un dito), rotella del mouse, e pinch-to-zoom a due dita (§10).
export function useMapViewport(mapWidth: number, mapHeight: number) {
  const aspect = mapHeight / mapWidth
  const fullView: ViewBox = { x: 0, y: 0, w: mapWidth, h: mapHeight }

  const [viewBox, setViewBoxState] = useState<ViewBox>(fullView)
  const viewBoxRef = useRef<ViewBox>(fullView)
  const pendingViewBox = useRef<ViewBox | null>(null)
  const renderFrame = useRef<number | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const pointers = useRef<Map<number, Point>>(new Map())
  const gesture = useRef<GestureState>({
    mode: null,
    startView: fullView,
    startClient: { x: 0, y: 0 },
  })

  const setViewBox = useCallback(
    (vb: ViewBox) => {
      const clamped = clampViewBox(vb, mapWidth, mapHeight, aspect)
      viewBoxRef.current = clamped
      pendingViewBox.current = clamped

      if (renderFrame.current === null) {
        renderFrame.current = requestAnimationFrame(() => {
          renderFrame.current = null
          if (pendingViewBox.current) {
            setViewBoxState(pendingViewBox.current)
          }
        })
      }
    },
    [mapWidth, mapHeight, aspect],
  )

  const clientToSvg = useCallback((clientX: number, clientY: number, vb: ViewBox): Point => {
    const svg = svgRef.current
    if (!svg) return { x: vb.x, y: vb.y }
    const rect = getRenderedMapRect(svg, vb)
    return {
      x: vb.x + ((clientX - rect.left) / rect.width) * vb.w,
      y: vb.y + ((clientY - rect.top) / rect.height) * vb.h,
    }
  }, [])

  // Zooma mantenendo fermo il punto della mappa sotto (clientX, clientY) —
  // cosi' lo zoom con rotella/pulsanti "punta" dove serve invece di
  // spostare la vista in modo spiazzante.
  const zoomAtPoint = useCallback(
    (clientX: number, clientY: number, factor: number) => {
      const vb = viewBoxRef.current
      const point = clientToSvg(clientX, clientY, vb)
      const newW = vb.w / factor
      const newH = newW * aspect
      const fracX = (point.x - vb.x) / vb.w
      const fracY = (point.y - vb.y) / vb.h
      setViewBox({
        x: point.x - fracX * newW,
        y: point.y - fracY * newH,
        w: newW,
        h: newH,
      })
    },
    [aspect, clientToSvg, setViewBox],
  )

  const zoomFromCenter = useCallback(
    (factor: number) => {
      const svg = svgRef.current
      const rect = svg?.getBoundingClientRect()
      const cx = rect ? rect.left + rect.width / 2 : 0
      const cy = rect ? rect.top + rect.height / 2 : 0
      zoomAtPoint(cx, cy, factor)
    },
    [zoomAtPoint],
  )

  const zoomIn = useCallback(() => zoomFromCenter(BUTTON_ZOOM_FACTOR), [zoomFromCenter])
  const zoomOut = useCallback(() => zoomFromCenter(1 / BUTTON_ZOOM_FACTOR), [zoomFromCenter])

  const resetView = useCallback(() => setViewBox(fullView), [setViewBox, fullView])

  // Preset di navigazione per zona (§9, §51): non cambia il contenuto
  // della mappa, sposta solo la vista sulla zona con lo zoom previsto.
  const goToZone = useCallback(
    (zone: Zone) => {
      const w = mapWidth / zone.zoom_level
      const h = w * aspect
      setViewBox({
        x: zone.center_x * mapWidth - w / 2,
        y: zone.center_y * mapHeight - h / 2,
        w,
        h,
      })
    },
    [mapWidth, mapHeight, aspect, setViewBox],
  )

  const handleWheel = useCallback(
    (e: WheelEvent<SVGSVGElement>) => {
      e.preventDefault()
      const factor = e.deltaY < 0 ? WHEEL_ZOOM_FACTOR : 1 / WHEEL_ZOOM_FACTOR
      zoomAtPoint(e.clientX, e.clientY, factor)
    },
    [zoomAtPoint],
  )

  const handlePointerDown = useCallback((e: PointerEvent<SVGSVGElement>) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointers.current.size === 1) {
      gesture.current = {
        mode: 'pan',
        startView: viewBoxRef.current,
        startClient: { x: e.clientX, y: e.clientY },
      }
    } else if (pointers.current.size === 2) {
      const pts = Array.from(pointers.current.values())
      gesture.current = {
        mode: 'pinch',
        startView: viewBoxRef.current,
        startClient: midpoint(pts[0], pts[1]),
        startDist: distance(pts[0], pts[1]),
        startMid: midpoint(pts[0], pts[1]),
      }
    }
  }, [])

  const handlePointerMove = useCallback(
    (e: PointerEvent<SVGSVGElement>) => {
      e.preventDefault()
      if (!pointers.current.has(e.pointerId)) return
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

      const svg = svgRef.current
      if (!svg) return
      const g = gesture.current
      const rect = getRenderedMapRect(svg, g.startView)

      if (g.mode === 'pan' && pointers.current.size === 1) {
        const dxSvg = ((e.clientX - g.startClient.x) / rect.width) * g.startView.w
        const dySvg = ((e.clientY - g.startClient.y) / rect.height) * g.startView.h
        setViewBox({ ...g.startView, x: g.startView.x - dxSvg, y: g.startView.y - dySvg })
      } else if (g.mode === 'pinch' && pointers.current.size === 2 && g.startDist && g.startMid) {
        const pts = Array.from(pointers.current.values())
        const dist = distance(pts[0], pts[1])
        const mid = midpoint(pts[0], pts[1])
        const factor = dist / g.startDist

        const newW = g.startView.w / factor
        const newH = newW * aspect

        const fracX = (g.startMid.x - rect.left) / rect.width
        const fracY = (g.startMid.y - rect.top) / rect.height
        const anchor = {
          x: g.startView.x + fracX * g.startView.w,
          y: g.startView.y + fracY * g.startView.h,
        }
        const midDxSvg = ((mid.x - g.startMid.x) / rect.width) * g.startView.w
        const midDySvg = ((mid.y - g.startMid.y) / rect.height) * g.startView.h

        setViewBox({
          x: anchor.x - fracX * newW - midDxSvg,
          y: anchor.y - fracY * newH - midDySvg,
          w: newW,
          h: newH,
        })
      }
    },
    [aspect, setViewBox],
  )

  const handlePointerUp = useCallback((e: PointerEvent<SVGSVGElement>) => {
    e.preventDefault()
    pointers.current.delete(e.pointerId)
    if (pointers.current.size === 1) {
      const [[, point]] = Array.from(pointers.current.entries())
      gesture.current = {
        mode: 'pan',
        startView: viewBoxRef.current,
        startClient: point,
      }
    } else if (pointers.current.size === 0) {
      gesture.current.mode = null
    }
  }, [])

  // Converte coordinate schermo (clientX/Y) in coordinate normalizzate
  // 0..1 della mappa (§36): usato per posizionare un nuovo elemento dove
  // l'utente clicca/tocca, indipendentemente da zoom e pan correnti.
  const clientToNormalized = useCallback(
    (clientX: number, clientY: number): Point => {
      const point = clientToSvg(clientX, clientY, viewBoxRef.current)
      return {
        x: Math.min(1, Math.max(0, point.x / mapWidth)),
        y: Math.min(1, Math.max(0, point.y / mapHeight)),
      }
    },
    [clientToSvg, mapWidth, mapHeight],
  )

  return {
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
  }
}

function clampViewBox(vb: ViewBox, mapWidth: number, mapHeight: number, aspect: number): ViewBox {
  const minW = mapWidth / MAX_SCALE
  const maxW = mapWidth / MIN_SCALE
  const w = Math.min(maxW, Math.max(minW, vb.w))
  const h = w * aspect
  const maxX = Math.max(0, mapWidth - w)
  const maxY = Math.max(0, mapHeight - h)
  return {
    x: Math.min(maxX, Math.max(0, vb.x)),
    y: Math.min(maxY, Math.max(0, vb.y)),
    w,
    h,
  }
}

function getRenderedMapRect(svg: SVGSVGElement, viewBox: ViewBox): DOMRect {
  const bounds = svg.getBoundingClientRect()
  const viewBoxRatio = viewBox.w / viewBox.h
  const boundsRatio = bounds.width / bounds.height

  if (boundsRatio > viewBoxRatio) {
    const width = bounds.height * viewBoxRatio
    return new DOMRect(bounds.left + (bounds.width - width) / 2, bounds.top, width, bounds.height)
  }

  const height = bounds.width / viewBoxRatio
  return new DOMRect(bounds.left, bounds.top + (bounds.height - height) / 2, bounds.width, height)
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}
