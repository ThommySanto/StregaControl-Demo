import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listRows } from '@/db/localDb'
import type { Edition } from '@/types'
import { useElements } from '@/elements/useElements'
import { CATEGORY_DEFS } from '@/elements/catalog'

// Dashboard post-login (§48): edizione attiva, contatori per categoria
// (§23) aggiornati automaticamente perche' derivano dallo stesso stato
// caricato da useElements, e accesso rapido alla mappa.
export default function DashboardPage() {
  const [edition, setEdition] = useState<Edition | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    listRows<Edition>('editions').then((editions) => {
        if (cancelled) return
        const latest = [...editions].sort((a, b) => b.year - a.year)[0]
        setEdition(latest ?? null)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const { elements } = useElements(edition?.id ?? null)

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Notte delle Streghe</h1>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-gray-400">Caricamento…</p>
      ) : edition ? (
        <>
          <p className="mt-1 text-sm text-gray-500">
            Edizione attiva: <span className="font-medium text-gray-700">{edition.name} {edition.year}</span>
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CATEGORY_DEFS.map((c) => (
              <div key={c.value} className="rounded-lg border border-gray-200 px-3 py-2.5 text-center">
                <div className="text-lg">{c.icon}</div>
                <div className="text-lg font-semibold">
                  {elements.filter((el) => el.category === c.value).length}
                </div>
                <div className="text-xs text-gray-500">{c.label}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm text-red-600">
          Nessuna edizione trovata. Esegui il seed di esempio o crea un'edizione.
        </p>
      )}

      <Link
        to="/mappa"
        className="mt-6 inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
      >
        Apri mappa
      </Link>
    </div>
  )
}
