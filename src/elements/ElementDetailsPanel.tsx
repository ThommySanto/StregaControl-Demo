import { useState } from 'react'
import type { MapElement, Zone } from '@/types'
import { getCategoryDef, getTypeDef } from './catalog'

interface ElementDetailsPanelProps {
  element: MapElement
  zones: Zone[]
  onClose: () => void
  onSave: (
    id: string,
    patch: { name: string; notes: string | null; quantity: number | null; zone_id: string | null },
  ) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
}

export function ElementDetailsPanel({
  element,
  zones,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
}: ElementDetailsPanelProps) {
  const categoryDef = getCategoryDef(element.category)
  const typeDef = getTypeDef(element.category, element.type)

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(element.name)
  const [notes, setNotes] = useState(element.notes ?? '')
  const [quantity, setQuantity] = useState(element.quantity != null ? String(element.quantity) : '')
  const [zoneId, setZoneId] = useState<string | null>(element.zone_id)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  function handleSave() {
    onSave(element.id, {
      name: name.trim() || (typeDef?.label ?? categoryDef.label),
      notes: notes.trim() || null,
      quantity: typeDef?.hasQuantity && quantity.trim() ? Number(quantity) : null,
      zone_id: zoneId,
    })
    setEditing(false)
  }

  const zoneName = zones.find((z) => z.id === element.zone_id)?.name ?? '—'

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 rounded-t-2xl border-t border-gray-200 bg-white p-4 shadow-xl sm:inset-x-auto sm:bottom-4 sm:left-4 sm:w-80 sm:rounded-2xl sm:border">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{typeDef?.icon ?? categoryDef.icon}</span>
          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1 text-sm font-medium"
              placeholder="Nome"
            />
          ) : (
            <h2 className="text-sm font-semibold">{element.name}</h2>
          )}
        </div>
        <button onClick={onClose} aria-label="Chiudi" className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      <dl className="mt-3 space-y-1 text-xs text-gray-500">
        <div>
          <dt className="inline font-medium text-gray-600">Categoria: </dt>
          <dd className="inline">{categoryDef.label}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-gray-600">Tipo: </dt>
          <dd className="inline">{typeDef?.label ?? element.type}</dd>
        </div>
      </dl>

      <div className="mt-3">
        <label className="text-xs font-medium text-gray-600">Zona</label>
        {editing ? (
          <select
            value={zoneId ?? ''}
            onChange={(e) => setZoneId(e.target.value || null)}
            className="mt-1 block w-full rounded border border-gray-300 px-2 py-1 text-sm"
          >
            <option value="">Nessuna</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm">{zoneName}</p>
        )}
      </div>

      {typeDef?.hasQuantity && (
        <div className="mt-3">
          <label className="text-xs font-medium text-gray-600">Quantità</label>
          {editing ? (
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 block w-24 rounded border border-gray-300 px-2 py-1 text-sm"
            />
          ) : (
            <p className="text-sm">{element.quantity ?? '—'}</p>
          )}
        </div>
      )}

      <div className="mt-3">
        <label className="text-xs font-medium text-gray-600">Note</label>
        {editing ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded border border-gray-300 px-2 py-1 text-sm"
            placeholder="Note opzionali"
          />
        ) : (
          <p className="text-sm text-gray-700">{element.notes || '—'}</p>
        )}
      </div>

      {confirmingDelete ? (
        <div className="mt-4 rounded-lg bg-red-50 p-2.5">
          <p className="text-xs text-red-700">Eliminare definitivamente questo elemento?</p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => onDelete(element.id)}
              className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
            >
              Elimina
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
            >
              Annulla
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-900"
              >
                Salva
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
              >
                Annulla
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
              >
                Modifica
              </button>
              <button
                onClick={() => onDuplicate(element.id)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
              >
                Duplica
              </button>
              <button
                onClick={() => setConfirmingDelete(true)}
                className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Elimina
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
