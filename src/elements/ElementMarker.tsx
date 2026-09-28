import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { MapElement } from '@/types'
import { getCategoryDef } from './catalog'
import { TypeIcon } from './icons'

interface ElementMarkerProps {
  element: MapElement
  mapWidth: number
  mapHeight: number
  radius: number // raggio in unita' mappa, gia' calcolato in base allo zoom corrente
  clientToNormalized: (clientX: number, clientY: number) => { x: number; y: number }
  onOpen: (element: MapElement) => void
  onMoved: (id: string, x: number, y: number) => void
}

const DRAG_THRESHOLD_PX = 6

export function ElementMarker({
  element,
  mapWidth,
  mapHeight,
  radius,
  clientToNormalized,
  onOpen,
  onMoved,
}: ElementMarkerProps) {
  const categoryDef = getCategoryDef(element.category)

  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)
  const dragging = useRef(false)
  const startClient = useRef({ x: 0, y: 0 })
  const moved = useRef(false)

  const pos = dragPos ?? { x: element.x, y: element.y }

  function handlePointerDown(e: ReactPointerEvent<SVGGElement>) {
    e.stopPropagation() // non far partire il pan della mappa sottostante
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragging.current = true
    moved.current = false
    startClient.current = { x: e.clientX, y: e.clientY }
  }

  function handlePointerMove(e: ReactPointerEvent<SVGGElement>) {
    e.preventDefault()
    if (!dragging.current) return
    e.stopPropagation()
    const dx = e.clientX - startClient.current.x
    const dy = e.clientY - startClient.current.y
    if (!moved.current && Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
      moved.current = true
    }
    if (moved.current) {
      setDragPos(clientToNormalized(e.clientX, e.clientY))
    }
  }

  function handlePointerUp(e: ReactPointerEvent<SVGGElement>) {
    e.preventDefault()
    e.stopPropagation()
    dragging.current = false
    if (moved.current) {
      const final = clientToNormalized(e.clientX, e.clientY)
      setDragPos(null)
      onMoved(element.id, final.x, final.y)
    } else {
      onOpen(element)
    }
  }

  return (
    <g
      transform={`translate(${pos.x * mapWidth}, ${pos.y * mapHeight})`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'none' }}
    >
      <circle r={radius} fill={categoryDef.dot} />
      <TypeIcon type={element.type} category={element.category} size={radius * 1.8} color="white" />
    </g>
  )
}
