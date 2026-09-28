import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

// Avvolge le rotte riservate: se la sessione non e' ancora nota,
// mostra un semplice stato di caricamento invece di far "lampeggiare"
// la pagina di login; se non c'e' sessione, reindirizza al login.
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        Caricamento…
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
