import { useState } from 'react'
import type { Category } from '@/types'
import { CATEGORY_DEFS, getCategoryDef } from './catalog'

export interface PendingPlacement {
  category: Category
  type: string
}

interface AddElementSheetProps {
  onPick: (placement: PendingPlacement) => void
  onCancel: () => void
  placing: PendingPlacement | null
  onCancelPlacing: () => void
}

// Pannello "+ Aggiungi elemento" (§17). Su schermi stretti si comporta
// come una bottom sheet (§33); su desktop e' un pannello laterale.
export function AddElementSheet({ onPick, onCancel, placing, onCancelPlacing }: AddElementSheetProps) {
  const [category, setCategory] = useState<Category | null>(null)

  if (placing) {
    const def = getCategoryDef(placing.category)
    const type = def.types.find((t) => t.value === placing.type)
    return (
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white px-4 py-3 shadow-lg sm:inset-x-auto sm:bottom-4 sm:left-4 sm:max-w-xs sm:rounded-xl sm:border">
        <p className="text-sm font-medium">
          {type?.icon} {type?.label} — tocca un punto sulla mappa per posizionarlo
        </p>
        <button
          onClick={onCancelPlacing}
          className="mt-2 text-xs font-medium text-gray-500 underline"
        >
          Annulla
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/30 sm:items-center">
      <div className="max-h-[80vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:max-w-sm sm:rounded-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            {category ? 'Scegli il tipo' : 'Aggiungi elemento'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600" aria-label="Chiudi">
            ✕
          </button>
        </div>

        {!category && (
          <div className="grid grid-cols-2 gap-2">
            {CATEGORY_DEFS.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 px-3 py-4 hover:bg-gray-50"
              >
                <span className="text-2xl">{c.icon}</span>
                <span className="text-sm font-medium">{c.label}</span>
              </button>
            ))}
          </div>
        )}

        {category && (
          <div>
            <button
              onClick={() => setCategory(null)}
              className="mb-3 text-xs font-medium text-gray-500 underline"
            >
              ← Cambia categoria
            </button>
            <div className="flex flex-col gap-1.5">
              {getCategoryDef(category).types.map((t) => (
                <button
                  key={t.value}
                  onClick={() => onPick({ category, type: t.value })}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5 text-left hover:bg-gray-50"
                >
                  <span className="text-xl">{t.icon}</span>
                  <span className="text-sm font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
