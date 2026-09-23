import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

// Avvolge le rotte pubbliche (login): se l'utente ha gia' una sessione
// valida, lo reindirizza subito alla dashboard invece di lasciarlo
// bloccato sul form — questo e' il pezzo che mancava perche' il login
// "non renderizzasse correttamente" dopo credenziali corrette.
export default function GuestRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        Caricamento…
      </div>
    )
  }

  if (session) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
