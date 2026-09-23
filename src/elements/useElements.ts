import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/db/supabaseClient'
import type { Category, MapElement } from '@/types'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface NewElementInput {
  category: Category
  type: string
  name: string
  notes: string | null
  x: number
  y: number
  zone_id: string | null
  quantity: number | null
}

// Gestisce gli elementi (allestimento/elettrico/audio/luci) di un'edizione:
// caricamento, creazione, modifica (inclusi spostamenti), eliminazione,
// duplicazione (§46). Aggiorna subito lo stato locale ("ottimistico") cosi'
// la mappa resta fluida (§52), e mostra sempre un indicatore di salvataggio
// comprensibile invece di fallire in silenzio (§34, §44).
export type UseElementsResult = ReturnType<typeof useElements>

export function useElements(editionId: string | null) {
  const [elements, setElements] = useState<MapElement[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flashSaved = useCallback(() => {
    setSaveStatus('saved')
    if (savedTimer.current) clearTimeout(savedTimer.current)
    savedTimer.current = setTimeout(() => setSaveStatus('idle'), 1800)
  }, [])

  useEffect(() => {
    if (!editionId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setLoadError(null)
      const { data, error } = await supabase
        .from('elements')
        .select('*')
        .eq('edition_id', editionId)
        .order('created_at')

      if (cancelled) return
      if (error) {
        setLoadError('Impossibile caricare gli elementi. Controlla la connessione e riprova.')
        setLoading(false)
        return
      }
      setElements((data as MapElement[]) ?? [])
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [editionId])

  const createElement = useCallback(
    async (input: NewElementInput): Promise<MapElement | null> => {
      if (!editionId) return null
      setSaveStatus('saving')
      const { data, error } = await supabase
        .from('elements')
        .insert({ edition_id: editionId, ...input })
        .select()
        .single()

      if (error || !data) {
        setSaveStatus('error')
        return null
      }
      setElements((prev) => [...prev, data as MapElement])
      flashSaved()
      return data as MapElement
    },
    [editionId, flashSaved],
  )

  // Aggiornamento ottimistico: la UI riflette subito il cambiamento (utile
  // per il trascinamento fluido, §18), e viene corretto se il salvataggio
  // sul database fallisce.
  const updateElement = useCallback(
    async (id: string, patch: Partial<NewElementInput>) => {
      const previous = elements
      setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...patch } : el)))
      setSaveStatus('saving')

      const { error } = await supabase.from('elements').update(patch).eq('id', id)

      if (error) {
        setElements(previous)
        setSaveStatus('error')
        return false
      }
      flashSaved()
      return true
    },
    [elements, flashSaved],
  )

  const deleteElement = useCallback(
    async (id: string) => {
      const previous = elements
      setElements((prev) => prev.filter((el) => el.id !== id))
      setSaveStatus('saving')

      const { error } = await supabase.from('elements').delete().eq('id', id)

      if (error) {
        setElements(previous)
        setSaveStatus('error')
        return false
      }
      flashSaved()
      return true
    },
    [elements, flashSaved],
  )

  // Duplica un elemento leggermente spostato, cosi' e' facile aggiungerne
  // molti simili in sequenza (§46).
  const duplicateElement = useCallback(
    async (id: string) => {
      const source = elements.find((el) => el.id === id)
      if (!source || !editionId) return null
      return createElement({
        category: source.category,
        type: source.type,
        name: source.name,
        notes: source.notes,
        zone_id: source.zone_id,
        quantity: source.quantity,
        x: Math.min(0.98, source.x + 0.02),
        y: Math.min(0.98, source.y + 0.02),
      })
    },
    [elements, editionId, createElement],
  )

  return {
    elements,
    loading,
    loadError,
    saveStatus,
    createElement,
    updateElement,
    deleteElement,
    duplicateElement,
  }
}
