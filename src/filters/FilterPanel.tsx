import type { Zone } from '@/types'
import { CATEGORY_DEFS } from '@/elements/catalog'
import type { UseFiltersResult } from './useFilters'

interface FilterPanelProps {
  zones: Zone[]
  filters: UseFiltersResult
  onClose?: () => void // presente solo nella variante mobile (bottom sheet)
}

export function FilterPanel({ zones, filters, onClose }: FilterPanelProps) {
  const {
    activeCategories,
    toggleCategory,
    showOnlyCategory,
    resetCategories,
    activeZoneId,
    setActiveZoneId,
    countsByCategory,
  } = filters

  const allCategoriesActive = activeCategories.size === CATEGORY_DEFS.length

  return (
    <div className="flex flex-col gap-5">
      {onClose && (
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Filtri</h2>
          <button onClick={onClose} aria-label="Chiudi filtri" className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Mostra</h3>
          {!allCategoriesActive && (
            <button onClick={resetCategories} className="text-xs font-medium text-gray-500 underline">
              Mostra tutto
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {CATEGORY_DEFS.map((c) => {
            const checked = activeCategories.has(c.value)
            const count = countsByCategory.get(c.value) ?? 0
            return (
              <div
                key={c.value}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50"
              >
                <label className="flex flex-1 cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(c.value)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </label>
                {/* Contatore cliccabile: isola la categoria (§23) */}
                <button
                  onClick={() => showOnlyCategory(c.value)}
                  className="min-w-[1.75rem] rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 hover:bg-gray-200"
                  title={`Mostra solo ${c.label}`}
                >
                  {count}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Zona</h3>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setActiveZoneId(null)}
            className={`rounded-lg px-2 py-1.5 text-left text-sm ${
              activeZoneId === null ? 'bg-slate-800 text-white' : 'hover:bg-gray-50'
            }`}
          >
            Tutte
          </button>
          {zones.map((zone) => (
            <button
              key={zone.id}
              onClick={() => setActiveZoneId(zone.id)}
              className={`rounded-lg px-2 py-1.5 text-left text-sm ${
                activeZoneId === zone.id ? 'bg-slate-800 text-white' : 'hover:bg-gray-50'
              }`}
            >
              {zone.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
