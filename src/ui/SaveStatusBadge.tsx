import type { SaveStatus } from '@/elements/useElements'

export function SaveStatusBadge({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null

  const config = {
    saving: { text: 'Salvataggio…', cls: 'bg-gray-100 text-gray-600' },
    saved: { text: 'Salvato ✓', cls: 'bg-emerald-50 text-emerald-700' },
    error: { text: '⚠ Impossibile salvare — controlla la connessione', cls: 'bg-red-50 text-red-700' },
  }[status]

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${config.cls}`}>{config.text}</span>
  )
}
