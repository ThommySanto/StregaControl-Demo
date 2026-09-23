import { useMemo, useState } from 'react'
import type { Category, MapElement, Zone } from '@/types'
import { CATEGORY_DEFS, getTypeDef } from '@/elements/catalog'

const ALL_CATEGORIES: Category[] = CATEGORY_DEFS.map((c) => c.value)

// "Tutte le zone" e' rappresentato da null nello stato, cosi' come
// zone_id === null per un elemento senza zona assegnata (§22).
export function useFilters(elements: MapElement[], zones: Zone[]) {
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(new Set(ALL_CATEGORIES))
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  function toggleCategory(category: Category) {
    setActiveCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  function showOnlyCategory(category: Category) {
    // Scorciatoia usata dai contatori (§23): clic su un contatore
    // isola quella sola categoria invece di limitarsi ad attivarla.
    setActiveCategories(new Set([category]))
  }

  function resetCategories() {
    setActiveCategories(new Set(ALL_CATEGORIES))
  }

  const zoneNameById = useMemo(() => {
    const map = new Map<string, string>()
    zones.forEach((z) => map.set(z.id, z.name))
    return map
  }, [zones])

  const normalizedQuery = query.trim().toLowerCase()

  const filteredElements = useMemo(() => {
    return elements.filter((el) => {
      if (!activeCategories.has(el.category)) return false
      if (activeZoneId && el.zone_id !== activeZoneId) return false
      if (normalizedQuery) {
        const typeLabel = getTypeDef(el.category, el.type)?.label ?? el.type
        const zoneName = el.zone_id ? zoneNameById.get(el.zone_id) ?? '' : ''
        const haystack = `${el.name} ${typeLabel} ${zoneName}`.toLowerCase()
        if (!haystack.includes(normalizedQuery)) return false
      }
      return true
    })
  }, [elements, activeCategories, activeZoneId, normalizedQuery, zoneNameById])

  // Contatori per categoria (§23): calcolati su tutti gli elementi che
  // rispettano zona e ricerca, ma non il filtro di categoria stesso —
  // cosi' i numeri restano stabili mentre l'utente accende/spegne categorie.
  const countsByCategory = useMemo(() => {
    const counts = new Map<Category, number>(ALL_CATEGORIES.map((c) => [c, 0]))
    elements.forEach((el) => {
      if (activeZoneId && el.zone_id !== activeZoneId) return
      if (normalizedQuery) {
        const typeLabel = getTypeDef(el.category, el.type)?.label ?? el.type
        const zoneName = el.zone_id ? zoneNameById.get(el.zone_id) ?? '' : ''
        const haystack = `${el.name} ${typeLabel} ${zoneName}`.toLowerCase()
        if (!haystack.includes(normalizedQuery)) return
      }
      counts.set(el.category, (counts.get(el.category) ?? 0) + 1)
    })
    return counts
  }, [elements, activeZoneId, normalizedQuery, zoneNameById])

  return {
    activeCategories,
    toggleCategory,
    showOnlyCategory,
    resetCategories,
    activeZoneId,
    setActiveZoneId,
    query,
    setQuery,
    filteredElements,
    countsByCategory,
  }
}

export type UseFiltersResult = ReturnType<typeof useFilters>
